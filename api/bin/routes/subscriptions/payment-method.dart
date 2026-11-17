import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/services/billing_owner.dart';
import 'package:guildmark_api/services/billing_payment_method.dart';
import 'package:guildmark_api/services/request_json.dart';
import 'package:guildmark_api/services/square_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (!{HttpMethod.get, HttpMethod.post}.contains(context.request.method))
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only');
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  final cfg = context.read<AppConfig>();
  final db = context.read<FirebaseService?>();
  final square = context.read<SquareService?>();
  if (!cfg.recurringBillingEnabled ||
      cfg.firebaseProjectId != 'guildmark-dev' ||
      cfg.squareEnvironment != 'sandbox' ||
      db == null ||
      square == null)
    return jsonError(
      503,
      'BILLING_UNAVAILABLE',
      'Dev sandbox billing recovery is unavailable.',
    );
  if (!await isBillingOwner(db, auth))
    return forbidden(
      'Only the company billing owner can manage payment methods and invoice recovery.',
    );
  final service = BillingPaymentMethod(db, square);
  try {
    if (context.request.method == HttpMethod.get)
      return Response.json(
        headers: {'Cache-Control': 'no-store'},
        body: await service.snapshot(auth.companyId),
      );
    final body = await boundedJson(context.request);
    if (body is! Map<String, dynamic> ||
        body['idempotency_key'] is! String ||
        body['source_id'] != null && body['source_id'] is! String)
      return badRequest(
        'A stable update key and optional tokenized card are required.',
      );
    final result = await service.update(
      auth.companyId,
      body['idempotency_key'] as String,
      source: body['source_id'] as String?,
      consent: body['recurring_consent'] == true,
    );
    return Response.json(
      statusCode: result['status'] == 'pending' ? 202 : 200,
      headers: {'Cache-Control': 'no-store'},
      body: result,
    );
  } on PlanLimitException catch (e) {
    return jsonError(e.status, e.code, e.message);
  } catch (_) {
    return jsonError(
      503,
      'BILLING_UNCONFIRMED',
      'Provider confirmation is unavailable. Check the existing update before trying another card.',
    );
  }
}
