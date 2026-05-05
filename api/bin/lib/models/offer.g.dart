// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'offer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BuyerOfferImpl _$$BuyerOfferImplFromJson(Map<String, dynamic> json) =>
    _$BuyerOfferImpl(
      id: json['id'] as String,
      listingId: json['listing_id'] as String,
      buyerCompanyId: json['buyer_company_id'] as String,
      offerPrice: (json['offer_price'] as num).toDouble(),
      quantity: (json['quantity'] as num).toInt(),
      status: json['status'] as String,
      expiresAt:
          const IsoDateTimeConverter().fromJson(json['expires_at'] as String),
      createdAt:
          const IsoDateTimeConverter().fromJson(json['created_at'] as String),
      counterPrice: (json['counter_price'] as num?)?.toDouble(),
      message: json['message'] as String?,
    );

Map<String, dynamic> _$$BuyerOfferImplToJson(_$BuyerOfferImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'listing_id': instance.listingId,
      'buyer_company_id': instance.buyerCompanyId,
      'offer_price': instance.offerPrice,
      'quantity': instance.quantity,
      'status': instance.status,
      'expires_at': const IsoDateTimeConverter().toJson(instance.expiresAt),
      'created_at': const IsoDateTimeConverter().toJson(instance.createdAt),
      if (instance.counterPrice case final value?) 'counter_price': value,
      if (instance.message case final value?) 'message': value,
    };
