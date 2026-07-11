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
 String? get modelName; String? get assetType; String? get conditionGrade; int? get quantity; double? get cpuScore; double? get ramGb; double? get storageGb;// Listing-owned media (array of image URLs)
 List<String>? get productImages;// Joined device-spec fields (from the asset row) for the PLP/PDP
 String? get manufacturer; String? get modelNumber; int? get yearOfManufacture; String? get functionalStatus; String? get knownDefects; String? get dataWipeStatus; String? get warrantyStatus;@NullableIsoDateTimeConverter() DateTime? get warrantyExpiration; String? get includedAccessories; String? get shipsFromLocation; String? get cpuModel; int? get cpuCores; double? get cpuSpeedGhz; String? get ramType; String? get storageType; String? get gpuModel; double? get screenSizeIn; String? get screenResolution; bool? get touchscreen; String? get formFactor; int? get powerSupplyWatts; String? get panelType; int? get refreshRateHz; String? get ports; int? get portCount; String? get throughput; bool? get managed; bool? get carrierLocked;
/// Create a copy of Listing
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ListingCopyWith<Listing> get copyWith => _$ListingCopyWithImpl<Listing>(this as Listing, _$identity);

  /// Serializes this Listing to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Listing&&(identical(other.id, id) || other.id == id)&&(identical(other.assetId, assetId) || other.assetId == assetId)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.valuationFlag, valuationFlag) || other.valuationFlag == valuationFlag)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.listedPrice, listedPrice) || other.listedPrice == listedPrice)&&(identical(other.sellerOfferPrice, sellerOfferPrice) || other.sellerOfferPrice == sellerOfferPrice)&&(identical(other.buyerAskPrice, buyerAskPrice) || other.buyerAskPrice == buyerAskPrice)&&(identical(other.grossMargin, grossMargin) || other.grossMargin == grossMargin)&&(identical(other.consumerMarketAnchor, consumerMarketAnchor) || other.consumerMarketAnchor == consumerMarketAnchor)&&(identical(other.fairMarketValue, fairMarketValue) || other.fairMarketValue == fairMarketValue)&&(identical(other.estBookValue, estBookValue) || other.estBookValue == estBookValue)&&(identical(other.sellerRecoveryRatio, sellerRecoveryRatio) || other.sellerRecoveryRatio == sellerRecoveryRatio)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.ageMonths, ageMonths) || other.ageMonths == ageMonths)&&(identical(other.lastValuedAt, lastValuedAt) || other.lastValuedAt == lastValuedAt)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb)&&const DeepCollectionEquality().equals(other.productImages, productImages)&&(identical(other.manufacturer, manufacturer) || other.manufacturer == manufacturer)&&(identical(other.modelNumber, modelNumber) || other.modelNumber == modelNumber)&&(identical(other.yearOfManufacture, yearOfManufacture) || other.yearOfManufacture == yearOfManufacture)&&(identical(other.functionalStatus, functionalStatus) || other.functionalStatus == functionalStatus)&&(identical(other.knownDefects, knownDefects) || other.knownDefects == knownDefects)&&(identical(other.dataWipeStatus, dataWipeStatus) || other.dataWipeStatus == dataWipeStatus)&&(identical(other.warrantyStatus, warrantyStatus) || other.warrantyStatus == warrantyStatus)&&(identical(other.warrantyExpiration, warrantyExpiration) || other.warrantyExpiration == warrantyExpiration)&&(identical(other.includedAccessories, includedAccessories) || other.includedAccessories == includedAccessories)&&(identical(other.shipsFromLocation, shipsFromLocation) || other.shipsFromLocation == shipsFromLocation)&&(identical(other.cpuModel, cpuModel) || other.cpuModel == cpuModel)&&(identical(other.cpuCores, cpuCores) || other.cpuCores == cpuCores)&&(identical(other.cpuSpeedGhz, cpuSpeedGhz) || other.cpuSpeedGhz == cpuSpeedGhz)&&(identical(other.ramType, ramType) || other.ramType == ramType)&&(identical(other.storageType, storageType) || other.storageType == storageType)&&(identical(other.gpuModel, gpuModel) || other.gpuModel == gpuModel)&&(identical(other.screenSizeIn, screenSizeIn) || other.screenSizeIn == screenSizeIn)&&(identical(other.screenResolution, screenResolution) || other.screenResolution == screenResolution)&&(identical(other.touchscreen, touchscreen) || other.touchscreen == touchscreen)&&(identical(other.formFactor, formFactor) || other.formFactor == formFactor)&&(identical(other.powerSupplyWatts, powerSupplyWatts) || other.powerSupplyWatts == powerSupplyWatts)&&(identical(other.panelType, panelType) || other.panelType == panelType)&&(identical(other.refreshRateHz, refreshRateHz) || other.refreshRateHz == refreshRateHz)&&(identical(other.ports, ports) || other.ports == ports)&&(identical(other.portCount, portCount) || other.portCount == portCount)&&(identical(other.throughput, throughput) || other.throughput == throughput)&&(identical(other.managed, managed) || other.managed == managed)&&(identical(other.carrierLocked, carrierLocked) || other.carrierLocked == carrierLocked));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,assetId,companyId,valuationFlag,status,createdAt,listedPrice,sellerOfferPrice,buyerAskPrice,grossMargin,consumerMarketAnchor,fairMarketValue,estBookValue,sellerRecoveryRatio,depreciationPct,ageMonths,lastValuedAt,modelName,assetType,conditionGrade,quantity,cpuScore,ramGb,storageGb,const DeepCollectionEquality().hash(productImages),manufacturer,modelNumber,yearOfManufacture,functionalStatus,knownDefects,dataWipeStatus,warrantyStatus,warrantyExpiration,includedAccessories,shipsFromLocation,cpuModel,cpuCores,cpuSpeedGhz,ramType,storageType,gpuModel,screenSizeIn,screenResolution,touchscreen,formFactor,powerSupplyWatts,panelType,refreshRateHz,ports,portCount,throughput,managed,carrierLocked]);

@override
String toString() {
  return 'Listing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, productImages: $productImages, manufacturer: $manufacturer, modelNumber: $modelNumber, yearOfManufacture: $yearOfManufacture, functionalStatus: $functionalStatus, knownDefects: $knownDefects, dataWipeStatus: $dataWipeStatus, warrantyStatus: $warrantyStatus, warrantyExpiration: $warrantyExpiration, includedAccessories: $includedAccessories, shipsFromLocation: $shipsFromLocation, cpuModel: $cpuModel, cpuCores: $cpuCores, cpuSpeedGhz: $cpuSpeedGhz, ramType: $ramType, storageType: $storageType, gpuModel: $gpuModel, screenSizeIn: $screenSizeIn, screenResolution: $screenResolution, touchscreen: $touchscreen, formFactor: $formFactor, powerSupplyWatts: $powerSupplyWatts, panelType: $panelType, refreshRateHz: $refreshRateHz, ports: $ports, portCount: $portCount, throughput: $throughput, managed: $managed, carrierLocked: $carrierLocked)';
}


}

