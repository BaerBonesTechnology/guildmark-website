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

 String get id; String get companyId; String get mdmSource; String get modelName; String get assetType; String get conditionGrade; int get quantity;@IsoDateTimeConverter() DateTime get createdAt;@IsoDateTimeConverter() DateTime get updatedAt; String? get serialNumber; String? get reasonForOffload;@NullableDateOnlyConverter() DateTime? get purchaseDate; double? get originalPurchasePrice; String? get osVersion; double? get batteryHealthPct; int? get batteryCycles; String? get complianceState; String? get assignedUser; String? get department; String? get costCenter;@NullableIsoDateTimeConverter() DateTime? get lastMdmSync; double? get cpuScore; double? get ramGb; double? get storageGb;
/// Create a copy of Asset
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AssetCopyWith<Asset> get copyWith => _$AssetCopyWithImpl<Asset>(this as Asset, _$identity);

  /// Serializes this Asset to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Asset&&(identical(other.id, id) || other.id == id)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.mdmSource, mdmSource) || other.mdmSource == mdmSource)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.serialNumber, serialNumber) || other.serialNumber == serialNumber)&&(identical(other.reasonForOffload, reasonForOffload) || other.reasonForOffload == reasonForOffload)&&(identical(other.purchaseDate, purchaseDate) || other.purchaseDate == purchaseDate)&&(identical(other.originalPurchasePrice, originalPurchasePrice) || other.originalPurchasePrice == originalPurchasePrice)&&(identical(other.osVersion, osVersion) || other.osVersion == osVersion)&&(identical(other.batteryHealthPct, batteryHealthPct) || other.batteryHealthPct == batteryHealthPct)&&(identical(other.batteryCycles, batteryCycles) || other.batteryCycles == batteryCycles)&&(identical(other.complianceState, complianceState) || other.complianceState == complianceState)&&(identical(other.assignedUser, assignedUser) || other.assignedUser == assignedUser)&&(identical(other.department, department) || other.department == department)&&(identical(other.costCenter, costCenter) || other.costCenter == costCenter)&&(identical(other.lastMdmSync, lastMdmSync) || other.lastMdmSync == lastMdmSync)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,companyId,mdmSource,modelName,assetType,conditionGrade,quantity,createdAt,updatedAt,serialNumber,reasonForOffload,purchaseDate,originalPurchasePrice,osVersion,batteryHealthPct,batteryCycles,complianceState,assignedUser,department,costCenter,lastMdmSync,cpuScore,ramGb,storageGb]);

@override
String toString() {
  return 'Asset(id: $id, companyId: $companyId, mdmSource: $mdmSource, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, createdAt: $createdAt, updatedAt: $updatedAt, serialNumber: $serialNumber, reasonForOffload: $reasonForOffload, purchaseDate: $purchaseDate, originalPurchasePrice: $originalPurchasePrice, osVersion: $osVersion, batteryHealthPct: $batteryHealthPct, batteryCycles: $batteryCycles, complianceState: $complianceState, assignedUser: $assignedUser, department: $department, costCenter: $costCenter, lastMdmSync: $lastMdmSync, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb)';
}


}

