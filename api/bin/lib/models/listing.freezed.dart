// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'listing.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Listing _$ListingFromJson(Map<String, dynamic> json) {
  return _Listing.fromJson(json);
}

/// @nodoc
mixin _$Listing {
  String get id => throw _privateConstructorUsedError;
  String get assetId => throw _privateConstructorUsedError;
  String get companyId => throw _privateConstructorUsedError;
  String get valuationFlag => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  @IsoDateTimeConverter()
  DateTime get createdAt => throw _privateConstructorUsedError;
  double? get listedPrice => throw _privateConstructorUsedError;
  double? get sellerOfferPrice => throw _privateConstructorUsedError;
  double? get buyerAskPrice => throw _privateConstructorUsedError;
  double? get grossMargin => throw _privateConstructorUsedError;
  double? get consumerMarketAnchor => throw _privateConstructorUsedError;
  double? get fairMarketValue => throw _privateConstructorUsedError;
  double? get estBookValue => throw _privateConstructorUsedError;
  double? get sellerRecoveryRatio => throw _privateConstructorUsedError;
  double? get depreciationPct => throw _privateConstructorUsedError;
  int? get ageMonths => throw _privateConstructorUsedError;
  @NullableIsoDateTimeConverter()
  DateTime? get lastValuedAt =>
      throw _privateConstructorUsedError; // Joined fields (denormalized from the asset row for marketplace cards)
  String? get modelName => throw _privateConstructorUsedError;
  String? get assetType => throw _privateConstructorUsedError;
  String? get conditionGrade => throw _privateConstructorUsedError;
  int? get quantity => throw _privateConstructorUsedError;
  double? get cpuScore => throw _privateConstructorUsedError;
  int? get ramGb => throw _privateConstructorUsedError;
  int? get storageGb => throw _privateConstructorUsedError;

  /// Serializes this Listing to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Listing
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ListingCopyWith<Listing> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ListingCopyWith<$Res> {
  factory $ListingCopyWith(Listing value, $Res Function(Listing) then) =
      _$ListingCopyWithImpl<$Res, Listing>;
  @useResult
  $Res call(
      {String id,
      String assetId,
      String companyId,
      String valuationFlag,
      String status,
      @IsoDateTimeConverter() DateTime createdAt,
      double? listedPrice,
      double? sellerOfferPrice,
      double? buyerAskPrice,
      double? grossMargin,
      double? consumerMarketAnchor,
      double? fairMarketValue,
      double? estBookValue,
      double? sellerRecoveryRatio,
      double? depreciationPct,
      int? ageMonths,
      @NullableIsoDateTimeConverter() DateTime? lastValuedAt,
      String? modelName,
      String? assetType,
      String? conditionGrade,
      int? quantity,
      double? cpuScore,
      int? ramGb,
      int? storageGb});
}

/// @nodoc
class _$ListingCopyWithImpl<$Res, $Val extends Listing>
    implements $ListingCopyWith<$Res> {
  _$ListingCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Listing
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? assetId = null,
    Object? companyId = null,
    Object? valuationFlag = null,
    Object? status = null,
    Object? createdAt = null,
    Object? listedPrice = freezed,
    Object? sellerOfferPrice = freezed,
    Object? buyerAskPrice = freezed,
    Object? grossMargin = freezed,
    Object? consumerMarketAnchor = freezed,
    Object? fairMarketValue = freezed,
    Object? estBookValue = freezed,
    Object? sellerRecoveryRatio = freezed,
    Object? depreciationPct = freezed,
    Object? ageMonths = freezed,
    Object? lastValuedAt = freezed,
    Object? modelName = freezed,
    Object? assetType = freezed,
    Object? conditionGrade = freezed,
    Object? quantity = freezed,
    Object? cpuScore = freezed,
    Object? ramGb = freezed,
    Object? storageGb = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      assetId: null == assetId
          ? _value.assetId
          : assetId // ignore: cast_nullable_to_non_nullable
              as String,
      companyId: null == companyId
          ? _value.companyId
          : companyId // ignore: cast_nullable_to_non_nullable
              as String,
      valuationFlag: null == valuationFlag
          ? _value.valuationFlag
          : valuationFlag // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      listedPrice: freezed == listedPrice
          ? _value.listedPrice
          : listedPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      sellerOfferPrice: freezed == sellerOfferPrice
          ? _value.sellerOfferPrice
          : sellerOfferPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      buyerAskPrice: freezed == buyerAskPrice
          ? _value.buyerAskPrice
          : buyerAskPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      grossMargin: freezed == grossMargin
          ? _value.grossMargin
          : grossMargin // ignore: cast_nullable_to_non_nullable
              as double?,
      consumerMarketAnchor: freezed == consumerMarketAnchor
          ? _value.consumerMarketAnchor
          : consumerMarketAnchor // ignore: cast_nullable_to_non_nullable
              as double?,
      fairMarketValue: freezed == fairMarketValue
          ? _value.fairMarketValue
          : fairMarketValue // ignore: cast_nullable_to_non_nullable
              as double?,
      estBookValue: freezed == estBookValue
          ? _value.estBookValue
          : estBookValue // ignore: cast_nullable_to_non_nullable
              as double?,
      sellerRecoveryRatio: freezed == sellerRecoveryRatio
          ? _value.sellerRecoveryRatio
          : sellerRecoveryRatio // ignore: cast_nullable_to_non_nullable
              as double?,
      depreciationPct: freezed == depreciationPct
          ? _value.depreciationPct
          : depreciationPct // ignore: cast_nullable_to_non_nullable
              as double?,
      ageMonths: freezed == ageMonths
          ? _value.ageMonths
          : ageMonths // ignore: cast_nullable_to_non_nullable
              as int?,
      lastValuedAt: freezed == lastValuedAt
          ? _value.lastValuedAt
          : lastValuedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      modelName: freezed == modelName
          ? _value.modelName
          : modelName // ignore: cast_nullable_to_non_nullable
              as String?,
      assetType: freezed == assetType
          ? _value.assetType
          : assetType // ignore: cast_nullable_to_non_nullable
              as String?,
      conditionGrade: freezed == conditionGrade
          ? _value.conditionGrade
          : conditionGrade // ignore: cast_nullable_to_non_nullable
              as String?,
      quantity: freezed == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int?,
      cpuScore: freezed == cpuScore
          ? _value.cpuScore
          : cpuScore // ignore: cast_nullable_to_non_nullable
              as double?,
      ramGb: freezed == ramGb
          ? _value.ramGb
          : ramGb // ignore: cast_nullable_to_non_nullable
              as int?,
      storageGb: freezed == storageGb
          ? _value.storageGb
          : storageGb // ignore: cast_nullable_to_non_nullable
              as int?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ListingImplCopyWith<$Res> implements $ListingCopyWith<$Res> {
  factory _$$ListingImplCopyWith(
          _$ListingImpl value, $Res Function(_$ListingImpl) then) =
      __$$ListingImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String assetId,
      String companyId,
      String valuationFlag,
      String status,
      @IsoDateTimeConverter() DateTime createdAt,
      double? listedPrice,
      double? sellerOfferPrice,
      double? buyerAskPrice,
      double? grossMargin,
      double? consumerMarketAnchor,
      double? fairMarketValue,
      double? estBookValue,
      double? sellerRecoveryRatio,
      double? depreciationPct,
      int? ageMonths,
      @NullableIsoDateTimeConverter() DateTime? lastValuedAt,
      String? modelName,
      String? assetType,
      String? conditionGrade,
      int? quantity,
      double? cpuScore,
      int? ramGb,
      int? storageGb});
}

