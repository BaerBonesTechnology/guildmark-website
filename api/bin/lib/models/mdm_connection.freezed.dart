// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'mdm_connection.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$MdmConnection {

 String get id; String get companyId; String get mdmType; bool get syncEnabled;@IsoDateTimeConverter() DateTime get createdAt;@NullableIsoDateTimeConverter() DateTime? get lastSyncAt; String? get lastSyncStatus; int? get deviceCount;
/// Create a copy of MdmConnection
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MdmConnectionCopyWith<MdmConnection> get copyWith => _$MdmConnectionCopyWithImpl<MdmConnection>(this as MdmConnection, _$identity);

  /// Serializes this MdmConnection to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MdmConnection&&(identical(other.id, id) || other.id == id)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.mdmType, mdmType) || other.mdmType == mdmType)&&(identical(other.syncEnabled, syncEnabled) || other.syncEnabled == syncEnabled)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.lastSyncAt, lastSyncAt) || other.lastSyncAt == lastSyncAt)&&(identical(other.lastSyncStatus, lastSyncStatus) || other.lastSyncStatus == lastSyncStatus)&&(identical(other.deviceCount, deviceCount) || other.deviceCount == deviceCount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,companyId,mdmType,syncEnabled,createdAt,lastSyncAt,lastSyncStatus,deviceCount);

@override
String toString() {
  return 'MdmConnection(id: $id, companyId: $companyId, mdmType: $mdmType, syncEnabled: $syncEnabled, createdAt: $createdAt, lastSyncAt: $lastSyncAt, lastSyncStatus: $lastSyncStatus, deviceCount: $deviceCount)';
}


}

/// @nodoc
abstract mixin class $MdmConnectionCopyWith<$Res>  {
  factory $MdmConnectionCopyWith(MdmConnection value, $Res Function(MdmConnection) _then) = _$MdmConnectionCopyWithImpl;
@useResult
$Res call({
 String id, String companyId, String mdmType, bool syncEnabled,@IsoDateTimeConverter() DateTime createdAt,@NullableIsoDateTimeConverter() DateTime? lastSyncAt, String? lastSyncStatus, int? deviceCount
});




}
/// @nodoc
class _$MdmConnectionCopyWithImpl<$Res>
    implements $MdmConnectionCopyWith<$Res> {
  _$MdmConnectionCopyWithImpl(this._self, this._then);

  final MdmConnection _self;
  final $Res Function(MdmConnection) _then;

/// Create a copy of MdmConnection
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? companyId = null,Object? mdmType = null,Object? syncEnabled = null,Object? createdAt = null,Object? lastSyncAt = freezed,Object? lastSyncStatus = freezed,Object? deviceCount = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,companyId: null == companyId ? _self.companyId : companyId // ignore: cast_nullable_to_non_nullable
as String,mdmType: null == mdmType ? _self.mdmType : mdmType // ignore: cast_nullable_to_non_nullable
as String,syncEnabled: null == syncEnabled ? _self.syncEnabled : syncEnabled // ignore: cast_nullable_to_non_nullable
as bool,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,lastSyncAt: freezed == lastSyncAt ? _self.lastSyncAt : lastSyncAt // ignore: cast_nullable_to_non_nullable
as DateTime?,lastSyncStatus: freezed == lastSyncStatus ? _self.lastSyncStatus : lastSyncStatus // ignore: cast_nullable_to_non_nullable
as String?,deviceCount: freezed == deviceCount ? _self.deviceCount : deviceCount // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [MdmConnection].
extension MdmConnectionPatterns on MdmConnection {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MdmConnection value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MdmConnection() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MdmConnection value)  $default,){
final _that = this;
switch (_that) {
case _MdmConnection():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MdmConnection value)?  $default,){
final _that = this;
switch (_that) {
case _MdmConnection() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String companyId,  String mdmType,  bool syncEnabled, @IsoDateTimeConverter()  DateTime createdAt, @NullableIsoDateTimeConverter()  DateTime? lastSyncAt,  String? lastSyncStatus,  int? deviceCount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MdmConnection() when $default != null:
return $default(_that.id,_that.companyId,_that.mdmType,_that.syncEnabled,_that.createdAt,_that.lastSyncAt,_that.lastSyncStatus,_that.deviceCount);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String companyId,  String mdmType,  bool syncEnabled, @IsoDateTimeConverter()  DateTime createdAt, @NullableIsoDateTimeConverter()  DateTime? lastSyncAt,  String? lastSyncStatus,  int? deviceCount)  $default,) {final _that = this;
switch (_that) {
case _MdmConnection():
return $default(_that.id,_that.companyId,_that.mdmType,_that.syncEnabled,_that.createdAt,_that.lastSyncAt,_that.lastSyncStatus,_that.deviceCount);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String companyId,  String mdmType,  bool syncEnabled, @IsoDateTimeConverter()  DateTime createdAt, @NullableIsoDateTimeConverter()  DateTime? lastSyncAt,  String? lastSyncStatus,  int? deviceCount)?  $default,) {final _that = this;
switch (_that) {
case _MdmConnection() when $default != null:
return $default(_that.id,_that.companyId,_that.mdmType,_that.syncEnabled,_that.createdAt,_that.lastSyncAt,_that.lastSyncStatus,_that.deviceCount);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MdmConnection extends MdmConnection {
  const _MdmConnection({required this.id, required this.companyId, required this.mdmType, required this.syncEnabled, @IsoDateTimeConverter() required this.createdAt, @NullableIsoDateTimeConverter() this.lastSyncAt, this.lastSyncStatus, this.deviceCount}): super._();
  factory _MdmConnection.fromJson(Map<String, dynamic> json) => _$MdmConnectionFromJson(json);

@override final  String id;
@override final  String companyId;
@override final  String mdmType;
@override final  bool syncEnabled;
@override@IsoDateTimeConverter() final  DateTime createdAt;
@override@NullableIsoDateTimeConverter() final  DateTime? lastSyncAt;
@override final  String? lastSyncStatus;
@override final  int? deviceCount;

/// Create a copy of MdmConnection
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MdmConnectionCopyWith<_MdmConnection> get copyWith => __$MdmConnectionCopyWithImpl<_MdmConnection>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MdmConnectionToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MdmConnection&&(identical(other.id, id) || other.id == id)&&(identical(other.companyId, companyId) || other.companyId == companyId)&&(identical(other.mdmType, mdmType) || other.mdmType == mdmType)&&(identical(other.syncEnabled, syncEnabled) || other.syncEnabled == syncEnabled)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.lastSyncAt, lastSyncAt) || other.lastSyncAt == lastSyncAt)&&(identical(other.lastSyncStatus, lastSyncStatus) || other.lastSyncStatus == lastSyncStatus)&&(identical(other.deviceCount, deviceCount) || other.deviceCount == deviceCount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,companyId,mdmType,syncEnabled,createdAt,lastSyncAt,lastSyncStatus,deviceCount);

@override
String toString() {
  return 'MdmConnection(id: $id, companyId: $companyId, mdmType: $mdmType, syncEnabled: $syncEnabled, createdAt: $createdAt, lastSyncAt: $lastSyncAt, lastSyncStatus: $lastSyncStatus, deviceCount: $deviceCount)';
}


}

