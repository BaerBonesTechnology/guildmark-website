import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/asset_valuation_repo.dart';
import 'package:guildmark_api/services/metered_valuation.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  // Gate ML access — anonymous traffic shouldn't reach the inference service.
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(
      503,
      'DB_UNAVAILABLE',
      'Datastore required for valuation quotas.',
    );
  }

  // Degrade gracefully when the ML service is not configured.
  final ml = context.read<MlClient?>();
  if (ml == null) {
    return jsonError(
      503,
      'ML_UNAVAILABLE',
      'Valuation service is not available in this environment.',
    );
  }

  try {
    final raw = await boundedJson(context.request);
    if (raw is! Map<String, dynamic>) {
      return badRequest('A JSON object is required.');
    }
    final body = raw;
    for (final k in [
      'asset_type',
      'model_name',
      'condition_grade',
      'asset_id',
    ]) {
      if (body[k] != null && body[k] is! String) {
        return badRequest('$k must be text.');
      }
    }
    for (final k in ['age_months', 'ram_gb', 'storage_gb']) {
      if (body[k] != null && body[k] is! int) {
        return badRequest('$k must be a whole number.');
      }
    }
    for (final k in ['cpu_score', 'original_price']) {
      if (body[k] != null && body[k] is! num) {
        return badRequest('$k must be numeric.');
      }
    }

    final assetType = body['asset_type'] as String?;
    final modelName = body['model_name'] as String?;
    final condition = body['condition_grade'] as String?;
    final ageMonths = body['age_months'] as int?;
    // Optional — when provided, the valuation is recorded in asset_valuations.
    final assetId = body['asset_id'] as String?;

    if (assetType == null ||
        modelName == null ||
        condition == null ||
        ageMonths == null) {
      return badRequest(
        'asset_type, model_name, condition_grade, age_months required',
      );
    }

    final result = await MeteredValuation(aw, ml).estimate(
      auth.companyId,
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
      assetId: assetId,
    );

    // Persist valuation history when the caller identifies the asset.
    // Fire-and-forget — never blocks the estimate response. Recording was
    // already best-effort (.ignore() swallowed DB errors), so when the
    // datastore is not configured the estimate still succeeds — we just skip
    // the history write instead of returning 503.
    if (assetId != null && !result.cached) {
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
        'cached': result.cached,
        'credit_charged': result.creditCharged,
      },
    );
  } on PlanLimitException catch (e) {
    return jsonError(e.status, e.code, e.message);
  } on FormatException {
    return badRequest('Invalid JSON.');
  } on MlServiceException catch (e) {
    return jsonError(
      502,
      'ML_UNAVAILABLE',
      'Valuation service error: ${e.statusCode}',
    );
  } on Exception {
    return jsonError(
      503,
      'ML_UNAVAILABLE',
      'Valuation is temporarily unavailable.',
    );
  }
}
