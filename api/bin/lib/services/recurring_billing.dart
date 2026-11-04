/// Dev-only recurring saga and invoice reconciliation. No process-local work queue.
library;

import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';
import 'package:guildmark_api/services/paid_invoice.dart';
import 'package:guildmark_api/services/billing_payment_method.dart';
import 'package:guildmark_api/services/square_service.dart';

class RecurringBilling {
  RecurringBilling(this.store, this.square, {DateTime Function()? clock})
    : clock = clock ?? DateTime.now;
  final DateTime Function() clock;
  final FirebaseService store;
  final SquareService square;
  String digest(String s) => sha256.convert(utf8.encode(s)).toString();
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

  Future<void> save(String id, Map<String, dynamic> values) =>
      store.tablesDB.transaction((tx) async {
        final current = await tx.get('recurring_billing_intents', id);
        if (current == null) throw StateError('Billing attempt missing');
        for (final k in ['customer_id', 'card_id', 'square_subscription_id']) {
          if (values[k] != null &&
              current.data[k] != null &&
              values[k] != current.data[k])
            throw StateError('Provider identity changed');
        }
        tx.update('recurring_billing_intents', id, values);
      });
  Future<Map<String, dynamic>> checkout({
    required String company,
    required String email,
    required String companyName,
    required String plan,
    required String variation,
    required String key,
    String? source,
    int? expected,
  }) async {
    final cents = ampsPlans[plan]?.priceCents;
    if (cents == null || !RegExp(r'^[a-zA-Z0-9_-]{16,64}$').hasMatch(key))
      throw const PlanLimitException(
        'VALIDATION',
        'A supported plan and stable billing key are required.',
        status: 400,
      );
    if (expected != null && expected != cents)
      throw const PlanLimitException(
        'PRICE_CHANGED',
        'Refresh the monthly price before subscribing.',
        status: 409,
      );
    final local = await SubscriptionRepo(store).findByCompany(company);
    if (local == null) throw StateError('Company subscription missing');
    final id = digest('$company:$key');
    await store.tablesDB.transaction((tx) async {
      final prior = await tx.get('recurring_billing_intents', id);
      final lock = await tx.get('recurring_billing_companies', company);
      final sub = await tx.get('subscriptions', local.id);
      if (prior != null) {
        if (prior.data['state'] == 'failed')
          throw const PlanLimitException(
            'PAYMENT_FAILED',
            'This attempt failed before subscription creation.',
            status: 402,
          );
        if (lock?.data['active_intent'] != id)
          throw const PlanLimitException(
            'IDEMPOTENCY_CONFLICT',
            'This billing agreement is no longer current.',
            status: 409,
          );
        if (prior.data['company_id'] != company ||
            prior.data['plan'] != plan ||
            prior.data['amount_cents'] != cents ||
            prior.data['variation_id'] != variation)
          throw const PlanLimitException(
            'IDEMPOTENCY_CONFLICT',
            'This billing key belongs to different terms.',
            status: 409,
          );
        return;
      }
      if (lock?.data['active_intent'] != null ||
          (sub != null &&
              activePaid(Subscription.fromRow(sub), clock().toUtc())))
        throw const PlanLimitException(
          'SUBSCRIPTION_ACTIVE',
          'An active or unresolved billing agreement already exists. Review billing before starting another.',
          status: 409,
        );
      if (source == null || source.trim().isEmpty)
        throw const PlanLimitException(
          'VALIDATION',
          'A tokenized card is required for a new recurring agreement.',
          status: 400,
        );
      tx.create('recurring_billing_intents', id, {
        'company_id': company,
        'subscription_row': local.id,
        'plan': plan,
        'variation_id': variation,
        'amount_cents': cents,
        'currency': 'USD',
        'location_id': square.locationId,
        'state': 'pending',
        'client_key': key,
        'consented_at': clock().toUtc().toIso8601String(),
        'billing_terms': 'monthly_usd_v1',
        'start_date': billingDate(clock().toUtc()),
        'email': email,
        'company_name': companyName,
        'source_hash': digest(source),
      });
      if (lock == null) {
        tx.create('recurring_billing_companies', company, {
          'active_intent': id,
        });
      } else {
        tx.update('recurring_billing_companies', company, {
          'active_intent': id,
        });
      }
    });
    var intent = (await row('recurring_billing_intents', id))!;
    try {
      if (intent.data['customer_id'] == null) {
        final result = await square.billing('POST', '/customers', {
          'idempotency_key': 'rec_customer_${id.substring(0, 32)}',
          'email_address': email,
          'company_name': companyName,
          'reference_id': company,
        });
        await save(id, {'customer_id': (result['customer'] as Map)['id']});
        intent = (await row('recurring_billing_intents', id))!;
      }
      if (intent.data['card_id'] == null) {
        final cards = await square.billing('GET', '/cards', null, {
          'customer_id': intent.data['customer_id'] as String,
        });
        final matching = (cards['cards'] as List? ?? [])
            .where((c) => c['reference_id'] == id && c['enabled'] == true)
            .toList();
        String card;
        if (matching.length == 1) {
          card = matching.single['id'] as String;
        } else {
          if (source == null) return pending();
          if (digest(source) != intent.data['source_hash'])
            throw const PlanLimitException(
              'PAYMENT_PENDING',
              'Use the original unresolved attempt; check its status before entering a new card.',
              status: 409,
            );
          final result = await square.billing('POST', '/cards', {
            'idempotency_key': 'rec_card_${id.substring(0, 32)}',
            'source_id': source,
            'card': {
              'customer_id': intent.data['customer_id'],
              'reference_id': id,
            },
          });
          card = (result['card'] as Map)['id'] as String;
        }
        await save(id, {'card_id': card});
        intent = (await row('recurring_billing_intents', id))!;
      }
      if (intent.data['square_subscription_id'] == null) {
        final result = await square.billing('POST', '/subscriptions', {
          'idempotency_key': 'rec_sub_${id.substring(0, 32)}',
          'customer_id': intent.data['customer_id'],
          'card_id': intent.data['card_id'],
          'location_id': intent.data['location_id'],
          'plan_variation_id': intent.data['variation_id'],
          'start_date': intent.data['start_date'],
          'timezone': 'UTC',
        });
        await save(id, {
          'square_subscription_id': (result['subscription'] as Map)['id'],
        });
        intent = (await row('recurring_billing_intents', id))!;
      }
      final provider = intent.data['square_subscription_id'] as String;
      await store.tablesDB.transaction((tx) async {
        final link = await tx.get(
          'square_subscription_links',
          digest(provider),
        );
        if (link == null)
          tx.create('square_subscription_links', digest(provider), {
            ...intent.data,
            'intent_id': id,
          });
      });
      return await reconcile(provider);
    } on SquareException catch (e) {
      if ({400, 402, 422}.contains(e.statusCode)) {
        await store.tablesDB.transaction((tx) async {
          final i = await tx.get('recurring_billing_intents', id);
          final lock = await tx.get('recurring_billing_companies', company);
          if (i?.data['square_subscription_id'] == null) {
            tx.update('recurring_billing_intents', id, {'state': 'failed'});
            if (lock?.data['active_intent'] == id)
              tx.update('recurring_billing_companies', company, {
                'active_intent': null,
              });
          }
        });
      }
      rethrow;
    }
  }

