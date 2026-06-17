import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';

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

  final db = context.read<Db>();

  // Fetch the current assignment — must belong to this partner.
  final current = await db.query(
    '''
    SELECT id::text, status::text, service_type, cert_url, tracking_number
    FROM   partner_service_assignments
    WHERE  id = @id AND partner_id = @pid
    LIMIT 1
    ''',
    parameters: {'id': id, 'pid': principal.partnerId},
  );
  if (current.isEmpty) {
    return jsonError(404, 'NOT_FOUND', 'Assignment not found');
  }

  final row = current.first.toColumnMap();
  final currentStatus = row['status'].toString();
  final serviceType = row['service_type'].toString();

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
    final resolvedCert = certUrl ?? row['cert_url']?.toString();
    if (resolvedCert == null || resolvedCert.isEmpty) {
      return badRequest('cert_url is required to move to cert_uploaded');
    }
  }

  // shipped requires tracking info.
  if (newStatus == 'shipped') {
    final resolvedTracking =
        trackingNumber ?? row['tracking_number']?.toString();
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

  // Build the SET clause dynamically — only update provided evidence fields.
  final setClauses = <String>[
    'status = @status::partner_assignment_status',
    'updated_at = now()',
  ];
  final parameters = <String, dynamic>{
    'status': newStatus,
    'id': id,
    'pid': principal.partnerId,
  };

  if (wipeMethod != null) {
    setClauses.add('wipe_method = @wipe_method');
    parameters['wipe_method'] = wipeMethod;
  }
  if (reimageOs != null) {
    setClauses.add('reimage_os = @reimage_os');
    parameters['reimage_os'] = reimageOs;
  }
  if (certUrl != null) {
    setClauses.add('cert_url = @cert_url');
    parameters['cert_url'] = certUrl;
  }
  if (trackingNumber != null) {
    setClauses.add('tracking_number = @tracking_number');
    parameters['tracking_number'] = trackingNumber;
  }
  if (carrier != null) {
    setClauses.add('carrier = @carrier');
    parameters['carrier'] = carrier;
  }
  if (isComplete) {
    setClauses.add('completed_at = now()');
  }

  final setClause = setClauses.join(', ');

  final updated = await db.query(
    '''
    UPDATE partner_service_assignments
    SET    $setClause
    WHERE  id = @id AND partner_id = @pid
    RETURNING
           id::text,
           order_ref,
           buyer_name,
           buyer_city,
           service_type,
           item_count,
           wipe_payout_cents,
           reimage_payout_cents,
           wipe_method,
           reimage_os,
           cert_url,
           tracking_number,
           carrier,
           status::text,
           claimed_at,
           completed_at,
           updated_at
    ''',
    parameters: parameters,
  );

  if (updated.isEmpty) {
    return jsonError(404, 'NOT_FOUND', 'Assignment not found');
  }

  final r = updated.first.toColumnMap();
  return Response.json(
    body: {
      'assignment': {
        'id': r['id'].toString(),
        'order_ref': r['order_ref'].toString(),
        'buyer_name': r['buyer_name'].toString(),
        'buyer_city': r['buyer_city'].toString(),
        'service_type': r['service_type'].toString(),
        'item_count': (r['item_count'] as num?)?.toInt() ?? 0,
        'wipe_payout_cents': (r['wipe_payout_cents'] as num?)?.toInt() ?? 0,
        'reimage_payout_cents':
            (r['reimage_payout_cents'] as num?)?.toInt() ?? 0,
        'wipe_method': r['wipe_method']?.toString(),
        'reimage_os': r['reimage_os']?.toString(),
        'cert_url': r['cert_url']?.toString(),
        'tracking_number': r['tracking_number']?.toString(),
        'carrier': r['carrier']?.toString(),
        'status': r['status'].toString(),
        'claimed_at': r['claimed_at']?.toString(),
        'completed_at': r['completed_at']?.toString(),
        'updated_at': r['updated_at'].toString(),
      },
    },
  );
}
