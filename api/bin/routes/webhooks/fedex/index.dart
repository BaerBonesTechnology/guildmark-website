/// POST /webhooks/fedex
///
/// Receives FedEx Track Event Notifications.
///
/// When a "DL" (Delivered) event arrives for a known tracking number:
///   1. Look up the order.
///   2. Call escrow.markReceived() → starts the inspection period on Escrow.com.
///   3. Mark the order as delivered + set inspection_ends_at.
///   4. Notify the buyer by email.
///
/// HMAC-SHA256 signature verification is performed when FEDEX_WEBHOOK_SECRET
/// is set. Requests with an invalid signature are rejected with 401.
///
/// FedEx sends events as JSON POST with header:
///   x-fedex-signature: <hmac-sha256-hex>

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';

import '../../../lib/config.dart';
import '../../../lib/crypto_utils.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/order_repo.dart';
import '../../../lib/services/email_service.dart';
import '../../../lib/services/escrow_service.dart';

/// Inspection window after delivery before funds auto-release (48 hours).
const _inspectionDuration = Duration(hours: 48);

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final rawBody = await context.request.body();
  final cfg     = context.read<AppConfig>();

  // ── Signature verification ──────────────────────────────────────────────
  if (cfg.fedexWebhookSecret != null) {
    final sig = context.request.headers['x-fedex-signature'] ?? '';
    if (!_verifySignature(rawBody, sig, cfg.fedexWebhookSecret!)) {
      stderr.writeln('[webhook/fedex] invalid signature');
      return Response(statusCode: 401, body: 'Unauthorized');
    }
  }

  // ── Parse payload ────────────────────────────────────────────────────────
  Map<String, dynamic> payload;
  try {
    payload = jsonDecode(rawBody) as Map<String, dynamic>;
  } catch (_) {
    return badRequest('Invalid JSON');
  }

  final trackingNumber = _extractTrackingNumber(payload);
  if (trackingNumber == null) {
    // Not an error — FedEx sends various event types; just acknowledge.
    return Response(statusCode: 200);
  }

  final isDelivered = _isDeliveredEvent(payload);
  if (!isDelivered) {
    stdout.writeln('[webhook/fedex] non-delivery event for $trackingNumber — ignored');
    return Response(statusCode: 200);
  }

  stdout.writeln('[webhook/fedex] delivery confirmed for $trackingNumber');

  final repo   = OrderRepo(context.read<Db>());
  final escrow = context.read<EscrowService>();
  final email  = context.read<EmailService>();

  final order = await repo.findByTrackingNumber(trackingNumber);
  if (order == null) {
    // May be a shipment not managed by GuildMark — not an error.
    stdout.writeln('[webhook/fedex] no order found for $trackingNumber');
    return Response(statusCode: 200);
  }

  if (order.status != 'shipped') {
    stdout.writeln(
      '[webhook/fedex] order ${order.id} already in ${order.status} — skipping',
    );
    return Response(statusCode: 200);
  }

  final now = DateTime.now().toUtc();
  final inspectionEndsAt = now.add(_inspectionDuration);

  // 1 — Mark received in escrow (starts inspection clock on Escrow.com).
  if (order.escrowTransactionId != null) {
    unawaited(escrow.markReceived(order.escrowTransactionId!));
  }

  // 2 — Update order in DB.
  await repo.markDelivered(
    id:               order.id,
    deliveredAt:      now,
    inspectionEndsAt: inspectionEndsAt,
  );

  // 3 — Notify buyer.
  if (order.buyerEmail != null) {
    unawaited(
      email.sendDeliveryConfirmation(
        toEmail:          order.buyerEmail!,
        productName:      order.productName ?? 'IT Asset',
        trackingNumber:   trackingNumber,
        inspectionEndsAt: inspectionEndsAt,
        confirmUrl:       '', // populated by email template
      ),
    );
  }

  return Response(statusCode: 200);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Returns true if the payload contains a delivered (DL) event.
bool _isDeliveredEvent(Map<String, dynamic> payload) {
  // FedEx sends individual track events or arrays depending on the version.
  // Check common payload shapes.

  // Shape 1: { trackingInfo: { packageStatusCode: "DL" } }
  final trackingInfo = payload['trackingInfo'] as Map?;
  if (trackingInfo != null) {
    if (trackingInfo['packageStatusCode'] == 'DL') return true;
    if (trackingInfo['derivedStatusCode'] == 'DL') return true;
  }

  // Shape 2: top-level events array
  final events = payload['events'] as List?;
  if (events != null) {
    for (final e in events) {
      if ((e as Map)['eventType'] == 'DL' ||
          (e)['derivedStatusCode'] == 'DL') return true;
    }
  }

  // Shape 3: { trackingNumber, eventType }
  if (payload['eventType'] == 'DL') return true;

  // Shape 4: nested under trackingResults
  final results = payload['trackingResults'] as List?;
  if (results != null) {
    for (final r in results) {
      final rm  = r as Map;
      final scanEvents = rm['scanEvents'] as List?;
      if (scanEvents != null) {
        for (final e in scanEvents) {
          if ((e as Map)['derivedStatusCode'] == 'DL') return true;
        }
      }
      if ((rm['latestStatusDetail'] as Map?)?['code'] == 'DL') return true;
    }
  }

  return false;
}

/// Extracts the tracking number from the payload (handles multiple shapes).
String? _extractTrackingNumber(Map<String, dynamic> payload) {
  // Direct field
  final direct = payload['trackingNumber'] as String?;
  if (direct != null && direct.isNotEmpty) return direct;

  // Nested
  final ti = payload['trackingInfo'] as Map?;
  if (ti != null) {
    final tn = ti['trackingNumber'] as String?;
    if (tn != null && tn.isNotEmpty) return tn;
    final tni = ti['trackingNumberInfo'] as Map?;
    if (tni != null) {
      final tn2 = tni['trackingNumber'] as String?;
      if (tn2 != null && tn2.isNotEmpty) return tn2;
    }
  }

  // In results array
  final results = payload['trackingResults'] as List?;
  if (results != null && results.isNotEmpty) {
    final tni = (results.first as Map)['trackingNumberInfo'] as Map?;
    return tni?['trackingNumber'] as String?;
  }

  return null;
}

/// HMAC-SHA256 webhook signature verification.
/// Uses constant-time comparison to prevent timing-based bypass.
bool _verifySignature(String body, String receivedSig, String secret) {
  if (receivedSig.isEmpty) return false;
  final mac = Hmac(sha256, utf8.encode(secret));
  final digest = mac.convert(utf8.encode(body)).toString();
  return constantTimeEquals(digest, receivedSig);
}