/// @nodoc
class __$$ListingImplCopyWithImpl<$Res>
    extends _$ListingCopyWithImpl<$Res, _$ListingImpl>
    implements _$$ListingImplCopyWith<$Res> {
  __$$ListingImplCopyWithImpl(
      _$ListingImpl _value, $Res Function(_$ListingImpl) _then)
      : super(_value, _then);

  /// Create a copy of Listing
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? assetId = null,
    Object? companyId = null,
    Object? valuationFlag = null,
    Object? status = null,
    Object? createdAt = null,
    Object? listedPrice = freezed,
    Object? sellerOfferPrice = freezed,
    Object? buyerAskPrice = freezed,
    Object? grossMargin = freezed,
    Object? consumerMarketAnchor = freezed,
    Object? fairMarketValue = freezed,
    Object? estBookValue = freezed,
    Object? sellerRecoveryRatio = freezed,
    Object? depreciationPct = freezed,
    Object? ageMonths = freezed,
    Object? lastValuedAt = freezed,
    Object? modelName = freezed,
    Object? assetType = freezed,
    Object? conditionGrade = freezed,
    Object? quantity = freezed,
    Object? cpuScore = freezed,
    Object? ramGb = freezed,
    Object? storageGb = freezed,
  }) {
    return _then(_$ListingImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      assetId: null == assetId
          ? _value.assetId
          : assetId // ignore: cast_nullable_to_non_nullable
              as String,
      companyId: null == companyId
          ? _value.companyId
          : companyId // ignore: cast_nullable_to_non_nullable
              as String,
      valuationFlag: null == valuationFlag
          ? _value.valuationFlag
          : valuationFlag // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      listedPrice: freezed == listedPrice
          ? _value.listedPrice
          : listedPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      sellerOfferPrice: freezed == sellerOfferPrice
          ? _value.sellerOfferPrice
          : sellerOfferPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      buyerAskPrice: freezed == buyerAskPrice
          ? _value.buyerAskPrice
          : buyerAskPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      grossMargin: freezed == grossMargin
          ? _value.grossMargin
          : grossMargin // ignore: cast_nullable_to_non_nullable
              as double?,
      consumerMarketAnchor: freezed == consumerMarketAnchor
          ? _value.consumerMarketAnchor
          : consumerMarketAnchor // ignore: cast_nullable_to_non_nullable
              as double?,
      fairMarketValue: freezed == fairMarketValue
          ? _value.fairMarketValue
          : fairMarketValue // ignore: cast_nullable_to_non_nullable
              as double?,
      estBookValue: freezed == estBookValue
          ? _value.estBookValue
          : estBookValue // ignore: cast_nullable_to_non_nullable
              as double?,
      sellerRecoveryRatio: freezed == sellerRecoveryRatio
          ? _value.sellerRecoveryRatio
          : sellerRecoveryRatio // ignore: cast_nullable_to_non_nullable
              as double?,
      depreciationPct: freezed == depreciationPct
          ? _value.depreciationPct
          : depreciationPct // ignore: cast_nullable_to_non_nullable
              as double?,
      ageMonths: freezed == ageMonths
          ? _value.ageMonths
          : ageMonths // ignore: cast_nullable_to_non_nullable
              as int?,
      lastValuedAt: freezed == lastValuedAt
          ? _value.lastValuedAt
          : lastValuedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      modelName: freezed == modelName
          ? _value.modelName
          : modelName // ignore: cast_nullable_to_non_nullable
              as String?,
      assetType: freezed == assetType
          ? _value.assetType
          : assetType // ignore: cast_nullable_to_non_nullable
              as String?,
      conditionGrade: freezed == conditionGrade
          ? _value.conditionGrade
          : conditionGrade // ignore: cast_nullable_to_non_nullable
              as String?,
      quantity: freezed == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int?,
      cpuScore: freezed == cpuScore
          ? _value.cpuScore
          : cpuScore // ignore: cast_nullable_to_non_nullable
              as double?,
      ramGb: freezed == ramGb
          ? _value.ramGb
          : ramGb // ignore: cast_nullable_to_non_nullable
              as int?,
      storageGb: freezed == storageGb
          ? _value.storageGb
          : storageGb // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ListingImpl extends _Listing {
  const _$ListingImpl(
      {required this.id,
      required this.assetId,
      required this.companyId,
      required this.valuationFlag,
      required this.status,
      @IsoDateTimeConverter() required this.createdAt,
      this.listedPrice,
      this.sellerOfferPrice,
      this.buyerAskPrice,
      this.grossMargin,
      this.consumerMarketAnchor,
      this.fairMarketValue,
      this.estBookValue,
      this.sellerRecoveryRatio,
      this.depreciationPct,
      this.ageMonths,
      @NullableIsoDateTimeConverter() this.lastValuedAt,
      this.modelName,
      this.assetType,
      this.conditionGrade,
      this.quantity,
      this.cpuScore,
      this.ramGb,
      this.storageGb})
      : super._();

  factory _$ListingImpl.fromJson(Map<String, dynamic> json) =>
      _$$ListingImplFromJson(json);

  @override
  final String id;
  @override
  final String assetId;
  @override
  final String companyId;
  @override
  final String valuationFlag;
  @override
  final String status;
  @override
  @IsoDateTimeConverter()
  final DateTime createdAt;
  @override
  final double? listedPrice;
  @override
  final double? sellerOfferPrice;
  @override
  final double? buyerAskPrice;
  @override
  final double? grossMargin;
  @override
  final double? consumerMarketAnchor;
  @override
  final double? fairMarketValue;
  @override
  final double? estBookValue;
  @override
  final double? sellerRecoveryRatio;
  @override
  final double? depreciationPct;
  @override
  final int? ageMonths;
  @override
  @NullableIsoDateTimeConverter()
  final DateTime? lastValuedAt;
// Joined fields (denormalized from the asset row for marketplace cards)
  @override
  final String? modelName;
  @override
  final String? assetType;
  @override
  final String? conditionGrade;
  @override
  final int? quantity;
  @override
  final double? cpuScore;
  @override
  final int? ramGb;
  @override
  final int? storageGb;

  @override
  String toString() {
    return 'Listing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ListingImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.assetId, assetId) || other.assetId == assetId) &&
            (identical(other.companyId, companyId) ||
                other.companyId == companyId) &&
            (identical(other.valuationFlag, valuationFlag) ||
                other.valuationFlag == valuationFlag) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.listedPrice, listedPrice) ||
                other.listedPrice == listedPrice) &&
            (identical(other.sellerOfferPrice, sellerOfferPrice) ||
                other.sellerOfferPrice == sellerOfferPrice) &&
            (identical(other.buyerAskPrice, buyerAskPrice) ||
                other.buyerAskPrice == buyerAskPrice) &&
            (identical(other.grossMargin, grossMargin) ||
                other.grossMargin == grossMargin) &&
            (identical(other.consumerMarketAnchor, consumerMarketAnchor) ||
                other.consumerMarketAnchor == consumerMarketAnchor) &&
            (identical(other.fairMarketValue, fairMarketValue) ||
                other.fairMarketValue == fairMarketValue) &&
            (identical(other.estBookValue, estBookValue) ||
                other.estBookValue == estBookValue) &&
            (identical(other.sellerRecoveryRatio, sellerRecoveryRatio) ||
                other.sellerRecoveryRatio == sellerRecoveryRatio) &&
            (identical(other.depreciationPct, depreciationPct) ||
                other.depreciationPct == depreciationPct) &&
            (identical(other.ageMonths, ageMonths) ||
                other.ageMonths == ageMonths) &&
            (identical(other.lastValuedAt, lastValuedAt) ||
                other.lastValuedAt == lastValuedAt) &&
            (identical(other.modelName, modelName) ||
                other.modelName == modelName) &&
            (identical(other.assetType, assetType) ||
                other.assetType == assetType) &&
            (identical(other.conditionGrade, conditionGrade) ||
                other.conditionGrade == conditionGrade) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
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
        assetId,
        companyId,
        valuationFlag,
        status,
        createdAt,
        listedPrice,
        sellerOfferPrice,
        buyerAskPrice,
        grossMargin,
        consumerMarketAnchor,
        fairMarketValue,
        estBookValue,
        sellerRecoveryRatio,
        depreciationPct,
        ageMonths,
        lastValuedAt,
        modelName,
        assetType,
        conditionGrade,
        quantity,
        cpuScore,
        ramGb,
        storageGb
      ]);

  /// Create a copy of Listing
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ListingImplCopyWith<_$ListingImpl> get copyWith =>
      __$$ListingImplCopyWithImpl<_$ListingImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ListingImplToJson(
      this,
    );
  }
}

