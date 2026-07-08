/// GET /marketplace/listings
///
/// Public endpoint — no auth required. Returns a paginated list of active
/// listings with filters: asset_type, condition_grade, max_price, search,
/// page, page_size.
library;

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/listing_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  final q = context.request.uri.queryParameters;
  final filters = MarketplaceFilters(
    assetType:      q['asset_type'],
    conditionGrade: q['condition_grade'],
    maxPrice:       q['max_price'] != null ? double.tryParse(q['max_price']!) : null,
    search:         q['search'],
    page:           int.tryParse(q['page'] ?? '1') ?? 1,
    pageSize:       int.tryParse(q['page_size'] ?? '24') ?? 24,
  );

  final result = await ListingRepo(aw).searchActive(filters);
  return Response.json(
    body: result.toJson((l) => l.toJson()),
  );
}
