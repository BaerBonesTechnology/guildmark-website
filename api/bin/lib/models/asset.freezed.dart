// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'asset.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Asset _$AssetFromJson(Map<String, dynamic> json) {
  return _Asset.fromJson(json);
}

/// @nodoc
mixin _$Asset {
  String get id => throw _privateConstructorUsedError;
  String get companyId => throw _privateConstructorUsedError;
  String get mdmSource => throw _privateConstructorUsedError;
  String get modelName => throw _privateConstructorUsedError;
  String get assetType => throw _privateConstructorUsedError;
  String get conditionGrade => throw _privateConstructorUsedError;
  int get quantity => throw _privateConstructorUsedError;
  @IsoDateTimeConverter()
  DateTime get createdAt => throw _privateConstructorUsedError;
  @IsoDateTimeConverter()
  DateTime get updatedAt => throw _privateConstructorUsedError;
  String? get serialNumber => throw _privateConstructorUsedError;
  String? get reasonForOffload => throw _privateConstructorUsedError;
  @NullableDateOnlyConverter()
  DateTime? get purchaseDate => throw _privateConstructorUsedError;
  double? get originalPurchasePrice => throw _privateConstructorUsedError;
  String? get osVersion => throw _privateConstructorUsedError;
  double? get batteryHealthPct => throw _privateConstructorUsedError;
  int? get batteryCycles => throw _privateConstructorUsedError;
  String? get complianceState => throw _privateConstructorUsedError;
  String? get assignedUser => throw _privateConstructorUsedError;
  String? get department => throw _privateConstructorUsedError;
  String? get costCenter => throw _privateConstructorUsedError;
  @NullableIsoDateTimeConverter()
  DateTime? get lastMdmSync => throw _privateConstructorUsedError;
  double? get cpuScore => throw _privateConstructorUsedError;
  double? get ramGb => throw _privateConstructorUsedError;
  double? get storageGb => throw _privateConstructorUsedError;

  /// Serializes this Asset to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Asset
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AssetCopyWith<Asset> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AssetCopyWith<$Res> {
  factory $AssetCopyWith(Asset value, $Res Function(Asset) then) =
      _$AssetCopyWithImpl<$Res, Asset>;
  @useResult
  $Res call(
      {String id,
      String companyId,
      String mdmSource,
      String modelName,
      String assetType,
      String conditionGrade,
      int quantity,
      @IsoDateTimeConverter() DateTime createdAt,
      @IsoDateTimeConverter() DateTime updatedAt,
      String? serialNumber,
      String? reasonForOffload,
      @NullableDateOnlyConverter() DateTime? purchaseDate,
      double? originalPurchasePrice,
      String? osVersion,
      double? batteryHealthPct,
      int? batteryCycles,
      String? complianceState,
      String? assignedUser,
      String? department,
      String? costCenter,
      @NullableIsoDateTimeConverter() DateTime? lastMdmSync,
      double? cpuScore,
      double? ramGb,
      double? storageGb});
}

/// @nodoc
class _$AssetCopyWithImpl<$Res, $Val extends Asset>
    implements $AssetCopyWith<$Res> {
  _$AssetCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Asset
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? companyId = null,
    Object? mdmSource = null,
    Object? modelName = null,
    Object? assetType = null,
    Object? conditionGrade = null,
    Object? quantity = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? serialNumber = freezed,
    Object? reasonForOffload = freezed,
    Object? purchaseDate = freezed,
    Object? originalPurchasePrice = freezed,
    Object? osVersion = freezed,
    Object? batteryHealthPct = freezed,
    Object? batteryCycles = freezed,
    Object? complianceState = freezed,
    Object? assignedUser = freezed,
    Object? department = freezed,
    Object? costCenter = freezed,
    Object? lastMdmSync = freezed,
    Object? cpuScore = freezed,
    Object? ramGb = freezed,
    Object? storageGb = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      companyId: null == companyId
          ? _value.companyId
          : companyId // ignore: cast_nullable_to_non_nullable
              as String,
      mdmSource: null == mdmSource
          ? _value.mdmSource
          : mdmSource // ignore: cast_nullable_to_non_nullable
              as String,
      modelName: null == modelName
          ? _value.modelName
          : modelName // ignore: cast_nullable_to_non_nullable
              as String,
      assetType: null == assetType
          ? _value.assetType
          : assetType // ignore: cast_nullable_to_non_nullable
              as String,
      conditionGrade: null == conditionGrade
          ? _value.conditionGrade
          : conditionGrade // ignore: cast_nullable_to_non_nullable
              as String,
      quantity: null == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      serialNumber: freezed == serialNumber
          ? _value.serialNumber
          : serialNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      reasonForOffload: freezed == reasonForOffload
          ? _value.reasonForOffload
          : reasonForOffload // ignore: cast_nullable_to_non_nullable
              as String?,
      purchaseDate: freezed == purchaseDate
          ? _value.purchaseDate
          : purchaseDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      originalPurchasePrice: freezed == originalPurchasePrice
          ? _value.originalPurchasePrice
          : originalPurchasePrice // ignore: cast_nullable_to_non_nullable
              as double?,
      osVersion: freezed == osVersion
          ? _value.osVersion
          : osVersion // ignore: cast_nullable_to_non_nullable
              as String?,
      batteryHealthPct: freezed == batteryHealthPct
          ? _value.batteryHealthPct
          : batteryHealthPct // ignore: cast_nullable_to_non_nullable
              as double?,
      batteryCycles: freezed == batteryCycles
          ? _value.batteryCycles
          : batteryCycles // ignore: cast_nullable_to_non_nullable
              as int?,
      complianceState: freezed == complianceState
          ? _value.complianceState
          : complianceState // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedUser: freezed == assignedUser
          ? _value.assignedUser
          : assignedUser // ignore: cast_nullable_to_non_nullable
              as String?,
      department: freezed == department
          ? _value.department
          : department // ignore: cast_nullable_to_non_nullable
              as String?,
      costCenter: freezed == costCenter
          ? _value.costCenter
          : costCenter // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMdmSync: freezed == lastMdmSync
          ? _value.lastMdmSync
          : lastMdmSync // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      cpuScore: freezed == cpuScore
          ? _value.cpuScore
          : cpuScore // ignore: cast_nullable_to_non_nullable
              as double?,
      ramGb: freezed == ramGb
          ? _value.ramGb
          : ramGb // ignore: cast_nullable_to_non_nullable
              as double?,
      storageGb: freezed == storageGb
          ? _value.storageGb
          : storageGb // ignore: cast_nullable_to_non_nullable
              as double?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AssetImplCopyWith<$Res> implements $AssetCopyWith<$Res> {
  factory _$$AssetImplCopyWith(
          _$AssetImpl value, $Res Function(_$AssetImpl) then) =
      __$$AssetImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String companyId,
      String mdmSource,
      String modelName,
      String assetType,
      String conditionGrade,
      int quantity,
      @IsoDateTimeConverter() DateTime createdAt,
      @IsoDateTimeConverter() DateTime updatedAt,
      String? serialNumber,
      String? reasonForOffload,
      @NullableDateOnlyConverter() DateTime? purchaseDate,
      double? originalPurchasePrice,
      String? osVersion,
      double? batteryHealthPct,
      int? batteryCycles,
      String? complianceState,
      String? assignedUser,
      String? department,
      String? costCenter,
      @NullableIsoDateTimeConverter() DateTime? lastMdmSync,
      double? cpuScore,
      double? ramGb,
      double? storageGb});
}

