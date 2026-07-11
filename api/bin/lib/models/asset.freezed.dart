// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'asset.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Asset {

 String get id; String get companyId; String get mdmSource; String get modelName; String get assetType; String get conditionGrade; int get quantity;@IsoDateTimeConverter() DateTime get createdAt;@IsoDateTimeConverter() DateTime get updatedAt; String? get serialNumber; String? get reasonForOffload;@NullableDateOnlyConverter() DateTime? get purchaseDate; double? get originalPurchasePrice; String? get osVersion; double? get batteryHealthPct; int? get batteryCycles; String? get complianceState; String? get assignedUser; String? get department; String? get costCenter;@NullableIsoDateTimeConverter() DateTime? get lastMdmSync; double? get cpuScore; double? get ramGb; double? get storageGb;// ── Marketplace device-spec fields (buyer-facing listing detail) ────────
 String? get manufacturer; String? get modelNumber; int? get yearOfManufacture; String? get functionalStatus; String? get knownDefects; String? get dataWipeStatus; String? get warrantyStatus;@NullableIsoDateTimeConverter() DateTime? get warrantyExpiration; String? get includedAccessories; String? get shipsFromLocation; String? get cpuModel; int? get cpuCores; double? get cpuSpeedGhz; String? get ramType; String? get storageType; String? get gpuModel; double? get screenSizeIn; String? get screenResolution; bool? get touchscreen; String? get formFactor; int? get powerSupplyWatts; String? get panelType; int? get refreshRateHz; String? get ports; int? get portCount; String? get throughput; bool? get managed; bool? get carrierLocked;
/// Create a copy of Asset
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AssetCopyWith<Asset> get copyWith => _$AssetCopyWithImpl<Asset>(this as Asset, _$identity);

  /// Serializes this Asset to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Asset&&(identical(other.id, id) || other.id == id)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.mdmSource, mdmSource) || other.mdmSource == mdmSource)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.serialNumber, serialNumber) || other.serialNumber == serialNumber)&&(identical(other.reasonForOffload, reasonForOffload) || other.reasonForOffload == reasonForOffload)&&(identical(other.purchaseDate, purchaseDate) || other.purchaseDate == purchaseDate)&&(identical(other.originalPurchasePrice, originalPurchasePrice) || other.originalPurchasePrice == originalPurchasePrice)&&(identical(other.osVersion, osVersion) || other.osVersion == osVersion)&&(identical(other.batteryHealthPct, batteryHealthPct) || other.batteryHealthPct == batteryHealthPct)&&(identical(other.batteryCycles, batteryCycles) || other.batteryCycles == batteryCycles)&&(identical(other.complianceState, complianceState) || other.complianceState == complianceState)&&(identical(other.assignedUser, assignedUser) || other.assignedUser == assignedUser)&&(identical(other.department, department) || other.department == department)&&(identical(other.costCenter, costCenter) || other.costCenter == costCenter)&&(identical(other.lastMdmSync, lastMdmSync) || other.lastMdmSync == lastMdmSync)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb)&&(identical(other.manufacturer, manufacturer) || other.manufacturer == manufacturer)&&(identical(other.modelNumber, modelNumber) || other.modelNumber == modelNumber)&&(identical(other.yearOfManufacture, yearOfManufacture) || other.yearOfManufacture == yearOfManufacture)&&(identical(other.functionalStatus, functionalStatus) || other.functionalStatus == functionalStatus)&&(identical(other.knownDefects, knownDefects) || other.knownDefects == knownDefects)&&(identical(other.dataWipeStatus, dataWipeStatus) || other.dataWipeStatus == dataWipeStatus)&&(identical(other.warrantyStatus, warrantyStatus) || other.warrantyStatus == warrantyStatus)&&(identical(other.warrantyExpiration, warrantyExpiration) || other.warrantyExpiration == warrantyExpiration)&&(identical(other.includedAccessories, includedAccessories) || other.includedAccessories == includedAccessories)&&(identical(other.shipsFromLocation, shipsFromLocation) || other.shipsFromLocation == shipsFromLocation)&&(identical(other.cpuModel, cpuModel) || other.cpuModel == cpuModel)&&(identical(other.cpuCores, cpuCores) || other.cpuCores == cpuCores)&&(identical(other.cpuSpeedGhz, cpuSpeedGhz) || other.cpuSpeedGhz == cpuSpeedGhz)&&(identical(other.ramType, ramType) || other.ramType == ramType)&&(identical(other.storageType, storageType) || other.storageType == storageType)&&(identical(other.gpuModel, gpuModel) || other.gpuModel == gpuModel)&&(identical(other.screenSizeIn, screenSizeIn) || other.screenSizeIn == screenSizeIn)&&(identical(other.screenResolution, screenResolution) || other.screenResolution == screenResolution)&&(identical(other.touchscreen, touchscreen) || other.touchscreen == touchscreen)&&(identical(other.formFactor, formFactor) || other.formFactor == formFactor)&&(identical(other.powerSupplyWatts, powerSupplyWatts) || other.powerSupplyWatts == powerSupplyWatts)&&(identical(other.panelType, panelType) || other.panelType == panelType)&&(identical(other.refreshRateHz, refreshRateHz) || other.refreshRateHz == refreshRateHz)&&(identical(other.ports, ports) || other.ports == ports)&&(identical(other.portCount, portCount) || other.portCount == portCount)&&(identical(other.throughput, throughput) || other.throughput == throughput)&&(identical(other.managed, managed) || other.managed == managed)&&(identical(other.carrierLocked, carrierLocked) || other.carrierLocked == carrierLocked));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,companyId,mdmSource,modelName,assetType,conditionGrade,quantity,createdAt,updatedAt,serialNumber,reasonForOffload,purchaseDate,originalPurchasePrice,osVersion,batteryHealthPct,batteryCycles,complianceState,assignedUser,department,costCenter,lastMdmSync,cpuScore,ramGb,storageGb,manufacturer,modelNumber,yearOfManufacture,functionalStatus,knownDefects,dataWipeStatus,warrantyStatus,warrantyExpiration,includedAccessories,shipsFromLocation,cpuModel,cpuCores,cpuSpeedGhz,ramType,storageType,gpuModel,screenSizeIn,screenResolution,touchscreen,formFactor,powerSupplyWatts,panelType,refreshRateHz,ports,portCount,throughput,managed,carrierLocked]);

