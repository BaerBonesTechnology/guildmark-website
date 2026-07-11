/// Appwrite implementation of ListingRepo — same public interface as the
/// Postgres version (lib/repos/listing_repo.dart) so routes switch by
/// changing only the import (see ../../../POSTGRES_TO_APPWRITE.md §4).
///
/// The SQL JOINs (listings ⋈ assets ⋈ companies) become two/three queries +
/// app-side stitching per design doc §1b: fetch listings, then batch-fetch
/// the referenced asset/company rows by `$id` and merge in Dart. Money
/// columns are integer cents in Appwrite (`*_cents`); the public models keep
/// double dollars, converted at the boundary.
library;

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/models/json_helpers.dart';
import 'package:guildmark_api/models/listing.dart';
import 'package:guildmark_api/models/paginated.dart';

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

class ListingRepo {
  ListingRepo(this._aw);
  final AppwriteService _aw;

  TablesDB get _db => _aw.tablesDB;

  /// Public marketplace browse — only returns active listings.
  ///
  /// Asset-side filters (type, grade, model search) can't be pushed into the
  /// listings query, so this materializes the active set (listing-side
  /// filters applied server-side), stitches assets, filters in Dart, and
  /// paginates the result. Fine at marketplace volume; revisit with
  /// denormalized asset fields on the listing if it gets hot (§1b).
  Future<PaginatedResponse<MarketplaceListing>> searchActive(
    MarketplaceFilters filters,
  ) async {
    final listingRows = await _listAll(Aw.listings, [
      Query.equal('status', 'active'),
      if (filters.maxPrice != null)
        Query.lessThanEqual(
          'listed_price_cents',
          _dollarsToCents(filters.maxPrice),
        ),
      Query.orderDesc(r'$createdAt'),
    ]);

    // Stitch: batch-fetch the referenced assets, then filter like the JOIN.
    final assetsById = await _rowsByIds(
      Aw.assets,
      listingRows.map((r) => r.data['asset_id'] as String),
    );

    final search = filters.search?.toLowerCase();
    final filtered = <(Row, Row)>[];
    for (final listing in listingRows) {
      final asset = assetsById[listing.data['asset_id']];
      if (asset == null) continue; // INNER JOIN: drop orphaned listings
      final a = asset.data;
      if (filters.assetType != null && a['asset_type'] != filters.assetType) {
        continue;
      }
      if (filters.conditionGrade != null &&
          a['condition_grade'] != filters.conditionGrade) {
        continue;
      }
      if (search != null && search.isNotEmpty) {
        final model = (a['model_name'] as String? ?? '').toLowerCase();
        if (!model.contains(search)) continue; // ILIKE '%search%'
      }
      filtered.add((listing, asset));
    }

    final total = filtered.length;
    final offset = (filters.page - 1) * filters.pageSize;
    final page = offset >= filtered.length
        ? <(Row, Row)>[]
        : filtered.sublist(
            offset,
            (offset + filters.pageSize) > filtered.length
                ? filtered.length
                : offset + filters.pageSize,
          );

    // Seller (company) rows only for the returned page.
    final companiesById = await _rowsByIds(
      Aw.companies,
      page.map((p) => p.$1.data['company_id'] as String),
    );

    return PaginatedResponse.paginate(
      data: page
          .map(
            (p) => _marketplaceFromRows(
              p.$1,
              asset: p.$2,
              company: companiesById[p.$1.data['company_id']],
            ),
          )
          .toList(),
      total: total,
      page: filters.page,
      pageSize: filters.pageSize,
    );
  }

  /// Single active listing by id, joined with seller industry/size_band.
  Future<MarketplaceListing?> findActiveById(String id) async {
    final listing = await _getRowOrNull(Aw.listings, id);
    if (listing == null || listing.data['status'] != 'active') return null;

    final asset =
        await _getRowOrNull(Aw.assets, listing.data['asset_id'] as String);
    if (asset == null) return null; // INNER JOIN semantics

    final company =
        await _getRowOrNull(Aw.companies, listing.data['company_id'] as String);

    return _marketplaceFromRows(listing, asset: asset, company: company);
  }

  /// Seller-side: every listing for a company, regardless of status.
  Future<List<Listing>> findByCompany(String companyId) async {
    final listingRows = await _listAll(Aw.listings, [
      Query.equal('company_id', companyId),
      Query.orderDesc(r'$createdAt'),
    ]);

    final assetsById = await _rowsByIds(
      Aw.assets,
      listingRows.map((r) => r.data['asset_id'] as String),
    );

    return [
      for (final listing in listingRows)
        if (assetsById[listing.data['asset_id']] case final Row asset)
          _listingFromRows(listing, asset: asset),
    ];
  }

