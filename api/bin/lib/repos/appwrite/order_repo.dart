/// Appwrite implementation of OrderRepo (see ../../../POSTGRES_TO_APPWRITE.md).
///
/// The public interface is IDENTICAL to the Postgres OrderRepo so the routes
/// that consume it don't change; only the constructor dependency
/// (AppwriteService instead of Db) and the bodies differ.
///
/// Postgres → Appwrite mapping notes:
///   - §1a saga: the PG `create()` transaction becomes validate-reads followed
///     by ONE `createRow` — the fee snapshot is embedded in the orders row
///     (order_fees was folded in), so the single row write is the atomic
///     commit point and no compensation delete is needed. The unique index on
///     `offer_id` rejects a racing duplicate (409).
///   - §1b joins: the SELECT joins (offer → listing → asset, companies,
///     lateral users-for-email) become id fetches stitched in Dart.
///   - Money: integer cents in Appwrite (`amount_cents`, `seller_fee_cents`,
///     …); the public model keeps double dollars — converted at the boundary.
///   - SUM/COUNT stats: page rows (cursor pagination, 100/page) and reduce in
///     Dart.
library;

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class Order {
  Order({
    required this.id,
    required this.offerId,
    required this.sellerCompanyId,
    required this.buyerCompanyId,
    required this.amount,
    required this.quantity,
    required this.status,
    required this.carrier,
    required this.createdAt,
    required this.updatedAt,
    required this.sellerFeePct,
    required this.sellerFee,
    required this.buyerFeePct,
    required this.buyerFee,
    required this.platformFee,
    required this.escrowAmount,
    required this.paymentTerms,
    required this.deferralFeePct,
    required this.deferralFee,
    this.paymentDueAt,
    this.escrowTransactionId,
    this.escrowStatus,
    this.escrowPaymentUrl,
    this.trackingNumber,
    this.shippedAt,
    this.deliveredAt,
    this.inspectionEndsAt,
    this.completedAt,
    // Joined / derived fields
    this.productName,
    this.sellerCompanyName,
    this.buyerCompanyName,
    this.sellerEmail,
    this.buyerEmail,
    this.viewerType,
  });

  final String id;
  final String offerId;
  final String sellerCompanyId;
  final String buyerCompanyId;
  final double amount;
  final int quantity;
  final String status; // order_status enum value
  final String carrier;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Fee snapshot — locked at order creation from seller's subscription plan.
  final double sellerFeePct; // e.g. 0.0800
  final double sellerFee; // amount * sellerFeePct
  final double buyerFeePct; // always 0.0300
  final double buyerFee; // amount * buyerFeePct
  final double platformFee; // sellerFee + buyerFee
  final double escrowAmount; // amount - sellerFee (seller's net)

  // Payment terms
  final String paymentTerms; // immediate | net_30 | net_60
  final double deferralFeePct; // 0.013 if deferred, else 0
  final double deferralFee; // amount * deferralFeePct
  final DateTime? paymentDueAt;

  // Escrow.com
  final String? escrowTransactionId;
  final String? escrowStatus;
  final String? escrowPaymentUrl;

  // Shipping
  final String? trackingNumber;
  final DateTime? shippedAt;
  final DateTime? deliveredAt;
  final DateTime? inspectionEndsAt;
  final DateTime? completedAt;

  // Stitched (was joined in SQL)
  final String? productName;
  final String? sellerCompanyName;
  final String? buyerCompanyName;
  final String? sellerEmail; // admin email, used when creating escrow
  final String? buyerEmail; // admin email, used when creating escrow

  // Set per-viewer at query time so the front-end knows sale vs purchase.
  final String? viewerType; // "sale" | "purchase"

  /// Build from an Appwrite row plus the stitched lookups that replaced the
  /// SQL joins (§1b). `$id`/`$createdAt`/`$updatedAt` are system fields.
  factory Order.fromRow(
    Row row, {
    String? viewerCompanyId,
    String? productName,
    String? sellerCompanyName,
    String? buyerCompanyName,
    String? sellerEmail,
    String? buyerEmail,
  }) {
    final d = row.data;

    double cents(String key) => ((d[key] as num?) ?? 0) / 100.0;
    double pct(String key, double fallback) =>
        (d[key] as num?)?.toDouble() ?? fallback;
    DateTime? dt(String key) {
      final v = d[key] as String?;
      return v == null ? null : DateTime.parse(v);
    }

    final sellerCompanyId = d['seller_company_id'] as String;
    String? viewerType;
    if (viewerCompanyId != null) {
      viewerType = viewerCompanyId == sellerCompanyId ? 'sale' : 'purchase';
    }

    return Order(
      id: row.$id,
      offerId: d['offer_id'] as String,
      sellerCompanyId: sellerCompanyId,
      buyerCompanyId: d['buyer_company_id'] as String,
      amount: cents('amount_cents'),
      quantity: (d['quantity'] as num?)?.toInt() ?? 1,
      status: d['status'] as String,
      carrier: d['carrier'] as String? ?? 'fedex',
      createdAt: DateTime.parse(row.$createdAt),
      updatedAt: DateTime.parse(row.$updatedAt),
      // Fee snapshot
      sellerFeePct: pct('seller_fee_pct', 0.08),
      sellerFee: cents('seller_fee_cents'),
      buyerFeePct: pct('buyer_fee_pct', 0.03),
      buyerFee: cents('buyer_fee_cents'),
      platformFee: cents('platform_fee_cents'),
      escrowAmount: cents('escrow_amount_cents'),
      // Payment terms
      paymentTerms: d['payment_terms'] as String? ?? 'immediate',
      deferralFeePct: pct('deferral_fee_pct', 0),
      deferralFee: cents('deferral_fee_cents'),
      paymentDueAt: dt('payment_due_at'),
      // Escrow
      escrowTransactionId: d['escrow_transaction_id'] as String?,
      escrowStatus: d['escrow_status'] as String?,
      escrowPaymentUrl: d['escrow_payment_url'] as String?,
      // Shipping
      trackingNumber: d['tracking_number'] as String?,
      shippedAt: dt('shipped_at'),
      deliveredAt: dt('delivered_at'),
      inspectionEndsAt: dt('inspection_ends_at'),
      completedAt: dt('completed_at'),
      // Stitched
      productName: productName,
      sellerCompanyName: sellerCompanyName,
      buyerCompanyName: buyerCompanyName,
      sellerEmail: sellerEmail,
      buyerEmail: buyerEmail,
      viewerType: viewerType,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        // Map to the front-end Order shape (types.ts)
        'transactionId': escrowTransactionId ?? id,
        'type': viewerType ?? 'sale',
        'productName': productName ?? 'Unknown',
        'specs': null,
        'quantity': quantity,
        'totalValue': amount,
        'status': _frontendStatus(status),
        'counterparty': viewerType == 'sale'
            ? (buyerCompanyName ?? buyerCompanyId)
            : (sellerCompanyName ?? sellerCompanyId),
        'destination': null,
        'carrier': carrier,
        'trackingNumber': trackingNumber,
        'createdAt': createdAt.toIso8601String(),
        // Fee breakdown
        'sellerFeePct': sellerFeePct,
        'sellerFee': sellerFee,
        'buyerFeePct': buyerFeePct,
        'buyerFee': buyerFee,
        'platformFee': platformFee,
        'escrowAmount': escrowAmount,
        // Payment terms
        'paymentTerms': paymentTerms,
        'deferralFeePct': deferralFeePct,
        'deferralFee': deferralFee,
        'paymentDueAt': paymentDueAt?.toIso8601String(),
        // Extended escrow / tracking fields
        'escrowTransactionId': escrowTransactionId,
        'escrowPaymentUrl': escrowPaymentUrl,
        'escrowStatus': escrowStatus,
        'deliveredAt': deliveredAt?.toIso8601String(),
        'inspectionEndsAt': inspectionEndsAt?.toIso8601String(),
        'completedAt': completedAt?.toIso8601String(),
        'shippedAt': shippedAt?.toIso8601String(),
        'orderStatus': status, // raw DB status for detailed UI
      };

  /// Maps internal order_status values to the OrderStatus union in types.ts.
  static String _frontendStatus(String s) => switch (s) {
        'awaiting_payment' => 'processing',
        'funded' => 'processing',
        'shipped' => 'in_transit',
        'delivered' => 'delivered',
        'inspecting' => 'delivered',
        'complete' => 'delivered',
        'disputed' => 'processing',
        'cancelled' => 'cancelled',
        _ => 'processing',
      };
}

// ---------------------------------------------------------------------------
// Stats helper (returned alongside the list)
// ---------------------------------------------------------------------------

class OrderStats {
  OrderStats({
    required this.totalOrders,
    required this.activeOrders,
    required this.totalValue,
    required this.monthValue,
  });

  final int totalOrders;
  final int activeOrders;
  final double totalValue;
  final double monthValue;

  Map<String, dynamic> toJson() => {
        'totalOrders': totalOrders,
        'activeOrders': activeOrders,
        'totalValue': totalValue,
        'monthValue': monthValue,
      };
}

// ---------------------------------------------------------------------------
// Stitched join data (replaces _orderCols / _orderJoins)
// ---------------------------------------------------------------------------

/// The per-order fields that SQL joins used to provide.
class _Stitched {
  _Stitched({
    this.productName,
    this.sellerCompanyName,
    this.buyerCompanyName,
    this.sellerEmail,
    this.buyerEmail,
  });

  final String? productName;
  final String? sellerCompanyName;
  final String? buyerCompanyName;
  final String? sellerEmail;
  final String? buyerEmail;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

class OrderRepo {
  OrderRepo(this._aw);
  final AppwriteService _aw;

  TablesDB get _db => _aw.tablesDB;

  static const _pageSize = 100;

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  /// Creates an order from an accepted buyer offer.
  ///
  /// Validates that:
  /// - The offer exists and has status 'accepted'.
  /// - No order already exists for this offer.
  ///
  /// Throws [StateError] on validation failure.
  ///
  /// §1a saga: steps run in dependency order —
  ///   (1) read + validate the offer and its listing (no writes),
  ///   (2) idempotency pre-check (no order for this offer yet),
  ///   (3) ONE createRow with the fee snapshot embedded — this is the atomic
  ///       commit point, so there is nothing to compensate on failure.
  /// A racing duplicate loses to the unique index on offer_id (409) and is
  /// translated to the same StateError the Postgres version threw.
  Future<Order> create({
    required String offerId,
    required String callerCompanyId, // must be the seller
    required double sellerFeePct,
    required double buyerFeePct,
    String paymentTerms = 'immediate',
    double deferralFeePct = 0.0,
  }) async {
    // (1) Fetch the offer and verify it's accepted & belongs to caller.
    // (No row lock exists in Appwrite; the unique index is the backstop.)
    final Row offer;
    try {
      offer = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.buyerOffers,
        rowId: offerId,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) {
        throw StateError('Offer $offerId not found or not in accepted status');
      }
      rethrow;
    }
    if (offer.data['status'] != 'accepted') {
      throw StateError('Offer $offerId not found or not in accepted status');
    }

    // Stitch: the PG version joined listings for the seller company.
    final Row listing;
    try {
      listing = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.listings,
        rowId: offer.data['listing_id'] as String,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) {
        // A dangling listing FK made the PG join come back empty.
        throw StateError('Offer $offerId not found or not in accepted status');
      }
      rethrow;
    }
    final sellerCompanyId = listing.data['company_id'] as String;
    if (sellerCompanyId != callerCompanyId) {
      throw StateError(
        'Offer $offerId does not belong to company $callerCompanyId',
      );
    }

    // (2) Idempotency — refuse if an order already exists for this offer.
    final existing = await _db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.orders,
      queries: [Query.equal('offer_id', offerId), Query.limit(1)],
    );
    if (existing.rows.isNotEmpty) {
      final eid = existing.rows.first.$id;
      throw StateError('Order already exists for offer $offerId (id: $eid)');
    }

    // Calculate fee snapshot from the offer amount (cents → dollars, same
    // 2-decimal rounding as the PG version, then dollars → cents to store).
    final amount = ((offer.data['offer_price_cents'] as num?) ?? 0) / 100.0;
    final sellerFee =
        double.parse((amount * sellerFeePct).toStringAsFixed(2));
    final buyerFee = double.parse((amount * buyerFeePct).toStringAsFixed(2));
    final platformFee =
        double.parse((sellerFee + buyerFee).toStringAsFixed(2));
    final escrowAmt = double.parse((amount - sellerFee).toStringAsFixed(2));
    final deferralFee =
        double.parse((amount * deferralFeePct).toStringAsFixed(2));

    DateTime? paymentDueAt;
    if (paymentTerms == 'net_30') {
      paymentDueAt = DateTime.now().toUtc().add(const Duration(days: 30));
    } else if (paymentTerms == 'net_60') {
      paymentDueAt = DateTime.now().toUtc().add(const Duration(days: 60));
    }

    int cents(double dollars) => (dollars * 100).round();

    // (3) Single-row commit point.
    final Row created;
    try {
      created = await _db.createRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: ID.unique(),
        data: {
          'offer_id': offerId,
          'seller_company_id': sellerCompanyId,
          'buyer_company_id': offer.data['buyer_company_id'] as String,
          'amount_cents': cents(amount),
          'quantity': (offer.data['quantity'] as num?)?.toInt() ?? 1,
          'seller_fee_pct': sellerFeePct,
          'seller_fee_cents': cents(sellerFee),
          'buyer_fee_pct': buyerFeePct,
          'buyer_fee_cents': cents(buyerFee),
          'platform_fee_cents': cents(platformFee),
          'escrow_amount_cents': cents(escrowAmt),
          'payment_terms': paymentTerms,
          'deferral_fee_pct': deferralFeePct,
          'deferral_fee_cents': cents(deferralFee),
          'payment_due_at': paymentDueAt?.toIso8601String(),
        },
      );
    } on AppwriteException catch (e) {
      if (e.code == 409) {
        // Lost the race on the offer_id unique index — mirror the PG error.
        final race = await _db.listRows(
          databaseId: Aw.databaseId,
          tableId: Aw.orders,
          queries: [Query.equal('offer_id', offerId), Query.limit(1)],
        );
        final eid = race.rows.isEmpty ? 'unknown' : race.rows.first.$id;
        throw StateError('Order already exists for offer $offerId (id: $eid)');
      }
      rethrow;
    }

    return (await findById(created.$id))!;
  }

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  Future<Order?> findById(String id, {String? viewerCompanyId}) async {
    final Row row;
    try {
      row = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: id,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    final stitched = await _stitch([row]);
    return _toOrder(row, stitched, viewerCompanyId: viewerCompanyId);
  }

  Future<Order?> findByTrackingNumber(String trackingNumber) async {
    final res = await _db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.orders,
      queries: [
        Query.equal('tracking_number', trackingNumber),
        Query.limit(1),
      ],
    );
    if (res.rows.isEmpty) return null;
    final row = res.rows.first;
    final stitched = await _stitch([row]);
    return _toOrder(row, stitched);
  }

  /// All orders where [companyId] is buyer or seller, newest first.
  Future<List<Order>> findByCompany(String companyId) async {
    final rows = await _pageAll(Aw.orders, [
      Query.or([
        Query.equal('seller_company_id', companyId),
        Query.equal('buyer_company_id', companyId),
      ]),
      Query.orderDesc(r'$createdAt'),
    ]);
    final stitched = await _stitch(rows);
    return rows
        .map((r) => _toOrder(r, stitched, viewerCompanyId: companyId))
        .toList();
  }

  /// SUM/COUNT aggregation → page all of the company's orders (100 per page,
  /// cursor pagination) and reduce in Dart (§1c). Order volume per company is
  /// bounded, so this stays cheap.
  Future<OrderStats> statsForCompany(String companyId) async {
    final rows = await _pageAll(Aw.orders, [
      Query.or([
        Query.equal('seller_company_id', companyId),
        Query.equal('buyer_company_id', companyId),
      ]),
      Query.orderDesc(r'$createdAt'),
    ]);

    const inactive = {'complete', 'cancelled', 'disputed'};
    final now = DateTime.now().toUtc();
    final monthStart = DateTime.utc(now.year, now.month);

    var totalOrders = 0;
    var activeOrders = 0;
    var totalValue = 0.0;
    var monthValue = 0.0;

    for (final row in rows) {
      final amount = ((row.data['amount_cents'] as num?) ?? 0) / 100.0;
      totalOrders++;
      if (!inactive.contains(row.data['status'] as String?)) activeOrders++;
      totalValue += amount;
      if (!DateTime.parse(row.$createdAt).toUtc().isBefore(monthStart)) {
        monthValue += amount;
      }
    }

    return OrderStats(
      totalOrders: totalOrders,
      activeOrders: activeOrders,
      totalValue: totalValue,
      monthValue: monthValue,
    );
  }

  // ---------------------------------------------------------------------------
  // Updates
  // ---------------------------------------------------------------------------

  /// Attach an Escrow.com transaction to an order.
  Future<Order?> setEscrow({
    required String id,
    required String escrowTransactionId,
    required String escrowStatus,
    String? escrowPaymentUrl,
  }) async {
    try {
      await _db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: id,
        data: {
          'escrow_transaction_id': escrowTransactionId,
          'escrow_status': escrowStatus,
          'escrow_payment_url': escrowPaymentUrl,
          'status': 'awaiting_payment',
        },
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    return findById(id);
  }

  /// Seller attaches a tracking number; status → shipped.
  Future<Order?> addTracking({
    required String id,
    required String sellerCompanyId,
    required String trackingNumber,
    String carrier = 'fedex',
  }) async {
    // PG did a conditional UPDATE … WHERE; here it's read-check-write (the
    // small race window is acceptable for this seller-driven action).
    final Row row;
    try {
      row = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: id,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    final status = row.data['status'] as String?;
    if (row.data['seller_company_id'] != sellerCompanyId ||
        (status != 'funded' && status != 'awaiting_payment')) {
      return null;
    }
    await _db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.orders,
      rowId: id,
      data: {
        'tracking_number': trackingNumber,
        'carrier': carrier,
        'shipped_at': DateTime.now().toUtc().toIso8601String(),
        'status': 'shipped',
      },
    );
    return findById(id);
  }

  /// Called by the FedEx webhook when delivery is confirmed.
  Future<Order?> markDelivered({
    required String id,
    required DateTime deliveredAt,
    required DateTime inspectionEndsAt,
  }) async {
    final Row row;
    try {
      row = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: id,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    // PG updated only WHERE status = 'shipped' but returned the order either
    // way — mirror that.
    if (row.data['status'] == 'shipped') {
      await _db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: id,
        data: {
          'delivered_at': deliveredAt.toUtc().toIso8601String(),
          'inspection_ends_at': inspectionEndsAt.toUtc().toIso8601String(),
          'status': 'delivered',
        },
      );
    }
    return findById(id);
  }

  /// Buyer confirms receipt — escrow acceptance should follow immediately.
  Future<Order?> markComplete(String id, String buyerCompanyId) async {
    final Row row;
    try {
      row = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: id,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    final status = row.data['status'] as String?;
    if (row.data['buyer_company_id'] != buyerCompanyId ||
        (status != 'delivered' && status != 'inspecting')) {
      return null;
    }
    await _db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.orders,
      rowId: id,
      data: {
        'status': 'complete',
        'completed_at': DateTime.now().toUtc().toIso8601String(),
      },
    );
    return findById(id);
  }

  /// Escalate to disputed status.
  Future<Order?> markDisputed(String id) async {
    try {
      await _db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: id,
        data: {'status': 'disputed'},
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    return findById(id);
  }

  /// Sync the latest escrow status from Escrow.com.
  Future<void> updateEscrowStatus(String id, String escrowStatus) async {
    try {
      await _db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.orders,
        rowId: id,
        data: {'escrow_status': escrowStatus},
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return; // PG UPDATE on a missing id was a no-op
      rethrow;
    }
  }

  // ---------------------------------------------------------------------------
  // Join stitching (§1b) — replaces _orderCols/_orderJoins
  // ---------------------------------------------------------------------------

  Order _toOrder(
    Row row,
    Map<String, _Stitched> stitched, {
    String? viewerCompanyId,
  }) {
    final s = stitched[row.$id];
    return Order.fromRow(
      row,
      viewerCompanyId: viewerCompanyId,
      productName: s?.productName,
      sellerCompanyName: s?.sellerCompanyName,
      buyerCompanyName: s?.buyerCompanyName,
      sellerEmail: s?.sellerEmail,
      buyerEmail: s?.buyerEmail,
    );
  }

  /// Batch-fetch everything the SQL joins provided and key it by order `$id`:
  /// offer → listing → asset (product name), companies (names) and one email
  /// per company (admins first, then oldest user — the LATERAL subquery).
  Future<Map<String, _Stitched>> _stitch(List<Row> orders) async {
    if (orders.isEmpty) return {};

    final offerIds = <String>{
      for (final o in orders) o.data['offer_id'] as String,
    };
    final companyIds = <String>{
      for (final o in orders) ...[
        o.data['seller_company_id'] as String,
        o.data['buyer_company_id'] as String,
      ],
    };

    final offers = await _byIds(Aw.buyerOffers, offerIds);
    final listingIds = <String>{
      for (final o in offers.values)
        if (o.data['listing_id'] is String) o.data['listing_id'] as String,
    };
    final listings = await _byIds(Aw.listings, listingIds);
    final assetIds = <String>{
      for (final l in listings.values)
        if (l.data['asset_id'] is String) l.data['asset_id'] as String,
    };
    final assets = await _byIds(Aw.assets, assetIds);
    final companies = await _byIds(Aw.companies, companyIds);
    final emails = await _emailByCompany(companyIds);

    final out = <String, _Stitched>{};
    for (final order in orders) {
      final sellerId = order.data['seller_company_id'] as String;
      final buyerId = order.data['buyer_company_id'] as String;
      final offer = offers[order.data['offer_id'] as String];
      final listing = listings[offer?.data['listing_id'] as String?];
      final asset = assets[listing?.data['asset_id'] as String?];
      out[order.$id] = _Stitched(
        productName: asset?.data['model_name'] as String?,
        sellerCompanyName: companies[sellerId]?.data['name'] as String?,
        buyerCompanyName: companies[buyerId]?.data['name'] as String?,
        sellerEmail: emails[sellerId],
        buyerEmail: emails[buyerId],
      );
    }
    return out;
  }

  /// Fetch rows by `$id` in chunks of [_pageSize]; missing ids are skipped
  /// (the PG LEFT-ish behaviour — dangling FKs just yield null fields).
  Future<Map<String, Row>> _byIds(String tableId, Set<String> ids) async {
    final out = <String, Row>{};
    final list = ids.toList();
    for (var i = 0; i < list.length; i += _pageSize) {
      final chunk = list.sublist(
        i,
        i + _pageSize > list.length ? list.length : i + _pageSize,
      );
      final res = await _db.listRows(
        databaseId: Aw.databaseId,
        tableId: tableId,
        queries: [
          Query.equal(r'$id', chunk),
          Query.limit(chunk.length),
        ],
      );
      for (final row in res.rows) {
        out[row.$id] = row;
      }
    }
    return out;
  }

  /// One contact email per company — replicates the LATERAL subquery
  /// `ORDER BY role = 'admin' DESC, created_at LIMIT 1`.
  Future<Map<String, String>> _emailByCompany(Set<String> companyIds) async {
    if (companyIds.isEmpty) return {};
    final users = await _pageAll(Aw.users, [
      Query.equal('company_id', companyIds.toList()),
      Query.orderAsc(r'$createdAt'),
    ]);

    final best = <String, Row>{};
    for (final u in users) {
      final cid = u.data['company_id'] as String;
      final current = best[cid];
      if (current == null) {
        best[cid] = u;
        continue;
      }
      // Users arrive oldest-first, so only an admin can displace a non-admin.
      if (current.data['role'] != 'admin' && u.data['role'] == 'admin') {
        best[cid] = u;
      }
    }
    return {
      for (final e in best.entries)
        if (e.value.data['email'] is String)
          e.key: e.value.data['email'] as String,
    };
  }

  /// Page through every matching row with cursor pagination (100/page).
  Future<List<Row>> _pageAll(String tableId, List<String> queries) async {
    final rows = <Row>[];
    String? cursor;
    while (true) {
      final page = await _db.listRows(
        databaseId: Aw.databaseId,
        tableId: tableId,
        queries: [
          ...queries,
          Query.limit(_pageSize),
          if (cursor != null) Query.cursorAfter(cursor),
        ],
      );
      rows.addAll(page.rows);
      if (page.rows.length < _pageSize) break;
      cursor = page.rows.last.$id;
    }
    return rows;
  }
}
