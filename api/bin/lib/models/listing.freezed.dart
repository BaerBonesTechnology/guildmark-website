// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'listing.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Listing {

 String get id; String get assetId; String get companyId; String get valuationFlag; String get status;@IsoDateTimeConverter() DateTime get createdAt; double? get listedPrice; double? get sellerOfferPrice; double? get buyerAskPrice; double? get grossMargin; double? get consumerMarketAnchor; double? get fairMarketValue; double? get estBookValue; double? get sellerRecoveryRatio; double? get depreciationPct; int? get ageMonths;@NullableIsoDateTimeConverter() DateTime? get lastValuedAt;// Joined fields (denormalized from the asset row for marketplace cards)
 String? get modelName; String? get assetType; String? get conditionGrade; int? get quantity; double? get cpuScore; double? get ramGb; double? get storageGb;
/// Create a copy of Listing
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ListingCopyWith<Listing> get copyWith => _$ListingCopyWithImpl<Listing>(this as Listing, _$identity);

  /// Serializes this Listing to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Listing&&(identical(other.id, id) || other.id == id)&&(identical(other.assetId, assetId) || other.assetId == assetId)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.valuationFlag, valuationFlag) || other.valuationFlag == valuationFlag)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.listedPrice, listedPrice) || other.listedPrice == listedPrice)&&(identical(other.sellerOfferPrice, sellerOfferPrice) || other.sellerOfferPrice == sellerOfferPrice)&&(identical(other.buyerAskPrice, buyerAskPrice) || other.buyerAskPrice == buyerAskPrice)&&(identical(other.grossMargin, grossMargin) || other.grossMargin == grossMargin)&&(identical(other.consumerMarketAnchor, consumerMarketAnchor) || other.consumerMarketAnchor == consumerMarketAnchor)&&(identical(other.fairMarketValue, fairMarketValue) || other.fairMarketValue == fairMarketValue)&&(identical(other.estBookValue, estBookValue) || other.estBookValue == estBookValue)&&(identical(other.sellerRecoveryRatio, sellerRecoveryRatio) || other.sellerRecoveryRatio == sellerRecoveryRatio)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.ageMonths, ageMonths) || other.ageMonths == ageMonths)&&(identical(other.lastValuedAt, lastValuedAt) || other.lastValuedAt == lastValuedAt)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,assetId,companyId,valuationFlag,status,createdAt,listedPrice,sellerOfferPrice,buyerAskPrice,grossMargin,consumerMarketAnchor,fairMarketValue,estBookValue,sellerRecoveryRatio,depreciationPct,ageMonths,lastValuedAt,modelName,assetType,conditionGrade,quantity,cpuScore,ramGb,storageGb]);

@override
String toString() {
  return 'Listing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb)';
}


}

