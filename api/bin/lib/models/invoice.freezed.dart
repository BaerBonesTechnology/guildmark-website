// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'invoice.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

TaxInvoice _$TaxInvoiceFromJson(Map<String, dynamic> json) {
  return _TaxInvoice.fromJson(json);
}

/// @nodoc
mixin _$TaxInvoice {
  String get id => throw _privateConstructorUsedError;
  String get invoiceNumber => throw _privateConstructorUsedError;
  String get invoiceType => throw _privateConstructorUsedError;
  @DateOnlyConverter()
  DateTime get invoiceDate => throw _privateConstructorUsedError;
  String get assetDescription => throw _privateConstructorUsedError;
  double get marketValueAtDisposal => throw _privateConstructorUsedError;
  double get writeOffAmount => throw _privateConstructorUsedError;
  @IsoDateTimeConverter()
  DateTime get generatedAt => throw _privateConstructorUsedError;
  String? get serialNumber => throw _privateConstructorUsedError;
  double? get originalCost => throw _privateConstructorUsedError;
  double? get bookValueAtDisposal => throw _privateConstructorUsedError;
  double? get marketAnchorEbay => throw _privateConstructorUsedError;
  String? get pdfStoragePath =>
      throw _privateConstructorUsedError; // Joined from asset row
  String? get modelName => throw _privateConstructorUsedError;

  /// Serializes this TaxInvoice to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TaxInvoice
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TaxInvoiceCopyWith<TaxInvoice> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaxInvoiceCopyWith<$Res> {
  factory $TaxInvoiceCopyWith(
          TaxInvoice value, $Res Function(TaxInvoice) then) =
      _$TaxInvoiceCopyWithImpl<$Res, TaxInvoice>;
  @useResult
  $Res call(
      {String id,
      String invoiceNumber,
      String invoiceType,
      @DateOnlyConverter() DateTime invoiceDate,
      String assetDescription,
      double marketValueAtDisposal,
      double writeOffAmount,
      @IsoDateTimeConverter() DateTime generatedAt,
      String? serialNumber,
      double? originalCost,
      double? bookValueAtDisposal,
      double? marketAnchorEbay,
      String? pdfStoragePath,
      String? modelName});
}

/// @nodoc
class _$TaxInvoiceCopyWithImpl<$Res, $Val extends TaxInvoice>
    implements $TaxInvoiceCopyWith<$Res> {
  _$TaxInvoiceCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TaxInvoice
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? invoiceNumber = null,
    Object? invoiceType = null,
    Object? invoiceDate = null,
    Object? assetDescription = null,
    Object? marketValueAtDisposal = null,
    Object? writeOffAmount = null,
    Object? generatedAt = null,
    Object? serialNumber = freezed,
    Object? originalCost = freezed,
    Object? bookValueAtDisposal = freezed,
    Object? marketAnchorEbay = freezed,
    Object? pdfStoragePath = freezed,
    Object? modelName = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      invoiceNumber: null == invoiceNumber
          ? _value.invoiceNumber
          : invoiceNumber // ignore: cast_nullable_to_non_nullable
              as String,
      invoiceType: null == invoiceType
          ? _value.invoiceType
          : invoiceType // ignore: cast_nullable_to_non_nullable
              as String,
      invoiceDate: null == invoiceDate
          ? _value.invoiceDate
          : invoiceDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      assetDescription: null == assetDescription
          ? _value.assetDescription
          : assetDescription // ignore: cast_nullable_to_non_nullable
              as String,
      marketValueAtDisposal: null == marketValueAtDisposal
          ? _value.marketValueAtDisposal
          : marketValueAtDisposal // ignore: cast_nullable_to_non_nullable
              as double,
      writeOffAmount: null == writeOffAmount
          ? _value.writeOffAmount
          : writeOffAmount // ignore: cast_nullable_to_non_nullable
              as double,
      generatedAt: null == generatedAt
          ? _value.generatedAt
          : generatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      serialNumber: freezed == serialNumber
          ? _value.serialNumber
          : serialNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      originalCost: freezed == originalCost
          ? _value.originalCost
          : originalCost // ignore: cast_nullable_to_non_nullable
              as double?,
      bookValueAtDisposal: freezed == bookValueAtDisposal
          ? _value.bookValueAtDisposal
          : bookValueAtDisposal // ignore: cast_nullable_to_non_nullable
              as double?,
      marketAnchorEbay: freezed == marketAnchorEbay
          ? _value.marketAnchorEbay
          : marketAnchorEbay // ignore: cast_nullable_to_non_nullable
              as double?,
      pdfStoragePath: freezed == pdfStoragePath
          ? _value.pdfStoragePath
          : pdfStoragePath // ignore: cast_nullable_to_non_nullable
              as String?,
      modelName: freezed == modelName
          ? _value.modelName
          : modelName // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$TaxInvoiceImplCopyWith<$Res>
    implements $TaxInvoiceCopyWith<$Res> {
  factory _$$TaxInvoiceImplCopyWith(
          _$TaxInvoiceImpl value, $Res Function(_$TaxInvoiceImpl) then) =
      __$$TaxInvoiceImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String invoiceNumber,
      String invoiceType,
      @DateOnlyConverter() DateTime invoiceDate,
      String assetDescription,
      double marketValueAtDisposal,
      double writeOffAmount,
      @IsoDateTimeConverter() DateTime generatedAt,
      String? serialNumber,
      double? originalCost,
      double? bookValueAtDisposal,
      double? marketAnchorEbay,
      String? pdfStoragePath,
      String? modelName});
}

