/// POST /amps/invoices/generate — generate a tax invoice for an asset.
///
/// Body: { asset_id, invoice_type, invoice_date }
/// Returns the persisted invoice metadata; PDF generation runs async.
///
/// TODO: After creating the invoice row, enqueue a PDF render job to a task
/// queue (e.g. a `invoice_pdf_jobs` Postgres table polled by a worker, or a
/// Redis/BullMQ queue). The worker should call a PDF templating service and
/// then UPDATE tax_invoices SET pdf_storage_path = '<path>' when done.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/invoice_repo.dart';

const _allowedTypes = {'disposal', 'loss', 'sale', 'donation'};

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body        = await context.request.json() as Map<String, dynamic>?;
  final assetId     = body?['asset_id']      as String?;
  final invoiceType = body?['invoice_type']   as String?;
  final invoiceDateStr = body?['invoice_date'] as String?;

  if (assetId == null || invoiceType == null || invoiceDateStr == null) {
    return badRequest('asset_id, invoice_type, invoice_date required');
  }
  if (!_allowedTypes.contains(invoiceType)) {
    return badRequest('invoice_type must be one of: ${_allowedTypes.join(', ')}');
  }

  final invoiceDate = DateTime.tryParse(invoiceDateStr);
  if (invoiceDate == null) {
    return badRequest('invoice_date must be a valid ISO-8601 date (e.g. 2026-05-03)');
  }

  try {
    final invoice = await InvoiceRepo(context.read<Db>()).generate(
      companyId:   auth.companyId,
      assetId:     assetId,
      invoiceType: invoiceType,
      invoiceDate: invoiceDate,
    );
    // TODO: Enqueue async PDF render job here.
    return Response.json(statusCode: 201, body: invoice.toJson());
  } on StateError catch (e) {
    return notFound(e.message);
  }
}
