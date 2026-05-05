// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'mdm_connection.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

MdmConnection _$MdmConnectionFromJson(Map<String, dynamic> json) {
  return _MdmConnection.fromJson(json);
}

/// @nodoc
mixin _$MdmConnection {
  String get id => throw _privateConstructorUsedError;
  String get companyId => throw _privateConstructorUsedError;
  String get mdmType => throw _privateConstructorUsedError;
  bool get syncEnabled => throw _privateConstructorUsedError;
  @IsoDateTimeConverter()
  DateTime get createdAt => throw _privateConstructorUsedError;
  @NullableIsoDateTimeConverter()
  DateTime? get lastSyncAt => throw _privateConstructorUsedError;
  String? get lastSyncStatus => throw _privateConstructorUsedError;
  int? get deviceCount => throw _privateConstructorUsedError;

  /// Serializes this MdmConnection to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MdmConnection
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MdmConnectionCopyWith<MdmConnection> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MdmConnectionCopyWith<$Res> {
  factory $MdmConnectionCopyWith(
          MdmConnection value, $Res Function(MdmConnection) then) =
      _$MdmConnectionCopyWithImpl<$Res, MdmConnection>;
  @useResult
  $Res call(
      {String id,
      String companyId,
      String mdmType,
      bool syncEnabled,
      @IsoDateTimeConverter() DateTime createdAt,
      @NullableIsoDateTimeConverter() DateTime? lastSyncAt,
      String? lastSyncStatus,
      int? deviceCount});
}

/// @nodoc
class _$MdmConnectionCopyWithImpl<$Res, $Val extends MdmConnection>
    implements $MdmConnectionCopyWith<$Res> {
  _$MdmConnectionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MdmConnection
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? companyId = null,
    Object? mdmType = null,
    Object? syncEnabled = null,
    Object? createdAt = null,
    Object? lastSyncAt = freezed,
    Object? lastSyncStatus = freezed,
    Object? deviceCount = freezed,
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
      mdmType: null == mdmType
          ? _value.mdmType
          : mdmType // ignore: cast_nullable_to_non_nullable
              as String,
      syncEnabled: null == syncEnabled
          ? _value.syncEnabled
          : syncEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      lastSyncAt: freezed == lastSyncAt
          ? _value.lastSyncAt
          : lastSyncAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      lastSyncStatus: freezed == lastSyncStatus
          ? _value.lastSyncStatus
          : lastSyncStatus // ignore: cast_nullable_to_non_nullable
              as String?,
      deviceCount: freezed == deviceCount
          ? _value.deviceCount
          : deviceCount // ignore: cast_nullable_to_non_nullable
              as int?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$MdmConnectionImplCopyWith<$Res>
    implements $MdmConnectionCopyWith<$Res> {
  factory _$$MdmConnectionImplCopyWith(
          _$MdmConnectionImpl value, $Res Function(_$MdmConnectionImpl) then) =
      __$$MdmConnectionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String companyId,
      String mdmType,
      bool syncEnabled,
      @IsoDateTimeConverter() DateTime createdAt,
      @NullableIsoDateTimeConverter() DateTime? lastSyncAt,
      String? lastSyncStatus,
      int? deviceCount});
}

