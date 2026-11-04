import 'dart:convert';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:test/test.dart';

void main() {
  test('ML inference and tracking forward the internal token', () async {
    final paths = <String>[];
    final client = MlClient(
      baseUrl: 'http://ml:8001',
      serviceToken: 'internal-secret',
      client: MockClient((request) async {
        expect(request.headers['Authorization'], 'Bearer internal-secret');
        expect(request.headers['Content-Type'], 'application/json');
        paths.add(request.url.path);
        return http.Response(
          jsonEncode(
            request.url.path.endsWith('valuation')
                ? {
                    'fair_market_value': 100,
                    'confidence': 0.8,
                    'model_version': 'test',
                  }
                : {'forecast': <Map<String, dynamic>>[]},
          ),
          200,
        );
      }),
    );
    await client.estimateFairMarketValue(
      ValuationRequest(
        assetType: 'laptop',
        modelName: 'Pilot Laptop',
        conditionGrade: 'B',
        ageMonths: 12,
      ),
    );
    await client.forecastDepreciation(companyId: 'company', horizonMonths: 12);
    await client.trackModel(modelName: 'Pilot Laptop', assetType: 'laptop');
    expect(paths, [
      '/predict/valuation',
      '/predict/depreciation',
      '/data/track',
    ]);
    client.close();
  });
}
