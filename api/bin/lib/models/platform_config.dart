/// Platform-wide fee configuration model.
library platform_config;
import 'package:json_annotation/json_annotation.dart';

import 'json_helpers.dart';

part 'platform_config.g.dart';


@JsonSerializable()
class PlatformConfig {
  PlatformConfig({
    required this.sellerFeeFree,
    required this.sellerFeeStarter,
    required this.sellerFeeGrowth,
    required this.sellerFeePro,
    required this.buyerFee,
    required this.deferralFee,
    required this.dataWipePrice,
    required this.updatedAt,
    this.updatedBy,
  });

  factory PlatformConfig.fromRow(Map<String, dynamic> row) => PlatformConfig(
    sellerFeeFree:    numToDoubleOrNull(row['seller_fee_free'])    ?? 0.0,
    sellerFeeStarter: numToDoubleOrNull(row['seller_fee_starter']) ?? 0.0,
    sellerFeeGrowth:  numToDoubleOrNull(row['seller_fee_growth'])  ?? 0.0,
    sellerFeePro:     numToDoubleOrNull(row['seller_fee_pro'])     ?? 0.0,
    buyerFee:         numToDoubleOrNull(row['buyer_fee'])          ?? 0.0,
    deferralFee:      numToDoubleOrNull(row['deferral_fee'])       ?? 0.0,
    dataWipePrice:    numToDoubleOrNull(row['data_wipe_price'])    ?? 0.0,
    updatedAt:        (row['updated_at'] as DateTime).toUtc().toIso8601String(),
    updatedBy:        row['updated_by'] as String?,
  );

  final double sellerFeeFree;
  final double sellerFeeStarter;
  final double sellerFeeGrowth;
  final double sellerFeePro;
  final double buyerFee;
  final double deferralFee;
  final double dataWipePrice;
  final String updatedAt;
  final String? updatedBy;

  factory PlatformConfig.fromJson(Map<String, dynamic> json) => _$PlatformConfigFromJson(json);

  Map<String, dynamic> toJson() => _$PlatformConfigToJson(this);

  /// Seller fee for a given subscription plan name.
  double sellerFeeForPlan(String plan) => switch (plan) {
    'starter' => sellerFeeStarter,
    'growth'  => sellerFeeGrowth,
    'pro'     => sellerFeePro,
    _         => sellerFeeFree,
  };
}
