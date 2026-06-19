// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'company.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Company {

 String get id; String get name; String? get logoUrl; List<User>? get personnel; PortfolioSummary? get portfolioSummary; Map<String, String>? get mdmConnections;// Map of MDM type to connection ID
 Map<String, String>? get customFields;// For extensibility
 List<TaxInvoice>? get invoices;// Optional list of recent invoices
 List<Listing>? get listings;// Optional list of recent listings
 List<BuyerOffer>? get offers;// Optional map of listings to buyer offers
// ── Per-company Jamf Pro credentials (stored in DB, not env) ───
 String? get jamfInstanceUrl; String? get jamfClientId; String? get jamfClientSecret;// write-only; API returns null after save
// ── Per-company Jamf School credentials ────────────────────────
 String? get jamfSchoolUrl; String? get jamfSchoolApiKey;// write-only; API returns null after save
// ── Per-company Intune / Azure AD credentials ───────────────────
 String? get azureTenantId; String? get azureClientId; String? get azureClientSecret;
/// Create a copy of Company
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CompanyCopyWith<Company> get copyWith => _$CompanyCopyWithImpl<Company>(this as Company, _$identity);

  /// Serializes this Company to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Company&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl)&&const DeepCollectionEquality().equals(other.personnel, personnel)&&(identical(other.portfolioSummary, portfolioSummary) || other.portfolioSummary == portfolioSummary)&&const DeepCollectionEquality().equals(other.mdmConnections, mdmConnections)&&const DeepCollectionEquality().equals(other.customFields, customFields)&&const DeepCollectionEquality().equals(other.invoices, invoices)&&const DeepCollectionEquality().equals(other.listings, listings)&&const DeepCollectionEquality().equals(other.offers, offers)&&(identical(other.jamfInstanceUrl, jamfInstanceUrl) || other.jamfInstanceUrl == jamfInstanceUrl)&&(identical(other.jamfClientId, jamfClientId) || other.jamfClientId == jamfClientId)&&(identical(other.jamfClientSecret, jamfClientSecret) || other.jamfClientSecret == jamfClientSecret)&&(identical(other.jamfSchoolUrl, jamfSchoolUrl) || other.jamfSchoolUrl == jamfSchoolUrl)&&(identical(other.jamfSchoolApiKey, jamfSchoolApiKey) || other.jamfSchoolApiKey == jamfSchoolApiKey)&&(identical(other.azureTenantId, azureTenantId) || other.azureTenantId == azureTenantId)&&(identical(other.azureClientId, azureClientId) || other.azureClientId == azureClientId)&&(identical(other.azureClientSecret, azureClientSecret) || other.azureClientSecret == azureClientSecret));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,logoUrl,const DeepCollectionEquality().hash(personnel),portfolioSummary,const DeepCollectionEquality().hash(mdmConnections),const DeepCollectionEquality().hash(customFields),const DeepCollectionEquality().hash(invoices),const DeepCollectionEquality().hash(listings),const DeepCollectionEquality().hash(offers),jamfInstanceUrl,jamfClientId,jamfClientSecret,jamfSchoolUrl,jamfSchoolApiKey,azureTenantId,azureClientId,azureClientSecret);

@override
String toString() {
  return 'Company(id: $id, name: $name, logoUrl: $logoUrl, personnel: $personnel, portfolioSummary: $portfolioSummary, mdmConnections: $mdmConnections, customFields: $customFields, invoices: $invoices, listings: $listings, offers: $offers, jamfInstanceUrl: $jamfInstanceUrl, jamfClientId: $jamfClientId, jamfClientSecret: $jamfClientSecret, jamfSchoolUrl: $jamfSchoolUrl, jamfSchoolApiKey: $jamfSchoolApiKey, azureTenantId: $azureTenantId, azureClientId: $azureClientId, azureClientSecret: $azureClientSecret)';
}


}

