/// POST /marketplace/listings/:id/buy
///
/// "Buy Now" — atomically creates an accepted offer at the listed price,
/// charges the buyer fee via Square, creates the order, and opens escrow.
///
/// Body:
///   source_id      string  — Square Web Payments nonce (cnon:...)
///   quantity       int?    — defaults to listing quantity
///   payment_terms  string? — "immediate" | "net_30" | "net_60"
///
/// Returns: the created Order.

import 'dart:async';

import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';
import '../../../../lib/models/json_helpers.dart';
import '../../../../lib/repos/order_repo.dart';
import '../../../../lib/repos/subscription_repo.dart';
import '../../../../lib/services/email_service.dart';
import '../../../../lib/services/escrow_service.dart';
import '../../../../lib/services/square_service.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body = await context.request.json() as Map<String, dynamic>?;
  final sourceId     = (body?['source_id'] as String?)?.trim();
  final paymentTerms = (body?['payment_terms'] as String?) ?? 'immediate';

  if (sourceId == null || sourceId.isEmpty) {
    return badRequest('source_id (Square payment nonce) is required');
  }

  const validTerms = {'immediate', 'net_30', 'net_60'};
  if (!validTerms.contains(paymentTerms)) {
    return badRequest('payment_terms must be one of: immediate, net_30, net_60');
  }

  final db     = context.read<Db>();
  final square = context.read<SquareService?>()!;
  final escrow = context.read<EscrowService>();
  final email  = context.read<EmailService>();

  // ── 1. Fetch listing + validate ──────────────────────────────────────────
  final listingRows = await db.query(
    '''
    SELECT l.id, l.company_id AS seller_company_id, l.listed_price,
           l.buyer_ask_price, l.status,
           a.quantity, a.model_name,
           c.name AS seller_company_name,
           u.email AS seller_email
    FROM listings l
    JOIN assets a    ON a.id = l.asset_id
    JOIN companies c ON c.id = l.company_id
    LEFT JOIN users u ON u.company_id = l.company_id AND u.role = \'admin\'
    WHERE l.id = @id AND l.status = \'active\'
    LIMIT 1
    ''',
    parameters: {'id': id},
  );

  if (listingRows.isEmpty) {
    return notFound('Listing not found or no longer active');
  }

  final listing          = listingRows.first.toColumnMap();
  final sellerCompanyId  = listing['seller_company_id'].toString();
  final productName      = listing['model_name']?.toString() ?? 'IT Asset';
  final sellerEmail      = listing['seller_email']?.toString();

  // Prevent buying your own listing.
  if (sellerCompanyId == auth.companyId) {
    return jsonError(422, 'SELF_PURCHASE', 'You cannot purchase your own listing');
  }

  final listedPrice = numToDoubleOrNull(listing['listed_price'])
                   ?? numToDoubleOrNull(listing['buyer_ask_price'])
                   ?? 0.0;
  if (listedPrice <= 0) {
    return jsonError(422, 'NO_PRICE', 'This listing has no active price');
  }

  final quantity = numToIntOrNull(body?['quantity'])
                ?? numToIntOrNull(listing['quantity'])
                ?? 1;

  final amount = listedPrice * quantity;

  // ── 2. Determine fee rates ────────────────────────────────────────────────
  final subRepo      = SubscriptionRepo(db);
  final sellerSub    = await subRepo.findByCompany(sellerCompanyId);
  final sFeePct      = sellerFeePct(sellerSub?.plan ?? 'free');
  const bFeePct      = kBuyerFeePct;
  final dFeePct      = paymentTerms != 'immediate' ? kDeferralFeePct : 0.0;

  final buyerFee  = double.parse((amount * bFeePct).toStringAsFixed(2));
  final deferralF = double.parse((amount * dFeePct).toStringAsFixed(2));
  final totalCharge = double.parse((amount + buyerFee + deferralF).toStringAsFixed(2));
  final chargeCents = (totalCharge * 100).round();

  // ── 3. Charge buyer fee via Square ────────────────────────────────────────
  // We charge the buyer their portion (amount + buyer_fee + deferral_fee).
  // The seller's net (amount - seller_fee) flows through escrow separately.
  final SquarePaymentResult squarePayment;
  try {
    squarePayment = await square.createPayment(
      sourceId:    sourceId,
      amountCents: chargeCents,
      note:        'GuildMark order: $productName (×$quantity)',
      referenceId: 'listing-$id',
    );
  } on SquareException catch (e) {
    return jsonError(502, 'PAYMENT_FAILED', e.detail);
  }

  // ── 4. Create offer + order atomically ───────────────────────────────────
  final Order order;
  try {
    order = await _buyNow(
      db:             db,
      listingId:      id,
      buyerCompanyId: auth.companyId,
      listedPrice:    listedPrice,
      quantity:       quantity,
      sFeePct:        sFeePct,
      bFeePct:        bFeePct,
      paymentTerms:   paymentTerms,
      dFeePct:        dFeePct,
      squarePaymentId: squarePayment.id,
    );
  } catch (e) {
    // If order creation fails after the Square charge, log for manual reconciliation.
    // In production, this should trigger a Square refund.
    return jsonError(500, 'ORDER_FAILED',
      'Payment captured but order creation failed. '
      'Square payment ID: ${squarePayment.id}. '
      'Contact support@guildmark.co.');
  }

  // ── 5. Open escrow (fire-and-forget) ─────────────────────────────────────
  unawaited(Future(() async {
    try {
      final buyerEmailRows = await db.query(
        "SELECT email FROM users WHERE company_id = @cid AND role = 'admin' LIMIT 1",
        parameters: {'cid': auth.companyId},
      );
      final buyerEmail = buyerEmailRows.isEmpty
          ? null
          : buyerEmailRows.first.toColumnMap()['email']?.toString();

      if (escrow.isConfigured && sellerEmail != null && buyerEmail != null) {
        final tx = await escrow.createTransaction(
          buyerEmail:  buyerEmail,
          sellerEmail: sellerEmail,
          amount:      order.escrowAmount,
          description: '$productName — Order ${order.id}',
        );
        if (tx != null) {
          await OrderRepo(db).setEscrow(
            id:                  order.id,
            escrowTransactionId: tx.id,
            escrowStatus:        tx.status,
            escrowPaymentUrl:    tx.paymentUrl,
          );
          if (buyerEmail != null) {
            unawaited(email.sendOrderEscrowCreated(
              toEmail:     buyerEmail,
              productName: productName,
              amount:      order.escrowAmount,
              paymentUrl:  tx.paymentUrl ?? '',
            ));
          }
        }
      }
    } catch (_) {}
  }));

  return Response.json(statusCode: 201, body: order.toJson());
}

