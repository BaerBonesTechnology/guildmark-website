import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/order_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final order = await OrderRepo(
    aw,
  ).findById(id, viewerCompanyId: auth.companyId);

  if (order == null) return notFound('Order $id not found');

  // Only the buyer or seller company may view this order.
  if (order.sellerCompanyId != auth.companyId &&
      order.buyerCompanyId != auth.companyId) {
    return forbidden('Not authorised to view this order');
  }

  return Response.json(body: order.toJson());
}
