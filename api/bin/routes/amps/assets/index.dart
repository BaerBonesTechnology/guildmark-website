/// GET /amps/assets — paginated, filterable AMPS asset inventory.
///
/// Query params: asset_type, condition_grade, search, filter (e.g. "aging"),
///               page, page_size.
library;

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/asset_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final q = context.request.uri.queryParameters;
  final filters = AmpsAssetFilters(
    assetType:      q['asset_type'],
    conditionGrade: q['condition_grade'],
    search:         q['search'],
    filter:         q['filter'],
    page:           int.tryParse(q['page'] ?? '1')         ?? 1,
    pageSize:       int.tryParse(q['page_size'] ?? '50')   ?? 50,
  );

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  final result = await AssetRepo(aw).searchAmps(
    companyId: auth.companyId,
    filters:   filters,
  );
  return Response.json(body: result.toJson((a) => a.toJson()));
}
