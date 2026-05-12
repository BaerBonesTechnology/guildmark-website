/// POST /partner/account/withdraw
///
/// Creates a pending payout request for the authenticated partner's full
/// available balance. GuildMark reviews and marks it 'paid' manually (or via
/// an automated Square payout job — future work).
///
/// Returns: { payout } with the new partner_payouts row.
///
/// Requires: valid partner JWT + partner must be active.
library;

import 'dart:math';

import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final db = context.read<Db>();

  // Fetch partner inside a transaction so balance can't change mid-read.
  final result = await db.tx<Map<String, dynamic>?>((tx) async {
    final partnerRows = await tx.execute(
      Sql.named(
        '''
        SELECT status::text,
               available_balance::float8,
               total_jobs_completed
        FROM   partners
        WHERE  id = @pid
        FOR UPDATE
        ''',
      ),
      parameters: {'pid': principal.partnerId},
    );
    if (partnerRows.isEmpty) return null;

    final p        = partnerRows.first.toColumnMap();
    final status   = p['status'].toString();
    final balanceDbl = (p['available_balance'] as num?)?.toDouble() ?? 0.0;
    // Convert dollars to cents, rounding down.
    final amountCents = (balanceDbl * 100).floor();

    if (status != 'active') return {'error': 'PARTNER_NOT_ACTIVE'};
    if (amountCents <= 0)   return {'error': 'INSUFFICIENT_BALANCE'};

    // Generate a human-readable payout reference, e.g. "PO-0042".
    final rng     = Random.secure();
    final ref     = 'PO-${rng.nextInt(9000) + 1000}';

    // Deduct balance and create payout row atomically.
    await tx.execute(
      Sql.named(
          'UPDATE partners SET available_balance = 0, updated_at = now() WHERE id = @pid'),
      parameters: {'pid': principal.partnerId},
    );

    final inserted = await tx.execute(
      Sql.named(
        '''
        INSERT INTO partner_payouts
            (partner_id, payout_ref, amount_cents, method, status)
        VALUES (@pid, @ref, @cents, 'bank_transfer', 'pending')
        RETURNING id::text, payout_ref, amount_cents, method, status::text, created_at
        ''',
      ),
      parameters: {
        'pid':   principal.partnerId,
        'ref':   ref,
        'cents': amountCents,
      },
    );

    final r = inserted.first.toColumnMap();
    return {
      'payout': {
        'id':           r['id'].toString(),
        'payout_ref':   r['payout_ref'].toString(),
        'amount_cents': (r['amount_cents'] as num?)?.toInt() ?? 0,
        'method':       r['method'].toString(),
        'status':       r['status'].toString(),
        'paid_at':      null,
        'created_at':   r['created_at'].toString(),
      },
    };
  });

  if (result == null) return unauthorized('Partner not found');

  final error = result['error'] as String?;
  if (error == 'PARTNER_NOT_ACTIVE') {
    return jsonError(
        403, 'PARTNER_NOT_ACTIVE', 'Account must be active to withdraw.');
  }
  if (error == 'INSUFFICIENT_BALANCE') {
    return jsonError(422, 'INSUFFICIENT_BALANCE', 'No available balance to withdraw.');
  }

  return Response.json(body: result);
}
