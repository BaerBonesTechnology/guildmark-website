import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

/// All marketplace charges must be tied to a durable, inventory-backed order.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  if (context.read<AuthPrincipal?>() == null) return unauthorized();
  return jsonError(
    410,
    'ORDER_CHECKOUT_REQUIRED',
    'Use listing checkout to create an order and payment together',
  );
}
