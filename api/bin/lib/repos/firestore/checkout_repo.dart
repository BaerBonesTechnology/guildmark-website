import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';

class CheckoutConflict implements Exception {
  const CheckoutConflict(this.code, this.message, [this.status = 409]);
  final String code;
  final String message;
  final int status;
}

int availableQuantity(Map<String, dynamic> asset) =>
    ((asset['quantity'] as num?)?.toInt() ?? 0) -
    ((asset['reserved_quantity'] as num?)?.toInt() ?? 0) -
    ((asset['sold_quantity'] as num?)?.toInt() ?? 0);

/// Durable checkout intent + inventory reservation, committed before payment.
class CheckoutRepo {
  CheckoutRepo(this.service);
  final FirebaseService service;
  TablesDB get db => service.tablesDB;
  static String hash(String value) =>
      sha256.convert(utf8.encode(value)).toString();
  static String orderId(String buyer, String key) =>
      hash('$buyer:$key').substring(0, 32);

  Future<Row> reserve({
    required String listingId,
    required String buyer,
    required String key,
    required int quantity,
    required String? sourceId,
    required double sellerFee,
    required double buyerFee,
    int? expectedTotalCents,
  }) => db.transaction((tx) async {
    final id = orderId(buyer, key);
    final existing = await tx.get('orders', id);
    if (existing != null) {
      if (existing.data['listing_id'] != listingId ||
          existing.data['quantity'] != quantity ||
          (expectedTotalCents != null &&
              existing.data['charge_cents'] != expectedTotalCents) ||
          (sourceId != null &&
              existing.data['source_hash'] != hash(sourceId))) {
        throw const CheckoutConflict(
          'IDEMPOTENCY_CONFLICT',
          'This checkout key belongs to a different request',
        );
      }
      return existing;
    }
    if (sourceId == null || sourceId.isEmpty) {
      throw const CheckoutConflict(
        'SOURCE_REQUIRED',
        'Payment source is required for a new checkout',
        400,
      );
    }
    final listing = await tx.get('listings', listingId);
    if (listing == null || listing.data['status'] != 'active') {
      throw const CheckoutConflict(
        'LISTING_UNAVAILABLE',
        'Listing is no longer available',
      );
    }
    final seller = listing.data['company_id'] as String;
    if (seller == buyer) {
      throw const CheckoutConflict(
        'SELF_PURCHASE',
        'You cannot purchase your own listing',
        422,
      );
    }
    final assetId = listing.data['asset_id'] as String;
    final asset = await tx.get('assets', assetId);
    if (asset == null || asset.data['company_id'] != seller) {
      throw const CheckoutConflict(
        'INVENTORY_UNAVAILABLE',
        'Inventory is unavailable',
      );
    }
    final slotId = orderId(buyer, listingId);
    final slot = await tx.get('checkout_slots', slotId);
    final pending = slot == null
        ? null
        : await tx.get('orders', slot.data['order_id'] as String);
    if (pending != null && pending.data['status'] == 'payment_pending') {
      throw const CheckoutConflict(
        'CHECKOUT_PENDING',
        'An earlier checkout is unresolved. Resume it before starting another.',
      );
    }
    if (quantity <= 0 || quantity > availableQuantity(asset.data)) {
      throw const CheckoutConflict(
        'INSUFFICIENT_STOCK',
        'Requested quantity is unavailable',
      );
    }
    final unit =
        (listing.data['listed_price_cents'] ??
                listing.data['buyer_ask_price_cents'])
            as num?;
    if (unit == null || unit <= 0 || unit != unit.roundToDouble()) {
      throw const CheckoutConflict(
        'NO_PRICE',
        'Listing has no valid price',
        422,
      );
    }
    final amount = unit.toInt() * quantity;
    final fees = feeSnapshot(amount, sellerFee, buyerFee);
    final total = amount + (fees['buyer_fee_cents'] as int);
    if (expectedTotalCents != null && expectedTotalCents != total) {
      throw const CheckoutConflict(
        'PRICE_CHANGED',
        'The price or fees changed. Refresh the listing before paying.',
      );
    }
    if (total > 50000000) {
      throw const CheckoutConflict(
        'AMOUNT_TOO_LARGE',
        'Order exceeds the checkout limit',
        422,
      );
    }
    final offerId = 'buy-$id';
    tx.update('assets', assetId, {
      'reserved_quantity':
          ((asset.data['reserved_quantity'] as num?)?.toInt() ?? 0) + quantity,
    });
    final slotData = {'order_id': id};
    if (slot == null) {
      tx.create('checkout_slots', slotId, slotData);
    } else {
      tx.update('checkout_slots', slotId, slotData);
    }
    tx.create('buyer_offers', offerId, {
      'listing_id': listingId,
      'buyer_company_id': buyer,
      'offer_price_cents': unit.toInt(),
      'quantity': quantity,
      'status': 'accepted',
      'expires_at': DateTime.now()
          .toUtc()
          .add(const Duration(days: 30))
          .toIso8601String(),
    });
    return tx.create('orders', id, {
      'offer_id': offerId,
      'listing_id': listingId,
      'asset_id': assetId,
      'seller_company_id': seller,
      'buyer_company_id': buyer,
      'quantity': quantity,
      ...fees,
      'charge_cents': total,
      'status': 'payment_pending',
      'payment_provider': 'square',
      'payment_idempotency_key': id,
      'source_hash': hash(sourceId),
      'reservation_state': 'held',
      'product_name': asset.data['model_name'] ?? 'IT Asset',
    });
  });

