/// Read-only, guided AMPS workflow. ML supplies estimates; this is not an LLM.
library;

import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/models/asset.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/asset_repo.dart';

class AssistantRequestException implements Exception {
  AssistantRequestException(this.message, {this.status = 400});
  final String message;
  final int status;
}

class AmpsAssistant {
  AmpsAssistant(this.assets, this.ml, {DateTime Function()? now, this.estimate})
    : now = now ?? DateTime.now;

  final Future<ValuationResponse> Function(
    String companyId,
    ValuationRequest request,
    String assetId,
  )?
  estimate;
  final AssetRepo assets;
  final MlClient? ml;
  final DateTime Function() now;
  static const intents = {
    'portfolio_summary',
    'value_assets',
    'listing_previews',
  };
  static const maxSelected = 5;
  static const maxShown = 50;

  static List<String> validate(Map<String, dynamic> body) {
    if (body.keys.any((key) => !{'intent', 'asset_ids'}.contains(key)) ||
        !intents.contains(body['intent'])) {
      throw AssistantRequestException(
        'Choose a supported guided assistant action.',
      );
    }
    final raw = body['asset_ids'];
    if (body['intent'] == 'portfolio_summary') {
      if (raw != null && (raw is! List || raw.isNotEmpty)) {
        throw AssistantRequestException(
          'Portfolio summary does not accept selected assets.',
        );
      }
      return [];
    }
    if (raw is! List ||
        raw.isEmpty ||
        raw.length > maxSelected ||
        raw.any(
          (id) =>
              id is! String ||
              id.trim().isEmpty ||
              id.length > 128 ||
              id.contains('/'),
        )) {
      throw AssistantRequestException('Select between 1 and 5 asset records.');
    }
    final ids = raw.cast<String>();
    if (ids.toSet().length != ids.length) {
      throw AssistantRequestException('Select each asset record only once.');
    }
    return ids;
  }

