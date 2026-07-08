import 'dart:async';

import 'package:dart_appwrite/dart_appwrite.dart'
    show AppwriteException, ID, Query, TablesDB;
import 'package:dart_appwrite/models.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/config_repo.dart';
import 'package:guildmark_api/repos/appwrite/order_repo.dart';
import 'package:guildmark_api/repos/appwrite/subscription_repo.dart';
import 'package:guildmark_api/services/email_service.dart';
import 'package:guildmark_api/services/escrow_service.dart';
import 'package:guildmark_api/services/square_service.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body = await context.request.json() as Map<String, dynamic>?;
  final sourceId = (body?['source_id'] as String?)?.trim();
  final paymentTerms = (body?['payment_terms'] as String?) ?? 'immediate';

  if (sourceId == null || sourceId.isEmpty) {
    return badRequest('source_id (Square payment nonce) is required');
  }

  const validTerms = {'immediate', 'net_30', 'net_60'};
  if (!validTerms.contains(paymentTerms)) {
    return badRequest(
      'payment_terms must be one of: immediate, net_30, net_60',
    );
  }

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;
  final square = context.read<SquareService?>()!;
  final escrow = context.read<EscrowService>();
  final email = context.read<EmailService>();

  // ── 1. Fetch listing + validate (was a 4-table JOIN; now stitched) ───────
  final Row listingRow;
  try {
    listingRow = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      rowId: id,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) {
      return notFound('Listing not found or no longer active');
    }
    rethrow;
  }
  if (listingRow.data['status'] != 'active') {
    return notFound('Listing not found or no longer active');
  }

  final sellerCompanyId = listingRow.data['company_id'] as String;

  // Prevent buying your own listing.
  if (sellerCompanyId == auth.companyId) {
    return jsonError(
      422,
      'SELF_PURCHASE',
      'You cannot purchase your own listing',
    );
  }

  // Stitch the asset (quantity, product name).
  Row? assetRow;
  try {
    assetRow = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.assets,
      rowId: listingRow.data['asset_id'] as String,
    );
  } on AppwriteException catch (e) {
    if (e.code != 404) rethrow;
  }
  final productName =
      assetRow?.data['model_name'] as String? ?? 'IT Asset';

  // Seller admin email (was LEFT JOIN users … role = 'admin').
  final sellerAdmins = await db.listRows(
    databaseId: Aw.databaseId,
    tableId: Aw.users,
    queries: [
      Query.equal('company_id', sellerCompanyId),
      Query.equal('role', 'admin'),
      Query.limit(1),
    ],
  );
  final sellerEmail = sellerAdmins.rows.isEmpty
      ? null
      : sellerAdmins.rows.first.data['email'] as String?;

  final listedCents =
      (listingRow.data['listed_price_cents'] as num?)?.toInt() ??
      (listingRow.data['buyer_ask_price_cents'] as num?)?.toInt() ??
      0;
  if (listedCents <= 0) {
    return jsonError(422, 'NO_PRICE', 'This listing has no active price');
  }
  final listedPrice = listedCents / 100;

  final quantity =
      (body?['quantity'] as num?)?.toInt() ??
      (assetRow?.data['quantity'] as num?)?.toInt() ??
      1;

  final amount = listedPrice * quantity;
  final amountCents = listedCents * quantity;

  // ── 2. Determine fee rates (from platform_config, snapshotted onto the
  //       order) and enforce the payment-terms feature flag ─────────────────
  final cfg = await ConfigRepo(aw).get();

  // Net 30/60 is feature-flagged off until financing partners are in place.
  // Server-side check — must happen before the Square charge below.
  if (paymentTerms != 'immediate' && !cfg.paymentTermsEnabled) {
    return jsonError(
      403,
      'PAYMENT_TERMS_DISABLED',
      'Deferred payment terms are not currently available. '
          'Use immediate payment.',
    );
  }

  final sellerSub = await SubscriptionRepo(aw).findByCompany(sellerCompanyId);
  final sFeePct = cfg.sellerFeeForPlan(sellerSub?.plan ?? 'free');
  final bFeePct = cfg.buyerFee;
  final dFeePct = paymentTerms != 'immediate' ? cfg.deferralFee : 0.0;

  final buyerFee = double.parse((amount * bFeePct).toStringAsFixed(2));
  final deferralF = double.parse((amount * dFeePct).toStringAsFixed(2));
  final totalCharge = double.parse(
    (amount + buyerFee + deferralF).toStringAsFixed(2),
  );
  final chargeCents = (totalCharge * 100).round();

  // ── 3. Charge buyer fee via Square ────────────────────────────────────────
  // We charge the buyer their portion (amount + buyer_fee + deferral_fee).
  // The seller's net (amount - seller_fee) flows through escrow separately.
  final SquarePaymentResult squarePayment;
  try {
    squarePayment = await square.createPayment(
      sourceId: sourceId,
      amountCents: chargeCents,
      note: 'GuildMark order: $productName (×$quantity)',
      referenceId: 'listing-$id',
    );
  } on SquareException catch (e) {
    return jsonError(502, 'PAYMENT_FAILED', e.detail);
  }

  // ── 4. Create offer + order (saga — no transactions in Appwrite) ─────────
  // Order of writes: offer first, order last (the order row is the commit
  // point — its unique offer_id index also dedupes double-submits). If the
  // order write fails, the offer is compensated with a best-effort delete.
  // There is no listing row-lock: two concurrent buyers can both pass the
  // 'active' check; the second order still succeeds against a different
  // offer. Listing status is flipped by the seller flow on completion —
  // pre-launch volume makes this race acceptable; revisit with a
  // status-guarded update if needed.
  final Order order;
  try {
    order = await _buyNow(
      db: db,
      aw: aw,
      listingId: id,
      sellerCompanyId: sellerCompanyId,
      buyerCompanyId: auth.companyId,
      listedCents: listedCents,
      amountCents: amountCents,
      quantity: quantity,
      sFeePct: sFeePct,
      bFeePct: bFeePct,
      paymentTerms: paymentTerms,
      dFeePct: dFeePct,
    );
  } catch (e) {
    // If order creation fails after the Square charge, log for manual
    // reconciliation. In production, this should trigger a Square refund.
    return jsonError(
      500,
      'ORDER_FAILED',
      'Payment captured but order creation failed. '
          'Square payment ID: ${squarePayment.id}. '
          'Contact support@guildmark.co.',
    );
  }

  // ── 5. Open escrow (fire-and-forget) ─────────────────────────────────────
  unawaited(
    Future(() async {
      try {
        final buyerAdmins = await db.listRows(
          databaseId: Aw.databaseId,
          tableId: Aw.users,
          queries: [
            Query.equal('company_id', auth.companyId),
            Query.equal('role', 'admin'),
            Query.limit(1),
          ],
        );
        final buyerEmail = buyerAdmins.rows.isEmpty
            ? null
            : buyerAdmins.rows.first.data['email'] as String?;

        if (escrow.isConfigured && sellerEmail != null && buyerEmail != null) {
          final tx = await escrow.createTransaction(
            buyerEmail: buyerEmail,
            sellerEmail: sellerEmail,
            amount: order.escrowAmount,
            description: '$productName — Order ${order.id}',
          );
          if (tx != null) {
            await OrderRepo(aw).setEscrow(
              id: order.id,
              escrowTransactionId: tx.id,
              escrowStatus: tx.status,
              escrowPaymentUrl: tx.paymentUrl,
            );
            unawaited(
              email.sendOrderEscrowCreated(
                toEmail: buyerEmail,
                productName: productName,
                amount: order.escrowAmount,
                paymentUrl: tx.paymentUrl ?? '',
              ),
            );
          }
        }
      } catch (_) {}
    }),
  );

  return Response.json(statusCode: 201, body: order.toJson());
}

