import 'dart:convert';
import 'dart:io';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/services/billing_payment_method.dart';
import 'package:guildmark_api/services/paid_invoice.dart';
import 'package:guildmark_api/services/recurring_billing.dart';
import 'package:guildmark_api/services/square_service.dart';
import 'package:test/test.dart';
import 'recurring_billing_test.dart' show Provider;

Map<String, dynamic> copy(Map<String, dynamic> m) =>
    Map<String, dynamic>.from(jsonDecode(jsonEncode(m)) as Map);

class CardProvider extends Provider {
  CardProvider() {
    subscription['card_id'] = 'old-card';
    subscription['canceled_date'] = '2026-12-31';
    subscription['invoice_ids'] = [];
    cards['old-card'] = {
      'id': 'old-card',
      'customer_id': 'customer',
      'enabled': true,
      'card_brand': 'VISA',
      'last_4': '1111',
      'exp_month': 12,
      'exp_year': 2030,
    };
  }
  final cards = <String, Map<String, dynamic>>{};
  final mutations = <String>[];
  bool decline = false, lostCreate = false, lostPut = false;
  @override
  Future<Map<String, dynamic>> billing(
    String method,
    String path, [
    Map<String, dynamic>? body,
    Map<String, String>? query,
  ]) async {
    if (method != 'GET') mutations.add('$method $path');
    if (path == '/cards' && method == 'GET')
      return {'cards': cards.values.map(copy).toList()};
    if (path == '/cards' && method == 'POST') {
      if (decline) throw SquareException(402, 'declined');
      final c = <String, dynamic>{
        'id': 'new-card',
        'customer_id': 'customer',
        'enabled': true,
        'card_brand': 'MASTERCARD',
        'last_4': '4444',
        'exp_month': 12,
        'exp_year': 2030,
        'reference_id': (body!['card'] as Map)['reference_id'],
      };
      cards['new-card'] = c;
      if (lostCreate) {
        lostCreate = false;
        throw const SocketException('lost card response');
      }
      return {'card': copy(c)};
    }
    if (path.startsWith('/cards/') && method == 'GET')
      return {'card': copy(cards[Uri.decodeComponent(path.split('/').last)]!)};
    if (path == '/subscriptions/sub' && method == 'PUT') {
      final patch = body!['subscription'] as Map;
      if (patch['version'] != subscription['version'])
        throw SquareException(400, 'version conflict');
      subscription['card_id'] = patch['card_id'];
      subscription['version'] = (subscription['version'] as int) + 1;
      expect(patch.keys.toSet(), {'version', 'card_id'});
      if (lostPut) {
        lostPut = false;
        throw const SocketException('lost update response');
      }
      return {'subscription': copy(subscription)};
    }
    if (method != 'GET') throw StateError('Unexpected billing mutation');
    return super.billing(method, path, body, query);
  }
}

