/// Per-asset valuation history — one row per ML valuation event.
///
/// Written by two callers:
///   - seller/listings (source: 'listing') — valuation done at listing creation
///   - valuation/estimate (source: 'estimate') — on-demand calculator call
///
/// Query helpers expose the history for the AMPS asset detail view and the
/// DevDash market data dashboard.
library;

import '../db/pool.dart';
import '../models/json_helpers.dart';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class AssetValuation {
  AssetValuation({
    required this.id,
    required this.assetId,
    this.listingId,
    required this.source,
    required this.modelName,
    required this.assetType,
    required this.conditionGrade,
    required this.ageMonths,
    required this.fairMarketValue,
    required this.confidence,
    required this.modelVersion,
    this.listedPrice,
    this.priceToFmvRatio,
    required this.createdAt,
  });

  final String id;
  final String assetId;
  final String? listingId;
  final String source;         // 'listing' | 'estimate' | 'scheduled'
  final String modelName;
  final String assetType;
  final String conditionGrade;
  final int ageMonths;
  final double fairMarketValue;
  final double confidence;
  final String modelVersion;
  final double? listedPrice;
  final double? priceToFmvRatio;
  final DateTime createdAt;

  Map<String, dynamic> toJson() => {
        'id': id,
        'asset_id': assetId,
        if (listingId != null) 'listing_id': listingId,
        'source': source,
        'model_name': modelName,
        'asset_type': assetType,
        'condition_grade': conditionGrade,
        'age_months': ageMonths,
        'fair_market_value': fairMarketValue,
        'confidence': confidence,
        'model_version': modelVersion,
        if (listedPrice != null) 'listed_price': listedPrice,
        if (priceToFmvRatio != null) 'price_to_fmv_ratio': priceToFmvRatio,
        'created_at': createdAt.toIso8601String(),
      };

  static AssetValuation fromRow(Map<String, dynamic> row) => AssetValuation(
        id: row['id'] as String,
        assetId: row['asset_id'] as String,
        listingId: row['listing_id'] as String?,
        source: row['source'] as String,
        modelName: row['model_name'] as String,
        assetType: row['asset_type'] as String,
        conditionGrade: row['condition_grade'] as String,
        ageMonths: numToIntOrNull(row['age_months']) ?? 0,
        fairMarketValue: numToDoubleOrNull(row['fair_market_value']) ?? 0.0,
        confidence: numToDoubleOrNull(row['confidence']) ?? 0.0,
        modelVersion: row['model_version'] as String,
        listedPrice:    numToDoubleOrNull(row['listed_price']),
        priceToFmvRatio: numToDoubleOrNull(row['price_to_fmv_ratio']),
        createdAt: row['created_at'] as DateTime,
      );
}

// ---------------------------------------------------------------------------
// Repo
// ---------------------------------------------------------------------------

class AssetValuationRepo {
  AssetValuationRepo(this._db);
  final Db _db;

  /// Record a new valuation event for an asset.
  ///
  /// [listedPrice] and [listingId] are only set when [source] is 'listing'.
  /// [priceToFmvRatio] is computed automatically when [listedPrice] is given.
  Future<AssetValuation> record({
    required String assetId,
    String? listingId,
    required String source,
    required String modelName,
    required String assetType,
    required String conditionGrade,
    required int ageMonths,
    required double fairMarketValue,
    required double confidence,
    required String modelVersion,
    double? listedPrice,
  }) async {
    final ratio = (listedPrice != null && fairMarketValue > 0)
        ? double.parse((listedPrice / fairMarketValue).toStringAsFixed(4))
        : null;

    final rows = await _db.query(
      '''
      INSERT INTO asset_valuations (
        asset_id, listing_id, source,
        model_name, asset_type, condition_grade, age_months,
        fair_market_value, confidence, model_version,
        listed_price, price_to_fmv_ratio
      ) VALUES (
        @assetId, @listingId, @source::valuation_source,
        @modelName, @assetType, @conditionGrade, @ageMonths,
        @fmv, @confidence, @modelVersion,
        @listedPrice, @ratio
      )
      RETURNING *
      ''',
      parameters: {
        'assetId': assetId,
        'listingId': listingId,
        'source': source,
        'modelName': modelName,
        'assetType': assetType,
        'conditionGrade': conditionGrade,
        'ageMonths': ageMonths,
        'fmv': fairMarketValue,
        'confidence': confidence,
        'modelVersion': modelVersion,
        'listedPrice': listedPrice,
        'ratio': ratio,
      },
    );
    return AssetValuation.fromRow(rows.first.toColumnMap());
  }

  /// Full valuation history for a single asset, newest first.
  Future<List<AssetValuation>> findByAsset(
    String assetId, {
    int limit = 50,
  }) async {
    final rows = await _db.query(
      '''
      SELECT * FROM asset_valuations
      WHERE asset_id = @assetId
      ORDER BY created_at DESC
      LIMIT @limit
      ''',
      parameters: {'assetId': assetId, 'limit': limit},
    );
    return rows.map((r) => AssetValuation.fromRow(r.toColumnMap())).toList();
  }

  /// Most recent valuation for an asset — used by the asset detail card.
  Future<AssetValuation?> latestForAsset(String assetId) async {
    final rows = await _db.query(
      '''
      SELECT * FROM asset_valuations
      WHERE asset_id = @assetId
      ORDER BY created_at DESC
      LIMIT 1
      ''',
      parameters: {'assetId': assetId},
    );
    if (rows.isEmpty) return null;
    return AssetValuation.fromRow(rows.first.toColumnMap());
  }

  /// Aggregate price-to-FMV ratio stats per asset type over a time window.
  /// Used by the DevDash market data dashboard.
  Future<List<Map<String, dynamic>>> marketRatioStats({
    Duration window = const Duration(days: 30),
  }) async {
    final since = DateTime.now().subtract(window).toUtc().toIso8601String();
    final rows = await _db.query(
      '''
      SELECT
        asset_type,
        COUNT(*)                                  AS count,
        ROUND(AVG(price_to_fmv_ratio)::NUMERIC, 4) AS avg_ratio,
        ROUND(MIN(price_to_fmv_ratio)::NUMERIC, 4) AS min_ratio,
        ROUND(MAX(price_to_fmv_ratio)::NUMERIC, 4) AS max_ratio,
        ROUND(AVG(fair_market_value)::NUMERIC, 2)   AS avg_fmv
      FROM asset_valuations
      WHERE listed_price IS NOT NULL
        AND created_at >= @since
      GROUP BY asset_type
      ORDER BY count DESC
      ''',
      parameters: {'since': since},
    );
    return rows.map((r) => r.toColumnMap()).toList();
  }
}
