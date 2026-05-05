/// Seller dashboard aggregate. Lightweight summary the landing dashboard
/// page hits on every navigation.
library;

import '../db/pool.dart';

class DashboardSummary {
  DashboardSummary({
    required this.activeListings,
    required this.pendingOffers,
    required this.totalListedValue,
    required this.totalRecovered,
    required this.overpricedCount,
  });

  final int activeListings;
  final int pendingOffers;
  final double totalListedValue;
  final double totalRecovered;
  final int overpricedCount;

  Map<String, dynamic> toJson() => {
        'active_listings':    activeListings,
        'pending_offers':     pendingOffers,
        'total_listed_value': totalListedValue,
        'total_recovered':    totalRecovered,
        'overpriced_count':   overpricedCount,
      };
}

class DashboardRepo {
  DashboardRepo(this._db);
  final Db _db;

  /// Aggregate seller dashboard stats for a single company.
  ///
  /// All counts come from a single query to avoid N+1 round-trips.
  /// `total_recovered` sums `listed_price` on sold listings as a proxy —
  /// replace with a proper `sale_price` column once the payment flow is built.
  Future<DashboardSummary> summarize(String companyId) async {
    final result = await _db.query(
      '''
      SELECT
        COUNT(*) FILTER (WHERE status = 'active')           AS active_listings,
        SUM(listed_price) FILTER (WHERE status = 'active')  AS total_listed_value,
        SUM(listed_price) FILTER (WHERE status = 'sold')    AS total_recovered,
        COUNT(*) FILTER (WHERE valuation_flag = 'seller_overpriced'
                           AND status = 'active')           AS overpriced_count
      FROM listings
      WHERE company_id = @cid
      ''',
      parameters: {'cid': companyId},
    );

    // Pending offers: join against this company's active listings.
    final offerResult = await _db.query(
      '''
      SELECT COUNT(*) AS pending_offers
      FROM buyer_offers bo
      JOIN listings l ON l.id = bo.listing_id
      WHERE l.company_id = @cid AND bo.status = 'pending'
      ''',
      parameters: {'cid': companyId},
    );

    final row    = result.first.toColumnMap();
    final oRow   = offerResult.first.toColumnMap();

    return DashboardSummary(
      activeListings:    (row['active_listings']    as int?)    ?? 0,
      pendingOffers:     (oRow['pending_offers']    as int?)    ?? 0,
      totalListedValue:  _toDouble(row['total_listed_value'])   ?? 0.0,
      totalRecovered:    _toDouble(row['total_recovered'])      ?? 0.0,
      overpricedCount:   (row['overpriced_count']   as int?)    ?? 0,
    );
  }

  static double? _toDouble(Object? v) =>
      v == null ? null : (v as num).toDouble();
}
