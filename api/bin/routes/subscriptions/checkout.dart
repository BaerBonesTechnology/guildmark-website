import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart'
    show AppwriteException, ID;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/subscription_repo.dart';
import 'package:guildmark_api/services/square_service.dart';

// Fallback prices (cents) used when Square plan variation IDs are not configured.
const _fallbackPrices = {
  'starter': 4900,
  'growth': 14900,
  'pro': 34900,
};

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body = await context.request.json() as Map<String, dynamic>?;
  final plan = (body?['plan'] as String?)?.trim().toLowerCase();
  final sourceId = (body?['source_id'] as String?)?.trim();
  final cardholderName = (body?['cardholder_name'] as String?)?.trim();
  final billingRaw = body?['billing_address'] as Map<String, dynamic>?;

  if (plan == null || !_fallbackPrices.containsKey(plan)) {
    return badRequest('plan must be one of: starter, growth, pro');
  }
  if (sourceId == null || sourceId.isEmpty) {
    return badRequest('source_id (Square payment nonce) is required');
  }

  final billing = billingRaw != null
      ? SquareBillingAddress(
          businessName: billingRaw['business_name'] as String?,
          addressLine1: (billingRaw['address_line_1'] as String?) ?? '',
          addressLine2: billingRaw['address_line_2'] as String?,
          city: (billingRaw['city'] as String?) ?? '',
          state: (billingRaw['state'] as String?) ?? '',
          postalCode: (billingRaw['postal_code'] as String?) ?? '',
        )
      : null;

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final square = context.read<SquareService?>();
  final cfg = context.read<AppConfig>();
  final repo = SubscriptionRepo(aw);

  if (square == null) {
    return jsonError(
      503,
      'SQUARE_NOT_CONFIGURED',
      'Payment processing is not configured on this server.',
    );
  }

  // Fetch current subscription.
  final currentSub = await repo.findByCompany(auth.companyId);
  if (currentSub == null) return notFound('Subscription record not found');

  // Look up the Square customer ID for this company.
  String? squareCustomerId;
  try {
    final company = await aw.tablesDB.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.companies,
      rowId: auth.companyId,
    );
    squareCustomerId = company.data['square_customer_id'] as String?;
  } on AppwriteException catch (e) {
    if (e.code != 404) rethrow; // missing company row → treat as no customer
  }

  final planLabel = plan[0].toUpperCase() + plan.substring(1);
  final planVariationId = cfg.monthlyVariationId(plan);

  stdout.writeln(
    '[checkout] plan=$plan path=${planVariationId != null && squareCustomerId != null ? "A-subscriptions" : "B-direct"} '
    'squareCustomerId=${squareCustomerId ?? "(none)"} planVariationId=${planVariationId ?? "(none)"}',
  );

  // ── Path A: Square Subscriptions API (production / fully configured) ────────
  if (planVariationId != null && squareCustomerId != null) {
    final SquareSubscriptionResult subscription;

    try {
      // Step 1 — save card to customer vault so Square can charge on renewal.
      final cardId = await square.createCard(
        sourceId: sourceId,
        customerId: squareCustomerId,
        cardholderName: cardholderName,
        billingAddress: billing,
      );

      // Step 2 — cancel existing Square subscription if switching plans.
      final existingSquareSubId = currentSub.squareSubscriptionId;
      if (existingSquareSubId != null) {
        try {
          await square.cancelSubscription(existingSquareSubId);
        } catch (e) {
          stderr.writeln(
            '[checkout] cancel old subscription error (ignored): $e',
          );
        }
      }

      // Step 3 — create the new Square subscription.
      subscription = await square.createSubscription(
        planVariationId: planVariationId,
        customerId: squareCustomerId,
        cardId: cardId,
        locationId: square.locationId,
      );
    } on SquareException catch (e) {
      return jsonError(402, 'PAYMENT_FAILED', e.detail);
    }

    // Step 4 — update DB subscription row (the commit point: Square has
    // already been charged, so plan activation must not be blocked by the
    // audit-trail invoice write below).
    final periodStart = DateTime.now().toUtc();
    final periodEnd = DateTime(
      periodStart.year,
      periodStart.month + 1,
      periodStart.day,
    ).toUtc();

    final updated = await repo.updatePlan(
      companyId: auth.companyId,
      plan: plan,
      squareSubscriptionId: subscription.id,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    );

    // Record an invoice row for audit trail.
    await _recordInvoice(
      aw: aw,
      companyId: auth.companyId,
      subscriptionId: updated?.id ?? currentSub.id,
      plan: plan,
      amountCents: _fallbackPrices[plan]!,
      squarePaymentId: subscription.id,
      periodStart: periodStart,
      periodEnd: periodEnd,
    );

    return Response.json(
      body: {
        'subscription': updated?.toJson(),
        'invoice': {
          'plan': plan,
          'amount_cents': _fallbackPrices[plan],
          'status': 'paid',
        },
      },
    );
  }

  // ── Path B: fallback one-time charge (local sandbox / no plan variation IDs) ─
  try {
    final amountCents = _fallbackPrices[plan]!;
    final payment = await square.createPayment(
      sourceId: sourceId,
      amountCents: amountCents,
      note: 'GuildMark $planLabel subscription',
      referenceId: auth.companyId,
      customerId: squareCustomerId,
      saveCard: true,
      cardholderName: cardholderName,
      billingAddress: billing,
    );

    final periodStart = DateTime.now().toUtc();
    final periodEnd = DateTime(
      periodStart.year,
      periodStart.month + 1,
      periodStart.day,
    ).toUtc();

    final updated = await repo.updatePlan(
      companyId: auth.companyId,
      plan: plan,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    );

    await _recordInvoice(
      aw: aw,
      companyId: auth.companyId,
      subscriptionId: updated?.id ?? currentSub.id,
      plan: plan,
      amountCents: payment.amountCents,
      squarePaymentId: payment.id,
      periodStart: periodStart,
      periodEnd: periodEnd,
    );

    return Response.json(
      body: {
        'subscription': updated?.toJson(),
        'invoice': {
          'plan': plan,
          'amount_cents': payment.amountCents,
          'status': 'paid',
        },
      },
    );
  } on SquareException catch (e) {
    return jsonError(402, 'PAYMENT_FAILED', e.detail);
  }
}

/// Audit-trail invoice row (was INSERT INTO subscription_invoices).
Future<void> _recordInvoice({
  required AppwriteService aw,
  required String companyId,
  required String subscriptionId,
  required String plan,
  required int amountCents,
  required String squarePaymentId,
  required DateTime periodStart,
  required DateTime periodEnd,
}) async {
  await aw.tablesDB.createRow(
    databaseId: Aw.databaseId,
    tableId: Aw.subscriptionInvoices,
    rowId: ID.unique(),
    data: {
      'company_id': companyId,
      'subscription_id': subscriptionId,
      'plan': plan,
      'amount_cents': amountCents,
      'square_payment_id': squarePaymentId,
      'status': 'paid',
      'period_start': periodStart.toUtc().toIso8601String(),
      'period_end': periodEnd.toUtc().toIso8601String(),
    },
  );
}