/// @nodoc
abstract mixin class $AssetCopyWith<$Res>  {
  factory $AssetCopyWith(Asset value, $Res Function(Asset) _then) = _$AssetCopyWithImpl;
@useResult
$Res call({
 String id, String companyId, String mdmSource, String modelName, String assetType, String conditionGrade, int quantity,@IsoDateTimeConverter() DateTime createdAt,@IsoDateTimeConverter() DateTime updatedAt, String? serialNumber, String? reasonForOffload,@NullableDateOnlyConverter() DateTime? purchaseDate, double? originalPurchasePrice, String? osVersion, double? batteryHealthPct, int? batteryCycles, String? complianceState, String? assignedUser, String? department, String? costCenter,@NullableIsoDateTimeConverter() DateTime? lastMdmSync, double? cpuScore, double? ramGb, double? storageGb
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
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? companyId = null,Object? mdmSource = null,Object? modelName = null,Object? assetType = null,Object? conditionGrade = null,Object? quantity = null,Object? createdAt = null,Object? updatedAt = null,Object? serialNumber = freezed,Object? reasonForOffload = freezed,Object? purchaseDate = freezed,Object? originalPurchasePrice = freezed,Object? osVersion = freezed,Object? batteryHealthPct = freezed,Object? batteryCycles = freezed,Object? complianceState = freezed,Object? assignedUser = freezed,Object? department = freezed,Object? costCenter = freezed,Object? lastMdmSync = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,}) {
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
as double?,
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String companyId,  String mdmSource,  String modelName,  String assetType,  String conditionGrade,  int quantity, @IsoDateTimeConverter()  DateTime createdAt, @IsoDateTimeConverter()  DateTime updatedAt,  String? serialNumber,  String? reasonForOffload, @NullableDateOnlyConverter()  DateTime? purchaseDate,  double? originalPurchasePrice,  String? osVersion,  double? batteryHealthPct,  int? batteryCycles,  String? complianceState,  String? assignedUser,  String? department,  String? costCenter, @NullableIsoDateTimeConverter()  DateTime? lastMdmSync,  double? cpuScore,  double? ramGb,  double? storageGb)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Asset() when $default != null:
return $default(_that.id,_that.companyId,_that.mdmSource,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.createdAt,_that.updatedAt,_that.serialNumber,_that.reasonForOffload,_that.purchaseDate,_that.originalPurchasePrice,_that.osVersion,_that.batteryHealthPct,_that.batteryCycles,_that.complianceState,_that.assignedUser,_that.department,_that.costCenter,_that.lastMdmSync,_that.cpuScore,_that.ramGb,_that.storageGb);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String companyId,  String mdmSource,  String modelName,  String assetType,  String conditionGrade,  int quantity, @IsoDateTimeConverter()  DateTime createdAt, @IsoDateTimeConverter()  DateTime updatedAt,  String? serialNumber,  String? reasonForOffload, @NullableDateOnlyConverter()  DateTime? purchaseDate,  double? originalPurchasePrice,  String? osVersion,  double? batteryHealthPct,  int? batteryCycles,  String? complianceState,  String? assignedUser,  String? department,  String? costCenter, @NullableIsoDateTimeConverter()  DateTime? lastMdmSync,  double? cpuScore,  double? ramGb,  double? storageGb)  $default,) {final _that = this;
switch (_that) {
case _Asset():
return $default(_that.id,_that.companyId,_that.mdmSource,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.createdAt,_that.updatedAt,_that.serialNumber,_that.reasonForOffload,_that.purchaseDate,_that.originalPurchasePrice,_that.osVersion,_that.batteryHealthPct,_that.batteryCycles,_that.complianceState,_that.assignedUser,_that.department,_that.costCenter,_that.lastMdmSync,_that.cpuScore,_that.ramGb,_that.storageGb);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String companyId,  String mdmSource,  String modelName,  String assetType,  String conditionGrade,  int quantity, @IsoDateTimeConverter()  DateTime createdAt, @IsoDateTimeConverter()  DateTime updatedAt,  String? serialNumber,  String? reasonForOffload, @NullableDateOnlyConverter()  DateTime? purchaseDate,  double? originalPurchasePrice,  String? osVersion,  double? batteryHealthPct,  int? batteryCycles,  String? complianceState,  String? assignedUser,  String? department,  String? costCenter, @NullableIsoDateTimeConverter()  DateTime? lastMdmSync,  double? cpuScore,  double? ramGb,  double? storageGb)?  $default,) {final _that = this;
switch (_that) {
case _Asset() when $default != null:
return $default(_that.id,_that.companyId,_that.mdmSource,_that.modelName,_that.assetType,_that.conditionGrade,_that.quantity,_that.createdAt,_that.updatedAt,_that.serialNumber,_that.reasonForOffload,_that.purchaseDate,_that.originalPurchasePrice,_that.osVersion,_that.batteryHealthPct,_that.batteryCycles,_that.complianceState,_that.assignedUser,_that.department,_that.costCenter,_that.lastMdmSync,_that.cpuScore,_that.ramGb,_that.storageGb);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Asset extends Asset {
  const _Asset({required this.id, required this.companyId, required this.mdmSource, required this.modelName, required this.assetType, required this.conditionGrade, required this.quantity, @IsoDateTimeConverter() required this.createdAt, @IsoDateTimeConverter() required this.updatedAt, this.serialNumber, this.reasonForOffload, @NullableDateOnlyConverter() this.purchaseDate, this.originalPurchasePrice, this.osVersion, this.batteryHealthPct, this.batteryCycles, this.complianceState, this.assignedUser, this.department, this.costCenter, @NullableIsoDateTimeConverter() this.lastMdmSync, this.cpuScore, this.ramGb, this.storageGb}): super._();
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
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Asset&&(identical(other.id, id) || other.id == id)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.mdmSource, mdmSource) || other.mdmSource == mdmSource)&&(identical(other.modelName, modelName) || other.modelName == modelName)&&(identical(other.assetType, assetType) || other.assetType == assetType)&&(identical(other.conditionGrade, conditionGrade) || other.conditionGrade == conditionGrade)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.serialNumber, serialNumber) || other.serialNumber == serialNumber)&&(identical(other.reasonForOffload, reasonForOffload) || other.reasonForOffload == reasonForOffload)&&(identical(other.purchaseDate, purchaseDate) || other.purchaseDate == purchaseDate)&&(identical(other.originalPurchasePrice, originalPurchasePrice) || other.originalPurchasePrice == originalPurchasePrice)&&(identical(other.osVersion, osVersion) || other.osVersion == osVersion)&&(identical(other.batteryHealthPct, batteryHealthPct) || other.batteryHealthPct == batteryHealthPct)&&(identical(other.batteryCycles, batteryCycles) || other.batteryCycles == batteryCycles)&&(identical(other.complianceState, complianceState) || other.complianceState == complianceState)&&(identical(other.assignedUser, assignedUser) || other.assignedUser == assignedUser)&&(identical(other.department, department) || other.department == department)&&(identical(other.costCenter, costCenter) || other.costCenter == costCenter)&&(identical(other.lastMdmSync, lastMdmSync) || other.lastMdmSync == lastMdmSync)&&(identical(other.cpuScore, cpuScore) || other.cpuScore == cpuScore)&&(identical(other.ramGb, ramGb) || other.ramGb == ramGb)&&(identical(other.storageGb, storageGb) || other.storageGb == storageGb));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,companyId,mdmSource,modelName,assetType,conditionGrade,quantity,createdAt,updatedAt,serialNumber,reasonForOffload,purchaseDate,originalPurchasePrice,osVersion,batteryHealthPct,batteryCycles,complianceState,assignedUser,department,costCenter,lastMdmSync,cpuScore,ramGb,storageGb]);

