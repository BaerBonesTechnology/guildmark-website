/// GET /partner/services
///
/// Returns all active (non-complete, non-cancelled) assignments for the
/// authenticated partner, ordered by claimed_at descending.
/// Also includes recently completed jobs (last 30 days) so partners can
/// reference them for the Account & Payouts page.
///
/// Requires: valid partner JWT.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final db   = context.read<Db>();
  final rows = await db.query(
    '''
    SELECT id::text,
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
    FROM   partner_service_assignments
    WHERE  partner_id = @pid
      AND  (
               status NOT IN ('complete', 'cancelled')
            OR completed_at > now() - INTERVAL \'30 days\'
           )
    ORDER BY claimed_at DESC
    ''',
    parameters: {'pid': principal.partnerId},
  );

  final items = rows.map((row) {
    final r = row.toColumnMap();
    return {
      'id':                   r['id'].toString(),
      'order_ref':            r['order_ref'].toString(),
      'buyer_name':           r['buyer_name'].toString(),
      'buyer_city':           r['buyer_city'].toString(),
      'service_type':         r['service_type'].toString(),
      'item_count':           (r['item_count'] as num?)?.toInt() ?? 0,
      'wipe_payout_cents':    (r['wipe_payout_cents'] as num?)?.toInt() ?? 0,
      'reimage_payout_cents': (r['reimage_payout_cents'] as num?)?.toInt() ?? 0,
      'wipe_method':          r['wipe_method']?.toString(),
      'reimage_os':           r['reimage_os']?.toString(),
      'cert_url':             r['cert_url']?.toString(),
      'tracking_number':      r['tracking_number']?.toString(),
      'carrier':              r['carrier']?.toString(),
      'status':               r['status'].toString(),
      'claimed_at':           r['claimed_at']?.toString(),
      'completed_at':         r['completed_at']?.toString(),
      'updated_at':           r['updated_at'].toString(),
    };
  }).toList();

  return Response.json(body: {'items': items});
}
