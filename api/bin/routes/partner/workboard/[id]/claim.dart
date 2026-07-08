import 'package:dart_appwrite/dart_appwrite.dart' show AppwriteException;
import 'package:dart_appwrite/models.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // Check the partner exists and is active before allowing a claim.
  final Row partner;
  try {
    partner = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.partners,
      rowId: principal.partnerId,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) return unauthorized('Partner not found');
    rethrow;
  }
  if ((partner.data['status'] as String?) != 'active') {
    return jsonError(
      403,
      'PARTNER_NOT_ACTIVE',
      'Your account must be approved by GuildMark before you can claim orders.',
    );
  }

  // Postgres serialized claims with FOR UPDATE SKIP LOCKED. Appwrite has no
  // row locks, so this is check → update → verify:
  //   1. read-check status == 'available' && partner_id IS NULL
  //   2. updateRow setting partner_id/status/claimed_at (the commit point)
  //   3. re-read and confirm partner_id is ours — two racers can both pass
  //      step 1; last-write-wins means the loser's update was overwritten,
  //      so the verify step demotes it to the same 409 the PG version
  //      returned. A sub-second double-claim window where both partners
  //      briefly "won" is accepted at current volume.
  final Row assignment;
  try {
    assignment = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.partnerServiceAssignments,
      rowId: id,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) {
      // Doesn't exist — same response as already-claimed (PG lock miss).
      return jsonError(
        409,
        'ALREADY_CLAIMED',
        'This order has already been claimed by another partner.',
      );
    }
    rethrow;
  }
  if (assignment.data['status'] != 'available' ||
      assignment.data['partner_id'] != null) {
    return jsonError(
      409,
      'ALREADY_CLAIMED',
      'This order has already been claimed by another partner.',
    );
  }

  final claimedAt = DateTime.now().toUtc().toIso8601String();
  try {
    await db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.partnerServiceAssignments,
      rowId: id,
      data: {
        'partner_id': principal.partnerId,
        'status': 'claimed',
        'claimed_at': claimedAt,
      },
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) {
      return jsonError(
        409,
        'ALREADY_CLAIMED',
        'This order has already been claimed by another partner.',
      );
    }
    rethrow;
  }

  // Verify-after-write: confirm our claim actually stuck (see race note).
  final Row verified;
  try {
    verified = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.partnerServiceAssignments,
      rowId: id,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) {
      return jsonError(
        409,
        'ALREADY_CLAIMED',
        'This order has already been claimed by another partner.',
      );
    }
    rethrow;
  }
  if (verified.data['partner_id'] != principal.partnerId) {
    return jsonError(
      409,
      'ALREADY_CLAIMED',
      'This order has already been claimed by another partner.',
    );
  }

  final r = verified.data;
  return Response.json(
    body: {
      'assignment': {
        'id': verified.$id,
        'partner_id': r['partner_id'].toString(),
        'order_ref': r['order_ref'].toString(),
        'buyer_name': (r['buyer_name'] as String?) ?? '',
        'buyer_city': (r['buyer_city'] as String?) ?? '',
        'service_type': r['service_type'].toString(),
        'item_count': (r['item_count'] as num?)?.toInt() ?? 0,
        'wipe_payout_cents': (r['wipe_payout_cents'] as num?)?.toInt() ?? 0,
        'reimage_payout_cents':
            (r['reimage_payout_cents'] as num?)?.toInt() ?? 0,
        'status': (r['status'] as String?) ?? 'claimed',
        'claimed_at':
            DateTime.parse(r['claimed_at'] as String? ?? claimedAt).toString(),
      },
    },
  );
}
