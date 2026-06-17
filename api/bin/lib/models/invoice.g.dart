// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invoice.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_TaxInvoice _$TaxInvoiceFromJson(Map<String, dynamic> json) => _TaxInvoice(
  id: json['id'] as String,
  invoiceNumber: json['invoice_number'] as String,
  invoiceType: json['invoice_type'] as String,
  invoiceDate: const DateOnlyConverter().fromJson(
    json['invoice_date'] as String,
  ),
  assetDescription: json['asset_description'] as String,
  marketValueAtDisposal: (json['market_value_at_disposal'] as num).toDouble(),
  writeOffAmount: (json['write_off_amount'] as num).toDouble(),
  generatedAt: const IsoDateTimeConverter().fromJson(
    json['generated_at'] as String,
  ),
  serialNumber: json['serial_number'] as String?,
  originalCost: (json['original_cost'] as num?)?.toDouble(),
  bookValueAtDisposal: (json['book_value_at_disposal'] as num?)?.toDouble(),
  marketAnchorEbay: (json['market_anchor_ebay'] as num?)?.toDouble(),
  pdfStoragePath: json['pdf_storage_path'] as String?,
  modelName: json['model_name'] as String?,
);

Map<String, dynamic> _$TaxInvoiceToJson(_TaxInvoice instance) =>
    <String, dynamic>{
      'id': instance.id,
      'invoice_number': instance.invoiceNumber,
      'invoice_type': instance.invoiceType,
      'invoice_date': const DateOnlyConverter().toJson(instance.invoiceDate),
      'asset_description': instance.assetDescription,
      'market_value_at_disposal': instance.marketValueAtDisposal,
      'write_off_amount': instance.writeOffAmount,
      'generated_at': const IsoDateTimeConverter().toJson(instance.generatedAt),
      'serial_number': ?instance.serialNumber,
      'original_cost': ?instance.originalCost,
      'book_value_at_disposal': ?instance.bookValueAtDisposal,
      'market_anchor_ebay': ?instance.marketAnchorEbay,
      'pdf_storage_path': ?instance.pdfStoragePath,
      'model_name': ?instance.modelName,
    };