/// @nodoc
abstract mixin class $ListingCopyWith<$Res>  {
  factory $ListingCopyWith(Listing value, $Res Function(Listing) _then) = _$ListingCopyWithImpl;
@useResult
$Res call({
 String id, String assetId, String companyId, String valuationFlag, String status,@IsoDateTimeConverter() DateTime createdAt, double? listedPrice, double? sellerOfferPrice, double? buyerAskPrice, double? grossMargin, double? consumerMarketAnchor, double? fairMarketValue, double? estBookValue, double? sellerRecoveryRatio, double? depreciationPct, int? ageMonths,@NullableIsoDateTimeConverter() DateTime? lastValuedAt, String? modelName, String? assetType, String? conditionGrade, int? quantity, double? cpuScore, double? ramGb, double? storageGb
});




}
/// @nodoc
class _$ListingCopyWithImpl<$Res>
    implements $ListingCopyWith<$Res> {
  _$ListingCopyWithImpl(this._self, this._then);

  final Listing _self;
  final $Res Function(Listing) _then;

/// Create a copy of Listing
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? assetId = null,Object? companyId = null,Object? valuationFlag = null,Object? status = null,Object? createdAt = null,Object? listedPrice = freezed,Object? sellerOfferPrice = freezed,Object? buyerAskPrice = freezed,Object? grossMargin = freezed,Object? consumerMarketAnchor = freezed,Object? fairMarketValue = freezed,Object? estBookValue = freezed,Object? sellerRecoveryRatio = freezed,Object? depreciationPct = freezed,Object? ageMonths = freezed,Object? lastValuedAt = freezed,Object? modelName = freezed,Object? assetType = freezed,Object? conditionGrade = freezed,Object? quantity = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,assetId: null == assetId ? _self.assetId : assetId // ignore: cast_nullable_to_non_nullable
as String,companyId: null == companyId ? _self.companyId : companyId // ignore: cast_nullable_to_non_nullable
as String,valuationFlag: null == valuationFlag ? _self.valuationFlag : valuationFlag // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,listedPrice: freezed == listedPrice ? _self.listedPrice : listedPrice // ignore: cast_nullable_to_non_nullable
as double?,sellerOfferPrice: freezed == sellerOfferPrice ? _self.sellerOfferPrice : sellerOfferPrice // ignore: cast_nullable_to_non_nullable
as double?,buyerAskPrice: freezed == buyerAskPrice ? _self.buyerAskPrice : buyerAskPrice // ignore: cast_nullable_to_non_nullable
as double?,grossMargin: freezed == grossMargin ? _self.grossMargin : grossMargin // ignore: cast_nullable_to_non_nullable
as double?,consumerMarketAnchor: freezed == consumerMarketAnchor ? _self.consumerMarketAnchor : consumerMarketAnchor // ignore: cast_nullable_to_non_nullable
as double?,fairMarketValue: freezed == fairMarketValue ? _self.fairMarketValue : fairMarketValue // ignore: cast_nullable_to_non_nullable
as double?,estBookValue: freezed == estBookValue ? _self.estBookValue : estBookValue // ignore: cast_nullable_to_non_nullable
as double?,sellerRecoveryRatio: freezed == sellerRecoveryRatio ? _self.sellerRecoveryRatio : sellerRecoveryRatio // ignore: cast_nullable_to_non_nullable
as double?,depreciationPct: freezed == depreciationPct ? _self.depreciationPct : depreciationPct // ignore: cast_nullable_to_non_nullable
as double?,ageMonths: freezed == ageMonths ? _self.ageMonths : ageMonths // ignore: cast_nullable_to_non_nullable
as int?,lastValuedAt: freezed == lastValuedAt ? _self.lastValuedAt : lastValuedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,modelName: freezed == modelName ? _self.modelName : modelName // ignore: cast_nullable_to_non_nullable
as String?,assetType: freezed == assetType ? _self.assetType : assetType // ignore: cast_nullable_to_non_nullable
as String?,conditionGrade: freezed == conditionGrade ? _self.conditionGrade : conditionGrade // ignore: cast_nullable_to_non_nullable
as String?,quantity: freezed == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int?,cpuScore: freezed == cpuScore ? _self.cpuScore : cpuScore // ignore: cast_nullable_to_non_nullable
as double?,ramGb: freezed == ramGb ? _self.ramGb : ramGb // ignore: cast_nullable_to_non_nullable
as double?,storageGb: freezed == storageGb ? _self.storageGb : storageGb // ignore: cast_nullable_to_non_nullable
as double?,
  ));
}

}


