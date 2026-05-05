// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'portfolio.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ValuationSnapshot _$ValuationSnapshotFromJson(Map<String, dynamic> json) {
  return _ValuationSnapshot.fromJson(json);
}

/// @nodoc
mixin _$ValuationSnapshot {
  @DateOnlyConverter()
  DateTime get snapshotDate => throw _privateConstructorUsedError;
  double get totalPortfolioValue => throw _privateConstructorUsedError;
  double get totalBookValue => throw _privateConstructorUsedError;
  double get totalDepreciation => throw _privateConstructorUsedError;
  int get totalDevices => throw _privateConstructorUsedError;

  /// Serializes this ValuationSnapshot to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ValuationSnapshot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ValuationSnapshotCopyWith<ValuationSnapshot> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ValuationSnapshotCopyWith<$Res> {
  factory $ValuationSnapshotCopyWith(
          ValuationSnapshot value, $Res Function(ValuationSnapshot) then) =
      _$ValuationSnapshotCopyWithImpl<$Res, ValuationSnapshot>;
  @useResult
  $Res call(
      {@DateOnlyConverter() DateTime snapshotDate,
      double totalPortfolioValue,
      double totalBookValue,
      double totalDepreciation,
      int totalDevices});
}

/// @nodoc
class _$ValuationSnapshotCopyWithImpl<$Res, $Val extends ValuationSnapshot>
    implements $ValuationSnapshotCopyWith<$Res> {
  _$ValuationSnapshotCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ValuationSnapshot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? snapshotDate = null,
    Object? totalPortfolioValue = null,
    Object? totalBookValue = null,
    Object? totalDepreciation = null,
    Object? totalDevices = null,
  }) {
    return _then(_value.copyWith(
      snapshotDate: null == snapshotDate
          ? _value.snapshotDate
          : snapshotDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      totalPortfolioValue: null == totalPortfolioValue
          ? _value.totalPortfolioValue
          : totalPortfolioValue // ignore: cast_nullable_to_non_nullable
              as double,
      totalBookValue: null == totalBookValue
          ? _value.totalBookValue
          : totalBookValue // ignore: cast_nullable_to_non_nullable
              as double,
      totalDepreciation: null == totalDepreciation
          ? _value.totalDepreciation
          : totalDepreciation // ignore: cast_nullable_to_non_nullable
              as double,
      totalDevices: null == totalDevices
          ? _value.totalDevices
          : totalDevices // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ValuationSnapshotImplCopyWith<$Res>
    implements $ValuationSnapshotCopyWith<$Res> {
  factory _$$ValuationSnapshotImplCopyWith(_$ValuationSnapshotImpl value,
          $Res Function(_$ValuationSnapshotImpl) then) =
      __$$ValuationSnapshotImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@DateOnlyConverter() DateTime snapshotDate,
      double totalPortfolioValue,
      double totalBookValue,
      double totalDepreciation,
      int totalDevices});
}

/// @nodoc
class __$$ValuationSnapshotImplCopyWithImpl<$Res>
    extends _$ValuationSnapshotCopyWithImpl<$Res, _$ValuationSnapshotImpl>
    implements _$$ValuationSnapshotImplCopyWith<$Res> {
  __$$ValuationSnapshotImplCopyWithImpl(_$ValuationSnapshotImpl _value,
      $Res Function(_$ValuationSnapshotImpl) _then)
      : super(_value, _then);

  /// Create a copy of ValuationSnapshot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? snapshotDate = null,
    Object? totalPortfolioValue = null,
    Object? totalBookValue = null,
    Object? totalDepreciation = null,
    Object? totalDevices = null,
  }) {
    return _then(_$ValuationSnapshotImpl(
      snapshotDate: null == snapshotDate
          ? _value.snapshotDate
          : snapshotDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      totalPortfolioValue: null == totalPortfolioValue
          ? _value.totalPortfolioValue
          : totalPortfolioValue // ignore: cast_nullable_to_non_nullable
              as double,
      totalBookValue: null == totalBookValue
          ? _value.totalBookValue
          : totalBookValue // ignore: cast_nullable_to_non_nullable
              as double,
      totalDepreciation: null == totalDepreciation
          ? _value.totalDepreciation
          : totalDepreciation // ignore: cast_nullable_to_non_nullable
              as double,
      totalDevices: null == totalDevices
          ? _value.totalDevices
          : totalDevices // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ValuationSnapshotImpl extends _ValuationSnapshot {
  const _$ValuationSnapshotImpl(
      {@DateOnlyConverter() required this.snapshotDate,
      required this.totalPortfolioValue,
      required this.totalBookValue,
      required this.totalDepreciation,
      required this.totalDevices})
      : super._();

  factory _$ValuationSnapshotImpl.fromJson(Map<String, dynamic> json) =>
      _$$ValuationSnapshotImplFromJson(json);

  @override
  @DateOnlyConverter()
  final DateTime snapshotDate;
  @override
  final double totalPortfolioValue;
  @override
  final double totalBookValue;
  @override
  final double totalDepreciation;
  @override
  final int totalDevices;

  @override
  String toString() {
    return 'ValuationSnapshot(snapshotDate: $snapshotDate, totalPortfolioValue: $totalPortfolioValue, totalBookValue: $totalBookValue, totalDepreciation: $totalDepreciation, totalDevices: $totalDevices)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ValuationSnapshotImpl &&
            (identical(other.snapshotDate, snapshotDate) ||
                other.snapshotDate == snapshotDate) &&
            (identical(other.totalPortfolioValue, totalPortfolioValue) ||
                other.totalPortfolioValue == totalPortfolioValue) &&
            (identical(other.totalBookValue, totalBookValue) ||
                other.totalBookValue == totalBookValue) &&
            (identical(other.totalDepreciation, totalDepreciation) ||
                other.totalDepreciation == totalDepreciation) &&
            (identical(other.totalDevices, totalDevices) ||
                other.totalDevices == totalDevices));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, snapshotDate,
      totalPortfolioValue, totalBookValue, totalDepreciation, totalDevices);

  /// Create a copy of ValuationSnapshot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ValuationSnapshotImplCopyWith<_$ValuationSnapshotImpl> get copyWith =>
      __$$ValuationSnapshotImplCopyWithImpl<_$ValuationSnapshotImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ValuationSnapshotImplToJson(
      this,
    );
  }
}