abstract class _Listing extends Listing {
  const factory _Listing(
      {required final String id,
      required final String assetId,
      required final String companyId,
      required final String valuationFlag,
      required final String status,
      @IsoDateTimeConverter() required final DateTime createdAt,
      final double? listedPrice,
      final double? sellerOfferPrice,
      final double? buyerAskPrice,
      final double? grossMargin,
      final double? consumerMarketAnchor,
      final double? fairMarketValue,
      final double? estBookValue,
      final double? sellerRecoveryRatio,
      final double? depreciationPct,
      final int? ageMonths,
      @NullableIsoDateTimeConverter() final DateTime? lastValuedAt,
      final String? modelName,
      final String? assetType,
      final String? conditionGrade,
      final int? quantity,
      final double? cpuScore,
      final int? ramGb,
      final int? storageGb}) = _$ListingImpl;
  const _Listing._() : super._();

  factory _Listing.fromJson(Map<String, dynamic> json) = _$ListingImpl.fromJson;

  @override
  String get id;
  @override
  String get assetId;
  @override
  String get companyId;
  @override
  String get valuationFlag;
  @override
  String get status;
  @override
  @IsoDateTimeConverter()
  DateTime get createdAt;
  @override
  double? get listedPrice;
  @override
  double? get sellerOfferPrice;
  @override
  double? get buyerAskPrice;
  @override
  double? get grossMargin;
  @override
  double? get consumerMarketAnchor;
  @override
  double? get fairMarketValue;
  @override
  double? get estBookValue;
  @override
  double? get sellerRecoveryRatio;
  @override
  double? get depreciationPct;
  @override
  int? get ageMonths;
  @override
  @NullableIsoDateTimeConverter()
  DateTime?
      get lastValuedAt; // Joined fields (denormalized from the asset row for marketplace cards)
  @override
  String? get modelName;
  @override
  String? get assetType;
  @override
  String? get conditionGrade;
  @override
  int? get quantity;
  @override
  double? get cpuScore;
  @override
  int? get ramGb;
  @override
  int? get storageGb;

