import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/services/billing_owner.dart';
import 'package:guildmark_api/services/request_json.dart';
import 'package:guildmark_api/services/square_service.dart';
import 'package:guildmark_api/services/subscription_checkout.dart';
import 'package:guildmark_api/services/recurring_billing.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  final db = context.read<FirebaseService?>();
  if (db == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Billing unavailable.');
  }
  if (!await isBillingOwner(db, auth)) {
    return forbidden(
      'Only the company billing owner can purchase or change a subscription.',
    );
  }
  final square = context.read<SquareService?>();
  if (square == null) {
    return jsonError(
      503,
      'SQUARE_NOT_CONFIGURED',
      'Payment processing is unavailable.',
    );
  }
  try {
    final body = await boundedJson(context.request);
    if (body is! Map<String, dynamic> ||
        body['plan'] is! String ||
        body['idempotency_key'] is! String ||
        (body['source_id'] != null && body['source_id'] is! String) ||
        (body['expected_price_cents'] != null &&
            body['expected_price_cents'] is! int)) {
      return badRequest(
        'Supported plan and idempotency_key are required; source_id is required for a new payment.',
      );
    }
    final plan = (body['plan'] as String).trim().toLowerCase();
    final catalog = ampsPlans[plan];
    if (catalog == null) {
      return badRequest('plan must be starter, growth or pro');
    }
    final cfg = context.read<AppConfig>();
    final variation = cfg.monthlyVariationId(plan);
    if (cfg.recurringBillingEnabled &&
        cfg.firebaseProjectId == 'guildmark-dev' &&
        cfg.squareEnvironment == 'sandbox') {
      if (variation == null)
        return jsonError(
          503,
          'SQUARE_NOT_CONFIGURED',
          'Recurring plan configuration is unavailable.',
        );
      if (body['source_id'] != null && body['recurring_consent'] != true)
        return badRequest(
          'Authorize monthly recurring billing before subscribing.',
        );
      await square.verifyMonthlyPlan(variation, catalog.priceCents);
      final user = await db.tablesDB.getRow(
        databaseId: '',
        tableId: 'users',
        rowId: auth.userId,
      );
      final company = await db.tablesDB.getRow(
        databaseId: '',
        tableId: 'companies',
        rowId: auth.companyId,
      );
      final result = await RecurringBilling(db, square).checkout(
        company: auth.companyId,
        email: user.data['email'] as String,
        companyName: company.data['name'] as String? ?? 'GuildMark company',
        plan: plan,
        variation: variation,
        key: body['idempotency_key'] as String,
        source: body['source_id'] as String?,
        expected: body['expected_price_cents'] as int?,
      );
      return Response.json(
        statusCode: result['granted'] == true ? 200 : 202,
        body: result,
      );
    }
    if (variation != null) {
      await square.verifyMonthlyPlan(variation, catalog.priceCents);
      return jsonError(
        503,
        'SUBSCRIPTION_RECONCILIATION_REQUIRED',
        'Recurring billing is gated until verified paid-invoice reconciliation is available. No subscription was created and no payment was requested.',
      );
    }
    if (cfg.squareEnvironment != 'sandbox') {
      return jsonError(
        503,
        'SUBSCRIPTION_RECONCILIATION_REQUIRED',
        'Production subscriptions require a verified recurring billing workflow. No payment was requested.',
      );
    }
    final result = await SubscriptionCheckout(db, square).checkout(
      companyId: auth.companyId,
      plan: plan,
      key: body['idempotency_key'] as String,
      sourceId: body['source_id'] as String?,
      expectedPriceCents: body['expected_price_cents'] as int?,
    );
    return Response.json(
      statusCode: result['status'] == 'pending' ? 202 : 200,
      body: result,
    );
  } on PlanLimitException catch (e) {
    return jsonError(e.status, e.code, e.message);
  } on SquareException catch (e) {
    return jsonError(
      {400, 402, 422}.contains(e.statusCode)
          ? 402
          : e.statusCode == 409
          ? 409
          : 502,
      {400, 402, 422}.contains(e.statusCode)
          ? 'PAYMENT_FAILED'
          : e.statusCode == 409
          ? 'SUBSCRIPTION_CATALOG_MISMATCH'
          : 'PAYMENT_UNCONFIRMED',
      e.detail,
    );
  } on FormatException {
    return badRequest('Invalid billing request JSON.');
  } on Exception {
    return jsonError(
      503,
      'PAYMENT_UNCONFIRMED',
      'Billing confirmation is unavailable. Check this payment attempt before starting another.',
    );
  }
}
