import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/order_repo.dart';
import '../../../lib/services/escrow_service.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final repo = OrderRepo(context.read<Db>());
  final escrow = context.read<EscrowService>();

  final order = await repo.findById(id, viewerCompanyId: auth.companyId);
  if (order == null) return notFound('Order $id not found');

  // Only the buyer may raise a dispute.
  if (order.buyerCompanyId != auth.companyId) {
    return forbidden('Only the buyer may open a dispute');
  }

  // Can only dispute during delivered / inspecting window.
  if (order.status != 'delivered' && order.status != 'inspecting') {
    return badRequest(
      'Cannot dispute an order in status "${order.status}"',
      code: 'INVALID_STATE',
    );
  }

  final updated = await repo.markDisputed(id);
  if (updated == null) return serverError('Failed to update order status');

  // Fire-and-forget: raise dispute on Escrow.com if configured.
  if (escrow.isConfigured && order.escrowTransactionId != null) {
    escrow.raiseDispute(order.escrowTransactionId!);
  }

  return Response.json(body: updated.toJson());
}