@override
String toString() {
  return 'Asset(id: $id, companyId: $companyId, mdmSource: $mdmSource, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, createdAt: $createdAt, updatedAt: $updatedAt, serialNumber: $serialNumber, reasonForOffload: $reasonForOffload, purchaseDate: $purchaseDate, originalPurchasePrice: $originalPurchasePrice, osVersion: $osVersion, batteryHealthPct: $batteryHealthPct, batteryCycles: $batteryCycles, complianceState: $complianceState, assignedUser: $assignedUser, department: $department, costCenter: $costCenter, lastMdmSync: $lastMdmSync, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, manufacturer: $manufacturer, modelNumber: $modelNumber, yearOfManufacture: $yearOfManufacture, functionalStatus: $functionalStatus, knownDefects: $knownDefects, dataWipeStatus: $dataWipeStatus, warrantyStatus: $warrantyStatus, warrantyExpiration: $warrantyExpiration, includedAccessories: $includedAccessories, shipsFromLocation: $shipsFromLocation, cpuModel: $cpuModel, cpuCores: $cpuCores, cpuSpeedGhz: $cpuSpeedGhz, ramType: $ramType, storageType: $storageType, gpuModel: $gpuModel, screenSizeIn: $screenSizeIn, screenResolution: $screenResolution, touchscreen: $touchscreen, formFactor: $formFactor, powerSupplyWatts: $powerSupplyWatts, panelType: $panelType, refreshRateHz: $refreshRateHz, ports: $ports, portCount: $portCount, throughput: $throughput, managed: $managed, carrierLocked: $carrierLocked)';
}


}

