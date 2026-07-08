import 'dart:math';

import 'package:dart_appwrite/dart_appwrite.dart'
    show AppwriteException, ID;
import 'package:dart_appwrite/models.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
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

  // Postgres wrapped read + deduct + insert in a transaction with FOR UPDATE
  // so the balance couldn't change mid-read. Appwrite has neither, so this is
  // a §1a saga: create the payout row first, then zero the balance (the
  // commit point); if zeroing fails, compensate by deleting the payout.
  //
  // ⚠ Race window: two concurrent withdrawals can both read the same
  // balance and both create a payout before either zeroes it — a double
  // payout for the same funds. Acceptable at current partner volume (one
  // partner clicking twice, sub-second window); revisit with a conditional
  // update / single-writer queue before high-volume money movement.
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

  final status = (partner.data['status'] as String?) ?? 'pending';
  // Balance is already stored as integer cents (money convention §2).
  final amountCents =
      (partner.data['available_balance_cents'] as num?)?.toInt() ?? 0;

  if (status != 'active') {
    return jsonError(
      403,
      'PARTNER_NOT_ACTIVE',
      'Account must be active to withdraw.',
    );
  }
  if (amountCents <= 0) {
    return jsonError(
      422,
      'INSUFFICIENT_BALANCE',
      'No available balance to withdraw.',
    );
  }

  // Generate a human-readable payout reference, e.g. "PO-0042".
  final rng = Random.secure();
  final ref = 'PO-${rng.nextInt(9000) + 1000}';

  // Step 1 — payout row.
  final payout = await db.createRow(
    databaseId: Aw.databaseId,
    tableId: Aw.partnerPayouts,
    rowId: ID.unique(),
    data: {
      'partner_id': principal.partnerId,
      'payout_ref': ref,
      'amount_cents': amountCents,
      'method': 'bank_transfer',
      'status': 'pending',
    },
  );

  // Step 2 — zero the balance (commit point); compensate on failure.
  try {
    await db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.partners,
      rowId: principal.partnerId,
      data: {'available_balance_cents': 0},
    );
  } catch (_) {
    try {
      await db.deleteRow(
        databaseId: Aw.databaseId,
        tableId: Aw.partnerPayouts,
        rowId: payout.$id,
      );
    } catch (_) {}
    rethrow;
  }

  return Response.json(
    body: {
      'payout': {
        'id': payout.$id,
        'payout_ref': ref,
        'amount_cents': amountCents,
        'method': 'bank_transfer',
        'status': 'pending',
        'paid_at': null,
        'created_at': DateTime.parse(payout.$createdAt).toString(),
      },
    },
  );
}
