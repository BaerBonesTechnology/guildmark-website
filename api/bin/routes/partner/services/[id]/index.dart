import 'package:dart_appwrite/dart_appwrite.dart' show AppwriteException;
import 'package:dart_appwrite/models.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

// Valid status transitions: current → allowed next states.
const _transitions = <String, List<String>>{
  'claimed': ['wipe_in_progress'],
  'wipe_in_progress': ['wipe_complete'],
  'wipe_complete': ['awaiting_cert', 'reimage_in_progress'],
  'reimage_in_progress': ['reimage_complete'],
  'reimage_complete': ['awaiting_cert'],
  'awaiting_cert': ['cert_uploaded'],
  'cert_uploaded': ['shipped'],
  'shipped': ['complete'],
};

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.put) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'PUT only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final body = await context.request.json() as Map<String, dynamic>?;
  final newStatus = body?['status'] as String?;
  final wipeMethod = body?['wipe_method'] as String?;
  final reimageOs = body?['reimage_os'] as String?;
  final certUrl = body?['cert_url'] as String?;
  final trackingNumber = body?['tracking_number'] as String?;
  final carrier = body?['carrier'] as String?;

  if (newStatus == null) return badRequest('status is required');

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // Fetch the current assignment — must belong to this partner.
  final Row current;
  try {
    current = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.partnerServiceAssignments,
      rowId: id,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) {
      return jsonError(404, 'NOT_FOUND', 'Assignment not found');
    }
    rethrow;
  }
  if (current.data['partner_id'] != principal.partnerId) {
    return jsonError(404, 'NOT_FOUND', 'Assignment not found');
  }

  final currentStatus = (current.data['status'] as String?) ?? 'available';
  final serviceType = current.data['service_type'].toString();

  // Validate transition.
  final allowed = _transitions[currentStatus] ?? [];
  if (!allowed.contains(newStatus)) {
    return jsonError(
      422,
      'INVALID_TRANSITION',
      'Cannot move from $currentStatus to $newStatus.',
    );
  }

  // For wipe_complete → reimage_in_progress, service must be wipe_and_reimage.
  if (newStatus == 'reimage_in_progress' && serviceType == 'wipe_only') {
    return jsonError(
      422,
      'INVALID_TRANSITION',
      'This assignment is wipe_only and does not require reimaging.',
    );
  }

  // cert_uploaded requires a cert URL.
  if (newStatus == 'cert_uploaded') {
    final resolvedCert = certUrl ?? current.data['cert_url'] as String?;
    if (resolvedCert == null || resolvedCert.isEmpty) {
      return badRequest('cert_url is required to move to cert_uploaded');
    }
  }

  // shipped requires tracking info.
  if (newStatus == 'shipped') {
    final resolvedTracking =
        trackingNumber ?? current.data['tracking_number'] as String?;
    final resolvedCarrier = carrier;
    if (resolvedTracking == null ||
        resolvedTracking.isEmpty ||
        resolvedCarrier == null) {
      return badRequest(
        'tracking_number and carrier are required to move to shipped',
      );
    }
  }

  final isComplete = newStatus == 'complete';

  // Only update provided evidence fields (was a dynamic SET clause).
  // ⚠ Race window: the transition check above and the write below are not
  // atomic (Postgres ran them in one guarded UPDATE); a concurrent update to
  // the same assignment could interleave. Partner-scoped single-actor flow —
  // accepted.
  final data = <String, dynamic>{
    'status': newStatus,
    if (wipeMethod != null) 'wipe_method': wipeMethod,
    if (reimageOs != null) 'reimage_os': reimageOs,
    if (certUrl != null) 'cert_url': certUrl,
    if (trackingNumber != null) 'tracking_number': trackingNumber,
    if (carrier != null) 'carrier': carrier,
    if (isComplete)
      'completed_at': DateTime.now().toUtc().toIso8601String(),
  };

  final Row updated;
  try {
    updated = await db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.partnerServiceAssignments,
      rowId: id,
      data: data,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) {
      return jsonError(404, 'NOT_FOUND', 'Assignment not found');
    }
    rethrow;
  }

  final r = updated.data;
  return Response.json(
    body: {
      'assignment': {
        'id': updated.$id,
        'order_ref': r['order_ref'].toString(),
        'buyer_name': (r['buyer_name'] as String?) ?? '',
        'buyer_city': (r['buyer_city'] as String?) ?? '',
        'service_type': r['service_type'].toString(),
        'item_count': (r['item_count'] as num?)?.toInt() ?? 0,
        'wipe_payout_cents': (r['wipe_payout_cents'] as num?)?.toInt() ?? 0,
        'reimage_payout_cents':
            (r['reimage_payout_cents'] as num?)?.toInt() ?? 0,
        'wipe_method': r['wipe_method'] as String?,
        'reimage_os': r['reimage_os'] as String?,
        'cert_url': r['cert_url'] as String?,
        'tracking_number': r['tracking_number'] as String?,
        'carrier': r['carrier'] as String?,
        'status': (r['status'] as String?) ?? 'available',
        'claimed_at': _ts(r['claimed_at']),
        'completed_at': _ts(r['completed_at']),
        'updated_at': _ts(updated.$updatedAt),
      },
    },
  );
}

/// Appwrite datetimes are ISO strings; the Postgres version serialized
/// DateTime.toString() — parse and re-stringify to keep the same format.
String? _ts(Object? iso) =>
    iso == null ? null : DateTime.parse(iso as String).toString();