/// Adds pattern-matching-related methods to [Listing].
extension ListingPatterns on Listing {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Listing value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Listing() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Listing value)  $default,){
final _that = this;
switch (_that) {
case _Listing():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Listing value)?  $default,){
final _that = this;
switch (_that) {
case _Listing() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Listing() when $default != null:
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb)  $default,) {final _that = this;
switch (_that) {
case _Listing():
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb)?  $default,) {final _that = this;
switch (_that) {
case _Listing() when $default != null:
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Listing extends Listing {
  const _Listing({required this.id, required this.assetId, required this.companyId, required this.valuationFlag, required this.status, @IsoDateTimeConverter() required this.createdAt, this.listedPrice, this.sellerOfferPrice, this.buyerAskPrice, this.grossMargin, this.consumerMarketAnchor, this.fairMarketValue, this.estBookValue, this.sellerRecoveryRatio, this.depreciationPct, this.ageMonths, @NullableIsoDateTimeConverter() this.lastValuedAt, this.modelName, this.assetType, this.conditionGrade, this.quantity, this.cpuScore, this.ramGb, this.storageGb}): super._();
  factory _Listing.fromJson(Map<String, dynamic> json) => _$ListingFromJson(json);

@override final  String id;
@override final  String assetId;
@override final  String companyId;
@override final  String valuationFlag;
@override final  String status;
@override@IsoDateTimeConverter() final  DateTime createdAt;
@override final  double? listedPrice;
@override final  double? sellerOfferPrice;
@override final  double? buyerAskPrice;
@override final  double? grossMargin;
@override final  double? consumerMarketAnchor;
@override final  double? fairMarketValue;
@override final  double? estBookValue;
@override final  double? sellerRecoveryRatio;
@override final  double? depreciationPct;
@override final  int? ageMonths;
@override@NullableIsoDateTimeConverter() final  DateTime? lastValuedAt;
// Joined fields (denormalized from the asset row for marketplace cards)
@override final  String? modelName;
@override final  String? assetType;
@override final  String? conditionGrade;
@override final  int? quantity;
@override final  double? cpuScore;
@override final  double? ramGb;
@override final  double? storageGb;

/// Create a copy of Listing
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ListingCopyWith<_Listing> get copyWith => __$ListingCopyWithImpl<_Listing>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ListingToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Listing&&(identical(other.id, id) || other.id == id)&&(identical(other.assetId, assetId) || other.assetId == assetId)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.valuationFlag, valuationFlag) || other.valuationFlag == valuationFlag)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.listedPrice, listedPrice) || other.listedPrice == listedPrice)&&(identical(other.sellerOfferPrice, sellerOfferPrice) || other.sellerOfferPrice == sellerOfferPrice)&&(identical(other.buyerAskPrice, buyerAskPrice) || other.buyerAskPrice == buyerAskPrice)&&(identical(other.grossMargin, grossMargin) || other.grossMargin == grossMargin)&&(identical(other.consumerMarketAnchor, consumerMarketAnchor) || other.consumerMarketAnchor == consumerMarketAnchor)&&(identical(other.fairMarketValue, fairMarketValue) || other.fairMarketValue == fairMarketValue)&&(identical(other.estBookValue, estBookValue) || other.estBookValue == estBookValue)&&(identical(other.sellerRecoveryRatio, sellerRecoveryRatio) || other.sellerRecoveryRatio == sellerRecoveryRatio)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.ageMonths, ageMonths) || other.ageMonths == ageMonths)&&(identical(other.lastValuedAt, lastValuedAt) || other.lastValuedAt == lastValuedAt)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,assetId,companyId,valuationFlag,status,createdAt,listedPrice,sellerOfferPrice,buyerAskPrice,grossMargin,consumerMarketAnchor,fairMarketValue,estBookValue,sellerRecoveryRatio,depreciationPct,ageMonths,lastValuedAt,modelName,assetType,conditionGrade,quantity,cpuScore,ramGb,storageGb]);

@override
String toString() {
  return 'Listing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb)';
}


}

