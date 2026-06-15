/// GET /amps/portfolio
///
/// Aggregates the AMPS dashboard hero stats + N-month trend for a company.
/// Trend data is sourced from pre-aggregated `valuation_snapshots` rows; hero
/// stats are computed live from the `assets` table.

import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/portfolio_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final q            = context.request.uri.queryParameters;
  final trendMonths  = int.tryParse(q['trend_months'] ?? '12') ?? 12;

  final summary = await PortfolioRepo(context.read<Db>()).summarize(
    companyId:   auth.companyId,
    trendMonths: trendMonths.clamp(1, 36),
  );
  return Response.json(body: summary.toJson());
}
