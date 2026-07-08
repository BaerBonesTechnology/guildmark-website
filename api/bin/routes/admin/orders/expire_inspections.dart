import 'dart:async';
import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart' show Query;
import 'package:dart_appwrite/models.dart' show Row;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/escrow_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  if (auth.role != 'admin') return forbidden('Admin role required');

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;
  final escrow = context.read<EscrowService>();

  final nowIso = DateTime.now().toUtc().toIso8601String();

  // Find all orders past their inspection window that are still in
  // 'delivered' or 'inspecting' status, and flip each to 'complete'.
  //
  // The PG version was one atomic UPDATE … RETURNING; Appwrite has no bulk
  // update, so we list-then-update in a loop (each update removes the row
  // from the filter, so re-querying drains the set). Race window: two
  // concurrent calls can both read the same order before either updates it —
  // the status flip is idempotent, but the escrow release below could fire
  // twice for that order. Accepted for an admin-triggered maintenance
  // endpoint; escrow.acceptDelivery on an already-released transaction is a
  // no-op/failure logged downstream.
  final expired = <Row>[];
  while (true) {
    final page = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.orders,
      queries: [
        Query.equal('status', ['delivered', 'inspecting']),
        // Rows with a null inspection_ends_at never satisfy the comparison,
        // matching `inspection_ends_at IS NOT NULL AND … < now()`.
        Query.lessThan('inspection_ends_at', nowIso),
        Query.limit(100),
      ],
    );
    if (page.rows.isEmpty) break;
    for (final row in page.rows) {
      await db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: row.$id,
        data: {'status': 'complete', 'completed_at': nowIso},
      );
      expired.add(row);
    }
    if (page.rows.length < 100) break;
  }

  // Fire-and-forget: release escrow for each expired order.
  for (final row in expired) {
    final escrowId = row.data['escrow_transaction_id'] as String?;
    if (escrow.isConfigured && escrowId != null) {
      unawaited(
        escrow
            .acceptDelivery(escrowId)
            .then((_) {
              stdout.writeln(
                '[expiry] Released escrow $escrowId for order ${row.$id}',
              );
            })
            .catchError((Object e) {
              stderr.writeln(
                '[expiry] Escrow release failed for ${row.$id}: $e',
              );
            }),
      );
    }
  }

  stdout.writeln('[expiry] Auto-expired ${expired.length} inspection(s)');

  return Response.json(
    body: {
      'expired': expired.length,
      'order_ids': expired.map((r) => r.$id).toList(),
    },
  );
}