/// @nodoc
class __$$TaxInvoiceImplCopyWithImpl<$Res>
    extends _$TaxInvoiceCopyWithImpl<$Res, _$TaxInvoiceImpl>
    implements _$$TaxInvoiceImplCopyWith<$Res> {
  __$$TaxInvoiceImplCopyWithImpl(
      _$TaxInvoiceImpl _value, $Res Function(_$TaxInvoiceImpl) _then)
      : super(_value, _then);

  /// Create a copy of TaxInvoice
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? invoiceNumber = null,
    Object? invoiceType = null,
    Object? invoiceDate = null,
    Object? assetDescription = null,
    Object? marketValueAtDisposal = null,
    Object? writeOffAmount = null,
    Object? generatedAt = null,
    Object? serialNumber = freezed,
    Object? originalCost = freezed,
    Object? bookValueAtDisposal = freezed,
    Object? marketAnchorEbay = freezed,
    Object? pdfStoragePath = freezed,
    Object? modelName = freezed,
  }) {
    return _then(_$TaxInvoiceImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      invoiceNumber: null == invoiceNumber
          ? _value.invoiceNumber
          : invoiceNumber // ignore: cast_nullable_to_non_nullable
              as String,
      invoiceType: null == invoiceType
          ? _value.invoiceType
          : invoiceType // ignore: cast_nullable_to_non_nullable
              as String,
      invoiceDate: null == invoiceDate
          ? _value.invoiceDate
          : invoiceDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      assetDescription: null == assetDescription
          ? _value.assetDescription
          : assetDescription // ignore: cast_nullable_to_non_nullable
              as String,
      marketValueAtDisposal: null == marketValueAtDisposal
          ? _value.marketValueAtDisposal
          : marketValueAtDisposal // ignore: cast_nullable_to_non_nullable
              as double,
      writeOffAmount: null == writeOffAmount
          ? _value.writeOffAmount
          : writeOffAmount // ignore: cast_nullable_to_non_nullable
              as double,
      generatedAt: null == generatedAt
          ? _value.generatedAt
          : generatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      serialNumber: freezed == serialNumber
          ? _value.serialNumber
          : serialNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      originalCost: freezed == originalCost
          ? _value.originalCost
          : originalCost // ignore: cast_nullable_to_non_nullable
              as double?,
      bookValueAtDisposal: freezed == bookValueAtDisposal
          ? _value.bookValueAtDisposal
          : bookValueAtDisposal // ignore: cast_nullable_to_non_nullable
              as double?,
      marketAnchorEbay: freezed == marketAnchorEbay
          ? _value.marketAnchorEbay
          : marketAnchorEbay // ignore: cast_nullable_to_non_nullable
              as double?,
      pdfStoragePath: freezed == pdfStoragePath
          ? _value.pdfStoragePath
          : pdfStoragePath // ignore: cast_nullable_to_non_nullable
              as String?,
      modelName: freezed == modelName
          ? _value.modelName
          : modelName // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$TaxInvoiceImpl extends _TaxInvoice {
  const _$TaxInvoiceImpl(
      {required this.id,
      required this.invoiceNumber,
      required this.invoiceType,
      @DateOnlyConverter() required this.invoiceDate,
      required this.assetDescription,
      required this.marketValueAtDisposal,
      required this.writeOffAmount,
      @IsoDateTimeConverter() required this.generatedAt,
      this.serialNumber,
      this.originalCost,
      this.bookValueAtDisposal,
      this.marketAnchorEbay,
      this.pdfStoragePath,
      this.modelName})
      : super._();

  factory _$TaxInvoiceImpl.fromJson(Map<String, dynamic> json) =>
      _$$TaxInvoiceImplFromJson(json);

  @override
  final String id;
  @override
  final String invoiceNumber;
  @override
  final String invoiceType;
  @override
  @DateOnlyConverter()
  final DateTime invoiceDate;
  @override
  final String assetDescription;
  @override
  final double marketValueAtDisposal;
  @override
  final double writeOffAmount;
  @override
  @IsoDateTimeConverter()
  final DateTime generatedAt;
  @override
  final String? serialNumber;
  @override
  final double? originalCost;
  @override
  final double? bookValueAtDisposal;
  @override
  final double? marketAnchorEbay;
  @override
  final String? pdfStoragePath;
// Joined from asset row
  @override
  final String? modelName;

  @override
  String toString() {
    return 'TaxInvoice(id: $id, invoiceNumber: $invoiceNumber, invoiceType: $invoiceType, invoiceDate: $invoiceDate, assetDescription: $assetDescription, marketValueAtDisposal: $marketValueAtDisposal, writeOffAmount: $writeOffAmount, generatedAt: $generatedAt, serialNumber: $serialNumber, originalCost: $originalCost, bookValueAtDisposal: $bookValueAtDisposal, marketAnchorEbay: $marketAnchorEbay, pdfStoragePath: $pdfStoragePath, modelName: $modelName)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TaxInvoiceImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.invoiceNumber, invoiceNumber) ||
                other.invoiceNumber == invoiceNumber) &&
            (identical(other.invoiceType, invoiceType) ||
                other.invoiceType == invoiceType) &&
            (identical(other.invoiceDate, invoiceDate) ||
                other.invoiceDate == invoiceDate) &&
            (identical(other.assetDescription, assetDescription) ||
                other.assetDescription == assetDescription) &&
            (identical(other.marketValueAtDisposal, marketValueAtDisposal) ||
                other.marketValueAtDisposal == marketValueAtDisposal) &&
            (identical(other.writeOffAmount, writeOffAmount) ||
                other.writeOffAmount == writeOffAmount) &&
            (identical(other.generatedAt, generatedAt) ||
                other.generatedAt == generatedAt) &&
            (identical(other.serialNumber, serialNumber) ||
                other.serialNumber == serialNumber) &&
            (identical(other.originalCost, originalCost) ||
                other.originalCost == originalCost) &&
            (identical(other.bookValueAtDisposal, bookValueAtDisposal) ||
                other.bookValueAtDisposal == bookValueAtDisposal) &&
            (identical(other.marketAnchorEbay, marketAnchorEbay) ||
                other.marketAnchorEbay == marketAnchorEbay) &&
            (identical(other.pdfStoragePath, pdfStoragePath) ||
                other.pdfStoragePath == pdfStoragePath) &&
            (identical(other.modelName, modelName) ||
                other.modelName == modelName));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      invoiceNumber,
      invoiceType,
      invoiceDate,
      assetDescription,
      marketValueAtDisposal,
      writeOffAmount,
      generatedAt,
      serialNumber,
      originalCost,
      bookValueAtDisposal,
      marketAnchorEbay,
      pdfStoragePath,
      modelName);

  /// Create a copy of TaxInvoice
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TaxInvoiceImplCopyWith<_$TaxInvoiceImpl> get copyWith =>
      __$$TaxInvoiceImplCopyWithImpl<_$TaxInvoiceImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TaxInvoiceImplToJson(
      this,
    );
  }
}

