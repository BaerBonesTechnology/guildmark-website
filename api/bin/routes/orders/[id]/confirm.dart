import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/order_repo.dart';
import 'package:guildmark_api/services/escrow_service.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.patch) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final repo = OrderRepo(aw);
  final escrow = context.read<EscrowService>();

  // Verify the caller is the buyer for this order.
  final existing = await repo.findById(id);
  if (existing == null) return notFound('Order $id not found');
  if (existing.buyerCompanyId != auth.companyId) {
    return forbidden('Only the buyer can confirm delivery');
  }

  // 1 — Release escrow funds.
  if (existing.escrowTransactionId != null) {
    await escrow.acceptDelivery(existing.escrowTransactionId!);
  }

  // 2 — Mark order complete in DB.
  final order = await repo.markComplete(id, auth.companyId);
  if (order == null) {
    return jsonError(
      422,
      'CONFIRM_FAILED',
      'Order is not in a confirmable state (must be delivered or inspecting)',
    );
  }

  return Response.json(body: order.toJson());
}
