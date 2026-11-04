import 'dart:convert';
import 'dart:io';

import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/models/asset.dart';
import 'package:guildmark_api/models/paginated.dart';
import 'package:guildmark_api/repos/firestore/asset_repo.dart';
import 'package:guildmark_api/services/amps_assistant.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';

import '../routes/amps/_middleware.dart' as amps;
import '../routes/amps/assistant.dart' as route;

class MockAssets extends Mock implements AssetRepo {}

class MockMl extends Mock implements MlClient {}

class MockFirebase extends Mock implements FirebaseService {}

class MockTables extends Mock implements TablesDB {}

Asset asset(
  String id, {
  String company = 'owner',
  int quantity = 2,
  DateTime? purchased,
  bool unknownDate = false,
}) => Asset(
  id: id,
  companyId: company,
  mdmSource: 'manual',
  modelName: 'ThinkPad T14',
  assetType: 'laptop',
  conditionGrade: 'B',
  quantity: quantity,
  createdAt: DateTime.utc(2026),
  updatedAt: DateTime.utc(2026),
  purchaseDate: unknownDate ? null : purchased ?? DateTime.utc(2023),
  cpuScore: 10000,
  ramGb: 16,
  storageGb: 512,
  serialNumber: 'private-serial',
  assignedUser: 'private-person',
);

