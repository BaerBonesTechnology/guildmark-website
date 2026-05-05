/// GET /assets — manual + MDM-imported assets for the auth'd company.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/asset_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final assets = await AssetRepo(context.read<Db>()).findByCompany(auth.companyId);
  return Response.json(body: assets.map((a) => a.toJson()).toList());
}
