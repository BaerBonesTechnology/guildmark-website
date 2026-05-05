/// POST /admin/orders/expire-inspections
///
/// Called by a cron job (or manually from DevDash) to auto-expire any orders
/// whose inspection_ends_at has passed without buyer confirmation.
///
/// For each expired order:
///   1. Mark status → 'complete' in DB
///   2. Call escrow.acceptDelivery (fire-and-forget)
///
/// Auth: admin role required.
library;

import 'dart:async';
import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/services/escrow_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  if (auth.role != 'admin') return forbidden('Admin role required');

  final db     = context.read<Db>();
  final escrow = context.read<EscrowService>();

  // Find all orders past their inspection window that are still in
  // 'delivered' or 'inspecting' status.
  final rows = await db.query(
    '''
    UPDATE orders
    SET status       = 'complete',
        completed_at = now()
    WHERE status IN ('delivered', 'inspecting')
      AND inspection_ends_at IS NOT NULL
      AND inspection_ends_at < now()
    RETURNING id, escrow_transaction_id
    ''',
  );

  final expired = rows.map((r) => r.toColumnMap()).toList();

  // Fire-and-forget: release escrow for each expired order.
  for (final row in expired) {
    final escrowId = row['escrow_transaction_id'] as String?;
    if (escrow.isConfigured && escrowId != null) {
      unawaited(
        escrow.acceptDelivery(escrowId).then((_) {
          stdout.writeln('[expiry] Released escrow $escrowId for order ${row['id']}');
        }).catchError((e) {
          stderr.writeln('[expiry] Escrow release failed for ${row['id']}: $e');
        }),
      );
    }
  }

  stdout.writeln('[expiry] Auto-expired ${expired.length} inspection(s)');

  return Response.json(body: {
    'expired': expired.length,
    'order_ids': expired.map((r) => r['id'] as String).toList(),
  });
}
