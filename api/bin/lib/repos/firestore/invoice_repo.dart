/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'dart:math';

import 'package:guildmark_api/firebase/firestore.dart';

import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/models/invoice.dart';

class InvoiceRepo {
  InvoiceRepo(this._aw);

  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  static const _pageSize = 30;

  /// Bounded retries when a generated invoice number loses the unique-index
  /// race (409).
  static const _numberAttempts = 10;

  Future<List<TaxInvoice>> findByCompany(String companyId) async {
    // Page through every invoice for the company (§1c fetch loop).
    final invoices = <Row>[];
    var offset = 0;
    while (true) {
      final res = await _db.listRows(
        databaseId: Collections.databaseId,
        tableId: Collections.taxInvoices,
        queries: [
          Query.equal('company_id', companyId),
          Query.orderDesc('invoice_date'),
          Query.orderDesc(r'$createdAt'),
          Query.limit(_pageSize),
          Query.offset(offset),
        ],
      );
      invoices.addAll(res.rows);
      if (res.rows.length < _pageSize) break;
      offset += _pageSize;
    }

    // LEFT JOIN assets → second query + stitch (§1b): fetch the referenced
    // assets in chunks and map $id → model_name.
    final assetIds = invoices
        .map((r) => r.data['asset_id'] as String?)
        .whereType<String>()
        .toSet()
        .toList();
    final modelNames = <String, String?>{};
    for (var i = 0; i < assetIds.length; i += _pageSize) {
      final chunk = assetIds.sublist(i, min(i + _pageSize, assetIds.length));
      final assets = await _db.listRows(
        databaseId: Collections.databaseId,
        tableId: Collections.assets,
        queries: [Query.equal(r'$id', chunk), Query.limit(chunk.length)],
      );
      for (final a in assets.rows) {
        modelNames[a.$id] = a.data['model_name'] as String?;
      }
    }

    return invoices
        .map(
          (r) => _toInvoice(
            r,
            modelName: modelNames[r.data['asset_id'] as String?],
          ),
        )
        .toList();
  }

  /// Generate the invoice metadata row. PDF rendering is asynchronous and
  /// happens outside this repo (enqueue a job after calling this).
  ///
  /// `market_value_at_disposal` is sourced from the listing's
  /// `fair_market_value` if present, falling back to
  /// `original_purchase_price`. `write_off_amount` = original cost − market
  /// value (floor 0).
  ///
  /// Postgres wrapped this in a transaction; here the only write is the
  /// single createRow (the reads before it are safe to repeat), so no saga
  /// compensation is needed — the `invoice_number` unique index resolves
  /// concurrent generators and we retry with the next sequence number.
  ///
  /// TODO: Accept an optional `market_anchor_ebay` parameter once the eBay
  /// data-retrieval pipeline is wired up (see training/data_retrieval.py).
  Future<TaxInvoice> generate({
    required String companyId,
    required String assetId,
    required String invoiceType,
    required DateTime invoiceDate,
  }) async {
    // ── Asset details (ownership check replaces WHERE company_id) ──────────
    final Row asset;
    try {
      asset = await _db.getRow(
        databaseId: Collections.databaseId,
        tableId: Collections.assets,
        rowId: assetId,
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) {
        throw StateError('Asset $assetId not found for company $companyId');
      }
      rethrow;
    }
    if (asset.data['company_id'] != companyId) {
      throw StateError('Asset $assetId not found for company $companyId');
    }

    final modelName = asset.data['model_name'] as String;
    final serialNumber = asset.data['serial_number'] as String?;
    final originalCost =
        _centsToDollars(asset.data['original_purchase_price_cents']);

    // ── Most recent active/sold listing carries the ML fair market value ────
    final listingRes = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.listings,
      queries: [
        Query.equal('asset_id', assetId),
        Query.equal('status', ['active', 'sold']),
        Query.orderDesc(r'$createdAt'),
        Query.limit(1),
      ],
    );
    final fairMarketValue = listingRes.rows.isEmpty
        ? null
        : _centsToDollars(listingRes.rows.first.data['fair_market_value_cents']);

    final marketValue = fairMarketValue ?? originalCost ?? 0.0;
    final writeOff = originalCost == null
        ? 0.0
        : (originalCost - marketValue).clamp(0, double.infinity).toDouble();

    // ── Unique invoice number: INV-YYYYMMDD-<daily-seq> ─────────────────────
    // invoice_date is stored as midnight UTC; count that day's invoices via
    // .total (COUNT(*) equivalent).
    final day =
        DateTime.utc(invoiceDate.year, invoiceDate.month, invoiceDate.day);
    final nextDay = day.add(const Duration(days: 1));
    final datePart = '${day.year.toString().padLeft(4, '0')}'
        '${day.month.toString().padLeft(2, '0')}'
        '${day.day.toString().padLeft(2, '0')}';

    final counted = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.taxInvoices,
      queries: [
        Query.greaterThanEqual('invoice_date', day.toIso8601String()),
        Query.lessThan('invoice_date', nextDay.toIso8601String()),
        Query.limit(1),
      ],
    );
    var seq = counted.total + 1;

    for (var attempt = 0; ; attempt++) {
      final invoiceNum = 'INV-$datePart-${seq.toString().padLeft(4, '0')}';
      try {
        final row = await _db.createRow(
          databaseId: Collections.databaseId,
          tableId: Collections.taxInvoices,
          rowId: ID.unique(),
          data: {
            'company_id': companyId,
            'asset_id': assetId,
            'invoice_number': invoiceNum,
            'invoice_type': invoiceType,
            'invoice_date': day.toIso8601String(),
            'asset_description': modelName,
            'serial_number': ?serialNumber,
            if (originalCost != null)
              'original_cost_cents': _dollarsToCents(originalCost),
            // TODO: compute actual book value from depreciation schedule
            if (originalCost != null)
              'book_value_at_disposal_cents': _dollarsToCents(originalCost),
            'market_value_at_disposal_cents': _dollarsToCents(marketValue),
            'write_off_amount_cents': _dollarsToCents(writeOff),
          },
        );
        return _toInvoice(row, modelName: modelName);
      } on DatastoreException catch (e) {
        // Lost the invoice_number race — bump the sequence and retry.
        if (e.code == 409 && attempt < _numberAttempts) {
          seq++;
          continue;
        }
        rethrow;
      }
    }
  }

  TaxInvoice _toInvoice(Row row, {String? modelName}) {
    final d = row.data;
    return TaxInvoice(
      id: row.$id,
      invoiceNumber: d['invoice_number'] as String,
      invoiceType: d['invoice_type'] as String,
      invoiceDate: DateTime.parse(d['invoice_date'] as String),
      assetDescription: d['asset_description'] as String,
      marketValueAtDisposal:
          _centsToDollars(d['market_value_at_disposal_cents']) ?? 0.0,
      writeOffAmount: _centsToDollars(d['write_off_amount_cents']) ?? 0.0,
      generatedAt: DateTime.parse(row.$createdAt),
      serialNumber: d['serial_number'] as String?,
      originalCost: _centsToDollars(d['original_cost_cents']),
      bookValueAtDisposal: _centsToDollars(d['book_value_at_disposal_cents']),
      marketAnchorEbay: _centsToDollars(d['market_anchor_ebay_cents']),
      pdfStoragePath: d['pdf_storage_path'] as String?,
      modelName: modelName,
    );
  }

  static double? _centsToDollars(Object? cents) =>
      cents == null ? null : (cents as num).toInt() / 100.0;

  static int _dollarsToCents(double dollars) => (dollars * 100).round();
}
