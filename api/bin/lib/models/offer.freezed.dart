// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'offer.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$BuyerOffer {

 String get id; String get listingId; String get buyerCompanyId; double get offerPrice; int get quantity; String get status;@IsoDateTimeConverter() DateTime get expiresAt;@IsoDateTimeConverter() DateTime get createdAt; double? get counterPrice; String? get message;
/// Create a copy of BuyerOffer
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BuyerOfferCopyWith<BuyerOffer> get copyWith => _$BuyerOfferCopyWithImpl<BuyerOffer>(this as BuyerOffer, _$identity);

  /// Serializes this BuyerOffer to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BuyerOffer&&(identical(other.id, id) || other.id == id)&&(identical(other.listingId, listingId) || other.listingId == listingId)&&(identical(other.buyerCompanyId, buyerCompanyId) || other.buyerCompanyId == buyerCompanyId)&&(identical(other.offerPrice, offerPrice) || other.offerPrice == offerPrice)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.status, status) || other.status == status)&&(identical(other.expiresAt, expiresAt) || other.expiresAt == expiresAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.counterPrice, counterPrice) || other.counterPrice == counterPrice)&&(identical(other.message, message) || other.message == message));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,listingId,buyerCompanyId,offerPrice,quantity,status,expiresAt,createdAt,counterPrice,message);

@override
String toString() {
  return 'BuyerOffer(id: $id, listingId: $listingId, buyerCompanyId: $buyerCompanyId, offerPrice: $offerPrice, quantity: $quantity, status: $status, expiresAt: $expiresAt, createdAt: $createdAt, counterPrice: $counterPrice, message: $message)';
}


}

/// @nodoc
abstract mixin class $BuyerOfferCopyWith<$Res>  {
  factory $BuyerOfferCopyWith(BuyerOffer value, $Res Function(BuyerOffer) _then) = _$BuyerOfferCopyWithImpl;
@useResult
$Res call({
 String id, String listingId, String buyerCompanyId, double offerPrice, int quantity, String status,@IsoDateTimeConverter() DateTime expiresAt,@IsoDateTimeConverter() DateTime createdAt, double? counterPrice, String? message
});




}
/// @nodoc
class _$BuyerOfferCopyWithImpl<$Res>
    implements $BuyerOfferCopyWith<$Res> {
  _$BuyerOfferCopyWithImpl(this._self, this._then);

  final BuyerOffer _self;
  final $Res Function(BuyerOffer) _then;

/// Create a copy of BuyerOffer
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? listingId = null,Object? buyerCompanyId = null,Object? offerPrice = null,Object? quantity = null,Object? status = null,Object? expiresAt = null,Object? createdAt = null,Object? counterPrice = freezed,Object? message = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,listingId: null == listingId ? _self.listingId : listingId // ignore: cast_nullable_to_non_nullable
as String,buyerCompanyId: null == buyerCompanyId ? _self.buyerCompanyId : buyerCompanyId // ignore: cast_nullable_to_non_nullable
as String,offerPrice: null == offerPrice ? _self.offerPrice : offerPrice // ignore: cast_nullable_to_non_nullable
as double,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,expiresAt: null == expiresAt ? _self.expiresAt : expiresAt // ignore: cast_nullable_to_non_nullable
as DateTime,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,counterPrice: freezed == counterPrice ? _self.counterPrice : counterPrice // ignore: cast_nullable_to_non_nullable
as double?,message: freezed == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [BuyerOffer].
extension BuyerOfferPatterns on BuyerOffer {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BuyerOffer value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BuyerOffer() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BuyerOffer value)  $default,){
final _that = this;
switch (_that) {
case _BuyerOffer():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BuyerOffer value)?  $default,){
final _that = this;
switch (_that) {
case _BuyerOffer() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String listingId,  String buyerCompanyId,  double offerPrice,  int quantity,  String status, @IsoDateTimeConverter()  DateTime expiresAt, @IsoDateTimeConverter()  DateTime createdAt,  double? counterPrice,  String? message)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BuyerOffer() when $default != null:
return $default(_that.id,_that.listingId,_that.buyerCompanyId,_that.offerPrice,_that.quantity,_that.status,_that.expiresAt,_that.createdAt,_that.counterPrice,_that.message);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String listingId,  String buyerCompanyId,  double offerPrice,  int quantity,  String status, @IsoDateTimeConverter()  DateTime expiresAt, @IsoDateTimeConverter()  DateTime createdAt,  double? counterPrice,  String? message)  $default,) {final _that = this;
switch (_that) {
case _BuyerOffer():
return $default(_that.id,_that.listingId,_that.buyerCompanyId,_that.offerPrice,_that.quantity,_that.status,_that.expiresAt,_that.createdAt,_that.counterPrice,_that.message);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String listingId,  String buyerCompanyId,  double offerPrice,  int quantity,  String status, @IsoDateTimeConverter()  DateTime expiresAt, @IsoDateTimeConverter()  DateTime createdAt,  double? counterPrice,  String? message)?  $default,) {final _that = this;
switch (_that) {
case _BuyerOffer() when $default != null:
return $default(_that.id,_that.listingId,_that.buyerCompanyId,_that.offerPrice,_that.quantity,_that.status,_that.expiresAt,_that.createdAt,_that.counterPrice,_that.message);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _BuyerOffer extends BuyerOffer {
  const _BuyerOffer({required this.id, required this.listingId, required this.buyerCompanyId, required this.offerPrice, required this.quantity, required this.status, @IsoDateTimeConverter() required this.expiresAt, @IsoDateTimeConverter() required this.createdAt, this.counterPrice, this.message}): super._();
  factory _BuyerOffer.fromJson(Map<String, dynamic> json) => _$BuyerOfferFromJson(json);

@override final  String id;
@override final  String listingId;
@override final  String buyerCompanyId;
@override final  double offerPrice;
@override final  int quantity;
@override final  String status;
@override@IsoDateTimeConverter() final  DateTime expiresAt;
@override@IsoDateTimeConverter() final  DateTime createdAt;
@override final  double? counterPrice;
@override final  String? message;

/// Create a copy of BuyerOffer
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BuyerOfferCopyWith<_BuyerOffer> get copyWith => __$BuyerOfferCopyWithImpl<_BuyerOffer>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BuyerOfferToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _BuyerOffer&&(identical(other.id, id) || other.id == id)&&(identical(other.listingId, listingId) || other.listingId == listingId)&&(identical(other.buyerCompanyId, buyerCompanyId) || other.buyerCompanyId == buyerCompanyId)&&(identical(other.offerPrice, offerPrice) || other.offerPrice == offerPrice)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.status, status) || other.status == status)&&(identical(other.expiresAt, expiresAt) || other.expiresAt == expiresAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.counterPrice, counterPrice) || other.counterPrice == counterPrice)&&(identical(other.message, message) || other.message == message));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,listingId,buyerCompanyId,offerPrice,quantity,status,expiresAt,createdAt,counterPrice,message);