/// @nodoc
abstract mixin class $ListingCopyWith<$Res>  {
  factory $ListingCopyWith(Listing value, $Res Function(Listing) _then) = _$ListingCopyWithImpl;
@useResult
$Res call({
 String id, String assetId, String companyId, String valuationFlag, String status,@IsoDateTimeConverter() DateTime createdAt, double? listedPrice, double? sellerOfferPrice, double? buyerAskPrice, double? grossMargin, double? consumerMarketAnchor, double? fairMarketValue, double? estBookValue, double? sellerRecoveryRatio, double? depreciationPct, int? ageMonths,@NullableIsoDateTimeConverter() DateTime? lastValuedAt, String? modelName, String? assetType, String? conditionGrade, int? quantity, double? cpuScore, double? ramGb, double? storageGb, List<String>? productImages, String? manufacturer, String? modelNumber, int? yearOfManufacture, String? functionalStatus, String? knownDefects, String? dataWipeStatus, String? warrantyStatus,@NullableIsoDateTimeConverter() DateTime? warrantyExpiration, String? includedAccessories, String? shipsFromLocation, String? cpuModel, int? cpuCores, double? cpuSpeedGhz, String? ramType, String? storageType, String? gpuModel, double? screenSizeIn, String? screenResolution, bool? touchscreen, String? formFactor, int? powerSupplyWatts, String? panelType, int? refreshRateHz, String? ports, int? portCount, String? throughput, bool? managed, bool? carrierLocked
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
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? assetId = null,Object? companyId = null,Object? valuationFlag = null,Object? status = null,Object? createdAt = null,Object? listedPrice = freezed,Object? sellerOfferPrice = freezed,Object? buyerAskPrice = freezed,Object? grossMargin = freezed,Object? consumerMarketAnchor = freezed,Object? fairMarketValue = freezed,Object? estBookValue = freezed,Object? sellerRecoveryRatio = freezed,Object? depreciationPct = freezed,Object? ageMonths = freezed,Object? lastValuedAt = freezed,Object? modelName = freezed,Object? assetType = freezed,Object? conditionGrade = freezed,Object? quantity = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,Object? productImages = freezed,Object? manufacturer = freezed,Object? modelNumber = freezed,Object? yearOfManufacture = freezed,Object? functionalStatus = freezed,Object? knownDefects = freezed,Object? dataWipeStatus = freezed,Object? warrantyStatus = freezed,Object? warrantyExpiration = freezed,Object? includedAccessories = freezed,Object? shipsFromLocation = freezed,Object? cpuModel = freezed,Object? cpuCores = freezed,Object? cpuSpeedGhz = freezed,Object? ramType = freezed,Object? storageType = freezed,Object? gpuModel = freezed,Object? screenSizeIn = freezed,Object? screenResolution = freezed,Object? touchscreen = freezed,Object? formFactor = freezed,Object? powerSupplyWatts = freezed,Object? panelType = freezed,Object? refreshRateHz = freezed,Object? ports = freezed,Object? portCount = freezed,Object? throughput = freezed,Object? managed = freezed,Object? carrierLocked = freezed,}) {
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
as double?,productImages: freezed == productImages ? _self.productImages : productImages // ignore: cast_nullable_to_non_nullable
as List<String>?,manufacturer: freezed == manufacturer ? _self.manufacturer : manufacturer // ignore: cast_nullable_to_non_nullable
as String?,modelNumber: freezed == modelNumber ? _self.modelNumber : modelNumber // ignore: cast_nullable_to_non_nullable
as String?,yearOfManufacture: freezed == yearOfManufacture ? _self.yearOfManufacture : yearOfManufacture // ignore: cast_nullable_to_non_nullable
as int?,functionalStatus: freezed == functionalStatus ? _self.functionalStatus : functionalStatus // ignore: cast_nullable_to_non_nullable
as String?,knownDefects: freezed == knownDefects ? _self.knownDefects : knownDefects // ignore: cast_nullable_to_non_nullable
as String?,dataWipeStatus: freezed == dataWipeStatus ? _self.dataWipeStatus : dataWipeStatus // ignore: cast_nullable_to_non_nullable
as String?,warrantyStatus: freezed == warrantyStatus ? _self.warrantyStatus : warrantyStatus // ignore: cast_nullable_to_non_nullable
as String?,warrantyExpiration: freezed == warrantyExpiration ? _self.warrantyExpiration : warrantyExpiration // ignore: cast_nullable_to_non_nullable
as DateTime?,includedAccessories: freezed == includedAccessories ? _self.includedAccessories : includedAccessories // ignore: cast_nullable_to_non_nullable
as String?,shipsFromLocation: freezed == shipsFromLocation ? _self.shipsFromLocation : shipsFromLocation // ignore: cast_nullable_to_non_nullable
as String?,cpuModel: freezed == cpuModel ? _self.cpuModel : cpuModel // ignore: cast_nullable_to_non_nullable
as String?,cpuCores: freezed == cpuCores ? _self.cpuCores : cpuCores // ignore: cast_nullable_to_non_nullable
as int?,cpuSpeedGhz: freezed == cpuSpeedGhz ? _self.cpuSpeedGhz : cpuSpeedGhz // ignore: cast_nullable_to_non_nullable
as double?,ramType: freezed == ramType ? _self.ramType : ramType // ignore: cast_nullable_to_non_nullable
as String?,storageType: freezed == storageType ? _self.storageType : storageType // ignore: cast_nullable_to_non_nullable
as String?,gpuModel: freezed == gpuModel ? _self.gpuModel : gpuModel // ignore: cast_nullable_to_non_nullable
as String?,screenSizeIn: freezed == screenSizeIn ? _self.screenSizeIn : screenSizeIn // ignore: cast_nullable_to_non_nullable
as double?,screenResolution: freezed == screenResolution ? _self.screenResolution : screenResolution // ignore: cast_nullable_to_non_nullable
as String?,touchscreen: freezed == touchscreen ? _self.touchscreen : touchscreen // ignore: cast_nullable_to_non_nullable
as bool?,formFactor: freezed == formFactor ? _self.formFactor : formFactor // ignore: cast_nullable_to_non_nullable
as String?,powerSupplyWatts: freezed == powerSupplyWatts ? _self.powerSupplyWatts : powerSupplyWatts // ignore: cast_nullable_to_non_nullable
as int?,panelType: freezed == panelType ? _self.panelType : panelType // ignore: cast_nullable_to_non_nullable
as String?,refreshRateHz: freezed == refreshRateHz ? _self.refreshRateHz : refreshRateHz // ignore: cast_nullable_to_non_nullable
as int?,ports: freezed == ports ? _self.ports : ports // ignore: cast_nullable_to_non_nullable
as String?,portCount: freezed == portCount ? _self.portCount : portCount // ignore: cast_nullable_to_non_nullable
as int?,throughput: freezed == throughput ? _self.throughput : throughput // ignore: cast_nullable_to_non_nullable
as String?,managed: freezed == managed ? _self.managed : managed // ignore: cast_nullable_to_non_nullable
as bool?,carrierLocked: freezed == carrierLocked ? _self.carrierLocked : carrierLocked // ignore: cast_nullable_to_non_nullable
as bool?,
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  List<String>? productImages,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Listing() when $default != null:
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.productImages,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  List<String>? productImages,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked)  $default,) {final _that = this;
switch (_that) {
case _Listing():
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.productImages,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  List<String>? productImages,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked)?  $default,) {final _that = this;
switch (_that) {
case _Listing() when $default != null:
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.productImages,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Listing extends Listing {
  const _Listing({required this.id, required this.assetId, required this.companyId, required this.valuationFlag, required this.status, @IsoDateTimeConverter() required this.createdAt, this.listedPrice, this.sellerOfferPrice, this.buyerAskPrice, this.grossMargin, this.consumerMarketAnchor, this.fairMarketValue, this.estBookValue, this.sellerRecoveryRatio, this.depreciationPct, this.ageMonths, @NullableIsoDateTimeConverter() this.lastValuedAt, this.modelName, this.assetType, this.conditionGrade, this.quantity, this.cpuScore, this.ramGb, this.storageGb, final  List<String>? productImages, this.manufacturer, this.modelNumber, this.yearOfManufacture, this.functionalStatus, this.knownDefects, this.dataWipeStatus, this.warrantyStatus, @NullableIsoDateTimeConverter() this.warrantyExpiration, this.includedAccessories, this.shipsFromLocation, this.cpuModel, this.cpuCores, this.cpuSpeedGhz, this.ramType, this.storageType, this.gpuModel, this.screenSizeIn, this.screenResolution, this.touchscreen, this.formFactor, this.powerSupplyWatts, this.panelType, this.refreshRateHz, this.ports, this.portCount, this.throughput, this.managed, this.carrierLocked}): _productImages = productImages,super._();
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
// Listing-owned media (array of image URLs)
 final  List<String>? _productImages;
// Listing-owned media (array of image URLs)
@override List<String>? get productImages {
  final value = _productImages;
  if (value == null) return null;
  if (_productImages is EqualUnmodifiableListView) return _productImages;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

// Joined device-spec fields (from the asset row) for the PLP/PDP
@override final  String? manufacturer;
@override final  String? modelNumber;
@override final  int? yearOfManufacture;
@override final  String? functionalStatus;
@override final  String? knownDefects;
@override final  String? dataWipeStatus;
@override final  String? warrantyStatus;
@override@NullableIsoDateTimeConverter() final  DateTime? warrantyExpiration;
@override final  String? includedAccessories;
@override final  String? shipsFromLocation;
@override final  String? cpuModel;
@override final  int? cpuCores;
@override final  double? cpuSpeedGhz;
@override final  String? ramType;
@override final  String? storageType;
@override final  String? gpuModel;
@override final  double? screenSizeIn;
@override final  String? screenResolution;
@override final  bool? touchscreen;
@override final  String? formFactor;
@override final  int? powerSupplyWatts;
@override final  String? panelType;
@override final  int? refreshRateHz;
@override final  String? ports;
@override final  int? portCount;
@override final  String? throughput;
@override final  bool? managed;
@override final  bool? carrierLocked;

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
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Listing&&(identical(other.id, id) || other.id == id)&&(identical(other.assetId, assetId) || other.assetId == assetId)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.valuationFlag, valuationFlag) || other.valuationFlag == valuationFlag)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.listedPrice, listedPrice) || other.listedPrice == listedPrice)&&(identical(other.sellerOfferPrice, sellerOfferPrice) || other.sellerOfferPrice == sellerOfferPrice)&&(identical(other.buyerAskPrice, buyerAskPrice) || other.buyerAskPrice == buyerAskPrice)&&(identical(other.grossMargin, grossMargin) || other.grossMargin == grossMargin)&&(identical(other.consumerMarketAnchor, consumerMarketAnchor) || other.consumerMarketAnchor == consumerMarketAnchor)&&(identical(other.fairMarketValue, fairMarketValue) || other.fairMarketValue == fairMarketValue)&&(identical(other.estBookValue, estBookValue) || other.estBookValue == estBookValue)&&(identical(other.sellerRecoveryRatio, sellerRecoveryRatio) || other.sellerRecoveryRatio == sellerRecoveryRatio)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.ageMonths, ageMonths) || other.ageMonths == ageMonths)&&(identical(other.lastValuedAt, lastValuedAt) || other.lastValuedAt == lastValuedAt)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb)&&const DeepCollectionEquality().equals(other._productImages, _productImages)&&(identical(other.manufacturer, manufacturer) || other.manufacturer == manufacturer)&&(identical(other.modelNumber, modelNumber) || other.modelNumber == modelNumber)&&(identical(other.yearOfManufacture, yearOfManufacture) || other.yearOfManufacture == yearOfManufacture)&&(identical(other.functionalStatus, functionalStatus) || other.functionalStatus == functionalStatus)&&(identical(other.knownDefects, knownDefects) || other.knownDefects == knownDefects)&&(identical(other.dataWipeStatus, dataWipeStatus) || other.dataWipeStatus == dataWipeStatus)&&(identical(other.warrantyStatus, warrantyStatus) || other.warrantyStatus == warrantyStatus)&&(identical(other.warrantyExpiration, warrantyExpiration) || other.warrantyExpiration == warrantyExpiration)&&(identical(other.includedAccessories, includedAccessories) || other.includedAccessories == includedAccessories)&&(identical(other.shipsFromLocation, shipsFromLocation) || other.shipsFromLocation == shipsFromLocation)&&(identical(other.cpuModel, cpuModel) || other.cpuModel == cpuModel)&&(identical(other.cpuCores, cpuCores) || other.cpuCores == cpuCores)&&(identical(other.cpuSpeedGhz, cpuSpeedGhz) || other.cpuSpeedGhz == cpuSpeedGhz)&&(identical(other.ramType, ramType) || other.ramType == ramType)&&(identical(other.storageType, storageType) || other.storageType == storageType)&&(identical(other.gpuModel, gpuModel) || other.gpuModel == gpuModel)&&(identical(other.screenSizeIn, screenSizeIn) || other.screenSizeIn == screenSizeIn)&&(identical(other.screenResolution, screenResolution) || other.screenResolution == screenResolution)&&(identical(other.touchscreen, touchscreen) || other.touchscreen == touchscreen)&&(identical(other.formFactor, formFactor) || other.formFactor == formFactor)&&(identical(other.powerSupplyWatts, powerSupplyWatts) || other.powerSupplyWatts == powerSupplyWatts)&&(identical(other.panelType, panelType) || other.panelType == panelType)&&(identical(other.refreshRateHz, refreshRateHz) || other.refreshRateHz == refreshRateHz)&&(identical(other.ports, ports) || other.ports == ports)&&(identical(other.portCount, portCount) || other.portCount == portCount)&&(identical(other.throughput, throughput) || other.throughput == throughput)&&(identical(other.managed, managed) || other.managed == managed)&&(identical(other.carrierLocked, carrierLocked) || other.carrierLocked == carrierLocked));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,assetId,companyId,valuationFlag,status,createdAt,listedPrice,sellerOfferPrice,buyerAskPrice,grossMargin,consumerMarketAnchor,fairMarketValue,estBookValue,sellerRecoveryRatio,depreciationPct,ageMonths,lastValuedAt,modelName,assetType,conditionGrade,quantity,cpuScore,ramGb,storageGb,const DeepCollectionEquality().hash(_productImages),manufacturer,modelNumber,yearOfManufacture,functionalStatus,knownDefects,dataWipeStatus,warrantyStatus,warrantyExpiration,includedAccessories,shipsFromLocation,cpuModel,cpuCores,cpuSpeedGhz,ramType,storageType,gpuModel,screenSizeIn,screenResolution,touchscreen,formFactor,powerSupplyWatts,panelType,refreshRateHz,ports,portCount,throughput,managed,carrierLocked]);

