// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'portfolio.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ValuationSnapshot {

@DateOnlyConverter() DateTime get snapshotDate; double get totalPortfolioValue; double get totalBookValue; double get totalDepreciation; int get totalDevices;
/// Create a copy of ValuationSnapshot
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ValuationSnapshotCopyWith<ValuationSnapshot> get copyWith => _$ValuationSnapshotCopyWithImpl<ValuationSnapshot>(this as ValuationSnapshot, _$identity);

  /// Serializes this ValuationSnapshot to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ValuationSnapshot&&(identical(other.snapshotDate, snapshotDate) || other.snapshotDate == snapshotDate)&&(identical(other.totalPortfolioValue, totalPortfolioValue) || other.totalPortfolioValue == totalPortfolioValue)&&(identical(other.totalBookValue, totalBookValue) || other.totalBookValue == totalBookValue)&&(identical(other.totalDepreciation, totalDepreciation) || other.totalDepreciation == totalDepreciation)&&(identical(other.totalDevices, totalDevices) || other.totalDevices == totalDevices));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,snapshotDate,totalPortfolioValue,totalBookValue,totalDepreciation,totalDevices);

@override
String toString() {
  return 'ValuationSnapshot(snapshotDate: $snapshotDate, totalPortfolioValue: $totalPortfolioValue, totalBookValue: $totalBookValue, totalDepreciation: $totalDepreciation, totalDevices: $totalDevices)';
}


}

