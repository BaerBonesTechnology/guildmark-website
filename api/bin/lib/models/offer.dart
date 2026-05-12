/// Buyer offer model — mirrors `BuyerOffer` in types.ts.
library;

import 'package:freezed_annotation/freezed_annotation.dart';

import 'json_helpers.dart';

part 'offer.freezed.dart';
part 'offer.g.dart';

@Freezed()
class BuyerOffer with _$BuyerOffer {
  const BuyerOffer._();

  const factory BuyerOffer({
    required String id,
    required String listingId,
    required String buyerCompanyId,
    required double offerPrice,
    required int    quantity,
    required String status,
    @IsoDateTimeConverter()      required DateTime expiresAt,
    @IsoDateTimeConverter()      required DateTime createdAt,
    double?  counterPrice,
    String?  message,
  }) = _BuyerOffer;

  factory BuyerOffer.fromJson(Map<String, dynamic> json) =>
      _$BuyerOfferFromJson(json);

  factory BuyerOffer.fromRow(Map<String, dynamic> row) => BuyerOffer(
        id:             row['id']                       as String,
        listingId:      row['listing_id']               as String,
        buyerCompanyId: row['buyer_company_id']         as String,
        offerPrice:     numToDoubleOrNull(row['offer_price']) ?? 0.0,
        quantity:       numToIntOrNull(row['quantity']) ?? 0,
        status:         enumStr(row['status']),
        expiresAt:      row['expires_at']               as DateTime,
        createdAt:      row['created_at']               as DateTime,
        counterPrice:   numToDoubleOrNull(row['counter_price']),
        message:        row['message']                  as String?,
      );
}
