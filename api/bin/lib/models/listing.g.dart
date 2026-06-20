// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'listing.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Listing _$ListingFromJson(Map<String, dynamic> json) => _Listing(
  id: json['id'] as String,
  assetId: json['asset_id'] as String,
  companyId: json['company_id'] as String,
  valuationFlag: json['valuation_flag'] as String,
  status: json['status'] as String,
  createdAt: const IsoDateTimeConverter().fromJson(
    json['created_at'] as String,
  ),
  listedPrice: (json['listed_price'] as num?)?.toDouble(),
  sellerOfferPrice: (json['seller_offer_price'] as num?)?.toDouble(),
  buyerAskPrice: (json['buyer_ask_price'] as num?)?.toDouble(),
  grossMargin: (json['gross_margin'] as num?)?.toDouble(),
  consumerMarketAnchor: (json['consumer_market_anchor'] as num?)?.toDouble(),
  fairMarketValue: (json['fair_market_value'] as num?)?.toDouble(),
  estBookValue: (json['est_book_value'] as num?)?.toDouble(),
  sellerRecoveryRatio: (json['seller_recovery_ratio'] as num?)?.toDouble(),
  depreciationPct: (json['depreciation_pct'] as num?)?.toDouble(),
  ageMonths: (json['age_months'] as num?)?.toInt(),
  lastValuedAt: const NullableIsoDateTimeConverter().fromJson(
    json['last_valued_at'] as String?,
  ),
  modelName: json['model_name'] as String?,
  assetType: json['asset_type'] as String?,
  conditionGrade: json['condition_grade'] as String?,
  quantity: (json['quantity'] as num?)?.toInt(),
  cpuScore: (json['cpu_score'] as num?)?.toDouble(),
  ramGb: (json['ram_gb'] as num?)?.toDouble(),
  storageGb: (json['storage_gb'] as num?)?.toDouble(),
);

Map<String, dynamic> _$ListingToJson(_Listing instance) => <String, dynamic>{
  'id': instance.id,
  'asset_id': instance.assetId,
  'company_id': instance.companyId,
  'valuation_flag': instance.valuationFlag,
  'status': instance.status,
  'created_at': const IsoDateTimeConverter().toJson(instance.createdAt),
  'listed_price': ?instance.listedPrice,
  'seller_offer_price': ?instance.sellerOfferPrice,
  'buyer_ask_price': ?instance.buyerAskPrice,
  'gross_margin': ?instance.grossMargin,
  'consumer_market_anchor': ?instance.consumerMarketAnchor,
  'fair_market_value': ?instance.fairMarketValue,
  'est_book_value': ?instance.estBookValue,
  'seller_recovery_ratio': ?instance.sellerRecoveryRatio,
  'depreciation_pct': ?instance.depreciationPct,
  'age_months': ?instance.ageMonths,
  'last_valued_at': ?const NullableIsoDateTimeConverter().toJson(
    instance.lastValuedAt,
  ),
  'model_name': ?instance.modelName,
  'asset_type': ?instance.assetType,
  'condition_grade': ?instance.conditionGrade,
  'quantity': ?instance.quantity,
  'cpu_score': ?instance.cpuScore,
  'ram_gb': ?instance.ramGb,
  'storage_gb': ?instance.storageGb,
};

_MarketplaceListing _$MarketplaceListingFromJson(Map<String, dynamic> json) =>
    _MarketplaceListing(
      id: json['id'] as String,
      assetId: json['asset_id'] as String,
      companyId: json['company_id'] as String,
      valuationFlag: json['valuation_flag'] as String,
      status: json['status'] as String,
      createdAt: const IsoDateTimeConverter().fromJson(
        json['created_at'] as String,
      ),
      listedPrice: (json['listed_price'] as num?)?.toDouble(),
      sellerOfferPrice: (json['seller_offer_price'] as num?)?.toDouble(),
      buyerAskPrice: (json['buyer_ask_price'] as num?)?.toDouble(),
      grossMargin: (json['gross_margin'] as num?)?.toDouble(),
      consumerMarketAnchor: (json['consumer_market_anchor'] as num?)
          ?.toDouble(),
      fairMarketValue: (json['fair_market_value'] as num?)?.toDouble(),
      estBookValue: (json['est_book_value'] as num?)?.toDouble(),
      sellerRecoveryRatio: (json['seller_recovery_ratio'] as num?)?.toDouble(),
      depreciationPct: (json['depreciation_pct'] as num?)?.toDouble(),
      ageMonths: (json['age_months'] as num?)?.toInt(),
      lastValuedAt: const NullableIsoDateTimeConverter().fromJson(
        json['last_valued_at'] as String?,
      ),
      modelName: json['model_name'] as String?,
      assetType: json['asset_type'] as String?,
      conditionGrade: json['condition_grade'] as String?,
      quantity: (json['quantity'] as num?)?.toInt(),
      cpuScore: (json['cpu_score'] as num?)?.toDouble(),
      ramGb: (json['ram_gb'] as num?)?.toDouble(),
      storageGb: (json['storage_gb'] as num?)?.toDouble(),
      sellerName: json['seller_name'] as String?,
      sellerIndustry: json['seller_industry'] as String?,
      sellerSizeBand: json['seller_size_band'] as String?,
    );

Map<String, dynamic> _$MarketplaceListingToJson(_MarketplaceListing instance) =>
    <String, dynamic>{
      'id': instance.id,
      'asset_id': instance.assetId,
      'company_id': instance.companyId,
      'valuation_flag': instance.valuationFlag,
      'status': instance.status,
      'created_at': const IsoDateTimeConverter().toJson(instance.createdAt),
      'listed_price': ?instance.listedPrice,
      'seller_offer_price': ?instance.sellerOfferPrice,
      'buyer_ask_price': ?instance.buyerAskPrice,
      'gross_margin': ?instance.grossMargin,
      'consumer_market_anchor': ?instance.consumerMarketAnchor,
      'fair_market_value': ?instance.fairMarketValue,
      'est_book_value': ?instance.estBookValue,
      'seller_recovery_ratio': ?instance.sellerRecoveryRatio,
      'depreciation_pct': ?instance.depreciationPct,
      'age_months': ?instance.ageMonths,
      'last_valued_at': ?const NullableIsoDateTimeConverter().toJson(
        instance.lastValuedAt,
      ),
      'model_name': ?instance.modelName,
      'asset_type': ?instance.assetType,
      'condition_grade': ?instance.conditionGrade,
      'quantity': ?instance.quantity,
      'cpu_score': ?instance.cpuScore,
      'ram_gb': ?instance.ramGb,
      'storage_gb': ?instance.storageGb,
      'seller_name': ?instance.sellerName,
      'seller_industry': ?instance.sellerIndustry,
      'seller_size_band': ?instance.sellerSizeBand,
    };