/// @nodoc
abstract mixin class $CompanyCopyWith<$Res>  {
  factory $CompanyCopyWith(Company value, $Res Function(Company) _then) = _$CompanyCopyWithImpl;
@useResult
$Res call({
 String id, String name, String? logoUrl, List<User>? personnel, PortfolioSummary? portfolioSummary, Map<String, String>? mdmConnections, Map<String, String>? customFields, List<TaxInvoice>? invoices, List<Listing>? listings, List<BuyerOffer>? offers, String? jamfInstanceUrl, String? jamfClientId, String? jamfClientSecret, String? jamfSchoolUrl, String? jamfSchoolApiKey, String? azureTenantId, String? azureClientId, String? azureClientSecret
});


$PortfolioSummaryCopyWith<$Res>? get portfolioSummary;

}
/// @nodoc
class _$CompanyCopyWithImpl<$Res>
    implements $CompanyCopyWith<$Res> {
  _$CompanyCopyWithImpl(this._self, this._then);

  final Company _self;
  final $Res Function(Company) _then;

/// Create a copy of Company
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? logoUrl = freezed,Object? personnel = freezed,Object? portfolioSummary = freezed,Object? mdmConnections = freezed,Object? customFields = freezed,Object? invoices = freezed,Object? listings = freezed,Object? offers = freezed,Object? jamfInstanceUrl = freezed,Object? jamfClientId = freezed,Object? jamfClientSecret = freezed,Object? jamfSchoolUrl = freezed,Object? jamfSchoolApiKey = freezed,Object? azureTenantId = freezed,Object? azureClientId = freezed,Object? azureClientSecret = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,personnel: freezed == personnel ? _self.personnel : personnel // ignore: cast_nullable_to_non_nullable
as List<User>?,portfolioSummary: freezed == portfolioSummary ? _self.portfolioSummary : portfolioSummary // ignore: cast_nullable_to_non_nullable
as PortfolioSummary?,mdmConnections: freezed == mdmConnections ? _self.mdmConnections : mdmConnections // ignore: cast_nullable_to_non_nullable
as Map<String, String>?,customFields: freezed == customFields ? _self.customFields : customFields // ignore: cast_nullable_to_non_nullable
as Map<String, String>?,invoices: freezed == invoices ? _self.invoices : invoices // ignore: cast_nullable_to_non_nullable
as List<TaxInvoice>?,listings: freezed == listings ? _self.listings : listings // ignore: cast_nullable_to_non_nullable
as List<Listing>?,offers: freezed == offers ? _self.offers : offers // ignore: cast_nullable_to_non_nullable
as List<BuyerOffer>?,jamfInstanceUrl: freezed == jamfInstanceUrl ? _self.jamfInstanceUrl : jamfInstanceUrl // ignore: cast_nullable_to_non_nullable
as String?,jamfClientId: freezed == jamfClientId ? _self.jamfClientId : jamfClientId // ignore: cast_nullable_to_non_nullable
as String?,jamfClientSecret: freezed == jamfClientSecret ? _self.jamfClientSecret : jamfClientSecret // ignore: cast_nullable_to_non_nullable
as String?,jamfSchoolUrl: freezed == jamfSchoolUrl ? _self.jamfSchoolUrl : jamfSchoolUrl // ignore: cast_nullable_to_non_nullable
as String?,jamfSchoolApiKey: freezed == jamfSchoolApiKey ? _self.jamfSchoolApiKey : jamfSchoolApiKey // ignore: cast_nullable_to_non_nullable
as String?,azureTenantId: freezed == azureTenantId ? _self.azureTenantId : azureTenantId // ignore: cast_nullable_to_non_nullable
as String?,azureClientId: freezed == azureClientId ? _self.azureClientId : azureClientId // ignore: cast_nullable_to_non_nullable
as String?,azureClientSecret: freezed == azureClientSecret ? _self.azureClientSecret : azureClientSecret // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}
/// Create a copy of Company
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PortfolioSummaryCopyWith<$Res>? get portfolioSummary {
    if (_self.portfolioSummary == null) {
    return null;
  }

  return $PortfolioSummaryCopyWith<$Res>(_self.portfolioSummary!, (value) {
    return _then(_self.copyWith(portfolioSummary: value));
  });
}
}


