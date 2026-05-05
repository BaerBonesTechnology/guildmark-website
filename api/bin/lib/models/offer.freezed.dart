// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'offer.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

BuyerOffer _$BuyerOfferFromJson(Map<String, dynamic> json) {
  return _BuyerOffer.fromJson(json);
}

/// @nodoc
mixin _$BuyerOffer {
  String get id => throw _privateConstructorUsedError;
  String get listingId => throw _privateConstructorUsedError;
  String get buyerCompanyId => throw _privateConstructorUsedError;
  double get offerPrice => throw _privateConstructorUsedError;
  int get quantity => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  @IsoDateTimeConverter()
  DateTime get expiresAt => throw _privateConstructorUsedError;
  @IsoDateTimeConverter()
  DateTime get createdAt => throw _privateConstructorUsedError;
  double? get counterPrice => throw _privateConstructorUsedError;
  String? get message => throw _privateConstructorUsedError;

  /// Serializes this BuyerOffer to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BuyerOffer
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BuyerOfferCopyWith<BuyerOffer> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BuyerOfferCopyWith<$Res> {
  factory $BuyerOfferCopyWith(
          BuyerOffer value, $Res Function(BuyerOffer) then) =
      _$BuyerOfferCopyWithImpl<$Res, BuyerOffer>;
  @useResult
  $Res call(
      {String id,
      String listingId,
      String buyerCompanyId,
      double offerPrice,
      int quantity,
      String status,
      @IsoDateTimeConverter() DateTime expiresAt,
      @IsoDateTimeConverter() DateTime createdAt,
      double? counterPrice,
      String? message});
}

/// @nodoc
class _$BuyerOfferCopyWithImpl<$Res, $Val extends BuyerOffer>
    implements $BuyerOfferCopyWith<$Res> {
  _$BuyerOfferCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BuyerOffer
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? listingId = null,
    Object? buyerCompanyId = null,
    Object? offerPrice = null,
    Object? quantity = null,
    Object? status = null,
    Object? expiresAt = null,
    Object? createdAt = null,
    Object? counterPrice = freezed,
    Object? message = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      listingId: null == listingId
          ? _value.listingId
          : listingId // ignore: cast_nullable_to_non_nullable
              as String,
      buyerCompanyId: null == buyerCompanyId
          ? _value.buyerCompanyId
          : buyerCompanyId // ignore: cast_nullable_to_non_nullable
              as String,
      offerPrice: null == offerPrice
          ? _value.offerPrice
          : offerPrice // ignore: cast_nullable_to_non_nullable
              as double,
      quantity: null == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      expiresAt: null == expiresAt
          ? _value.expiresAt
          : expiresAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      counterPrice: freezed == counterPrice
          ? _value.counterPrice
          : counterPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      message: freezed == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$BuyerOfferImplCopyWith<$Res>
    implements $BuyerOfferCopyWith<$Res> {
  factory _$$BuyerOfferImplCopyWith(
          _$BuyerOfferImpl value, $Res Function(_$BuyerOfferImpl) then) =
      __$$BuyerOfferImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String listingId,
      String buyerCompanyId,
      double offerPrice,
      int quantity,
      String status,
      @IsoDateTimeConverter() DateTime expiresAt,
      @IsoDateTimeConverter() DateTime createdAt,
      double? counterPrice,
      String? message});
}

