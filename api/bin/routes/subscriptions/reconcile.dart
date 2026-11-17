import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/billing_owner.dart';
import 'package:guildmark_api/services/recurring_billing.dart';
import 'package:guildmark_api/services/square_service.dart';

Future<Response> onRequest(RequestContext c) async {
  if (c.request.method != HttpMethod.post)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  final auth = c.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  final cfg = c.read<AppConfig>();
  final store = c.read<FirebaseService?>();
  final square = c.read<SquareService?>();
  if (!cfg.recurringBillingEnabled ||
      cfg.firebaseProjectId != 'guildmark-dev' ||
      cfg.squareEnvironment != 'sandbox' ||
      store == null ||
      square == null)
    return jsonError(
      503,
      'BILLING_UNAVAILABLE',
      'Recurring reconciliation is unavailable.',
    );
  if (!await isBillingOwner(store, auth))
    return forbidden('Company billing owner required.');
  try {
    return Response.json(
      headers: {'Cache-Control': 'no-store'},
      body: await RecurringBilling(store, square).company(auth.companyId),
    );
  } on Exception {
    return jsonError(
      503,
      'PAYMENT_UNCONFIRMED',
      'Provider billing confirmation is temporarily unavailable. Existing paid periods were not extended.',
    );
  }
}
