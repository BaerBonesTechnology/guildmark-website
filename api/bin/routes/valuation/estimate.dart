import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/valuation_service.dart';
import 'package:guildmark_api/repos/appwrite/asset_valuation_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  // Require an authenticated account for estimates.
  if (context.read<AuthPrincipal?>() == null) return unauthorized();

  final valuationService = context.read<ValuationService>();

  try {
    final decoded = await context.request.json();
    if (decoded is! Map<String, dynamic>)
      return badRequest('Expected JSON object');
    final body = decoded;
    final assetType = body['asset_type'];
    final modelName = body['model_name'] ?? '';
    final condition = body['condition_grade'];
    final ageMonths = body['age_months'];
    final assetId = body['asset_id'];
    if (assetType is! String ||
        modelName is! String ||
        condition is! String ||
        ageMonths is! int ||
        (assetId != null && assetId is! String)) {
      return badRequest(
        'asset_type, condition_grade and integer age_months required',
      );
    }
    for (final key in ['cpu_score', 'original_price']) {
      if (body[key] != null && body[key] is! num)
        return badRequest('$key must be numeric');
    }
    for (final key in ['ram_gb', 'storage_gb']) {
      if (body[key] != null && body[key] is! int)
        return badRequest('$key must be an integer');
    }
    final result = valuationService.estimateFairMarketValue(
      ValuationRequest(
        assetType: assetType,
        modelName: modelName,
        conditionGrade: condition,
        ageMonths: ageMonths,
        cpuScore: (body['cpu_score'] as num?)?.toDouble(),
        ramGb: body['ram_gb'] as int?,
        storageGb: body['storage_gb'] as int?,
        originalPrice: (body['original_price'] as num?)?.toDouble(),
      ),
    );

    // Persist valuation history when the caller identifies the asset.
    // Fire-and-forget — never blocks the estimate response. Recording was
    // already best-effort (.ignore() swallowed DB errors), so when the
    // datastore is not configured the estimate still succeeds — we just skip
    // the history write instead of returning 503.
    final aw = context.read<AppwriteService?>();
    if (assetId is String && aw != null) {
      AssetValuationRepo(aw)
          .record(
            assetId: assetId,
            source: 'estimate',
            modelName: modelName,
            assetType: assetType,
            conditionGrade: condition,
            ageMonths: ageMonths,
            fairMarketValue: result.fairMarketValue,
            confidence: result.confidence,
            modelVersion: result.modelVersion,
          )
          .ignore();
    }

    return Response.json(
      body: {
        'fair_market_value': result.fairMarketValue,
        'confidence': result.confidence,
        'model_version': result.modelVersion,
      },
    );
  } on FormatException {
    return badRequest('Invalid JSON');
  } on ArgumentError catch (e) {
    return jsonError(
      400,
      'INVALID_VALUATION',
      e.message.toString(),
    );
  }
}
