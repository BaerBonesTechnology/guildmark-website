import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  final cfg = context.read<AppConfig>();

  final token = cfg.ebayVerificationToken;
  final endpoint = cfg.ebayDeletionEndpoint;

  // ── GET — challenge / endpoint verification ───────────────────────────────
  if (context.request.method == HttpMethod.get) {
    final challengeCode = context.request.uri.queryParameters['challenge_code'];

    if (challengeCode == null || challengeCode.isEmpty) {
      return jsonError(
        400,
        'MISSING_CHALLENGE',
        'challenge_code query param required',
      );
    }

    if (token == null || endpoint == null) {
      // Misconfigured — return 500 so eBay knows the endpoint isn't ready.
      return jsonError(
        500,
        'NOT_CONFIGURED',
        'EBAY_VERIFICATION_TOKEN and EBAY_DELETION_ENDPOINT must be set',
      );
    }

    // challengeResponse = lowercase hex SHA-256 of:
    //   challengeCode + verificationToken + endpointUrl   (no separators)
    final input = utf8.encode('$challengeCode$token$endpoint');
    final digest = sha256.convert(input);

    return Response.json(body: {'challengeResponse': digest.toString()});
  }

  // ── POST — account deletion notification ─────────────────────────────────
  if (context.request.method == HttpMethod.post) {
    // Read raw body for logging; eBay does not sign POST bodies in this flow
    // so we rely on the endpoint being secret (HTTPS + non-guessable path).
    final rawBody = await context.request.body();

    Map<String, dynamic> payload;
    try {
      payload = jsonDecode(rawBody) as Map<String, dynamic>;
    } catch (_) {
      return jsonError(400, 'INVALID_JSON', 'Could not parse request body');
    }

    final notification = payload['notification'] as Map<String, dynamic>?;
    final data = notification?['data'] as Map<String, dynamic>?;
    final ebayUserId = data?['userId'] as String?;
    final ebayUsername = data?['username'] as String?;

    // No eBay user identifiers are stored anywhere in the current schema —
    // eBay is used only as an anonymous market-pricing source — so there is
    // nothing to anonymise. (The old Postgres handler updated a
    // listings.ebay_seller_id column that never existed in any migration;
    // that write would have failed at runtime.) Log receipt for audit and
    // acknowledge. If eBay identifiers are ever persisted, wipe them here.
    if (ebayUserId != null || ebayUsername != null) {
      stdout.writeln(
        '[ebay] account-deletion notice received for '
        'userId=${ebayUserId ?? '-'} username=${ebayUsername ?? '-'} — '
        'no eBay identifiers stored; nothing to anonymise.',
      );
    }

    // eBay expects a 200 response — any non-2xx triggers a retry.
    return Response(statusCode: 200);
  }

  return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only');
}