/// @nodoc
abstract mixin class $AssetCopyWith<$Res>  {
  factory $AssetCopyWith(Asset value, $Res Function(Asset) _then) = _$AssetCopyWithImpl;
@useResult
$Res call({
 String id, String companyId, String mdmSource, String modelName, String assetType, String conditionGrade, int quantity,@IsoDateTimeConverter() DateTime createdAt,@IsoDateTimeConverter() DateTime updatedAt, String? serialNumber, String? reasonForOffload,@NullableDateOnlyConverter() DateTime? purchaseDate, double? originalPurchasePrice, String? osVersion, double? batteryHealthPct, int? batteryCycles, String? complianceState, String? assignedUser, String? department, String? costCenter,@NullableIsoDateTimeConverter() DateTime? lastMdmSync, double? cpuScore, double? ramGb, double? storageGb, String? manufacturer, String? modelNumber, int? yearOfManufacture, String? functionalStatus, String? knownDefects, String? dataWipeStatus, String? warrantyStatus,@NullableIsoDateTimeConverter() DateTime? warrantyExpiration, String? includedAccessories, String? shipsFromLocation, String? cpuModel, int? cpuCores, double? cpuSpeedGhz, String? ramType, String? storageType, String? gpuModel, double? screenSizeIn, String? screenResolution, bool? touchscreen, String? formFactor, int? powerSupplyWatts, String? panelType, int? refreshRateHz, String? ports, int? portCount, String? throughput, bool? managed, bool? carrierLocked
});




}
/// @nodoc
class _$AssetCopyWithImpl<$Res>
    implements $AssetCopyWith<$Res> {
  _$AssetCopyWithImpl(this._self, this._then);

  final Asset _self;
  final $Res Function(Asset) _then;

/// Create a copy of Asset
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? companyId = null,Object? mdmSource = null,Object? modelName = null,Object? assetType = null,Object? conditionGrade = null,Object? quantity = null,Object? createdAt = null,Object? updatedAt = null,Object? serialNumber = freezed,Object? reasonForOffload = freezed,Object? purchaseDate = freezed,Object? originalPurchasePrice = freezed,Object? osVersion = freezed,Object? batteryHealthPct = freezed,Object? batteryCycles = freezed,Object? complianceState = freezed,Object? assignedUser = freezed,Object? department = freezed,Object? costCenter = freezed,Object? lastMdmSync = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,Object? manufacturer = freezed,Object? modelNumber = freezed,Object? yearOfManufacture = freezed,Object? functionalStatus = freezed,Object? knownDefects = freezed,Object? dataWipeStatus = freezed,Object? warrantyStatus = freezed,Object? warrantyExpiration = freezed,Object? includedAccessories = freezed,Object? shipsFromLocation = freezed,Object? cpuModel = freezed,Object? cpuCores = freezed,Object? cpuSpeedGhz = freezed,Object? ramType = freezed,Object? storageType = freezed,Object? gpuModel = freezed,Object? screenSizeIn = freezed,Object? screenResolution = freezed,Object? touchscreen = freezed,Object? formFactor = freezed,Object? powerSupplyWatts = freezed,Object? panelType = freezed,Object? refreshRateHz = freezed,Object? ports = freezed,Object? portCount = freezed,Object? throughput = freezed,Object? managed = freezed,Object? carrierLocked = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,companyId: null == companyId ? _self.companyId : companyId // ignore: cast_nullable_to_non_nullable
as String,mdmSource: null == mdmSource ? _self.mdmSource : mdmSource // ignore: cast_nullable_to_non_nullable
as String,modelName: null == modelName ? _self.modelName : modelName // ignore: cast_nullable_to_non_nullable
as String,assetType: null == assetType ? _self.assetType : assetType // ignore: cast_nullable_to_non_nullable
as String,conditionGrade: null == conditionGrade ? _self.conditionGrade : conditionGrade // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,serialNumber: freezed == serialNumber ? _self.serialNumber : serialNumber // ignore: cast_nullable_to_non_nullable
as String?,reasonForOffload: freezed == reasonForOffload ? _self.reasonForOffload : reasonForOffload // ignore: cast_nullable_to_non_nullable
as String?,purchaseDate: freezed == purchaseDate ? _self.purchaseDate : purchaseDate // ignore: cast_nullable_to_non_nullable
as DateTime?,originalPurchasePrice: freezed == originalPurchasePrice ? _self.originalPurchasePrice : originalPurchasePrice // ignore: cast_nullable_to_non_nullable
as double?,osVersion: freezed == osVersion ? _self.osVersion : osVersion // ignore: cast_nullable_to_non_nullable
as String?,batteryHealthPct: freezed == batteryHealthPct ? _self.batteryHealthPct : batteryHealthPct // ignore: cast_nullable_to_non_nullable
as double?,batteryCycles: freezed == batteryCycles ? _self.batteryCycles : batteryCycles // ignore: cast_nullable_to_non_nullable
as int?,complianceState: freezed == complianceState ? _self.complianceState : complianceState // ignore: cast_nullable_to_non_nullable
as String?,assignedUser: freezed == assignedUser ? _self.assignedUser : assignedUser // ignore: cast_nullable_to_non_nullable
as String?,department: freezed == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as String?,costCenter: freezed == costCenter ? _self.costCenter : costCenter // ignore: cast_nullable_to_non_nullable
as String?,lastMdmSync: freezed == lastMdmSync ? _self.lastMdmSync : lastMdmSync // ignore: cast_nullable_to_non_nullable
as DateTime?,cpuScore: freezed == cpuScore ? _self.cpuScore : cpuScore // ignore: cast_nullable_to_non_nullable
as double?,ramGb: freezed == ramGb ? _self.ramGb : ramGb // ignore: cast_nullable_to_non_nullable
as double?,storageGb: freezed == storageGb ? _self.storageGb : storageGb // ignore: cast_nullable_to_non_nullable
as double?,manufacturer: freezed == manufacturer ? _self.manufacturer : manufacturer // ignore: cast_nullable_to_non_nullable
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


/// Adds pattern-matching-related methods to [Asset].
extension AssetPatterns on Asset {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Asset value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Asset() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Asset value)  $default,){
final _that = this;
switch (_that) {
case _Asset():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Asset value)?  $default,){
final _that = this;
switch (_that) {
case _Asset() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String companyId,  String mdmSource,  String modelName,  String assetType,  String conditionGrade,  int quantity, @IsoDateTimeConverter()  DateTime createdAt, @IsoDateTimeConverter()  DateTime updatedAt,  String? serialNumber,  String? reasonForOffload, @NullableDateOnlyConverter()  DateTime? purchaseDate,  double? originalPurchasePrice,  String? osVersion,  double? batteryHealthPct,  int? batteryCycles,  String? complianceState,  String? assignedUser,  String? department,  String? costCenter, @NullableIsoDateTimeConverter()  DateTime? lastMdmSync,  double? cpuScore,  double? ramGb,  double? storageGb,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Asset() when $default != null:
return $default(_that.id,_that.companyId,_that.mdmSource,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.createdAt,_that.updatedAt,_that.serialNumber,_that.reasonForOffload,_that.purchaseDate,_that.originalPurchasePrice,_that.osVersion,_that.batteryHealthPct,_that.batteryCycles,_that.complianceState,_that.assignedUser,_that.department,_that.costCenter,_that.lastMdmSync,_that.cpuScore,_that.ramGb,_that.storageGb,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String companyId,  String mdmSource,  String modelName,  String assetType,  String conditionGrade,  int quantity, @IsoDateTimeConverter()  DateTime createdAt, @IsoDateTimeConverter()  DateTime updatedAt,  String? serialNumber,  String? reasonForOffload, @NullableDateOnlyConverter()  DateTime? purchaseDate,  double? originalPurchasePrice,  String? osVersion,  double? batteryHealthPct,  int? batteryCycles,  String? complianceState,  String? assignedUser,  String? department,  String? costCenter, @NullableIsoDateTimeConverter()  DateTime? lastMdmSync,  double? cpuScore,  double? ramGb,  double? storageGb,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked)  $default,) {final _that = this;
switch (_that) {
case _Asset():
return $default(_that.id,_that.companyId,_that.mdmSource,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.createdAt,_that.updatedAt,_that.serialNumber,_that.reasonForOffload,_that.purchaseDate,_that.originalPurchasePrice,_that.osVersion,_that.batteryHealthPct,_that.batteryCycles,_that.complianceState,_that.assignedUser,_that.department,_that.costCenter,_that.lastMdmSync,_that.cpuScore,_that.ramGb,_that.storageGb,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String companyId,  String mdmSource,  String modelName,  String assetType,  String conditionGrade,  int quantity, @IsoDateTimeConverter()  DateTime createdAt, @IsoDateTimeConverter()  DateTime updatedAt,  String? serialNumber,  String? reasonForOffload, @NullableDateOnlyConverter()  DateTime? purchaseDate,  double? originalPurchasePrice,  String? osVersion,  double? batteryHealthPct,  int? batteryCycles,  String? complianceState,  String? assignedUser,  String? department,  String? costCenter, @NullableIsoDateTimeConverter()  DateTime? lastMdmSync,  double? cpuScore,  double? ramGb,  double? storageGb,  String? manufacturer,  String? modelNumber,  int? yearOfManufacture,  String? functionalStatus,  String? knownDefects,  String? dataWipeStatus,  String? warrantyStatus, @NullableIsoDateTimeConverter()  DateTime? warrantyExpiration,  String? includedAccessories,  String? shipsFromLocation,  String? cpuModel,  int? cpuCores,  double? cpuSpeedGhz,  String? ramType,  String? storageType,  String? gpuModel,  double? screenSizeIn,  String? screenResolution,  bool? touchscreen,  String? formFactor,  int? powerSupplyWatts,  String? panelType,  int? refreshRateHz,  String? ports,  int? portCount,  String? throughput,  bool? managed,  bool? carrierLocked)?  $default,) {final _that = this;
switch (_that) {
case _Asset() when $default != null:
return $default(_that.id,_that.companyId,_that.mdmSource,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.createdAt,_that.updatedAt,_that.serialNumber,_that.reasonForOffload,_that.purchaseDate,_that.originalPurchasePrice,_that.osVersion,_that.batteryHealthPct,_that.batteryCycles,_that.complianceState,_that.assignedUser,_that.department,_that.costCenter,_that.lastMdmSync,_that.cpuScore,_that.ramGb,_that.storageGb,_that.manufacturer,_that.modelNumber,_that.yearOfManufacture,_that.functionalStatus,_that.knownDefects,_that.dataWipeStatus,_that.warrantyStatus,_that.warrantyExpiration,_that.includedAccessories,_that.shipsFromLocation,_that.cpuModel,_that.cpuCores,_that.cpuSpeedGhz,_that.ramType,_that.storageType,_that.gpuModel,_that.screenSizeIn,_that.screenResolution,_that.touchscreen,_that.formFactor,_that.powerSupplyWatts,_that.panelType,_that.refreshRateHz,_that.ports,_that.portCount,_that.throughput,_that.managed,_that.carrierLocked);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Asset extends Asset {
  const _Asset({required this.id, required this.companyId, required this.mdmSource, required this.modelName, required this.assetType, required this.conditionGrade, required this.quantity, @IsoDateTimeConverter() required this.createdAt, @IsoDateTimeConverter() required this.updatedAt, this.serialNumber, this.reasonForOffload, @NullableDateOnlyConverter() this.purchaseDate, this.originalPurchasePrice, this.osVersion, this.batteryHealthPct, this.batteryCycles, this.complianceState, this.assignedUser, this.department, this.costCenter, @NullableIsoDateTimeConverter() this.lastMdmSync, this.cpuScore, this.ramGb, this.storageGb, this.manufacturer, this.modelNumber, this.yearOfManufacture, this.functionalStatus, this.knownDefects, this.dataWipeStatus, this.warrantyStatus, @NullableIsoDateTimeConverter() this.warrantyExpiration, this.includedAccessories, this.shipsFromLocation, this.cpuModel, this.cpuCores, this.cpuSpeedGhz, this.ramType, this.storageType, this.gpuModel, this.screenSizeIn, this.screenResolution, this.touchscreen, this.formFactor, this.powerSupplyWatts, this.panelType, this.refreshRateHz, this.ports, this.portCount, this.throughput, this.managed, this.carrierLocked}): super._();
  factory _Asset.fromJson(Map<String, dynamic> json) => _$AssetFromJson(json);

@override final  String id;
@override final  String companyId;
@override final  String mdmSource;
@override final  String modelName;
@override final  String assetType;
@override final  String conditionGrade;
@override final  int quantity;
@override@IsoDateTimeConverter() final  DateTime createdAt;
@override@IsoDateTimeConverter() final  DateTime updatedAt;
@override final  String? serialNumber;
@override final  String? reasonForOffload;
@override@NullableDateOnlyConverter() final  DateTime? purchaseDate;
@override final  double? originalPurchasePrice;
@override final  String? osVersion;
@override final  double? batteryHealthPct;
@override final  int? batteryCycles;
@override final  String? complianceState;
@override final  String? assignedUser;
@override final  String? department;
@override final  String? costCenter;
@override@NullableIsoDateTimeConverter() final  DateTime? lastMdmSync;
@override final  double? cpuScore;
@override final  double? ramGb;
@override final  double? storageGb;
// ── Marketplace device-spec fields (buyer-facing listing detail) ────────
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

/// Create a copy of Asset
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AssetCopyWith<_Asset> get copyWith => __$AssetCopyWithImpl<_Asset>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AssetToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Asset&&(identical(other.id, id) || other.id == id)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.mdmSource, mdmSource) || other.mdmSource == mdmSource)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.serialNumber, serialNumber) || other.serialNumber == serialNumber)&&(identical(other.reasonForOffload, reasonForOffload) || other.reasonForOffload == reasonForOffload)&&(identical(other.purchaseDate, purchaseDate) || other.purchaseDate == purchaseDate)&&(identical(other.originalPurchasePrice, originalPurchasePrice) || other.originalPurchasePrice == originalPurchasePrice)&&(identical(other.osVersion, osVersion) || other.osVersion == osVersion)&&(identical(other.batteryHealthPct, batteryHealthPct) || other.batteryHealthPct == batteryHealthPct)&&(identical(other.batteryCycles, batteryCycles) || other.batteryCycles == batteryCycles)&&(identical(other.complianceState, complianceState) || other.complianceState == complianceState)&&(identical(other.assignedUser, assignedUser) || other.assignedUser == assignedUser)&&(identical(other.department, department) || other.department == department)&&(identical(other.costCenter, costCenter) || other.costCenter == costCenter)&&(identical(other.lastMdmSync, lastMdmSync) || other.lastMdmSync == lastMdmSync)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb)&&(identical(other.manufacturer, manufacturer) || other.manufacturer == manufacturer)&&(identical(other.modelNumber, modelNumber) || other.modelNumber == modelNumber)&&(identical(other.yearOfManufacture, yearOfManufacture) || other.yearOfManufacture == yearOfManufacture)&&(identical(other.functionalStatus, functionalStatus) || other.functionalStatus == functionalStatus)&&(identical(other.knownDefects, knownDefects) || other.knownDefects == knownDefects)&&(identical(other.dataWipeStatus, dataWipeStatus) || other.dataWipeStatus == dataWipeStatus)&&(identical(other.warrantyStatus, warrantyStatus) || other.warrantyStatus == warrantyStatus)&&(identical(other.warrantyExpiration, warrantyExpiration) || other.warrantyExpiration == warrantyExpiration)&&(identical(other.includedAccessories, includedAccessories) || other.includedAccessories == includedAccessories)&&(identical(other.shipsFromLocation, shipsFromLocation) || other.shipsFromLocation == shipsFromLocation)&&(identical(other.cpuModel, cpuModel) || other.cpuModel == cpuModel)&&(identical(other.cpuCores, cpuCores) || other.cpuCores == cpuCores)&&(identical(other.cpuSpeedGhz, cpuSpeedGhz) || other.cpuSpeedGhz == cpuSpeedGhz)&&(identical(other.ramType, ramType) || other.ramType == ramType)&&(identical(other.storageType, storageType) || other.storageType == storageType)&&(identical(other.gpuModel, gpuModel) || other.gpuModel == gpuModel)&&(identical(other.screenSizeIn, screenSizeIn) || other.screenSizeIn == screenSizeIn)&&(identical(other.screenResolution, screenResolution) || other.screenResolution == screenResolution)&&(identical(other.touchscreen, touchscreen) || other.touchscreen == touchscreen)&&(identical(other.formFactor, formFactor) || other.formFactor == formFactor)&&(identical(other.powerSupplyWatts, powerSupplyWatts) || other.powerSupplyWatts == powerSupplyWatts)&&(identical(other.panelType, panelType) || other.panelType == panelType)&&(identical(other.refreshRateHz, refreshRateHz) || other.refreshRateHz == refreshRateHz)&&(identical(other.ports, ports) || other.ports == ports)&&(identical(other.portCount, portCount) || other.portCount == portCount)&&(identical(other.throughput, throughput) || other.throughput == throughput)&&(identical(other.managed, managed) || other.managed == managed)&&(identical(other.carrierLocked, carrierLocked) || other.carrierLocked == carrierLocked));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,companyId,mdmSource,modelName,assetType,conditionGrade,quantity,createdAt,updatedAt,serialNumber,reasonForOffload,purchaseDate,originalPurchasePrice,osVersion,batteryHealthPct,batteryCycles,complianceState,assignedUser,department,costCenter,lastMdmSync,cpuScore,ramGb,storageGb,manufacturer,modelNumber,yearOfManufacture,functionalStatus,knownDefects,dataWipeStatus,warrantyStatus,warrantyExpiration,includedAccessories,shipsFromLocation,cpuModel,cpuCores,cpuSpeedGhz,ramType,storageType,gpuModel,screenSizeIn,screenResolution,touchscreen,formFactor,powerSupplyWatts,panelType,refreshRateHz,ports,portCount,throughput,managed,carrierLocked]);

