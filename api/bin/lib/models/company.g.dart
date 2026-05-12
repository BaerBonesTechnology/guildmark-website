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
      jamfInstanceUrl: json['jamf_instance_url'] as String?,
      jamfClientId: json['jamf_client_id'] as String?,
      jamfClientSecret: json['jamf_client_secret'] as String?,
      jamfSchoolUrl: json['jamf_school_url'] as String?,
      jamfSchoolApiKey: json['jamf_school_api_key'] as String?,
      azureTenantId: json['azure_tenant_id'] as String?,
      azureClientId: json['azure_client_id'] as String?,
      azureClientSecret: json['azure_client_secret'] as String?,
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
      if (instance.jamfInstanceUrl case final value?)
        'jamf_instance_url': value,
      if (instance.jamfClientId case final value?) 'jamf_client_id': value,
      if (instance.jamfClientSecret case final value?)
        'jamf_client_secret': value,
      if (instance.jamfSchoolUrl case final value?) 'jamf_school_url': value,
      if (instance.jamfSchoolApiKey case final value?)
        'jamf_school_api_key': value,
      if (instance.azureTenantId case final value?) 'azure_tenant_id': value,
      if (instance.azureClientId case final value?) 'azure_client_id': value,
      if (instance.azureClientSecret case final value?)
        'azure_client_secret': value,
    };
