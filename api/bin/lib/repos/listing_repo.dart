/// Listings data-access. The marketplace browse, seller listings, and
/// AMPS quick-list flows all hit through here.


import '../db/pool.dart';
import '../models/json_helpers.dart';
import '../models/listing.dart';
import '../models/paginated.dart';

class MarketplaceFilters {
  MarketplaceFilters({
    this.assetType,
    this.conditionGrade,
    this.maxPrice,
    this.search,
    this.page = 1,
    this.pageSize = 24,
  });

  final String? assetType;
  final String? conditionGrade;
  final double? maxPrice;
  final String? search;
  final int page;
  final int pageSize;
}

/// Columns joined for both marketplace and seller-side listing queries.
const _listingCols = '''
  l.id, l.asset_id, l.company_id, l.listed_price, l.seller_offer_price,
  l.buyer_ask_price, l.gross_margin, l.consumer_market_anchor,
  l.fair_market_value, l.est_book_value, l.seller_recovery_ratio,
  l.depreciation_pct, l.age_months, l.valuation_flag, l.status,
  l.last_valued_at, l.created_at,
  a.model_name, a.asset_type, a.condition_grade, a.quantity,
  a.cpu_score, a.ram_gb, a.storage_gb
''';

/// Extra columns exposed on the public marketplace (seller is partially masked).
const _marketplaceCols = '''
  $_listingCols,
  c.name      AS seller_name,
  c.industry  AS seller_industry,
  c.size_band AS seller_size_band
''';

class ListingRepo {
  ListingRepo(this._db);
  final Db _db;

  /// Public marketplace browse — only returns active listings.
  Future<PaginatedResponse<MarketplaceListing>> searchActive(
    MarketplaceFilters filters,
  ) async {
    final where = StringBuffer(
      "WHERE l.status = 'active'",
    );
    final params = <String, Object?>{};

    if (filters.assetType != null) {
      where.write(' AND a.asset_type = @assetType::asset_type');
      params['assetType'] = filters.assetType;
    }
    if (filters.conditionGrade != null) {
      where.write(' AND a.condition_grade = @condGrade::condition_grade');
      params['condGrade'] = filters.conditionGrade;
    }
    if (filters.maxPrice != null) {
      where.write(' AND l.listed_price <= @maxPrice');
      params['maxPrice'] = filters.maxPrice;
    }
    if (filters.search != null && filters.search!.isNotEmpty) {
      where.write(' AND a.model_name ILIKE @search');
      params['search'] = '%${filters.search}%';
    }

    // Run count first — params must not contain @limit/@offset yet, as
    // postgres Sql.named() rejects superfluous variables.
    final countResult = await _db.query(
      '''
      SELECT COUNT(*) AS n
      FROM listings l
      JOIN assets a    ON a.id = l.asset_id
      JOIN companies c ON c.id = l.company_id
      $where
      ''',
      parameters: params,
    );
    final total = numToIntOrNull(countResult.first.toColumnMap()['n']) ?? 0;

    final offset = (filters.page - 1) * filters.pageSize;
    params['limit']  = filters.pageSize;
    params['offset'] = offset;

    final rows = await _db.query(
      '''
      SELECT $_marketplaceCols
      FROM listings l
      JOIN assets a    ON a.id = l.asset_id
      JOIN companies c ON c.id = l.company_id
      $where
      ORDER BY l.created_at DESC
      LIMIT @limit OFFSET @offset
      ''',
      parameters: params,
    );

    return PaginatedResponse.paginate(
      data:     rows.map((r) => MarketplaceListing.fromRow(r.toColumnMap())).toList(),
      total:    total,
      page:     filters.page,
      pageSize: filters.pageSize,
    );
  }

  /// Single active listing by id, joined with seller industry/size_band.
  Future<MarketplaceListing?> findActiveById(String id) async {
    final result = await _db.query(
      '''
      SELECT $_marketplaceCols
      FROM listings l
      JOIN assets a    ON a.id = l.asset_id
      JOIN companies c ON c.id = l.company_id
      WHERE l.id = @id AND l.status = 'active'
      LIMIT 1
      ''',
      parameters: {'id': id},
    );
    if (result.isEmpty) return null;
    return MarketplaceListing.fromRow(result.first.toColumnMap());
  }

  /// Seller-side: every listing for a company, regardless of status.
  Future<List<Listing>> findByCompany(String companyId) async {
    final result = await _db.query(
      '''
      SELECT $_listingCols
      FROM listings l
      JOIN assets a ON a.id = l.asset_id
      WHERE l.company_id = @cid
      ORDER BY l.created_at DESC
      ''',
      parameters: {'cid': companyId},
    );
    return result.map((r) => Listing.fromRow(r.toColumnMap())).toList();
  }

  /// Create a draft listing. If [fairMarketValue] is provided (from an ML
  /// call made by the route handler) the valuation flag is computed here;
  /// otherwise it defaults to 'insufficient_data'.
  ///
  /// TODO: The route handler for POST /seller/listings should call
  /// MlClient.estimateFairMarketValue before calling this method so that
  /// fair_market_value is always populated on creation.
  Future<Listing> create({
    required String companyId,
    required String assetId,
    required double listedPrice,
    double? fairMarketValue,
  }) async {
    final flag = _valuationFlag(listedPrice, fairMarketValue);

    final result = await _db.query(
      '''
      INSERT INTO listings
        (asset_id, company_id, listed_price, fair_market_value, valuation_flag, status)
      VALUES
        (@assetId, @cid, @price, @fmv, @flag::valuation_flag, 'draft')
      RETURNING
        id, asset_id, company_id, listed_price, seller_offer_price,
        buyer_ask_price, gross_margin, consumer_market_anchor,
        fair_market_value, est_book_value, seller_recovery_ratio,
        depreciation_pct, age_months, valuation_flag, status,
        last_valued_at, created_at
      ''',
      parameters: {
        'assetId': assetId,
        'cid':     companyId,
        'price':   listedPrice,
        'fmv':     fairMarketValue,
        'flag':    flag,
      },
    );
    return Listing.fromRow(result.first.toColumnMap());
  }

