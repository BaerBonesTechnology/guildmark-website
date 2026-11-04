import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';
import 'package:guildmark_api/services/paid_invoice.dart';
import 'package:guildmark_api/services/recurring_billing.dart';
import 'package:guildmark_api/services/square_service.dart';
import 'package:test/test.dart';

Map<String, dynamic> clone(Map<String, dynamic> m) =>
    Map<String, dynamic>.from(jsonDecode(jsonEncode(m)) as Map);

class Provider extends SquareService {
  Provider()
    : super(accessToken: 'test', locationId: 'loc', environment: 'sandbox');
  final link = <String, dynamic>{
    'square_subscription_id': 'sub',
    'customer_id': 'customer',
    'location_id': 'loc',
    'variation_id': 'variation',
    'amount_cents': 3900,
    'start_date': '2026-01-31',
  };
  late Map<String, dynamic> subscription = {
    'id': 'sub',
    'customer_id': 'customer',
    'location_id': 'loc',
    'plan_variation_id': 'variation',
    'start_date': '2026-01-31',
    'timezone': 'UTC',
    'status': 'ACTIVE',
    'version': 1,
    'invoice_ids': ['invoice:1'],
  };
  final invoices = <String, Map<String, dynamic>>{};
  final orders = <String, Map<String, dynamic>>{};
  final payments = <String, Map<String, dynamic>>{};
  bool offline = false;
  Map<String, dynamic> invoice(
    String id,
    String date, {
    String status = 'PAID',
    int version = 1,
  }) {
    final i = <String, dynamic>{
      'id': id,
      'subscription_id': 'sub',
      'location_id': 'loc',
      'primary_recipient': {'customer_id': 'customer'},
      'timezone': 'UTC',
      'status': status,
      'version': version,
      'order_id': 'order-$id',
      'payment_requests': [
        {
          'request_type': 'BALANCE',
          'due_date': date,
          'computed_amount_money': {'amount': 3900, 'currency': 'USD'},
          'total_completed_amount_money': {'amount': 3900, 'currency': 'USD'},
        },
      ],
    };
    invoices[id] = i;
    orders['order-$id'] = {
      'id': 'order-$id',
      'location_id': 'loc',
      'state': 'COMPLETED',
      'total_money': {'amount': 3900, 'currency': 'USD'},
      'tenders': [
        {'payment_id': 'payment-$id'},
      ],
    };
    payments['payment-$id'] = {
      'id': 'payment-$id',
      'order_id': 'order-$id',
      'location_id': 'loc',
      'customer_id': 'customer',
      'status': 'COMPLETED',
      'source_type': 'CARD',
      'amount_money': {'amount': 3900, 'currency': 'USD'},
    };
    return i;
  }

  @override
  Future<Map<String, dynamic>> billing(
    String method,
    String path, [
    Map<String, dynamic>? body,
    Map<String, String>? query,
  ]) async {
    if (offline) throw const SocketException('test offline');
    final parts = path.split('/');
    final id = Uri.decodeComponent(parts.last);
    if (method == 'POST' && id == 'cancel') {
      subscription['canceled_date'] = '2026-12-31';
      subscription['version'] = 2;
      return {'subscription': clone(subscription)};
    }
    final type = parts[1];
    final data = switch (type) {
      'subscriptions' => subscription,
      'invoices' => invoices[id]!,
      'orders' => orders[id]!,
      'payments' => payments[id]!,
      _ => throw StateError('unexpected provider mutation'),
    };
    return {
      type == 'subscriptions'
          ? 'subscription'
          : type.substring(0, type.length - 1): clone(
        data,
      ),
    };
  }

  PaidInvoice fact(String id) => PaidInvoice.verify(
    link,
    subscription,
    invoices[id]!,
    orders['order-$id'],
    [payments['payment-$id']!],
  );
}

class UncertainProvider extends Provider {
  bool lostResponse = true;
  final subscriptionKeys = <String>[];
  @override
  Future<Map<String, dynamic>> billing(
    String method,
    String path, [
    Map<String, dynamic>? body,
    Map<String, String>? query,
  ]) async {
    if (method == 'POST' && path == '/customers')
      return {
        'customer': {'id': 'customer'},
      };
    if (method == 'GET' && path == '/cards') return {'cards': []};
    if (method == 'POST' && path == '/cards')
      return {
        'card': {'id': 'card'},
      };
    if (method == 'POST' && path == '/subscriptions') {
      subscriptionKeys.add(body!['idempotency_key'] as String);
      subscription['start_date'] = body['start_date'];
      subscription['invoice_ids'] = [];
      if (lostResponse) {
        lostResponse = false;
        throw const SocketException('response lost after creation');
      }
      return {'subscription': clone(subscription)};
    }
    return super.billing(method, path, body, query);
  }
}

