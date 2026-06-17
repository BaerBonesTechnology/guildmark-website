import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';

Handler middleware(Handler handler) {
  return (context) async {
    final auth = context.read<AuthPrincipal?>();
    if (auth == null) return unauthorized();

    // Look up this company's subscription status.
    final db = context.read<Db>();
    final rows = await db.query(
      '''
      SELECT plan::text, status::text
      FROM subscriptions
      WHERE company_id = @cid
      LIMIT 1
      ''',
      parameters: {'cid': auth.companyId},
    );

    // No subscription row → treat as free.
    final plan = rows.isEmpty
        ? 'free'
        : rows.first.toColumnMap()['plan'].toString();
    final status = rows.isEmpty
        ? 'active'
        : rows.first.toColumnMap()['status'].toString();

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
