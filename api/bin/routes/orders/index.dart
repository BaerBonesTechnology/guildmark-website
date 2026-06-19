import 'dart:async';

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/order_repo.dart';
import 'package:guildmark_api/repos/subscription_repo.dart';
import 'package:guildmark_api/services/email_service.dart';
import 'package:guildmark_api/services/escrow_service.dart';

Future<Response> onRequest(RequestContext context) async {
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  return switch (context.request.method) {
    HttpMethod.get => _list(context, auth),
    HttpMethod.post => _create(context, auth),
    _ => jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only'),
  };
}

// ---------------------------------------------------------------------------
// GET /orders
// ---------------------------------------------------------------------------

Future<Response> _list(RequestContext context, AuthPrincipal auth) async {
  final repo = OrderRepo(context.read<Db>());
  final orders = await repo.findByCompany(auth.companyId);
  final stats = await repo.statsForCompany(auth.companyId);

  return Response.json(
    body: {
      'orders': orders.map((o) => o.toJson()).toList(),
      'stats': stats.toJson(),
    },
  );
}

// ---------------------------------------------------------------------------
// POST /orders  { offer_id }
// ---------------------------------------------------------------------------

Future<Response> _create(RequestContext context, AuthPrincipal auth) async {
  final body = await context.request.json() as Map<String, dynamic>?;
  final offerId = (body?['offer_id'] as String?)?.trim();

  if (offerId == null || offerId.isEmpty) {
    return badRequest('offer_id is required');
  }

  final db = context.read<Db>();
  final repo = OrderRepo(db);
  final escrow = context.read<EscrowService>();
  final email = context.read<EmailService>();

  // 1 — Resolve seller's subscription plan to determine fee rates.
  final subRepo = SubscriptionRepo(db);
  final subscription = await subRepo.findByCompany(auth.companyId);
  final sFeePct = sellerFeePct(subscription?.plan ?? 'free');
  const bFeePct = kBuyerFeePct;

  // Optional: buyer can select Net 30/60 payment terms.
  final paymentTerms = (body?['payment_terms'] as String? ?? 'immediate');
  final validTerms = {'immediate', 'net_30', 'net_60'};
  if (!validTerms.contains(paymentTerms)) {
    return badRequest(
      'payment_terms must be one of: immediate, net_30, net_60',
    );
  }
  final dFeePct = paymentTerms != 'immediate' ? kDeferralFeePct : 0.0;

  // 2 — Create the order row (validates offer is accepted & belongs to caller).
  final Order order;
  try {
    order = await repo.create(
      offerId: offerId,
      callerCompanyId: auth.companyId,
      sellerFeePct: sFeePct,
      buyerFeePct: bFeePct,
      paymentTerms: paymentTerms,
      deferralFeePct: dFeePct,
    );
  } on StateError catch (e) {
    return jsonError(422, 'ORDER_CONFLICT', e.message);
  }

  // 3 — Open an Escrow.com transaction for the seller's net amount.
  //     The platform fee (seller_fee + buyer_fee) is collected separately;
  //     escrow only holds what the seller will receive on completion.
  if (escrow.isConfigured &&
      order.sellerEmail != null &&
      order.buyerEmail != null) {
    final tx = await escrow.createTransaction(
      buyerEmail: order.buyerEmail!,
      sellerEmail: order.sellerEmail!,
      amount: order.escrowAmount,
      description: order.productName ?? 'IT Asset — Order ${order.id}',
    );

    if (tx != null) {
      await repo.setEscrow(
        id: order.id,
        escrowTransactionId: tx.id,
        escrowStatus: tx.status,
        escrowPaymentUrl: tx.paymentUrl,
      );

      // Notify buyer with escrow funding link.
      if (order.buyerEmail != null) {
        unawaited(
          email.sendOrderEscrowCreated(
            toEmail: order.buyerEmail!,
            productName: order.productName ?? 'IT Asset',
            amount: order.escrowAmount,
            paymentUrl: tx.paymentUrl ?? '',
          ),
        );
      }
    }
  }

  // Return the freshest view of the order.
  final fresh = await repo.findById(order.id, viewerCompanyId: auth.companyId);
  return Response.json(
    statusCode: 201,
    body: fresh?.toJson() ?? order.toJson(),
  );
}
