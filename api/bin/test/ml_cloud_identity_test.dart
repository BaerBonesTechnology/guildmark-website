import 'dart:convert';
import 'package:guildmark_api/ml/cloud_run_identity.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:test/test.dart';

void main() {
  test(
    'metadata identity uses fixed audience and cached short-lived ID token',
    () async {
      var calls = 0;
      const audience = 'https://guildmark-ml-example.us-central1.run.app';
      final encoded = base64Url
          .encode(
            utf8.encode(
              jsonEncode({
                'aud': audience,
                'exp': DateTime.now().millisecondsSinceEpoch ~/ 1000 + 3600,
              }),
            ),
          )
          .replaceAll('=', '');
      final identity = CloudRunIdentity(
        audience,
        client: MockClient((r) async {
          calls++;
          expect(r.url.host, 'metadata.google.internal');
          expect(r.url.queryParameters['audience'], audience);
          expect(r.headers['Metadata-Flavor'], 'Google');
          return http.Response(
            'header.$encoded.signature',
            200,
            headers: {'metadata-flavor': 'Google'},
          );
        }),
      );
      expect(await identity.token(), contains(encoded));
      await identity.token();
      expect(calls, 1);
    },
  );
  test('private ML sends separate IAM and application credentials', () async {
    final client = MlClient(
      baseUrl: 'https://guildmark-ml-example.us-central1.run.app',
      serviceToken: 'application-fixture',
      identityToken: () async => 'iam-fixture',
      client: MockClient((r) async {
        expect(r.headers['Authorization'], 'Bearer application-fixture');
        expect(r.headers['X-Serverless-Authorization'], 'Bearer iam-fixture');
        return http.Response(
          '{"fair_market_value":100,"confidence":0.8,"model_version":"fixture"}',
          200,
        );
      }),
    );
    await client.estimateFairMarketValue(
      ValuationRequest(
        assetType: 'laptop',
        modelName: 'QA',
        conditionGrade: 'B',
        ageMonths: 12,
      ),
    );
    client.close();
  });
  test('IAM audience cannot target arbitrary or insecure services', () {
    for (final url in [
      'http://ml:8001',
      'https://example.com',
      'https://ml.run.app/path',
      'https://ml.run.app?x=1',
    ])
      expect(() => CloudRunIdentity(url), throwsArgumentError);
  });
  test(
    'metadata errors do not fall back to an application token alone',
    () async {
      final identity = CloudRunIdentity(
        'https://ml-example.run.app',
        client: MockClient((_) async => http.Response('unavailable', 503)),
      );
      await expectLater(identity.token(), throwsStateError);
    },
  );
}