/// @nodoc
class __$$AssetImplCopyWithImpl<$Res>
    extends _$AssetCopyWithImpl<$Res, _$AssetImpl>
    implements _$$AssetImplCopyWith<$Res> {
  __$$AssetImplCopyWithImpl(
      _$AssetImpl _value, $Res Function(_$AssetImpl) _then)
      : super(_value, _then);

  /// Create a copy of Asset
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? companyId = null,
    Object? mdmSource = null,
    Object? modelName = null,
    Object? assetType = null,
    Object? conditionGrade = null,
    Object? quantity = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? serialNumber = freezed,
    Object? reasonForOffload = freezed,
    Object? purchaseDate = freezed,
    Object? originalPurchasePrice = freezed,
    Object? osVersion = freezed,
    Object? batteryHealthPct = freezed,
    Object? batteryCycles = freezed,
    Object? complianceState = freezed,
    Object? assignedUser = freezed,
    Object? department = freezed,
    Object? costCenter = freezed,
    Object? lastMdmSync = freezed,
    Object? cpuScore = freezed,
    Object? ramGb = freezed,
    Object? storageGb = freezed,
  }) {
    return _then(_$AssetImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      companyId: null == companyId
          ? _value.companyId
          : companyId // ignore: cast_nullable_to_non_nullable
              as String,
      mdmSource: null == mdmSource
          ? _value.mdmSource
          : mdmSource // ignore: cast_nullable_to_non_nullable
              as String,
      modelName: null == modelName
          ? _value.modelName
          : modelName // ignore: cast_nullable_to_non_nullable
              as String,
      assetType: null == assetType
          ? _value.assetType
          : assetType // ignore: cast_nullable_to_non_nullable
              as String,
      conditionGrade: null == conditionGrade
          ? _value.conditionGrade
          : conditionGrade // ignore: cast_nullable_to_non_nullable
              as String,
      quantity: null == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      serialNumber: freezed == serialNumber
          ? _value.serialNumber
          : serialNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      reasonForOffload: freezed == reasonForOffload
          ? _value.reasonForOffload
          : reasonForOffload // ignore: cast_nullable_to_non_nullable
              as String?,
      purchaseDate: freezed == purchaseDate
          ? _value.purchaseDate
          : purchaseDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      originalPurchasePrice: freezed == originalPurchasePrice
          ? _value.originalPurchasePrice
          : originalPurchasePrice // ignore: cast_nullable_to_non_nullable
              as double?,
      osVersion: freezed == osVersion
          ? _value.osVersion
          : osVersion // ignore: cast_nullable_to_non_nullable
              as String?,
      batteryHealthPct: freezed == batteryHealthPct
          ? _value.batteryHealthPct
          : batteryHealthPct // ignore: cast_nullable_to_non_nullable
              as double?,
      batteryCycles: freezed == batteryCycles
          ? _value.batteryCycles
          : batteryCycles // ignore: cast_nullable_to_non_nullable
              as int?,
      complianceState: freezed == complianceState
          ? _value.complianceState
          : complianceState // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedUser: freezed == assignedUser
          ? _value.assignedUser
          : assignedUser // ignore: cast_nullable_to_non_nullable
              as String?,
      department: freezed == department
          ? _value.department
          : department // ignore: cast_nullable_to_non_nullable
              as String?,
      costCenter: freezed == costCenter
          ? _value.costCenter
          : costCenter // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMdmSync: freezed == lastMdmSync
          ? _value.lastMdmSync
          : lastMdmSync // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      cpuScore: freezed == cpuScore
          ? _value.cpuScore
          : cpuScore // ignore: cast_nullable_to_non_nullable
              as double?,
      ramGb: freezed == ramGb
          ? _value.ramGb
          : ramGb // ignore: cast_nullable_to_non_nullable
              as double?,
      storageGb: freezed == storageGb
          ? _value.storageGb
          : storageGb // ignore: cast_nullable_to_non_nullable
              as double?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AssetImpl extends _Asset {
  const _$AssetImpl(
      {required this.id,
      required this.companyId,
      required this.mdmSource,
      required this.modelName,
      required this.assetType,
      required this.conditionGrade,
      required this.quantity,
      @IsoDateTimeConverter() required this.createdAt,
      @IsoDateTimeConverter() required this.updatedAt,
      this.serialNumber,
      this.reasonForOffload,
      @NullableDateOnlyConverter() this.purchaseDate,
      this.originalPurchasePrice,
      this.osVersion,
      this.batteryHealthPct,
      this.batteryCycles,
      this.complianceState,
      this.assignedUser,
      this.department,
      this.costCenter,
      @NullableIsoDateTimeConverter() this.lastMdmSync,
      this.cpuScore,
      this.ramGb,
      this.storageGb})
      : super._();

  factory _$AssetImpl.fromJson(Map<String, dynamic> json) =>
      _$$AssetImplFromJson(json);

  @override
  final String id;
  @override
  final String companyId;
  @override
  final String mdmSource;
  @override
  final String modelName;
  @override
  final String assetType;
  @override
  final String conditionGrade;
  @override
  final int quantity;
  @override
  @IsoDateTimeConverter()
  final DateTime createdAt;
  @override
  @IsoDateTimeConverter()
  final DateTime updatedAt;
  @override
  final String? serialNumber;
  @override
  final String? reasonForOffload;
  @override
  @NullableDateOnlyConverter()
  final DateTime? purchaseDate;
  @override
  final double? originalPurchasePrice;
  @override
  final String? osVersion;
  @override
  final double? batteryHealthPct;
  @override
  final int? batteryCycles;
  @override
  final String? complianceState;
  @override
  final String? assignedUser;
  @override
  final String? department;
  @override
  final String? costCenter;
  @override
  @NullableIsoDateTimeConverter()
  final DateTime? lastMdmSync;
  @override
  final double? cpuScore;
  @override
  final double? ramGb;
  @override
  final double? storageGb;

  @override
  String toString() {
    return 'Asset(id: $id, companyId: $companyId, mdmSource: $mdmSource, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, createdAt: $createdAt, updatedAt: $updatedAt, serialNumber: $serialNumber, reasonForOffload: $reasonForOffload, purchaseDate: $purchaseDate, originalPurchasePrice: $originalPurchasePrice, osVersion: $osVersion, batteryHealthPct: $batteryHealthPct, batteryCycles: $batteryCycles, complianceState: $complianceState, assignedUser: $assignedUser, department: $department, costCenter: $costCenter, lastMdmSync: $lastMdmSync, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AssetImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.companyId, companyId) ||
                other.companyId == companyId) &&
            (identical(other.mdmSource, mdmSource) ||
                other.mdmSource == mdmSource) &&
            (identical(other.modelName, modelName) ||
                other.modelName == modelName) &&
            (identical(other.assetType, assetType) ||
                other.assetType == assetType) &&
            (identical(other.conditionGrade, conditionGrade) ||
                other.conditionGrade == conditionGrade) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.serialNumber, serialNumber) ||
                other.serialNumber == serialNumber) &&
            (identical(other.reasonForOffload, reasonForOffload) ||
                other.reasonForOffload == reasonForOffload) &&
            (identical(other.purchaseDate, purchaseDate) ||
                other.purchaseDate == purchaseDate) &&
            (identical(other.originalPurchasePrice, originalPurchasePrice) ||
                other.originalPurchasePrice == originalPurchasePrice) &&
            (identical(other.osVersion, osVersion) ||
                other.osVersion == osVersion) &&
            (identical(other.batteryHealthPct, batteryHealthPct) ||
                other.batteryHealthPct == batteryHealthPct) &&
            (identical(other.batteryCycles, batteryCycles) ||
                other.batteryCycles == batteryCycles) &&
            (identical(other.complianceState, complianceState) ||
                other.complianceState == complianceState) &&
            (identical(other.assignedUser, assignedUser) ||
                other.assignedUser == assignedUser) &&
            (identical(other.department, department) ||
                other.department == department) &&
            (identical(other.costCenter, costCenter) ||
                other.costCenter == costCenter) &&
            (identical(other.lastMdmSync, lastMdmSync) ||
                other.lastMdmSync == lastMdmSync) &&
            (identical(other.cpuScore, cpuScore) ||
                other.cpuScore == cpuScore) &&
            (identical(other.ramGb, ramGb) || other.ramGb == ramGb) &&
            (identical(other.storageGb, storageGb) ||
                other.storageGb == storageGb));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        companyId,
        mdmSource,
        modelName,
        assetType,
        conditionGrade,
        quantity,
        createdAt,
        updatedAt,
        serialNumber,
        reasonForOffload,
        purchaseDate,
        originalPurchasePrice,
        osVersion,
        batteryHealthPct,
        batteryCycles,
        complianceState,
        assignedUser,
        department,
        costCenter,
        lastMdmSync,
        cpuScore,
        ramGb,
        storageGb
      ]);

  /// Create a copy of Asset
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AssetImplCopyWith<_$AssetImpl> get copyWith =>
      __$$AssetImplCopyWithImpl<_$AssetImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AssetImplToJson(
      this,
    );
  }
}