@override
String toString() {
  return 'Asset(id: $id, companyId: $companyId, mdmSource: $mdmSource, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, createdAt: $createdAt, updatedAt: $updatedAt, serialNumber: $serialNumber, reasonForOffload: $reasonForOffload, purchaseDate: $purchaseDate, originalPurchasePrice: $originalPurchasePrice, osVersion: $osVersion, batteryHealthPct: $batteryHealthPct, batteryCycles: $batteryCycles, complianceState: $complianceState, assignedUser: $assignedUser, department: $department, costCenter: $costCenter, lastMdmSync: $lastMdmSync, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb)';
}


}

/// @nodoc
abstract mixin class _$AssetCopyWith<$Res> implements $AssetCopyWith<$Res> {
  factory _$AssetCopyWith(_Asset value, $Res Function(_Asset) _then) = __$AssetCopyWithImpl;
@override @useResult
$Res call({
 String id, String companyId, String mdmSource, String modelName, String assetType, String conditionGrade, int quantity,@IsoDateTimeConverter() DateTime createdAt,@IsoDateTimeConverter() DateTime updatedAt, String? serialNumber, String? reasonForOffload,@NullableDateOnlyConverter() DateTime? purchaseDate, double? originalPurchasePrice, String? osVersion, double? batteryHealthPct, int? batteryCycles, String? complianceState, String? assignedUser, String? department, String? costCenter,@NullableIsoDateTimeConverter() DateTime? lastMdmSync, double? cpuScore, double? ramGb, double? storageGb
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
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? companyId = null,Object? mdmSource = null,Object? modelName = null,Object? assetType = null,Object? conditionGrade = null,Object? quantity = null,Object? createdAt = null,Object? updatedAt = null,Object? serialNumber = freezed,Object? reasonForOffload = freezed,Object? purchaseDate = freezed,Object? originalPurchasePrice = freezed,Object? osVersion = freezed,Object? batteryHealthPct = freezed,Object? batteryCycles = freezed,Object? complianceState = freezed,Object? assignedUser = freezed,Object? department = freezed,Object? costCenter = freezed,Object? lastMdmSync = freezed,Object? cpuScore = freezed,Object? ramGb = freezed,Object? storageGb = freezed,}) {
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
as double?,
  ));
}


}

// dart format on
