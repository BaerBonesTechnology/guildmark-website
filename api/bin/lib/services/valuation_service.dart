/// In-process deterministic valuation and depreciation, ported from ml-qv.
/// This replaces the Python fallback formulas, not its trained sklearn model.
library;

import 'dart:math' as math;

class ValuationRequest {
  ValuationRequest({
    required this.assetType,
    required this.modelName,
    required this.conditionGrade,
    required this.ageMonths,
    this.cpuScore,
    this.ramGb,
    this.storageGb,
    this.originalPrice,
  });

  final String assetType;
  final String modelName;
  final String conditionGrade;
  final int ageMonths;
  final double? cpuScore;
  final int? ramGb;
  final int? storageGb;
  final double? originalPrice;

  Map<String, dynamic> toJson() => {
    'asset_type': assetType,
    'model_name': modelName,
    'condition_grade': conditionGrade,
    'age_months': ageMonths,
    if (cpuScore != null) 'cpu_score': cpuScore,
    if (ramGb != null) 'ram_gb': ramGb,
    if (storageGb != null) 'storage_gb': storageGb,
    if (originalPrice != null) 'original_price': originalPrice,
  };
}

class ValuationResponse {
  ValuationResponse({
    required this.fairMarketValue,
    required this.confidence,
    required this.modelVersion,
  });

  final double fairMarketValue;
  final double confidence;
  final String modelVersion;

  factory ValuationResponse.fromJson(Map<String, dynamic> json) {
    return ValuationResponse(
      fairMarketValue: (json['fair_market_value'] as num).toDouble(),
      confidence: (json['confidence'] as num).toDouble(),
      modelVersion: json['model_version'] as String,
    );
  }
}

class DepreciationPoint {
  DepreciationPoint({required this.month, required this.projectedValue});

  final String month; // YYYY-MM
  final double projectedValue;

  factory DepreciationPoint.fromJson(Map<String, dynamic> json) =>
      DepreciationPoint(
        month: json['month'] as String,
        projectedValue: (json['projected_value'] as num).toDouble(),
      );
}

class ValuationService {
  ValuationService({Map<String, double> decayPriors = const {}})
    : _decayPriors = Map.unmodifiable(decayPriors) {
    if (decayPriors.values.any((value) => !value.isFinite || value <= 0)) {
      throw ArgumentError('Decay priors must be finite and positive');
    }
  }

  static const modelVersion = 'valuation-rules-1.0.0';
  static const depreciationVersion = 'depreciation-rules-1.0.0';
  static const defaultMonthlyDecay = 0.985;
  static const _conditionMultipliers = {'A': 1.0, 'B': 0.78, 'C': 0.55};
  static const _basePrices = {
    'laptop': 950.0,
    'desktop': 700.0,
    'server': 2500.0,
    'phone': 450.0,
    'tablet': 400.0,
    'networking': 600.0,
    'monitor': 220.0,
    'software': 80.0,
    'license': 50.0,
    'other': 300.0,
  };
  final Map<String, double> _decayPriors;

  ValuationResponse estimateFairMarketValue(ValuationRequest request) {
    if (request.ageMonths < 0 || request.ageMonths > 240) {
      throw ArgumentError('age_months must be between 0 and 240');
    }
    final price = request.originalPrice;
    if (price != null && (!price.isFinite || price < 0)) {
      throw ArgumentError('original_price must be finite and nonnegative');
    }
    // Python's `original_price or baseline` treats zero like a missing price.
    final anchor = price != null && price != 0
        ? price
        : _basePrices[request.assetType] ?? 300.0;
    final specifications = [
      request.cpuScore ?? 0,
      request.ramGb ?? 0,
      request.storageGb ?? 0,
    ];
    if (specifications.any((value) => !value.isFinite || value < 0)) {
      throw ArgumentError(
        'Hardware specifications must be finite and nonnegative',
      );
    }
    // Coefficients from training/synthetic_data.py; saturate at reference specs.
    final uplift =
        ((request.cpuScore ?? 0) / 250).clamp(0.0, 1.0) * 0.10 +
        ((request.ramGb ?? 0) / 64).clamp(0.0, 1.0) * 0.05 +
        ((request.storageGb ?? 0) / 2048).clamp(0.0, 1.0) * 0.05;
    final decay = math.max(0.15, math.pow(0.75, request.ageMonths / 12));
    final condition = _conditionMultipliers[request.conditionGrade] ?? 0.7;
    return ValuationResponse(
      fairMarketValue: _money(anchor * decay * condition * (1 + uplift)),
      confidence: 0.40,
      modelVersion: modelVersion,
    );
  }

  List<DepreciationPoint> forecastDepreciation({
    required double startingValue,
    int horizonMonths = 12,
    Map<String, double>? typeWeights,
    DateTime? asOf,
  }) {
    if (!startingValue.isFinite || startingValue < 0) {
      throw ArgumentError('startingValue must be finite and nonnegative');
    }
    if (horizonMonths < 1 || horizonMonths > 36) {
      throw ArgumentError('horizonMonths must be between 1 and 36');
    }
    final weights = typeWeights ?? const <String, double>{};
    if (weights.values.any((value) => !value.isFinite || value < 0)) {
      throw ArgumentError('Portfolio weights must be finite and nonnegative');
    }
    final total = weights.values.fold(0.0, (sum, weight) => sum + weight);
    var decay = defaultMonthlyDecay;
    if (total > 0) {
      decay = weights.entries
          .fold(
            0.0,
            (sum, entry) =>
                sum +
                (_decayPriors[entry.key] ?? defaultMonthlyDecay) *
                    (entry.value / total),
          )
          .clamp(0.90, 0.999);
    }
    final today = asOf ?? DateTime.now().toUtc();
    var value = startingValue;
    return List.generate(horizonMonths, (index) {
      value *= decay;
      final month = DateTime.utc(today.year, today.month + index + 1);
      return DepreciationPoint(
        month:
            '${month.year.toString().padLeft(4, '0')}-${month.month.toString().padLeft(2, '0')}',
        projectedValue: _money(value),
      );
    });
  }

  static double _money(double value) => double.parse(value.toStringAsFixed(2));
}