void main() {
  setUpAll(() {
    registerFallbackValue(AmpsAssetFilters());
    registerFallbackValue(
      ValuationRequest(
        assetType: 'laptop',
        modelName: 'test',
        conditionGrade: 'B',
        ageMonths: 12,
      ),
    );
  });
  late MockAssets assets;
  late MockMl ml;
  late AmpsAssistant assistant;
  setUp(() {
    assets = MockAssets();
    ml = MockMl();
    assistant = AmpsAssistant(
      assets,
      ml,
      now: () => DateTime.utc(2026, 10, 30),
    );
  });

  test(
    'summary is bounded and does not disclose private inventory fields',
    () async {
      when(
        () => assets.searchAmps(
          companyId: 'owner',
          filters: any(named: 'filters'),
        ),
      ).thenAnswer(
        (_) async => PaginatedResponse.paginate(
          data: [asset('one')],
          total: 70,
          page: 1,
          pageSize: 50,
        ),
      );
      final result = await assistant.respond(
        companyId: 'owner',
        body: {'intent': 'portfolio_summary'},
      );
      expect(result['portfolio'], {
        'asset_records': 70,
        'shown_records': 1,
        'shown_units': 2,
        'truncated': true,
      });
      expect(jsonEncode(result), isNot(contains('private-serial')));
      expect(jsonEncode(result), isNot(contains('private-person')));
      expect(result['results'], isEmpty);
      verifyNever(() => ml.estimateFairMarketValue(any()));
      final captured =
          verify(
                () => assets.searchAmps(
                  companyId: 'owner',
                  filters: captureAny(named: 'filters'),
                ),
              ).captured.single
              as AmpsAssetFilters;
      expect(captured.pageSize, 50);
    },
  );

  test(
    'foreign or missing selection returns same error before any inference',
    () async {
      for (final selected in [null, asset('hidden', company: 'other')]) {
        when(
          () => assets.findById(id: 'hidden', companyId: 'owner'),
        ).thenAnswer((_) async => selected);
        await expectLater(
          assistant.respond(
            companyId: 'owner',
            body: {
              'intent': 'value_assets',
              'asset_ids': ['hidden'],
            },
          ),
          throwsA(
            isA<AssistantRequestException>()
                .having((e) => e.status, 'status', 404)
                .having(
                  (e) => e.message,
                  'message',
                  'One or more selected assets are unavailable.',
                ),
          ),
        );
      }
      verifyNever(() => ml.estimateFairMarketValue(any()));
    },
  );

  test('missing age is explicit and never inferred as a new asset', () async {
    when(
      () => assets.findById(id: 'one', companyId: 'owner'),
    ).thenAnswer((_) async => asset('one', unknownDate: true));
    final result = await assistant.respond(
      companyId: 'owner',
      body: {
        'intent': 'value_assets',
        'asset_ids': ['one'],
      },
    );
    final row = (result['results'] as List).single as Map;
    expect(row['status'], 'missing_data');
    expect(row['missing_fields'], contains('purchase_date'));
    expect(result['totals'], {
      'estimated_value': 0.0,
      'estimated_units': 0,
      'unestimated_units': 2,
    });
    verifyNever(() => ml.estimateFairMarketValue(any()));
  });

  test(
    'partial failure keeps unit-aware totals and previews remain unsaved',
    () async {
      when(
        () => assets.findById(id: 'one', companyId: 'owner'),
      ).thenAnswer((_) async => asset('one', quantity: 3));
      when(
        () => assets.findById(id: 'two', companyId: 'owner'),
      ).thenAnswer((_) async => asset('two'));
      var calls = 0;
      when(() => ml.estimateFairMarketValue(any())).thenAnswer((_) async {
        if (++calls == 2) {
          throw MlServiceException(503, 'private provider details');
        }
        return ValuationResponse(
          fairMarketValue: 123.456,
          confidence: .6,
          modelVersion: 'valuation-test',
        );
      });
      final result = await assistant.respond(
        companyId: 'owner',
        body: {
          'intent': 'listing_previews',
          'asset_ids': ['one', 'two'],
        },
      );
      final rows = result['results'] as List;
      expect(rows[0]['fair_market_value_per_unit'], 123.46);
      expect(rows[0]['listing_preview']['status'], 'preview_only');
      expect(rows[1]['status'], 'unavailable');
      expect(rows[1].containsKey('listing_preview'), false);
      expect(result['totals'], {
        'estimated_value': 370.38,
        'estimated_units': 3,
        'unestimated_units': 2,
      });
      expect(jsonEncode(result), isNot(contains('private provider details')));
    },
  );

  test(
    'unconfigured ML produces unavailable results and no invented prices',
    () async {
      when(
        () => assets.findById(id: 'one', companyId: 'owner'),
      ).thenAnswer((_) async => asset('one'));
      final result = await AmpsAssistant(assets, null).respond(
        companyId: 'owner',
        body: {
          'intent': 'listing_previews',
          'asset_ids': ['one'],
        },
      );
      final row = (result['results'] as List).single as Map;
      expect(row['status'], 'unavailable');
      expect(row['fair_market_value_per_unit'], isNull);
      expect(row.containsKey('listing_preview'), false);
    },
  );

  test(
    'unsupported assets and invalid numeric metadata never reach ML',
    () async {
      final base = asset('one');
      for (final invalid in [
        base.copyWith(assetType: 'server'),
        base.copyWith(cpuScore: double.nan),
        base.copyWith(ramGb: double.infinity),
        base.copyWith(storageGb: -1),
        base.copyWith(originalPurchasePrice: double.infinity),
        base.copyWith(quantity: 9223372036854775807),
      ]) {
        when(
          () => assets.findById(id: 'one', companyId: 'owner'),
        ).thenAnswer((_) async => invalid);
        final result = await assistant.respond(
          companyId: 'owner',
          body: {
            'intent': 'value_assets',
            'asset_ids': ['one'],
          },
        );
        final row = (result['results'] as List).single as Map;
        expect(row['status'], 'missing_data');
        expect(row['fair_market_value_per_unit'], isNull);
        expect(() => jsonEncode(result), returnsNormally);
      }
      verifyNever(() => ml.estimateFairMarketValue(any()));
    },
  );

  test(
    'rejects unknown actions, injected company IDs, duplicate and excessive selections',
    () {
      for (final body in <Map<String, dynamic>>[
        {'intent': 'publish'},
        {'intent': 'portfolio_summary', 'company_id': 'other'},
        {
          'intent': 'portfolio_summary',
          'asset_ids': ['one'],
        },
        {
          'intent': 'value_assets',
          'asset_ids': ['one', 'one'],
        },
        {'intent': 'value_assets', 'asset_ids': List.generate(6, (i) => '$i')},
        {
          'intent': 'value_assets',
          'asset_ids': ['../other'],
        },
      ]) {
        expect(
          () => AmpsAssistant.validate(body),
          throwsA(isA<AssistantRequestException>()),
        );
      }
    },
  );

  test(
    'HTTP route honors subscription, validates inputs, and uses read-only datastore calls',
    () async {
      final db = MockFirebase();
      final tables = MockTables();
      when(() => db.tablesDB).thenReturn(tables);
      var subscribed = false;
      final queries = <List<String>>[];
      when(
        () => tables.listRows(
          databaseId: any(named: 'databaseId'),
          tableId: any(named: 'tableId'),
          queries: any(named: 'queries'),
        ),
      ).thenAnswer((invocation) async {
        final table = invocation.namedArguments[#tableId] as String;
        queries.add(invocation.namedArguments[#queries] as List<String>);
        if (table == 'subscriptions') {
          return RowList(
            rows: subscribed
                ? [
                    Row(
                      $id: 'sub',
                      $createdAt: '2026-01-01',
                      $updatedAt: '2026-01-01',
                      data: {
                        'company_id': 'owner',
                        'plan': 'pro',
                        'status': 'active',
                        'current_period_start': DateTime.now()
                            .toUtc()
                            .subtract(const Duration(days: 1))
                            .toIso8601String(),
                        'current_period_end': DateTime.now()
                            .toUtc()
                            .add(const Duration(days: 29))
                            .toIso8601String(),
                      },
                    ),
                  ]
                : [],
            total: subscribed ? 1 : 0,
          );
        }
        expect(table, 'assets');
        return const RowList(rows: [], total: 0);
      });
      AuthPrincipal? principal = AuthPrincipal(
        userId: 'user',
        companyId: 'owner',
        role: 'owner',
      );
      final handler = amps
          .middleware(route.onRequest)
          .use(provider<AuthPrincipal?>((_) => principal))
          .use(provider<FirebaseService?>((_) => db))
          .use(provider<MlClient?>((_) => null));
      final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
      final client = http.Client();
      final url = Uri.parse('http://127.0.0.1:${server.port}/amps/assistant');
      Future<http.Response> post(Object body) => client.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );
      try {
        expect((await post({'intent': 'portfolio_summary'})).statusCode, 403);
        subscribed = true;
        final summary = await post({'intent': 'portfolio_summary'});
        expect(summary.statusCode, 200, reason: summary.body);
        expect(jsonDecode(summary.body)['mode'], 'guided');
        expect(queries.every((q) => q.any((v) => v.contains('owner'))), true);
        expect((await post({'intent': 'publish'})).statusCode, 400);
        expect(
          (await post({
            'intent': 'portfolio_summary',
            'company_id': 'other',
          })).statusCode,
          400,
        );
        expect((await client.post(url, body: 'invalid json')).statusCode, 400);
        expect((await client.post(url, body: 'x' * 8193)).statusCode, 413);
        expect((await client.get(url)).statusCode, 405);
        principal = null;
        expect((await post({'intent': 'portfolio_summary'})).statusCode, 401);
        // Any unexpected create/update call on the mock would fail this request;
        // all successful calls above only use listRows.
        verifyNever(
          () => tables.createRow(
            databaseId: any(named: 'databaseId'),
            tableId: any(named: 'tableId'),
            rowId: any(named: 'rowId'),
            data: any(named: 'data'),
          ),
        );
        verifyNever(
          () => tables.updateRow(
            databaseId: any(named: 'databaseId'),
            tableId: any(named: 'tableId'),
            rowId: any(named: 'rowId'),
            data: any(named: 'data'),
          ),
        );
      } finally {
        client.close();
        await server.close(force: true);
      }
    },
  );
}
