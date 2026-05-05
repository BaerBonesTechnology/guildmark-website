/// Buyer offers data-access. Covers both buyer-create and seller-respond.
library;

import 'package:postgres/postgres.dart';

import '../db/pool.dart';
import '../models/offer.dart';

/// Offers expire in 72 hours by default. The frontend can display a countdown.
const _offerTtl = Duration(hours: 72);

const _offerCols = '''
  id, listing_id, buyer_company_id, offer_price, quantity,
  status, counter_price, message, expires_at, created_at
''';

class OfferRepo {
  OfferRepo(this._db);

  final Db _db;

  /// Buyer-side: every offer placed by a company.
  Future<List<BuyerOffer>> findByBuyerCompany(String buyerCompanyId) async {
    final result = await _db.query(
      'SELECT $_offerCols FROM buyer_offers WHERE buyer_company_id = @bid ORDER BY created_at DESC',
      parameters: {'bid': buyerCompanyId},
    );
    return result.map((r) => BuyerOffer.fromRow(r.toColumnMap())).toList();
  }

  /// Place a new offer on a listing.
  ///
  /// Validates that:
  /// - the listing exists and is active
  /// - the buyer is not the listing's seller (no self-offers)
  /// - the offer price is positive
  ///
  /// Returns the persisted offer or throws [ArgumentError] on validation
  /// failure and [StateError] if the listing is not active.
  Future<BuyerOffer> create({
    required String listingId,
    required String buyerCompanyId,
    required double offerPrice,
    required int quantity,
    String? message,
  }) async {
    if (offerPrice <= 0) throw ArgumentError('offer_price must be positive');
    if (quantity <= 0) throw ArgumentError('quantity must be positive');

    return _db.tx<BuyerOffer>((tx) async {
      // Lock the listing row to prevent concurrent state changes.
      final listingRows = await tx.execute(
        Sql.named(
          "SELECT id, company_id, status FROM listings WHERE id = @lid FOR UPDATE",
        ),
        parameters: {'lid': listingId},
      );
      if (listingRows.isEmpty) throw StateError('Listing $listingId not found');
      final listing = listingRows.first.toColumnMap();
      if (listing['status'] != 'active') {
        throw StateError(
            'Listing $listingId is not active (status: ${listing['status']})');
      }
      if (listing['company_id'] == buyerCompanyId) {
        throw ArgumentError('Buyer cannot place an offer on their own listing');
      }

      final result = await tx.execute(
        Sql.named(
          '''
          INSERT INTO buyer_offers
            (listing_id, buyer_company_id, offer_price, quantity, message, expires_at)
          VALUES
            (@lid, @bid, @price, @qty, @msg, @exp)
          RETURNING $_offerCols
          ''',
        ),
        parameters: {
          'lid': listingId,
          'bid': buyerCompanyId,
          'price': offerPrice,
          'qty': quantity,
          'msg': message,
          'exp': DateTime.now().toUtc().add(_offerTtl),
        },
      );
      return BuyerOffer.fromRow(result.first.toColumnMap());
    });
  }

  /// Seller-side action — accept / reject / counter.
  ///
  /// [sellerCompanyId] is validated against the offer's listing so a seller
  /// cannot respond to someone else's offer.
  /// [counterPrice] is required when action == 'counter'.
  Future<BuyerOffer> respond({
    required String offerId,
    required String sellerCompanyId,
    required String action,
    double? counterPrice,
  }) async {
    if (action == 'counter' && (counterPrice == null || counterPrice <= 0)) {
      throw ArgumentError(
          'counter_price required and must be positive for counter action');
    }

    return _db.tx<BuyerOffer>((tx) async {
      // Verify the offer belongs to one of this seller's listings.
      final checkRows = await tx.execute(
        Sql.named(
          '''
          SELECT bo.id
          FROM buyer_offers bo
          JOIN listings l ON l.id = bo.listing_id
          WHERE bo.id = @oid AND l.company_id = @cid AND bo.status = 'pending'
          FOR UPDATE
          ''',
        ),
        parameters: {'oid': offerId, 'cid': sellerCompanyId},
      );
      if (checkRows.isEmpty) {
        throw StateError(
          'Offer $offerId not found, not pending, or does not belong to company $sellerCompanyId',
        );
      }

      final newStatus = switch (action) {
        'accept' => 'accepted',
        'reject' => 'rejected',
        'counter' => 'countered',
        _ => throw ArgumentError('Unknown action: $action'),
      };

      final result = await tx.execute(
        Sql.named(
          '''
          UPDATE buyer_offers
          SET status        = @status::offer_status,
              counter_price = @counterPrice
          WHERE id = @oid
          RETURNING $_offerCols
          ''',
        ),
        parameters: {
          'oid': offerId,
          'status': newStatus,
          'counterPrice': counterPrice,
        },
      );
      return BuyerOffer.fromRow(result.first.toColumnMap());
    });
  }
}