/// @nodoc
class __$$MdmConnectionImplCopyWithImpl<$Res>
    extends _$MdmConnectionCopyWithImpl<$Res, _$MdmConnectionImpl>
    implements _$$MdmConnectionImplCopyWith<$Res> {
  __$$MdmConnectionImplCopyWithImpl(
      _$MdmConnectionImpl _value, $Res Function(_$MdmConnectionImpl) _then)
      : super(_value, _then);

  /// Create a copy of MdmConnection
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? companyId = null,
    Object? mdmType = null,
    Object? syncEnabled = null,
    Object? createdAt = null,
    Object? lastSyncAt = freezed,
    Object? lastSyncStatus = freezed,
    Object? deviceCount = freezed,
  }) {
    return _then(_$MdmConnectionImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      companyId: null == companyId
          ? _value.companyId
          : companyId // ignore: cast_nullable_to_non_nullable
              as String,
      mdmType: null == mdmType
          ? _value.mdmType
          : mdmType // ignore: cast_nullable_to_non_nullable
              as String,
      syncEnabled: null == syncEnabled
          ? _value.syncEnabled
          : syncEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      lastSyncAt: freezed == lastSyncAt
          ? _value.lastSyncAt
          : lastSyncAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      lastSyncStatus: freezed == lastSyncStatus
          ? _value.lastSyncStatus
          : lastSyncStatus // ignore: cast_nullable_to_non_nullable
              as String?,
      deviceCount: freezed == deviceCount
          ? _value.deviceCount
          : deviceCount // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$MdmConnectionImpl extends _MdmConnection {
  const _$MdmConnectionImpl(
      {required this.id,
      required this.companyId,
      required this.mdmType,
      required this.syncEnabled,
      @IsoDateTimeConverter() required this.createdAt,
      @NullableIsoDateTimeConverter() this.lastSyncAt,
      this.lastSyncStatus,
      this.deviceCount})
      : super._();

  factory _$MdmConnectionImpl.fromJson(Map<String, dynamic> json) =>
      _$$MdmConnectionImplFromJson(json);

  @override
  final String id;
  @override
  final String companyId;
  @override
  final String mdmType;
  @override
  final bool syncEnabled;
  @override
  @IsoDateTimeConverter()
  final DateTime createdAt;
  @override
  @NullableIsoDateTimeConverter()
  final DateTime? lastSyncAt;
  @override
  final String? lastSyncStatus;
  @override
  final int? deviceCount;

  @override
  String toString() {
    return 'MdmConnection(id: $id, companyId: $companyId, mdmType: $mdmType, syncEnabled: $syncEnabled, createdAt: $createdAt, lastSyncAt: $lastSyncAt, lastSyncStatus: $lastSyncStatus, deviceCount: $deviceCount)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MdmConnectionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.companyId, companyId) ||
                other.companyId == companyId) &&
            (identical(other.mdmType, mdmType) || other.mdmType == mdmType) &&
            (identical(other.syncEnabled, syncEnabled) ||
                other.syncEnabled == syncEnabled) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.lastSyncAt, lastSyncAt) ||
                other.lastSyncAt == lastSyncAt) &&
            (identical(other.lastSyncStatus, lastSyncStatus) ||
                other.lastSyncStatus == lastSyncStatus) &&
            (identical(other.deviceCount, deviceCount) ||
                other.deviceCount == deviceCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, companyId, mdmType,
      syncEnabled, createdAt, lastSyncAt, lastSyncStatus, deviceCount);

  /// Create a copy of MdmConnection
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MdmConnectionImplCopyWith<_$MdmConnectionImpl> get copyWith =>
      __$$MdmConnectionImplCopyWithImpl<_$MdmConnectionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MdmConnectionImplToJson(
      this,
    );
  }
}

abstract class _MdmConnection extends MdmConnection {
  const factory _MdmConnection(
      {required final String id,
      required final String companyId,
      required final String mdmType,
      required final bool syncEnabled,
      @IsoDateTimeConverter() required final DateTime createdAt,
      @NullableIsoDateTimeConverter() final DateTime? lastSyncAt,
      final String? lastSyncStatus,
      final int? deviceCount}) = _$MdmConnectionImpl;
  const _MdmConnection._() : super._();

  factory _MdmConnection.fromJson(Map<String, dynamic> json) =
      _$MdmConnectionImpl.fromJson;

  @override
  String get id;
  @override
  String get companyId;
  @override
  String get mdmType;
  @override
  bool get syncEnabled;
  @override
  @IsoDateTimeConverter()
  DateTime get createdAt;
  @override
  @NullableIsoDateTimeConverter()
  DateTime? get lastSyncAt;
  @override
  String? get lastSyncStatus;
  @override
  int? get deviceCount;

  /// Create a copy of MdmConnection
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MdmConnectionImplCopyWith<_$MdmConnectionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
