// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'invoice.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$TaxInvoice {

 String get id; String get invoiceNumber; String get invoiceType;@DateOnlyConverter() DateTime get invoiceDate; String get assetDescription; double get marketValueAtDisposal; double get writeOffAmount;@IsoDateTimeConverter() DateTime get generatedAt; String? get serialNumber; double? get originalCost; double? get bookValueAtDisposal; double? get marketAnchorEbay; String? get pdfStoragePath;// Joined from asset row
 String? get modelName;
/// Create a copy of TaxInvoice
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TaxInvoiceCopyWith<TaxInvoice> get copyWith => _$TaxInvoiceCopyWithImpl<TaxInvoice>(this as TaxInvoice, _$identity);

  /// Serializes this TaxInvoice to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TaxInvoice&&(identical(other.id, id) || other.id == id)&&(identical(other.invoiceNumber, invoiceNumber) || other.invoiceNumber == invoiceNumber)&&(identical(other.invoiceType, invoiceType) || other.invoiceType == invoiceType)&&(identical(other.invoiceDate, invoiceDate) || other.invoiceDate == invoiceDate)&&(identical(other.assetDescription, assetDescription) || other.assetDescription == assetDescription)&&(identical(other.marketValueAtDisposal, marketValueAtDisposal) || other.marketValueAtDisposal == marketValueAtDisposal)&&(identical(other.writeOffAmount, writeOffAmount) || other.writeOffAmount == writeOffAmount)&&(identical(other.generatedAt, generatedAt) || other.generatedAt == generatedAt)&&(identical(other.serialNumber, serialNumber) || other.serialNumber == serialNumber)&&(identical(other.originalCost, originalCost) || other.originalCost == originalCost)&&(identical(other.bookValueAtDisposal, bookValueAtDisposal) || other.bookValueAtDisposal == bookValueAtDisposal)&&(identical(other.marketAnchorEbay, marketAnchorEbay) || other.marketAnchorEbay == marketAnchorEbay)&&(identical(other.pdfStoragePath, pdfStoragePath) || other.pdfStoragePath == pdfStoragePath)&&(identical(other.modelName, modelName) || other.modelName == modelName));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,invoiceNumber,invoiceType,invoiceDate,assetDescription,marketValueAtDisposal,writeOffAmount,generatedAt,serialNumber,originalCost,bookValueAtDisposal,marketAnchorEbay,pdfStoragePath,modelName);

@override
String toString() {
  return 'TaxInvoice(id: $id, invoiceNumber: $invoiceNumber, invoiceType: $invoiceType, invoiceDate: $invoiceDate, assetDescription: $assetDescription, marketValueAtDisposal: $marketValueAtDisposal, writeOffAmount: $writeOffAmount, generatedAt: $generatedAt, serialNumber: $serialNumber, originalCost: $originalCost, bookValueAtDisposal: $bookValueAtDisposal, marketAnchorEbay: $marketAnchorEbay, pdfStoragePath: $pdfStoragePath, modelName: $modelName)';
}


}