Future<Order> _buyNow({
  required TablesDB db,
  required AppwriteService aw,
  required String listingId,
  required String sellerCompanyId,
  required String buyerCompanyId,
  required int listedCents,
  required int amountCents,
  required int quantity,
  required double sFeePct,
  required double bFeePct,
  required String paymentTerms,
  required double dFeePct,
}) async {
  // Re-check the listing is still active as late as possible (replaces the
  // SELECT … FOR UPDATE row lock; see race note at the call site).
  final listing = await db.getRow(
    databaseId: Aw.databaseId,
    tableId: Aw.listings,
    rowId: listingId,
  );
  if (listing.data['status'] != 'active') {
    throw StateError('Listing $listingId is no longer active');
  }

  // Step 1 — offer at listed price, pre-accepted (buy-now).
  final offer = await db.createRow(
    databaseId: Aw.databaseId,
    tableId: Aw.buyerOffers,
    rowId: ID.unique(),
    data: {
      'listing_id': listingId,
      'buyer_company_id': buyerCompanyId,
      'offer_price_cents': listedCents,
      'quantity': quantity,
      'status': 'accepted',
      'expires_at': DateTime.now()
          .toUtc()
          .add(const Duration(days: 30))
          .toIso8601String(),
    },
  );

  // Fee snapshot (same rounding as the PG version: dollars to 2dp → cents).
  final amount = amountCents / 100;
  final sellerFee = double.parse((amount * sFeePct).toStringAsFixed(2));
  final buyerFee = double.parse((amount * bFeePct).toStringAsFixed(2));
  final platformFee = double.parse((sellerFee + buyerFee).toStringAsFixed(2));
  final escrowAmt = double.parse((amount - sellerFee).toStringAsFixed(2));
  final deferralFee = double.parse((amount * dFeePct).toStringAsFixed(2));

  DateTime? paymentDueAt;
  if (paymentTerms == 'net_30') {
    paymentDueAt = DateTime.now().toUtc().add(const Duration(days: 30));
  } else if (paymentTerms == 'net_60') {
    paymentDueAt = DateTime.now().toUtc().add(const Duration(days: 60));
  }

  // Step 2 — the order row: commit point. Square already captured payment,
  // so the order is born 'funded'.
  final Row orderRow;
  try {
    orderRow = await db.createRow(
      databaseId: Aw.databaseId,
      tableId: Aw.orders,
      rowId: ID.unique(),
      data: {
        'offer_id': offer.$id,
        'seller_company_id': sellerCompanyId,
        'buyer_company_id': buyerCompanyId,
        'amount_cents': amountCents,
        'quantity': quantity,
        'seller_fee_pct': sFeePct,
        'seller_fee_cents': (sellerFee * 100).round(),
        'buyer_fee_pct': bFeePct,
        'buyer_fee_cents': (buyerFee * 100).round(),
        'platform_fee_cents': (platformFee * 100).round(),
        'escrow_amount_cents': (escrowAmt * 100).round(),
        'payment_terms': paymentTerms,
        'deferral_fee_pct': dFeePct,
        'deferral_fee_cents': (deferralFee * 100).round(),
        if (paymentDueAt != null)
          'payment_due_at': paymentDueAt.toIso8601String(),
        'status': 'funded',
      },
    );
  } catch (e) {
    // Compensation: unwind the offer so a retry starts clean.
    try {
      await db.deleteRow(
        databaseId: Aw.databaseId,
        tableId: Aw.buyerOffers,
        rowId: offer.$id,
      );
    } catch (_) {}
    rethrow;
  }

  final order = await OrderRepo(aw).findById(orderRow.$id);
  return order!;
}