abstract class _ValuationSnapshot extends ValuationSnapshot {
  const factory _ValuationSnapshot(
      {@DateOnlyConverter() required final DateTime snapshotDate,
      required final double totalPortfolioValue,
      required final double totalBookValue,
      required final double totalDepreciation,
      required final int totalDevices}) = _$ValuationSnapshotImpl;
  const _ValuationSnapshot._() : super._();

  factory _ValuationSnapshot.fromJson(Map<String, dynamic> json) =
      _$ValuationSnapshotImpl.fromJson;

  @override
  @DateOnlyConverter()
  DateTime get snapshotDate;
  @override
  double get totalPortfolioValue;
  @override
  double get totalBookValue;
  @override
  double get totalDepreciation;
  @override
  int get totalDevices;

  /// Create a copy of ValuationSnapshot
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ValuationSnapshotImplCopyWith<_$ValuationSnapshotImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PortfolioBucket _$PortfolioBucketFromJson(Map<String, dynamic> json) {
  return _PortfolioBucket.fromJson(json);
}

/// @nodoc
mixin _$PortfolioBucket {
  int get count => throw _privateConstructorUsedError;
  double get value => throw _privateConstructorUsedError;

  /// Serializes this PortfolioBucket to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PortfolioBucket
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PortfolioBucketCopyWith<PortfolioBucket> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PortfolioBucketCopyWith<$Res> {
  factory $PortfolioBucketCopyWith(
          PortfolioBucket value, $Res Function(PortfolioBucket) then) =
      _$PortfolioBucketCopyWithImpl<$Res, PortfolioBucket>;
  @useResult
  $Res call({int count, double value});
}

/// @nodoc
class _$PortfolioBucketCopyWithImpl<$Res, $Val extends PortfolioBucket>
    implements $PortfolioBucketCopyWith<$Res> {
  _$PortfolioBucketCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PortfolioBucket
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? count = null,
    Object? value = null,
  }) {
    return _then(_value.copyWith(
      count: null == count
          ? _value.count
          : count // ignore: cast_nullable_to_non_nullable
              as int,
      value: null == value
          ? _value.value
          : value // ignore: cast_nullable_to_non_nullable
              as double,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PortfolioBucketImplCopyWith<$Res>
    implements $PortfolioBucketCopyWith<$Res> {
  factory _$$PortfolioBucketImplCopyWith(_$PortfolioBucketImpl value,
          $Res Function(_$PortfolioBucketImpl) then) =
      __$$PortfolioBucketImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int count, double value});
}

/// @nodoc
class __$$PortfolioBucketImplCopyWithImpl<$Res>
    extends _$PortfolioBucketCopyWithImpl<$Res, _$PortfolioBucketImpl>
    implements _$$PortfolioBucketImplCopyWith<$Res> {
  __$$PortfolioBucketImplCopyWithImpl(
      _$PortfolioBucketImpl _value, $Res Function(_$PortfolioBucketImpl) _then)
      : super(_value, _then);

  /// Create a copy of PortfolioBucket
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? count = null,
    Object? value = null,
  }) {
    return _then(_$PortfolioBucketImpl(
      count: null == count
          ? _value.count
          : count // ignore: cast_nullable_to_non_nullable
              as int,
      value: null == value
          ? _value.value
          : value // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PortfolioBucketImpl implements _PortfolioBucket {
  const _$PortfolioBucketImpl({required this.count, required this.value});

  factory _$PortfolioBucketImpl.fromJson(Map<String, dynamic> json) =>
      _$$PortfolioBucketImplFromJson(json);

  @override
  final int count;
  @override
  final double value;

  @override
  String toString() {
    return 'PortfolioBucket(count: $count, value: $value)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PortfolioBucketImpl &&
            (identical(other.count, count) || other.count == count) &&
            (identical(other.value, value) || other.value == value));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, count, value);

  /// Create a copy of PortfolioBucket
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PortfolioBucketImplCopyWith<_$PortfolioBucketImpl> get copyWith =>
      __$$PortfolioBucketImplCopyWithImpl<_$PortfolioBucketImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PortfolioBucketImplToJson(
      this,
    );
  }
}

abstract class _PortfolioBucket implements PortfolioBucket {
  const factory _PortfolioBucket(
      {required final int count,
      required final double value}) = _$PortfolioBucketImpl;