  /// Create a draft listing. If [fairMarketValue] is provided (from an ML
  /// call made by the route handler) the valuation flag is computed here;
  /// otherwise it defaults to 'insufficient_data'.
  Future<Listing> create({
    required String companyId,
    required String assetId,
    required double listedPrice,
    double? fairMarketValue,
    List<String>? productImages,
  }) async {
    final flag = _valuationFlag(listedPrice, fairMarketValue);

    final row = await _db.createRow(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      rowId: ID.unique(),
      data: {
        'asset_id': assetId,
        'company_id': companyId,
        'listed_price_cents': _dollarsToCents(listedPrice),
        'fair_market_value_cents': _dollarsToCents(fairMarketValue),
        'valuation_flag': flag,
        'status': 'draft',
        if (productImages != null && productImages.isNotEmpty)
          'product_images': productImages,
      },
    );
    // Like the Postgres RETURNING (no asset join), the asset-derived fields
    // on the returned model are null.
    return _listingFromRows(row);
  }

  /// Publish a draft listing (draft → active).
  Future<Listing> publish({
    required String id,
    required String companyId,
  }) async {
    final existing = await _getRowOrNull(Aw.listings, id);
    if (existing == null ||
        existing.data['company_id'] != companyId ||
        existing.data['status'] != 'draft') {
      throw StateError('Listing $id not found or is not a draft');
    }
    final row = await _db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      rowId: id,
      data: {'status': 'active'},
    );
    return _listingFromRows(row);
  }

  /// Update the listed price and recompute the valuation flag against the
  /// existing FMV on record. Pass [fairMarketValue] to override the stored
  /// FMV (e.g. after a fresh ML call).
  Future<Listing> updatePrice({
    required String id,
    required String companyId,
    required double listedPrice,
    double? fairMarketValue,
  }) async {
    final existing = await _getRowOrNull(Aw.listings, id);
    if (existing == null || existing.data['company_id'] != companyId) {
      throw StateError('Listing $id not found');
    }

    final fmv = fairMarketValue ??
        _centsToDollars(existing.data['fair_market_value_cents']);
    final flag = _valuationFlag(listedPrice, fmv);

    final row = await _db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      rowId: id,
      data: {
        'listed_price_cents': _dollarsToCents(listedPrice),
        // COALESCE(@fmv, fair_market_value): only write when non-null.
        if (fmv != null) 'fair_market_value_cents': _dollarsToCents(fmv),
        'valuation_flag': flag,
        // CASE WHEN @fmv IS NOT NULL THEN now() — @fmv is the coalesced value.
        if (fmv != null)
          'last_valued_at': DateTime.now().toUtc().toIso8601String(),
      },
    );
    return _listingFromRows(row);
  }

  /// Mark a listing as withdrawn. No-op if it's already inactive.
  Future<Listing> withdraw({
    required String id,
    required String companyId,
  }) async {
    final existing = await _getRowOrNull(Aw.listings, id);
    if (existing == null || existing.data['company_id'] != companyId) {
      throw StateError('Listing $id not found for company $companyId');
    }
    final row = await _db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      rowId: id,
      data: {'status': 'withdrawn'},
    );
    return _listingFromRows(row);
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
    final existing = await _getRowOrNull(Aw.listings, listingId);
    if (existing == null ||
        existing.data['company_id'] != companyId ||
        existing.data['status'] == 'sold' ||
        existing.data['status'] == 'withdrawn') {
      return; // removed or terminal before job reached it
    }

    final listedPrice =
        _centsToDollars(existing.data['listed_price_cents']) ?? 0.0;
    final flag = _valuationFlag(listedPrice, fmv);

    try {
      await _db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.listings,
        rowId: listingId,
        data: {
          'fair_market_value_cents': _dollarsToCents(fmv),
          'valuation_flag': flag,
          'last_valued_at': DateTime.now().toUtc().toIso8601String(),
        },
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return; // deleted between read and write — no-op
      rethrow;
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Compute the valuation flag from the listed price vs FMV.
  ///
  /// Thresholds are deliberately conservative — a 20% premium over FMV counts
  /// as overpriced. Adjust if market data suggests otherwise.
  static String _valuationFlag(double listedPrice, double? fmv) {
    if (fmv == null || fmv <= 0) return 'insufficient_data';
    final ratio = listedPrice / fmv;
    if (ratio >= 1.20) return 'seller_overpriced';
    if (ratio <= 0.60) return 'distressed';
    return 'standard';
  }

  Future<Row?> _getRowOrNull(String tableId, String rowId) async {
    try {
      return await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: tableId,
        rowId: rowId,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  /// Page through every row matching [queries].
  Future<List<Row>> _listAll(String tableId, List<String> queries) async {
    const pageSize = 100;
    final rows = <Row>[];
    var offset = 0;
    while (true) {
      final res = await _db.listRows(
        databaseId: Aw.databaseId,
        tableId: tableId,
        queries: [...queries, Query.limit(pageSize), Query.offset(offset)],
      );
      rows.addAll(res.rows);
      if (res.rows.length < pageSize) break;
      offset += pageSize;
    }
    return rows;
  }

  /// Batch-fetch rows by `$id` (chunked — Query.equal with a value list has
  /// OR semantics, replacing SQL `IN (...)`).
  Future<Map<String, Row>> _rowsByIds(
    String tableId,
    Iterable<String> ids,
  ) async {
    const chunkSize = 100;
    final unique = ids.toSet().toList();
    final byId = <String, Row>{};
    for (var i = 0; i < unique.length; i += chunkSize) {
      final end =
          (i + chunkSize) > unique.length ? unique.length : i + chunkSize;
      final chunk = unique.sublist(i, end);
      final res = await _db.listRows(
        databaseId: Aw.databaseId,
        tableId: tableId,
        queries: [Query.equal(r'$id', chunk), Query.limit(chunk.length)],
      );
      for (final row in res.rows) {
        byId[row.$id] = row;
      }
    }
    return byId;
  }

  Listing _listingFromRows(Row row, {Row? asset}) {
    final d = row.data;
    final a = asset?.data;
    return Listing(
      id: row.$id,
      assetId: d['asset_id'] as String,
      companyId: d['company_id'] as String,
      valuationFlag: (d['valuation_flag'] as String?) ?? 'standard',
      status: (d['status'] as String?) ?? 'draft',
      createdAt: DateTime.parse(row.$createdAt),
      listedPrice: _centsToDollars(d['listed_price_cents']),
      sellerOfferPrice: _centsToDollars(d['seller_offer_price_cents']),
      buyerAskPrice: _centsToDollars(d['buyer_ask_price_cents']),
      grossMargin: _centsToDollars(d['gross_margin_cents']),
      consumerMarketAnchor: _centsToDollars(d['consumer_market_anchor_cents']),
      fairMarketValue: _centsToDollars(d['fair_market_value_cents']),
      estBookValue: _centsToDollars(d['est_book_value_cents']),
      sellerRecoveryRatio: numToDoubleOrNull(d['seller_recovery_ratio']),
      depreciationPct: numToDoubleOrNull(d['depreciation_pct']),
      ageMonths: numToIntOrNull(d['age_months']),
      lastValuedAt: _dt(d['last_valued_at']),
      modelName: a?['model_name'] as String?,
      assetType: a?['asset_type'] as String?,
      conditionGrade: a?['condition_grade'] as String?,
      quantity: numToIntOrNull(a?['quantity']),
      cpuScore: numToDoubleOrNull(a?['cpu_score']),
      ramGb: numToDoubleOrNull(a?['ram_gb']),
      storageGb: numToDoubleOrNull(a?['storage_gb']),
      productImages: _strList(d['product_images']),
      manufacturer: a?['manufacturer'] as String?,
      modelNumber: a?['model_number'] as String?,
      yearOfManufacture: numToIntOrNull(a?['year_of_manufacture']),
      functionalStatus: a?['functional_status'] as String?,
      knownDefects: a?['known_defects'] as String?,
      dataWipeStatus: a?['data_wipe_status'] as String?,
      warrantyStatus: a?['warranty_status'] as String?,
      warrantyExpiration: _dt(a?['warranty_expiration']),
      includedAccessories: a?['included_accessories'] as String?,
      shipsFromLocation: a?['ships_from_location'] as String?,
      cpuModel: a?['cpu_model'] as String?,
      cpuCores: numToIntOrNull(a?['cpu_cores']),
      cpuSpeedGhz: numToDoubleOrNull(a?['cpu_speed_ghz']),
      ramType: a?['ram_type'] as String?,
      storageType: a?['storage_type'] as String?,
      gpuModel: a?['gpu_model'] as String?,
      screenSizeIn: numToDoubleOrNull(a?['screen_size_in']),
      screenResolution: a?['screen_resolution'] as String?,
      touchscreen: a?['touchscreen'] as bool?,
      formFactor: a?['form_factor'] as String?,
      powerSupplyWatts: numToIntOrNull(a?['power_supply_watts']),
      panelType: a?['panel_type'] as String?,
      refreshRateHz: numToIntOrNull(a?['refresh_rate_hz']),
      ports: a?['ports'] as String?,
      portCount: numToIntOrNull(a?['port_count']),
      throughput: a?['throughput'] as String?,
      managed: a?['managed'] as bool?,
      carrierLocked: a?['carrier_locked'] as bool?,
    );
  }

  MarketplaceListing _marketplaceFromRows(
    Row row, {
    required Row asset,
    Row? company,
  }) {
    final d = row.data;
    final a = asset.data;
    final c = company?.data;
    return MarketplaceListing(
      id: row.$id,
      assetId: d['asset_id'] as String,
      companyId: d['company_id'] as String,
      valuationFlag: (d['valuation_flag'] as String?) ?? 'standard',
      status: (d['status'] as String?) ?? 'draft',
      createdAt: DateTime.parse(row.$createdAt),
      listedPrice: _centsToDollars(d['listed_price_cents']),
      sellerOfferPrice: _centsToDollars(d['seller_offer_price_cents']),
      buyerAskPrice: _centsToDollars(d['buyer_ask_price_cents']),
      grossMargin: _centsToDollars(d['gross_margin_cents']),
      consumerMarketAnchor: _centsToDollars(d['consumer_market_anchor_cents']),
      fairMarketValue: _centsToDollars(d['fair_market_value_cents']),
      estBookValue: _centsToDollars(d['est_book_value_cents']),
      sellerRecoveryRatio: numToDoubleOrNull(d['seller_recovery_ratio']),
      depreciationPct: numToDoubleOrNull(d['depreciation_pct']),
      ageMonths: numToIntOrNull(d['age_months']),
      lastValuedAt: _dt(d['last_valued_at']),
      modelName: a['model_name'] as String?,
      assetType: a['asset_type'] as String?,
      conditionGrade: a['condition_grade'] as String?,
      quantity: numToIntOrNull(a['quantity']),
      cpuScore: numToDoubleOrNull(a['cpu_score']),
      ramGb: numToDoubleOrNull(a['ram_gb']),
      storageGb: numToDoubleOrNull(a['storage_gb']),
      productImages: _strList(d['product_images']),
      manufacturer: a['manufacturer'] as String?,
      modelNumber: a['model_number'] as String?,
      yearOfManufacture: numToIntOrNull(a['year_of_manufacture']),
      functionalStatus: a['functional_status'] as String?,
      knownDefects: a['known_defects'] as String?,
      dataWipeStatus: a['data_wipe_status'] as String?,
      warrantyStatus: a['warranty_status'] as String?,
      warrantyExpiration: _dt(a['warranty_expiration']),
      includedAccessories: a['included_accessories'] as String?,
      shipsFromLocation: a['ships_from_location'] as String?,
      cpuModel: a['cpu_model'] as String?,
      cpuCores: numToIntOrNull(a['cpu_cores']),
      cpuSpeedGhz: numToDoubleOrNull(a['cpu_speed_ghz']),
      ramType: a['ram_type'] as String?,
      storageType: a['storage_type'] as String?,
      gpuModel: a['gpu_model'] as String?,
      screenSizeIn: numToDoubleOrNull(a['screen_size_in']),
      screenResolution: a['screen_resolution'] as String?,
      touchscreen: a['touchscreen'] as bool?,
      formFactor: a['form_factor'] as String?,
      powerSupplyWatts: numToIntOrNull(a['power_supply_watts']),
      panelType: a['panel_type'] as String?,
      refreshRateHz: numToIntOrNull(a['refresh_rate_hz']),
      ports: a['ports'] as String?,
      portCount: numToIntOrNull(a['port_count']),
      throughput: a['throughput'] as String?,
      managed: a['managed'] as bool?,
      carrierLocked: a['carrier_locked'] as bool?,
      sellerName: c?['name'] as String?,
      sellerIndustry: c?['industry'] as String?,
      sellerSizeBand: c?['size_band'] as String?,
    );
  }
}

/// Coerce an Appwrite array-column value (List&lt;dynamic&gt;) into a
/// `List&lt;String&gt;`. Null/empty → null so the field is omitted from JSON.
List<String>? _strList(Object? raw) {
  if (raw is! List || raw.isEmpty) return null;
  return raw.map((e) => e.toString()).toList();
}

double? _centsToDollars(Object? cents) =>
    cents == null ? null : (cents as num) / 100.0;

int? _dollarsToCents(double? dollars) =>
    dollars == null ? null : (dollars * 100).round();

DateTime? _dt(Object? iso) =>
    iso == null ? null : DateTime.parse(iso as String);