/// @nodoc
abstract mixin class $ValuationSnapshotCopyWith<$Res>  {
  factory $ValuationSnapshotCopyWith(ValuationSnapshot value, $Res Function(ValuationSnapshot) _then) = _$ValuationSnapshotCopyWithImpl;
@useResult
$Res call({
@DateOnlyConverter() DateTime snapshotDate, double totalPortfolioValue, double totalBookValue, double totalDepreciation, int totalDevices
});




}
/// @nodoc
class _$ValuationSnapshotCopyWithImpl<$Res>
    implements $ValuationSnapshotCopyWith<$Res> {
  _$ValuationSnapshotCopyWithImpl(this._self, this._then);

  final ValuationSnapshot _self;
  final $Res Function(ValuationSnapshot) _then;

/// Create a copy of ValuationSnapshot
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? snapshotDate = null,Object? totalPortfolioValue = null,Object? totalBookValue = null,Object? totalDepreciation = null,Object? totalDevices = null,}) {
  return _then(_self.copyWith(
snapshotDate: null == snapshotDate ? _self.snapshotDate : snapshotDate // ignore: cast_nullable_to_non_nullable
as DateTime,totalPortfolioValue: null == totalPortfolioValue ? _self.totalPortfolioValue : totalPortfolioValue // ignore: cast_nullable_to_non_nullable
as double,totalBookValue: null == totalBookValue ? _self.totalBookValue : totalBookValue // ignore: cast_nullable_to_non_nullable
as double,totalDepreciation: null == totalDepreciation ? _self.totalDepreciation : totalDepreciation // ignore: cast_nullable_to_non_nullable
as double,totalDevices: null == totalDevices ? _self.totalDevices : totalDevices // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [ValuationSnapshot].
extension ValuationSnapshotPatterns on ValuationSnapshot {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ValuationSnapshot value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ValuationSnapshot() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ValuationSnapshot value)  $default,){
final _that = this;
switch (_that) {
case _ValuationSnapshot():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ValuationSnapshot value)?  $default,){
final _that = this;
switch (_that) {
case _ValuationSnapshot() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@DateOnlyConverter()  DateTime snapshotDate,  double totalPortfolioValue,  double totalBookValue,  double totalDepreciation,  int totalDevices)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ValuationSnapshot() when $default != null:
return $default(_that.snapshotDate,_that.totalPortfolioValue,_that.totalBookValue,_that.totalDepreciation,_that.totalDevices);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@DateOnlyConverter()  DateTime snapshotDate,  double totalPortfolioValue,  double totalBookValue,  double totalDepreciation,  int totalDevices)  $default,) {final _that = this;
switch (_that) {
case _ValuationSnapshot():
return $default(_that.snapshotDate,_that.totalPortfolioValue,_that.totalBookValue,_that.totalDepreciation,_that.totalDevices);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@DateOnlyConverter()  DateTime snapshotDate,  double totalPortfolioValue,  double totalBookValue,  double totalDepreciation,  int totalDevices)?  $default,) {final _that = this;
switch (_that) {
case _ValuationSnapshot() when $default != null:
return $default(_that.snapshotDate,_that.totalPortfolioValue,_that.totalBookValue,_that.totalDepreciation,_that.totalDevices);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ValuationSnapshot extends ValuationSnapshot {
  const _ValuationSnapshot({@DateOnlyConverter() required this.snapshotDate, required this.totalPortfolioValue, required this.totalBookValue, required this.totalDepreciation, required this.totalDevices}): super._();
  factory _ValuationSnapshot.fromJson(Map<String, dynamic> json) => _$ValuationSnapshotFromJson(json);

@override@DateOnlyConverter() final  DateTime snapshotDate;
@override final  double totalPortfolioValue;
@override final  double totalBookValue;
@override final  double totalDepreciation;
@override final  int totalDevices;

/// Create a copy of ValuationSnapshot
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ValuationSnapshotCopyWith<_ValuationSnapshot> get copyWith => __$ValuationSnapshotCopyWithImpl<_ValuationSnapshot>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ValuationSnapshotToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ValuationSnapshot&&(identical(other.snapshotDate, snapshotDate) || other.snapshotDate == snapshotDate)&&(identical(other.totalPortfolioValue, totalPortfolioValue) || other.totalPortfolioValue == totalPortfolioValue)&&(identical(other.totalBookValue, totalBookValue) || other.totalBookValue == totalBookValue)&&(identical(other.totalDepreciation, totalDepreciation) || other.totalDepreciation == totalDepreciation)&&(identical(other.totalDevices, totalDevices) || other.totalDevices == totalDevices));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,snapshotDate,totalPortfolioValue,totalBookValue,totalDepreciation,totalDevices);

@override
String toString() {
  return 'ValuationSnapshot(snapshotDate: $snapshotDate, totalPortfolioValue: $totalPortfolioValue, totalBookValue: $totalBookValue, totalDepreciation: $totalDepreciation, totalDevices: $totalDevices)';
}


}

/// @nodoc
abstract mixin class _$ValuationSnapshotCopyWith<$Res> implements $ValuationSnapshotCopyWith<$Res> {
  factory _$ValuationSnapshotCopyWith(_ValuationSnapshot value, $Res Function(_ValuationSnapshot) _then) = __$ValuationSnapshotCopyWithImpl;
@override @useResult
$Res call({
@DateOnlyConverter() DateTime snapshotDate, double totalPortfolioValue, double totalBookValue, double totalDepreciation, int totalDevices
});




}
/// @nodoc
class __$ValuationSnapshotCopyWithImpl<$Res>
    implements _$ValuationSnapshotCopyWith<$Res> {
  __$ValuationSnapshotCopyWithImpl(this._self, this._then);

  final _ValuationSnapshot _self;
  final $Res Function(_ValuationSnapshot) _then;

/// Create a copy of ValuationSnapshot
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? snapshotDate = null,Object? totalPortfolioValue = null,Object? totalBookValue = null,Object? totalDepreciation = null,Object? totalDevices = null,}) {
  return _then(_ValuationSnapshot(
snapshotDate: null == snapshotDate ? _self.snapshotDate : snapshotDate // ignore: cast_nullable_to_non_nullable
as DateTime,totalPortfolioValue: null == totalPortfolioValue ? _self.totalPortfolioValue : totalPortfolioValue // ignore: cast_nullable_to_non_nullable
as double,totalBookValue: null == totalBookValue ? _self.totalBookValue : totalBookValue // ignore: cast_nullable_to_non_nullable
as double,totalDepreciation: null == totalDepreciation ? _self.totalDepreciation : totalDepreciation // ignore: cast_nullable_to_non_nullable
as double,totalDevices: null == totalDevices ? _self.totalDevices : totalDevices // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$PortfolioBucket {

 int get count; double get value;
/// Create a copy of PortfolioBucket
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PortfolioBucketCopyWith<PortfolioBucket> get copyWith => _$PortfolioBucketCopyWithImpl<PortfolioBucket>(this as PortfolioBucket, _$identity);

  /// Serializes this PortfolioBucket to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PortfolioBucket&&(identical(other.count, count) || other.count == count)&&(identical(other.value, value) || other.value == value));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,count,value);

@override
String toString() {
  return 'PortfolioBucket(count: $count, value: $value)';
}


}

/// @nodoc
abstract mixin class $PortfolioBucketCopyWith<$Res>  {
  factory $PortfolioBucketCopyWith(PortfolioBucket value, $Res Function(PortfolioBucket) _then) = _$PortfolioBucketCopyWithImpl;
@useResult
$Res call({
 int count, double value
});




}
/// @nodoc
class _$PortfolioBucketCopyWithImpl<$Res>
    implements $PortfolioBucketCopyWith<$Res> {
  _$PortfolioBucketCopyWithImpl(this._self, this._then);

  final PortfolioBucket _self;
  final $Res Function(PortfolioBucket) _then;

/// Create a copy of PortfolioBucket
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? count = null,Object? value = null,}) {
  return _then(_self.copyWith(
count: null == count ? _self.count : count // ignore: cast_nullable_to_non_nullable
as int,value: null == value ? _self.value : value // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [PortfolioBucket].
extension PortfolioBucketPatterns on PortfolioBucket {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PortfolioBucket value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PortfolioBucket() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PortfolioBucket value)  $default,){
final _that = this;
switch (_that) {
case _PortfolioBucket():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PortfolioBucket value)?  $default,){
final _that = this;
switch (_that) {
case _PortfolioBucket() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int count,  double value)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PortfolioBucket() when $default != null:
return $default(_that.count,_that.value);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int count,  double value)  $default,) {final _that = this;
switch (_that) {
case _PortfolioBucket():
return $default(_that.count,_that.value);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int count,  double value)?  $default,) {final _that = this;
switch (_that) {
case _PortfolioBucket() when $default != null:
return $default(_that.count,_that.value);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PortfolioBucket implements PortfolioBucket {
  const _PortfolioBucket({required this.count, required this.value});
  factory _PortfolioBucket.fromJson(Map<String, dynamic> json) => _$PortfolioBucketFromJson(json);

@override final  int count;
@override final  double value;

/// Create a copy of PortfolioBucket
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PortfolioBucketCopyWith<_PortfolioBucket> get copyWith => __$PortfolioBucketCopyWithImpl<_PortfolioBucket>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PortfolioBucketToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PortfolioBucket&&(identical(other.count, count) || other.count == count)&&(identical(other.value, value) || other.value == value));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,count,value);

@override
String toString() {
  return 'PortfolioBucket(count: $count, value: $value)';
}


}

/// @nodoc
abstract mixin class _$PortfolioBucketCopyWith<$Res> implements $PortfolioBucketCopyWith<$Res> {
  factory _$PortfolioBucketCopyWith(_PortfolioBucket value, $Res Function(_PortfolioBucket) _then) = __$PortfolioBucketCopyWithImpl;
@override @useResult
$Res call({
 int count, double value
});




}
/// @nodoc
class __$PortfolioBucketCopyWithImpl<$Res>
    implements _$PortfolioBucketCopyWith<$Res> {
  __$PortfolioBucketCopyWithImpl(this._self, this._then);

  final _PortfolioBucket _self;
  final $Res Function(_PortfolioBucket) _then;

/// Create a copy of PortfolioBucket
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? count = null,Object? value = null,}) {
  return _then(_PortfolioBucket(
count: null == count ? _self.count : count // ignore: cast_nullable_to_non_nullable
as int,value: null == value ? _self.value : value // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}


/// @nodoc
mixin _$PortfolioSummary {

 int get totalDevices; double get totalPortfolioValue; double get totalBookValue; double get totalDepreciation; double get depreciationPct; double get avgAssetAgeMonths; int get assetsAtRisk; Map<String, PortfolioBucket> get byType; Map<String, PortfolioBucket> get byCondition; List<ValuationSnapshot> get trend;
/// Create a copy of PortfolioSummary
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PortfolioSummaryCopyWith<PortfolioSummary> get copyWith => _$PortfolioSummaryCopyWithImpl<PortfolioSummary>(this as PortfolioSummary, _$identity);

  /// Serializes this PortfolioSummary to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PortfolioSummary&&(identical(other.totalDevices, totalDevices) || other.totalDevices == totalDevices)&&(identical(other.totalPortfolioValue, totalPortfolioValue) || other.totalPortfolioValue == totalPortfolioValue)&&(identical(other.totalBookValue, totalBookValue) || other.totalBookValue == totalBookValue)&&(identical(other.totalDepreciation, totalDepreciation) || other.totalDepreciation == totalDepreciation)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.avgAssetAgeMonths, avgAssetAgeMonths) || other.avgAssetAgeMonths == avgAssetAgeMonths)&&(identical(other.assetsAtRisk, assetsAtRisk) || other.assetsAtRisk == assetsAtRisk)&&const DeepCollectionEquality().equals(other.byType, byType)&&const DeepCollectionEquality().equals(other.byCondition, byCondition)&&const DeepCollectionEquality().equals(other.trend, trend));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,totalDevices,totalPortfolioValue,totalBookValue,totalDepreciation,depreciationPct,avgAssetAgeMonths,assetsAtRisk,const DeepCollectionEquality().hash(byType),const DeepCollectionEquality().hash(byCondition),const DeepCollectionEquality().hash(trend));

@override
String toString() {
  return 'PortfolioSummary(totalDevices: $totalDevices, totalPortfolioValue: $totalPortfolioValue, totalBookValue: $totalBookValue, totalDepreciation: $totalDepreciation, depreciationPct: $depreciationPct, avgAssetAgeMonths: $avgAssetAgeMonths, assetsAtRisk: $assetsAtRisk, byType: $byType, byCondition: $byCondition, trend: $trend)';
}


}

/// @nodoc
abstract mixin class $PortfolioSummaryCopyWith<$Res>  {
  factory $PortfolioSummaryCopyWith(PortfolioSummary value, $Res Function(PortfolioSummary) _then) = _$PortfolioSummaryCopyWithImpl;
@useResult
$Res call({
 int totalDevices, double totalPortfolioValue, double totalBookValue, double totalDepreciation, double depreciationPct, double avgAssetAgeMonths, int assetsAtRisk, Map<String, PortfolioBucket> byType, Map<String, PortfolioBucket> byCondition, List<ValuationSnapshot> trend
});




}
/// @nodoc
class _$PortfolioSummaryCopyWithImpl<$Res>
    implements $PortfolioSummaryCopyWith<$Res> {
  _$PortfolioSummaryCopyWithImpl(this._self, this._then);

  final PortfolioSummary _self;
  final $Res Function(PortfolioSummary) _then;

/// Create a copy of PortfolioSummary
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? totalDevices = null,Object? totalPortfolioValue = null,Object? totalBookValue = null,Object? totalDepreciation = null,Object? depreciationPct = null,Object? avgAssetAgeMonths = null,Object? assetsAtRisk = null,Object? byType = null,Object? byCondition = null,Object? trend = null,}) {
  return _then(_self.copyWith(
totalDevices: null == totalDevices ? _self.totalDevices : totalDevices // ignore: cast_nullable_to_non_nullable
as int,totalPortfolioValue: null == totalPortfolioValue ? _self.totalPortfolioValue : totalPortfolioValue // ignore: cast_nullable_to_non_nullable
as double,totalBookValue: null == totalBookValue ? _self.totalBookValue : totalBookValue // ignore: cast_nullable_to_non_nullable
as double,totalDepreciation: null == totalDepreciation ? _self.totalDepreciation : totalDepreciation // ignore: cast_nullable_to_non_nullable
as double,depreciationPct: null == depreciationPct ? _self.depreciationPct : depreciationPct // ignore: cast_nullable_to_non_nullable
as double,avgAssetAgeMonths: null == avgAssetAgeMonths ? _self.avgAssetAgeMonths : avgAssetAgeMonths // ignore: cast_nullable_to_non_nullable
as double,assetsAtRisk: null == assetsAtRisk ? _self.assetsAtRisk : assetsAtRisk // ignore: cast_nullable_to_non_nullable
as int,byType: null == byType ? _self.byType : byType // ignore: cast_nullable_to_non_nullable
as Map<String, PortfolioBucket>,byCondition: null == byCondition ? _self.byCondition : byCondition // ignore: cast_nullable_to_non_nullable
as Map<String, PortfolioBucket>,trend: null == trend ? _self.trend : trend // ignore: cast_nullable_to_non_nullable
as List<ValuationSnapshot>,
  ));
}

}


/// Adds pattern-matching-related methods to [PortfolioSummary].
extension PortfolioSummaryPatterns on PortfolioSummary {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PortfolioSummary value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PortfolioSummary() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PortfolioSummary value)  $default,){
final _that = this;
switch (_that) {
case _PortfolioSummary():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PortfolioSummary value)?  $default,){
final _that = this;
switch (_that) {
case _PortfolioSummary() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int totalDevices,  double totalPortfolioValue,  double totalBookValue,  double totalDepreciation,  double depreciationPct,  double avgAssetAgeMonths,  int assetsAtRisk,  Map<String, PortfolioBucket> byType,  Map<String, PortfolioBucket> byCondition,  List<ValuationSnapshot> trend)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PortfolioSummary() when $default != null:
return $default(_that.totalDevices,_that.totalPortfolioValue,_that.totalBookValue,_that.totalDepreciation,_that.depreciationPct,_that.avgAssetAgeMonths,_that.assetsAtRisk,_that.byType,_that.byCondition,_that.trend);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int totalDevices,  double totalPortfolioValue,  double totalBookValue,  double totalDepreciation,  double depreciationPct,  double avgAssetAgeMonths,  int assetsAtRisk,  Map<String, PortfolioBucket> byType,  Map<String, PortfolioBucket> byCondition,  List<ValuationSnapshot> trend)  $default,) {final _that = this;
switch (_that) {
case _PortfolioSummary():
return $default(_that.totalDevices,_that.totalPortfolioValue,_that.totalBookValue,_that.totalDepreciation,_that.depreciationPct,_that.avgAssetAgeMonths,_that.assetsAtRisk,_that.byType,_that.byCondition,_that.trend);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int totalDevices,  double totalPortfolioValue,  double totalBookValue,  double totalDepreciation,  double depreciationPct,  double avgAssetAgeMonths,  int assetsAtRisk,  Map<String, PortfolioBucket> byType,  Map<String, PortfolioBucket> byCondition,  List<ValuationSnapshot> trend)?  $default,) {final _that = this;
switch (_that) {
case _PortfolioSummary() when $default != null:
return $default(_that.totalDevices,_that.totalPortfolioValue,_that.totalBookValue,_that.totalDepreciation,_that.depreciationPct,_that.avgAssetAgeMonths,_that.assetsAtRisk,_that.byType,_that.byCondition,_that.trend);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PortfolioSummary implements PortfolioSummary {
  const _PortfolioSummary({required this.totalDevices, required this.totalPortfolioValue, required this.totalBookValue, required this.totalDepreciation, required this.depreciationPct, required this.avgAssetAgeMonths, required this.assetsAtRisk, required final  Map<String, PortfolioBucket> byType, required final  Map<String, PortfolioBucket> byCondition, required final  List<ValuationSnapshot> trend}): _byType = byType,_byCondition = byCondition,_trend = trend;
  factory _PortfolioSummary.fromJson(Map<String, dynamic> json) => _$PortfolioSummaryFromJson(json);

@override final  int totalDevices;
@override final  double totalPortfolioValue;
@override final  double totalBookValue;
@override final  double totalDepreciation;
@override final  double depreciationPct;
@override final  double avgAssetAgeMonths;
@override final  int assetsAtRisk;
 final  Map<String, PortfolioBucket> _byType;
@override Map<String, PortfolioBucket> get byType {
  if (_byType is EqualUnmodifiableMapView) return _byType;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(_byType);
}

 final  Map<String, PortfolioBucket> _byCondition;
@override Map<String, PortfolioBucket> get byCondition {
  if (_byCondition is EqualUnmodifiableMapView) return _byCondition;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(_byCondition);
}

 final  List<ValuationSnapshot> _trend;
@override List<ValuationSnapshot> get trend {
  if (_trend is EqualUnmodifiableListView) return _trend;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_trend);
}


/// Create a copy of PortfolioSummary
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PortfolioSummaryCopyWith<_PortfolioSummary> get copyWith => __$PortfolioSummaryCopyWithImpl<_PortfolioSummary>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PortfolioSummaryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PortfolioSummary&&(identical(other.totalDevices, totalDevices) || other.totalDevices == totalDevices)&&(identical(other.totalPortfolioValue, totalPortfolioValue) || other.totalPortfolioValue == totalPortfolioValue)&&(identical(other.totalBookValue, totalBookValue) || other.totalBookValue == totalBookValue)&&(identical(other.totalDepreciation, totalDepreciation) || other.totalDepreciation == totalDepreciation)&&(identical(other.depreciationPct, depreciationPct) || other.depreciationPct == depreciationPct)&&(identical(other.avgAssetAgeMonths, avgAssetAgeMonths) || other.avgAssetAgeMonths == avgAssetAgeMonths)&&(identical(other.assetsAtRisk, assetsAtRisk) || other.assetsAtRisk == assetsAtRisk)&&const DeepCollectionEquality().equals(other._byType, _byType)&&const DeepCollectionEquality().equals(other._byCondition, _byCondition)&&const DeepCollectionEquality().equals(other._trend, _trend));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,totalDevices,totalPortfolioValue,totalBookValue,totalDepreciation,depreciationPct,avgAssetAgeMonths,assetsAtRisk,const DeepCollectionEquality().hash(_byType),const DeepCollectionEquality().hash(_byCondition),const DeepCollectionEquality().hash(_trend));

