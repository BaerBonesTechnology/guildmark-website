/// Appwrite implementation of AssetValuationRepo — ML valuation history
/// (see ../../../POSTGRES_TO_APPWRITE.md and mailing_list_repo.dart for the
/// reference pattern).
///
/// The public interface is IDENTICAL to the Postgres AssetValuationRepo so
/// the routes that consume it don't change; only the constructor dependency
/// (AppwriteService instead of Db) and the bodies differ.
///
/// Money is stored as integer cents (`fair_market_value_cents`,
/// `listed_price_cents`); confidence and price_to_fmv_ratio stay floats
/// (non-money). The public model keeps double dollars — converted at the
/// boundary. `created_at` → the system `$createdAt` field.
library;

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';

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
  final String source; // 'listing' | 'estimate' | 'scheduled'
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

  /// Build from an Appwrite row. `$id`/`$createdAt` are system fields; money
  /// comes back as integer cents and is surfaced as double dollars.
  factory AssetValuation.fromRow(Row row) {
    final d = row.data;
    return AssetValuation(
      id: row.$id,
      assetId: d['asset_id'] as String,
      listingId: d['listing_id'] as String?,
      source: (d['source'] as String?) ?? 'estimate',
      modelName: d['model_name'] as String,
      assetType: d['asset_type'] as String,
      conditionGrade: d['condition_grade'] as String,
      ageMonths: (d['age_months'] as num?)?.toInt() ?? 0,
      fairMarketValue:
          _centsToDollars(d['fair_market_value_cents']) ?? 0.0,
      confidence: (d['confidence'] as num?)?.toDouble() ?? 0.0,
      modelVersion: d['model_version'] as String,
      listedPrice: _centsToDollars(d['listed_price_cents']),
      priceToFmvRatio: (d['price_to_fmv_ratio'] as num?)?.toDouble(),
      createdAt: DateTime.parse(row.$createdAt),
    );
  }

  static double? _centsToDollars(Object? cents) =>
      cents == null ? null : (cents as num).toInt() / 100.0;
}

// ---------------------------------------------------------------------------
// Repo
// ---------------------------------------------------------------------------

class AssetValuationRepo {
  AssetValuationRepo(this._aw);
  final AppwriteService _aw;

  TablesDB get _db => _aw.tablesDB;

  static const _pageSize = 100;

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

    final row = await _db.createRow(
      databaseId: Aw.databaseId,
      tableId: Aw.assetValuations,
      rowId: ID.unique(),
      data: {
        'asset_id': assetId,
        if (listingId != null) 'listing_id': listingId,
        'source': source,
        'model_name': modelName,
        'asset_type': assetType,
        'condition_grade': conditionGrade,
        'age_months': ageMonths,
        'fair_market_value_cents': (fairMarketValue * 100).round(),
        'confidence': confidence,
        'model_version': modelVersion,
        if (listedPrice != null)
          'listed_price_cents': (listedPrice * 100).round(),
        if (ratio != null) 'price_to_fmv_ratio': ratio,
      },
    );
    return AssetValuation.fromRow(row);
  }

  Future<List<AssetValuation>> findByAsset(
    String assetId, {
    int limit = 50,
  }) async {
    final res = await _db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.assetValuations,
      queries: [
        Query.equal('asset_id', assetId),
        Query.orderDesc(r'$createdAt'),
        Query.limit(limit),
      ],
    );
    return res.rows.map(AssetValuation.fromRow).toList();
  }

  Future<AssetValuation?> latestForAsset(String assetId) async {
    final res = await _db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.assetValuations,
      queries: [
        Query.equal('asset_id', assetId),
        Query.orderDesc(r'$createdAt'),
        Query.limit(1),
      ],
    );
    if (res.rows.isEmpty) return null;
    return AssetValuation.fromRow(res.rows.first);
  }

  /// Per-asset-type ratio stats over the recent window.
  ///
  /// Appwrite has no GROUP BY/AVG/MIN/MAX (§1c): page every valuation with a
  /// listed price in the window and reduce in Dart. The window bounds the set
  /// size, so the fetch stays manageable.
  Future<List<Map<String, dynamic>>> marketRatioStats({
    Duration window = const Duration(days: 30),
  }) async {
    final since = DateTime.now().subtract(window).toUtc().toIso8601String();

    final rows = <Row>[];
    var offset = 0;
    while (true) {
      final res = await _db.listRows(
        databaseId: Aw.databaseId,
        tableId: Aw.assetValuations,
        queries: [
          Query.isNotNull('listed_price_cents'),
          Query.greaterThanEqual(r'$createdAt', since),
          Query.limit(_pageSize),
          Query.offset(offset),
        ],
      );
      rows.addAll(res.rows);
      if (res.rows.length < _pageSize) break;
      offset += _pageSize;
    }

    // GROUP BY asset_type with COUNT/AVG/MIN/MAX reductions.
    final stats = <String, _RatioAccumulator>{};
    for (final r in rows) {
      final type = (r.data['asset_type'] as String?) ?? 'other';
      stats.putIfAbsent(type, _RatioAccumulator.new).add(
            ratio: (r.data['price_to_fmv_ratio'] as num?)?.toDouble(),
            fmvDollars:
                ((r.data['fair_market_value_cents'] as num?)?.toInt() ?? 0) /
                    100.0,
          );
    }

    final result = stats.entries
        .map(
          (e) => <String, dynamic>{
            'asset_type': e.key,
            'count': e.value.count,
            'avg_ratio': e.value.avgRatio,
            'min_ratio': e.value.minRatio,
            'max_ratio': e.value.maxRatio,
            'avg_fmv': e.value.avgFmv,
          },
        )
        .toList()
      ..sort((a, b) => (b['count'] as int).compareTo(a['count'] as int));
    return result;
  }
}

/// Accumulator for [AssetValuationRepo.marketRatioStats] reductions.
class _RatioAccumulator {
  int count = 0;
  int _ratioCount = 0;
  double _ratioSum = 0;
  double? _ratioMin;
  double? _ratioMax;
  double _fmvSum = 0;

  void add({required double? ratio, required double fmvDollars}) {
    count++;
    _fmvSum += fmvDollars;
    if (ratio != null) {
      _ratioCount++;
      _ratioSum += ratio;
      _ratioMin = _ratioMin == null || ratio < _ratioMin! ? ratio : _ratioMin;
      _ratioMax = _ratioMax == null || ratio > _ratioMax! ? ratio : _ratioMax;
    }
  }

  // SQL AVG/MIN/MAX ignore NULLs; ROUND(…, 4) / ROUND(…, 2) preserved.
  double? get avgRatio =>
      _ratioCount == 0 ? null : _round(_ratioSum / _ratioCount, 4);
  double? get minRatio => _ratioMin == null ? null : _round(_ratioMin!, 4);
  double? get maxRatio => _ratioMax == null ? null : _round(_ratioMax!, 4);
  double get avgFmv => count == 0 ? 0 : _round(_fmvSum / count, 2);

  static double _round(double v, int places) =>
      double.parse(v.toStringAsFixed(places));
}
