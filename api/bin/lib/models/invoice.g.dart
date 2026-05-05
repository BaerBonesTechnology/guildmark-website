// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invoice.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TaxInvoiceImpl _$$TaxInvoiceImplFromJson(Map<String, dynamic> json) =>
    _$TaxInvoiceImpl(
      id: json['id'] as String,
      invoiceNumber: json['invoice_number'] as String,
      invoiceType: json['invoice_type'] as String,
      invoiceDate:
          const DateOnlyConverter().fromJson(json['invoice_date'] as String),
      assetDescription: json['asset_description'] as String,
      marketValueAtDisposal:
          (json['market_value_at_disposal'] as num).toDouble(),
      writeOffAmount: (json['write_off_amount'] as num).toDouble(),
      generatedAt:
          const IsoDateTimeConverter().fromJson(json['generated_at'] as String),
      serialNumber: json['serial_number'] as String?,
      originalCost: (json['original_cost'] as num?)?.toDouble(),
      bookValueAtDisposal: (json['book_value_at_disposal'] as num?)?.toDouble(),
      marketAnchorEbay: (json['market_anchor_ebay'] as num?)?.toDouble(),
      pdfStoragePath: json['pdf_storage_path'] as String?,
      modelName: json['model_name'] as String?,
    );

Map<String, dynamic> _$$TaxInvoiceImplToJson(_$TaxInvoiceImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'invoice_number': instance.invoiceNumber,
      'invoice_type': instance.invoiceType,
      'invoice_date': const DateOnlyConverter().toJson(instance.invoiceDate),
      'asset_description': instance.assetDescription,
      'market_value_at_disposal': instance.marketValueAtDisposal,
      'write_off_amount': instance.writeOffAmount,
      'generated_at': const IsoDateTimeConverter().toJson(instance.generatedAt),
      if (instance.serialNumber case final value?) 'serial_number': value,
      if (instance.originalCost case final value?) 'original_cost': value,
      if (instance.bookValueAtDisposal case final value?)
        'book_value_at_disposal': value,
      if (instance.marketAnchorEbay case final value?)
        'market_anchor_ebay': value,
      if (instance.pdfStoragePath case final value?) 'pdf_storage_path': value,
      if (instance.modelName case final value?) 'model_name': value,
    };
