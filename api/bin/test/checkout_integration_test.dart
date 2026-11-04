import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/repos/firestore/checkout_repo.dart';
import 'package:guildmark_api/repos/firestore/listing_repo.dart';
import 'package:guildmark_api/repos/firestore/order_repo.dart';
import 'package:guildmark_api/repos/firestore/offer_repo.dart';
import 'package:guildmark_api/services/checkout_service.dart';
import 'package:guildmark_api/services/square_service.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:test/test.dart';
import '../routes/marketplace/listings/[id]/buy.dart' as buy;
import '../routes/admin/orders/[id]/reconcile.dart' as reconcile;
import '../routes/payments/index.dart' as unbound;

class FaultFirestore extends FirebaseService {
  FaultFirestore(String host)
    : super(projectId: 'demo-guildmark-checkout', emulatorHost: host);
  bool failFinalize = false;
  @override
  Future<dynamic> request(
    String method,
    String path, [
    Map<String, dynamic>? body,
  ]) {
    if (failFinalize &&
        path.endsWith(':commit') &&
        jsonEncode(body).contains('"stringValue":"funded"')) {
      failFinalize = false;
      throw const DatastoreException('Injected finalization outage', code: 503);
    }
    return super.request(method, path, body);
  }
}

/// No network to Square: simulates its idempotency contract and lost responses.
class FakeSquare {
  String mode = 'success';
  int requests = 0;
  final payments = <String, Map<String, dynamic>>{};
  final bodies = <String, String>{};
  late final service = SquareService(
    accessToken: 'test',
    locationId: 'local-location',
    environment: 'sandbox',
    apiUrl: 'https://square.invalid/v2/',
    client: MockClient((request) async {
      requests++;
      expect(request.url.path, startsWith('/v2/payments'));
      expect(request.url.path, isNot(contains('/v2/v2/')));
      if (request.method == 'GET') {
        final match = payments.values.where(
          (p) => p['id'] == request.url.pathSegments.last,
        );
        return http.Response(jsonEncode({'payment': match.single}), 200);
      }
      final data = jsonDecode(request.body) as Map<String, dynamic>;
      final key = data['idempotency_key'] as String;
      if (mode == 'decline') {
        return http.Response(
          '{"errors":[{"code":"CARD_DECLINED","detail":"private"}]}',
          402,
        );
      }
      if (mode == 'unavailable') return http.Response('{}', 503);
      if (bodies.containsKey(key)) expect(request.body, bodies[key]);
      bodies[key] = request.body;
      final payment = payments.putIfAbsent(
        key,
        () => {
          'id': 'pay-$key',
          'status': mode == 'pending' ? 'APPROVED' : 'COMPLETED',
          'amount_money': data['amount_money'],
          'reference_id': data['reference_id'],
          'location_id': data['location_id'],
        },
      );
      if (mode == 'lost') {
        mode = 'success';
        throw TimeoutException('Lost response after capture');
      }
      return http.Response(jsonEncode({'payment': payment}), 200);
    }),
    paymentErrorLogger: (_) {},
  );
}

