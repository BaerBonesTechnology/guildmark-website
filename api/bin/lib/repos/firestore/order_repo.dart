/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/business_verification.dart';

import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/repos/firestore/checkout_repo.dart';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class Order {
  // "sale" | "purchase"

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
  final String? viewerType;

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
  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  static const _pageSize = 30;

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  /// Accepted offers reserve the same asset inventory as buy-now checkout.
  /// The seller may initiate an unpaid order, but cannot mark it funded.
  Future<Order> create({
    required String offerId,
    required String callerCompanyId,
    required double sellerFeePct,
    required double buyerFeePct,
    String paymentTerms = 'immediate',
    double deferralFeePct = 0.0,
  }) async {
    if (paymentTerms != 'immediate') {
      throw StateError('Deferred payment is unavailable');
    }
    final created = await _db.transaction((tx) async {
      await BusinessVerification.requireSeller(tx, callerCompanyId);
      final offer = await tx.get('buyer_offers', offerId);
      if (offer == null ||
          offer.data['status'] != 'accepted' ||
          !DateTime.parse(
            offer.data['expires_at'] as String,
          ).isAfter(DateTime.now().toUtc())) {
        throw StateError('Offer is not accepted or has expired');
      }
      final listing = await tx.get(
        'listings',
        offer.data['listing_id'] as String,
      );
      if (listing == null || listing.data['company_id'] != callerCompanyId) {
        throw StateError('Offer does not belong to seller');
      }
      final existing = await tx.get('orders', 'offer-$offerId');
      if (existing != null) {
        throw StateError('Order already exists for this offer');
      }
      if (listing.data['status'] != 'active' ||
          offer.data['buyer_company_id'] == callerCompanyId) {
        throw StateError('Listing is unavailable');
      }
      final assetId = listing.data['asset_id'] as String;
      final asset = await tx.get('assets', assetId);
      final quantity = offer.data['quantity'];
      final unit = offer.data['offer_price_cents'];
      if (asset == null ||
          asset.data['company_id'] != callerCompanyId ||
          quantity is! int ||
          quantity <= 0 ||
          quantity > availableQuantity(asset.data) ||
          unit is! int ||
          unit <= 0) {
        throw StateError('Inventory or price is invalid');
      }
      final fees = CheckoutRepo.feeSnapshot(
        unit * quantity,
        sellerFeePct,
        buyerFeePct,
      );
      tx.update('assets', assetId, {
        'reserved_quantity':
            ((asset.data['reserved_quantity'] as num?)?.toInt() ?? 0) +
            quantity,
      });
      return tx.create('orders', 'offer-$offerId', {
        'offer_id': offerId,
        'listing_id': listing.$id,
        'asset_id': assetId,
        'seller_company_id': callerCompanyId,
        'buyer_company_id': offer.data['buyer_company_id'],
        'quantity': quantity,
        ...fees,
        'status': 'awaiting_payment',
        'reservation_state': 'held',
        'payment_provider': 'escrow',
      });
    });
    return (await findById(created.$id, viewerCompanyId: callerCompanyId))!;
  }

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  Future<Order?> findById(String id, {String? viewerCompanyId}) async {
    final Row row;
    try {
      row = await _db.getRow(
        databaseId: Collections.databaseId,
        tableId: Collections.orders,
        rowId: id,
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    final stitched = await _stitch([row]);
    return _toOrder(row, stitched, viewerCompanyId: viewerCompanyId);
  }

  Future<Order?> findByTrackingNumber(String trackingNumber) async {
    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.orders,
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
    final rows = await _pageAll(Collections.orders, [
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
    final rows = await _pageAll(Collections.orders, [
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
    final changed = await _db.transaction((tx) async {
      final row = await tx.get('orders', id);
      if (row == null ||
          row.data['payment_provider'] != 'escrow' ||
          row.data['status'] != 'awaiting_payment') {
        return false;
      }
      if (row.data['escrow_transaction_id'] != null &&
          row.data['escrow_transaction_id'] != escrowTransactionId) {
        return false;
      }
      tx.update('orders', id, {
        'escrow_transaction_id': escrowTransactionId,
        'escrow_status': escrowStatus,
        'escrow_payment_url': escrowPaymentUrl,
      });
      return true;
    });
    if (!changed) return null;
    return findById(id);
  }

  /// Seller attaches a tracking number; status → shipped.
  Future<Order?> addTracking({
    required String id,
    required String sellerCompanyId,
    required String trackingNumber,
    String carrier = 'fedex',
  }) async {
    final changed = await _db.transaction((tx) async {
      final row = await tx.get('orders', id);
      if (row == null ||
          row.data['seller_company_id'] != sellerCompanyId ||
          row.data['status'] != 'funded') {
        return false;
      }
      tx.update('orders', id, {
        'tracking_number': trackingNumber,
        'carrier': carrier,
        'shipped_at': DateTime.now().toUtc().toIso8601String(),
        'status': 'shipped',
      });
      return true;
    });
    if (!changed) return null;
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
        databaseId: Collections.databaseId,
        tableId: Collections.orders,
        rowId: id,
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    // PG updated only WHERE status = 'shipped' but returned the order either
    // way — mirror that.
    if (row.data['status'] == 'shipped') {
      await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.orders,
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
        databaseId: Collections.databaseId,
        tableId: Collections.orders,
        rowId: id,
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    final status = row.data['status'] as String?;
    if (row.data['buyer_company_id'] != buyerCompanyId ||
        (status != 'delivered' && status != 'inspecting')) {
      return null;
    }
    await _db.updateRow(
      databaseId: Collections.databaseId,
      tableId: Collections.orders,
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
        databaseId: Collections.databaseId,
        tableId: Collections.orders,
        rowId: id,
        data: {'status': 'disputed'},
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
    return findById(id);
  }

  /// Sync the latest escrow status from Escrow.com.
  Future<void> updateEscrowStatus(String id, String escrowStatus) async {
    try {
      await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.orders,
        rowId: id,
        data: {'escrow_status': escrowStatus},
      );
    } on DatastoreException catch (e) {
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

    final offers = await _byIds(Collections.buyerOffers, offerIds);
    final listingIds = <String>{
      for (final o in offers.values)
        if (o.data['listing_id'] is String) o.data['listing_id'] as String,
    };
    final listings = await _byIds(Collections.listings, listingIds);
    final assetIds = <String>{
      for (final l in listings.values)
        if (l.data['asset_id'] is String) l.data['asset_id'] as String,
    };
    final assets = await _byIds(Collections.assets, assetIds);
    final companies = await _byIds(Collections.companies, companyIds);
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
        databaseId: Collections.databaseId,
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
    final users = await _pageAll(Collections.users, [
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
        databaseId: Collections.databaseId,
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
