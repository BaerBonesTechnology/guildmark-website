import 'dart:convert';

import 'package:http/http.dart' as http;

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

class MlClient {
  MlClient({required this.baseUrl, http.Client? client})
    : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Future<ValuationResponse> estimateFairMarketValue(
    ValuationRequest req,
  ) async {
    final resp = await _client.post(
      Uri.parse('$baseUrl/predict/valuation'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(req.toJson()),
    );
    if (resp.statusCode != 200) {
      throw MlServiceException(resp.statusCode, resp.body);
    }
    return ValuationResponse.fromJson(
      jsonDecode(resp.body) as Map<String, dynamic>,
    );
  }

  Future<List<DepreciationPoint>> forecastDepreciation({
    required String companyId,
    required int horizonMonths,
  }) async {
    final resp = await _client.post(
      Uri.parse('$baseUrl/predict/depreciation'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({
        'company_id': companyId,
        'horizon_months': horizonMonths,
      }),
    );
    if (resp.statusCode != 200) {
      throw MlServiceException(resp.statusCode, resp.body);
    }
    final body = jsonDecode(resp.body) as Map<String, dynamic>;
    final pts = (body['forecast'] as List).cast<Map<String, dynamic>>();
    return pts.map(DepreciationPoint.fromJson).toList();
  }

  Future<void> trackModel({
    required String modelName,
    required String assetType,
  }) async {
    try {
      await _client.post(
        Uri.parse('$baseUrl/data/track'),
        headers: const {'Content-Type': 'application/json'},
        body: jsonEncode({'model_name': modelName, 'asset_type': assetType}),
      );
    } catch (_) {
      // Non-fatal — ML service may be unavailable or the --profile ml not active.
    }
  }

  void close() => _client.close();
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

class MlServiceException implements Exception {
  MlServiceException(this.statusCode, this.body);
  final int statusCode;
  final String body;

  @override
  String toString() => 'MlServiceException($statusCode): $body';
}