  /// Create a copy of Listing
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ListingImplCopyWith<_$ListingImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

MarketplaceListing _$MarketplaceListingFromJson(Map<String, dynamic> json) {
  return _MarketplaceListing.fromJson(json);
}

/// @nodoc
mixin _$MarketplaceListing {
  String get id => throw _privateConstructorUsedError;
  String get assetId => throw _privateConstructorUsedError;
  String get companyId => throw _privateConstructorUsedError;
  String get valuationFlag => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  @IsoDateTimeConverter()
  DateTime get createdAt => throw _privateConstructorUsedError;
  double? get listedPrice => throw _privateConstructorUsedError;
  double? get sellerOfferPrice => throw _privateConstructorUsedError;
  double? get buyerAskPrice => throw _privateConstructorUsedError;
  double? get grossMargin => throw _privateConstructorUsedError;
  double? get consumerMarketAnchor => throw _privateConstructorUsedError;
  double? get fairMarketValue => throw _privateConstructorUsedError;
  double? get estBookValue => throw _privateConstructorUsedError;
  double? get sellerRecoveryRatio => throw _privateConstructorUsedError;
  double? get depreciationPct => throw _privateConstructorUsedError;
  int? get ageMonths => throw _privateConstructorUsedError;
  @NullableIsoDateTimeConverter()
  DateTime? get lastValuedAt => throw _privateConstructorUsedError;
  String? get modelName => throw _privateConstructorUsedError;
  String? get assetType => throw _privateConstructorUsedError;
  String? get conditionGrade => throw _privateConstructorUsedError;
  int? get quantity => throw _privateConstructorUsedError;
  double? get cpuScore => throw _privateConstructorUsedError;
  int? get ramGb => throw _privateConstructorUsedError;
  int? get storageGb => throw _privateConstructorUsedError;
  String? get sellerIndustry => throw _privateConstructorUsedError;
  String? get sellerSizeBand => throw _privateConstructorUsedError;

  /// Serializes this MarketplaceListing to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MarketplaceListing
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MarketplaceListingCopyWith<MarketplaceListing> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MarketplaceListingCopyWith<$Res> {
  factory $MarketplaceListingCopyWith(
          MarketplaceListing value, $Res Function(MarketplaceListing) then) =
      _$MarketplaceListingCopyWithImpl<$Res, MarketplaceListing>;
  @useResult
  $Res call(
      {String id,
      String assetId,
      String companyId,
      String valuationFlag,
      String status,
      @IsoDateTimeConverter() DateTime createdAt,
      double? listedPrice,
      double? sellerOfferPrice,
      double? buyerAskPrice,
      double? grossMargin,
      double? consumerMarketAnchor,
      double? fairMarketValue,
      double? estBookValue,
      double? sellerRecoveryRatio,
      double? depreciationPct,
      int? ageMonths,
      @NullableIsoDateTimeConverter() DateTime? lastValuedAt,
      String? modelName,
      String? assetType,
      String? conditionGrade,
      int? quantity,
      double? cpuScore,
      int? ramGb,
      int? storageGb,
      String? sellerIndustry,
      String? sellerSizeBand});
}

/// @nodoc
class _$MarketplaceListingCopyWithImpl<$Res, $Val extends MarketplaceListing>
    implements $MarketplaceListingCopyWith<$Res> {
  _$MarketplaceListingCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MarketplaceListing
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? assetId = null,
    Object? companyId = null,
    Object? valuationFlag = null,
    Object? status = null,
    Object? createdAt = null,
    Object? listedPrice = freezed,
    Object? sellerOfferPrice = freezed,
    Object? buyerAskPrice = freezed,
    Object? grossMargin = freezed,
    Object? consumerMarketAnchor = freezed,
    Object? fairMarketValue = freezed,
    Object? estBookValue = freezed,
    Object? sellerRecoveryRatio = freezed,
    Object? depreciationPct = freezed,
    Object? ageMonths = freezed,
    Object? lastValuedAt = freezed,
    Object? modelName = freezed,
    Object? assetType = freezed,
    Object? conditionGrade = freezed,
    Object? quantity = freezed,
    Object? cpuScore = freezed,
    Object? ramGb = freezed,
    Object? storageGb = freezed,
    Object? sellerIndustry = freezed,
    Object? sellerSizeBand = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      assetId: null == assetId
          ? _value.assetId
          : assetId // ignore: cast_nullable_to_non_nullable
              as String,
      companyId: null == companyId
          ? _value.companyId
          : companyId // ignore: cast_nullable_to_non_nullable
              as String,
      valuationFlag: null == valuationFlag
          ? _value.valuationFlag
          : valuationFlag // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      listedPrice: freezed == listedPrice
          ? _value.listedPrice
          : listedPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      sellerOfferPrice: freezed == sellerOfferPrice
          ? _value.sellerOfferPrice
          : sellerOfferPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      buyerAskPrice: freezed == buyerAskPrice
          ? _value.buyerAskPrice
          : buyerAskPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      grossMargin: freezed == grossMargin
          ? _value.grossMargin
          : grossMargin // ignore: cast_nullable_to_non_nullable
              as double?,
      consumerMarketAnchor: freezed == consumerMarketAnchor
          ? _value.consumerMarketAnchor
          : consumerMarketAnchor // ignore: cast_nullable_to_non_nullable
              as double?,
      fairMarketValue: freezed == fairMarketValue
          ? _value.fairMarketValue
          : fairMarketValue // ignore: cast_nullable_to_non_nullable
              as double?,
      estBookValue: freezed == estBookValue
          ? _value.estBookValue
          : estBookValue // ignore: cast_nullable_to_non_nullable
              as double?,
      sellerRecoveryRatio: freezed == sellerRecoveryRatio
          ? _value.sellerRecoveryRatio
          : sellerRecoveryRatio // ignore: cast_nullable_to_non_nullable
              as double?,
      depreciationPct: freezed == depreciationPct
          ? _value.depreciationPct
          : depreciationPct // ignore: cast_nullable_to_non_nullable
              as double?,
      ageMonths: freezed == ageMonths
          ? _value.ageMonths
          : ageMonths // ignore: cast_nullable_to_non_nullable
              as int?,
      lastValuedAt: freezed == lastValuedAt
          ? _value.lastValuedAt
          : lastValuedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      modelName: freezed == modelName
          ? _value.modelName
          : modelName // ignore: cast_nullable_to_non_nullable
              as String?,
      assetType: freezed == assetType
          ? _value.assetType
          : assetType // ignore: cast_nullable_to_non_nullable
              as String?,
      conditionGrade: freezed == conditionGrade
          ? _value.conditionGrade
          : conditionGrade // ignore: cast_nullable_to_non_nullable
              as String?,
      quantity: freezed == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int?,
      cpuScore: freezed == cpuScore
          ? _value.cpuScore
          : cpuScore // ignore: cast_nullable_to_non_nullable
              as double?,
      ramGb: freezed == ramGb
          ? _value.ramGb
          : ramGb // ignore: cast_nullable_to_non_nullable
              as int?,
      storageGb: freezed == storageGb
          ? _value.storageGb
          : storageGb // ignore: cast_nullable_to_non_nullable
              as int?,
      sellerIndustry: freezed == sellerIndustry
          ? _value.sellerIndustry
          : sellerIndustry // ignore: cast_nullable_to_non_nullable
              as String?,
      sellerSizeBand: freezed == sellerSizeBand
          ? _value.sellerSizeBand
          : sellerSizeBand // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$MarketplaceListingImplCopyWith<$Res>
    implements $MarketplaceListingCopyWith<$Res> {
  factory _$$MarketplaceListingImplCopyWith(_$MarketplaceListingImpl value,
          $Res Function(_$MarketplaceListingImpl) then) =
      __$$MarketplaceListingImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String assetId,
      String companyId,
      String valuationFlag,
      String status,
      @IsoDateTimeConverter() DateTime createdAt,
      double? listedPrice,
      double? sellerOfferPrice,
      double? buyerAskPrice,
      double? grossMargin,
      double? consumerMarketAnchor,
      double? fairMarketValue,
      double? estBookValue,
      double? sellerRecoveryRatio,
      double? depreciationPct,
      int? ageMonths,
      @NullableIsoDateTimeConverter() DateTime? lastValuedAt,
      String? modelName,
      String? assetType,
      String? conditionGrade,
      int? quantity,
      double? cpuScore,
      int? ramGb,
      int? storageGb,
      String? sellerIndustry,
      String? sellerSizeBand});
}

/// @nodoc
class __$$MarketplaceListingImplCopyWithImpl<$Res>
    extends _$MarketplaceListingCopyWithImpl<$Res, _$MarketplaceListingImpl>
    implements _$$MarketplaceListingImplCopyWith<$Res> {
  __$$MarketplaceListingImplCopyWithImpl(_$MarketplaceListingImpl _value,
      $Res Function(_$MarketplaceListingImpl) _then)
      : super(_value, _then);

  /// Create a copy of MarketplaceListing
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? assetId = null,
    Object? companyId = null,
    Object? valuationFlag = null,
    Object? status = null,
    Object? createdAt = null,
    Object? listedPrice = freezed,
    Object? sellerOfferPrice = freezed,
    Object? buyerAskPrice = freezed,
    Object? grossMargin = freezed,
    Object? consumerMarketAnchor = freezed,
    Object? fairMarketValue = freezed,
    Object? estBookValue = freezed,
    Object? sellerRecoveryRatio = freezed,
    Object? depreciationPct = freezed,
    Object? ageMonths = freezed,
    Object? lastValuedAt = freezed,
    Object? modelName = freezed,
    Object? assetType = freezed,
    Object? conditionGrade = freezed,
    Object? quantity = freezed,
    Object? cpuScore = freezed,
    Object? ramGb = freezed,
    Object? storageGb = freezed,
    Object? sellerIndustry = freezed,
    Object? sellerSizeBand = freezed,
  }) {
    return _then(_$MarketplaceListingImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      assetId: null == assetId
          ? _value.assetId
          : assetId // ignore: cast_nullable_to_non_nullable
              as String,
      companyId: null == companyId
          ? _value.companyId
          : companyId // ignore: cast_nullable_to_non_nullable
              as String,
      valuationFlag: null == valuationFlag
          ? _value.valuationFlag
          : valuationFlag // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      listedPrice: freezed == listedPrice
          ? _value.listedPrice
          : listedPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      sellerOfferPrice: freezed == sellerOfferPrice
          ? _value.sellerOfferPrice
          : sellerOfferPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      buyerAskPrice: freezed == buyerAskPrice
          ? _value.buyerAskPrice
          : buyerAskPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      grossMargin: freezed == grossMargin
          ? _value.grossMargin
          : grossMargin // ignore: cast_nullable_to_non_nullable
              as double?,
      consumerMarketAnchor: freezed == consumerMarketAnchor
          ? _value.consumerMarketAnchor
          : consumerMarketAnchor // ignore: cast_nullable_to_non_nullable
              as double?,
      fairMarketValue: freezed == fairMarketValue
          ? _value.fairMarketValue
          : fairMarketValue // ignore: cast_nullable_to_non_nullable
              as double?,
      estBookValue: freezed == estBookValue
          ? _value.estBookValue
          : estBookValue // ignore: cast_nullable_to_non_nullable
              as double?,
      sellerRecoveryRatio: freezed == sellerRecoveryRatio
          ? _value.sellerRecoveryRatio
          : sellerRecoveryRatio // ignore: cast_nullable_to_non_nullable
              as double?,
      depreciationPct: freezed == depreciationPct
          ? _value.depreciationPct
          : depreciationPct // ignore: cast_nullable_to_non_nullable
              as double?,
      ageMonths: freezed == ageMonths
          ? _value.ageMonths
          : ageMonths // ignore: cast_nullable_to_non_nullable
              as int?,
      lastValuedAt: freezed == lastValuedAt
          ? _value.lastValuedAt
          : lastValuedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      modelName: freezed == modelName
          ? _value.modelName
          : modelName // ignore: cast_nullable_to_non_nullable
              as String?,
      assetType: freezed == assetType
          ? _value.assetType
          : assetType // ignore: cast_nullable_to_non_nullable
              as String?,
      conditionGrade: freezed == conditionGrade
          ? _value.conditionGrade
          : conditionGrade // ignore: cast_nullable_to_non_nullable
              as String?,
      quantity: freezed == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int?,
      cpuScore: freezed == cpuScore
          ? _value.cpuScore
          : cpuScore // ignore: cast_nullable_to_non_nullable
              as double?,
      ramGb: freezed == ramGb
          ? _value.ramGb
          : ramGb // ignore: cast_nullable_to_non_nullable
              as int?,
      storageGb: freezed == storageGb
          ? _value.storageGb
          : storageGb // ignore: cast_nullable_to_non_nullable
              as int?,
      sellerIndustry: freezed == sellerIndustry
          ? _value.sellerIndustry
          : sellerIndustry // ignore: cast_nullable_to_non_nullable
              as String?,
      sellerSizeBand: freezed == sellerSizeBand
          ? _value.sellerSizeBand
          : sellerSizeBand // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$MarketplaceListingImpl extends _MarketplaceListing {
  const _$MarketplaceListingImpl(
      {required this.id,
      required this.assetId,
      required this.companyId,
      required this.valuationFlag,
      required this.status,
      @IsoDateTimeConverter() required this.createdAt,
      this.listedPrice,
      this.sellerOfferPrice,
      this.buyerAskPrice,
      this.grossMargin,
      this.consumerMarketAnchor,
      this.fairMarketValue,
      this.estBookValue,
      this.sellerRecoveryRatio,
      this.depreciationPct,
      this.ageMonths,
      @NullableIsoDateTimeConverter() this.lastValuedAt,
      this.modelName,
      this.assetType,
      this.conditionGrade,
      this.quantity,
      this.cpuScore,
      this.ramGb,
      this.storageGb,
      this.sellerIndustry,
      this.sellerSizeBand})
      : super._();

  factory _$MarketplaceListingImpl.fromJson(Map<String, dynamic> json) =>
      _$$MarketplaceListingImplFromJson(json);

  @override
  final String id;
  @override
  final String assetId;
  @override
  final String companyId;
  @override
  final String valuationFlag;
  @override
  final String status;
  @override
  @IsoDateTimeConverter()
  final DateTime createdAt;
  @override
  final double? listedPrice;
  @override
  final double? sellerOfferPrice;
  @override
  final double? buyerAskPrice;
  @override
  final double? grossMargin;
  @override
  final double? consumerMarketAnchor;
  @override
  final double? fairMarketValue;
  @override
  final double? estBookValue;
  @override
  final double? sellerRecoveryRatio;
  @override
  final double? depreciationPct;
  @override
  final int? ageMonths;
  @override
  @NullableIsoDateTimeConverter()
  final DateTime? lastValuedAt;
  @override
  final String? modelName;
  @override
  final String? assetType;
  @override
  final String? conditionGrade;
  @override
  final int? quantity;
  @override
  final double? cpuScore;
  @override
  final int? ramGb;
  @override
  final int? storageGb;
  @override
  final String? sellerIndustry;
  @override
  final String? sellerSizeBand;

  @override
  String toString() {
    return 'MarketplaceListing(id: $id, assetId: $assetId, companyId: $companyId, valuationFlag: $valuationFlag, status: $status, createdAt: $createdAt, listedPrice: $listedPrice, sellerOfferPrice: $sellerOfferPrice, buyerAskPrice: $buyerAskPrice, grossMargin: $grossMargin, consumerMarketAnchor: $consumerMarketAnchor, fairMarketValue: $fairMarketValue, estBookValue: $estBookValue, sellerRecoveryRatio: $sellerRecoveryRatio, depreciationPct: $depreciationPct, ageMonths: $ageMonths, lastValuedAt: $lastValuedAt, modelName: $modelName, assetType: $assetType, conditionGrade: $conditionGrade, quantity: $quantity, cpuScore: $cpuScore, ramGb: $ramGb, storageGb: $storageGb, sellerIndustry: $sellerIndustry, sellerSizeBand: $sellerSizeBand)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MarketplaceListingImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.assetId, assetId) || other.assetId == assetId) &&
            (identical(other.companyId, companyId) ||
                other.companyId == companyId) &&
            (identical(other.valuationFlag, valuationFlag) ||
                other.valuationFlag == valuationFlag) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.listedPrice, listedPrice) ||
                other.listedPrice == listedPrice) &&
            (identical(other.sellerOfferPrice, sellerOfferPrice) ||
                other.sellerOfferPrice == sellerOfferPrice) &&
            (identical(other.buyerAskPrice, buyerAskPrice) ||
                other.buyerAskPrice == buyerAskPrice) &&
            (identical(other.grossMargin, grossMargin) ||
                other.grossMargin == grossMargin) &&
            (identical(other.consumerMarketAnchor, consumerMarketAnchor) ||
                other.consumerMarketAnchor == consumerMarketAnchor) &&
            (identical(other.fairMarketValue, fairMarketValue) ||
                other.fairMarketValue == fairMarketValue) &&
            (identical(other.estBookValue, estBookValue) ||
                other.estBookValue == estBookValue) &&
            (identical(other.sellerRecoveryRatio, sellerRecoveryRatio) ||
                other.sellerRecoveryRatio == sellerRecoveryRatio) &&
            (identical(other.depreciationPct, depreciationPct) ||
                other.depreciationPct == depreciationPct) &&
            (identical(other.ageMonths, ageMonths) ||
                other.ageMonths == ageMonths) &&
            (identical(other.lastValuedAt, lastValuedAt) ||
                other.lastValuedAt == lastValuedAt) &&
            (identical(other.modelName, modelName) ||
                other.modelName == modelName) &&
            (identical(other.assetType, assetType) ||
                other.assetType == assetType) &&
            (identical(other.conditionGrade, conditionGrade) ||
                other.conditionGrade == conditionGrade) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.cpuScore, cpuScore) ||
                other.cpuScore == cpuScore) &&
            (identical(other.ramGb, ramGb) || other.ramGb == ramGb) &&
            (identical(other.storageGb, storageGb) ||
                other.storageGb == storageGb) &&
            (identical(other.sellerIndustry, sellerIndustry) ||
                other.sellerIndustry == sellerIndustry) &&
            (identical(other.sellerSizeBand, sellerSizeBand) ||
                other.sellerSizeBand == sellerSizeBand));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        assetId,
        companyId,
        valuationFlag,
        status,
        createdAt,
        listedPrice,
        sellerOfferPrice,
        buyerAskPrice,
        grossMargin,
        consumerMarketAnchor,
        fairMarketValue,
        estBookValue,
        sellerRecoveryRatio,
        depreciationPct,
        ageMonths,
        lastValuedAt,
        modelName,
        assetType,
        conditionGrade,
        quantity,
        cpuScore,
        ramGb,
        storageGb,
        sellerIndustry,
        sellerSizeBand
      ]);

  /// Create a copy of MarketplaceListing
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MarketplaceListingImplCopyWith<_$MarketplaceListingImpl> get copyWith =>
      __$$MarketplaceListingImplCopyWithImpl<_$MarketplaceListingImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MarketplaceListingImplToJson(
      this,
    );
  }
}