abstract class _TaxInvoice extends TaxInvoice {
  const factory _TaxInvoice(
      {required final String id,
      required final String invoiceNumber,
      required final String invoiceType,
      @DateOnlyConverter() required final DateTime invoiceDate,
      required final String assetDescription,
      required final double marketValueAtDisposal,
      required final double writeOffAmount,
      @IsoDateTimeConverter() required final DateTime generatedAt,
      final String? serialNumber,
      final double? originalCost,
      final double? bookValueAtDisposal,
      final double? marketAnchorEbay,
      final String? pdfStoragePath,
      final String? modelName}) = _$TaxInvoiceImpl;
  const _TaxInvoice._() : super._();

  factory _TaxInvoice.fromJson(Map<String, dynamic> json) =
      _$TaxInvoiceImpl.fromJson;

  @override
  String get id;
  @override
  String get invoiceNumber;
  @override
  String get invoiceType;
  @override
  @DateOnlyConverter()
  DateTime get invoiceDate;
  @override
  String get assetDescription;
  @override
  double get marketValueAtDisposal;
  @override
  double get writeOffAmount;
  @override
  @IsoDateTimeConverter()
  DateTime get generatedAt;
  @override
  String? get serialNumber;
  @override
  double? get originalCost;
  @override
  double? get bookValueAtDisposal;
  @override
  double? get marketAnchorEbay;
  @override
  String? get pdfStoragePath; // Joined from asset row
  @override
  String? get modelName;

  /// Create a copy of TaxInvoice
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TaxInvoiceImplCopyWith<_$TaxInvoiceImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
