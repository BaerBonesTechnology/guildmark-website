/// GET /partner/workboard
///
/// Returns all service assignments currently available for partners to claim
/// (status = 'available', partner_id IS NULL). The list is ordered by
/// creation date descending so the newest jobs appear first.
///
/// Requires: valid partner JWT (PartnerPrincipal must not be null).

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
           created_at
    FROM   partner_service_assignments
    WHERE  status = 'available'
      AND  partner_id IS NULL
    ORDER BY created_at DESC
    ''',
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
      'created_at':           r['created_at'].toString(),
    };
  }).toList();

  return Response.json(body: {'items': items});
}
