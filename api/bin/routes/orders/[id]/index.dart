/// GET /orders/:id — fetch a single order.

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/order_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final order = await OrderRepo(context.read<Db>())
      .findById(id, viewerCompanyId: auth.companyId);

  if (order == null) return notFound('Order $id not found');

  // Only the buyer or seller company may view this order.
  if (order.sellerCompanyId != auth.companyId &&
      order.buyerCompanyId  != auth.companyId) {
    return forbidden('Not authorised to view this order');
  }

  return Response.json(body: order.toJson());
}