  /// Publish a draft listing (draft → active).
  Future<Listing> publish({required String id, required String companyId}) async {
    final result = await _db.query(
      '''
      UPDATE listings
      SET status = 'active'
      WHERE id = @id AND company_id = @cid AND status = 'draft'
      RETURNING
        id, asset_id, company_id, listed_price, seller_offer_price,
        buyer_ask_price, gross_margin, consumer_market_anchor,
        fair_market_value, est_book_value, seller_recovery_ratio,
        depreciation_pct, age_months, valuation_flag, status,
        last_valued_at, created_at
      ''',
      parameters: {'id': id, 'cid': companyId},
    );
    if (result.isEmpty) throw StateError('Listing $id not found or is not a draft');
    return Listing.fromRow(result.first.toColumnMap());
  }

  /// Update the listed price and recompute the valuation flag against the
  /// existing FMV on record. Pass [fairMarketValue] to override the stored FMV
  /// (e.g. after a fresh ML call).
  Future<Listing> updatePrice({
    required String id,
    required String companyId,
    required double listedPrice,
    double? fairMarketValue,
  }) async {
    // Fetch existing FMV only when the caller didn't supply a new one.
    final existing = await _db.query(
      'SELECT fair_market_value FROM listings WHERE id = @id AND company_id = @cid LIMIT 1',
      parameters: {'id': id, 'cid': companyId},
    );
    if (existing.isEmpty) throw StateError('Listing $id not found');

    final fmv = fairMarketValue ??
        numToDoubleOrNull(existing.first.toColumnMap()['fair_market_value']);
    final flag = _valuationFlag(listedPrice, fmv);

    final result = await _db.query(
      '''
      UPDATE listings SET
        listed_price       = @price,
        fair_market_value  = COALESCE(@fmv, fair_market_value),
        valuation_flag     = @flag::valuation_flag,
        last_valued_at     = CASE WHEN @fmv IS NOT NULL THEN now() ELSE last_valued_at END
      WHERE id = @id AND company_id = @cid
      RETURNING
        id, asset_id, company_id, listed_price, seller_offer_price,
        buyer_ask_price, gross_margin, consumer_market_anchor,
        fair_market_value, est_book_value, seller_recovery_ratio,
        depreciation_pct, age_months, valuation_flag, status,
        last_valued_at, created_at
      ''',
      parameters: {'id': id, 'cid': companyId, 'price': listedPrice, 'fmv': fmv, 'flag': flag},
    );
    return Listing.fromRow(result.first.toColumnMap());
  }

  /// Mark a listing as withdrawn. No-op if it's already inactive.
  Future<Listing> withdraw({required String id, required String companyId}) async {
    final result = await _db.query(
      '''
      UPDATE listings
      SET status = 'withdrawn'
      WHERE id = @id AND company_id = @cid
      RETURNING
        id, asset_id, company_id, listed_price, seller_offer_price,
        buyer_ask_price, gross_margin, consumer_market_anchor,
        fair_market_value, est_book_value, seller_recovery_ratio,
        depreciation_pct, age_months, valuation_flag, status,
        last_valued_at, created_at
      ''',
      parameters: {'id': id, 'cid': companyId},
    );
    // If zero rows updated the listing doesn't exist / wrong company.
    if (result.isEmpty) throw StateError('Listing $id not found for company $companyId');
    return Listing.fromRow(result.first.toColumnMap());
  }

  /// Update the fair_market_value on a specific listing and recompute its
  /// valuation flag. Used by the background valuation job that runs after
  /// a company signs up for AMPS.
  ///
  /// No-ops silently if the listing has been removed or moved to a terminal
  /// status between the time the job started and this call.
  Future<void> updateFmvByListingId({
    required String listingId,
    required String companyId,
    required double fmv,
  }) async {
    // Re-fetch the current listed_price so the valuation flag stays accurate.
    final existing = await _db.query(
      '''
      SELECT listed_price FROM listings
      WHERE id = @id AND company_id = @cid
        AND status NOT IN ('sold', 'withdrawn')
      LIMIT 1
      ''',
      parameters: {'id': listingId, 'cid': companyId},
    );
    if (existing.isEmpty) return; // removed or terminal before job reached it

    final listedPrice =
        numToDoubleOrNull(existing.first.toColumnMap()['listed_price']) ?? 0.0;
    final flag = _valuationFlag(listedPrice, fmv);

    await _db.query(
      '''
      UPDATE listings
      SET fair_market_value = @fmv,
          valuation_flag    = @flag::valuation_flag,
          last_valued_at    = now()
      WHERE id = @id AND company_id = @cid
      ''',
      parameters: {
        'id':   listingId,
        'cid':  companyId,
        'fmv':  fmv,
        'flag': flag,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Compute the valuation flag from the listed price vs FMV.
  ///
  /// Thresholds are deliberately conservative — a 20% premium over FMV counts
  /// as overpriced. Adjust if market data suggests otherwise.
  static String _valuationFlag(double listedPrice, double? fmv) {
    if (fmv == null || fmv <= 0) return 'insuffici