  Map<String, dynamic> pending() => {
    'status': 'pending',
    'granted': false,
    'message':
        'The recurring agreement is awaiting a verified paid invoice. Access has not been extended.',
  };
  Future<Map<String, dynamic>> company(String company) async {
    final lock = await row('recurring_billing_companies', company);
    final id = lock?.data['active_intent'] as String?;
    if (id == null) return pending();
    final i = await row('recurring_billing_intents', id);
    if (i == null) return pending();
    await BillingPaymentMethod(store, square).resumePending(company);
    // Resume every persisted step, including linkage after provider creation.
    return checkout(
      company: company,
      email: i.data['email'] as String,
      companyName: i.data['company_name'] as String,
      plan: i.data['plan'] as String,
      variation: i.data['variation_id'] as String,
      key: i.data['client_key'] as String? ?? '',
      expected: i.data['amount_cents'] as int?,
    );
  }

  Future<Map<String, dynamic>> reconcile(String provider) async {
    final link = await row('square_subscription_links', digest(provider));
    if (link == null) return {'status': 'ignored', 'granted': false};
    final currentLock = await row(
      'recurring_billing_companies',
      link.data['company_id'] as String,
    );
    if (currentLock?.data['active_intent'] != link.data['intent_id'])
      return {'status': 'ignored', 'granted': false};
    final sub = Map<String, dynamic>.from(
      (await square.billing(
            'GET',
            '/subscriptions/${Uri.encodeComponent(provider)}',
          ))['subscription']
          as Map,
    );
    final ids = (sub['invoice_ids'] as List? ?? []).cast<String>();
    final facts = <PaidInvoice>[];
    for (final id in ids.reversed.take(24)) {
      final invoice = Map<String, dynamic>.from(
        (await square.billing(
              'GET',
              '/invoices/${Uri.encodeComponent(id)}',
            ))['invoice']
            as Map,
      );
      Map<String, dynamic>? order;
      final payments = <Map<String, dynamic>>[];
      if (invoice['status'] == 'PAID') {
        order = Map<String, dynamic>.from(
          (await square.billing(
                'GET',
                '/orders/${Uri.encodeComponent(invoice['order_id'] as String)}',
              ))['order']
              as Map,
        );
        for (final tender in order['tenders'] as List? ?? []) {
          final paymentId = (tender as Map)['payment_id'] ?? tender['id'];
          payments.add(
            Map<String, dynamic>.from(
              (await square.billing(
                    'GET',
                    '/payments/${Uri.encodeComponent(paymentId as String)}',
                  ))['payment']
                  as Map,
            ),
          );
        }
      }
      facts.add(PaidInvoice.verify(link.data, sub, invoice, order, payments));
    }
    facts.sort((a, b) => a.start.compareTo(b.start));
    await store.tablesDB.transaction((tx) async {
      final local = await tx.get(
        'subscriptions',
        link.data['subscription_row'] as String,
      );
      final binding = await tx.get('square_subscription_links', link.$id);
      final intent = await tx.get(
        'recurring_billing_intents',
        link.data['intent_id'] as String,
      );
      final companyLock = await tx.get(
        'recurring_billing_companies',
        link.data['company_id'] as String,
      );
      final ledger = <String, Row?>{};
      for (final f in facts) {
        ledger[f.id] = await tx.get(
          'subscription_invoices',
          digest('square:${f.id}'),
        );
      }
      if (local == null || binding == null || intent == null)
        throw StateError('Billing linkage missing');
      if (companyLock?.data['active_intent'] != link.data['intent_id']) return;
      // A response captured before cancellation cannot authorize a later period.
      if ((sub['version'] as int? ?? 0) <
          (binding.data['provider_version'] as int? ?? -1))
        return;
      if (local.data['company_id'] != link.data['company_id'])
        throw StateError('Company linkage mismatch');
      final patch = <String, dynamic>{
        'billing_mode': 'recurring',
        'square_subscription_id': provider,
      };
      DateTime? end = DateTime.tryParse(
        local.data['current_period_end'] as String? ?? '',
      );
      String? paidId = local.data['billing_paid_invoice_id'] as String?;
      for (final f in facts) {
        final prior = ledger[f.id];
        if (prior != null &&
            (prior.data['provider_version'] as int? ?? -1) > f.version)
          continue;
        if ({'refunded', 'partially_refunded'}.contains(prior?.data['status']))
          continue;
        final record = {
          'company_id': link.data['company_id'],
          'plan': link.data['plan'],
          'amount_cents': link.data['amount_cents'],
          'status': f.state,
          'provider_invoice_id': f.id,
          'provider_version': f.version,
          'square_subscription_id': provider,
          'period_start': f.start.toIso8601String(),
          'period_end': f.end.toIso8601String(),
          'paid_at': f.eligible
              ? prior?.data['paid_at'] ?? clock().toUtc().toIso8601String()
              : null,
        };
        if (prior == null) {
          tx.create('subscription_invoices', digest('square:${f.id}'), record);
        } else {
          tx.update('subscription_invoices', prior.$id, record);
        }
        if (f.eligible &&
            !f.start.isAfter(clock().toUtc()) &&
            (end == null || f.end.isAfter(end))) {
          patch.addAll({
            'plan': link.data['plan'],
            'status': 'active',
            'current_period_start': f.start.toIso8601String(),
            'current_period_end': f.end.toIso8601String(),
            'billing_paid_invoice_id': f.id,
          });
          end = f.end;
          paidId = f.id;
        }
        if (!f.eligible && paidId == f.id) {
          patch['status'] = 'past_due';
        }
      }
      if (end == null &&
          facts.any(
            (f) =>
                !f.eligible &&
                {'unpaid', 'partially_paid', 'failed'}.contains(f.state) &&
                !f.start.isAfter(clock().toUtc()),
          ))
        patch['status'] = 'past_due';
      final version = sub['version'] as int? ?? 0;
      if (version >= (binding.data['provider_version'] as int? ?? -1)) {
        final actions = sub['actions'] as List? ?? [];
        final cancel =
            sub['canceled_date'] != null ||
            sub['status'] == 'CANCELED' ||
            actions.any((a) => a['type'] == 'CANCEL');
        patch['cancel_at_period_end'] = cancel;
        tx.update('square_subscription_links', binding.$id, {
          'provider_version': version,
          'provider_status': sub['status'],
          'cancel_at_period_end': cancel,
          'last_checked_at': clock().toUtc().toIso8601String(),
        });
        if (cancel && end != null && !end.isAfter(clock().toUtc()))
          patch['status'] = 'cancelled';
      }
      if (end != null &&
          !end.isAfter(clock().toUtc()) &&
          patch['status'] != 'cancelled')
        patch['status'] = 'past_due';
      if (sub['status'] == 'CANCELED' &&
          (end == null || !end.isAfter(clock().toUtc())))
        tx.update(
          'recurring_billing_companies',
          link.data['company_id'] as String,
          {'active_intent': null},
        );
      tx.update('subscriptions', local.$id, patch);
      if (paidId != null)
        tx.update('recurring_billing_intents', intent.$id, {'state': 'paid'});
    });
    final local = (await row(
      'subscriptions',
      link.data['subscription_row'] as String,
    ))!;
    final active = activePaid(Subscription.fromRow(local), clock().toUtc());
    final paidId = local.data['billing_paid_invoice_id'] as String?;
    if (!active || paidId == null) return pending();
    return {
      'status': 'paid',
      'granted': true,
      'subscription': Subscription.fromRow(local).toJson(),
      'invoice': {
        'plan': link.data['plan'],
        'amount_cents': link.data['amount_cents'],
        'status': 'paid',
        'provider_invoice_id': paidId,
      },
      'recurring': true,
    };
  }

  Future<void> cancel(String company) async {
    final local = await SubscriptionRepo(store).findByCompany(company);
    if (local?.squareSubscriptionId == null)
      throw StateError('Recurring agreement missing');
    await square.billing(
      'POST',
      '/subscriptions/${Uri.encodeComponent(local!.squareSubscriptionId!)}/cancel',
      {},
    );
    await reconcile(local.squareSubscriptionId!);
  }
}
