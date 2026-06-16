// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'platform_config.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PlatformConfig _$PlatformConfigFromJson(Map<String, dynamic> json) =>
    PlatformConfig(
      sellerFeeFree: (json['seller_fee_free'] as num).toDouble(),
      sellerFeeStarter: (json['seller_fee_starter'] as num).toDouble(),
      sellerFeeGrowth: (json['seller_fee_growth'] as num).toDouble(),
      sellerFeePro: (json['seller_fee_pro'] as num).toDouble(),
      buyerFee: (json['buyer_fee'] as num).toDouble(),
      deferralFee: (json['deferral_fee'] as num).toDouble(),
      dataWipePrice: (json['data_wipe_price'] as num).toDouble(),
      updatedAt: json['updated_at'] as String,
      updatedBy: json['updated_by'] as String?,
    );

Map<String, dynamic> _$PlatformConfigToJson(PlatformConfig instance) =>
    <String, dynamic>{
      'seller_fee_free': instance.sellerFeeFree,
      'seller_fee_starter': instance.sellerFeeStarter,
      'seller_fee_growth': instance.sellerFeeGrowth,
      'seller_fee_pro': instance.sellerFeePro,
      'buyer_fee': instance.buyerFee,
      'deferral_fee': instance.deferralFee,
      'data_wipe_price': instance.dataWipePrice,
      'updated_at': instance.updatedAt,
      if (instance.updatedBy case final value?) 'updated_by': value,
    };