@override
String toString() {
  return 'BuyerOffer(id: $id, listingId: $listingId, buyerCompanyId: $buyerCompanyId, offerPrice: $offerPrice, quantity: $quantity, status: $status, expiresAt: $expiresAt, createdAt: $createdAt, counterPrice: $counterPrice, message: $message)';
}


}

/// @nodoc
abstract mixin class _$BuyerOfferCopyWith<$Res> implements $BuyerOfferCopyWith<$Res> {
  factory _$BuyerOfferCopyWith(_BuyerOffer value, $Res Function(_BuyerOffer) _then) = __$BuyerOfferCopyWithImpl;
@override @useResult
$Res call({
 String id, String listingId, String buyerCompanyId, double offerPrice, int quantity, String status,@IsoDateTimeConverter() DateTime expiresAt,@IsoDateTimeConverter() DateTime createdAt, double? counterPrice, String? message
});




}
/// @nodoc
class __$BuyerOfferCopyWithImpl<$Res>
    implements _$BuyerOfferCopyWith<$Res> {
  __$BuyerOfferCopyWithImpl(this._self, this._then);

  final _BuyerOffer _self;
  final $Res Function(_BuyerOffer) _then;

/// Create a copy of BuyerOffer
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? listingId = null,Object? buyerCompanyId = null,Object? offerPrice = null,Object? quantity = null,Object? status = null,Object? expiresAt = null,Object? createdAt = null,Object? counterPrice = freezed,Object? message = freezed,}) {
  return _then(_BuyerOffer(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,listingId: null == listingId ? _self.listingId : listingId // ignore: cast_nullable_to_non_nullable
as String,buyerCompanyId: null == buyerCompanyId ? _self.buyerCompanyId : buyerCompanyId // ignore: cast_nullable_to_non_nullable
as String,offerPrice: null == offerPrice ? _self.offerPrice : offerPrice // ignore: cast_nullable_to_non_nullable
as double,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,expiresAt: null == expiresAt ? _self.expiresAt : expiresAt // ignore: cast_nullable_to_non_nullable
as DateTime,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,counterPrice: freezed == counterPrice ? _self.counterPrice : counterPrice // ignore: cast_nullable_to_non_nullable
as double?,message: freezed == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