@override
String toString() {
  return 'Listing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, productImages: $productImages, manufacturer: $manufacturer, modelNumber: $modelNumber, yearOfManufacture: $yearOfManufacture, functionalStatus: $functionalStatus, knownDefects: $knownDefects, dataWipeStatus: $dataWipeStatus, warrantyStatus: $warrantyStatus, warrantyExpiration: $warrantyExpiration, includedAccessories: $includedAccessories, shipsFromLocation: $shipsFromLocation, cpuModel: $cpuModel, cpuCores: $cpuCores, cpuSpeedGhz: $cpuSpeedGhz, ramType: $ramType, storageType: $storageType, gpuModel: $gpuModel, screenSizeIn: $screenSizeIn, screenResolution: $screenResolution, touchscreen: $touchscreen, formFactor: $formFactor, powerSupplyWatts: $powerSupplyWatts, panelType: $panelType, refreshRateHz: $refreshRateHz, ports: $ports, portCount: $portCount, throughput: $throughput, managed: $managed, carrierLocked: $carrierLocked)';
}


}

/// @nodoc
abstract mixin class _$ListingCopyWith<$Res> implements $ListingCopyWith<$Res> {
  factory _$ListingCopyWith(_Listing value, $Res Function(_Listing) _then) = __$ListingCopyWithImpl;
@override @useResult
$Res call({
 String id, String assetId, String companyId, String valuationFlag, String status,@IsoDateTimeConverter() DateTime createdAt, double? listedPrice, double? sellerOfferPrice, double? buyerAskPrice, double? grossMargin, double? consumerMarketAnchor, double? fairMarketValue, double? estBookValue, double? sellerRecoveryRatio, double? depreciationPct, int? ageMonths,@NullableIsoDateTimeConverter() DateTime? lastValuedAt, String? modelName, String? assetType, String? conditionGrade, int? quantity, double? cpuScore, double? ramGb, double? storageGb, List<String>? productImages, String? manufacturer, String? modelNumber, int? yearOfManufacture, String? functionalStatus, String? knownDefects, String? dataWipeStatus, String? warrantyStatus,@NullableIsoDateTimeConverter() DateTime? warrantyExpiration, String? includedAccessories, String? shipsFromLocation, String? cpuModel, int? cpuCores, double? cpuSpeedGhz, String? ramType, String? storageType, String? gpuModel, double? screenSizeIn, String? screenResolution, bool? touchscreen, String? formFactor, int? powerSupplyWatts, String? panelType, int? refreshRateHz, String? ports, int? portCount, String? throughput, bool? managed, bool? carrierLocked
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
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? assetId = null,Object? companyId = null,Object? valuationFlag = null,Object? status = null,Object? createdAt = null,Object? listedPrice = freezed,Object? sellerOfferPrice = freezed,Object? buyerAskPrice = freezed,Object? grossMargin = freezed,Object? consumerMarketAnchor = freezed,Object? fairMarketValue = freezed,Object? estBookValue = freezed,Object? sellerRecoveryRatio = freezed,Object? depreciationPct = freezed,Object? ageMonths = freezed,Object? lastValuedAt = freezed,Object? modelName = freezed,Object? assetType = freezed,Object? conditionGrade = freezed,Object? quantity = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,Object? productImages = freezed,Object? manufacturer = freezed,Object? modelNumber = freezed,Object? yearOfManufacture = freezed,Object? functionalStatus = freezed,Object? knownDefects = freezed,Object? dataWipeStatus = freezed,Object? warrantyStatus = freezed,Object? warrantyExpiration = freezed,Object? includedAccessories = freezed,Object? shipsFromLocation = freezed,Object? cpuModel = freezed,Object? cpuCores = freezed,Object? cpuSpeedGhz = freezed,Object? ramType = freezed,Object? storageType = freezed,Object? gpuModel = freezed,Object? screenSizeIn = freezed,Object? screenResolution = freezed,Object? touchscreen = freezed,Object? formFactor = freezed,Object? powerSupplyWatts = freezed,Object? panelType = freezed,Object? refreshRateHz = freezed,Object? ports = freezed,Object? portCount = freezed,Object? throughput = freezed,Object? managed = freezed,Object? carrierLocked = freezed,}) {
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
as double?,productImages: freezed == productImages ? _self._productImages : productImages // ignore: cast_nullable_to_non_nullable
as List<String>?,manufacturer: freezed == manufacturer ? _self.manufacturer : manufacturer // ignore: cast_nullable_to_non_nullable
as String?,modelNumber: freezed == modelNumber ? _self.modelNumber : modelNumber // ignore: cast_nullable_to_non_nullable
as String?,yearOfManufacture: freezed == yearOfManufacture ? _self.yearOfManufacture : yearOfManufacture // ignore: cast_nullable_to_non_nullable
as int?,functionalStatus: freezed == functionalStatus ? _self.functionalStatus : functionalStatus // ignore: cast_nullable_to_non_nullable
as String?,knownDefects: freezed == knownDefects ? _self.knownDefects : knownDefects // ignore: cast_nullable_to_non_nullable
as String?,dataWipeStatus: freezed == dataWipeStatus ? _self.dataWipeStatus : dataWipeStatus // ignore: cast_nullable_to_non_nullable
as String?,warrantyStatus: freezed == warrantyStatus ? _self.warrantyStatus : warrantyStatus // ignore: cast_nullable_to_non_nullable
as String?,warrantyExpiration: freezed == warrantyExpiration ? _self.warrantyExpiration : warrantyExpiration // ignore: cast_nullable_to_non_nullable
as DateTime?,includedAccessories: freezed == includedAccessories ? _self.includedAccessories : includedAccessories // ignore: cast_nullable_to_non_nullable
as String?,shipsFromLocation: freezed == shipsFromLocation ? _self.shipsFromLocation : shipsFromLocation // ignore: cast_nullable_to_non_nullable
as String?,cpuModel: freezed == cpuModel ? _self.cpuModel : cpuModel // ignore: cast_nullable_to_non_nullable
as String?,cpuCores: freezed == cpuCores ? _self.cpuCores : cpuCores // ignore: cast_nullable_to_non_nullable
as int?,cpuSpeedGhz: freezed == cpuSpeedGhz ? _self.cpuSpeedGhz : cpuSpeedGhz // ignore: cast_nullable_to_non_nullable
as double?,ramType: freezed == ramType ? _self.ramType : ramType // ignore: cast_nullable_to_non_nullable
as String?,storageType: freezed == storageType ? _self.storageType : storageType // ignore: cast_nullable_to_non_nullable
as String?,gpuModel: freezed == gpuModel ? _self.gpuModel : gpuModel // ignore: cast_nullable_to_non_nullable
as String?,screenSizeIn: freezed == screenSizeIn ? _self.screenSizeIn : screenSizeIn // ignore: cast_nullable_to_non_nullable
as double?,screenResolution: freezed == screenResolution ? _self.screenResolution : screenResolution // ignore: cast_nullable_to_non_nullable
as String?,touchscreen: freezed == touchscreen ? _self.touchscreen : touchscreen // ignore: cast_nullable_to_non_nullable
as bool?,formFactor: freezed == formFactor ? _self.formFactor : formFactor // ignore: cast_nullable_to_non_nullable
as String?,powerSupplyWatts: freezed == powerSupplyWatts ? _self.powerSupplyWatts : powerSupplyWatts // ignore: cast_nullable_to_non_nullable
as int?,panelType: freezed == panelType ? _self.panelType : panelType // ignore: cast_nullable_to_non_nullable
as String?,refreshRateHz: freezed == refreshRateHz ? _self.refreshRateHz : refreshRateHz // ignore: cast_nullable_to_non_nullable
as int?,ports: freezed == ports ? _self.ports : ports // ignore: cast_nullable_to_non_nullable
as String?,portCount: freezed == portCount ? _self.portCount : portCount // ignore: cast_nullable_to_non_nullable
as int?,throughput: freezed == throughput ? _self.throughput : throughput // ignore: cast_nullable_to_non_nullable
as String?,managed: freezed == managed ? _self.managed : managed // ignore: cast_nullable_to_non_nullable
as bool?,carrierLocked: freezed == carrierLocked ? _self.carrierLocked : carrierLocked // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}


}


/// @nodoc
mixin _$MarketplaceListing {

 String get id; String get assetId; String get companyId; String get valuationFlag; String get status;@IsoDateTimeConverter() DateTime get createdAt; double? get listedPrice; double? get sellerOfferPrice; double? get buyerAskPrice; double? get grossMargin; double? get consumerMarketAnchor; double? get fairMarketValue; double? get estBookValue; double? get sellerRecoveryRatio; double? get depreciationPct; int? get ageMonths;@NullableIsoDateTimeConverter() DateTime? get lastValuedAt; String? get modelName; String? get assetType; String? get conditionGrade; int? get quantity; double? get cpuScore; double? get ramGb; double? get storageGb;// Listing-owned media (array of image URLs)
 List<String>? get productImages;// Joined device-spec fields (from the asset row) for the PLP/PDP
 String? get manufacturer; String? get modelNumber; int? get yearOfManufacture; String? get functionalStatus; String? get knownDefects; String? get dataWipeStatus; String? get warrantyStatus;@NullableIsoDateTimeConverter() DateTime? get warrantyExpiration; String? get includedAccessories; String? get shipsFromLocation; String? get cpuModel; int? get cpuCores; double? get cpuSpeedGhz; String? get ramType; String? get storageType; String? get gpuModel; double? get screenSizeIn; String? get screenResolution; bool? get touchscreen; String? get formFactor; int? get powerSupplyWatts; String? get panelType; int? get refreshRateHz; String? get ports; int? get portCount; String? get throughput; bool? get managed; bool? get carrierLocked; String? get sellerName; String? get sellerIndustry; String? get sellerSizeBand;
/// Create a copy of MarketplaceListing
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MarketplaceListingCopyWith<MarketplaceListing> get copyWith => _$MarketplaceListingCopyWithImpl<MarketplaceListing>(this as MarketplaceListing, _$identity);

  /// Serializes this MarketplaceListing to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MarketplaceListing&&(identical(other.id, id) || other.id == id)&&(identical(other.assetId, assetId) || other.assetId == assetId)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.valuationFlag, valuationFlag) || other.valuationFlag == valuationFlag)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.listedPrice, listedPrice) || other.listedPrice == listedPrice)&&(identical(other.sellerOfferPrice, sellerOfferPrice) || other.sellerOfferPrice == sellerOfferPrice)&&(identical(other.buyerAskPrice, buyerAskPrice) || other.buyerAskPrice == buyerAskPrice)&&(identical(other.grossMargin, grossMargin) || other.grossMargin == grossMargin)&&(identical(other.consumerMarketAnchor, consumerMarketAnchor) || other.consumerMarketAnchor == consumerMarketAnchor)&&(identical(other.fairMarketValue, fairMarketValue) || other.fairMarketValue == fairMarketValue)&&(identical(other.estBookValue, estBookValue) || other.estBookValue == estBookValue)&&(identical(other.sellerRecoveryRatio, sellerRecoveryRatio) || other.sellerRecoveryRatio == sellerRecoveryRatio)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.ageMonths, ageMonths) || other.ageMonths == ageMonths)&&(identical(other.lastValuedAt, lastValuedAt) || other.lastValuedAt == lastValuedAt)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb)&&const DeepCollectionEquality().equals(other.productImages, productImages)&&(identical(other.manufacturer, manufacturer) || other.manufacturer == manufacturer)&&(identical(other.modelNumber, modelNumber) || other.modelNumber == modelNumber)&&(identical(other.yearOfManufacture, yearOfManufacture) || other.yearOfManufacture == yearOfManufacture)&&(identical(other.functionalStatus, functionalStatus) || other.functionalStatus == functionalStatus)&&(identical(other.knownDefects, knownDefects) || other.knownDefects == knownDefects)&&(identical(other.dataWipeStatus, dataWipeStatus) || other.dataWipeStatus == dataWipeStatus)&&(identical(other.warrantyStatus, warrantyStatus) || other.warrantyStatus == warrantyStatus)&&(identical(other.warrantyExpiration, warrantyExpiration) || other.warrantyExpiration == warrantyExpiration)&&(identical(other.includedAccessories, includedAccessories) || other.includedAccessories == includedAccessories)&&(identical(other.shipsFromLocation, shipsFromLocation) || other.shipsFromLocation == shipsFromLocation)&&(identical(other.cpuModel, cpuModel) || other.cpuModel == cpuModel)&&(identical(other.cpuCores, cpuCores) || other.cpuCores == cpuCores)&&(identical(other.cpuSpeedGhz, cpuSpeedGhz) || other.cpuSpeedGhz == cpuSpeedGhz)&&(identical(other.ramType, ramType) || other.ramType == ramType)&&(identical(other.storageType, storageType) || other.storageType == storageType)&&(identical(other.gpuModel, gpuModel) || other.gpuModel == gpuModel)&&(identical(other.screenSizeIn, screenSizeIn) || other.screenSizeIn == screenSizeIn)&&(identical(other.screenResolution, screenResolution) || other.screenResolution == screenResolution)&&(identical(other.touchscreen, touchscreen) || other.touchscreen == touchscreen)&&(identical(other.formFactor, formFactor) || other.formFactor == formFactor)&&(identical(other.powerSupplyWatts, powerSupplyWatts) || other.powerSupplyWatts == powerSupplyWatts)&&(identical(other.panelType, panelType) || other.panelType == panelType)&&(identical(other.refreshRateHz, refreshRateHz) || other.refreshRateHz == refreshRateHz)&&(identical(other.ports, ports) || other.ports == ports)&&(identical(other.portCount, portCount) || other.portCount == portCount)&&(identical(other.throughput, throughput) || other.throughput == throughput)&&(identical(other.managed, managed) || other.managed == managed)&&(identical(other.carrierLocked, carrierLocked) || other.carrierLocked == carrierLocked)&&(identical(other.sellerName, sellerName) || other.sellerName == sellerName)&&(identical(other.sellerIndustry, sellerIndustry) || other.sellerIndustry == sellerIndustry)&&(identical(other.sellerSizeBand, sellerSizeBand) || other.sellerSizeBand == sellerSizeBand));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,assetId,companyId,valuationFlag,status,createdAt,listedPrice,sellerOfferPrice,buyerAskPrice,grossMargin,consumerMarketAnchor,fairMarketValue,estBookValue,sellerRecoveryRatio,depreciationPct,ageMonths,lastValuedAt,modelName,assetType,conditionGrade,quantity,cpuScore,ramGb,storageGb,const DeepCollectionEquality().hash(productImages),manufacturer,modelNumber,yearOfManufacture,functionalStatus,knownDefects,dataWipeStatus,warrantyStatus,warrantyExpiration,includedAccessories,shipsFromLocation,cpuModel,cpuCores,cpuSpeedGhz,ramType,storageType,gpuModel,screenSizeIn,screenResolution,touchscreen,formFactor,powerSupplyWatts,panelType,refreshRateHz,ports,portCount,throughput,managed,carrierLocked,sellerName,sellerIndustry,sellerSizeBand]);

@override
String toString() {
  return 'MarketplaceListing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, productImages: $productImages, manufacturer: $manufacturer, modelNumber: $modelNumber, yearOfManufacture: $yearOfManufacture, functionalStatus: $functionalStatus, knownDefects: $knownDefects, dataWipeStatus: $dataWipeStatus, warrantyStatus: $warrantyStatus, warrantyExpiration: $warrantyExpiration, includedAccessories: $includedAccessories, shipsFromLocation: $shipsFromLocation, cpuModel: $cpuModel, cpuCores: $cpuCores, cpuSpeedGhz: $cpuSpeedGhz, ramType: $ramType, storageType: $storageType, gpuModel: $gpuModel, screenSizeIn: $screenSizeIn, screenResolution: $screenResolution, touchscreen: $touchscreen, formFactor: $formFactor, powerSupplyWatts: $powerSupplyWatts, panelType: $panelType, refreshRateHz: $refreshRateHz, ports: $ports, portCount: $portCount, throughput: $throughput, managed: $managed, carrierLocked: $carrierLocked, sellerName: $sellerName, sellerIndustry: $sellerIndustry, sellerSizeBand: $sellerSizeBand)';
}


}

/// @nodoc
abstract mixin class $MarketplaceListingCopyWith<$Res>  {
  factory $MarketplaceListingCopyWith(MarketplaceListing value, $Res Function(MarketplaceListing) _then) = _$MarketplaceListingCopyWithImpl;
@useResult
$Res call({
 String id, String assetId, String companyId, String valuationFlag, String status,@IsoDateTimeConverter() DateTime createdAt, double? listedPrice, double? sellerOfferPrice, double? buyerAskPrice, double? grossMargin, double? consumerMarketAnchor, double? fairMarketValue, double? estBookValue, double? sellerRecoveryRatio, double? depreciationPct, int? ageMonths,@NullableIsoDateTimeConverter() DateTime? lastValuedAt, String? modelName, String? assetType, String? conditionGrade, int? quantity, double? cpuScore, double? ramGb, double? storageGb, List<String>? productImages, String? manufacturer, String? modelNumber, int? yearOfManufacture, String? functionalStatus, String? knownDefects, String? dataWipeStatus, String? warrantyStatus,@NullableIsoDateTimeConverter() DateTime? warrantyExpiration, String? includedAccessories, String? shipsFromLocation, String? cpuModel, int? cpuCores, double? cpuSpeedGhz, String? ramType, String? storageType, String? gpuModel, double? screenSizeIn, String? screenResolution, bool? touchscreen, String? formFactor, int? powerSupplyWatts, String? panelType, int? refreshRateHz, String? ports, int? portCount, String? throughput, bool? managed, bool? carrierLocked, String? sellerName, String? sellerIndustry, String? sellerSizeBand
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
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? assetId = null,Object? companyId = null,Object? valuationFlag = null,Object? status = null,Object? createdAt = null,Object? listedPrice = freezed,Object? sellerOfferPrice = freezed,Object? buyerAskPrice = freezed,Object? grossMargin = freezed,Object? consumerMarketAnchor = freezed,Object? fairMarketValue = freezed,Object? estBookValue = freezed,Object? sellerRecoveryRatio = freezed,Object? depreciationPct = freezed,Object? ageMonths = freezed,Object? lastValuedAt = freezed,Object? modelName = freezed,Object? assetType = freezed,Object? conditionGrade = freezed,Object? quantity = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,Object? productImages = freezed,Object? manufacturer = freezed,Object? modelNumber = freezed,Object? yearOfManufacture = freezed,Object? functionalStatus = freezed,Object? knownDefects = freezed,Object? dataWipeStatus = freezed,Object? warrantyStatus = freezed,Object? warrantyExpiration = freezed,Object? includedAccessories = freezed,Object? shipsFromLocation = freezed,Object? cpuModel = freezed,Object? cpuCores = freezed,Object? cpuSpeedGhz = freezed,Object? ramType = freezed,Object? storageType = freezed,Object? gpuModel = freezed,Object? screenSizeIn = freezed,Object? screenResolution = freezed,Object? touchscreen = freezed,Object? formFactor = freezed,Object? powerSupplyWatts = freezed,Object? panelType = freezed,Object? refreshRateHz = freezed,Object? ports = freezed,Object? portCount = freezed,Object? throughput = freezed,Object? managed = freezed,Object? carrierLocked = freezed,Object? sellerName = freezed,Object? sellerIndustry = freezed,Object? sellerSizeBand = freezed,}) {
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
as double?,productImages: freezed == productImages ? _self.productImages : productImages // ignore: cast_nullable_to_non_nullable
as List<String>?,manufacturer: freezed == manufacturer ? _self.manufacturer : manufacturer // ignore: cast_nullable_to_non_nullable
as String?,modelNumber: freezed == modelNumber ? _self.modelNumber : modelNumber // ignore: cast_nullable_to_non_nullable
as String?,yearOfManufacture: freezed == yearOfManufacture ? _self.yearOfManufacture : yearOfManufacture // ignore: cast_nullable_to_non_nullable
as int?,functionalStatus: freezed == functionalStatus ? _self.functionalStatus : functionalStatus // ignore: cast_nullable_to_non_nullable
as String?,knownDefects: freezed == knownDefects ? _self.knownDefects : knownDefects // ignore: cast_nullable_to_non_nullable
as String?,dataWipeStatus: freezed == dataWipeStatus ? _self.dataWipeStatus : dataWipeStatus // ignore: cast_nullable_to_non_nullable
as String?,warrantyStatus: freezed == warrantyStatus ? _self.warrantyStatus : warrantyStatus // ignore: cast_nullable_to_non_nullable
as String?,warrantyExpiration: freezed == warrantyExpiration ? _self.warrantyExpiration : warrantyExpiration // ignore: cast_nullable_to_non_nullable
as DateTime?,includedAccessories: freezed == includedAccessories ? _self.includedAccessories : includedAccessories // ignore: cast_nullable_to_non_nullable
as String?,shipsFromLocation: freezed == shipsFromLocation ? _self.shipsFromLocation : shipsFromLocation // ignore: cast_nullable_to_non_nullable
as String?,cpuModel: freezed == cpuModel ? _self.cpuModel : cpuModel // ignore: cast_nullable_to_non_nullable
as String?,cpuCores: freezed == cpuCores ? _self.cpuCores : cpuCores // ignore: cast_nullable_to_non_nullable
as int?,cpuSpeedGhz: freezed == cpuSpeedGhz ? _self.cpuSpeedGhz : cpuSpeedGhz // ignore: cast_nullable_to_non_nullable
as double?,ramType: freezed == ramType ? _self.ramType : ramType // ignore: cast_nullable_to_non_nullable
as String?,storageType: freezed == storageType ? _self.storageType : storageType // ignore: cast_nullable_to_non_nullable
as String?,gpuModel: freezed == gpuModel ? _self.gpuModel : gpuModel // ignore: cast_nullable_to_non_nullable
as String?,screenSizeIn: freezed == screenSizeIn ? _self.screenSizeIn : screenSizeIn // ignore: cast_nullable_to_non_nullable
as double?,screenResolution: freezed == screenResolution ? _self.screenResolution : screenResolution // ignore: cast_nullable_to_non_nullable
as String?,touchscreen: freezed == touchscreen ? _self.touchscreen : touchscreen // ignore: cast_nullable_to_non_nullable
as bool?,formFactor: freezed == formFactor ? _self.formFactor : formFactor // ignore: cast_nullable_to_non_nullable
as String?,powerSupplyWatts: freezed == powerSupplyWatts ? _self.powerSupplyWatts : powerSupplyWatts // ignore: cast_nullable_to_non_nullable
as int?,panelType: freezed == panelType ? _self.panelType : panelType // ignore: cast_nullable_to_non_nullable
as String?,refreshRateHz: freezed == refreshRateHz ? _self.refreshRateHz : refreshRateHz // ignore: cast_nullable_to_non_nullable
as int?,ports: freezed == ports ? _self.ports : ports // ignore: cast_nullable_to_non_nullable
as String?,portCount: freezed == portCount ? _self.portCount : portCount // ignore: cast_nullable_to_non_nullable
as int?,throughput: freezed == throughput ? _self.throughput : throughput // ignore: cast_nullable_to_non_nullable
as String?,managed: freezed == managed ? _self.managed : managed // ignore: cast_nullable_to_non_nullable
as bool?,carrierLocked: freezed == carrierLocked ? _self.carrierLocked : carrierLocked // ignore: cast_nullable_to_non_nullable
as bool?,sellerName: freezed == sellerName ? _self.sellerName : sellerName // ignore: cast_nullable_to_non_nullable
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  List<String>? productImages,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked,  String? sellerName,  String? sellerIndustry,  String? sellerSizeBand)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MarketplaceListing() when $default != null:
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.productImages,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked,_that.sellerName,_that.sellerIndustry,_that.sellerSizeBand);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  List<String>? productImages,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked,  String? sellerName,  String? sellerIndustry,  String? sellerSizeBand)  $default,) {final _that = this;
switch (_that) {
case _MarketplaceListing():
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.productImages,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked,_that.sellerName,_that.sellerIndustry,_that.sellerSizeBand);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String assetId,  String companyId,  String valuationFlag,  String status, @IsoDateTimeConverter()  DateTime createdAt,  double? listedPrice,  double? sellerOfferPrice,  double? buyerAskPrice,  double? grossMargin,  double? consumerMarketAnchor,  double? fairMarketValue,  double? estBookValue,  double? sellerRecoveryRatio,  double? depreciationPct,  int? ageMonths, @NullableIsoDateTimeConverter()  DateTime? lastValuedAt,  String? modelName,  String? assetType,  String? conditionGrade,  int? quantity,  double? cpuScore,  double? ramGb,  double? storageGb,  List<String>? productImages,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked,  String? sellerName,  String? sellerIndustry,  String? sellerSizeBand)?  $default,) {final _that = this;
switch (_that) {
case _MarketplaceListing() when $default != null:
return $default(_that.id,_that.assetId,_that.companyId,_that.valuationFlag,_that.status,_that.createdAt,_that.listedPrice,_that.sellerOfferPrice,_that.buyerAskPrice,_that.grossMargin,_that.consumerMarketAnchor,_that.fairMarketValue,_that.estBookValue,_that.sellerRecoveryRatio,_that.depreciationPct,_that.ageMonths,_that.lastValuedAt,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.cpuScore,_that.ramGb,_that.storageGb,_that.productImages,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked,_that.sellerName,_that.sellerIndustry,_that.sellerSizeBand);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MarketplaceListing extends MarketplaceListing {
  const _MarketplaceListing({required this.id, required this.assetId, required this.companyId, required this.valuationFlag, required this.status, @IsoDateTimeConverter() required this.createdAt, this.listedPrice, this.sellerOfferPrice, this.buyerAskPrice, this.grossMargin, this.consumerMarketAnchor, this.fairMarketValue, this.estBookValue, this.sellerRecoveryRatio, this.depreciationPct, this.ageMonths, @NullableIsoDateTimeConverter() this.lastValuedAt, this.modelName, this.assetType, this.conditionGrade, this.quantity, this.cpuScore, this.ramGb, this.storageGb, final  List<String>? productImages, this.manufacturer, this.modelNumber, this.yearOfManufacture, this.functionalStatus, this.knownDefects, this.dataWipeStatus, this.warrantyStatus, @NullableIsoDateTimeConverter() this.warrantyExpiration, this.includedAccessories, this.shipsFromLocation, this.cpuModel, this.cpuCores, this.cpuSpeedGhz, this.ramType, this.storageType, this.gpuModel, this.screenSizeIn, this.screenResolution, this.touchscreen, this.formFactor, this.powerSupplyWatts, this.panelType, this.refreshRateHz, this.ports, this.portCount, this.throughput, this.managed, this.carrierLocked, this.sellerName, this.sellerIndustry, this.sellerSizeBand}): _productImages = productImages,super._();
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
// Listing-owned media (array of image URLs)
 final  List<String>? _productImages;
// Listing-owned media (array of image URLs)
@override List<String>? get productImages {
  final value = _productImages;
  if (value == null) return null;
  if (_productImages is EqualUnmodifiableListView) return _productImages;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

// Joined device-spec fields (from the asset row) for the PLP/PDP
@override final  String? manufacturer;
@override final  String? modelNumber;
@override final  int? yearOfManufacture;
@override final  String? functionalStatus;
@override final  String? knownDefects;
@override final  String? dataWipeStatus;
@override final  String? warrantyStatus;
@override@NullableIsoDateTimeConverter() final  DateTime? warrantyExpiration;
@override final  String? includedAccessories;
@override final  String? shipsFromLocation;
@override final  String? cpuModel;
@override final  int? cpuCores;
@override final  double? cpuSpeedGhz;
@override final  String? ramType;
@override final  String? storageType;
@override final  String? gpuModel;
@override final  double? screenSizeIn;
@override final  String? screenResolution;
@override final  bool? touchscreen;
@override final  String? formFactor;
@override final  int? powerSupplyWatts;
@override final  String? panelType;
@override final  int? refreshRateHz;
@override final  String? ports;
@override final  int? portCount;
@override final  String? throughput;
@override final  bool? managed;
@override final  bool? carrierLocked;
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
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MarketplaceListing&&(identical(other.id, id) || other.id == id)&&(identical(other.assetId, assetId) || other.assetId == assetId)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.valuationFlag, valuationFlag) || other.valuationFlag == valuationFlag)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.listedPrice, listedPrice) || other.listedPrice == listedPrice)&&(identical(other.sellerOfferPrice, sellerOfferPrice) || other.sellerOfferPrice == sellerOfferPrice)&&(identical(other.buyerAskPrice, buyerAskPrice) || other.buyerAskPrice == buyerAskPrice)&&(identical(other.grossMargin, grossMargin) || other.grossMargin == grossMargin)&&(identical(other.consumerMarketAnchor, consumerMarketAnchor) || other.consumerMarketAnchor == consumerMarketAnchor)&&(identical(other.fairMarketValue, fairMarketValue) || other.fairMarketValue == fairMarketValue)&&(identical(other.estBookValue, estBookValue) || other.estBookValue == estBookValue)&&(identical(other.sellerRecoveryRatio, sellerRecoveryRatio) || other.sellerRecoveryRatio == sellerRecoveryRatio)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.ageMonths, ageMonths) || other.ageMonths == ageMonths)&&(identical(other.lastValuedAt, lastValuedAt) || other.lastValuedAt == lastValuedAt)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb)&&const DeepCollectionEquality().equals(other._productImages, _productImages)&&(identical(other.manufacturer, manufacturer) || other.manufacturer == manufacturer)&&(identical(other.modelNumber, modelNumber) || other.modelNumber == modelNumber)&&(identical(other.yearOfManufacture, yearOfManufacture) || other.yearOfManufacture == yearOfManufacture)&&(identical(other.functionalStatus, functionalStatus) || other.functionalStatus == functionalStatus)&&(identical(other.knownDefects, knownDefects) || other.knownDefects == knownDefects)&&(identical(other.dataWipeStatus, dataWipeStatus) || other.dataWipeStatus == dataWipeStatus)&&(identical(other.warrantyStatus, warrantyStatus) || other.warrantyStatus == warrantyStatus)&&(identical(other.warrantyExpiration, warrantyExpiration) || other.warrantyExpiration == warrantyExpiration)&&(identical(other.includedAccessories, includedAccessories) || other.includedAccessories == includedAccessories)&&(identical(other.shipsFromLocation, shipsFromLocation) || other.shipsFromLocation == shipsFromLocation)&&(identical(other.cpuModel, cpuModel) || other.cpuModel == cpuModel)&&(identical(other.cpuCores, cpuCores) || other.cpuCores == cpuCores)&&(identical(other.cpuSpeedGhz, cpuSpeedGhz) || other.cpuSpeedGhz == cpuSpeedGhz)&&(identical(other.ramType, ramType) || other.ramType == ramType)&&(identical(other.storageType, storageType) || other.storageType == storageType)&&(identical(other.gpuModel, gpuModel) || other.gpuModel == gpuModel)&&(identical(other.screenSizeIn, screenSizeIn) || other.screenSizeIn == screenSizeIn)&&(identical(other.screenResolution, screenResolution) || other.screenResolution == screenResolution)&&(identical(other.touchscreen, touchscreen) || other.touchscreen == touchscreen)&&(identical(other.formFactor, formFactor) || other.formFactor == formFactor)&&(identical(other.powerSupplyWatts, powerSupplyWatts) || other.powerSupplyWatts == powerSupplyWatts)&&(identical(other.panelType, panelType) || other.panelType == panelType)&&(identical(other.refreshRateHz, refreshRateHz) || other.refreshRateHz == refreshRateHz)&&(identical(other.ports, ports) || other.ports == ports)&&(identical(other.portCount, portCount) || other.portCount == portCount)&&(identical(other.throughput, throughput) || other.throughput == throughput)&&(identical(other.managed, managed) || other.managed == managed)&&(identical(other.carrierLocked, carrierLocked) || other.carrierLocked == carrierLocked)&&(identical(other.sellerName, sellerName) || other.sellerName == sellerName)&&(identical(other.sellerIndustry, sellerIndustry) || other.sellerIndustry == sellerIndustry)&&(identical(other.sellerSizeBand, sellerSizeBand) || other.sellerSizeBand == sellerSizeBand));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,assetId,companyId,valuationFlag,status,createdAt,listedPrice,sellerOfferPrice,buyerAskPrice,grossMargin,consumerMarketAnchor,fairMarketValue,estBookValue,sellerRecoveryRatio,depreciationPct,ageMonths,lastValuedAt,modelName,assetType,conditionGrade,quantity,cpuScore,ramGb,storageGb,const DeepCollectionEquality().hash(_productImages),manufacturer,modelNumber,yearOfManufacture,functionalStatus,knownDefects,dataWipeStatus,warrantyStatus,warrantyExpiration,includedAccessories,shipsFromLocation,cpuModel,cpuCores,cpuSpeedGhz,ramType,storageType,gpuModel,screenSizeIn,screenResolution,touchscreen,formFactor,powerSupplyWatts,panelType,refreshRateHz,ports,portCount,throughput,managed,carrierLocked,sellerName,sellerIndustry,sellerSizeBand]);

