import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/order_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.patch) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body = await context.request.json() as Map<String, dynamic>?;
  final trackingNumber = (body?['tracking_number'] as String?)?.trim();
  final carrier = (body?['carrier'] as String?)?.trim() ?? 'fedex';

  if (trackingNumber == null || trackingNumber.isEmpty) {
    return badRequest('tracking_number is required');
  }

  final repo = OrderRepo(context.read<Db>());
  final order = await repo.addTracking(
    id: id,
    sellerCompanyId: auth.companyId,
    trackingNumber: trackingNumber,
    carrier: carrier,
  );

  if (order == null) {
    return jsonError(
      422,
      'SHIP_FAILED',
      'Order not found, not in a shippable state, or does not belong to your company',
    );
  }

  return Response.json(body: order.toJson());
}