  Future<Map<String, dynamic>> respond({
    required String companyId,
    required Map<String, dynamic> body,
  }) async {
    final ids = validate(body);
    final intent = body['intent'] as String;
    final warnings = <String>[];
    final response = <String, dynamic>{
      'mode': 'guided',
      'intent': intent,
      'as_of': now().toUtc().toIso8601String(),
      'assets': <Map<String, dynamic>>[],
      'results': <Map<String, dynamic>>[],
      'totals': {
        'estimated_value': 0.0,
        'estimated_units': 0,
        'unestimated_units': 0,
      },
      'warnings': warnings,
    };
    if (intent == 'portfolio_summary') {
      final page = await assets.searchAmps(
        companyId: companyId,
        filters: AmpsAssetFilters(),
      );
      final shown = page.data.take(maxShown).toList();
      response['assets'] = shown.map(_assetPreview).toList();
      response['portfolio'] = {
        'asset_records': page.total,
        'shown_records': shown.length,
        'shown_units': shown.fold<int>(
          0,
          (sum, a) => sum + (_validQuantity(a.quantity) ? a.quantity : 0),
        ),
        'truncated': page.total > shown.length,
      };
      response['message'] = shown.isEmpty
          ? 'There are no asset records in your AMPS inventory yet.'
          : 'Showing ${shown.length} of ${page.total} asset records. '
                'Select up to 5 records to estimate their resale value '
                'or prepare listing previews.';
      warnings.add(
        'Unit counts describe the displayed records only. '
        'No fleet-wide value has been estimated.',
      );
      if (page.total > shown.length) {
        warnings.add(
          'This guided demo displays the first 50 inventory records only.',
        );
      }
      return response;
    }

    // Resolve every selection before inference. Foreign and unknown IDs have
    // exactly the same error and never disclose another company's inventory.
    final selected = <Asset>[];
    for (final id in ids) {
      final asset = await assets.findById(id: id, companyId: companyId);
      if (asset == null || asset.companyId != companyId) {
        throw AssistantRequestException(
          'One or more selected assets are unavailable.',
          status: 404,
        );
      }
      selected.add(asset);
    }
    response['assets'] = selected.map(_assetPreview).toList();
    final results = <Map<String, dynamic>>[];
    var estimatedValue = 0.0;
    var estimatedUnits = 0;
    var unestimatedUnits = 0;
    for (final asset in selected) {
      final missing = <String>[
        if (asset.assetType != 'laptop') 'asset_type',
        if (asset.purchaseDate == null ||
            asset.purchaseDate!.isAfter(now()) ||
            now().difference(asset.purchaseDate!).inDays / 30.44 > 240)
          'purchase_date',
        if (asset.modelName.trim().isEmpty) 'model_name',
        if (!{'A', 'B', 'C'}.contains(asset.conditionGrade)) 'condition_grade',
        if (!_validQuantity(asset.quantity)) 'quantity',
        if (asset.originalPurchasePrice != null &&
            !_positive(asset.originalPurchasePrice))
          'original_purchase_price',
        if (asset.assetType == 'laptop' || asset.assetType == 'desktop') ...[
          if (!_positive(asset.cpuScore)) 'cpu_score',
          if (!_positive(asset.ramGb)) 'ram_gb',
          if (!_positive(asset.storageGb)) 'storage_gb',
        ],
      ];
      final result = <String, dynamic>{
        'asset_id': asset.id,
        'model_name': asset.modelName,
        'quantity': asset.quantity,
        'status': missing.isNotEmpty ? 'missing_data' : 'unavailable',
        'missing_fields': missing,
        'fair_market_value_per_unit': null,
        'total_value': null,
        'confidence': null,
        'model_version': null,
        'valuation_basis': 'unknown',
      };
      if (missing.isEmpty && ml != null) {
        try {
          final age = (now().difference(asset.purchaseDate!).inDays / 30.44)
              .floor();
          final request = ValuationRequest(
            assetType: asset.assetType,
            modelName: asset.modelName,
            conditionGrade: asset.conditionGrade,
            ageMonths: age,
            cpuScore: asset.cpuScore,
            ramGb: asset.ramGb?.toInt(),
            storageGb: asset.storageGb?.toInt(),
            originalPrice: asset.originalPurchasePrice,
          );
          final valuation =
              await (estimate == null
                      ? ml!.estimateFairMarketValue(request)
                      : estimate!(companyId, request, asset.id))
                  .timeout(const Duration(seconds: 8));
          final unit = valuation.fairMarketValue;
          if (!unit.isFinite ||
              unit <= 0 ||
              unit > 1000000 ||
              !valuation.confidence.isFinite ||
              valuation.confidence < 0 ||
              valuation.confidence > 1) {
            throw const FormatException('Invalid estimate');
          }
          final unitCents = (unit * 100).round();
          if (unitCents <= 0) throw const FormatException('Invalid estimate');
          final total = unitCents * asset.quantity / 100;
          result.addAll({
            'status': 'estimated',
            'fair_market_value_per_unit': unitCents / 100,
            'total_value': total,
            'confidence': valuation.confidence,
            'model_version': valuation.modelVersion,
            'cached': valuation.cached,
            'credit_charged': valuation.creditCharged,
          });
          if (intent == 'listing_previews') {
            result['listing_preview'] = {
              'title': '${asset.modelName} — Grade ${asset.conditionGrade}',
              'description':
                  '${asset.quantity} unit(s). '
                  '${asset.ramGb?.toInt() ?? "Unknown"} GB RAM; '
                  '${asset.storageGb?.toInt() ?? "Unknown"} GB storage. '
                  'Condition grade ${asset.conditionGrade}. '
                  'Owner review required; sanitization and warranty '
                  'are not verified by this preview.',
              'quantity': asset.quantity,
              'unit_price': unitCents / 100,
              'total_value': total,
              'status': 'preview_only',
            };
          }
          estimatedValue += total;
          estimatedUnits += asset.quantity;
        } on PlanLimitException catch (e) {
          result['status'] = 'unavailable';
          result['code'] = e.code;
          result['message'] = e.message;
        } on Exception {
          // Do not expose internal provider response bodies or credentials.
          result['status'] = 'unavailable';
        }
      }
      if (result['status'] != 'estimated') {
        unestimatedUnits += _validQuantity(asset.quantity) ? asset.quantity : 0;
      }
      results.add(result);
    }
    response['results'] = results;
    response['totals'] = {
      'estimated_value': (estimatedValue * 100).round() / 100,
      'estimated_units': estimatedUnits,
      'unestimated_units': unestimatedUnits,
    };
    response['message'] = intent == 'listing_previews'
        ? 'Prepared previews for estimated assets only. '
              'No inventory or listings were saved or published. Estimate cache and credit usage may be recorded.'
        : 'Estimated $estimatedUnits selected unit(s). '
              'Unestimated assets are excluded from the value total.';
    const priceWarning =
        'Values are indicative gross estimates in USD, before fees, shipping, '
        'and service costs; they are not guaranteed sale prices.';
    const confidenceWarning =
        'Confidence is a model heuristic, not a calibrated probability or '
        'accuracy guarantee. The current ML API does not disclose whether '
        'a trained model or rules fallback produced an estimate.';
    warnings.addAll([priceWarning, confidenceWarning]);
    return response;
  }

  static bool _positive(double? value) =>
      value != null && value.isFinite && value > 0 && value <= 1000000;

  static bool _validQuantity(int value) => value > 0 && value <= 1000000;

  static double? _safeNumber(double? value) => _positive(value) ? value : null;

  static Map<String, dynamic> _assetPreview(Asset asset) => {
    'asset_id': asset.id,
    'model_name': asset.modelName,
    'asset_type': asset.assetType,
    'condition_grade': asset.conditionGrade,
    'quantity': asset.quantity,
    'purchase_date': asset.purchaseDate?.toIso8601String(),
    'cpu_score': _safeNumber(asset.cpuScore),
    'ram_gb': _safeNumber(asset.ramGb),
    'storage_gb': _safeNumber(asset.storageGb),
  };
}