@override
String toString() {
  return 'MarketplaceListing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, productImages: $productImages, manufacturer: $manufacturer, modelNumber: $modelNumber, yearOfManufacture: $yearOfManufacture, functionalStatus: $functionalStatus, knownDefects: $knownDefects, dataWipeStatus: $dataWipeStatus, warrantyStatus: $warrantyStatus, warrantyExpiration: $warrantyExpiration, includedAccessories: $includedAccessories, shipsFromLocation: $shipsFromLocation, cpuModel: $cpuModel, cpuCores: $cpuCores, cpuSpeedGhz: $cpuSpeedGhz, ramType: $ramType, storageType: $storageType, gpuModel: $gpuModel, screenSizeIn: $screenSizeIn, screenResolution: $screenResolution, touchscreen: $touchscreen, formFactor: $formFactor, powerSupplyWatts: $powerSupplyWatts, panelType: $panelType, refreshRateHz: $refreshRateHz, ports: $ports, portCount: $portCount, throughput: $throughput, managed: $managed, carrierLocked: $carrierLocked, sellerName: $sellerName, sellerIndustry: $sellerIndustry, sellerSizeBand: $sellerSizeBand)';
}


}

/// @nodoc
abstract mixin class _$MarketplaceListingCopyWith<$Res> implements $MarketplaceListingCopyWith<$Res> {
  factory _$MarketplaceListingCopyWith(_MarketplaceListing value, $Res Function(_MarketplaceListing) _then) = __$MarketplaceListingCopyWithImpl;
@override @useResult
$Res call({
 String id, String assetId, String companyId, String valuationFlag, String status,@IsoDateTimeConverter() DateTime createdAt, double? listedPrice, double? sellerOfferPrice, double? buyerAskPrice, double? grossMargin, double? consumerMarketAnchor, double? fairMarketValue, double? estBookValue, double? sellerRecoveryRatio, double? depreciationPct, int? ageMonths,@NullableIsoDateTimeConverter() DateTime? lastValuedAt, String? modelName, String? assetType, String? conditionGrade, int? quantity, double? cpuScore, double? ramGb, double? storageGb, List<String>? productImages, String? manufacturer, String? modelNumber, int? yearOfManufacture, String? functionalStatus, String? knownDefects, String? dataWipeStatus, String? warrantyStatus,@NullableIsoDateTimeConverter() DateTime? warrantyExpiration, String? includedAccessories, String? shipsFromLocation, String? cpuModel, int? cpuCores, double? cpuSpeedGhz, String? ramType, String? storageType, String? gpuModel, double? screenSizeIn, String? screenResolution, bool? touchscreen, String? formFactor, int? powerSupplyWatts, String? panelType, int? refreshRateHz, String? ports, int? portCount, String? throughput, bool? managed, bool? carrierLocked, String? sellerName, String? sellerIndustry, String? sellerSizeBand
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
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? assetId = null,Object? companyId = null,Object? valuationFlag = null,Object? status = null,Object? createdAt = null,Object? listedPrice = freezed,Object? sellerOfferPrice = freezed,Object? buyerAskPrice = freezed,Object? grossMargin = freezed,Object? consumerMarketAnchor = freezed,Object? fairMarketValue = freezed,Object? estBookValue = freezed,Object? sellerRecoveryRatio = freezed,Object? depreciationPct = freezed,Object? ageMonths = freezed,Object? lastValuedAt = freezed,Object? modelName = freezed,Object? assetType = freezed,Object? conditionGrade = freezed,Object? quantity = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,Object? productImages = freezed,Object? manufacturer = freezed,Object? modelNumber = freezed,Object? yearOfManufacture = freezed,Object? functionalStatus = freezed,Object? knownDefects = freezed,Object? dataWipeStatus = freezed,Object? warrantyStatus = freezed,Object? warrantyExpiration = freezed,Object? includedAccessories = freezed,Object? shipsFromLocation = freezed,Object? cpuModel = freezed,Object? cpuCores = freezed,Object? cpuSpeedGhz = freezed,Object? ramType = freezed,Object? storageType = freezed,Object? gpuModel = freezed,Object? screenSizeIn = freezed,Object? screenResolution = freezed,Object? touchscreen = freezed,Object? formFactor = freezed,Object? powerSupplyWatts = freezed,Object? panelType = freezed,Object? refreshRateHz = freezed,Object? ports = freezed,Object? portCount = freezed,Object? throughput = freezed,Object? managed = freezed,Object? carrierLocked = freezed,Object? sellerName = freezed,Object? sellerIndustry = freezed,Object? sellerSizeBand = freezed,}) {
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
as double?,productImages: freezed == productImages ? _self._productImages : productImages // ignore: cast_nullable_to_non_nullable
as List<String>?,manufacturer: freezed == manufacturer ? _self.manufacturer : manufacturer // ignore: cast_nullable_to_non_nullable
as String?,modelNumber: freezed == modelNumber ? _self.modelNumber : modelNumber // ignore: cast_nullable_to_non_nullable
as String?,yearOfManufacture: freezed == yearOfManufacture ? _self.yearOfManufacture : yearOfManufacture // ignore: cast_nullable_to_non_nullable
as int?,functionalStatus: freezed == functionalStatus ? _self.functionalStatus : functionalStatus // ignore: cast_nullable_to_non_nullable
as String?,knownDefects: freezed == knownDefects ? _self.knownDefects : knownDefects // ignore: cast_nullable_to_non_nullable
as String?,dataWipeStatus: freezed == dataWipeStatus ? _self.dataWipeStatus : dataWipeStatus // ignore: cast_nullable_to_non_nullable
as String?,warrantyStatus: freezed == warrantyStatus ? _self.warrantyStatus : warrantyStatus // ignore: cast_nullable_to_non_nullable
as String?,warrantyExpiration: freezed == warrantyExpiration ? _self.warrantyExpiration : warrantyExpiration // ignore: cast_nullable_to_non_nullable
as DateTime?,includedAccessories: freezed == includedAccessories ? _self.includedAccessories : includedAccessories // ignore: cast_nullable_to_non_nullable
as String?,shipsFromLocation: freezed == shipsFromLocation ? _self.shipsFromLocation : shipsFromLocation // ignore: cast_nullable_to_non_nullable
as String?,cpuModel: freezed == cpuModel ? _self.cpuModel : cpuModel // ignore: cast_nullable_to_non_nullable
as String?,cpuCores: freezed == cpuCores ? _self.cpuCores : cpuCores // ignore: cast_nullable_to_non_nullable
as int?,cpuSpeedGhz: freezed == cpuSpeedGhz ? _self.cpuSpeedGhz : cpuSpeedGhz // ignore: cast_nullable_to_non_nullable
as double?,ramType: freezed == ramType ? _self.ramType : ramType // ignore: cast_nullable_to_non_nullable
as String?,storageType: freezed == storageType ? _self.storageType : storageType // ignore: cast_nullable_to_non_nullable
as String?,gpuModel: freezed == gpuModel ? _self.gpuModel : gpuModel // ignore: cast_nullable_to_non_nullable
as String?,screenSizeIn: freezed == screenSizeIn ? _self.screenSizeIn : screenSizeIn // ignore: cast_nullable_to_non_nullable
as double?,screenResolution: freezed == screenResolution ? _self.screenResolution : screenResolution // ignore: cast_nullable_to_non_nullable
as String?,touchscreen: freezed == touchscreen ? _self.touchscreen : touchscreen // ignore: cast_nullable_to_non_nullable
as bool?,formFactor: freezed == formFactor ? _self.formFactor : formFactor // ignore: cast_nullable_to_non_nullable
as String?,powerSupplyWatts: freezed == powerSupplyWatts ? _self.powerSupplyWatts : powerSupplyWatts // ignore: cast_nullable_to_non_nullable
as int?,panelType: freezed == panelType ? _self.panelType : panelType // ignore: cast_nullable_to_non_nullable
as String?,refreshRateHz: freezed == refreshRateHz ? _self.refreshRateHz : refreshRateHz // ignore: cast_nullable_to_non_nullable
as int?,ports: freezed == ports ? _self.ports : ports // ignore: cast_nullable_to_non_nullable
as String?,portCount: freezed == portCount ? _self.portCount : portCount // ignore: cast_nullable_to_non_nullable
as int?,throughput: freezed == throughput ? _self.throughput : throughput // ignore: cast_nullable_to_non_nullable
as String?,managed: freezed == managed ? _self.managed : managed // ignore: cast_nullable_to_non_nullable
as bool?,carrierLocked: freezed == carrierLocked ? _self.carrierLocked : carrierLocked // ignore: cast_nullable_to_non_nullable
as bool?,sellerName: freezed == sellerName ? _self.sellerName : sellerName // ignore: cast_nullable_to_non_nullable
as String?,sellerIndustry: freezed == sellerIndustry ? _self.sellerIndustry : sellerIndustry // ignore: cast_nullable_to_non_nullable
as String?,sellerSizeBand: freezed == sellerSizeBand ? _self.sellerSizeBand : sellerSizeBand // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