@override
String toString() {
  return 'Asset(id: $id, companyId: $companyId, mdmSource: $mdmSource, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, createdAt: $createdAt, updatedAt: $updatedAt, serialNumber: $serialNumber, reasonForOffload: $reasonForOffload, purchaseDate: $purchaseDate, originalPurchasePrice: $originalPurchasePrice, osVersion: $osVersion, batteryHealthPct: $batteryHealthPct, batteryCycles: $batteryCycles, complianceState: $complianceState, assignedUser: $assignedUser, department: $department, costCenter: $costCenter, lastMdmSync: $lastMdmSync, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, manufacturer: $manufacturer, modelNumber: $modelNumber, yearOfManufacture: $yearOfManufacture, functionalStatus: $functionalStatus, knownDefects: $knownDefects, dataWipeStatus: $dataWipeStatus, warrantyStatus: $warrantyStatus, warrantyExpiration: $warrantyExpiration, includedAccessories: $includedAccessories, shipsFromLocation: $shipsFromLocation, cpuModel: $cpuModel, cpuCores: $cpuCores, cpuSpeedGhz: $cpuSpeedGhz, ramType: $ramType, storageType: $storageType, gpuModel: $gpuModel, screenSizeIn: $screenSizeIn, screenResolution: $screenResolution, touchscreen: $touchscreen, formFactor: $formFactor, powerSupplyWatts: $powerSupplyWatts, panelType: $panelType, refreshRateHz: $refreshRateHz, ports: $ports, portCount: $portCount, throughput: $throughput, managed: $managed, carrierLocked: $carrierLocked)';
}


}