/// @nodoc
abstract mixin class _$ListingCopyWith<$Res> implements $ListingCopyWith<$Res> {
  factory _$ListingCopyWith(_Listing value, $Res Function(_Listing) _then) = __$ListingCopyWithImpl;
@override @useResult
$Res call({
 String id, String assetId, String companyId, String valuationFlag, String status,@IsoDateTimeConverter() DateTime createdAt, double? listedPrice, double? sellerOfferPrice, double? buyerAskPrice, double? grossMargin, double? consumerMarketAnchor, double? fairMarketValue, double? estBookValue, double? sellerRecoveryRatio, double? depreciationPct, int? ageMonths,@NullableIsoDateTimeConverter() DateTime? lastValuedAt, String? modelName, String? assetType, String? conditionGrade, int? quantity, double? cpuScore, double? ramGb, double? storageGb
});




}
/// @nodoc
class __$ListingCopyWithImpl<$Res>
    implements _$ListingCopyWith<$Res> {
  __$ListingCopyWithImpl(this._self, this._then);

  final _Listing _self;
  final $Res Function(_Listing) _then;

/// Create a copy of Listing
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? assetId = null,Object? companyId = null,Object? valuationFlag = null,Object? status = null,Object? createdAt = null,Object? listedPrice = freezed,Object? sellerOfferPrice = freezed,Object? buyerAskPrice = freezed,Object? grossMargin = freezed,Object? consumerMarketAnchor = freezed,Object? fairMarketValue = freezed,Object? estBookValue = freezed,Object? sellerRecoveryRatio = freezed,Object? depreciationPct = freezed,Object? ageMonths = freezed,Object? lastValuedAt = freezed,Object? modelName = freezed,Object? assetType = freezed,Object? conditionGrade = freezed,Object? quantity = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,}) {
  return _then(_Listing(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,assetId: null == assetId ? _self.assetId : assetId // ignore: cast_nullable_to_non_nullable
as String,companyId: null == companyId ? _self.companyId : companyId // ignore: cast_nullable_to_non_nullable
as String,valuationFlag: null == valuationFlag ? _self.valuationFlag : valuationFlag // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,listedPrice: freezed == listedPrice ? _self.listedPrice : listedPrice // ignore: cast_nullable_to_non_nullable
as double?,sellerOfferPrice: freezed == sellerOfferPrice ? _self.sellerOfferPrice : sellerOfferPrice // ignore: cast_nullable_to_non_nullable
as double?,buyerAskPrice: freezed == buyerAskPrice ? _self.buyerAskPrice : buyerAskPrice // ignore: cast_nullable_to_non_nullable
as double?,grossMargin: freezed == grossMargin ? _self.grossMargin : grossMargin // ignore: cast_nullable_to_non_nullable
as double?,consumerMarketAnchor: freezed == consumerMarketAnchor ? _self.consumerMarketAnchor : consumerMarketAnchor // ignore: cast_nullable_to_non_nullable
as double?,fairMarketValue: freezed == fairMarketValue ? _self.fairMarketValue : fairMarketValue // ignore: cast_nullable_to_non_nullable
as double?,estBookValue: freezed == estBookValue ? _self.estBookValue : estBookValue // ignore: cast_nullable_to_non_nullable
as double?,sellerRecoveryRatio: freezed == sellerRecoveryRatio ? _self.sellerRecoveryRatio : sellerRecoveryRatio // ignore: cast_nullable_to_non_nullable
as double?,depreciationPct: freezed == depreciationPct ? _self.depreciationPct : depreciationPct // ignore: cast_nullable_to_non_nullable
as double?,ageMonths: freezed == ageMonths ? _self.ageMonths : ageMonths // ignore: cast_nullable_to_non_nullable
as int?,lastValuedAt: freezed == lastValuedAt ? _self.lastValuedAt : lastValuedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,modelName: freezed == modelName ? _self.modelName : modelName // ignore: cast_nullable_to_non_nullable
as String?,assetType: freezed == assetType ? _self.assetType : assetType // ignore: cast_nullable_to_non_nullable
as String?,conditionGrade: freezed == conditionGrade ? _self.conditionGrade : conditionGrade // ignore: cast_nullable_to_non_nullable
as String?,quantity: freezed == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int?,cpuScore: freezed == cpuScore ? _self.cpuScore : cpuScore // ignore: cast_nullable_to_non_nullable
as double?,ramGb: freezed == ramGb ? _self.ramGb : ramGb // ignore: cast_nullable_to_non_nullable
as double?,storageGb: freezed == storageGb ? _self.storageGb : storageGb // ignore: cast_nullable_to_non_nullable
as double?,
  ));
}


}


