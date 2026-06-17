import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final db = context.read<Db>();

  // Check the partner exists and is active before allowing a claim.
  final partnerRows = await db.query(
    "SELECT status FROM partners WHERE id = @pid LIMIT 1",
    parameters: {'pid': principal.partnerId},
  );
  if (partnerRows.isEmpty) return unauthorized('Partner not found');
  final partnerStatus = partnerRows.first.toColumnMap()['status'].toString();
  if (partnerStatus != 'active') {
    return jsonError(
      403,
      'PARTNER_NOT_ACTIVE',
      'Your account must be approved by GuildMark before you can claim orders.',
    );
  }

  // Claim inside a transaction to prevent double-claim race conditions.
  final assignment = await db.tx<Map<String, dynamic>?>((tx) async {
    // Lock the row so concurrent claims lose the race.
    final lock = await tx.execute(
      Sql.named(
        "SELECT id FROM partner_service_assignments "
        "WHERE id = @id AND status = 'available' AND partner_id IS NULL "
        'FOR UPDATE SKIP LOCKED',
      ),
      parameters: {'id': id},
    );
    if (lock.isEmpty) return null; // Already claimed or doesn't exist.

    final updated = await tx.execute(
      Sql.named(
        '''
        UPDATE partner_service_assignments
        SET    partner_id  = @pid,
               status      = 'claimed',
               claimed_at  = now(),
               updated_at  = now()
        WHERE  id          = @id
        RETURNING
               id::text,
               partner_id::text,
               order_ref,
               buyer_name,
               buyer_city,
               service_type,
               item_count,
               wipe_payout_cents,
               reimage_payout_cents,
               status::text,
               claimed_at
        ''',
      ),
      parameters: {'pid': principal.partnerId, 'id': id},
    );
    if (updated.isEmpty) return null;
    final r = updated.first.toColumnMap();
    return {
      'id': r['id'].toString(),
      'partner_id': r['partner_id'].toString(),
      'order_ref': r['order_ref'].toString(),
      'buyer_name': r['buyer_name'].toString(),
      'buyer_city': r['buyer_city'].toString(),
      'service_type': r['service_type'].toString(),
      'item_count': (r['item_count'] as num?)?.toInt() ?? 0,
      'wipe_payout_cents': (r['wipe_payout_cents'] as num?)?.toInt() ?? 0,
      'reimage_payout_cents': (r['reimage_payout_cents'] as num?)?.toInt() ?? 0,
      'status': r['status'].toString(),
      'claimed_at': r['claimed_at'].toString(),
    };
  });

  if (assignment == null) {
    return jsonError(
      409,
      'ALREADY_CLAIMED',
      'This order has already been claimed by another partner.',
    );
  }

  return Response.json(body: {'assignment': assignment});
}