/// @nodoc
class __$$BuyerOfferImplCopyWithImpl<$Res>
    extends _$BuyerOfferCopyWithImpl<$Res, _$BuyerOfferImpl>
    implements _$$BuyerOfferImplCopyWith<$Res> {
  __$$BuyerOfferImplCopyWithImpl(
      _$BuyerOfferImpl _value, $Res Function(_$BuyerOfferImpl) _then)
      : super(_value, _then);

  /// Create a copy of BuyerOffer
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? listingId = null,
    Object? buyerCompanyId = null,
    Object? offerPrice = null,
    Object? quantity = null,
    Object? status = null,
    Object? expiresAt = null,
    Object? createdAt = null,
    Object? counterPrice = freezed,
    Object? message = freezed,
  }) {
    return _then(_$BuyerOfferImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      listingId: null == listingId
          ? _value.listingId
          : listingId // ignore: cast_nullable_to_non_nullable
              as String,
      buyerCompanyId: null == buyerCompanyId
          ? _value.buyerCompanyId
          : buyerCompanyId // ignore: cast_nullable_to_non_nullable
              as String,
      offerPrice: null == offerPrice
          ? _value.offerPrice
          : offerPrice // ignore: cast_nullable_to_non_nullable
              as double,
      quantity: null == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      expiresAt: null == expiresAt
          ? _value.expiresAt
          : expiresAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      counterPrice: freezed == counterPrice
          ? _value.counterPrice
          : counterPrice // ignore: cast_nullable_to_non_nullable
              as double?,
      message: freezed == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$BuyerOfferImpl extends _BuyerOffer {
  const _$BuyerOfferImpl(
      {required this.id,
      required this.listingId,
      required this.buyerCompanyId,
      required this.offerPrice,
      required this.quantity,
      required this.status,
      @IsoDateTimeConverter() required this.expiresAt,
      @IsoDateTimeConverter() required this.createdAt,
      this.counterPrice,
      this.message})
      : super._();

  factory _$BuyerOfferImpl.fromJson(Map<String, dynamic> json) =>
      _$$BuyerOfferImplFromJson(json);

  @override
  final String id;
  @override
  final String listingId;
  @override
  final String buyerCompanyId;
  @override
  final double offerPrice;
  @override
  final int quantity;
  @override
  final String status;
  @override
  @IsoDateTimeConverter()
  final DateTime expiresAt;
  @override
  @IsoDateTimeConverter()
  final DateTime createdAt;
  @override
  final double? counterPrice;
  @override
  final String? message;

  @override
  String toString() {
    return 'BuyerOffer(id: $id, listingId: $listingId, buyerCompanyId: $buyerCompanyId, offerPrice: $offerPrice, quantity: $quantity, status: $status, expiresAt: $expiresAt, createdAt: $createdAt, counterPrice: $counterPrice, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BuyerOfferImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.listingId, listingId) ||
                other.listingId == listingId) &&
            (identical(other.buyerCompanyId, buyerCompanyId) ||
                other.buyerCompanyId == buyerCompanyId) &&
            (identical(other.offerPrice, offerPrice) ||
                other.offerPrice == offerPrice) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.expiresAt, expiresAt) ||
                other.expiresAt == expiresAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.counterPrice, counterPrice) ||
                other.counterPrice == counterPrice) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      listingId,
      buyerCompanyId,
      offerPrice,
      quantity,
      status,
      expiresAt,
      createdAt,
      counterPrice,
      message);

  /// Create a copy of BuyerOffer
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BuyerOfferImplCopyWith<_$BuyerOfferImpl> get copyWith =>
      __$$BuyerOfferImplCopyWithImpl<_$BuyerOfferImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BuyerOfferImplToJson(
      this,
    );
  }
}

abstract class _BuyerOffer extends BuyerOffer {
  const factory _BuyerOffer(
      {required final String id,
      required final String listingId,
      required final String buyerCompanyId,
      required final double offerPrice,
      required final int quantity,
      required final String status,
      @IsoDateTimeConverter() required final DateTime expiresAt,
      @IsoDateTimeConverter() required final DateTime createdAt,
      final double? counterPrice,
      final String? message}) = _$BuyerOfferImpl;
  const _BuyerOffer._() : super._();

  factory _BuyerOffer.fromJson(Map<String, dynamic> json) =
      _$BuyerOfferImpl.fromJson;

  @override
  String get id;
  @override
  String get listingId;
  @override
  String get buyerCompanyId;
  @override
  double get offerPrice;
  @override
  int get quantity;
  @override
  String get status;
  @override
  @IsoDateTimeConverter()
  DateTime get expiresAt;
  @override
  @IsoDateTimeConverter()
  DateTime get createdAt;
  @override
  double? get counterPrice;
  @override
  String? get message;

  /// Create a copy of BuyerOffer
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BuyerOfferImplCopyWith<_$BuyerOfferImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
