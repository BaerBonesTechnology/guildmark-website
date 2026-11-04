import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';
import 'package:guildmark_api/services/billing_owner.dart';
import 'package:guildmark_api/services/square_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  if (!await isBillingOwner(aw, auth)) {
    return forbidden(
      'Only the company billing owner can cancel a subscription.',
    );
  }
  final square = context.read<SquareService?>();
  final repo = SubscriptionRepo(aw);

  final currentSub = await repo.findByCompany(auth.companyId);
  if (currentSub == null) return notFound('Subscription record not found');

  if (!currentSub.isActive) {
    return badRequest('Subscription is already cancelled or past due');
  }

  // Never claim cancellation while the provider may continue billing.
  if (currentSub.squareSubscriptionId != null) {
    if (square == null) {
      return jsonError(
        503,
        'BILLING_UNAVAILABLE',
        'Provider cancellation is unavailable; billing remains unchanged.',
      );
    }
    try {
      await square.cancelSubscription(currentSub.squareSubscriptionId!);
    } on Exception {
      return jsonError(
        502,
        'CANCELLATION_UNCONFIRMED',
        'Provider cancellation failed; billing remains unchanged.',
      );
    }
  }

  await repo.cancel(auth.companyId);

  return Response.json(
    body: {'status': 'cancelled'},
  );
}