/// @nodoc
mixin _$MarketplaceListing {

 String get id; String get assetId; String get companyId; String get valuationFlag; String get status;@IsoDateTimeConverter() DateTime get createdAt; double? get listedPrice; double? get sellerOfferPrice; double? get buyerAskPrice; double? get grossMargin; double? get consumerMarketAnchor; double? get fairMarketValue; double? get estBookValue; double? get sellerRecoveryRatio; double? get depreciationPct; int? get ageMonths;@NullableIsoDateTimeConverter() DateTime? get lastValuedAt; String? get modelName; String? get assetType; String? get conditionGrade; int? get quantity; double? get cpuScore; double? get ramGb; double? get storageGb; String? get sellerName; String? get sellerIndustry; String? get sellerSizeBand;
/// Create a copy of MarketplaceListing
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MarketplaceListingCopyWith<MarketplaceListing> get copyWith => _$MarketplaceListingCopyWithImpl<MarketplaceListing>(this as MarketplaceListing, _$identity);

  /// Serializes this MarketplaceListing to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MarketplaceListing&&(identical(other.id, id) || other.id == id)&&(identical(other.assetId, assetId) || other.assetId == assetId)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.valuationFlag, valuationFlag) || other.valuationFlag == valuationFlag)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.listedPrice, listedPrice) || other.listedPrice == listedPrice)&&(identical(other.sellerOfferPrice, sellerOfferPrice) || other.sellerOfferPrice == sellerOfferPrice)&&(identical(other.buyerAskPrice, buyerAskPrice) || other.buyerAskPrice == buyerAskPrice)&&(identical(other.grossMargin, grossMargin) || other.grossMargin == grossMargin)&&(identical(other.consumerMarketAnchor, consumerMarketAnchor) || other.consumerMarketAnchor == consumerMarketAnchor)&&(identical(other.fairMarketValue, fairMarketValue) || other.fairMarketValue == fairMarketValue)&&(identical(other.estBookValue, estBookValue) || other.estBookValue == estBookValue)&&(identical(other.sellerRecoveryRatio, sellerRecoveryRatio) || other.sellerRecoveryRatio == sellerRecoveryRatio)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.ageMonths, ageMonths) || other.ageMonths == ageMonths)&&(identical(other.lastValuedAt, lastValuedAt) || other.lastValuedAt == lastValuedAt)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb)&&(identical(other.sellerName, sellerName) || other.sellerName == sellerName)&&(identical(other.sellerIndustry, sellerIndustry) || other.sellerIndustry == sellerIndustry)&&(identical(other.sellerSizeBand, sellerSizeBand) || other.sellerSizeBand == sellerSizeBand));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,assetId,companyId,valuationFlag,status,createdAt,listedPrice,sellerOfferPrice,buyerAskPrice,grossMargin,consumerMarketAnchor,fairMarketValue,estBookValue,sellerRecoveryRatio,depreciationPct,ageMonths,lastValuedAt,modelName,assetType,conditionGrade,quantity,cpuScore,ramGb,storageGb,sellerName,sellerIndustry,sellerSizeBand]);

@override
String toString() {
  return 'MarketplaceListing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, sellerName: $sellerName, sellerIndustry: $sellerIndustry, sellerSizeBand: $sellerSizeBand)';
}


}

