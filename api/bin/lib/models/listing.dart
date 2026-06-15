/// Listing + MarketplaceListing models — mirror types.ts.
///
/// MarketplaceListing isn't a subclass; freezed disallows extends between
/// freezed classes. It's a sibling type with the same listing fields plus
/// the two seller-mask fields the marketplace API joins in.

import 'package:freezed_annotation/freezed_annotation.dart';

import 'json_helpers.dart';

part 'listing.freezed.dart';
part 'listing.g.dart';

@Freezed()
class Listing with _$Listing {
  const Listing._();

  const factory Listing({
    required String id,
    required String assetId,
    required String companyId,
    required String valuationFlag,
    required String status,
    @IsoDateTimeConverter()      required DateTime createdAt,
    double?  listedPrice,
    double?  sellerOfferPrice,
    double?  buyerAskPrice,
    double?  grossMargin,
    double?  consumerMarketAnchor,
    double?  fairMarketValue,
    double?  estBookValue,
    double?  sellerRecoveryRatio,
    double?  depreciationPct,
    int?     ageMonths,
    @NullableIsoDateTimeConverter()   DateTime? lastValuedAt,
    // Joined fields (denormalized from the asset row for marketplace cards)
    String?  modelName,
    String?  assetType,
    String?  conditionGrade,
    int?     quantity,
    double?  cpuScore,
    double?  ramGb,
    double?  storageGb,
  }) = _Listing;

  factory Listing.fromJson(Map<String, dynamic> json) =>
      _$ListingFromJson(json);

  factory Listing.fromRow(Map<String, dynamic> row) => Listing(
        id:                   row['id']                       as String,
        assetId:              row['asset_id']                 as String,
        companyId:            row['company_id']               as String,
        valuationFlag:        enumStr(row['valuation_flag']),
        status:               enumStr(row['status']),
        createdAt:            row['created_at']               as DateTime,
        listedPrice:          numToDoubleOrNull(row['listed_price']),
        sellerOfferPrice:     numToDoubleOrNull(row['seller_offer_price']),
        buyerAskPrice:        numToDoubleOrNull(row['buyer_ask_price']),
        grossMargin:          numToDoubleOrNull(row['gross_margin']),
        consumerMarketAnchor: numToDoubleOrNull(row['consumer_market_anchor']),
        fairMarketValue:      numToDoubleOrNull(row['fair_market_value']),
        estBookValue:         numToDoubleOrNull(row['est_book_value']),
        sellerRecoveryRatio:  numToDoubleOrNull(row['seller_recovery_ratio']),
        depreciationPct:      numToDoubleOrNull(row['depreciation_pct']),
        ageMonths:            numToIntOrNull(row['age_months']),
        lastValuedAt:         row['last_valued_at']           as DateTime?,
        modelName:            row['model_name']               as String?,
        assetType:            enumStrOrNull(row['asset_type']),
        conditionGrade:       enumStrOrNull(row['condition_grade']),
        quantity:             numToIntOrNull(row['quantity']),
        cpuScore:             numToDoubleOrNull(row['cpu_score']),
        ramGb:                numToDoubleOrNull(row['ram_gb']),
        storageGb:            numToDoubleOrNull(row['storage_gb']),
      );
}

@Freezed()
class MarketplaceListing with _$MarketplaceListing {
  const MarketplaceListing._();

  const factory MarketplaceListing({
    required String id,
    required String assetId,
    required String companyId,
    required String valuationFlag,
    required String status,
    @IsoDateTimeConverter()      required DateTime createdAt,
    double?  listedPrice,
    double?  sellerOfferPrice,
    double?  buyerAskPrice,
    double?  grossMargin,
    double?  consumerMarketAnchor,
    double?  fairMarketValue,
    double?  estBookValue,
    double?  sellerRecoveryRatio,
    double?  depreciationPct,
    int?     ageMonths,
    @NullableIsoDateTimeConverter()   DateTime? lastValuedAt,
    String?  modelName,
    String?  assetType,
    String?  conditionGrade,
    int?     quantity,
    double?  cpuScore,
    double?  ramGb,
    double?  storageGb,
    String?  sellerName,
    String?  sellerIndustry,
    String?  sellerSizeBand,
  }) = _MarketplaceListing;

  factory MarketplaceListing.fromJson(Map<String, dynamic> json) =>
      _$MarketplaceListingFromJson(json);

  factory MarketplaceListing.fromRow(Map<String, dynamic> row) =>
      MarketplaceListing(
        id:                   row['id']                       as String,
        assetId:              row['asset_id']                 as String,
        companyId:             row['company_id']               as String,
        valuationFlag:        enumStr(row['valuation_flag']),
        status:               enumStr(row['status']),
        createdAt:            row['created_at']               as DateTime,
        listedPrice:          numToDoubleOrNull(row['listed_price']),
        sellerOfferPrice:     numToDoubleOrNull(row['seller_offer_price']),
        buyerAskPrice:        numToDoubleOrNull(row['buyer_ask_price']),
        grossMargin:          numToDoubleOrNull(row['gross_margin']),
        consumerMarketAnchor: numToDoubleOrNull(row['consumer_market_anchor']),
        fairMarketValue:      numToDoubleOrNull(row['fair_market_value']),
        estBookValue:         numToDoubleOrNull(row['est_book_value']),
        sellerRecoveryRatio:  numToDoubleOrNull(row['seller_recovery_ratio']),
        depreciationPct:      numToDoubleOrNull(row['depreciation_pct']),
       