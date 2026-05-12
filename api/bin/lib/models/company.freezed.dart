// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'company.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Company _$CompanyFromJson(Map<String, dynamic> json) {
  return _Company.fromJson(json);
}

/// @nodoc
mixin _$Company {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get logoUrl => throw _privateConstructorUsedError;
  List<User>? get personnel => throw _privateConstructorUsedError;
  PortfolioSummary? get portfolioSummary => throw _privateConstructorUsedError;
  Map<String, String>? get mdmConnections =>
      throw _privateConstructorUsedError; // Map of MDM type to connection ID
  Map<String, String>? get customFields =>
      throw _privateConstructorUsedError; // For extensibility
  List<TaxInvoice>? get invoices =>
      throw _privateConstructorUsedError; // Optional list of recent invoices
  List<Listing>? get listings =>
      throw _privateConstructorUsedError; // Optional list of recent listings
  List<BuyerOffer>? get offers =>
      throw _privateConstructorUsedError; // Optional map of listings to buyer offers
// ── Per-company Jamf Pro credentials (stored in DB, not env) ───
  String? get jamfInstanceUrl => throw _privateConstructorUsedError;
  String? get jamfClientId => throw _privateConstructorUsedError;
  String? get jamfClientSecret =>
      throw _privateConstructorUsedError; // write-only; API returns null after save
// ── Per-company Jamf School credentials ────────────────────────
  String? get jamfSchoolUrl => throw _privateConstructorUsedError;
  String? get jamfSchoolApiKey =>
      throw _privateConstructorUsedError; // write-only; API returns null after save
// ── Per-company Intune / Azure AD credentials ───────────────────
  String? get azureTenantId => throw _privateConstructorUsedError;
  String? get azureClientId => throw _privateConstructorUsedError;
  String? get azureClientSecret => throw _privateConstructorUsedError;

  /// Serializes this Company to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Company
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CompanyCopyWith<Company> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CompanyCopyWith<$Res> {
  factory $CompanyCopyWith(Company value, $Res Function(Company) then) =
      _$CompanyCopyWithImpl<$Res, Company>;
  @useResult
  $Res call(
      {String id,
      String name,
      String? logoUrl,
      List<User>? personnel,
      PortfolioSummary? portfolioSummary,
      Map<String, String>? mdmConnections,
      Map<String, String>? customFields,
      List<TaxInvoice>? invoices,
      List<Listing>? listings,
      List<BuyerOffer>? offers,
      String? jamfInstanceUrl,
      String? jamfClientId,
      String? jamfClientSecret,
      String? jamfSchoolUrl,
      String? jamfSchoolApiKey,
      String? azureTenantId,
      String? azureClientId,
      String? azureClientSecret});

  $PortfolioSummaryCopyWith<$Res>? get portfolioSummary;
}

/// @nodoc
class _$CompanyCopyWithImpl<$Res, $Val extends Company>
    implements $CompanyCopyWith<$Res> {
  _$CompanyCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Company
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? logoUrl = freezed,
    Object? personnel = freezed,
    Object? portfolioSummary = freezed,
    Object? mdmConnections = freezed,
    Object? customFields = freezed,
    Object? invoices = freezed,
    Object? listings = freezed,
    Object? offers = freezed,
    Object? jamfInstanceUrl = freezed,
    Object? jamfClientId = freezed,
    Object? jamfClientSecret = freezed,
    Object? jamfSchoolUrl = freezed,
    Object? jamfSchoolApiKey = freezed,
    Object? azureTenantId = freezed,
    Object? azureClientId = freezed,
    Object? azureClientSecret = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      logoUrl: freezed == logoUrl
          ? _value.logoUrl
          : logoUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      personnel: freezed == personnel
          ? _value.personnel
          : personnel // ignore: cast_nullable_to_non_nullable
              as List<User>?,
      portfolioSummary: freezed == portfolioSummary
          ? _value.portfolioSummary
          : portfolioSummary // ignore: cast_nullable_to_non_nullable
              as PortfolioSummary?,
      mdmConnections: freezed == mdmConnections
          ? _value.mdmConnections
          : mdmConnections // ignore: cast_nullable_to_non_nullable
              as Map<String, String>?,
      customFields: freezed == customFields
          ? _value.customFields
          : customFields // ignore: cast_nullable_to_non_nullable
              as Map<String, String>?,
      invoices: freezed == invoices
          ? _value.invoices
          : invoices // ignore: cast_nullable_to_non_nullable
              as List<TaxInvoice>?,
      listings: freezed == listings
          ? _value.listings
          : listings // ignore: cast_nullable_to_non_nullable
              as List<Listing>?,
      offers: freezed == offers
          ? _value.offers
          : offers // ignore: cast_nullable_to_non_nullable
              as List<BuyerOffer>?,
      jamfInstanceUrl: freezed == jamfInstanceUrl
          ? _value.jamfInstanceUrl
          : jamfInstanceUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      jamfClientId: freezed == jamfClientId
          ? _value.jamfClientId
          : jamfClientId // ignore: cast_nullable_to_non_nullable
              as String?,
      jamfClientSecret: freezed == jamfClientSecret
          ? _value.jamfClientSecret
          : jamfClientSecret // ignore: cast_nullable_to_non_nullable
              as String?,
      jamfSchoolUrl: freezed == jamfSchoolUrl
          ? _value.jamfSchoolUrl
          : jamfSchoolUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      jamfSchoolApiKey: freezed == jamfSchoolApiKey
          ? _value.jamfSchoolApiKey
          : jamfSchoolApiKey // ignore: cast_nullable_to_non_nullable
              as String?,
      azureTenantId: freezed == azureTenantId
          ? _value.azureTenantId
          : azureTenantId // ignore: cast_nullable_to_non_nullable
              as String?,
      azureClientId: freezed == azureClientId
          ? _value.azureClientId
          : azureClientId // ignore: cast_nullable_to_non_nullable
              as String?,
      azureClientSecret: freezed == azureClientSecret
          ? _value.azureClientSecret
          : azureClientSecret // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  /// Create a copy of Company
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PortfolioSummaryCopyWith<$Res>? get portfolioSummary {
    if (_value.portfolioSummary == null) {
      return null;
    }

    return $PortfolioSummaryCopyWith<$Res>(_value.portfolioSummary!, (value) {
      return _then(_value.copyWith(portfolioSummary: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$CompanyImplCopyWith<$Res> implements $CompanyCopyWith<$Res> {
  factory _$$CompanyImplCopyWith(
          _$CompanyImpl value, $Res Function(_$CompanyImpl) then) =
      __$$CompanyImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String? logoUrl,
      List<User>? personnel,
      PortfolioSummary? portfolioSummary,
      Map<String, String>? mdmConnections,
      Map<String, String>? customFields,
      List<TaxInvoice>? invoices,
      List<Listing>? listings,
      List<BuyerOffer>? offers,
      String? jamfInstanceUrl,
      String? jamfClientId,
      String? jamfClientSecret,
      String? jamfSchoolUrl,
      String? jamfSchoolApiKey,
      String? azureTenantId,
      String? azureClientId,
      String? azureClientSecret});

  @override
  $PortfolioSummaryCopyWith<$Res>? get portfolioSummary;
}

/// @nodoc
class __$$CompanyImplCopyWithImpl<$Res>
    extends _$CompanyCopyWithImpl<$Res, _$CompanyImpl>
    implements _$$CompanyImplCopyWith<$Res> {
  __$$CompanyImplCopyWithImpl(
      _$CompanyImpl _value, $Res Function(_$CompanyImpl) _then)
      : super(_value, _then);

  /// Create a copy of Company
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? logoUrl = freezed,
    Object? personnel = freezed,
    Object? portfolioSummary = freezed,
    Object? mdmConnections = freezed,
    Object? customFields = freezed,
    Object? invoices = freezed,
    Object? listings = freezed,
    Object? offers = freezed,
    Object? jamfInstanceUrl = freezed,
    Object? jamfClientId = freezed,
    Object? jamfClientSecret = freezed,
    Object? jamfSchoolUrl = freezed,
    Object? jamfSchoolApiKey = freezed,
    Object? azureTenantId = freezed,
    Object? azureClientId = freezed,
    Object? azureClientSecret = freezed,
  }) {
    return _then(_$CompanyImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      logoUrl: freezed == logoUrl
          ? _value.logoUrl
          : logoUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      personnel: freezed == personnel
          ? _value._personnel
          : personnel // ignore: cast_nullable_to_non_nullable
              as List<User>?,
      portfolioSummary: freezed == portfolioSummary
          ? _value.portfolioSummary
          : portfolioSummary // ignore: cast_nullable_to_non_nullable
              as PortfolioSummary?,
      mdmConnections: freezed == mdmConnections
          ? _value._mdmConnections
          : mdmConnections // ignore: cast_nullable_to_non_nullable
              as Map<String, String>?,
      customFields: freezed == customFields
          ? _value._customFields
          : customFields // ignore: cast_nullable_to_non_nullable
              as Map<String, String>?,
      invoices: freezed == invoices
          ? _value._invoices
          : invoices // ignore: cast_nullable_to_non_nullable
              as List<TaxInvoice>?,
      listings: freezed == listings
          ? _value._listings
          : listings // ignore: cast_nullable_to_non_nullable
              as List<Listing>?,
      offers: freezed == offers
          ? _value._offers
          : offers // ignore: cast_nullable_to_non_nullable
              as List<BuyerOffer>?,
      jamfInstanceUrl: freezed == jamfInstanceUrl
          ? _value.jamfInstanceUrl
          : jamfInstanceUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      jamfClientId: freezed == jamfClientId
          ? _value.jamfClientId
          : jamfClientId // ignore: cast_nullable_to_non_nullable
              as String?,
      jamfClientSecret: freezed == jamfClientSecret
          ? _value.jamfClientSecret
          : jamfClientSecret // ignore: cast_nullable_to_non_nullable
              as String?,
      jamfSchoolUrl: freezed == jamfSchoolUrl
          ? _value.jamfSchoolUrl
          : jamfSchoolUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      jamfSchoolApiKey: freezed == jamfSchoolApiKey
          ? _value.jamfSchoolApiKey
          : jamfSchoolApiKey // ignore: cast_nullable_to_non_nullable
              as String?,
      azureTenantId: freezed == azureTenantId
          ? _value.azureTenantId
          : azureTenantId // ignore: cast_nullable_to_non_nullable
              as String?,
      azureClientId: freezed == azureClientId
          ? _value.azureClientId
          : azureClientId // ignore: cast_nullable_to_non_nullable
              as String?,
      azureClientSecret: freezed == azureClientSecret
          ? _value.azureClientSecret
          : azureClientSecret // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CompanyImpl implements _Company {
  const _$CompanyImpl(
      {required this.id,
      required this.name,
      this.logoUrl,
      final List<User>? personnel,
      this.portfolioSummary,
      final Map<String, String>? mdmConnections,
      final Map<String, String>? customFields,
      final List<TaxInvoice>? invoices,
      final List<Listing>? listings,
      final List<BuyerOffer>? offers,
      this.jamfInstanceUrl,
      this.jamfClientId,
      this.jamfClientSecret,
      this.jamfSchoolUrl,
      this.jamfSchoolApiKey,
      this.azureTenantId,
      this.azureClientId,
      this.azureClientSecret})
      : _personnel = personnel,
        _mdmConnections = mdmConnections,
        _customFields = customFields,
        _invoices = invoices,
        _listings = listings,
        _offers = offers;

  factory _$CompanyImpl.fromJson(Map<String, dynamic> json) =>
      _$$CompanyImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? logoUrl;
  final List<User>? _personnel;
  @override
  List<User>? get personnel {
    final value = _personnel;
    if (value == null) return null;
    if (_personnel is EqualUnmodifiableListView) return _personnel;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final PortfolioSummary? portfolioSummary;
  final Map<String, String>? _mdmConnections;
  @override
  Map<String, String>? get mdmConnections {
    final value = _mdmConnections;
    if (value == null) return null;
    if (_mdmConnections is EqualUnmodifiableMapView) return _mdmConnections;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

// Map of MDM type to connection ID
  final Map<String, String>? _customFields;
// Map of MDM type to connection ID
  @override
  Map<String, String>? get customFields {
    final value = _customFields;
    if (value == null) return null;
    if (_customFields is EqualUnmodifiableMapView) return _customFields;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

// For extensibility
  final List<TaxInvoice>? _invoices;
// For extensibility
  @override
  List<TaxInvoice>? get invoices {
    final value = _invoices;
    if (value == null) return null;
    if (_invoices is EqualUnmodifiableListView) return _invoices;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

// Optional list of recent invoices
  final List<Listing>? _listings;
// Optional list of recent invoices
  @override
  List<Listing>? get listings {
    final value = _listings;
    if (value == null) return null;
    if (_listings is EqualUnmodifiableListView) return _listings;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

// Optional list of recent listings
  final List<BuyerOffer>? _offers;
// Optional list of recent listings
  @override
  List<BuyerOffer>? get offers {
    final value = _offers;
    if (value == null) return null;
    if (_offers is EqualUnmodifiableListView) return _offers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

// Optional map of listings to buyer offers
// ── Per-company Jamf Pro credentials (stored in DB, not env) ───
  @override
  final String? jamfInstanceUrl;
  @override
  final String? jamfClientId;
  @override
  final String? jamfClientSecret;
// write-only; API returns null after save
// ── Per-company Jamf School credentials ────────────────────────
  @override
  final String? jamfSchoolUrl;
  @override
  final String? jamfSchoolApiKey;
// write-only; API returns null after save
// ── Per-company Intune / Azure AD credentials ───────────────────
  @override
  final String? azureTenantId;
  @override
  final String? azureClientId;
  @override
  final String? azureClientSecret;

  @override
  String toString() {
    return 'Company(id: $id, name: $name, logoUrl: $logoUrl, personnel: $personnel, portfolioSummary: $portfolioSummary, mdmConnections: $mdmConnections, customFields: $customFields, invoices: $invoices, listings: $listings, offers: $offers, jamfInstanceUrl: $jamfInstanceUrl, jamfClientId: $jamfClientId, jamfClientSecret: $jamfClientSecret, jamfSchoolUrl: $jamfSchoolUrl, jamfSchoolApiKey: $jamfSchoolApiKey, azureTenantId: $azureTenantId, azureClientId: $azureClientId, azureClientSecret: $azureClientSecret)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CompanyImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl) &&
            const DeepCollectionEquality()
                .equals(other._personnel, _personnel) &&
            (identical(other.portfolioSummary, portfolioSummary) ||
                other.portfolioSummary == portfolioSummary) &&
            const DeepCollectionEquality()
                .equals(other._mdmConnections, _mdmConnections) &&
            const DeepCollectionEquality()
                .equals(other._customFields, _customFields) &&
            const DeepCollectionEquality().equals(other._invoices, _invoices) &&
            const DeepCollectionEquality().equals(other._listings, _listings) &&
            const DeepCollectionEquality().equals(other._offers, _offers) &&
            (identical(other.jamfInstanceUrl, jamfInstanceUrl) ||
                other.jamfInstanceUrl == jamfInstanceUrl) &&
            (identical(other.jamfClientId, jamfClientId) ||
                other.jamfClientId == jamfClientId) &&
            (identical(other.jamfClientSecret, jamfClientSecret) ||
                other.jamfClientSecret == jamfClientSecret) &&
            (identical(other.jamfSchoolUrl, jamfSchoolUrl) ||
                other.jamfSchoolUrl == jamfSchoolUrl) &&
            (identical(other.jamfSchoolApiKey, jamfSchoolApiKey) ||
                other.jamfSchoolApiKey == jamfSchoolApiKey) &&
            (identical(other.azureTenantId, azureTenantId) ||
                other.azureTenantId == azureTenantId) &&
            (identical(other.azureClientId, azureClientId) ||
                other.azureClientId == azureClientId) &&
            (identical(other.azureClientSecret, azureClientSecret) ||
                other.azureClientSecret == azureClientSecret));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      logoUrl,
      const DeepCollectionEquality().hash(_personnel),
      portfolioSummary,
      const DeepCollectionEquality().hash(_mdmConnections),
      const DeepCollectionEquality().hash(_customFields),
      const DeepCollectionEquality().hash(_invoices),
      const DeepCollectionEquality().hash(_listings),
      const DeepCollectionEquality().hash(_offers),
      jamfInstanceUrl,
      jamfClientId,
      jamfClientSecret,
      jamfSchoolUrl,
      jamfSchoolApiKey,
      azureTenantId,
      azureClientId,
      azureClientSecret);

  /// Create a copy of Company
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CompanyImplCopyWith<_$CompanyImpl> get copyWith =>
      __$$CompanyImplCopyWithImpl<_$CompanyImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CompanyImplToJson(
      this,
    );
  }
}

abstract class _Company implements Company {
  const factory _Company(
      {required final String id,
      required final String name,
      final String? logoUrl,
      final List<User>? personnel,
      final PortfolioSummary? portfolioSummary,
      final Map<String, String>? mdmConnections,
      final Map<String, String>? customFields,
      final List<TaxInvoice>? invoices,
      final List<Listing>? listings,
      final List<BuyerOffer>? offers,
      final String? jamfInstanceUrl,
      final String? jamfClientId,
      final String? jamfClientSecret,
      final String? jamfSchoolUrl,
      final String? jamfSchoolApiKey,
      final String? azureTenantId,
      final String? azureClientId,
      final String? azureClientSecret}) = _$CompanyImpl;

  factory _Company.fromJson(Map<String, dynamic> json) = _$CompanyImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String? get logoUrl;
  @override
  List<User>? get personnel;
  @override
  PortfolioSummary? get portfolioSummary;
  @override
  Map<String, String>? get mdmConnections; // Map of MDM type to connection ID
  @override
  Map<String, String>? get customFields; // For extensibility
  @override
  List<TaxInvoice>? get invoices; // Optional list of recent invoices
  @override
  List<Listing>? get listings; // Optional list of recent listings
  @override
  List<BuyerOffer>? get offers; // Optional map of listings to buyer offers
// ── Per-company Jamf Pro credentials (stored in DB, not env) ───
  @override
  String? get jamfInstanceUrl;
  @override
  String? get jamfClientId;
  @override
  String? get jamfClientSecret; // write-only; API returns null after save
// ── Per-company Jamf School credentials ────────────────────────
  @override
  String? get jamfSchoolUrl;
  @override
  String? get jamfSchoolApiKey; // write-only; API returns null after save
// ── Per-company Intune / Azure AD credentials ───────────────────
  @override
  String? get azureTenantId;
  @override
  String? get azureClientId;
  @override
  String? get azureClientSecret;

  /// Create a copy of Company
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CompanyImplCopyWith<_$CompanyImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
