// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'company.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Company _$CompanyFromJson(Map<String, dynamic> json) => _Company(
  id: json['id'] as String,
  name: json['name'] as String,
  logoUrl: json['logo_url'] as String?,
  personnel: (json['personnel'] as List<dynamic>?)
      ?.map((e) => User.fromJson(e as Map<String, dynamic>))
      .toList(),
  portfolioSummary: json['portfolio_summary'] == null
      ? null
      : PortfolioSummary.fromJson(
          json['portfolio_summary'] as Map<String, dynamic>,
        ),
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
  jamfInstanceUrl: json['jamf_instance_url'] as String?,
  jamfClientId: json['jamf_client_id'] as String?,
  jamfClientSecret: json['jamf_client_secret'] as String?,
  jamfSchoolUrl: json['jamf_school_url'] as String?,
  jamfSchoolApiKey: json['jamf_school_api_key'] as String?,
  azureTenantId: json['azure_tenant_id'] as String?,
  azureClientId: json['azure_client_id'] as String?,
  azureClientSecret: json['azure_client_secret'] as String?,
);

Map<String, dynamic> _$CompanyToJson(_Company instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'logo_url': ?instance.logoUrl,
  'personnel': ?instance.personnel?.map((e) => e.toJson()).toList(),
  'portfolio_summary': ?instance.portfolioSummary?.toJson(),
  'mdm_connections': ?instance.mdmConnections,
  'custom_fields': ?instance.customFields,
  'invoices': ?instance.invoices?.map((e) => e.toJson()).toList(),
  'listings': ?instance.listings?.map((e) => e.toJson()).toList(),
  'offers': ?instance.offers?.map((e) => e.toJson()).toList(),
  'jamf_instance_url': ?instance.jamfInstanceUrl,
  'jamf_client_id': ?instance.jamfClientId,
  'jamf_client_secret': ?instance.jamfClientSecret,
  'jamf_school_url': ?instance.jamfSchoolUrl,
  'jamf_school_api_key': ?instance.jamfSchoolApiKey,
  'azure_tenant_id': ?instance.azureTenantId,
  'azure_client_id': ?instance.azureClientId,
  'azure_client_secret': ?instance.azureClientSecret,
};