/// @nodoc
abstract mixin class $MarketplaceListingCopyWith<$Res>  {
  factory $MarketplaceListingCopyWith(MarketplaceListing value, $Res Function(MarketplaceListing) _then) = _$MarketplaceListingCopyWithImpl;
@useResult
$Res call({
 String id, String assetId, String companyId, String valuationFlag, String status,@IsoDateTimeConverter() DateTime createdAt, double? listedPrice, double? sellerOfferPrice, double? buyerAskPrice, double? grossMargin, double? consumerMarketAnchor, double? fairMarketValue, double? estBookValue, double? sellerRecoveryRatio, double? depreciationPct, int? ageMonths,@NullableIsoDateTimeConverter() DateTime? lastValuedAt, String? modelName, String? assetType, String? conditionGrade, int? quantity, double? cpuScore, double? ramGb, double? storageGb, String? sellerName, String? sellerIndustry, String? sellerSizeBand
});




}
/// @nodoc
class _$MarketplaceListingCopyWithImpl<$Res>
    implements $MarketplaceListingCopyWith<$Res> {
  _$MarketplaceListingCopyWithImpl(this._self, this._then);

  final MarketplaceListing _self;
  final $Res Function(MarketplaceListing) _then;

/// Create a copy of MarketplaceListing
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? assetId = null,Object? companyId = null,Object? valuationFlag = null,Object? status = null,Object? createdAt = null,Object? listedPrice = freezed,Object? sellerOfferPrice = freezed,Object? buyerAskPrice = freezed,Object? grossMargin = freezed,Object? consumerMarketAnchor = freezed,Object? fairMarketValue = freezed,Object? estBookValue = freezed,Object? sellerRecoveryRatio = freezed,Object? depreciationPct = freezed,Object? ageMonths = freezed,Object? lastValuedAt = freezed,Object? modelName = freezed,Object? assetType = freezed,Object? conditionGrade = freezed,Object? quantity = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,Object? sellerName = freezed,Object? sellerIndustry = freezed,Object? sellerSizeBand = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,assetId: null == assetId ? _self.assetId : assetId // ignore: cast_nullable_to_non_nullable
as String,companyId: null == companyId ? _self.companyId : companyId // ignore: cast_nullable_to_non_nullable
as String,valuationFlag: null == valuationFlag ? _self.valuationFlag : valuationFlag // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,listedPrice: freezed == listedPrice ? _self.listedPrice : listedPrice // ignore: cast_nullable_to_non_nullable
as double?,sellerOfferPrice: freezed == sellerOfferPrice ? _self.sellerOfferPrice : sellerOfferPrice // ignore: cast_nullable_to_non_nullable
as double?,buyerAskPrice: freezed == buyerAskPrice ? _self.buyerAskPrice : buyerAskPrice // ignore: cast_nullable_to_non_nullable
as double?,grossMargin: freezed == grossMargin ? _self.grossMargin : grossMargin // ignore: cast_nullable_to_non_nullable
as double?,consumerMarketAnchor: freezed == consumerMarketAnchor ? _self.consumerMarketAnchor : consumerMarketAnchor // ignore: cast_nullable_to_non_nullable
as double?,fairMarketValue: freezed == fairMarketValue ? _self.fairMarketValue : fairMarketValue // ignore: cast_nullable_to_non_nullable
as double?,estBookValue: freezed == estBookValue ? _self.estBookValue : estBookValue // ignore: cast_nullable_to_non_nullable
as double?,sellerRecoveryRatio: freezed == sellerRecoveryRatio ? _self.sellerRecoveryRatio : sellerRecoveryRatio // ignore: cast_nullable_to_non_nullable
as double?,depreciationPct: freezed == depreciationPct ? _self.depreciationPct : depreciationPct // ignore: cast_nullable_to_non_nullable
as double?,ageMonths: freezed == ageMonths ? _self.ageMonths : ageMonths // ignore: cast_nullable_to_non_nullable
as int?,lastValuedAt: freezed == lastValuedAt ? _self.lastValuedAt : lastValuedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,modelName: freezed == modelName ? _self.modelName : modelName // ignore: cast_nullable_to_non_nullable
as String?,assetType: freezed == assetType ? _self.assetType : assetType // ignore: cast_nullable_to_non_nullable
as String?,conditionGrade: freezed == conditionGrade ? _self.conditionGrade : conditionGrade // ignore: cast_nullable_to_non_nullable
as String?,quantity: freezed == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int?,cpuScore: freezed == cpuScore ? _self.cpuScore : cpuScore // ignore: cast_nullable_to_non_nullable
as double?,ramGb: freezed == ramGb ? _self.ramGb : ramGb // ignore: cast_nullable_to_non_nullable
as double?,storageGb: freezed == storageGb ? _self.storageGb : storageGb // ignore: cast_nullable_to_non_nullable
as double?,sellerName: freezed == sellerName ? _self.sellerName : sellerName // ignore: cast_nullable_to_non_nullable
as String?,sellerIndustry: freezed == sellerIndustry ? _self.sellerIndustry : sellerIndustry // ignore: cast_nullable_to_non_nullable
as String?,sellerSizeBand: freezed == sellerSizeBand ? _self.sellerSizeBand : sellerSizeBand // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [MarketplaceListing].
extension MarketplaceListingPatterns on MarketplaceListing {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MarketplaceListing value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MarketplaceListing() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MarketplaceListing value)  $default,){
final _that = this;
switch (_that) {
case _MarketplaceListing():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MarketplaceListing value)?  $default,){
final _that = this;
switch (_that) {
case _MarketplaceListing() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  String? sellerName,  String? sellerIndustry,  String? sellerSizeBand)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MarketplaceListing() when $default != null:
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.sellerName,_that.sellerIndustry,_that.sellerSizeBand);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  String? sellerName,  String? sellerIndustry,  String? sellerSizeBand)  $default,) {final _that = this;
switch (_that) {
case _MarketplaceListing():
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.sellerName,_that.sellerIndustry,_that.sellerSizeBand);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  String? sellerName,  String? sellerIndustry,  String? sellerSizeBand)?  $default,) {final _that = this;
switch (_that) {
case _MarketplaceListing() when $default != null:
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.sellerName,_that.sellerIndustry,_that.sellerSizeBand);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MarketplaceListing extends MarketplaceListing {
  const _MarketplaceListing({required this.id, required this.assetId, required this.companyId, required this.valuationFlag, required this.status, @IsoDateTimeConverter() required this.createdAt, this.listedPrice, this.sellerOfferPrice, this.buyerAskPrice, this.grossMargin, this.consumerMarketAnchor, this.fairMarketValue, this.estBookValue, this.sellerRecoveryRatio, this.depreciationPct, this.ageMonths, @NullableIsoDateTimeConverter() this.lastValuedAt, this.modelName, this.assetType, this.conditionGrade, this.quantity, this.cpuScore, this.ramGb, this.storageGb, this.sellerName, this.sellerIndustry, this.sellerSizeBand}): super._();
  factory _MarketplaceListing.fromJson(Map<String, dynamic> json) => _$MarketplaceListingFromJson(json);

@override final  String id;
@override final  String assetId;
@override final  String companyId;
@override final  String valuationFlag;
@override final  String status;
@override@IsoDateTimeConverter() final  DateTime createdAt;
@override final  double? listedPrice;
@override final  double? sellerOfferPrice;
@override final  double? buyerAskPrice;
@override final  double? grossMargin;
@override final  double? consumerMarketAnchor;
@override final  double? fairMarketValue;
@override final  double? estBookValue;
@override final  double? sellerRecoveryRatio;
@override final  double? depreciationPct;
@override final  int? ageMonths;
@override@NullableIsoDateTimeConverter() final  DateTime? lastValuedAt;
@override final  String? modelName;
@override final  String? assetType;
@override final  String? conditionGrade;
@override final  int? quantity;
@override final  double? cpuScore;
@override final  double? ramGb;
@override final  double? storageGb;
@override final  String? sellerName;
@override final  String? sellerIndustry;
@override final  String? sellerSizeBand;

/// Create a copy of MarketplaceListing
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MarketplaceListingCopyWith<_MarketplaceListing> get copyWith => __$MarketplaceListingCopyWithImpl<_MarketplaceListing>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MarketplaceListingToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MarketplaceListing&&(identical(other.id, id) || other.id == id)&&(identical(other.assetId, assetId) || other.assetId == assetId)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.valuationFlag, valuationFlag) || other.valuationFlag == valuationFlag)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.listedPrice, listedPrice) || other.listedPrice == listedPrice)&&(identical(other.sellerOfferPrice, sellerOfferPrice) || other.sellerOfferPrice == sellerOfferPrice)&&(identical(other.buyerAskPrice, buyerAskPrice) || other.buyerAskPrice == buyerAskPrice)&&(identical(other.grossMargin, grossMargin) || other.grossMargin == grossMargin)&&(identical(other.consumerMarketAnchor, consumerMarketAnchor) || other.consumerMarketAnchor == consumerMarketAnchor)&&(identical(other.fairMarketValue, fairMarketValue) || other.fairMarketValue == fairMarketValue)&&(identical(other.estBookValue, estBookValue) || other.estBookValue == estBookValue)&&(identical(other.sellerRecoveryRatio, sellerRecoveryRatio) || other.sellerRecoveryRatio == sellerRecoveryRatio)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.ageMonths, ageMonths) || other.ageMonths == ageMonths)&&(identical(other.lastValuedAt, lastValuedAt) || other.lastValuedAt == lastValuedAt)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb)&&(identical(other.sellerName, sellerName) || other.sellerName == sellerName)&&(identical(other.sellerIndustry, sellerIndustry) || other.sellerIndustry == sellerIndustry)&&(identical(other.sellerSizeBand, sellerSizeBand) || other.sellerSizeBand == sellerSizeBand));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,assetId,companyId,valuationFlag,status,createdAt,listedPrice,sellerOfferPrice,buyerAskPrice,grossMargin,consumerMarketAnchor,fairMarketValue,estBookValue,sellerRecoveryRatio,depreciationPct,ageMonths,lastValuedAt,modelName,assetType,conditionGrade,quantity,cpuScore,ramGb,storageGb,sellerName,sellerIndustry,sellerSizeBand]);