abstract class _MarketplaceListing extends MarketplaceListing {
  const factory _MarketplaceListing(
      {required final String id,
      required final String assetId,
      required final String companyId,
      required final String valuationFlag,
      required final String status,
      @IsoDateTimeConverter() required final DateTime createdAt,
      final double? listedPrice,
      final double? sellerOfferPrice,
      final double? buyerAskPrice,
      final double? grossMargin,
      final double? consumerMarketAnchor,
      final double? fairMarketValue,
      final double? estBookValue,
      final double? sellerRecoveryRatio,
      final double? depreciationPct,
      final int? ageMonths,
      @NullableIsoDateTimeConverter() final DateTime? lastValuedAt,
      final String? modelName,
      final String? assetType,
      final String? conditionGrade,
      final int? quantity,
      final double? cpuScore,
      final int? ramGb,
      final int? storageGb,
      final String? sellerIndustry,
      final String? sellerSizeBand}) = _$MarketplaceListingImpl;
  const _MarketplaceListing._() : super._();

  factory _MarketplaceListing.fromJson(Map<String, dynamic> json) =
      _$MarketplaceListingImpl.fromJson;

  @override
  String get id;
  @override
  String get assetId;
  @override
  String get companyId;
  @override
  String get valuationFlag;
  @override
  String get status;
  @override
  @IsoDateTimeConverter()
  DateTime get createdAt;
  @override
  double? get listedPrice;
  @override
  double? get sellerOfferPrice;
  @override
  double? get buyerAskPrice;
  @override
  double? get grossMargin;
  @override
  double? get consumerMarketAnchor;
  @override
  double? get fairMarketValue;
  @override
  double? get estBookValue;
  @override
  double? get sellerRecoveryRatio;
  @override
  double? get depreciationPct;
  @override
  int? get ageMonths;
  @override
  @NullableIsoDateTimeConverter()
  DateTime? get lastValuedAt;
  @override
  String? get modelName;
  @override
  String? get assetType;
  @override
  String? get conditionGrade;
  @override
  int? get quantity;
  @override
  double? get cpuScore;
  @override
  int? get ramGb;
  @override
  int? get storageGb;
  @override
  String? get sellerIndustry;
  @override
  String? get sellerSizeBand;

  /// Create a copy of MarketplaceListing
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MarketplaceListingImplCopyWith<_$MarketplaceListingImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