  factory _PortfolioBucket.fromJson(Map<String, dynamic> json) =
      _$PortfolioBucketImpl.fromJson;

  @override
  int get count;
  @override
  double get value;

  /// Create a copy of PortfolioBucket
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PortfolioBucketImplCopyWith<_$PortfolioBucketImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PortfolioSummary _$PortfolioSummaryFromJson(Map<String, dynamic> json) {
  return _PortfolioSummary.fromJson(json);
}

/// @nodoc
mixin _$PortfolioSummary {
  int get totalDevices => throw _privateConstructorUsedError;
  double get totalPortfolioValue => throw _privateConstructorUsedError;
  double get totalBookValue => throw _privateConstructorUsedError;
  double get totalDepreciation => throw _privateConstructorUsedError;
  double get depreciationPct => throw _privateConstructorUsedError;
  double get avgAssetAgeMonths => throw _privateConstructorUsedError;
  int get assetsAtRisk => throw _privateConstructorUsedError;
  Map<String, PortfolioBucket> get byType => throw _privateConstructorUsedError;
  Map<String, PortfolioBucket> get byCondition =>
      throw _privateConstructorUsedError;
  List<ValuationSnapshot> get trend => throw _privateConstructorUsedError;

  /// Serializes this PortfolioSummary to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PortfolioSummary
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PortfolioSummaryCopyWith<PortfolioSummary> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PortfolioSummaryCopyWith<$Res> {
  factory $PortfolioSummaryCopyWith(
          PortfolioSummary value, $Res Function(PortfolioSummary) then) =
      _$PortfolioSummaryCopyWithImpl<$Res, PortfolioSummary>;
  @useResult
  $Res call(
      {int totalDevices,
      double totalPortfolioValue,
      double totalBookValue,
      double totalDepreciation,
      double depreciationPct,
      double avgAssetAgeMonths,
      int assetsAtRisk,
      Map<String, PortfolioBucket> byType,
      Map<String, PortfolioBucket> byCondition,
      List<ValuationSnapshot> trend});
}

/// @nodoc
class _$PortfolioSummaryCopyWithImpl<$Res, $Val extends PortfolioSummary>
    implements $PortfolioSummaryCopyWith<$Res> {
  _$PortfolioSummaryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PortfolioSummary
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalDevices = null,
    Object? totalPortfolioValue = null,
    Object? totalBookValue = null,
    Object? totalDepreciation = null,
    Object? depreciationPct = null,
    Object? avgAssetAgeMonths = null,
    Object? assetsAtRisk = null,
    Object? byType = null,
    Object? byCondition = null,
    Object? trend = null,
  }) {
    return _then(_value.copyWith(
      totalDevices: null == totalDevices
          ? _value.totalDevices
          : totalDevices // ignore: cast_nullable_to_non_nullable
              as int,
      totalPortfolioValue: null == totalPortfolioValue
          ? _value.totalPortfolioValue
          : totalPortfolioValue // ignore: cast_nullable_to_non_nullable
              as double,
      totalBookValue: null == totalBookValue
          ? _value.totalBookValue
          : totalBookValue // ignore: cast_nullable_to_non_nullable
              as double,
      totalDepreciation: null == totalDepreciation
          ? _value.totalDepreciation
          : totalDepreciation // ignore: cast_nullable_to_non_nullable
              as double,
      depreciationPct: null == depreciationPct
          ? _value.depreciationPct
          : depreciationPct // ignore: cast_nullable_to_non_nullable
              as double,
      avgAssetAgeMonths: null == avgAssetAgeMonths
          ? _value.avgAssetAgeMonths
          : avgAssetAgeMonths // ignore: cast_nullable_to_non_nullable
              as double,
      assetsAtRisk: null == assetsAtRisk
          ? _value.assetsAtRisk
          : assetsAtRisk // ignore: cast_nullable_to_non_nullable
              as int,
      byType: null == byType
          ? _value.byType
          : byType // ignore: cast_nullable_to_non_nullable
              as Map<String, PortfolioBucket>,
      byCondition: null == byCondition
          ? _value.byCondition
          : byCondition // ignore: cast_nullable_to_non_nullable
              as Map<String, PortfolioBucket>,
      trend: null == trend
          ? _value.trend
          : trend // ignore: cast_nullable_to_non_nullable
              as List<ValuationSnapshot>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PortfolioSummaryImplCopyWith<$Res>
    implements $PortfolioSummaryCopyWith<$Res> {
  factory _$$PortfolioSummaryImplCopyWith(_$PortfolioSummaryImpl value,
          $Res Function(_$PortfolioSummaryImpl) then) =
      __$$PortfolioSummaryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int totalDevices,
      double totalPortfolioValue,
      double totalBookValue,
      double totalDepreciation,
      double depreciationPct,
      double avgAssetAgeMonths,
      int assetsAtRisk,
      Map<String, PortfolioBucket> byType,
      Map<String, PortfolioBucket> byCondition,
      List<ValuationSnapshot> trend});
}

/// @nodoc
class __$$PortfolioSummaryImplCopyWithImpl<$Res>
    extends _$PortfolioSummaryCopyWithImpl<$Res, _$PortfolioSummaryImpl>
    implements _$$PortfolioSummaryImplCopyWith<$Res> {
  __$$PortfolioSummaryImplCopyWithImpl(_$PortfolioSummaryImpl _value,
      $Res Function(_$PortfolioSummaryImpl) _then)
      : super(_value, _then);

  /// Create a copy of PortfolioSummary
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalDevices = null,
    Object? totalPortfolioValue = null,
    Object? totalBookValue = null,
    Object? totalDepreciation = null,
    Object? depreciationPct = null,
    Object? avgAssetAgeMonths = null,
    Object? assetsAtRisk = null,
    Object? byType = null,
    Object? byCondition = null,
    Object? trend = null,
  }) {
    return _then(_$PortfolioSummaryImpl(
      totalDevices: null == totalDevices
          ? _value.totalDevices
          : totalDevices // ignore: cast_nullable_to_non_nullable
              as int,
      totalPortfolioValue: null == totalPortfolioValue
          ? _value.totalPortfolioValue
          : totalPortfolioValue // ignore: cast_nullable_to_non_nullable
              as double,
      totalBookValue: null == totalBookValue
          ? _value.totalBookValue
          : totalBookValue // ignore: cast_nullable_to_non_nullable
              as double,
      totalDepreciation: null == totalDepreciation
          ? _value.totalDepreciation
          : totalDepreciation // ignore: cast_nullable_to_non_nullable
              as double,
      depreciationPct: null == depreciationPct
          ? _value.depreciationPct
          : depreciationPct // ignore: cast_nullable_to_non_nullable
              as double,
      avgAssetAgeMonths: null == avgAssetAgeMonths
          ? _value.avgAssetAgeMonths
          : avgAssetAgeMonths // ignore: cast_nullable_to_non_nullable
              as double,
      assetsAtRisk: null == assetsAtRisk
          ? _value.assetsAtRisk
          : assetsAtRisk // ignore: cast_nullable_to_non_nullable
              as int,
      byType: null == byType
          ? _value._byType
          : byType // ignore: cast_nullable_to_non_nullable
              as Map<String, PortfolioBucket>,
      byCondition: null == byCondition
          ? _value._byCondition
          : byCondition // ignore: cast_nullable_to_non_nullable
              as Map<String, PortfolioBucket>,
      trend: null == trend
          ? _value._trend
          : trend // ignore: cast_nullable_to_non_nullable
              as List<ValuationSnapshot>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PortfolioSummaryImpl implements _PortfolioSummary {
  const _$PortfolioSummaryImpl(
      {required this.totalDevices,
      required this.totalPortfolioValue,
      required this.totalBookValue,
      required this.totalDepreciation,
      required this.depreciationPct,
      required this.avgAssetAgeMonths,
      required this.assetsAtRisk,
      required final Map<String, PortfolioBucket> byType,
      required final Map<String, PortfolioBucket> byCondition,
      required final List<ValuationSnapshot> trend})
      : _byType = byType,
        _byCondition = byCondition,
        _trend = trend;

  factory _$PortfolioSummaryImpl.fromJson(Map<String, dynamic> json) =>
      _$$PortfolioSummaryImplFromJson(json);

  @override
  final int totalDevices;
  @override
  final double totalPortfolioValue;
  @override
  final double totalBookValue;
  @override
  final double totalDepreciation;
  @override
  final double depreciationPct;
  @override
  final double avgAssetAgeMonths;
  @override
  final int assetsAtRisk;
  final Map<String, PortfolioBucket> _byType;
  @override
  Map<String, PortfolioBucket> get byType {
    if (_byType is EqualUnmodifiableMapView) return _byType;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_byType);
  }

  final Map<String, PortfolioBucket> _byCondition;
  @override
  Map<String, PortfolioBucket> get byCondition {
    if (_byCondition is EqualUnmodifiableMapView) return _byCondition;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_byCondition);
  }

  final List<ValuationSnapshot> _trend;
  @override
  List<ValuationSnapshot> get trend {
    if (_trend is EqualUnmodifiableListView) return _trend;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_trend);
  }

  @override
  String toString() {
    return 'PortfolioSummary(totalDevices: $totalDevices, totalPortfolioValue: $totalPortfolioValue, totalBookValue: $totalBookValue, totalDepreciation: $totalDepreciation, depreciationPct: $depreciationPct, avgAssetAgeMonths: $avgAssetAgeMonths, assetsAtRisk: $assetsAtRisk, byType: $byType, byCondition: $byCondition, trend: $trend)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PortfolioSummaryImpl &&
            (identical(other.totalDevices, totalDevices) ||
                other.totalDevices == totalDevices) &&
            (identical(other.totalPortfolioValue, totalPortfolioValue) ||
                other.totalPortfolioValue == totalPortfolioValue) &&
            (identical(other.totalBookValue, totalBookValue) ||
                other.totalBookValue == totalBookValue) &&
            (identical(other.totalDepreciation, totalDepreciation) ||
                other.totalDepreciation == totalDepreciation) &&
            (identical(other.depreciationPct, depreciationPct) ||
                other.depreciationPct == depreciationPct) &&
            (identical(other.avgAssetAgeMonths, avgAssetAgeMonths) ||
                other.avgAssetAgeMonths == avgAssetAgeMonths) &&
            (identical(other.assetsAtRisk, assetsAtRisk) ||
                other.assetsAtRisk == assetsAtRisk) &&
            const DeepCollectionEquality().equals(other._byType, _byType) &&
            const DeepCollectionEquality()
                .equals(other._byCondition, _byCondition) &&
            const DeepCollectionEquality().equals(other._trend, _trend));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      totalDevices,
      totalPortfolioValue,
      totalBookValue,
      totalDepreciation,
      depreciationPct,
      avgAssetAgeMonths,
      assetsAtRisk,
      const DeepCollectionEquality().hash(_byType),
      const DeepCollectionEquality().hash(_byCondition),
      const DeepCollectionEquality().hash(_trend));

