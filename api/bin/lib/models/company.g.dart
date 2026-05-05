// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'company.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CompanyImpl _$$CompanyImplFromJson(Map<String, dynamic> json) =>
    _$CompanyImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      logoUrl: json['logo_url'] as String?,
      personnel: (json['personnel'] as List<dynamic>?)
          ?.map((e) => User.fromJson(e as Map<String, dynamic>))
          .toList(),
      portfolioSummary: json['portfolio_summary'] == null
          ? null
          : PortfolioSummary.fromJson(
              json['portfolio_summary'] as Map<String, dynamic>),
      mdmConnections: (json['mdm_connections'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, e as String),
      ),
      customFields: (json['custom_fields'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, e as String),
      ),
      invoices: (json['invoices'] as List<dynamic>?)
          ?.map((e) => TaxInvoice.fromJson(e as Map<String, dynamic>))
          .toList(),
      listings: (json['listings'] as List<dynamic>?)
          ?.map((e) => Listing.fromJson(e as Map<String, dynamic>))
          .toList(),
      offers: (json['offers'] as List<dynamic>?)
          ?.map((e) => BuyerOffer.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$CompanyImplToJson(_$CompanyImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      if (instance.logoUrl case final value?) 'logo_url': value,
      if (instance.personnel?.map((e) => e.toJson()).toList() case final value?)
        'personnel': value,
      if (instance.portfolioSummary?.toJson() case final value?)
        'portfolio_summary': value,
      if (instance.mdmConnections case final value?) 'mdm_connections': value,
      if (instance.customFields case final value?) 'custom_fields': value,
      if (instance.invoices?.map((e) => e.toJson()).toList() case final value?)
        'invoices': value,
      if (instance.listings?.map((e) => e.toJson()).toList() case final value?)
        'listings': value,
      if (instance.offers?.map((e) => e.toJson()).toList() case final value?)
        'offers': value,
    };
