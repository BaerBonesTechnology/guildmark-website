import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/listing_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final q = context.request.uri.queryParameters;
  final filters = MarketplaceFilters(
    assetType: q['asset_type'],
    conditionGrade: q['condition_grade'],
    maxPrice: q['max_price'] != null ? double.tryParse(q['max_price']!) : null,
    search: q['search'],
    page: int.tryParse(q['page'] ?? '1') ?? 1,
    pageSize: int.tryParse(q['page_size'] ?? '24') ?? 24,
  );

  final result = await ListingRepo(context.read<Db>()).searchActive(filters);
  return Response.json(
    body: result.toJson((listing) => listing.toJson()),
  );
}
