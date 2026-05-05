/// POST /valuation/estimate
///
/// Thin pass-through to the Python ML service. The frontend's
/// MarketCalculator hits this when the user fills in asset details.
///
/// Returns 503 if the ML service is not configured (ML_SERVICE_URL unset).
library;

import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/http_helpers.dart';
import '../../lib/ml/ml_client.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  // Gate ML access — anonymous traffic shouldn't reach the inference service.
  if (context.read<AuthPrincipal?>() == null) return unauthorized();

  // Degrade gracefully when the ML service is not configured.
  final ml = context.read<MlClient?>();
  if (ml == null) {
    return jsonError(
      503,
      'ML_UNAVAILABLE',
      'Valuation service is not available in this environment.',
    );
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  if (body == null) return badRequest('Missing body');

  final assetType = body['asset_type'] as String?;
  final modelName = body['model_name'] as String?;
  final condition = body['condition_grade'] as String?;
  final ageMonths = body['age_months'] as int?;
  if (assetType == null ||
      modelName == null ||
      condition == null ||
      ageMonths == null) {
    return badRequest(
        'asset_type, model_name, condition_grade, age_months required');
  }

  try {
    final result = await ml.estimateFairMarketValue(
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
    return Response.json(body: {
      'fair_market_value': result.fairMarketValue,
      'confidence': result.confidence,
      'model_version': result.modelVersion,
    });
  } on MlServiceException catch (e) {
    return jsonError(
        502, 'ML_UNAVAILABLE', 'Valuation service error: ${e.statusCode}');
  }
}