void main() {
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'Local checkout',
    () {
      late FaultFirestore db;
      late FakeSquare square;
      late String seller;
      late String asset;
      late String listing;
      late String buyer;
      late http.Client client;
      final servers = <HttpServer>[];
      setUpAll(() async {
        final fixture = FaultFirestore(host!);
        const fees = <String, dynamic>{
          'seller_fee_free': .14,
          'seller_fee_starter': .10,
          'seller_fee_growth': .08,
          'seller_fee_pro': .06,
          'buyer_fee': .028,
          'deferral_fee': 0,
          'data_wipe_price_cents': 0,
          'payment_terms_enabled': false,
        };
        try {
          try {
            await fixture.tablesDB.updateRow(
              databaseId: '',
              tableId: 'platform_config',
              rowId: 'config',
              data: fees,
            );
          } on DatastoreException catch (error) {
            if (error.code != 404) rethrow;
            await fixture.tablesDB.createRow(
              databaseId: '',
              tableId: 'platform_config',
              rowId: 'config',
              data: fees,
            );
          }
        } finally {
          fixture.close();
        }
      });
      Future<Row> row(String table, String id) =>
          db.tablesDB.getRow(databaseId: '', tableId: table, rowId: id);
      Future<Row> put(String table, String id, Map<String, dynamic> data) => db
          .tablesDB
          .createRow(databaseId: '', tableId: table, rowId: id, data: data);
      Future<http.Response> request({
        String? company,
        Map<String, dynamic>? data,
        String route = 'buy',
        String? order,
        String audience = 'customer',
        String role = 'admin',
      }) async {
        final principal = AuthPrincipal.fromClaims(
          AccessClaims(
            userId: 'local-user',
            companyId: company ?? buyer,
            role: role,
            audience: audience,
          ),
        );
        final Handler endpoint = route == 'buy'
            ? (context) => buy.onRequest(context, listing)
            : route == 'reconcile'
            ? (context) => reconcile.onRequest(context, order!)
            : unbound.onRequest;
        final handler = endpoint
            .use(provider<AuthPrincipal?>((_) => principal))
            .use(provider<FirebaseService?>((_) => db))
            .use(provider<SquareService?>((_) => square.service));
        final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
        servers.add(server);
        return client.post(
          Uri.parse('http://127.0.0.1:${server.port}/'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(data),
        );
      }

      Map<String, dynamic> payload(String key, [Object quantity = 1]) => {
        'idempotency_key': key,
        'quantity': quantity,
        'source_id': 'nonce-$key',
        'expected_total_cents': quantity is int
            ? quantity * 10001 + (quantity * 10001 * .028).round()
            : 1,
      };
      Future<Row> reserve(String key, {int quantity = 1, String? customer}) =>
          CheckoutRepo(db).reserve(
            listingId: listing,
            buyer: customer ?? buyer,
            key: key,
            quantity: quantity,
            sourceId: 'nonce-$key',
            sellerFee: .14,
            buyerFee: .028,
          );
      setUp(() async {
        db = FaultFirestore(host!);
        square = FakeSquare();
        client = http.Client();
        seller = ID.unique();
        buyer = ID.unique();
        asset = ID.unique();
        listing = ID.unique();
        await put('companies', seller, {'name': 'Seller'});
        await put('business_verifications', seller, {
          'status': 'approved',
          'method': 'manual',
          'company_id': seller,
        });
        await put('companies', buyer, {'name': 'Buyer'});
        await put('assets', asset, {
          'company_id': seller,
          'model_name': 'Pilot Laptop',
          'asset_type': 'laptop',
          'quantity': 3,
        });
        await put('listings', listing, {
          'company_id': seller,
          'asset_id': asset,
          'status': 'active',
          'listed_price_cents': 10001,
        });
      });
      tearDown(() async {
        client.close();
        square.service.close();
        for (final server in servers) {
          await server.close(force: true);
        }
        servers.clear();
        db.close();
      });

      test(
        'invalid quantities and deferred terms never call the provider',
        () async {
          for (final quantity in [0, -1, 1.5, '2', 100001]) {
            expect(
              (await request(data: payload(ID.unique(), quantity))).statusCode,
              400,
            );
          }
          expect(
            (await request(
              data: {...payload(ID.unique()), 'payment_terms': 'net_30'},
            )).statusCode,
            403,
          );
          expect(square.requests, 0);
          expect(
            (await row('assets', asset)).data['reserved_quantity'],
            isNull,
          );
        },
      );

      test(
        'seller approval is required before payment, while buyer verification is not',
        () async {
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'business_verifications',
            rowId: seller,
            data: {'status': 'pending'},
          );
          final key = ID.unique();
          final response = await request(data: payload(key));
          expect(response.statusCode, 403);
          expect(
            (jsonDecode(response.body) as Map)['code'],
            'SELLER_VERIFICATION_REQUIRED',
          );
          expect(square.requests, 0);
          expect(
            (await row('assets', asset)).data['reserved_quantity'],
            isNull,
          );
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'business_verifications',
            rowId: seller,
            data: {'status': 'approved'},
          );
          expect((await request(data: payload(key))).statusCode, 201);
          expect(square.requests, 1);
        },
      );

      test(
        'server prices quantity and fees; records payment; replay never recharges',
        () async {
          final key = ID.unique();
          final response = await request(
            data: {...payload(key, 2), 'amount_cents': 1},
          );
          expect(response.statusCode, 201, reason: response.body);
          final id = (jsonDecode(response.body) as Map)['id'] as String;
          final order = await row('orders', id);
          expect(order.data['amount_cents'], 20002);
          expect(order.data['buyer_fee_cents'], 560);
          expect(order.data['charge_cents'], 20562);
          expect(order.data['square_payment_id'], 'pay-$id');
          expect(order.data['status'], 'funded');
          expect(order.data.containsKey('source_id'), false);
          expect(order.data['escrow_transaction_id'], isNull);
          expect((await row('assets', asset)).data['sold_quantity'], 2);
          expect((await ListingRepo(db).findActiveById(listing))!.quantity, 1);
          expect((await request(data: payload(key, 2))).statusCode, 201);
          expect(square.requests, 1);
          expect((await request(data: payload(key))).statusCode, 409);
        },
      );

      test('two buyers cannot buy the last inventory concurrently', () async {
        final results = await Future.wait([
          request(data: payload(ID.unique(), 3)),
          request(company: ID.unique(), data: payload(ID.unique(), 3)),
        ]);
        expect(results.map((r) => r.statusCode).toList()..sort(), [201, 409]);
        expect(square.payments.length, 1);
        expect((await row('assets', asset)).data['sold_quantity'], 3);
        expect((await row('listings', listing)).data['status'], 'sold');
        expect(await ListingRepo(db).findActiveById(listing), isNull);
      });

      test(
        'simultaneous retries produce one order, reservation, and logical charge',
        () async {
          final key = ID.unique();
          final responses = await Future.wait([
            request(data: payload(key, 2)),
            request(data: payload(key, 2)),
          ]);
          for (final response in responses) {
            expect(response.statusCode, 201, reason: response.body);
          }
          expect(square.payments.length, 1);
          expect((await row('assets', asset)).data['sold_quantity'], 2);
          expect((await row('assets', asset)).data['reserved_quantity'], 0);
        },
      );

      test(
        'confirmed decline releases exactly once and allows a new checkout',
        () async {
          square.mode = 'decline';
          final key = ID.unique();
          expect((await request(data: payload(key, 3))).statusCode, 402);
          expect((await request(data: payload(key, 3))).statusCode, 402);
          expect(square.requests, 1);
          expect((await row('assets', asset)).data['reserved_quantity'], 0);
          square.mode = 'success';
          expect(
            (await request(data: payload(ID.unique(), 3))).statusCode,
            201,
          );
        },
      );

      test(
        'lost capture response holds stock and retries the identical payment',
        () async {
          square.mode = 'lost';
          final key = ID.unique();
          expect((await request(data: payload(key, 2))).statusCode, 409);
          expect((await row('assets', asset)).data['reserved_quantity'], 2);
          expect((await request(data: payload(ID.unique()))).statusCode, 409);
          expect(
            (await request(
              data: {...payload(key, 2), 'source_id': 'replacement'},
            )).statusCode,
            409,
          );
          expect((await request(data: payload(key, 2))).statusCode, 201);
          expect(square.payments.length, 1);
        },
      );

      test(
        'database failure after capture is recoverable with the same key',
        () async {
          db.failFinalize = true;
          final key = ID.unique();
          expect((await request(data: payload(key, 2))).statusCode, 503);
          final intent = await row('orders', CheckoutRepo.orderId(buyer, key));
          expect(intent.data['status'], 'payment_pending');
          expect((await row('assets', asset)).data['reserved_quantity'], 2);
          expect((await request(data: payload(key, 2))).statusCode, 201);
          expect(square.payments.length, 1);
          expect((await row('assets', asset)).data['sold_quantity'], 2);
        },
      );

      test(
        'nonterminal provider status never funds; reload can query the recorded payment',
        () async {
          square.mode = 'pending';
          final key = ID.unique();
          expect((await request(data: payload(key))).statusCode, 409);
          final payment = square.payments.values.single;
          payment['status'] = 'COMPLETED';
          expect(
            (await request(
              data: {
                'idempotency_key': key,
                'quantity': 1,
                'expected_total_cents': 10281,
              },
            )).statusCode,
            201,
          );
          expect(square.payments.length, 1);
        },
      );

      test(
        'unknown failures retain holds; staff can reconcile after a reload',
        () async {
          square.mode = 'lost';
          final key = ID.unique();
          await request(data: payload(key));
          final id = CheckoutRepo.orderId(buyer, key);
          expect(
            (await request(
              data: {
                'idempotency_key': key,
                'quantity': 1,
                'expected_total_cents': 10281,
              },
            )).statusCode,
            409,
          );
          final data = {'payment_id': 'pay-$id'};
          expect(
            (await request(
              route: 'reconcile',
              order: id,
              data: data,
            )).statusCode,
            403,
          );
          expect(
            (await request(
              route: 'reconcile',
              order: id,
              data: data,
              audience: 'staff',
              role: 'support',
            )).statusCode,
            403,
          );
          expect(
            (await request(
              route: 'reconcile',
              order: id,
              data: data,
              audience: 'staff',
            )).statusCode,
            200,
          );
          expect((await row('orders', id)).data['status'], 'funded');
          expect((await row('assets', asset)).data['reserved_quantity'], 0);
        },
      );

      test(
        'mismatched payment identity or currency cannot consume inventory',
        () async {
          final intent = await reserve(ID.unique());
          for (final field in ['amount', 'currency', 'reference', 'location']) {
            await CheckoutService(
              CheckoutRepo(db),
              square.service,
            ).applyPayment(
              intent,
              SquarePaymentResult(
                id: 'foreign',
                status: 'COMPLETED',
                amountCents: field == 'amount'
                    ? 1
                    : intent.data['charge_cents'] as int,
                currency: field == 'currency' ? 'EUR' : 'USD',
                referenceId: field == 'reference' ? 'other-order' : intent.$id,
                locationId: field == 'location'
                    ? 'other-location'
                    : 'local-location',
              ),
            );
          }
          expect(
            (await row('orders', intent.$id)).data['status'],
            'payment_pending',
          );
          expect((await row('assets', asset)).data['reserved_quantity'], 1);
        },
      );

      test(
        'self purchase, missing asset and insufficient stock never charge',
        () async {
          expect(
            (await request(
              company: seller,
              data: payload(ID.unique()),
            )).statusCode,
            422,
          );
          expect(
            (await request(data: payload(ID.unique(), 4))).statusCode,
            409,
          );
          await db.tablesDB.deleteRow(
            databaseId: '',
            tableId: 'assets',
            rowId: asset,
          );
          expect((await request(data: payload(ID.unique()))).statusCode, 409);
          expect(square.requests, 0);
        },
      );

      test(
        'duplicate listings share inventory and unpaid orders cannot ship',
        () async {
          await reserve(ID.unique(), quantity: 3);
          final duplicate = ID.unique();
          await put('listings', duplicate, {
            'company_id': seller,
            'asset_id': asset,
            'status': 'active',
            'listed_price_cents': 10001,
          });
          await expectLater(
            CheckoutRepo(db).reserve(
              listingId: duplicate,
              buyer: ID.unique(),
              key: ID.unique(),
              quantity: 1,
              sourceId: 'test',
              sellerFee: .14,
              buyerFee: .028,
            ),
            throwsA(isA<CheckoutConflict>()),
          );
          final offers = ID.unique();
          await put('buyer_offers', offers, {
            'listing_id': listing,
            'buyer_company_id': buyer,
            'quantity': 1,
            'offer_price_cents': 10000,
            'status': 'accepted',
            'expires_at': '2099-01-01T00:00:00Z',
          });
          await expectLater(
            OrderRepo(db).create(
              offerId: offers,
              callerCompanyId: seller,
              sellerFeePct: .14,
              buyerFeePct: .028,
            ),
            throwsStateError,
          );
        },
      );

      test(
        'accepted-offer orders multiply unit price and reserve atomically',
        () async {
          final offer = ID.unique();
          await put('buyer_offers', offer, {
            'listing_id': listing,
            'buyer_company_id': buyer,
            'quantity': 2,
            'offer_price_cents': 5000,
            'status': 'accepted',
            'expires_at': '2099-01-01T00:00:00Z',
          });
          final repo = OrderRepo(db);
          final order = await repo.create(
            offerId: offer,
            callerCompanyId: seller,
            sellerFeePct: .14,
            buyerFeePct: .028,
          );
          expect(order.amount, 100);
          expect(order.buyerFee, 2.8);
          expect(order.status, 'awaiting_payment');
          expect((await row('assets', asset)).data['reserved_quantity'], 2);
          expect(
            await repo.addTracking(
              id: order.id,
              sellerCompanyId: seller,
              trackingNumber: 'test',
            ),
            isNull,
          );
          await expectLater(
            repo.create(
              offerId: offer,
              callerCompanyId: seller,
              sellerFeePct: .14,
              buyerFeePct: .028,
            ),
            throwsStateError,
          );
          expect((await row('assets', asset)).data['reserved_quantity'], 2);
        },
      );

      test(
        'unbound payment route cannot charge arbitrary client totals',
        () async {
          expect(
            (await request(
              route: 'unbound',
              data: {'source_id': 'nonce', 'amount_cents': 1},
            )).statusCode,
            410,
          );
          expect(square.requests, 0);
        },
      );

      test('changed price fails before reserving or charging', () async {
        final response = await request(
          data: {...payload(ID.unique()), 'expected_total_cents': 100},
        );
        expect(response.statusCode, 409);
        expect(response.body, contains('PRICE_CHANGED'));
        expect(square.requests, 0);
        expect((await row('assets', asset)).data['reserved_quantity'], isNull);
      });

      test(
        'transaction rollback leaves no inventory hold or partial order',
        () async {
          final key = ID.unique();
          final id = CheckoutRepo.orderId(buyer, key);
          // Force the atomic offer create to collide after inventory was buffered.
          await put('buyer_offers', 'buy-$id', {
            'listing_id': listing,
            'buyer_company_id': buyer,
          });
          expect((await request(data: payload(key))).statusCode, 503);
          expect(
            (await row('assets', asset)).data['reserved_quantity'],
            isNull,
          );
          await expectLater(
            row('orders', id),
            throwsA(isA<DatastoreException>()),
          );
          expect(square.requests, 0);
        },
      );

      test(
        'accepted-offer order and buy-now contend for the same final units',
        () async {
          final offer = ID.unique();
          await put('buyer_offers', offer, {
            'listing_id': listing,
            'buyer_company_id': ID.unique(),
            'quantity': 3,
            'offer_price_cents': 5000,
            'status': 'accepted',
            'expires_at': '2099-01-01T00:00:00Z',
          });
          final outcome = await Future.wait([
            OrderRepo(db)
                .create(
                  offerId: offer,
                  callerCompanyId: seller,
                  sellerFeePct: .14,
                  buyerFeePct: .028,
                )
                .then((_) => true)
                .catchError((Object _) => false),
            reserve(
              ID.unique(),
              quantity: 3,
            ).then((_) => true).catchError((Object _) => false),
          ]);
          expect(outcome.where((won) => won).length, 1);
          expect((await row('assets', asset)).data['reserved_quantity'], 3);
        },
      );

      test('expired offers cannot be accepted or reserve stock', () async {
        final offer = ID.unique();
        await put('buyer_offers', offer, {
          'listing_id': listing,
          'buyer_company_id': buyer,
          'quantity': 1,
          'offer_price_cents': 5000,
          'status': 'pending',
          'expires_at': '2020-01-01T00:00:00Z',
        });
        await expectLater(
          OfferRepo(
            db,
          ).respond(offerId: offer, sellerCompanyId: seller, action: 'accept'),
          throwsStateError,
        );
        await db.tablesDB.updateRow(
          databaseId: '',
          tableId: 'buyer_offers',
          rowId: offer,
          data: {'status': 'accepted'},
        );
        await expectLater(
          OrderRepo(db).create(
            offerId: offer,
            callerCompanyId: seller,
            sellerFeePct: .14,
            buyerFeePct: .028,
          ),
          throwsStateError,
        );
        expect((await row('assets', asset)).data['reserved_quantity'], isNull);
      });

      test(
        'funded order cannot be downgraded to a second escrow funding flow',
        () async {
          final response = await request(data: payload(ID.unique()));
          final id = (jsonDecode(response.body) as Map)['id'] as String;
          final repo = OrderRepo(db);
          expect(
            await repo.setEscrow(
              id: id,
              escrowTransactionId: 'second-charge',
              escrowStatus: 'pending',
            ),
            isNull,
          );
          expect(
            await repo.addTracking(
              id: id,
              sellerCompanyId: buyer,
              trackingNumber: 'test',
            ),
            isNull,
          );
          expect(
            (await repo.addTracking(
              id: id,
              sellerCompanyId: seller,
              trackingNumber: 'test',
            ))!.status,
            'shipped',
          );
          expect((await row('assets', asset)).data['sold_quantity'], 1);
        },
      );
    },
    skip: host == null ? 'Requires local Firestore emulator' : false,
  );
}
