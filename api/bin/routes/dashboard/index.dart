/// GET /dashboard — top-level seller dashboard summary.
///
/// Aggregates active listings count, pending offers, recent valuation flags.

import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/dashboard_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final summary = await DashboardRepo(context.read<Db>()).summarize(auth.companyId);
  return Response.json(body: summary.toJson());
}
