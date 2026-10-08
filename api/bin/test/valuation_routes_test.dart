import 'dart:convert';

import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/services/valuation_service.dart';
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';

import '../routes/valuation/estimate.dart' as estimate;
import '../routes/valuation/depreciation.dart' as depreciation;

class _Context extends Mock implements RequestContext {}

RequestContext contextFor(Request request, {bool authenticated = true}) {
  final context = _Context();
  when(() => context.request).thenReturn(request);
  when(() => context.read<AuthPrincipal?>()).thenReturn(
    authenticated
        ? AuthPrincipal(userId: 'user', companyId: 'company', role: 'member')
        : null,
  );
  when(() => context.read<ValuationService>()).thenReturn(ValuationService());
  when(() => context.read<AppwriteService?>()).thenReturn(null);
  return context;
}

void main() {
  final uri = Uri.parse('http://localhost/valuation/estimate');
  const sample = {
    'asset_type': 'laptop',
    'condition_grade': 'A',
    'age_months': 12,
    'original_price': 1200,
  };

  test('authenticated estimate works without Python or a datastore', () async {
    final response = await estimate.onRequest(
      contextFor(
        Request.post(
          uri,
          body: jsonEncode(sample),
          headers: {'content-type': 'application/json'},
        ),
      ),
    );
    expect(response.statusCode, 200);
    expect(await response.json(), {
      'fair_market_value': 900.0,
      'confidence': 0.4,
      'model_version': ValuationService.modelVersion,
    });
  });
  test('anonymous and unsupported methods stay gated', () async {
    expect(
      (await estimate.onRequest(
        contextFor(Request.post(uri), authenticated: false),
      )).statusCode,
      401,
    );
    expect(
      (await estimate.onRequest(contextFor(Request.get(uri)))).statusCode,
      405,
    );
  });
  test('invalid payloads return 400 instead of a server failure', () async {
    for (final body in [
      '{',
      '[]',
      '{}',
      jsonEncode({...sample, 'age_months': -1}),
      jsonEncode({...sample, 'age_months': '12'}),
      jsonEncode({...sample, 'ram_gb': 1.5}),
      jsonEncode({...sample, 'original_price': '1200'}),
    ]) {
      final response = await estimate.onRequest(
        contextFor(
          Request.post(
            uri,
            body: body,
            headers: {'content-type': 'application/json'},
          ),
        ),
      );
      expect(response.statusCode, 400, reason: body);
    }
  });
  test(
    'depreciation validates horizon and requires real portfolio data',
    () async {
      for (final horizon in ['0', '37', 'invalid']) {
        final request = Request.get(
          Uri.parse(
            'http://localhost/valuation/depreciation?horizon_months=$horizon',
          ),
        );
        expect(
          (await depreciation.onRequest(contextFor(request))).statusCode,
          400,
        );
      }
      final request = Request.get(
        Uri.parse('http://localhost/valuation/depreciation'),
      );
      expect(
        (await depreciation.onRequest(contextFor(request))).statusCode,
        503,
      );
      expect(
        (await depreciation.onRequest(
          contextFor(request, authenticated: false),
        )).statusCode,
        401,
      );
    },
  );
}
