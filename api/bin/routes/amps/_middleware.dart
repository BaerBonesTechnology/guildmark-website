import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/subscription_repo.dart';

Handler middleware(Handler handler) {
  return (context) async {
    final auth = context.read<AuthPrincipal?>();
    if (auth == null) return unauthorized();

    final aw = context.read<AppwriteService?>();
    if (aw == null) {
      return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
    }

    // Look up this company's subscription status.
    final sub = await SubscriptionRepo(aw).findByCompany(auth.companyId);

    // No subscription row → treat as free.
    final plan = sub?.plan ?? 'free';
    final status = sub?.status ?? 'active';

    // Free plan is not allowed on AMPS routes.
    if (plan == 'free') {
      return Response.json(
        statusCode: 403,
        body: {
          'code': 'SUBSCRIPTION_REQUIRED',
          'message': 'GM Pro subscription required to access this feature.',
          'plan': plan,
        },
      );
    }

    // Past-due subscriptions get a grace-period message.
    if (status == 'past_due') {
      return Response.json(
        statusCode: 402,
        body: {
          'code': 'PAYMENT_REQUIRED',
          'message':
              'Your subscription payment is past due. Please update your payment method.',
          'plan': plan,
        },
      );
    }

    // Cancelled subscriptions are denied.
    if (status == 'cancelled') {
      return Response.json(
        statusCode: 403,
        body: {
          'code': 'SUBSCRIPTION_CANCELLED',
          'message': 'Your subscription has been cancelled.',
          'plan': plan,
        },
      );
    }

    return handler(context);
  };
}
