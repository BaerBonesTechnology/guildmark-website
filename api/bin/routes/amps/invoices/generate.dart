import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/invoice_repo.dart';

const _allowedTypes = {'disposal', 'loss', 'sale', 'donation'};

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body = await context.request.json() as Map<String, dynamic>?;
  final assetId = body?['asset_id'] as String?;
  final invoiceType = body?['invoice_type'] as String?;
  final invoiceDateStr = body?['invoice_date'] as String?;

  if (assetId == null || invoiceType == null || invoiceDateStr == null) {
    return badRequest('asset_id, invoice_type, invoice_date required');
  }
  if (!_allowedTypes.contains(invoiceType)) {
    return badRequest(
      'invoice_type must be one of: ${_allowedTypes.join(', ')}',
    );
  }

  final invoiceDate = DateTime.tryParse(invoiceDateStr);
  if (invoiceDate == null) {
    return badRequest(
      'invoice_date must be a valid ISO-8601 date (e.g. 2026-05-03)',
    );
  }

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  try {
    final invoice = await InvoiceRepo(aw).generate(
      companyId: auth.companyId,
      assetId: assetId,
      invoiceType: invoiceType,
      invoiceDate: invoiceDate,
    );
    // TODO: Enqueue async PDF render job here.
    return Response.json(statusCode: 201, body: invoice.toJson());
  } on StateError catch (e) {
    return notFound(e.message);
  }
}
