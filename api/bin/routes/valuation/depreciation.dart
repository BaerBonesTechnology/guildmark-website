import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/portfolio_repo.dart';
import 'package:guildmark_api/services/valuation_service.dart';

/// Forecast from the authenticated company's current portfolio, never a
/// placeholder value or a caller-supplied company ID.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  final horizon = int.tryParse(
    context.request.uri.queryParameters['horizon_months'] ?? '12',
  );
  if (horizon == null || horizon < 1 || horizon > 36) {
    return badRequest('horizon_months must be between 1 and 36');
  }
  final datastore = context.read<AppwriteService?>();
  if (datastore == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final portfolio = await PortfolioRepo(datastore).summarize(
    companyId: auth.companyId,
    trendMonths: 1,
  );
  final forecast = context.read<ValuationService>().forecastDepreciation(
    startingValue: portfolio.totalPortfolioValue,
    horizonMonths: horizon,
    typeWeights: portfolio.byType.map(
      (key, bucket) => MapEntry(key, bucket.value),
    ),
  );
  return Response.json(
    body: {
      'model_version': ValuationService.depreciationVersion,
      'forecast': forecast
          .map(
            (point) => {
              'month': point.month,
              'projected_value': point.projectedValue,
            },
          )
          .toList(),
    },
  );
}