  static Map<String, dynamic> feeSnapshot(
    int amount,
    double seller,
    double buyer,
  ) {
    if (!seller.isFinite ||
        !buyer.isFinite ||
        seller < 0 ||
        seller > 1 ||
        buyer < 0 ||
        buyer > 1) {
      throw const CheckoutConflict(
        'INVALID_FEES',
        'Fee configuration is invalid',
        503,
      );
    }
    final sellerCents = (amount * seller).round();
    final buyerCents = (amount * buyer).round();
    return {
      'amount_cents': amount,
      'seller_fee_pct': seller,
      'seller_fee_cents': sellerCents,
      'buyer_fee_pct': buyer,
      'buyer_fee_cents': buyerCents,
      'platform_fee_cents': sellerCents + buyerCents,
      'escrow_amount_cents': amount - sellerCents,
      'payment_terms': 'immediate',
      'deferral_fee_pct': 0.0,
      'deferral_fee_cents': 0,
    };
  }

  /// Only a definitive provider result can consume or release a held reservation.
  Future<Row> resolve(
    String id, {
    required bool paid,
    String? paymentId,
    String? providerStatus,
  }) => db.transaction((tx) async {
    final order = await tx.get('orders', id);
    if (order == null) {
      throw const CheckoutConflict('ORDER_NOT_FOUND', 'Order not found', 404);
    }
    if (order.data['reservation_state'] != 'held') return order;
    final assetId = order.data['asset_id'] as String;
    final listingId = order.data['listing_id'] as String;
    final asset = await tx.get('assets', assetId);
    final listing = await tx.get('listings', listingId);
    final offer = await tx.get(
      'buyer_offers',
      order.data['offer_id'] as String,
    );
    if (asset == null || listing == null) {
      throw StateError('Reserved inventory is missing');
    }
    final quantity = order.data['quantity'] as int;
    final reserved = (asset.data['reserved_quantity'] as num?)?.toInt() ?? 0;
    final sold =
        ((asset.data['sold_quantity'] as num?)?.toInt() ?? 0) +
        (paid ? quantity : 0);
    if (reserved < quantity) {
      throw StateError('Reservation counter is inconsistent');
    }
    tx.update('assets', assetId, {
      'reserved_quantity': reserved - quantity,
      'sold_quantity': sold,
    });
    if (paid &&
        sold >= (asset.data['quantity'] as num) &&
        listing.data['status'] == 'active') {
      tx.update('listings', listingId, {'status': 'sold'});
    }
    if (!paid && offer != null) {
      tx.update('buyer_offers', offer.$id, {'status': 'rejected'});
    }
    return tx.update('orders', id, {
      'status': paid ? 'funded' : 'cancelled',
      'reservation_state': paid ? 'consumed' : 'released',
      'square_payment_id': ?paymentId,
      'square_payment_status': ?providerStatus,
    });
  });

  Future<Row> recordPending(String id, String paymentId, String status) =>
      db.transaction((tx) async {
        final order = await tx.get('orders', id);
        if (order == null) throw StateError('Checkout is missing');
        if (order.data['status'] != 'payment_pending') return order;
        return tx.update('orders', id, {
          'square_payment_id': paymentId,
          'square_payment_status': status,
        });
      });
}
