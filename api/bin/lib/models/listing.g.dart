// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'listing.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ListingImpl _$$ListingImplFromJson(Map<String, dynamic> json) =>
    _$ListingImpl(
      id: json['id'] as String,
      assetId: json['asset_id'] as String,
      companyId: json['company_id'] as String,
      valuationFlag: json['valuation_flag'] as String,
      status: json['status'] as String,
      createdAt:
          const IsoDateTimeConverter().fromJson(json['created_at'] as String),
      listedPrice: (json['listed_price'] as num?)?.toDouble(),
      sellerOfferPrice: (json['seller_offer_price'] as num?)?.toDouble(),
      buyerAskPrice: (json['buyer_ask_price'] as num?)?.toDouble(),
      grossMargin: (json['gross_margin'] as num?)?.toDouble(),
      consumerMarketAnchor:
          (json['consumer_market_anchor'] as num?)?.toDouble(),
      fairMarketValue: (json['fair_market_value'] as num?)?.toDouble(),
      estBookValue: (json['est_book_value'] as num?)?.toDouble(),
      sellerRecoveryRatio: (json['seller_recovery_ratio'] as num?)?.toDouble(),
      depreciationPct: (json['depreciation_pct'] as num?)?.toDouble(),
      ageMonths: (json['age_months'] as num?)?.toInt(),
      lastValuedAt: const NullableIsoDateTimeConverter()
          .fromJson(json['last_valued_at'] as String?),
      modelName: json['model_name'] as String?,
      assetType: json['asset_type'] as String?,
      conditionGrade: json['condition_grade'] as String?,
      quantity: (json['quantity'] as num?)?.toInt(),
      cpuScore: (json['cpu_score'] as num?)?.toDouble(),
      ramGb: (json['ram_gb'] as num?)?.toInt(),
      storageGb: (json['storage_gb'] as num?)?.toInt(),
    );

Map<String, dynamic> _$$ListingImplToJson(_$ListingImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'asset_id': instance.assetId,
      'company_id': instance.companyId,
      'valuation_flag': instance.valuationFlag,
      'status': instance.status,
      'created_at': const IsoDateTimeConverter().toJson(instance.createdAt),
      if (instance.listedPrice case final value?) 'listed_price': value,
      if (instance.sellerOfferPrice case final value?)
        'seller_offer_price': value,
      if (instance.buyerAskPrice case final value?) 'buyer_ask_price': value,
      if (instance.grossMargin case final value?) 'gross_margin': value,
      if (instance.consumerMarketAnchor case final value?)
        'consumer_market_anchor': value,
      if (instance.fairMarketValue case final value?)
        'fair_market_value': value,
      if (instance.estBookValue case final value?) 'est_book_value': value,
      if (instance.sellerRecoveryRatio case final value?)
        'seller_recovery_ratio': value,
      if (instance.depreciationPct case final value?) 'depreciation_pct': value,
      if (instance.ageMonths case final value?) 'age_months': value,
      if (const NullableIsoDateTimeConverter().toJson(instance.lastValuedAt)
          case final value?)
        'last_valued_at': value,
      if (instance.modelName case final value?) 'model_name': value,
      if (instance.assetType case final value?) 'asset_type': value,
      if (instance.conditionGrade case final value?) 'condition_grade': value,
      if (instance.quantity case final value?) 'quantity': value,
      if (instance.cpuScore case final value?) 'cpu_score': value,
      if (instance.ramGb case final value?) 'ram_gb': value,
      if (instance.storageGb case final value?) 'storage_gb': value,
    };

_$MarketplaceListingImpl _$$MarketplaceListingImplFromJson(
        Map<String, dynamic> json) =>
    _$MarketplaceListingImpl(
      id: json['id'] as String,
      assetId: json['asset_id'] as String,
      companyId: json['company_id'] as String,
      valuationFlag: json['valuation_flag'] as String,
      status: json['status'] as String,
      createdAt:
          const IsoDateTimeConverter().fromJson(json['created_at'] as String),
      listedPrice: (json['listed_price'] as num?)?.toDouble(),
      sellerOfferPrice: (json['seller_offer_price'] as num?)?.toDouble(),
      buyerAskPrice: (json['buyer_ask_price'] as num?)?.toDouble(),
      grossMargin: (json['gross_margin'] as num?)?.toDouble(),
      consumerMarketAnchor:
          (json['consumer_market_anchor'] as num?)?.toDouble(),
      fairMarketValue: (json['fair_market_value'] as num?)?.toDouble(),
      estBookValue: (json['est_book_value'] as num?)?.toDouble(),
      sellerRecoveryRatio: (json['seller_recovery_ratio'] as num?)?.toDouble(),
      depreciationPct: (json['depreciation_pct'] as num?)?.toDouble(),
      ageMonths: (json['age_months'] as num?)?.toInt(),
      lastValuedAt: const NullableIsoDateTimeConverter()
          .fromJson(json['last_valued_at'] as String?),
      modelName: json['model_name'] as String?,
      assetType: json['asset_type'] as String?,
      conditionGrade: json['condition_grade'] as String?,
      quantity: (json['quantity'] as num?)?.toInt(),
      cpuScore: (json['cpu_score'] as num?)?.toDouble(),
      ramGb: (json['ram_gb'] as num?)?.toInt(),
      storageGb: (json['storage_gb'] as num?)?.toInt(),
      sellerIndustry: json['seller_industry'] as String?,
      sellerSizeBand: json['seller_size_band'] as String?,
    );

Map<String, dynamic> _$$MarketplaceListingImplToJson(
        _$MarketplaceListingImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'asset_id': instance.assetId,
      'company_id': instance.companyId,
      'valuation_flag': instance.valuationFlag,
      'status': instance.status,
      'created_at': const IsoDateTimeConverter().toJson(instance.createdAt),
      if (instance.listedPrice case final value?) 'listed_price': value,
      if (instance.sellerOfferPrice case final value?)
        'seller_offer_price': value,
      if (instance.buyerAskPrice case final value?) 'buyer_ask_price': value,
      if (instance.grossMargin case final value?) 'gross_margin': value,
      if (instance.consumerMarketAnchor case final value?)
        'consumer_market_anchor': value,
      if (instance.fairMarketValue case final value?)
        'fair_market_value': value,
      if (instance.estBookValue case final value?) 'est_book_value': value,
      if (instance.sellerRecoveryRatio case final value?)
        'seller_recovery_ratio': value,
      if (instance.depreciationPct case final value?) 'depreciation_pct': value,
      if (instance.ageMonths case final value?) 'age_months': value,
      if (const NullableIsoDateTimeConverter().toJson(instance.lastValuedAt)
          case final value?)
        'last_valued_at': value,
      if (instance.modelName case final value?) 'model_name': value,
      if (instance.assetType case final value?) 'asset_type': value,
      if (instance.conditionGrade case final value?) 'condition_grade': value,
      if (instance.quantity case final value?) 'quantity': value,
      if (instance.cpuScore case final value?) 'cpu_score': value,
      if (instance.ramGb case final value?) 'ram_gb': value,
      if (instance.storageGb case final value?) 'storage_gb': value,
      if (instance.sellerIndustry case final value?) 'seller_industry': value,
      if (instance.sellerSizeBand case final value?) 'seller_size_band': value,
    };
