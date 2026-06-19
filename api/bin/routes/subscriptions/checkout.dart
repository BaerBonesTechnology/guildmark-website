import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/subscription_repo.dart';
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

  final db = context.read<Db>();
  final square = context.read<SquareService?>();
  final cfg = context.read<AppConfig>();
  final repo = SubscriptionRepo(db);

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
  final companyRows = await db.query(
    'SELECT square_customer_id FROM companies WHERE id = @id::uuid',
    parameters: {'id': auth.companyId},
  );
  final squareCustomerId = companyRows.isEmpty
      ? null
      : companyRows.first.toColumnMap()['square_customer_id']?.toString();

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

    // Step 4 — update DB subscription row.
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
    await db.query(
      '''
      INSERT INTO subscription_invoices
        (company_id, subscription_id, plan, amount_cents, square_payment_id,
         status, period_start, period_end)
      VALUES
        (@cid, @sub_id::uuid, @plan, @amount, @sqid, 'paid', @pstart, @pend)
      ''',
      parameters: {
        'cid': auth.companyId,
        'sub_id': updated?.id,
        'plan': plan,
        'amount': _fallbackPrices[plan],
        'sqid': subscription.id,
        'pstart': periodStart,
        'pend': periodEnd,
      },
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

    await db.query(
      '''
      INSERT INTO subscription_invoices
        (company_id, subscription_id, plan, amount_cents, square_payment_id,
         status, period_start, period_end)
      VALUES
        (@cid, @sub_id::uuid, @plan, @amount, @sqid, 'paid', @pstart, @pend)
      ''',
      parameters: {
        'cid': auth.companyId,
        'sub_id': updated?.id,
        'plan': plan,
        'amount': payment.amountCents,
        'sqid': payment.id,
        'pstart': periodStart,
        'pend': periodEnd,
      },
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