/// @nodoc
abstract mixin class _$MdmConnectionCopyWith<$Res> implements $MdmConnectionCopyWith<$Res> {
  factory _$MdmConnectionCopyWith(_MdmConnection value, $Res Function(_MdmConnection) _then) = __$MdmConnectionCopyWithImpl;
@override @useResult
$Res call({
 String id, String companyId, String mdmType, bool syncEnabled,@IsoDateTimeConverter() DateTime createdAt,@NullableIsoDateTimeConverter() DateTime? lastSyncAt, String? lastSyncStatus, int? deviceCount
});




}
/// @nodoc
class __$MdmConnectionCopyWithImpl<$Res>
    implements _$MdmConnectionCopyWith<$Res> {
  __$MdmConnectionCopyWithImpl(this._self, this._then);

  final _MdmConnection _self;
  final $Res Function(_MdmConnection) _then;

/// Create a copy of MdmConnection
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? companyId = null,Object? mdmType = null,Object? syncEnabled = null,Object? createdAt = null,Object? lastSyncAt = freezed,Object? lastSyncStatus = freezed,Object? deviceCount = freezed,}) {
  return _then(_MdmConnection(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,companyId: null == companyId ? _self.companyId : companyId // ignore: cast_nullable_to_non_nullable
as String,mdmType: null == mdmType ? _self.mdmType : mdmType // ignore: cast_nullable_to_non_nullable
as String,syncEnabled: null == syncEnabled ? _self.syncEnabled : syncEnabled // ignore: cast_nullable_to_non_nullable
as bool,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,lastSyncAt: freezed == lastSyncAt ? _self.lastSyncAt : lastSyncAt // ignore: cast_nullable_to_non_nullable
as DateTime?,lastSyncStatus: freezed == lastSyncStatus ? _self.lastSyncStatus : lastSyncStatus // ignore: cast_nullable_to_non_nullable
as String?,deviceCount: freezed == deviceCount ? _self.deviceCount : deviceCount // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}

// dart format on
