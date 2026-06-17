import 'package:freezed_annotation/freezed_annotation.dart';

import 'json_helpers.dart';

part 'invoice.freezed.dart';
part 'invoice.g.dart';

@freezed
abstract class TaxInvoice with _$TaxInvoice {
  const factory TaxInvoice({
    required String id,
    required String invoiceNumber,
    required String invoiceType,
    @DateOnlyConverter() required DateTime invoiceDate,
    required String assetDescription,
    required double marketValueAtDisposal,
    required double writeOffAmount,
    @IsoDateTimeConverter() required DateTime generatedAt,
    String? serialNumber,
    double? originalCost,
    double? bookValueAtDisposal,
    double? marketAnchorEbay,
    String? pdfStoragePath,
    // Joined from asset row
    String? modelName,
  }) = _TaxInvoice;

  const TaxInvoice._();

  factory TaxInvoice.fromJson(Map<String, dynamic> json) =>
      _$TaxInvoiceFromJson(json);

  factory TaxInvoice.fromRow(Map<String, dynamic> row) => TaxInvoice(
    id: row['id'] as String,
    invoiceNumber: row['invoice_number'] as String,
    invoiceType: enumStr(row['invoice_type']),
    invoiceDate: row['invoice_date'] as DateTime,
    assetDescription: row['asset_description'] as String,
    marketValueAtDisposal:
        numToDoubleOrNull(row['market_value_at_disposal']) ?? 0.0,
    writeOffAmount: numToDoubleOrNull(row['write_off_amount']) ?? 0.0,
    generatedAt: row['generated_at'] as DateTime,
    serialNumber: row['serial_number'] as String?,
    originalCost: numToDoubleOrNull(row['original_cost']),
    bookValueAtDisposal: numToDoubleOrNull(row['book_value_at_disposal']),
    marketAnchorEbay: numToDoubleOrNull(row['market_anchor_ebay']),
    pdfStoragePath: row['pdf_storage_path'] as String?,
    modelName: row['model_name'] as String?,
  );
}
