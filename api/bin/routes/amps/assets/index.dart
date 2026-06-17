import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/asset_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final q = context.request.uri.queryParameters;
  final filters = AmpsAssetFilters(
    assetType: q['asset_type'],
    conditionGrade: q['condition_grade'],
    search: q['search'],
    filter: q['filter'],
    page: int.tryParse(q['page'] ?? '1') ?? 1,
    pageSize: int.tryParse(q['page_size'] ?? '50') ?? 50,
  );

  final result = await AssetRepo(context.read<Db>()).searchAmps(
    companyId: auth.companyId,
    filters: filters,
  );
  return Response.json(body: result.toJson());
}