abstract class _Asset extends Asset {
  const factory _Asset(
      {required final String id,
      required final String companyId,
      required final String mdmSource,
      required final String modelName,
      required final String assetType,
      required final String conditionGrade,
      required final int quantity,
      @IsoDateTimeConverter() required final DateTime createdAt,
      @IsoDateTimeConverter() required final DateTime updatedAt,
      final String? serialNumber,
      final String? reasonForOffload,
      @NullableDateOnlyConverter() final DateTime? purchaseDate,
      final double? originalPurchasePrice,
      final String? osVersion,
      final double? batteryHealthPct,
      final int? batteryCycles,
      final String? complianceState,
      final String? assignedUser,
      final String? department,
      final String? costCenter,
      @NullableIsoDateTimeConverter() final DateTime? lastMdmSync,
      final double? cpuScore,
      final double? ramGb,
      final double? storageGb}) = _$AssetImpl;
  const _Asset._() : super._();

  factory _Asset.fromJson(Map<String, dynamic> json) = _$AssetImpl.fromJson;

  @override
  String get id;
  @override
  String get companyId;
  @override
  String get mdmSource;
  @override
  String get modelName;
  @override
  String get assetType;
  @override
  String get conditionGrade;
  @override
  int get quantity;
  @override
  @IsoDateTimeConverter()
  DateTime get createdAt;
  @override
  @IsoDateTimeConverter()
  DateTime get updatedAt;
  @override
  String? get serialNumber;
  @override
  String? get reasonForOffload;
  @override
  @NullableDateOnlyConverter()
  DateTime? get purchaseDate;
  @override
  double? get originalPurchasePrice;
  @override
  String? get osVersion;
  @override
  double? get batteryHealthPct;
  @override
  int? get batteryCycles;
  @override
  String? get complianceState;
  @override
  String? get assignedUser;
  @override
  String? get department;
  @override
  String? get costCenter;
  @override
  @NullableIsoDateTimeConverter()
  DateTime? get lastMdmSync;
  @override
  double? get cpuScore;
  @override
  double? get ramGb;
  @override
  double? get storageGb;

  /// Create a copy of Asset
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AssetImplCopyWith<_$AssetImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