void main() {
  test('invoice URLs accept only exact sandbox hosted invoice origin', () {
    expect(
      BillingPaymentMethod.paymentUrl(
        'https://squareupsandbox.com/pay-invoice/invtmp:test',
      ),
      isNotNull,
    );
    expect(
      BillingPaymentMethod.paymentUrl(
        'https://app.squareupsandbox.com/pay-invoice/invtmp:test',
      ),
      isNotNull,
    );
    for (final url in [
      'http://squareupsandbox.com/pay-invoice/one',
      'https://squareup.com/pay-invoice/one',
      'https://squareupsandbox.com.attacker.test/pay-invoice/one',
      'https://user@squareupsandbox.com/pay-invoice/one',
      'https://squareupsandbox.com/pay-invoice/one#redirect',
      'https://squareupsandbox.com/other/one',
    ])
      expect(BillingPaymentMethod.paymentUrl(url), isNull);
  });
  test(
    'hosted invoice payer may differ while invoice/order/payment chain must match',
    () {
      final p = Provider();
      p.invoice('one', '2026-01-31');
      p.payments['payment-one']!.remove('customer_id');
      expect(p.fact('one').eligible, isTrue);
      p.payments['payment-one']!['order_id'] = 'foreign-order';
      expect(() => p.fact('one'), throwsStateError);
      p.payments['payment-one']!['order_id'] = 'order-one';
      p.payments['payment-one']!['id'] = 'foreign-payment';
      expect(() => p.fact('one'), throwsStateError);
    },
  );
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'billing recovery persistence',
    () {
      late FirebaseService db;
      late CardProvider provider;
      late BillingPaymentMethod service;
      late String company, intent;
      setUp(() async {
        db = FirebaseService(
          projectId: 'demo-card-${ID.unique()}',
          emulatorHost: host,
        );
        provider = CardProvider();
        service = BillingPaymentMethod(db, provider);
        company = ID.unique();
        intent = ID.unique();
        Future<void> put(String t, String id, Map<String, dynamic> d) => db
            .tablesDB
            .createRow(databaseId: '', tableId: t, rowId: id, data: d)
            .then((_) {});
        await put('subscriptions', company, {
          'company_id': company,
          'plan': 'free',
          'status': 'active',
        });
        await put('recurring_billing_intents', intent, {
          ...provider.link,
          'company_id': company,
          'subscription_row': company,
          'plan': 'starter',
          'client_key': ID.unique(),
          'email': 'qa@guildmark.test',
          'company_name': 'QA',
        });
        await put('recurring_billing_companies', company, {
          'active_intent': intent,
        });
        await put('square_subscription_links', service.digest('sub'), {
          ...provider.link,
          'company_id': company,
          'subscription_row': company,
          'plan': 'starter',
          'intent_id': intent,
        });
      });
      tearDown(() => db.close());
      Future<Map<String, dynamic>> update(
        String key, {
        String? source = 'nonce',
      }) => service.update(company, key, source: source, consent: true);
      test(
        'card update is idempotent, masked and preserves cancellation without granting access',
        () async {
          final key = ID.unique();
          expect((await update(key))['status'], 'updated');
          expect((await update(key, source: null))['status'], 'updated');
          expect(provider.mutations, ['POST /cards', 'PUT /subscriptions/sub']);
          expect(provider.subscription['canceled_date'], '2026-12-31');
          final local = await service.row('subscriptions', company);
          expect(local!.data['plan'], 'free');
          final result = await service.snapshot(company);
          expect((result['card'] as Map)['last4'], '4444');
          expect((result['card'] as Map).containsKey('id'), isFalse);
          final operation = await service.row(
            'billing_payment_method_updates',
            service.digest('$company:$key'),
          );
          expect(operation!.data.containsValue('nonce'), isFalse);
        },
      );
      test(
        'declined card never changes subscription and releases only its own attempt',
        () async {
          provider.decline = true;
          await expectLater(
            update(ID.unique()),
            throwsA(
              isA<PlanLimitException>().having(
                (e) => e.code,
                'code',
                'CARD_UPDATE_FAILED',
              ),
            ),
          );
          expect(provider.subscription['card_id'], 'old-card');
          expect(
            (await service.row(
              'recurring_billing_companies',
              company,
            ))!.data['active_card_update'],
            isNull,
          );
          provider.decline = false;
          expect((await update(ID.unique()))['status'], 'updated');
        },
      );
      test(
        'lost card creation is recovered by reference without another card creation',
        () async {
          final key = ID.unique();
          provider.lostCreate = true;
          await expectLater(update(key), throwsA(isA<SocketException>()));
          await expectLater(
            update(ID.unique()),
            throwsA(
              isA<PlanLimitException>().having(
                (e) => e.code,
                'code',
                'CARD_UPDATE_PENDING',
              ),
            ),
          );
          expect((await update(key, source: null))['status'], 'updated');
          expect(provider.mutations.where((s) => s == 'POST /cards').length, 1);
        },
      );
      test(
        'lost subscription update response resumes without reapplying or recharging',
        () async {
          final key = ID.unique();
          provider.lostPut = true;
          await expectLater(update(key), throwsA(isA<SocketException>()));
          await service.resumePending(company);
          expect(provider.mutations, ['POST /cards', 'PUT /subscriptions/sub']);
          expect((await service.snapshot(company))['pending_update'], isNull);
        },
      );
      test('stale update cannot overwrite a later provider change', () async {
        final key = ID.unique();
        provider.lostCreate = true;
        await expectLater(update(key), throwsA(isA<SocketException>()));
        provider.subscription['version'] = 2;
        provider.subscription['card_id'] = 'external-card';
        await expectLater(
          update(key, source: null),
          throwsA(
            isA<PlanLimitException>().having(
              (e) => e.code,
              'code',
              'CARD_UPDATE_CONFLICT',
            ),
          ),
        );
        expect(provider.subscription['card_id'], 'external-card');
        expect(provider.mutations.where((s) => s.startsWith('PUT')), isEmpty);
      });
      test('consent and company scope fail before provider writes', () async {
        await expectLater(
          service.update(company, ID.unique(), source: 'nonce'),
          throwsA(isA<PlanLimitException>()),
        );
        await expectLater(
          service.update(
            'foreign',
            ID.unique(),
            source: 'nonce',
            consent: true,
          ),
          throwsA(isA<PlanLimitException>()),
        );
        expect(provider.mutations, isEmpty);
      });
      test(
        'existing unpaid invoice recovery is read-only and amount/owner validated',
        () async {
          final date = billingDate(DateTime.now().toUtc());
          provider.link['start_date'] = date;
          provider.subscription['start_date'] = date;
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'square_subscription_links',
            rowId: service.digest('sub'),
            data: {'start_date': date},
          );
          final i = provider.invoice('due', date, status: 'UNPAID');
          i['public_url'] =
              'https://squareupsandbox.com/pay-invoice/invtmp:test';
          (i['payment_requests'] as List)[0]['total_completed_amount_money'] = {
            'amount': 0,
            'currency': 'USD',
          };
          provider.subscription['invoice_ids'] = ['due'];
          expect((await service.recovery(company, 'due'))['status'], 'unpaid');
          expect(provider.mutations, isEmpty);
          expect((await service.snapshot(company))['invoices'], hasLength(1));
          await expectLater(
            service.recovery(company, 'foreign'),
            throwsA(isA<PlanLimitException>()),
          );
          (i['primary_recipient'] as Map)['customer_id'] = 'other';
          await expectLater(service.recovery(company, 'due'), throwsStateError);
        },
      );
      test(
        'paying the same failed invoice activates once; update alone never grants',
        () async {
          provider.subscription.remove('canceled_date');
          final i = provider.invoice('due', '2026-01-31', status: 'UNPAID');
          provider.subscription['invoice_ids'] = ['due'];
          final billing = RecurringBilling(
            db,
            provider,
            clock: () => DateTime.utc(2026, 2, 1),
          );
          await billing.reconcile('sub');
          expect(
            (await service.row('subscriptions', company))!.data['status'],
            'past_due',
          );
          await update(ID.unique());
          expect(
            (await service.row('subscriptions', company))!.data['plan'],
            'free',
          );
          i['status'] = 'PAID';
          i['version'] = 2;
          provider.payments['payment-due']!.remove('customer_id');
          await billing.reconcile('sub');
          await billing.reconcile('sub');
          expect(
            (await service.row('subscriptions', company))!.data['status'],
            'active',
          );
          final invoices = await db.tablesDB.listRows(
            databaseId: '',
            tableId: 'subscription_invoices',
            queries: [Query.equal('company_id', company)],
          );
          expect(invoices.rows.length, 1);
        },
      );
    },
    skip: host == null ? 'Requires isolated Firestore emulator' : false,
  );
}
