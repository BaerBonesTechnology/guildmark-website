import 'package:postgres/postgres.dart';

import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/models/invoice.dart';
import 'package:guildmark_api/models/json_helpers.dart';

const _invoiceCols = '''
  ti.id, ti.invoice_number, ti.invoice_type, ti.invoice_date,
  ti.asset_description, ti.serial_number, ti.original_cost,
  ti.book_value_at_disposal, ti.market_value_at_disposal,
  ti.write_off_amount, ti.market_anchor_ebay, ti.pdf_storage_path,
  ti.generated_at,
  a.model_name
''';

class InvoiceRepo {
  InvoiceRepo(this._db);

  final Db _db;

  Future<List<TaxInvoice>> findByCompany(String companyId) async {
    final result = await _db.query(
      '''
      SELECT $_invoiceCols
      FROM tax_invoices ti
      LEFT JOIN assets a ON a.id = ti.asset_id
      WHERE ti.company_id = @cid
      ORDER BY ti.invoice_date DESC, ti.generated_at DESC
      ''',
      parameters: {'cid': companyId},
    );
    return result.map((r) => TaxInvoice.fromRow(r.toColumnMap())).toList();
  }

  Future<TaxInvoice> generate({
    required String companyId,
    required String assetId,
    required String invoiceType,
    required DateTime invoiceDate,
  }) async {
    return _db.tx<TaxInvoice>((tx) async {
      // Pull asset details needed for invoice fields.
      final assetRows = await tx.execute(
        Sql.named(
          '''
          SELECT a.model_name, a.serial_number, a.original_purchase_price,
                 l.fair_market_value
          FROM assets a
          LEFT JOIN listings l
            ON l.asset_id = a.id AND l.status IN ('active', 'sold')
          WHERE a.id = @assetId AND a.company_id = @cid
          ORDER BY l.created_at DESC
          LIMIT 1
          ''',
        ),
        parameters: {'assetId': assetId, 'cid': companyId},
      );
      if (assetRows.isEmpty) {
        throw StateError('Asset $assetId not found for company $companyId');
      }
      final ar = assetRows.first.toColumnMap();

      final modelName = ar['model_name'] as String;
      final serialNumber = ar['serial_number'] as String?;
      final originalCost = numToDoubleOrNull(ar['original_purchase_price']);
      final marketValue =
          numToDoubleOrNull(ar['fair_market_value']) ?? originalCost ?? 0.0;
      final writeOff = originalCost == null
          ? 0.0
          : (originalCost - marketValue).clamp(0, double.infinity).toDouble();

      // Generate unique invoice number: INV-YYYYMMDD-<daily-seq>.
      final datePart =
          '${invoiceDate.year.toString().padLeft(4, '0')}'
          '${invoiceDate.month.toString().padLeft(2, '0')}'
          '${invoiceDate.day.toString().padLeft(2, '0')}';

      final seqRow = await tx.execute(
        Sql.named(
          '''
          SELECT COUNT(*) + 1 AS seq
          FROM tax_invoices
          WHERE invoice_date = @d
          ''',
        ),
        parameters: {'d': invoiceDate},
      );
      final seq = numToIntOrNull(seqRow.first.toColumnMap()['seq']) ?? 1;
      final invoiceNum = 'INV-$datePart-${seq.toString().padLeft(4, '0')}';

      final result = await tx.execute(
        Sql.named(
          '''
          INSERT INTO tax_invoices
            (company_id, asset_id, invoice_number, invoice_type, invoice_date,
             asset_description, serial_number, original_cost, book_value_at_disposal,
             market_value_at_disposal, write_off_amount)
          VALUES
            (@cid, @assetId, @invoiceNum, @invoiceType::invoice_type, @invoiceDate,
             @description, @serial, @originalCost, @bookValue,
             @marketValue, @writeOff)
          RETURNING
            id, invoice_number, invoice_type, invoice_date, asset_description,
            serial_number, original_cost, book_value_at_disposal,
            market_value_at_disposal, write_off_amount, market_anchor_ebay,
            pdf_storage_path, generated_at
          ''',
        ),
        parameters: {
          'cid': companyId,
          'assetId': assetId,
          'invoiceNum': invoiceNum,
          'invoiceType': invoiceType,
          'invoiceDate': invoiceDate,
          'description': modelName,
          'serial': serialNumber,
          'originalCost': originalCost,
          'bookValue': originalCost,
          // TODO: compute actual book value from depreciation schedule
          'marketValue': marketValue,
          'writeOff': writeOff,
        },
      );

      final row = result.first.toColumnMap()..['model_name'] = modelName;
      return TaxInvoice.fromRow(row);
    });
  }
}
