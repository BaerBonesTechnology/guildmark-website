import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/portfolio_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final q = context.request.uri.queryParameters;
  final trendMonths = int.tryParse(q['trend_months'] ?? '12') ?? 12;

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  final summary = await PortfolioRepo(aw).summarize(
    companyId: auth.companyId,
    trendMonths: trendMonths.clamp(1, 36),
  );
  return Response.json(body: summary.toJson());
}