/// Atomically creates an already-accepted offer and the order in one
/// transaction so neither can exist without the other.
Future<Order> _buyNow({
  required Db db,
  required String listingId,
  required String buyerCompanyId,
  required double listedPrice,
  required int quantity,
  required double sFeePct,
  required double bFeePct,
  required String paymentTerms,
  required double dFeePct,
  required String squarePaymentId,
}) async {
  return db.tx<Order>((tx) async {
    // Lock listing row to prevent race conditions.
    final listingCheck = await tx.execute(
      Sql.named("SELECT id FROM listings WHERE id = @id AND status = 'active' FOR UPDATE"),
      parameters: {'id': listingId},
    );
    if (listingCheck.isEmpty) {
      throw StateError('Listing $listingId is no longer active');
    }

    // Get seller company_id from listing
    final sellerRow = await tx.execute(
      Sql.named('SELECT company_id FROM listings WHERE id = @id'),
      parameters: {'id': listingId},
    );
    final sellerCompanyId = sellerRow.first.toColumnMap()['company_id'].toString();

    // Insert offer at listed price, status = 'accepted'
    final offerResult = await tx.execute(
      Sql.named('''
        INSERT INTO buyer_offers
          (listing_id, buyer_company_id, offer_price, quantity, status,
           expires_at)
        VALUES
          (@lid, @buyer, @price, @qty, \'accepted\',
           now() + INTERVAL \'30 days\')
        RETURNING id
      '''),
      parameters: {
        'lid':   listingId,
        'buyer': buyerCompanyId,
        'price': listedPrice,
        'qty':   quantity,
      },
    );
    final offerId = offerResult.first.toColumnMap()['id'].toString();

    // Calculate fee snapshot.
    final amount      = listedPrice * quantity;
    final sellerFee   = double.parse((amount * sFeePct).toStringAsFixed(2));
    final buyerFee    = double.parse((amount * bFeePct).toStringAsFixed(2));
    final platformFee = double.parse((sellerFee + buyerFee).toStringAsFixed(2));
    final escrowAmt   = double.parse((amount - sellerFee).toStringAsFixed(2));
    final deferralFee = double.parse((amount * dFeePct).toStringAsFixed(2));

    DateTime? paymentDueAt;
    if (paymentTerms == 'net_30') {
      paymentDueAt = DateTime.now().toUtc().add(const Duration(days: 30));
    } else if (paymentTerms == 'net_60') {
      paymentDueAt = DateTime.now().toUtc().add(const Duration(days: 60));
    }

    // Create order row.
    final orderResult = await tx.execute(
      Sql.named('''
        INSERT INTO orders (
          offer_id, seller_company_id, buyer_company_id, amount, quantity,
          seller_fee_pct, seller_fee, buyer_fee_pct, buyer_fee,
          platform_fee, escrow_amount,
          payment_terms, deferral_fee_pct, deferral_fee, payment_due_at,
          status
        ) VALUES (
          @oid, @seller, @buyer, @amount, @qty,
          @sfeepct, @sfee, @bfeepct, @bfee,
          @pfee, @escrowamt,
          @pterms, @dfeepct, @dfee, @pdue,
          \'funded\'
        )
        RETURNING id
      '''),
      parameters: {
        'oid':      offerId,
        'seller':   sellerCompanyId,
        'buyer':    buyerCompanyId,
        'amount':   amount,
        'qty':      quantity,
        'sfeepct':  sFeePct,
        'sfee':     sellerFee,
        'bfeepct':  bFeePct,
        'bfee':     buyerFee,
        'pfee':     platformFee,
        'escrowamt': escrowAmt,
        'pterms':   paymentTerms,
        'dfeepct':  dFeePct,
        'dfee':     deferralFee,
        'pdue':     paymentDueAt,
      },
    );

    final orderId = orderResult.first.toColumnMap()['id'].toString();
    final order   = await OrderRepo(db).findById(orderId);
    return order!;
  });
}
