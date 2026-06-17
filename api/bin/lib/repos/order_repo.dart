import 'package:postgres/postgres.dart';

import '../db/pool.dart';
import '../models/json_helpers.dart';

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

  // Joined
  final String? productName;
  final String? sellerCompanyName;
  final String? buyerCompanyName;
  final String? sellerEmail; // admin email, used when creating escrow
  final String? buyerEmail; // admin email, used when creating escrow

  // Set per-viewer at query time so the front-end knows sale vs purchase.
  final String? viewerType; // "sale" | "purchase"

  factory Order.fromRow(Map<String, dynamic> row, {String? viewerCompanyId}) {
    final sellerCompanyId = row['seller_company_id'] as String;
    String? viewerType;
    if (viewerCompanyId != null) {
      viewerType = viewerCompanyId == sellerCompanyId ? 'sale' : 'purchase';
    }

    return Order(
      id: row['id'] as String,
      offerId: row['offer_id'] as String,
      sellerCompanyId: sellerCompanyId,
      buyerCompanyId: row['buyer_company_id'] as String,
      amount: numToDoubleOrNull(row['amount']) ?? 0.0,
      quantity: numToIntOrNull(row['quantity']) ?? 1,
      status: row['status'] as String,
      carrier: row['carrier'] as String? ?? 'fedex',
      createdAt: row['created_at'] as DateTime,
      updatedAt: row['updated_at'] as DateTime,
      // Fee snapshot
      sellerFeePct: numToDoubleOrNull(row['seller_fee_pct']) ?? 0.08,
      sellerFee: numToDoubleOrNull(row['seller_fee']) ?? 0.0,
      buyerFeePct: numToDoubleOrNull(row['buyer_fee_pct']) ?? 0.03,
      buyerFee: numToDoubleOrNull(row['buyer_fee']) ?? 0.0,
      platformFee: numToDoubleOrNull(row['platform_fee']) ?? 0.0,
      escrowAmount: numToDoubleOrNull(row['escrow_amount']) ?? 0.0,
      // Payment terms
      paymentTerms: row['payment_terms'] as String? ?? 'immediate',
      deferralFeePct: numToDoubleOrNull(row['deferral_fee_pct']) ?? 0.0,
      deferralFee: numToDoubleOrNull(row['deferral_fee']) ?? 0.0,
      paymentDueAt: row['payment_due_at'] as DateTime?,
      // Escrow
      escrowTransactionId: row['escrow_transaction_id'] as String?,
      escrowStatus: row['escrow_status'] as String?,
      escrowPaymentUrl: row['escrow_payment_url'] as String?,
      // Shipping
      trackingNumber: row['tracking_number'] as String?,
      shippedAt: row['shipped_at'] as DateTime?,
      deliveredAt: row['delivered_at'] as DateTime?,
      inspectionEndsAt: row['inspection_ends_at'] as DateTime?,
      completedAt: row['completed_at'] as DateTime?,
      // Joined
      productName: row['product_name'] as String?,
      sellerCompanyName: row['seller_company_name'] as String?,
      buyerCompanyName: row['buyer_company_name'] as String?,
      sellerEmail: row['seller_email'] as String?,
      buyerEmail: row['buyer_email'] as String?,
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
// Repository
// ---------------------------------------------------------------------------

const _orderCols = '''
  o.id, o.offer_id, o.seller_company_id, o.buyer_company_id,
  o.amount, o.quantity, o.status, o.carrier,
  o.seller_fee_pct, o.seller_fee, o.buyer_fee_pct, o.buyer_fee,
  o.platform_fee, o.escrow_amount,
  o.payment_terms, o.deferral_fee_pct, o.deferral_fee, o.payment_due_at,
  o.escrow_transaction_id, o.escrow_status, o.escrow_payment_url,
  o.tracking_number, o.shipped_at, o.delivered_at,
  o.inspection_ends_at, o.completed_at,
  o.created_at, o.updated_at,
  a.model_name      AS product_name,
  sc.name           AS seller_company_name,
  bc.name           AS buyer_company_name,
  su.email          AS seller_email,
  bu.email          AS buyer_email
''';

const _orderJoins = '''
  FROM orders o
  JOIN buyer_offers bo ON bo.id = o.offer_id
  JOIN listings     l  ON l.id  = bo.listing_id
  JOIN assets       a  ON a.id  = l.asset_id
  JOIN companies    sc ON sc.id = o.seller_company_id
  JOIN companies    bc ON bc.id = o.buyer_company_id
  -- First admin (or any user) for each company — used for escrow email.
  LEFT JOIN LATERAL (
    SELECT email FROM users
    WHERE company_id = o.seller_company_id
    ORDER BY role = 'admin' DESC, created_at
    LIMIT 1
  ) su ON true
  LEFT JOIN LATERAL (
    SELECT email FROM users
    WHERE company_id = o.buyer_company_id
    ORDER BY role = 'admin' DESC, created_at
    LIMIT 1
  ) bu ON true
''';

class OrderRepo {
  OrderRepo(this._db);
  final Db _db;

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  Future<Order> create({
    required String offerId,
    required String callerCompanyId, // must be the seller
    required double sellerFeePct,
    required double buyerFeePct,
    String paymentTerms = 'immediate',
    double deferralFeePct = 0.0,
  }) async {
    return _db.tx<Order>((tx) async {
      // Lock the offer row and verify it's accepted & belongs to caller.
      final offerRows = await tx.execute(
        Sql.named('''
          SELECT bo.id, bo.offer_price, bo.quantity, bo.buyer_company_id,
                 l.company_id AS seller_company_id
          FROM buyer_offers bo
          JOIN listings l ON l.id = bo.listing_id
          WHERE bo.id = @oid AND bo.status = 'accepted'
          FOR UPDATE
        '''),
        parameters: {'oid': offerId},
      );

      if (offerRows.isEmpty) {
        throw StateError(
          'Offer $offerId not found or not in accepted status',
        );
      }

      final offer = offerRows.first.toColumnMap();
      if (offer['seller_company_id'] != callerCompanyId) {
        throw StateError(
          'Offer $offerId does not belong to company $callerCompanyId',
        );
      }

      // Idempotency — return existing order if already created.
      final existing = await tx.execute(
        Sql.named('SELECT id FROM orders WHERE offer_id = @oid'),
        parameters: {'oid': offerId},
      );
      if (existing.isNotEmpty) {
        final eid = existing.first.toColumnMap()['id'] as String;
        throw StateError('Order already exists for offer $offerId (id: $eid)');
      }

      // Calculate fee snapshot from the offer amount.
      final amount = numToDoubleOrNull(offer['offer_price']) ?? 0.0;
      final sellerFee = double.parse(
        (amount * sellerFeePct).toStringAsFixed(2),
      );
      final buyerFee = double.parse((amount * buyerFeePct).toStringAsFixed(2));
      final platformFee = double.parse(
        (sellerFee + buyerFee).toStringAsFixed(2),
      );
      final escrowAmt = double.parse((amount - sellerFee).toStringAsFixed(2));
      final deferralFee = double.parse(
        (amount * deferralFeePct).toStringAsFixed(2),
      );

      DateTime? paymentDueAt;
      if (paymentTerms == 'net_30') {
        paymentDueAt = DateTime.now().toUtc().add(const Duration(days: 30));
      } else if (paymentTerms == 'net_60') {
        paymentDueAt = DateTime.now().toUtc().add(const Duration(days: 60));
      }

      final result = await tx.execute(
        Sql.named('''
          INSERT INTO orders (
            offer_id, seller_company_id, buyer_company_id, amount, quantity,
            seller_fee_pct, seller_fee, buyer_fee_pct, buyer_fee,
            platform_fee, escrow_amount,
            payment_terms, deferral_fee_pct, deferral_fee, payment_due_at
          ) VALUES (
            @oid, @seller, @buyer, @amount, @qty,
            @sfeepct, @sfee, @bfeepct, @bfee,
            @pfee, @escrowamt,
            @pterms, @dfeepct, @dfee, @pdue
          )
          RETURNING id
        '''),
        parameters: {
          'oid': offerId,
          'seller': offer['seller_company_id'] as String,
          'buyer': offer['buyer_company_id'] as String,
          'amount': amount,
          'qty': numToIntOrNull(offer['quantity']) ?? 1,
          'sfeepct': sellerFeePct,
          'sfee': sellerFee,
          'bfeepct': buyerFeePct,
          'bfee': buyerFee,
          'pfee': platformFee,
          'escrowamt': escrowAmt,
          'pterms': paymentTerms,
          'dfeepct': deferralFeePct,
          'dfee': deferralFee,
          'pdue': paymentDueAt,
        },
      );

      final newId = result.first.toColumnMap()['id'] as String;
      return (await findById(newId))!;
    });
  }

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  Future<Order?> findById(String id, {String? viewerCompanyId}) async {
    final rows = await _db.query(
      'SELECT $_orderCols $_orderJoins WHERE o.id = @id',
      parameters: {'id': id},
    );
    if (rows.isEmpty) return null;
    return Order.fromRow(
      rows.first.toColumnMap(),
      viewerCompanyId: viewerCompanyId,
    );
  }

  Future<Order?> findByTrackingNumber(String trackingNumber) async {
    final rows = await _db.query(
      'SELECT $_orderCols $_orderJoins WHERE o.tracking_number = @tn',
      parameters: {'tn': trackingNumber},
    );
    if (rows.isEmpty) return null;
    return Order.fromRow(rows.first.toColumnMap());
  }

  Future<List<Order>> findByCompany(String companyId) async {
    final rows = await _db.query(
      '''
      SELECT $_orderCols
      $_orderJoins
      WHERE o.seller_company_id = @cid OR o.buyer_company_id = @cid
      ORDER BY o.created_at DESC
      ''',
      parameters: {'cid': companyId},
    );
    return rows
        .map((r) => Order.fromRow(r.toColumnMap(), viewerCompanyId: companyId))
        .toList();
  }

  Future<OrderStats> statsForCompany(String companyId) async {
    final rows = await _db.query(
      '''
      SELECT
        COUNT(*)                                             AS total_orders,
        COUNT(*) FILTER (WHERE status NOT IN
          ('complete','cancelled','disputed'))               AS active_orders,
        COALESCE(SUM(amount), 0)                            AS total_value,
        COALESCE(SUM(amount) FILTER (
          WHERE created_at >= date_trunc('month', now())
        ), 0)                                               AS month_value
      FROM orders
      WHERE seller_company_id = @cid OR buyer_company_id = @cid
      ''',
      parameters: {'cid': companyId},
    );
    final r = rows.first.toColumnMap();
    return OrderStats(
      totalOrders: numToIntOrNull(r['total_orders']) ?? 0,
      activeOrders: numToIntOrNull(r['active_orders']) ?? 0,
      totalValue: numToDoubleOrNull(r['total_value']) ?? 0.0,
      monthValue: numToDoubleOrNull(r['month_value']) ?? 0.0,
    );
  }

  // ---------------------------------------------------------------------------
  // Updates
  // ---------------------------------------------------------------------------

  Future<Order?> setEscrow({
    required String id,
    required String escrowTransactionId,
    required String escrowStatus,
    String? escrowPaymentUrl,
  }) async {
    await _db.query(
      '''
      UPDATE orders
      SET escrow_transaction_id = @etid,
          escrow_status         = @estatus,
          escrow_payment_url    = @eurl,
          status                = 'awaiting_payment'
      WHERE id = @id
      ''',
      parameters: {
        'id': id,
        'etid': escrowTransactionId,
        'estatus': escrowStatus,
        'eurl': escrowPaymentUrl,
      },
    );
    return findById(id);
  }

  Future<Order?> addTracking({
    required String id,
    required String sellerCompanyId,
    required String trackingNumber,
    String carrier = 'fedex',
  }) async {
    final rows = await _db.query(
      '''
      UPDATE orders
      SET tracking_number = @tn,
          carrier         = @carrier,
          shipped_at      = now(),
          status          = 'shipped'
      WHERE id = @id
        AND seller_company_id = @seller
        AND status IN ('funded', 'awaiting_payment')
      RETURNING id
      ''',
      parameters: {
        'id': id,
        'seller': sellerCompanyId,
        'tn': trackingNumber,
        'carrier': carrier,
      },
    );
    if (rows.isEmpty) return null;
    return findById(id);
  }

  Future<Order?> markDelivered({
    required String id,
    required DateTime deliveredAt,
    required DateTime inspectionEndsAt,
  }) async {
    await _db.query(
      '''
      UPDATE orders
      SET delivered_at       = @delivered,
          inspection_ends_at = @inspection,
          status             = 'delivered'
      WHERE id = @id AND status = 'shipped'
      ''',
      parameters: {
        'id': id,
        'delivered': deliveredAt,
        'inspection': inspectionEndsAt,
      },
    );
    return findById(id);
  }

  Future<Order?> markComplete(String id, String buyerCompanyId) async {
    final rows = await _db.query(
      '''
      UPDATE orders
      SET status       = 'complete',
          completed_at = now()
      WHERE id = @id
        AND buyer_company_id = @buyer
        AND status IN ('delivered', 'inspecting')
      RETURNING id
      ''',
      parameters: {'id': id, 'buyer': buyerCompanyId},
    );
    if (rows.isEmpty) return null;
    return findById(id);
  }

  Future<Order?> markDisputed(String id) async {
    await _db.query(
      "UPDATE orders SET status = 'disputed' WHERE id = @id",
      parameters: {'id': id},
    );
    return findById(id);
  }

  Future<void> updateEscrowStatus(String id, String escrowStatus) async {
    await _db.query(
      'UPDATE orders SET escrow_status = @s WHERE id = @id',
      parameters: {'id': id, 's': escrowStatus},
    );
  }
}
