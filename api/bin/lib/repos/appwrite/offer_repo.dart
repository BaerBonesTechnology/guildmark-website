/// Appwrite implementation of OfferRepo — same public interface as the
/// Postgres version (lib/repos/offer_repo.dart) so routes switch by changing
/// only the import (see ../../../POSTGRES_TO_APPWRITE.md §4).
///
/// The Postgres transactions here existed only for row locking around a
/// read-validate-write sequence — each flow performs exactly ONE write, so
/// per design doc §1a the write is simply ordered last (it is the commit
/// point) and no compensation is needed. The lock's race window (a listing
/// changing state between validation and the offer write) is accepted; the
/// affected offer would be at worst placed against a just-deactivated
/// listing, same as a lost lock race under READ COMMITTED.
library;

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/models/json_helpers.dart';
import 'package:guildmark_api/models/offer.dart';

/// Offers expire in 72 hours by default. The frontend can display a countdown.
const _offerTtl = Duration(hours: 72);

class OfferRepo {
  OfferRepo(this._aw);

  final AppwriteService _aw;

  TablesDB get _db => _aw.tablesDB;

  /// Buyer-side: every offer placed by a company.
  Future<List<BuyerOffer>> findByBuyerCompany(String buyerCompanyId) async {
    const pageSize = 100;
    final rows = <Row>[];
    var offset = 0;
    while (true) {
      final res = await _db.listRows(
        databaseId: Aw.databaseId,
        tableId: Aw.buyerOffers,
        queries: [
          Query.equal('buyer_company_id', buyerCompanyId),
          Query.orderDesc(r'$createdAt'),
          Query.limit(pageSize),
          Query.offset(offset),
        ],
      );
      rows.addAll(res.rows);
      if (res.rows.length < pageSize) break;
      offset += pageSize;
    }
    return rows.map(_fromRow).toList();
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

    // Read + validate the listing (was SELECT ... FOR UPDATE; Appwrite has
    // no row locks — see the library comment on the accepted race window).
    final Row listing;
    try {
      listing = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.listings,
        rowId: listingId,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) throw StateError('Listing $listingId not found');
      rethrow;
    }

    final listingStatus = listing.data['status'] as String?;
    if (listingStatus != 'active') {
      throw StateError(
        'Listing $listingId is not active (status: $listingStatus)',
      );
    }
    if (listing.data['company_id'].toString() == buyerCompanyId) {
      throw ArgumentError('Buyer cannot place an offer on their own listing');
    }

    // Single write — the commit point, ordered after all validation.
    final row = await _db.createRow(
      databaseId: Aw.databaseId,
      tableId: Aw.buyerOffers,
      rowId: ID.unique(),
      data: {
        'listing_id': listingId,
        'buyer_company_id': buyerCompanyId,
        'offer_price_cents': _dollarsToCents(offerPrice),
        'quantity': quantity,
        'message': message,
        'expires_at':
            DateTime.now().toUtc().add(_offerTtl).toIso8601String(),
        // status defaults to 'pending' via the column default.
      },
    );
    return _fromRow(row);
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
        'counter_price required and must be positive for counter action',
      );
    }

    // Verify the offer exists, is pending, and belongs to one of this
    // seller's listings (was a JOIN — two reads + stitch per §1b).
    Row? offer;
    try {
      offer = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.buyerOffers,
        rowId: offerId,
      );
    } on AppwriteException catch (e) {
      if (e.code != 404) rethrow;
      offer = null;
    }

    Row? listing;
    if (offer != null && offer.data['status'] == 'pending') {
      try {
        listing = await _db.getRow(
          databaseId: Aw.databaseId,
          tableId: Aw.listings,
          rowId: offer.data['listing_id'] as String,
        );
      } on AppwriteException catch (e) {
        if (e.code != 404) rethrow;
        listing = null;
      }
    }

    if (offer == null ||
        offer.data['status'] != 'pending' ||
        listing == null ||
        listing.data['company_id'] != sellerCompanyId) {
      throw StateError(
        'Offer $offerId not found, not pending, or does not belong to company '
        '$sellerCompanyId',
      );
    }

    final newStatus = switch (action) {
      'accept' => 'accepted',
      'reject' => 'rejected',
      'counter' => 'countered',
      _ => throw ArgumentError('Unknown action: $action'),
    };

    // Single write — the commit point, ordered last (§1a). If a listing
    // update ever joins this flow, keep this offer update as the FINAL
    // write: it flips the offer out of 'pending' and thereby commits the
    // response; earlier writes would then need compensation on its failure.
    final row = await _db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.buyerOffers,
      rowId: offerId,
      data: {
        'status': newStatus,
        // Postgres always wrote @counterPrice (null for accept/reject).
        'counter_price_cents': _dollarsToCents(counterPrice),
      },
    );
    return _fromRow(row);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  BuyerOffer _fromRow(Row row) {
    final d = row.data;
    return BuyerOffer(
      id: row.$id,
      listingId: d['listing_id'] as String,
      buyerCompanyId: d['buyer_company_id'] as String,
      offerPrice: _centsToDollars(d['offer_price_cents']) ?? 0.0,
      quantity: numToIntOrNull(d['quantity']) ?? 0,
      status: (d['status'] as String?) ?? 'pending',
      expiresAt: DateTime.parse(d['expires_at'] as String),
      createdAt: DateTime.parse(row.$createdAt),
      counterPrice: _centsToDollars(d['counter_price_cents']),
      message: d['message'] as String?,
    );
  }
}

double? _centsToDollars(Object? cents) =>
    cents == null ? null : (cents as num) / 100.0;

int? _dollarsToCents(double? dollars) =>
    dollars == null ? null : (dollars * 100).round();