@override
String toString() {
  return 'MarketplaceListing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, sellerName: $sellerName, sellerIndustry: $sellerIndustry, sellerSizeBand: $sellerSizeBand)';
}


}

/// @nodoc
abstract mixin class _$MarketplaceListingCopyWith<$Res> implements $MarketplaceListingCopyWith<$Res> {
  factory _$MarketplaceListingCopyWith(_MarketplaceListing value, $Res Function(_MarketplaceListing) _then) = __$MarketplaceListingCopyWithImpl;
@override @useResult
$Res call({
 String id, String assetId, String companyId, String valuationFlag, String status,@IsoDateTimeConverter() DateTime createdAt, double? listedPrice, double? sellerOfferPrice, double? buyerAskPrice, double? grossMargin, double? consumerMarketAnchor, double? fairMarketValue, double? estBookValue, double? sellerRecoveryRatio, double? depreciationPct, int? ageMonths,@NullableIsoDateTimeConverter() DateTime? lastValuedAt, String? modelName, String? assetType, String? conditionGrade, int? quantity, double? cpuScore, double? ramGb, double? storageGb, String? sellerName, String? sellerIndustry, String? sellerSizeBand
});




}
/// @nodoc
class __$MarketplaceListingCopyWithImpl<$Res>
    implements _$MarketplaceListingCopyWith<$Res> {
  __$MarketplaceListingCopyWithImpl(this._self, this._then);

  final _MarketplaceListing _self;
  final $Res Function(_MarketplaceListing) _then;

/// Create a copy of MarketplaceListing
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? assetId = null,Object? companyId = null,Object? valuationFlag = null,Object? status = null,Object? createdAt = null,Object? listedPrice = freezed,Object? sellerOfferPrice = freezed,Object? buyerAskPrice = freezed,Object? grossMargin = freezed,Object? consumerMarketAnchor = freezed,Object? fairMarketValue = freezed,Object? estBookValue = freezed,Object? sellerRecoveryRatio = freezed,Object? depreciationPct = freezed,Object? ageMonths = freezed,Object? lastValuedAt = freezed,Object? modelName = freezed,Object? assetType = freezed,Object? conditionGrade = freezed,Object? quantity = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,Object? sellerName = freezed,Object? sellerIndustry = freezed,Object? sellerSizeBand = freezed,}) {
  return _then(_MarketplaceListing(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,assetId: null == assetId ? _self.assetId : assetId // ignore: cast_nullable_to_non_nullable
as String,companyId: null == companyId ? _self.companyId : companyId // ignore: cast_nullable_to_non_nullable
as String,valuationFlag: null == valuationFlag ? _self.valuationFlag : valuationFlag // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,listedPrice: freezed == listedPrice ? _self.listedPrice : listedPrice // ignore: cast_nullable_to_non_nullable
as double?,sellerOfferPrice: freezed == sellerOfferPrice ? _self.sellerOfferPrice : sellerOfferPrice // ignore: cast_nullable_to_non_nullable
as double?,buyerAskPrice: freezed == buyerAskPrice ? _self.buyerAskPrice : buyerAskPrice // ignore: cast_nullable_to_non_nullable
as double?,grossMargin: freezed == grossMargin ? _self.grossMargin : grossMargin // ignore: cast_nullable_to_non_nullable
as double?,consumerMarketAnchor: freezed == consumerMarketAnchor ? _self.consumerMarketAnchor : consumerMarketAnchor // ignore: cast_nullable_to_non_nullable
as double?,fairMarketValue: freezed == fairMarketValue ? _self.fairMarketValue : fairMarketValue // ignore: cast_nullable_to_non_nullable
as double?,estBookValue: freezed == estBookValue ? _self.estBookValue : estBookValue // ignore: cast_nullable_to_non_nullable
as double?,sellerRecoveryRatio: freezed == sellerRecoveryRatio ? _self.sellerRecoveryRatio : sellerRecoveryRatio // ignore: cast_nullable_to_non_nullable
as double?,depreciationPct: freezed == depreciationPct ? _self.depreciationPct : depreciationPct // ignore: cast_nullable_to_non_nullable
as double?,ageMonths: freezed == ageMonths ? _self.ageMonths : ageMonths // ignore: cast_nullable_to_non_nullable
as int?,lastValuedAt: freezed == lastValuedAt ? _self.lastValuedAt : lastValuedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,modelName: freezed == modelName ? _self.modelName : modelName // ignore: cast_nullable_to_non_nullable
as String?,assetType: freezed == assetType ? _self.assetType : assetType // ignore: cast_nullable_to_non_nullable
as String?,conditionGrade: freezed == conditionGrade ? _self.conditionGrade : conditionGrade // ignore: cast_nullable_to_non_nullable
as String?,quantity: freezed == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int?,cpuScore: freezed == cpuScore ? _self.cpuScore : cpuScore // ignore: cast_nullable_to_non_nullable
as double?,ramGb: freezed == ramGb ? _self.ramGb : ramGb // ignore: cast_nullable_to_non_nullable
as double?,storageGb: freezed == storageGb ? _self.storageGb : storageGb // ignore: cast_nullable_to_non_nullable
as double?,sellerName: freezed == sellerName ? _self.sellerName : sellerName // ignore: cast_nullable_to_non_nullable
as String?,sellerIndustry: freezed == sellerIndustry ? _self.sellerIndustry : sellerIndustry // ignore: cast_nullable_to_non_nullable
as String?,sellerSizeBand: freezed == sellerSizeBand ? _self.sellerSizeBand : sellerSizeBand // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
