// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'portfolio.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ValuationSnapshot _$ValuationSnapshotFromJson(Map<String, dynamic> json) =>
    _ValuationSnapshot(
      snapshotDate: const DateOnlyConverter().fromJson(
        json['snapshot_date'] as String,
      ),
      totalPortfolioValue: (json['total_portfolio_value'] as num).toDouble(),
      totalBookValue: (json['total_book_value'] as num).toDouble(),
      totalDepreciation: (json['total_depreciation'] as num).toDouble(),
      totalDevices: (json['total_devices'] as num).toInt(),
    );

Map<String, dynamic> _$ValuationSnapshotToJson(_ValuationSnapshot instance) =>
    <String, dynamic>{
      'snapshot_date': const DateOnlyConverter().toJson(instance.snapshotDate),
      'total_portfolio_value': instance.totalPortfolioValue,
      'total_book_value': instance.totalBookValue,
      'total_depreciation': instance.totalDepreciation,
      'total_devices': instance.totalDevices,
    };

_PortfolioBucket _$PortfolioBucketFromJson(Map<String, dynamic> json) =>
    _PortfolioBucket(
      count: (json['count'] as num).toInt(),
      value: (json['value'] as num).toDouble(),
    );

Map<String, dynamic> _$PortfolioBucketToJson(_PortfolioBucket instance) =>
    <String, dynamic>{'count': instance.count, 'value': instance.value};

_PortfolioSummary _$PortfolioSummaryFromJson(Map<String, dynamic> json) =>
    _PortfolioSummary(
      totalDevices: (json['total_devices'] as num).toInt(),
      totalPortfolioValue: (json['total_portfolio_value'] as num).toDouble(),
      totalBookValue: (json['total_book_value'] as num).toDouble(),
      totalDepreciation: (json['total_depreciation'] as num).toDouble(),
      depreciationPct: (json['depreciation_pct'] as num).toDouble(),
      avgAssetAgeMonths: (json['avg_asset_age_months'] as num).toDouble(),
      assetsAtRisk: (json['assets_at_risk'] as num).toInt(),
      byType: (json['by_type'] as Map<String, dynamic>).map(
        (k, e) =>
            MapEntry(k, PortfolioBucket.fromJson(e as Map<String, dynamic>)),
      ),
      byCondition: (json['by_condition'] as Map<String, dynamic>).map(
        (k, e) =>
            MapEntry(k, PortfolioBucket.fromJson(e as Map<String, dynamic>)),
      ),
      trend: (json['trend'] as List<dynamic>)
          .map((e) => ValuationSnapshot.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$PortfolioSummaryToJson(
  _PortfolioSummary instance,
) => <String, dynamic>{
  'total_devices': instance.totalDevices,
  'total_portfolio_value': instance.totalPortfolioValue,
  'total_book_value': instance.totalBookValue,
  'total_depreciation': instance.totalDepreciation,
  'depreciation_pct': instance.depreciationPct,
  'avg_asset_age_months': instance.avgAssetAgeMonths,
  'assets_at_risk': instance.assetsAtRisk,
  'by_type': instance.byType.map((k, e) => MapEntry(k, e.toJson())),
  'by_condition': instance.byCondition.map((k, e) => MapEntry(k, e.toJson())),
  'trend': instance.trend.map((e) => e.toJson()).toList(),
};
