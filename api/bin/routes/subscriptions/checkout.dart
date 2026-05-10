/// POST /subscriptions/checkout
///
/// Upgrades or switches a company's subscription plan using Square's native
/// Subscriptions API, which handles all future recurring billing automatically.
///
/// Flow:
///   1. Save the card nonce to the Square customer vault (POST /v2/cards)
///   2. Create a Square subscription against the plan variation (POST /v2/subscriptions)
///   3. Update our subscriptions row with the new plan + square_subscription_id
///   4. Record a subscription_invoices row for audit trail
///
/// If the company already has an active Square subscription, it is cancelled
/// before the new one is created (plan switch).
///
/// When no plan variation IDs are configured (e.g. local sandbox without test
/// plans), the route falls back to a one-time direct charge so development
/// remains unblocked.
///
/// Body:
///   plan             string  — "starter" | "growth" | "pro"
///   source_id        string  — Square Web Payments nonce (cnon:...)
///   save_card        bool?   — always true when using Subscriptions API; kept
///                              for API compatibility
///   cardholder_name  string? — forwarded to Square card vault
///   billing_address  object? — forwarded to Square for AVS
///
/// Returns: updated subscription + the new invoice row.
library;

import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import '../../lib/config.dart';
import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/subscription_repo.dart';
import '../../lib/services/square_service.dart';

// Fallback prices (cents) used when Square plan variation IDs are not configured.
const _fallbackPrices = {
  'starter': 4900,
  'growth':  14900,
  'pro':     34900,
};

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body            = await context.request.json() as Map<String, dynamic>?;
  final plan            = (body?['plan']            as String?)?.trim().toLowerCase();
  final sourceId        = (body?['source_id']       as String?)?.trim();
  final cardholderName  = (body?['cardholder_name'] as String?)?.trim();
  final billingRaw      = body?['billing_address']  as Map<String, dynamic>?;

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
          city:         (billingRaw['city']           as String?) ?? '',
          state:        (billingRaw['state']          as String?) ?? '',
          postalCode:   (billingRaw['postal_code']    as String?) ?? '',
        )
      : null;

  final db     = context.read<Db>();
  final square = context.read<SquareService?>()!;
  final cfg    = context.read<AppConfig>();
  final repo   = SubscriptionRepo(db);

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

  final planLabel       = plan[0].toUpperCase() + plan.substring(1);
  final planVariationId = cfg.monthlyVariationId(plan);

  // ── Path A: Square Subscriptions API (production / fully configured) ────────
  if (planVariationId != null && squareCustomerId != null) {
    final SquareSubscriptionResult subscription;

    try {
      // Step 1 — save card to customer vault so Square can charge on renewal.
      final cardId = await square.createCard(
        sourceId:       sourceId,
        customerId:     squareCustomerId,
        cardholderName: cardholderName,
        billingAddress: billing,
      );

      // Step 2 — cancel existing Square subscription if switching plans.
      final existingSquareSubId = currentSub.squareSubscriptionId;
      if (existingSquareSubId != null) {
        try {
          await square.cancelSubscription(existingSquareSubId);
        } catch (e) {
          stderr.writeln('[checkout] cancel old subscription error (ignored): $e');
        }
      }

      // Step 3 — create the new Square subscription.
      subscription = await square.createSubscription(
        planVariationId: planVariationId,
        customerId:      squareCustomerId,
        cardId:          cardId,
        locationId:      square.locationId,
      );
    } on SquareException catch (e) {
      return jsonError(402, 'PAYMENT_FAILED', e.detail);
    }

    // Step 4 — update DB subscription row.
    final periodStart = DateTime.now().toUtc();
    final periodEnd   = DateTime(
      periodStart.year,
      periodStart.month + 1,
      periodStart.day,
    ).toUtc();

    final updated = await repo.updatePlan(
      companyId:            auth.companyId,
      plan:                 plan,
      squareSubscriptionId: subscription.id,
      currentPeriodStart:   periodStart,
      currentPeriodEnd:     periodEnd,
    );

    // Record an invoice row for audit trail.
    await db.query(
      '''
      INSERT INTO subscription_invoices
        (company_id, plan, amount_cents, square_payment_id, status)
      VALUES
        (@cid, @plan, @amount, @sqid, 'paid')
      ''',
      parameters: {
        'cid':    auth.companyId,
        'plan':   plan,
        'amount': _fallbackPrices[plan],
        'sqid':   subscription.id,
      },
    );

    return Response.json(
      body: {
        'subscription': updated?.toJson(),
        'invoice': {
          'plan':         plan,
          'amount_cents': _fallbackPrices[plan],
          'status':       'paid',
        },
      },
    );
  }

  // ── Path B: fallback one-time charge (local sandbox / no plan variation IDs) ─
  try {
    final amountCents = _fallbackPrices[plan]!;
    final payment = await square.createPayment(
      sourceId:      sourceId,
      amountCents:   amountCents,
      note:          'GuildMark $planLabel subscription',
      referenceId:   auth.companyId,
      customerId:    squareCustomerId,
      saveCard:      true,
      cardholderName: cardholderName,
      billingAddress: billing,
    );

    final periodStart = DateTime.now().toUtc();
    final periodEnd   = DateTime(
      periodStart.year,
      periodStart.month + 1,
      periodStart.day,
    ).toUtc();

    final updated = await repo.updatePlan(
      companyId:          auth.companyId,
      plan:               plan,
      currentPeriodStart: periodStart,
      currentPeriodEnd:   periodEnd,
    );

    await db.query(
      '''
      INSERT INTO subscription_invoices
        (company_id, plan, amount_cents, square_payment_id, status)
      VALUES
        (@cid, @plan, @amount, @sqid, 'paid')
      ''',
      parameters: {
        'cid':    auth.companyId,
        'plan':   plan,
        'amount': payment.amountCents,
        'sqid':   payment.id,
      },
    );

    return Response.json(
      body: {
        'subscription': updated?.toJson(),
        'invoice': {
          'plan':         plan,
          'amount_cents': payment.amountCents,
          'status':       'paid',
        },
      },
    );
  } on SquareException catch (e) {
    return jsonError(402, 'PAYMENT_FAILED', e.detail);
  }
}