import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';
import 'package:guildmark_api/repos/firestore/asset_repo.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';
import 'package:guildmark_api/services/billing_owner.dart';
import 'package:guildmark_api/services/metered_valuation.dart';
import 'package:guildmark_api/services/square_service.dart';
import 'package:guildmark_api/services/subscription_checkout.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:test/test.dart';
import '../routes/valuation/estimate.dart' as estimate_route;

class TestMl extends MlClient {
  TestMl() : super(baseUrl: 'https://unused.invalid');
  int calls = 0;
  bool fail = false;
  bool invalid = false;
  @override
  Future<ValuationResponse> estimateFairMarketValue(
    ValuationRequest request,
  ) async {
    calls++;
    await Future<void>.delayed(const Duration(milliseconds: 80));
    if (fail) throw MlServiceException(503, 'offline');
    return ValuationResponse(
      fairMarketValue: invalid ? double.nan : 100,
      confidence: .7,
      modelVersion: 'test-model-1',
    );
  }
}

void main() {
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  final quotaError = isA<PlanLimitException>().having(
    (e) => e.code,
    'code',
    'ASSET_LIMIT_EXCEEDED',
  );
  Map<String, dynamic> asset(int quantity, {String type = 'laptop'}) => {
    'model_name': 'Test laptop',
    'asset_type': type,
    'condition_grade': 'B',
    'quantity': quantity,
    'purchase_date': '2024-01-01T00:00:00Z',
    'cpu_score': 5000.0,
    'ram_gb': 16,
    'storage_gb': 256,
  };
  ValuationRequest input([String name = 'Laptop']) => ValuationRequest(
    assetType: 'laptop',
    modelName: name,
    conditionGrade: 'B',
    ageMonths: 24,
    cpuScore: 5000,
    ramGb: 16,
    storageGb: 256,
  );
  test('catalog, clamped calendar periods and strict input validation', () {
    expect(ampsPlans['starter']!.toJson(), containsPair('price_cents', 3900));
    expect(ampsPlans['growth']!.assetLimit, 500);
    expect(ampsPlans['pro']!.valuationLimit, 4000);
    expect(ampsPlans.values.map((p) => p.seatLimit), everyElement(1));
    expect(ampsPlans['starter']!.toJson()['additional_seat_price_cents'], 800);
    expect(
      nextBillingMonth(DateTime.utc(2028, 1, 31)),
      DateTime.utc(2028, 2, 29),
    );
    expect(
      nextBillingMonth(DateTime.utc(2027, 1, 31)),
      DateTime.utc(2027, 2, 28),
    );
    for (final bad in [
      {...asset(1), 'quantity': -1},
      {...asset(1), 'quantity': 1.5},
      {...asset(1), 'company_id': 'foreign'},
      {...asset(1), 'ram_gb': 16.5},
      {...asset(1), 'cpu_score': double.infinity},
    ]) {
      expect(
        () => AmpsInventoryRepo.validate(bad),
        throwsA(isA<PlanLimitException>()),
      );
    }
  });
  group(
    'AMPS persistent limits',
    () {
      late FirebaseService db;
      late AmpsInventoryRepo inventory;
      late String company;
      Future<String> companyWithPlan(String plan) async {
        final id = ID.unique();
        await db.tablesDB.createRow(
          databaseId: '',
          tableId: 'companies',
          rowId: id,
          data: {'name': 'quota-$id'},
        );
        final now = DateTime.now().toUtc();
        await db.tablesDB.createRow(
          databaseId: '',
          tableId: 'subscriptions',
          rowId: id,
          data: {
            'company_id': id,
            'plan': plan,
            'status': 'active',
            'current_period_start': now
                .subtract(const Duration(days: 1))
                .toIso8601String(),
            'current_period_end': now
                .add(const Duration(days: 29))
                .toIso8601String(),
          },
        );
        return id;
      }

      Future<dynamic> settled(Future<dynamic> future) async {
        try {
          return await future;
        } on Exception catch (e) {
          return e;
        }
      }

      setUp(() async {
        db = FirebaseService(projectId: 'demo-guildmark', emulatorHost: host);
        inventory = AmpsInventoryRepo(db);
        company = await companyWithPlan('starter');
      });
      tearDown(() => db.close());

      test(
        'physical quantity cap is atomic under concurrent additions and tenant scoped',
        () async {
          await inventory.createRows(company, [asset(99)]);
          final results = await Future.wait([
            settled(inventory.createRows(company, [asset(1)])),
            settled(inventory.createRows(company, [asset(1)])),
          ]);
          expect(
            results.whereType<PlanLimitException>().single.code,
            'ASSET_LIMIT_EXCEEDED',
          );
          expect(inventoryUnits(await inventory.rows(company)), 100);
          final other = await companyWithPlan('starter');
          await inventory.createRows(other, [asset(100)]);
          expect(inventoryUnits(await inventory.rows(other)), 100);
          await inventory.createRows(company, [asset(100, type: 'software')]);
          expect(inventoryUnits(await inventory.rows(company)), 100);
        },
      );
      test(
        'atomic import rejects overrun, stable keys replay and mismatches fail',
        () async {
          await expectLater(
            inventory.createRows(company, [asset(60), asset(41)]),
            throwsA(quotaError),
          );
          expect(await inventory.rows(company), isEmpty);
          const key = 'integration_import_001';
          final first = await inventory.createRows(company, [
            asset(10),
            asset(5),
          ], idempotencyKey: key);
          final again = await inventory.createRows(company, [
            asset(10),
            asset(5),
          ], idempotencyKey: key);
          expect(again.map((r) => r.$id), first.map((r) => r.$id));
          expect(inventoryUnits(await inventory.rows(company)), 15);
          await expectLater(
            inventory.createRows(company, [asset(9)], idempotencyKey: key),
            throwsA(
              isA<PlanLimitException>().having(
                (e) => e.code,
                'code',
                'IDEMPOTENCY_CONFLICT',
              ),
            ),
          );
        },
      );
      test(
        'downgrade retains view, allows reductions/archive, rejects cross-company edits',
        () async {
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'subscriptions',
            rowId: company,
            data: {'plan': 'pro'},
          );
          final record = (await inventory.createRows(company, [
            asset(600),
          ])).single;
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'subscriptions',
            rowId: company,
            data: {'plan': 'growth'},
          );
          expect(inventoryUnits(await inventory.rows(company)), 600);
          await expectLater(
            inventory.createRows(company, [asset(1)]),
            throwsA(quotaError),
          );
          await inventory.update(company, record.$id, {'quantity': 500});
          final other = await companyWithPlan('pro');
          await expectLater(
            inventory.update(other, record.$id, {'quantity': 1}),
            throwsA(
              isA<PlanLimitException>().having((e) => e.status, 'status', 404),
            ),
          );
          await inventory.update(company, record.$id, {}, archive: true);
          expect(inventoryUnits(await inventory.rows(company)), 0);
          expect((await inventory.rows(company)).single.data['archived'], true);
          expect(
            await AssetRepo(db).findById(id: record.$id, companyId: company),
            isNull,
          );
        },
      );
      test(
        'seller asset creation shares paid cap; Free marketplace has no AMPS cap',
        () async {
          await inventory.createRows(company, [asset(100)]);
          await expectLater(
            AssetRepo(db).create(
              companyId: company,
              modelName: 'extra',
              assetType: 'laptop',
              conditionGrade: 'B',
              quantity: 1,
            ),
            throwsA(quotaError),
          );
          final free = await companyWithPlan('free');
          await AssetRepo(db).create(
            companyId: free,
            modelName: 'marketplace stock',
            assetType: 'laptop',
            conditionGrade: 'B',
            quantity: 5000,
          );
          expect(inventoryUnits(await inventory.rows(free)), 5000);
          await expectLater(
            inventory.createRows(free, [asset(1)]),
            throwsA(
              isA<PlanLimitException>().having(
                (e) => e.code,
                'code',
                'SUBSCRIPTION_REQUIRED',
              ),
            ),
          );
        },
      );
      test(
        'last valuation credit cannot overspend; cached reads do not charge',
        () async {
          final sub = (await SubscriptionRepo(db).findByCompany(company))!;
          final window = BillingWindow(sub, DateTime.now().toUtc());
          await db.tablesDB.createRow(
            databaseId: '',
            tableId: 'amps_valuation_usage',
            rowId: window.key(company),
            data: {
              'company_id': company,
              'used': 199,
              'reservations': <String, dynamic>{},
            },
          );
          final ml = TestMl();
          final meter = MeteredValuation(db, ml);
          final results = await Future.wait([
            settled(meter.estimate(company, input('A'))),
            settled(meter.estimate(company, input('B'))),
          ]);
          expect(results.whereType<ValuationResponse>().length, 1);
          expect(
            results.whereType<PlanLimitException>().single.code,
            'VALUATION_LIMIT_EXCEEDED',
          );
          expect(ml.calls, 1);
          final winner = results.first is ValuationResponse ? 'A' : 'B';
          expect((await meter.estimate(company, input(winner))).cached, true);
          expect(ml.calls, 1);
          final usage = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'amps_valuation_usage',
            rowId: window.key(company),
          );
          expect(usage.data['used'], 200);
          expect(usage.data['reservations'], isEmpty);
        },
      );
      test(
        'model failure/invalid output releases reservation; valid retry bills once',
        () async {
          final ml = TestMl()..fail = true;
          final meter = MeteredValuation(db, ml);
          await expectLater(
            meter.estimate(company, input()),
            throwsA(isA<MlServiceException>()),
          );
          ml.fail = false;
          ml.invalid = true;
          await expectLater(
            meter.estimate(company, input()),
            throwsA(isA<PlanLimitException>()),
          );
          ml.invalid = false;
          expect((await meter.estimate(company, input())).creditCharged, true);
          expect((await meter.estimate(company, input())).creditCharged, false);
          final sub = (await SubscriptionRepo(db).findByCompany(company))!;
          final usage = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'amps_valuation_usage',
            rowId: BillingWindow(sub, DateTime.now().toUtc()).key(company),
          );
          expect(usage.data['used'], 1);
          expect(usage.data['reservations'], isEmpty);
          final other = await companyWithPlan('starter');
          expect((await meter.estimate(other, input())).cached, false);
        },
      );
      test(
        'missing/expired paid periods and unsupported types cannot trigger inference',
        () async {
          final ml = TestMl();
          final meter = MeteredValuation(db, ml);
          await expectLater(
            meter.estimate(
              company,
              ValuationRequest(
                assetType: 'software',
                modelName: 'license',
                conditionGrade: 'B',
                ageMonths: 1,
              ),
            ),
            throwsA(
              isA<PlanLimitException>().having(
                (e) => e.code,
                'code',
                'UNSUPPORTED_ASSET_TYPE',
              ),
            ),
          );
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'subscriptions',
            rowId: company,
            data: {'current_period_end': null},
          );
          await expectLater(
            meter.estimate(company, input()),
            throwsA(isA<PlanLimitException>()),
          );
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'subscriptions',
            rowId: company,
            data: {'current_period_end': '2020-01-01T00:00:00Z'},
          );
          await expectLater(
            meter.estimate(company, input()),
            throwsA(isA<PlanLimitException>()),
          );
          expect(ml.calls, 0);
        },
      );
      test(
        'generic route rejects foreign/missing asset identically before inference/history',
        () async {
          final foreign = await companyWithPlan('starter');
          final record = (await inventory.createRows(foreign, [
            asset(1),
          ])).single;
          final ml = TestMl();
          Future<http.Response> request(String id) async {
            final handler = estimate_route.onRequest
                .use(
                  provider<AuthPrincipal?>(
                    (_) => AuthPrincipal(
                      userId: 'x',
                      companyId: company,
                      role: 'admin',
                    ),
                  ),
                )
                .use(provider<FirebaseService?>((_) => db))
                .use(provider<MlClient?>((_) => ml));
            final server = await serve(
              handler,
              InternetAddress.loopbackIPv4,
              0,
            );
            try {
              return await http.post(
                Uri.parse('http://127.0.0.1:${server.port}/valuation/estimate'),
                body: jsonEncode({...input().toJson(), 'asset_id': id}),
                headers: {'Content-Type': 'application/json'},
              );
            } finally {
              await server.close(force: true);
            }
          }

          final a = await request(record.$id);
          final b = await request(ID.unique());
          expect(a.statusCode, 404);
          expect(a.body, b.body);
          expect(ml.calls, 0);
          final history = await db.tablesDB.listRows(
            databaseId: '',
            tableId: 'asset_valuations',
            queries: [Query.equal('asset_id', record.$id)],
          );
          expect(history.rows, isEmpty);
        },
      );
      test(
        'billing owner resolved from database, not asserted token role',
        () async {
          final uid = ID.unique();
          await db.tablesDB.createRow(
            databaseId: '',
            tableId: 'users',
            rowId: uid,
            data: {
              'company_id': company,
              'email': '$uid@example.invalid',
              'role': 'admin',
            },
          );
          expect(
            await isBillingOwner(
              db,
              AuthPrincipal(userId: uid, companyId: company, role: 'admin'),
            ),
            true,
          );
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'users',
            rowId: uid,
            data: {'role': 'member'},
          );
          expect(
            await isBillingOwner(
              db,
              AuthPrincipal(userId: uid, companyId: company, role: 'admin'),
            ),
            false,
          );
        },
      );
      test(
        'sandbox paid grant requires exact completed payment, then replays without charging',
        () async {
          final free = await companyWithPlan('free');
          var requests = 0;
          final square = SquareService(
            accessToken: 'test',
            locationId: 'test-location',
            environment: 'sandbox',
            client: MockClient((req) async {
              requests++;
              final body = jsonDecode(req.body) as Map<String, dynamic>;
              return http.Response(
                jsonEncode({
                  'payment': {
                    'id': 'payment-${ID.unique()}',
                    'status': 'COMPLETED',
                    'amount_money': body['amount_money'],
                    'location_id': 'test-location',
                    'reference_id': body['reference_id'],
                  },
                }),
                200,
              );
            }),
          );
          final checkout = SubscriptionCheckout(db, square);
          final result = await checkout.checkout(
            companyId: free,
            plan: 'starter',
            key: 'checkout_test_0001',
            sourceId: 'nonce',
          );
          expect(result['granted'], true);
          expect((result['invoice'] as Map)['amount_cents'], 3900);
          final replay = await checkout.checkout(
            companyId: free,
            plan: 'starter',
            key: 'checkout_test_0001',
          );
          expect(replay['granted'], true);
          expect(requests, 1);
          final invoices = await db.tablesDB.listRows(
            databaseId: '',
            tableId: 'subscription_invoices',
            queries: [Query.equal('company_id', free)],
          );
          expect(invoices.rows.length, 1);
          square.close();
        },
      );
      test(
        'pending or wrong-amount payments never activate or write paid invoices',
        () async {
          for (final status in ['APPROVED', 'COMPLETED']) {
            final free = await companyWithPlan('free');
            final square = SquareService(
              accessToken: 'test',
              locationId: 'test-location',
              environment: 'sandbox',
              client: MockClient((req) async {
                final body = jsonDecode(req.body) as Map<String, dynamic>;
                return http.Response(
                  jsonEncode({
                    'payment': {
                      'id': 'bad-${ID.unique()}',
                      'status': status,
                      'amount_money': {'amount': 1, 'currency': 'USD'},
                      'location_id': 'test-location',
                      'reference_id': body['reference_id'],
                    },
                  }),
                  200,
                );
              }),
            );
            final operation = SubscriptionCheckout(db, square).checkout(
              companyId: free,
              plan: 'starter',
              key: 'bad_checkout_00001',
              sourceId: 'nonce',
            );
            if (status == 'APPROVED') {
              expect((await operation)['granted'], false);
            } else {
              await expectLater(
                operation,
                throwsA(
                  isA<PlanLimitException>().having(
                    (e) => e.code,
                    'code',
                    'PAYMENT_RECONCILIATION_REQUIRED',
                  ),
                ),
              );
            }
            expect(
              (await SubscriptionRepo(db).findByCompany(free))!.plan,
              'free',
            );
            expect(
              (await db.tablesDB.listRows(
                databaseId: '',
                tableId: 'subscription_invoices',
                queries: [Query.equal('company_id', free)],
              )).rows,
              isEmpty,
            );
            square.close();
          }
        },
      );

      test(
        'full inventory pagination exceeds 500 rows without losing quota units',
        () async {
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'subscriptions',
            rowId: company,
            data: {'plan': 'pro'},
          );
          for (var page = 0; page < 12; page++) {
            await inventory.createRows(
              company,
              List.generate(50, (_) => asset(1)),
            );
          }
          final all = await inventory.rows(company);
          expect(all.length, 600);
          expect(inventoryUnits(all), 600);
          expect((await AssetRepo(db).findByCompany(company)).length, 600);
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'subscriptions',
            rowId: company,
            data: {'plan': 'growth'},
          );
          await expectLater(
            inventory.createRows(company, [asset(1)]),
            throwsA(quotaError),
          );
        },
        timeout: const Timeout(Duration(seconds: 90)),
      );
      test(
        'expired valuation leases release capacity without charging failed work',
        () async {
          final sub = (await SubscriptionRepo(db).findByCompany(company))!;
          final usageId = BillingWindow(
            sub,
            DateTime.now().toUtc(),
          ).key(company);
          await db.tablesDB.createRow(
            databaseId: '',
            tableId: 'amps_valuation_usage',
            rowId: usageId,
            data: {
              'company_id': company,
              'used': 199,
              'reservations': {
                'abandoned': {
                  'token': 'old',
                  'expires_at': '2020-01-01T00:00:00Z',
                },
              },
            },
          );
          final ml = TestMl();
          expect(
            (await MeteredValuation(
              db,
              ml,
            ).estimate(company, input())).creditCharged,
            true,
          );
          final usage = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'amps_valuation_usage',
            rowId: usageId,
          );
          expect(usage.data['used'], 200);
          expect(usage.data['reservations'], isEmpty);
        },
      );
      test(
        'unknown payment response remains safe pending; original nonce replay charges once',
        () async {
          final free = await companyWithPlan('free');
          var requests = 0;
          Map<String, dynamic>? stored;
          final square = SquareService(
            accessToken: 'test',
            locationId: 'test-location',
            environment: 'sandbox',
            client: MockClient((req) async {
              requests++;
              final body = jsonDecode(req.body) as Map<String, dynamic>;
              stored ??= {
                'id': 'lost-response-payment',
                'status': 'COMPLETED',
                'amount_money': body['amount_money'],
                'location_id': 'test-location',
                'reference_id': body['reference_id'],
              };
              if (requests == 1) {
                throw TimeoutException('simulated lost response after payment');
              }
              return http.Response(jsonEncode({'payment': stored}), 200);
            }),
          );
          final checkout = SubscriptionCheckout(db, square);
          await expectLater(
            checkout.checkout(
              companyId: free,
              plan: 'starter',
              key: 'lost_response_0001',
              sourceId: 'original-nonce',
            ),
            throwsA(isA<TimeoutException>()),
          );
          expect(
            (await checkout.checkout(
              companyId: free,
              plan: 'starter',
              key: 'lost_response_0001',
            ))['status'],
            'pending',
          );
          expect(requests, 1);
          await expectLater(
            checkout.checkout(
              companyId: free,
              plan: 'starter',
              key: 'new_attempt_00001',
              sourceId: 'new-nonce',
            ),
            throwsA(
              isA<PlanLimitException>().having(
                (e) => e.code,
                'code',
                'PAYMENT_PENDING',
              ),
            ),
          );
          await expectLater(
            checkout.checkout(
              companyId: free,
              plan: 'starter',
              key: 'lost_response_0001',
              sourceId: 'new-nonce',
            ),
            throwsA(isA<PlanLimitException>()),
          );
          expect(
            (await SubscriptionRepo(db).findByCompany(free))!.plan,
            'free',
          );
          expect(
            (await checkout.checkout(
              companyId: free,
              plan: 'starter',
              key: 'lost_response_0001',
              sourceId: 'original-nonce',
            ))['granted'],
            true,
          );
          expect(requests, 2);
          square.close();
        },
      );
      test(
        'known pending payment recovers by provider GET without another charge',
        () async {
          final free = await companyWithPlan('free');
          var posts = 0;
          var status = 'APPROVED';
          Map<String, dynamic>? payment;
          final square = SquareService(
            accessToken: 'test',
            locationId: 'test-location',
            environment: 'sandbox',
            client: MockClient((req) async {
              if (req.method == 'POST') {
                posts++;
                final body = jsonDecode(req.body) as Map<String, dynamic>;
                payment = {
                  'id': 'pending-payment',
                  'amount_money': body['amount_money'],
                  'location_id': 'test-location',
                  'reference_id': body['reference_id'],
                };
              }
              return http.Response(
                jsonEncode({
                  'payment': {...payment!, 'status': status},
                }),
                200,
              );
            }),
          );
          final checkout = SubscriptionCheckout(db, square);
          expect(
            (await checkout.checkout(
              companyId: free,
              plan: 'starter',
              key: 'known_pending_0001',
              sourceId: 'nonce',
            ))['granted'],
            false,
          );
          status = 'COMPLETED';
          expect(
            (await checkout.checkout(
              companyId: free,
              plan: 'starter',
              key: 'known_pending_0001',
            ))['granted'],
            true,
          );
          expect(posts, 1);
          square.close();
        },
      );
    },
    skip: host == null ? 'Requires isolated Firestore emulator' : false,
  );
  test('catalog mismatch fails closed before any provider mutation', () async {
    final methods = <String>[];
    final square = SquareService(
      accessToken: 'test',
      locationId: 'test',
      environment: 'sandbox',
      client: MockClient((req) async {
        methods.add(req.method);
        return http.Response(
          jsonEncode({
            'object': {
              'id': 'variation',
              'type': 'SUBSCRIPTION_PLAN_VARIATION',
              'subscription_plan_variation_data': {
                'phases': [
                  {
                    'cadence': 'MONTHLY',
                    'pricing': {
                      'type': 'STATIC',
                      'price_money': {'currency': 'USD', 'amount': 4900},
                    },
                  },
                ],
              },
            },
          }),
          200,
        );
      }),
    );
    await expectLater(
      square.verifyMonthlyPlan('variation', 3900),
      throwsA(isA<SquareException>()),
    );
    expect(methods, ['GET']);
    square.close();
  });
}