/// Adds pattern-matching-related methods to [Company].
extension CompanyPatterns on Company {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Company value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Company() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Company value)  $default,){
final _that = this;
switch (_that) {
case _Company():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Company value)?  $default,){
final _that = this;
switch (_that) {
case _Company() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String? logoUrl,  List<User>? personnel,  PortfolioSummary? portfolioSummary,  Map<String, String>? mdmConnections,  Map<String, String>? customFields,  List<TaxInvoice>? invoices,  List<Listing>? listings,  List<BuyerOffer>? offers,  String? jamfInstanceUrl,  String? jamfClientId,  String? jamfClientSecret,  String? jamfSchoolUrl,  String? jamfSchoolApiKey,  String? azureTenantId,  String? azureClientId,  String? azureClientSecret)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Company() when $default != null:
return $default(_that.id,_that.name,_that.logoUrl,_that.personnel,_that.portfolioSummary,_that.mdmConnections,_that.customFields,_that.invoices,_that.listings,_that.offers,_that.jamfInstanceUrl,_that.jamfClientId,_that.jamfClientSecret,_that.jamfSchoolUrl,_that.jamfSchoolApiKey,_that.azureTenantId,_that.azureClientId,_that.azureClientSecret);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String? logoUrl,  List<User>? personnel,  PortfolioSummary? portfolioSummary,  Map<String, String>? mdmConnections,  Map<String, String>? customFields,  List<TaxInvoice>? invoices,  List<Listing>? listings,  List<BuyerOffer>? offers,  String? jamfInstanceUrl,  String? jamfClientId,  String? jamfClientSecret,  String? jamfSchoolUrl,  String? jamfSchoolApiKey,  String? azureTenantId,  String? azureClientId,  String? azureClientSecret)  $default,) {final _that = this;
switch (_that) {
case _Company():
return $default(_that.id,_that.name,_that.logoUrl,_that.personnel,_that.portfolioSummary,_that.mdmConnections,_that.customFields,_that.invoices,_that.listings,_that.offers,_that.jamfInstanceUrl,_that.jamfClientId,_that.jamfClientSecret,_that.jamfSchoolUrl,_that.jamfSchoolApiKey,_that.azureTenantId,_that.azureClientId,_that.azureClientSecret);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String? logoUrl,  List<User>? personnel,  PortfolioSummary? portfolioSummary,  Map<String, String>? mdmConnections,  Map<String, String>? customFields,  List<TaxInvoice>? invoices,  List<Listing>? listings,  List<BuyerOffer>? offers,  String? jamfInstanceUrl,  String? jamfClientId,  String? jamfClientSecret,  String? jamfSchoolUrl,  String? jamfSchoolApiKey,  String? azureTenantId,  String? azureClientId,  String? azureClientSecret)?  $default,) {final _that = this;
switch (_that) {
case _Company() when $default != null:
return $default(_that.id,_that.name,_that.logoUrl,_that.personnel,_that.portfolioSummary,_that.mdmConnections,_that.customFields,_that.invoices,_that.listings,_that.offers,_that.jamfInstanceUrl,_that.jamfClientId,_that.jamfClientSecret,_that.jamfSchoolUrl,_that.jamfSchoolApiKey,_that.azureTenantId,_that.azureClientId,_that.azureClientSecret);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Company implements Company {
  const _Company({required this.id, required this.name, this.logoUrl, final  List<User>? personnel, this.portfolioSummary, final  Map<String, String>? mdmConnections, final  Map<String, String>? customFields, final  List<TaxInvoice>? invoices, final  List<Listing>? listings, final  List<BuyerOffer>? offers, this.jamfInstanceUrl, this.jamfClientId, this.jamfClientSecret, this.jamfSchoolUrl, this.jamfSchoolApiKey, this.azureTenantId, this.azureClientId, this.azureClientSecret}): _personnel = personnel,_mdmConnections = mdmConnections,_customFields = customFields,_invoices = invoices,_listings = listings,_offers = offers;
  factory _Company.fromJson(Map<String, dynamic> json) => _$CompanyFromJson(json);

@override final  String id;
@override final  String name;
@override final  String? logoUrl;
 final  List<User>? _personnel;
@override List<User>? get personnel {
  final value = _personnel;
  if (value == null) return null;
  if (_personnel is EqualUnmodifiableListView) return _personnel;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

@override final  PortfolioSummary? portfolioSummary;
 final  Map<String, String>? _mdmConnections;
@override Map<String, String>? get mdmConnections {
  final value = _mdmConnections;
  if (value == null) return null;
  if (_mdmConnections is EqualUnmodifiableMapView) return _mdmConnections;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}

// Map of MDM type to connection ID
 final  Map<String, String>? _customFields;
// Map of MDM type to connection ID
@override Map<String, String>? get customFields {
  final value = _customFields;
  if (value == null) return null;
  if (_customFields is EqualUnmodifiableMapView) return _customFields;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}

// For extensibility
 final  List<TaxInvoice>? _invoices;
// For extensibility
@override List<TaxInvoice>? get invoices {
  final value = _invoices;
  if (value == null) return null;
  if (_invoices is EqualUnmodifiableListView) return _invoices;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

// Optional list of recent invoices
 final  List<Listing>? _listings;
// Optional list of recent invoices
@override List<Listing>? get listings {
  final value = _listings;
  if (value == null) return null;
  if (_listings is EqualUnmodifiableListView) return _listings;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

// Optional list of recent listings
 final  List<BuyerOffer>? _offers;
// Optional list of recent listings
@override List<BuyerOffer>? get offers {
  final value = _offers;
  if (value == null) return null;
  if (_offers is EqualUnmodifiableListView) return _offers;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

// Optional map of listings to buyer offers
// ── Per-company Jamf Pro credentials (stored in DB, not env) ───
@override final  String? jamfInstanceUrl;
@override final  String? jamfClientId;
@override final  String? jamfClientSecret;
// write-only; API returns null after save
// ── Per-company Jamf School credentials ────────────────────────
@override final  String? jamfSchoolUrl;
@override final  String? jamfSchoolApiKey;
// write-only; API returns null after save
// ── Per-company Intune / Azure AD credentials ───────────────────
@override final  String? azureTenantId;
@override final  String? azureClientId;
@override final  String? azureClientSecret;

/// Create a copy of Company
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CompanyCopyWith<_Company> get copyWith => __$CompanyCopyWithImpl<_Company>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CompanyToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Company&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl)&&const DeepCollectionEquality().equals(other._personnel, _personnel)&&(identical(other.portfolioSummary, portfolioSummary) || other.portfolioSummary == portfolioSummary)&&const DeepCollectionEquality().equals(other._mdmConnections, _mdmConnections)&&const DeepCollectionEquality().equals(other._customFields, _customFields)&&const DeepCollectionEquality().equals(other._invoices, _invoices)&&const DeepCollectionEquality().equals(other._listings, _listings)&&const DeepCollectionEquality().equals(other._offers, _offers)&&(identical(other.jamfInstanceUrl, jamfInstanceUrl) || other.jamfInstanceUrl == jamfInstanceUrl)&&(identical(other.jamfClientId, jamfClientId) || other.jamfClientId == jamfClientId)&&(identical(other.jamfClientSecret, jamfClientSecret) || other.jamfClientSecret == jamfClientSecret)&&(identical(other.jamfSchoolUrl, jamfSchoolUrl) || other.jamfSchoolUrl == jamfSchoolUrl)&&(identical(other.jamfSchoolApiKey, jamfSchoolApiKey) || other.jamfSchoolApiKey == jamfSchoolApiKey)&&(identical(other.azureTenantId, azureTenantId) || other.azureTenantId == azureTenantId)&&(identical(other.azureClientId, azureClientId) || other.azureClientId == azureClientId)&&(identical(other.azureClientSecret, azureClientSecret) || other.azureClientSecret == azureClientSecret));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,logoUrl,const DeepCollectionEquality().hash(_personnel),portfolioSummary,const DeepCollectionEquality().hash(_mdmConnections),const DeepCollectionEquality().hash(_customFields),const DeepCollectionEquality().hash(_invoices),const DeepCollectionEquality().hash(_listings),const DeepCollectionEquality().hash(_offers),jamfInstanceUrl,jamfClientId,jamfClientSecret,jamfSchoolUrl,jamfSchoolApiKey,azureTenantId,azureClientId,azureClientSecret);

@override
String toString() {
  return 'Company(id: $id, name: $name, logoUrl: $logoUrl, personnel: $personnel, portfolioSummary: $portfolioSummary, mdmConnections: $mdmConnections, customFields: $customFields, invoices: $invoices, listings: $listings, offers: $offers, jamfInstanceUrl: $jamfInstanceUrl, jamfClientId: $jamfClientId, jamfClientSecret: $jamfClientSecret, jamfSchoolUrl: $jamfSchoolUrl, jamfSchoolApiKey: $jamfSchoolApiKey, azureTenantId: $azureTenantId, azureClientId: $azureClientId, azureClientSecret: $azureClientSecret)';
}


}

/// @nodoc
abstract mixin class _$CompanyCopyWith<$Res> implements $CompanyCopyWith<$Res> {
  factory _$CompanyCopyWith(_Company value, $Res Function(_Company) _then) = __$CompanyCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String? logoUrl, List<User>? personnel, PortfolioSummary? portfolioSummary, Map<String, String>? mdmConnections, Map<String, String>? customFields, List<TaxInvoice>? invoices, List<Listing>? listings, List<BuyerOffer>? offers, String? jamfInstanceUrl, String? jamfClientId, String? jamfClientSecret, String? jamfSchoolUrl, String? jamfSchoolApiKey, String? azureTenantId, String? azureClientId, String? azureClientSecret
});


@override $PortfolioSummaryCopyWith<$Res>? get portfolioSummary;

}
/// @nodoc
class __$CompanyCopyWithImpl<$Res>
    implements _$CompanyCopyWith<$Res> {
  __$CompanyCopyWithImpl(this._self, this._then);

  final _Company _self;
  final $Res Function(_Company) _then;

/// Create a copy of Company
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? logoUrl = freezed,Object? personnel = freezed,Object? portfolioSummary = freezed,Object? mdmConnections = freezed,Object? customFields = freezed,Object? invoices = freezed,Object? listings = freezed,Object? offers = freezed,Object? jamfInstanceUrl = freezed,Object? jamfClientId = freezed,Object? jamfClientSecret = freezed,Object? jamfSchoolUrl = freezed,Object? jamfSchoolApiKey = freezed,Object? azureTenantId = freezed,Object? azureClientId = freezed,Object? azureClientSecret = freezed,}) {
  return _then(_Company(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,personnel: freezed == personnel ? _self._personnel : personnel // ignore: cast_nullable_to_non_nullable
as List<User>?,portfolioSummary: freezed == portfolioSummary ? _self.portfolioSummary : portfolioSummary // ignore: cast_nullable_to_non_nullable
as PortfolioSummary?,mdmConnections: freezed == mdmConnections ? _self._mdmConnections : mdmConnections // ignore: cast_nullable_to_non_nullable
as Map<String, String>?,customFields: freezed == customFields ? _self._customFields : customFields // ignore: cast_nullable_to_non_nullable
as Map<String, String>?,invoices: freezed == invoices ? _self._invoices : invoices // ignore: cast_nullable_to_non_nullable
as List<TaxInvoice>?,listings: freezed == listings ? _self._listings : listings // ignore: cast_nullable_to_non_nullable
as List<Listing>?,offers: freezed == offers ? _self._offers : offers // ignore: cast_nullable_to_non_nullable
as List<BuyerOffer>?,jamfInstanceUrl: freezed == jamfInstanceUrl ? _self.jamfInstanceUrl : jamfInstanceUrl // ignore: cast_nullable_to_non_nullable
as String?,jamfClientId: freezed == jamfClientId ? _self.jamfClientId : jamfClientId // ignore: cast_nullable_to_non_nullable
as String?,jamfClientSecret: freezed == jamfClientSecret ? _self.jamfClientSecret : jamfClientSecret // ignore: cast_nullable_to_non_nullable
as String?,jamfSchoolUrl: freezed == jamfSchoolUrl ? _self.jamfSchoolUrl : jamfSchoolUrl // ignore: cast_nullable_to_non_nullable
as String?,jamfSchoolApiKey: freezed == jamfSchoolApiKey ? _self.jamfSchoolApiKey : jamfSchoolApiKey // ignore: cast_nullable_to_non_nullable
as String?,azureTenantId: freezed == azureTenantId ? _self.azureTenantId : azureTenantId // ignore: cast_nullable_to_non_nullable
as String?,azureClientId: freezed == azureClientId ? _self.azureClientId : azureClientId // ignore: cast_nullable_to_non_nullable
as String?,azureClientSecret: freezed == azureClientSecret ? _self.azureClientSecret : azureClientSecret // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

/// Create a copy of Company
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PortfolioSummaryCopyWith<$Res>? get portfolioSummary {
    if (_self.portfolioSummary == null) {
    return null;
  }

  return $PortfolioSummaryCopyWith<$Res>(_self.portfolioSummary!, (value) {
    return _then(_self.copyWith(portfolioSummary: value));
  });
}
}

// dart format on
