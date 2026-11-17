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
  if (context.request.method != HttpMethod.post)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
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
    final body = await boundedJson(context.request);
    if (body is! Map<String, dynamic> ||
        body['invoice_id'] is! String ||
        (body['invoice_id'] as String).length > 200)
      return badRequest('An invoice ID is required.');
    return Response.json(
      headers: {'Cache-Control': 'no-store'},
      body: await service.recovery(
        auth.companyId,
        body['invoice_id'] as String,
      ),
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