  /// Create a copy of PortfolioSummary
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PortfolioSummaryImplCopyWith<_$PortfolioSummaryImpl> get copyWith =>
      __$$PortfolioSummaryImplCopyWithImpl<_$PortfolioSummaryImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PortfolioSummaryImplToJson(
      this,
    );
  }
}

abstract class _PortfolioSummary implements PortfolioSummary {
  const factory _PortfolioSummary(
      {required final int totalDevices,
      required final double totalPortfolioValue,
      required final double totalBookValue,
      required final double totalDepreciation,
      required final double depreciationPct,
      required final double avgAssetAgeMonths,
      required final int assetsAtRisk,
      required final Map<String, PortfolioBucket> byType,
      required final Map<String, PortfolioBucket> byCondition,
      required final List<ValuationSnapshot> trend}) = _$PortfolioSummaryImpl;

  factory _PortfolioSummary.fromJson(Map<String, dynamic> json) =
      _$PortfolioSummaryImpl.fromJson;

  @override
  int get totalDevices;
  @override
  double get totalPortfolioValue;
  @override
  double get totalBookValue;
  @override
  double get totalDepreciation;
  @override
  double get depreciationPct;
  @override
  double get avgAssetAgeMonths;
  @override
  int get assetsAtRisk;
  @override
  Map<String, PortfolioBucket> get byType;
  @override
  Map<String, PortfolioBucket> get byCondition;
  @override
  List<ValuationSnapshot> get trend;

  /// Create a copy of PortfolioSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PortfolioSummaryImplCopyWith<_$PortfolioSummaryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