/// @nodoc
abstract mixin class $TaxInvoiceCopyWith<$Res>  {
  factory $TaxInvoiceCopyWith(TaxInvoice value, $Res Function(TaxInvoice) _then) = _$TaxInvoiceCopyWithImpl;
@useResult
$Res call({
 String id, String invoiceNumber, String invoiceType,@DateOnlyConverter() DateTime invoiceDate, String assetDescription, double marketValueAtDisposal, double writeOffAmount,@IsoDateTimeConverter() DateTime generatedAt, String? serialNumber, double? originalCost, double? bookValueAtDisposal, double? marketAnchorEbay, String? pdfStoragePath, String? modelName
});




}
/// @nodoc
class _$TaxInvoiceCopyWithImpl<$Res>
    implements $TaxInvoiceCopyWith<$Res> {
  _$TaxInvoiceCopyWithImpl(this._self, this._then);

  final TaxInvoice _self;
  final $Res Function(TaxInvoice) _then;

/// Create a copy of TaxInvoice
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? invoiceNumber = null,Object? invoiceType = null,Object? invoiceDate = null,Object? assetDescription = null,Object? marketValueAtDisposal = null,Object? writeOffAmount = null,Object? generatedAt = null,Object? serialNumber = freezed,Object? originalCost = freezed,Object? bookValueAtDisposal = freezed,Object? marketAnchorEbay = freezed,Object? pdfStoragePath = freezed,Object? modelName = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,invoiceNumber: null == invoiceNumber ? _self.invoiceNumber : invoiceNumber // ignore: cast_nullable_to_non_nullable
as String,invoiceType: null == invoiceType ? _self.invoiceType : invoiceType // ignore: cast_nullable_to_non_nullable
as String,invoiceDate: null == invoiceDate ? _self.invoiceDate : invoiceDate // ignore: cast_nullable_to_non_nullable
as DateTime,assetDescription: null == assetDescription ? _self.assetDescription : assetDescription // ignore: cast_nullable_to_non_nullable
as String,marketValueAtDisposal: null == marketValueAtDisposal ? _self.marketValueAtDisposal : marketValueAtDisposal // ignore: cast_nullable_to_non_nullable
as double,writeOffAmount: null == writeOffAmount ? _self.writeOffAmount : writeOffAmount // ignore: cast_nullable_to_non_nullable
as double,generatedAt: null == generatedAt ? _self.generatedAt : generatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,serialNumber: freezed == serialNumber ? _self.serialNumber : serialNumber // ignore: cast_nullable_to_non_nullable
as String?,originalCost: freezed == originalCost ? _self.originalCost : originalCost // ignore: cast_nullable_to_non_nullable
as double?,bookValueAtDisposal: freezed == bookValueAtDisposal ? _self.bookValueAtDisposal : bookValueAtDisposal // ignore: cast_nullable_to_non_nullable
as double?,marketAnchorEbay: freezed == marketAnchorEbay ? _self.marketAnchorEbay : marketAnchorEbay // ignore: cast_nullable_to_non_nullable
as double?,pdfStoragePath: freezed == pdfStoragePath ? _self.pdfStoragePath : pdfStoragePath // ignore: cast_nullable_to_non_nullable
as String?,modelName: freezed == modelName ? _self.modelName : modelName // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [TaxInvoice].
extension TaxInvoicePatterns on TaxInvoice {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TaxInvoice value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TaxInvoice() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TaxInvoice value)  $default,){
final _that = this;
switch (_that) {
case _TaxInvoice():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TaxInvoice value)?  $default,){
final _that = this;
switch (_that) {
case _TaxInvoice() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String invoiceNumber,  String invoiceType, @DateOnlyConverter()  DateTime invoiceDate,  String assetDescription,  double marketValueAtDisposal,  double writeOffAmount, @IsoDateTimeConverter()  DateTime generatedAt,  String? serialNumber,  double? originalCost,  double? bookValueAtDisposal,  double? marketAnchorEbay,  String? pdfStoragePath,  String? modelName)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TaxInvoice() when $default != null:
return $default(_that.id,_that.invoiceNumber,_that.invoiceType,_that.invoiceDate,_that.assetDescription,_that.marketValueAtDisposal,_that.writeOffAmount,_that.generatedAt,_that.serialNumber,_that.originalCost,_that.bookValueAtDisposal,_that.marketAnchorEbay,_that.pdfStoragePath,_that.modelName);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String invoiceNumber,  String invoiceType, @DateOnlyConverter()  DateTime invoiceDate,  String assetDescription,  double marketValueAtDisposal,  double writeOffAmount, @IsoDateTimeConverter()  DateTime generatedAt,  String? serialNumber,  double? originalCost,  double? bookValueAtDisposal,  double? marketAnchorEbay,  String? pdfStoragePath,  String? modelName)  $default,) {final _that = this;
switch (_that) {
case _TaxInvoice():
return $default(_that.id,_that.invoiceNumber,_that.invoiceType,_that.invoiceDate,_that.assetDescription,_that.marketValueAtDisposal,_that.writeOffAmount,_that.generatedAt,_that.serialNumber,_that.originalCost,_that.bookValueAtDisposal,_that.marketAnchorEbay,_that.pdfStoragePath,_that.modelName);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String invoiceNumber,  String invoiceType, @DateOnlyConverter()  DateTime invoiceDate,  String assetDescription,  double marketValueAtDisposal,  double writeOffAmount, @IsoDateTimeConverter()  DateTime generatedAt,  String? serialNumber,  double? originalCost,  double? bookValueAtDisposal,  double? marketAnchorEbay,  String? pdfStoragePath,  String? modelName)?  $default,) {final _that = this;
switch (_that) {
case _TaxInvoice() when $default != null:
return $default(_that.id,_that.invoiceNumber,_that.invoiceType,_that.invoiceDate,_that.assetDescription,_that.marketValueAtDisposal,_that.writeOffAmount,_that.generatedAt,_that.serialNumber,_that.originalCost,_that.bookValueAtDisposal,_that.marketAnchorEbay,_that.pdfStoragePath,_that.modelName);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TaxInvoice extends TaxInvoice {
  const _TaxInvoice({required this.id, required this.invoiceNumber, required this.invoiceType, @DateOnlyConverter() required this.invoiceDate, required this.assetDescription, required this.marketValueAtDisposal, required this.writeOffAmount, @IsoDateTimeConverter() required this.generatedAt, this.serialNumber, this.originalCost, this.bookValueAtDisposal, this.marketAnchorEbay, this.pdfStoragePath, this.modelName}): super._();
  factory _TaxInvoice.fromJson(Map<String, dynamic> json) => _$TaxInvoiceFromJson(json);

@override final  String id;
@override final  String invoiceNumber;
@override final  String invoiceType;
@override@DateOnlyConverter() final  DateTime invoiceDate;
@override final  String assetDescription;
@override final  double marketValueAtDisposal;
@override final  double writeOffAmount;
@override@IsoDateTimeConverter() final  DateTime generatedAt;
@override final  String? serialNumber;
@override final  double? originalCost;
@override final  double? bookValueAtDisposal;
@override final  double? marketAnchorEbay;
@override final  String? pdfStoragePath;
// Joined from asset row
@override final  String? modelName;

/// Create a copy of TaxInvoice
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TaxInvoiceCopyWith<_TaxInvoice> get copyWith => __$TaxInvoiceCopyWithImpl<_TaxInvoice>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TaxInvoiceToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TaxInvoice&&(identical(other.id, id) || other.id == id)&&(identical(other.invoiceNumber, invoiceNumber) || other.invoiceNumber == invoiceNumber)&&(identical(other.invoiceType, invoiceType) || other.invoiceType == invoiceType)&&(identical(other.invoiceDate, invoiceDate) || other.invoiceDate == invoiceDate)&&(identical(other.assetDescription, assetDescription) || other.assetDescription == assetDescription)&&(identical(other.marketValueAtDisposal, marketValueAtDisposal) || other.marketValueAtDisposal == marketValueAtDisposal)&&(identical(other.writeOffAmount, writeOffAmount) || other.writeOffAmount == writeOffAmount)&&(identical(other.generatedAt, generatedAt) || other.generatedAt == generatedAt)&&(identical(other.serialNumber, serialNumber) || other.serialNumber == serialNumber)&&(identical(other.originalCost, originalCost) || other.originalCost == originalCost)&&(identical(other.bookValueAtDisposal, bookValueAtDisposal) || other.bookValueAtDisposal == bookValueAtDisposal)&&(identical(other.marketAnchorEbay, marketAnchorEbay) || other.marketAnchorEbay == marketAnchorEbay)&&(identical(other.pdfStoragePath, pdfStoragePath) || other.pdfStoragePath == pdfStoragePath)&&(identical(other.modelName, modelName) || other.modelName == modelName));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,invoiceNumber,invoiceType,invoiceDate,assetDescription,marketValueAtDisposal,writeOffAmount,generatedAt,serialNumber,originalCost,bookValueAtDisposal,marketAnchorEbay,pdfStoragePath,modelName);

@override
String toString() {
  return 'TaxInvoice(id: $id, invoiceNumber: $invoiceNumber, invoiceType: $invoiceType, invoiceDate: $invoiceDate, assetDescription: $assetDescription, marketValueAtDisposal: $marketValueAtDisposal, writeOffAmount: $writeOffAmount, generatedAt: $generatedAt, serialNumber: $serialNumber, originalCost: $originalCost, bookValueAtDisposal: $bookValueAtDisposal, marketAnchorEbay: $marketAnchorEbay, pdfStoragePath: $pdfStoragePath, modelName: $modelName)';
}


}