/// @nodoc
abstract mixin class _$AssetCopyWith<$Res> implements $AssetCopyWith<$Res> {
  factory _$AssetCopyWith(_Asset value, $Res Function(_Asset) _then) = __$AssetCopyWithImpl;
@override @useResult
$Res call({
 String id, String companyId, String mdmSource, String modelName, String assetType, String conditionGrade, int quantity,@IsoDateTimeConverter() DateTime createdAt,@IsoDateTimeConverter() DateTime updatedAt, String? serialNumber, String? reasonForOffload,@NullableDateOnlyConverter() DateTime? purchaseDate, double? originalPurchasePrice, String? osVersion, double? batteryHealthPct, int? batteryCycles, String? complianceState, String? assignedUser, String? department, String? costCenter,@NullableIsoDateTimeConverter() DateTime? lastMdmSync, double? cpuScore, double? ramGb, double? storageGb, String? manufacturer, String? modelNumber, int? yearOfManufacture, String? functionalStatus, String? knownDefects, String? dataWipeStatus, String? warrantyStatus,@NullableIsoDateTimeConverter() DateTime? warrantyExpiration, String? includedAccessories, String? shipsFromLocation, String? cpuModel, int? cpuCores, double? cpuSpeedGhz, String? ramType, String? storageType, String? gpuModel, double? screenSizeIn, String? screenResolution, bool? touchscreen, String? formFactor, int? powerSupplyWatts, String? panelType, int? refreshRateHz, String? ports, int? portCount, String? throughput, bool? managed, bool? carrierLocked
});




}
/// @nodoc
class __$AssetCopyWithImpl<$Res>
    implements _$AssetCopyWith<$Res> {
  __$AssetCopyWithImpl(this._self, this._then);

  final _Asset _self;
  final $Res Function(_Asset) _then;

/// Create a copy of Asset
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? companyId = null,Object? mdmSource = null,Object? modelName = null,Object? assetType = null,Object? conditionGrade = null,Object? quantity = null,Object? createdAt = null,Object? updatedAt = null,Object? serialNumber = freezed,Object? reasonForOffload = freezed,Object? purchaseDate = freezed,Object? originalPurchasePrice = freezed,Object? osVersion = freezed,Object? batteryHealthPct = freezed,Object? batteryCycles = freezed,Object? complianceState = freezed,Object? assignedUser = freezed,Object? department = freezed,Object? costCenter = freezed,Object? lastMdmSync = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,Object? manufacturer = freezed,Object? modelNumber = freezed,Object? yearOfManufacture = freezed,Object? functionalStatus = freezed,Object? knownDefects = freezed,Object? dataWipeStatus = freezed,Object? warrantyStatus = freezed,Object? warrantyExpiration = freezed,Object? includedAccessories = freezed,Object? shipsFromLocation = freezed,Object? cpuModel = freezed,Object? cpuCores = freezed,Object? cpuSpeedGhz = freezed,Object? ramType = freezed,Object? storageType = freezed,Object? gpuModel = freezed,Object? screenSizeIn = freezed,Object? screenResolution = freezed,Object? touchscreen = freezed,Object? formFactor = freezed,Object? powerSupplyWatts = freezed,Object? panelType = freezed,Object? refreshRateHz = freezed,Object? ports = freezed,Object? portCount = freezed,Object? throughput = freezed,Object? managed = freezed,Object? carrierLocked = freezed,}) {
  return _then(_Asset(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,companyId: null == companyId ? _self.companyId : companyId // ignore: cast_nullable_to_non_nullable
as String,mdmSource: null == mdmSource ? _self.mdmSource : mdmSource // ignore: cast_nullable_to_non_nullable
as String,modelName: null == modelName ? _self.modelName : modelName // ignore: cast_nullable_to_non_nullable
as String,assetType: null == assetType ? _self.assetType : assetType // ignore: cast_nullable_to_non_nullable
as String,conditionGrade: null == conditionGrade ? _self.conditionGrade : conditionGrade // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,serialNumber: freezed == serialNumber ? _self.serialNumber : serialNumber // ignore: cast_nullable_to_non_nullable
as String?,reasonForOffload: freezed == reasonForOffload ? _self.reasonForOffload : reasonForOffload // ignore: cast_nullable_to_non_nullable
as String?,purchaseDate: freezed == purchaseDate ? _self.purchaseDate : purchaseDate // ignore: cast_nullable_to_non_nullable
as DateTime?,originalPurchasePrice: freezed == originalPurchasePrice ? _self.originalPurchasePrice : originalPurchasePrice // ignore: cast_nullable_to_non_nullable
as double?,osVersion: freezed == osVersion ? _self.osVersion : osVersion // ignore: cast_nullable_to_non_nullable
as String?,batteryHealthPct: freezed == batteryHealthPct ? _self.batteryHealthPct : batteryHealthPct // ignore: cast_nullable_to_non_nullable
as double?,batteryCycles: freezed == batteryCycles ? _self.batteryCycles : batteryCycles // ignore: cast_nullable_to_non_nullable
as int?,complianceState: freezed == complianceState ? _self.complianceState : complianceState // ignore: cast_nullable_to_non_nullable
as String?,assignedUser: freezed == assignedUser ? _self.assignedUser : assignedUser // ignore: cast_nullable_to_non_nullable
as String?,department: freezed == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as String?,costCenter: freezed == costCenter ? _self.costCenter : costCenter // ignore: cast_nullable_to_non_nullable
as String?,lastMdmSync: freezed == lastMdmSync ? _self.lastMdmSync : lastMdmSync // ignore: cast_nullable_to_non_nullable
as DateTime?,cpuScore: freezed == cpuScore ? _self.cpuScore : cpuScore // ignore: cast_nullable_to_non_nullable
as double?,ramGb: freezed == ramGb ? _self.ramGb : ramGb // ignore: cast_nullable_to_non_nullable
as double?,storageGb: freezed == storageGb ? _self.storageGb : storageGb // ignore: cast_nullable_to_non_nullable
as double?,manufacturer: freezed == manufacturer ? _self.manufacturer : manufacturer // ignore: cast_nullable_to_non_nullable
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

// dart format on
