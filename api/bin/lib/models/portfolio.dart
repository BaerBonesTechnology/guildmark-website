import 'package:freezed_annotation/freezed_annotation.dart';

import 'package:guildmark_api/models/json_helpers.dart';

part 'portfolio.freezed.dart';
part 'portfolio.g.dart';

@Freezed()
abstract class ValuationSnapshot with _$ValuationSnapshot {
  const ValuationSnapshot._();

  const factory ValuationSnapshot({
    @DateOnlyConverter() required DateTime snapshotDate,
    required double totalPortfolioValue,
    required double totalBookValue,
    required double totalDepreciation,
    required int totalDevices,
  }) = _ValuationSnapshot;

  factory ValuationSnapshot.fromJson(Map<String, dynamic> json) =>
      _$ValuationSnapshotFromJson(json);

  factory ValuationSnapshot.fromRow(Map<String, dynamic> row) =>
      ValuationSnapshot(
        snapshotDate: row['snapshot_date'] as DateTime,
        totalPortfolioValue:
            numToDoubleOrNull(row['total_portfolio_value']) ?? 0.0,
        totalBookValue: numToDoubleOrNull(row['total_book_value']) ?? 0.0,
        totalDepreciation: numToDoubleOrNull(row['total_depreciation']) ?? 0.0,
        totalDevices: numToIntOrNull(row['total_devices']) ?? 0,
      );
}

@Freezed()
abstract class PortfolioBucket with _$PortfolioBucket {
  const factory PortfolioBucket({
    required int count,
    required double value,
  }) = _PortfolioBucket;

  factory PortfolioBucket.fromJson(Map<String, dynamic> json) =>
      _$PortfolioBucketFromJson(json);
}

@Freezed()
abstract class PortfolioSummary with _$PortfolioSummary {
  const factory PortfolioSummary({
    required int totalDevices,
    required double totalPortfolioValue,
    required double totalBookValue,
    required double totalDepreciation,
    required double depreciationPct,
    required double avgAssetAgeMonths,
    required int assetsAtRisk,
    required Map<String, PortfolioBucket> byType,
    required Map<String, PortfolioBucket> byCondition,
    required List<ValuationSnapshot> trend,
  }) = _PortfolioSummary;

  factory PortfolioSummary.fromJson(Map<String, dynamic> json) =>
      _$PortfolioSummaryFromJson(json);
}