/// @nodoc
abstract mixin class _$TaxInvoiceCopyWith<$Res> implements $TaxInvoiceCopyWith<$Res> {
  factory _$TaxInvoiceCopyWith(_TaxInvoice value, $Res Function(_TaxInvoice) _then) = __$TaxInvoiceCopyWithImpl;
@override @useResult
$Res call({
 String id, String invoiceNumber, String invoiceType,@DateOnlyConverter() DateTime invoiceDate, String assetDescription, double marketValueAtDisposal, double writeOffAmount,@IsoDateTimeConverter() DateTime generatedAt, String? serialNumber, double? originalCost, double? bookValueAtDisposal, double? marketAnchorEbay, String? pdfStoragePath, String? modelName
});




}
/// @nodoc
class __$TaxInvoiceCopyWithImpl<$Res>
    implements _$TaxInvoiceCopyWith<$Res> {
  __$TaxInvoiceCopyWithImpl(this._self, this._then);

  final _TaxInvoice _self;
  final $Res Function(_TaxInvoice) _then;

/// Create a copy of TaxInvoice
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? invoiceNumber = null,Object? invoiceType = null,Object? invoiceDate = null,Object? assetDescription = null,Object? marketValueAtDisposal = null,Object? writeOffAmount = null,Object? generatedAt = null,Object? serialNumber = freezed,Object? originalCost = freezed,Object? bookValueAtDisposal = freezed,Object? marketAnchorEbay = freezed,Object? pdfStoragePath = freezed,Object? modelName = freezed,}) {
  return _then(_TaxInvoice(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,invoiceNumber: null == invoiceNumber ? _self.invoiceNumber : invoiceNumber // ignore: cast_nullable_to_non_nullable
as String,invoiceType: null == invoiceType ? _self.invoiceType : invoiceType // ignore: cast_nullable_to_non_nullable
as String,invoiceDate: null == invoiceDate ? _self.invoiceDate : invoiceDate // ignore: cast_nullable_to_non_nullable
as DateTime,assetDescription: null == assetDescription ? _self.assetDescription : assetDescription // ignore: cast_nullable_to_non_nullable
as String,marketValueAtDisposal: null == marketValueAtDisposal ? _self.marketValueAtDisposal : marketValueAtDisposal // ignore: cast_nullable_to_non_nullable
as double,writeOffAmount: null == writeOffAmount ? _self.writeOffAmount : writeOffAmount // ignore: cast_nullable_to_non_nullable
as double,generatedAt: null == generatedAt ? _self.generatedAt : generatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,serialNumber: freezed == serialNumber ? _self.serialNumber : serialNumber // ignore: cast_nullable_to_non_nullable
as String?,originalCost: freezed == originalCost ? _self.originalCost : originalCost // ignore: cast_nullable_to_non_nullable
as double?,bookValueAtDisposal: freezed == bookValueAtDisposal ? _self.bookValueAtDisposal : bookValueAtDisposal // ignore: cast_nullable_to_non_nullable
as double?,marketAnchorEbay: freezed == marketAnchorEbay ? _self.marketAnchorEbay : marketAnchorEbay // ignore: cast_nullable_to_non_nullable
as double?,pdfStoragePath: freezed == pdfStoragePath ? _self.pdfStoragePath : pdfStoragePath // ignore: cast_nullable_to_non_nullable
as String?,modelName: freezed == modelName ? _self.modelName : modelName // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
