/// Owner-only provider recovery. No payment creation or subscription creation.
library;

import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/services/paid_invoice.dart';
import 'package:guildmark_api/services/square_service.dart';

class BillingPaymentMethod {
  BillingPaymentMethod(this.store, this.square);
  final FirebaseService store;
  final SquareService square;
  String digest(String value) => sha256.convert(utf8.encode(value)).toString();
  Future<Row?> row(String table, String id) async {
    try {
      return await store.tablesDB.getRow(
        databaseId: '',
        tableId: table,
        rowId: id,
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  Future<Row?> binding(String company) async {
    final lock = await row('recurring_billing_companies', company);
    final intent = lock?.data['active_intent'] as String?;
    if (intent == null) return null;
    final i = await row('recurring_billing_intents', intent);
    final provider = i?.data['square_subscription_id'] as String?;
    if (provider == null) return null;
    final link = await row('square_subscription_links', digest(provider));
    if (link?.data['company_id'] != company ||
        link?.data['intent_id'] != intent)
      throw StateError('Billing linkage mismatch');
    return link;
  }

  Future<Map<String, dynamic>> subscription(Row link) async {
    final sub = Map<String, dynamic>.from(
      (await square.billing(
            'GET',
            '/subscriptions/${Uri.encodeComponent(link.data['square_subscription_id'] as String)}',
          ))['subscription']
          as Map,
    );
    verifyBillingSubscription(link.data, sub);
    return sub;
  }

  Map<String, dynamic> cardSummary(Map<String, dynamic> card) => {
    'brand': card['card_brand'],
    'last4': card['last_4'],
    'exp_month': card['exp_month'],
    'exp_year': card['exp_year'],
    'enabled': card['enabled'] == true,
  };
  Future<Map<String, dynamic>> card(String id, Row link) async {
    final c = Map<String, dynamic>.from(
      (await square.billing('GET', '/cards/${Uri.encodeComponent(id)}'))['card']
          as Map,
    );
    if (c['id'] != id || c['customer_id'] != link.data['customer_id'])
      throw StateError('Card ownership mismatch');
    return c;
  }

  static String? paymentUrl(Object? value) {
    if (value is! String) return null;
    final url = Uri.tryParse(value);
    if (url == null ||
        url.scheme != 'https' ||
        !{
          'squareupsandbox.com',
          'app.squareupsandbox.com',
        }.contains(url.host) ||
        url.userInfo.isNotEmpty ||
        url.hasPort ||
        url.hasFragment ||
        !url.path.startsWith('/pay-invoice/'))
      return null;
    return value;
  }

  Future<Map<String, dynamic>> snapshot(String company) async {
    final link = await binding(company);
    if (link == null)
      return {'available': false, 'card': null, 'invoices': <dynamic>[]};
    final sub = await subscription(link);
    final id = sub['card_id'] as String?;
    final c = id == null ? null : cardSummary(await card(id, link));
    final invoices = <Map<String, dynamic>>[];
    for (final id
        in (sub['invoice_ids'] as List? ?? []).cast<String>().reversed.take(
          24,
        )) {
      final i = Map<String, dynamic>.from(
        (await square.billing(
              'GET',
              '/invoices/${Uri.encodeComponent(id)}',
            ))['invoice']
            as Map,
      );
      if (!{
        'UNPAID',
        'PARTIALLY_PAID',
        'PAYMENT_PENDING',
        'FAILED',
        'SCHEDULED',
      }.contains(i['status']))
        continue;
      final fact = PaidInvoice.verify(link.data, sub, i, null, const []);
      final request = (i['payment_requests'] as List).single as Map;
      final paid =
          ((request['total_completed_amount_money'] as Map?)?['amount']
                      as num? ??
                  0)
              .toInt();
      invoices.add({
        'id': id,
        'status': i['status'],
        'amount_due_cents': (link.data['amount_cents'] as int) - paid,
        'due_date': billingDate(fact.start),
        'can_pay':
            {'UNPAID', 'PARTIALLY_PAID'}.contains(i['status']) &&
            !fact.start.isAfter(DateTime.now().toUtc()),
      });
    }
    final lock = await row('recurring_billing_companies', company);
    final opId = lock?.data['active_card_update'] as String?;
    final op = opId == null
        ? null
        : await row('billing_payment_method_updates', opId);
    return {
      'available': true,
      'card': c,
      'invoices': invoices,
      'provider_status': sub['status'],
      'can_update': sub['status'] == 'ACTIVE',
      'cancel_at_period_end':
          sub['canceled_date'] != null || sub['status'] == 'CANCELED',
      'pending_update':
          op == null || op.data['intent_id'] != link.data['intent_id']
          ? null
          : {'key': op.data['client_key'], 'state': op.data['state']},
      'checked_at': DateTime.now().toUtc().toIso8601String(),
    };
  }

  Future<Map<String, dynamic>> recovery(
    String company,
    String invoiceId,
  ) async {
    final link = await binding(company);
    if (link == null)
      throw const PlanLimitException(
        'BILLING_NOT_FOUND',
        'No recurring agreement is available.',
        status: 409,
      );
    final sub = await subscription(link);
    if (!(sub['invoice_ids'] as List? ?? []).contains(invoiceId))
      throw const PlanLimitException(
        'INVOICE_NOT_FOUND',
        'Invoice is not part of this agreement.',
        status: 404,
      );
    final i = Map<String, dynamic>.from(
      (await square.billing(
            'GET',
            '/invoices/${Uri.encodeComponent(invoiceId)}',
          ))['invoice']
          as Map,
    );
    if (i['status'] == 'PAID') return {'status': 'paid', 'payment_url': null};
    final fact = PaidInvoice.verify(link.data, sub, i, null, const []);
    if (!{'UNPAID', 'PARTIALLY_PAID'}.contains(i['status']) ||
        fact.start.isAfter(DateTime.now().toUtc()))
      return {'status': 'not_payable', 'payment_url': null};
    final url = paymentUrl(i['public_url']);
    if (url == null)
      throw const PlanLimitException(
        'RECOVERY_UNAVAILABLE',
        'A verified Square payment link is unavailable. Refresh billing and try again.',
        status: 503,
      );
    return {'status': 'unpaid', 'payment_url': url, 'invoice_id': invoiceId};
  }

  Future<void> save(String id, Map<String, dynamic> data) => store.tablesDB
      .updateRow(
        databaseId: '',
        tableId: 'billing_payment_method_updates',
        rowId: id,
        data: data,
      )
      .then((_) {});
  Map<String, dynamic> pending() => {
    'status': 'pending',
    'message':
        'The card update is not confirmed. Check this update before submitting another card.',
  };
  Future<Map<String, dynamic>> update(
    String company,
    String key, {
    String? source,
    bool consent = false,
  }) async {
    if (!RegExp(r'^[a-zA-Z0-9_-]{16,64}$').hasMatch(key) ||
        source != null && (source.isEmpty || source.length > 4096 || !consent))
      throw const PlanLimitException(
        'VALIDATION',
        'A stable update key and consent to save the card are required.',
        status: 400,
      );
    final link = await binding(company);
    if (link == null)
      throw const PlanLimitException(
        'BILLING_NOT_FOUND',
        'A recurring agreement is required.',
        status: 409,
      );
    await discardSuperseded(company, link.data['intent_id'] as String);
    final provider = await subscription(link);
    final id = digest('$company:$key');
    await store.tablesDB.transaction((tx) async {
      final old = await tx.get('billing_payment_method_updates', id);
      final lock = await tx.get('recurring_billing_companies', company);
      if (lock?.data['active_intent'] != link.data['intent_id'])
        throw const PlanLimitException(
          'CARD_UPDATE_CONFLICT',
          'The billing agreement changed. Refresh billing.',
          status: 409,
        );
      if (old != null) {
        if (old.data['intent_id'] != link.data['intent_id'])
          throw const PlanLimitException(
            'CARD_UPDATE_CONFLICT',
            'This update belongs to an earlier agreement.',
            status: 409,
          );
        if ({'failed', 'conflict'}.contains(old.data['state']))
          throw const PlanLimitException(
            'CARD_UPDATE_FAILED',
            'This update did not change the subscription card. Start a new update.',
            status: 402,
          );
        if (old.data['state'] != 'complete' &&
            lock?.data['active_card_update'] != id)
          throw StateError('Card update lock changed');
        return;
      }
      if (provider['status'] != 'ACTIVE')
        throw const PlanLimitException(
          'CARD_UPDATE_CLOSED',
          'This agreement no longer accepts card changes.',
          status: 409,
        );
      if (lock?.data['active_card_update'] != null)
        throw const PlanLimitException(
          'CARD_UPDATE_PENDING',
          'Check the existing card update before starting another.',
          status: 409,
        );
      if (source == null)
        throw const PlanLimitException(
          'VALIDATION',
          'A tokenized card is required for a new update.',
          status: 400,
        );
      tx.create('billing_payment_method_updates', id, {
        'company_id': company,
        'intent_id': link.data['intent_id'],
        'square_subscription_id': provider['id'],
        'client_key': key,
        'source_hash': digest(source),
        'expected_version': provider['version'],
        'state': 'pending',
        'consented_at': DateTime.now().toUtc().toIso8601String(),
      });
      tx.update('recurring_billing_companies', company, {
        'active_card_update': id,
      });
    });
    var op = (await row('billing_payment_method_updates', id))!;
    if (op.data['state'] == 'complete')
      return {'status': 'updated', 'card': op.data['card']};
    if (op.data['card_id'] == null) {
      String? cursor;
      final matches = <Map<String, dynamic>>[];
      do {
        final page = await square.billing('GET', '/cards', null, {
          'customer_id': link.data['customer_id'] as String,
          if (cursor != null) 'cursor': cursor,
        });
        matches.addAll(
          (page['cards'] as List? ?? [])
              .where((c) => c['reference_id'] == id && c['enabled'] == true)
              .map((c) => Map<String, dynamic>.from(c as Map)),
        );
        cursor = page['cursor'] as String?;
      } while (cursor != null && matches.isEmpty);
      Map<String, dynamic> created;
      if (matches.length == 1) {
        created = matches.single;
      } else {
        if (source == null) return pending();
        if (digest(source) != op.data['source_hash'])
          throw const PlanLimitException(
            'CARD_UPDATE_PENDING',
            'Check the original update before entering another card.',
            status: 409,
          );
        try {
          created = Map<String, dynamic>.from(
            (await square.billing('POST', '/cards', {
                  'idempotency_key': 'update_card_${id.substring(0, 32)}',
                  'source_id': source,
                  'card': {
                    'customer_id': link.data['customer_id'],
                    'reference_id': id,
                  },
                }))['card']
                as Map,
          );
        } on SquareException catch (e) {
          if ({400, 402, 422}.contains(e.statusCode)) {
            await finish(id, company, link, 'failed');
            throw const PlanLimitException(
              'CARD_UPDATE_FAILED',
              'Square could not save this card. Your subscription card was not changed.',
              status: 402,
            );
          }
          rethrow;
        }
      }
      if (created['customer_id'] != link.data['customer_id'] ||
          created['enabled'] != true)
        throw StateError('Invalid saved card');
      // Concurrent requests use the same provider key/reference and same card.
      await store.tablesDB.transaction((tx) async {
        final current = await tx.get('billing_payment_method_updates', id);
        if (current?.data['card_id'] != null &&
            current!.data['card_id'] != created['id'])
          throw StateError('Card identity changed');
        tx.update('billing_payment_method_updates', id, {
          'card_id': created['id'],
        });
      });
      op = (await row('billing_payment_method_updates', id))!;
    }
    var latest = await subscription(link);
    final wanted = op.data['card_id'] as String;
    final expected = op.data['expected_version'] as int;
    if (latest['card_id'] != wanted) {
      if (latest['version'] != expected || latest['status'] != 'ACTIVE') {
        await finish(id, company, link, 'conflict');
        throw const PlanLimitException(
          'CARD_UPDATE_CONFLICT',
          'The provider agreement changed. Refresh billing before making a new card update.',
          status: 409,
        );
      }
      final currentLock = await row('recurring_billing_companies', company);
      if (currentLock?.data['active_card_update'] != id ||
          currentLock?.data['active_intent'] != link.data['intent_id'])
        throw StateError('Update no longer current');
      try {
        await square.billing(
          'PUT',
          '/subscriptions/${Uri.encodeComponent(latest['id'] as String)}',
          {
            'subscription': {'version': expected, 'card_id': wanted},
          },
        );
      } on SquareException catch (_) {
        /* Read provider truth before claiming success or permitting another operation. */
      }
      latest = await subscription(link);
    }
    if (latest['card_id'] != wanted) return pending();
    final saved = await card(wanted, link);
    if (saved['enabled'] != true) return pending();
    final summary = cardSummary(saved);
    await finish(id, company, link, 'complete', summary: summary);
    return {
      'status': 'updated',
      'card': summary,
      'message':
          'Subscription card updated. Existing invoices still require verified payment. Cancellation settings were preserved.',
    };
  }

  Future<void> finish(
    String id,
    String company,
    Row link,
    String state, {
    Map<String, dynamic>? summary,
  }) => store.tablesDB.transaction((tx) async {
    final op = await tx.get('billing_payment_method_updates', id);
    final lock = await tx.get('recurring_billing_companies', company);
    if (op == null) throw StateError('Card update missing');
    if (op.data['state'] == 'complete') return;
    tx.update('billing_payment_method_updates', id, {
      'state': state,
      if (summary != null) 'card': summary,
      'completed_at': DateTime.now().toUtc().toIso8601String(),
    });
    if (lock?.data['active_card_update'] == id &&
        lock?.data['active_intent'] == link.data['intent_id'])
      tx.update('recurring_billing_companies', company, {
        'active_card_update': null,
      });
  });
  Future<void> discardSuperseded(String company, String intent) =>
      store.tablesDB.transaction((tx) async {
        final lock = await tx.get('recurring_billing_companies', company);
        final id = lock?.data['active_card_update'] as String?;
        if (id == null) return;
        final op = await tx.get('billing_payment_method_updates', id);
        if (lock?.data['active_intent'] == intent &&
            op != null &&
            op.data['intent_id'] != intent) {
          tx.update('billing_payment_method_updates', id, {
            'state': 'conflict',
          });
          tx.update('recurring_billing_companies', company, {
            'active_card_update': null,
          });
        }
      });
  Future<void> resumePending(String company) async {
    final lock = await row('recurring_billing_companies', company);
    final id = lock?.data['active_card_update'] as String?;
    if (id == null) return;
    final op = await row('billing_payment_method_updates', id);
    if (op == null) throw StateError('Pending update missing');
    if (op.data['intent_id'] != lock?.data['active_intent']) {
      final intent = lock?.data['active_intent'] as String?;
      if (intent != null) await discardSuperseded(company, intent);
      return;
    }
    await update(company, op.data['client_key'] as String);
  }
}