@override
String toString() {
  return 'PortfolioSummary(totalDevices: $totalDevices, totalPortfolioValue: $totalPortfolioValue, totalBookValue: $totalBookValue, totalDepreciation: $totalDepreciation, depreciationPct: $depreciationPct, avgAssetAgeMonths: $avgAssetAgeMonths, assetsAtRisk: $assetsAtRisk, byType: $byType, byCondition: $byCondition, trend: $trend)';
}


}

/// @nodoc
abstract mixin class _$PortfolioSummaryCopyWith<$Res> implements $PortfolioSummaryCopyWith<$Res> {
  factory _$PortfolioSummaryCopyWith(_PortfolioSummary value, $Res Function(_PortfolioSummary) _then) = __$PortfolioSummaryCopyWithImpl;
@override @useResult
$Res call({
 int totalDevices, double totalPortfolioValue, double totalBookValue, double totalDepreciation, double depreciationPct, double avgAssetAgeMonths, int assetsAtRisk, Map<String, PortfolioBucket> byType, Map<String, PortfolioBucket> byCondition, List<ValuationSnapshot> trend
});




}
/// @nodoc
class __$PortfolioSummaryCopyWithImpl<$Res>
    implements _$PortfolioSummaryCopyWith<$Res> {
  __$PortfolioSummaryCopyWithImpl(this._self, this._then);

  final _PortfolioSummary _self;
  final $Res Function(_PortfolioSummary) _then;

/// Create a copy of PortfolioSummary
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? totalDevices = null,Object? totalPortfolioValue = null,Object? totalBookValue = null,Object? totalDepreciation = null,Object? depreciationPct = null,Object? avgAssetAgeMonths = null,Object? assetsAtRisk = null,Object? byType = null,Object? byCondition = null,Object? trend = null,}) {
  return _then(_PortfolioSummary(
totalDevices: null == totalDevices ? _self.totalDevices : totalDevices // ignore: cast_nullable_to_non_nullable
as int,totalPortfolioValue: null == totalPortfolioValue ? _self.totalPortfolioValue : totalPortfolioValue // ignore: cast_nullable_to_non_nullable
as double,totalBookValue: null == totalBookValue ? _self.totalBookValue : totalBookValue // ignore: cast_nullable_to_non_nullable
as double,totalDepreciation: null == totalDepreciation ? _self.totalDepreciation : totalDepreciation // ignore: cast_nullable_to_non_nullable
as double,depreciationPct: null == depreciationPct ? _self.depreciationPct : depreciationPct // ignore: cast_nullable_to_non_nullable
as double,avgAssetAgeMonths: null == avgAssetAgeMonths ? _self.avgAssetAgeMonths : avgAssetAgeMonths // ignore: cast_nullable_to_non_nullable
as double,assetsAtRisk: null == assetsAtRisk ? _self.assetsAtRisk : assetsAtRisk // ignore: cast_nullable_to_non_nullable
as int,byType: null == byType ? _self._byType : byType // ignore: cast_nullable_to_non_nullable
as Map<String, PortfolioBucket>,byCondition: null == byCondition ? _self._byCondition : byCondition // ignore: cast_nullable_to_non_nullable
as Map<String, PortfolioBucket>,trend: null == trend ? _self._trend : trend // ignore: cast_nullable_to_non_nullable
as List<ValuationSnapshot>,
  ));
}


}

// dart format on