void main() {
  test('calendar anchors clamp February without drifting March', () {
    expect(
      billingMonth(DateTime.utc(2026, 1, 31), 1),
      DateTime.utc(2026, 2, 28),
    );
    expect(
      billingMonth(DateTime.utc(2026, 1, 31), 2),
      DateTime.utc(2026, 3, 31),
    );
    expect(() => exactBillingDate('2026-02-31'), throwsStateError);
  });
  test('HMAC binds raw body, notification URL and key', () {
    const body = '{"event_id":"one"}';
    const url = 'https://guildmark-dev.web.app/api/webhooks/square';
    final signature = base64Encode(
      Hmac(
        sha256,
        utf8.encode('test-key'),
      ).convert(utf8.encode(url + body)).bytes,
    );
    expect(squareSignature(body, signature, 'test-key', url), isTrue);
    expect(squareSignature(body + ' ', signature, 'test-key', url), isFalse);
    expect(squareSignature(body, signature, 'wrong', url), isFalse);
    expect(squareSignature(body, signature, 'test-key', url + '/'), isFalse);
  });
  test('ACTIVE and charged-through never replace paid invoice evidence', () {
    final p = Provider();
    p.invoice('one', '2026-01-31', status: 'UNPAID');
    p.subscription['charged_through_date'] = '2026-12-31';
    expect(p.fact('one').eligible, isFalse);
  });
  test(
    'paid invoice requires matching USD price, owner and completed card',
    () {
      final p = Provider();
      p.invoice('one', '2026-01-31');
      expect(p.fact('one').eligible, isTrue);
      p.payments['payment-one']!['customer_id'] = 'other';
      expect(() => p.fact('one'), throwsStateError);
      p.payments['payment-one']!['customer_id'] = 'customer';
      (p.invoices['one']!['payment_requests']
              as List)[0]['computed_amount_money']['currency'] =
          'EUR';
      expect(() => p.fact('one'), throwsStateError);
    },
  );
  test('refunds and cancellation prohibit granting the affected period', () {
    final p = Provider();
    p.invoice('one', '2026-01-31');
    p.payments['payment-one']!['refunded_money'] = {
      'amount': 1,
      'currency': 'USD',
    };
    expect(p.fact('one').eligible, isFalse);
    p.payments['payment-one']!.remove('refunded_money');
    p.subscription['canceled_date'] = '2026-01-31';
    expect(p.fact('one').eligible, isFalse);
  });
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  test(
    'unknown subscription response recovers with same provider key and blocks a second agreement',
    () async {
      final db = FirebaseService(
        projectId: 'demo-saga-${ID.unique()}',
        emulatorHost: host,
      );
      final provider = UncertainProvider();
      final service = RecurringBilling(db, provider);
      final company = ID.unique();
      final key = ID.unique();
      await db.tablesDB.createRow(
        databaseId: '',
        tableId: 'subscriptions',
        rowId: company,
        data: {'company_id': company, 'plan': 'free', 'status': 'active'},
      );
      Future<Map<String, dynamic>> checkout(String k, {String? source}) =>
          service.checkout(
            company: company,
            email: 'qa@guildmark.test',
            companyName: 'QA',
            plan: 'starter',
            variation: 'variation',
            key: k,
            source: source,
            expected: 3900,
          );
      try {
        await expectLater(
          checkout(key, source: 'test-nonce'),
          throwsA(isA<SocketException>()),
        );
        await expectLater(
          checkout(ID.unique(), source: 'new-nonce'),
          throwsA(anything),
        );
        expect((await checkout(key))['granted'], isFalse);
        expect(provider.subscriptionKeys.length, 2);
        expect(provider.subscriptionKeys.toSet().length, 1);
        expect(provider.subscriptionKeys.singleOrNull, isNull);
        final i = await service.row(
          'recurring_billing_intents',
          service.digest('$company:$key'),
        );
        expect(i!.data['square_subscription_id'], 'sub');
        expect(i.data.containsValue('test-nonce'), isFalse);
        await db.tablesDB.deleteRow(
          databaseId: '',
          tableId: 'square_subscription_links',
          rowId: service.digest('sub'),
        );
        await service.company(company);
        expect(
          await service.row('square_subscription_links', service.digest('sub')),
          isNotNull,
        );
        expect(provider.subscriptionKeys.length, 2);
      } finally {
        db.close();
      }
    },
    skip: host == null ? 'Requires isolated Firestore emulator' : false,
  );
  group(
    'atomic invoice reconciliation',
    () {
      late FirebaseService db;
      late Provider square;
      late RecurringBilling billing;
      late String company;
      late String intent;
      setUp(() async {
        db = FirebaseService(
          projectId: 'demo-recurring-${ID.unique()}',
          emulatorHost: host,
        );
        square = Provider();
        billing = RecurringBilling(
          db,
          square,
          clock: () => DateTime.utc(2026, 11, 4),
        );
        company = ID.unique();
        intent = ID.unique();
        square.invoice('invoice:1', '2026-01-31', status: 'UNPAID');
        Future<void> create(String t, String id, Map<String, dynamic> data) =>
            db.tablesDB
                .createRow(databaseId: '', tableId: t, rowId: id, data: data)
                .then((_) {});
        await create('subscriptions', company, {
          'company_id': company,
          'plan': 'free',
          'status': 'active',
        });
        await create('recurring_billing_intents', intent, {
          'company_id': company,
          'state': 'pending',
        });
        await create('recurring_billing_companies', company, {
          'active_intent': intent,
        });
        await create('square_subscription_links', billing.digest('sub'), {
          ...square.link,
          'company_id': company,
          'subscription_row': company,
          'plan': 'starter',
          'intent_id': intent,
        });
      });
      tearDown(() => db.close());
      Future<Row> local() => db.tablesDB.getRow(
        databaseId: '',
        tableId: 'subscriptions',
        rowId: company,
      );
      test(
        'unpaid has no access; duplicate concurrent paid callbacks create one invoice',
        () async {
          await billing.reconcile('sub');
          expect((await local()).data['plan'], 'free');
          square.invoices['invoice:1']!['status'] = 'PAID';
          square.invoices['invoice:1']!['version'] = 2;
          Future<void> delivery() async {
            try {
              await billing.reconcile('sub');
            } on DatastoreException catch (error) {
              if (error.code != 409) rethrow;
            }
          }

          await Future.wait(List.generate(4, (_) => delivery()));
          // Contended delivery returns a retryable response; redelivery is safe.
          await billing.reconcile('sub');
          expect(
            (await local()).data['current_period_end'],
            '2026-02-28T00:00:00.000Z',
          );
          final rows = await db.tablesDB.listRows(
            databaseId: '',
            tableId: 'subscription_invoices',
            queries: [Query.equal('company_id', company)],
          );
          expect(rows.rows.length, 1);
          final paidAt = rows.rows.single.data['paid_at'];
          await billing.reconcile('sub');
          expect(
            (await billing.row(
              'subscription_invoices',
              rows.rows.single.$id,
            ))!.data['paid_at'],
            paidAt,
          );
        },
      );
      test(
        'renewal advances once; stale unpaid and old refunds cannot retract newer payment',
        () async {
          square.invoices['invoice:1']!['status'] = 'PAID';
          square.invoices['invoice:1']!['version'] = 3;
          await billing.reconcile('sub');
          square.invoice('invoice:2', '2026-10-31');
          square.subscription['invoice_ids'] = ['invoice:2', 'invoice:1'];
          await billing.reconcile('sub');
          expect(
            (await local()).data['current_period_end'],
            '2026-11-30T00:00:00.000Z',
          );
          square.invoices['invoice:1']!['status'] = 'UNPAID';
          square.invoices['invoice:1']!['version'] = 1;
          await billing.reconcile('sub');
          expect((await local()).data['status'], 'active');
          square.invoices['invoice:1']!['status'] = 'PAID';
          square.invoices['invoice:1']!['version'] = 4;
          square.payments['payment-invoice:1']!['refunded_money'] = {
            'amount': 3900,
            'currency': 'USD',
          };
          await billing.reconcile('sub');
          expect((await local()).data['status'], 'active');
          square.payments['payment-invoice:2']!['refunded_money'] = {
            'amount': 3900,
            'currency': 'USD',
          };
          await billing.reconcile('sub');
          expect((await local()).data['status'], 'past_due');
          square.payments['payment-invoice:2']!.remove('refunded_money');
          await billing.reconcile('sub');
          expect((await local()).data['status'], 'past_due');
        },
      );
      test(
        'cancellation preserves verified current access and stale subscription version cannot restore renewal',
        () async {
          square.invoice('current', '2026-10-31');
          square.subscription['invoice_ids'] = ['current'];
          await billing.reconcile('sub');
          await billing.cancel(company);
          expect((await local()).data['status'], 'active');
          expect((await local()).data['cancel_at_period_end'], isTrue);
          square.subscription.remove('canceled_date');
          square.subscription['version'] = 1;
          await billing.reconcile('sub');
          expect((await local()).data['cancel_at_period_end'], isTrue);
        },
      );
      test(
        'stale pre-cancellation snapshot cannot grant a later paid period',
        () async {
          square.invoice('current', '2026-10-31');
          square.subscription['invoice_ids'] = ['current'];
          await billing.reconcile('sub');
          await billing.cancel(company);
          square.subscription.remove('canceled_date');
          square.subscription['version'] = 1;
          square.invoice('late', '2026-12-31');
          square.subscription['invoice_ids'] = ['late', 'current'];
          final later = RecurringBilling(
            db,
            square,
            clock: () => DateTime.utc(2026, 12, 31),
          );
          await later.reconcile('sub');
          expect(
            (await local()).data['current_period_end'],
            '2026-11-30T00:00:00.000Z',
          );
        },
      );
      test(
        'outage grants nothing and late previous agreement cannot overwrite a new binding',
        () async {
          square.offline = true;
          await expectLater(
            billing.reconcile('sub'),
            throwsA(isA<SocketException>()),
          );
          expect((await local()).data['plan'], 'free');
          square.offline = false;
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'recurring_billing_companies',
            rowId: company,
            data: {'active_intent': 'new-agreement'},
          );
          square.invoices['invoice:1']!['status'] = 'PAID';
          expect((await billing.reconcile('sub'))['status'], 'ignored');
          expect((await local()).data['plan'], 'free');
        },
      );
    },
    skip: host == null ? 'Requires isolated Firestore emulator' : false,
  );
}
