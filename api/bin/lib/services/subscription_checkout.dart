import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';
import 'package:guildmark_api/services/square_service.dart';

/// Sandbox-only, single paid period. Recurring activation needs paid-invoice
/// reconciliation and intentionally never enters this workflow.
class SubscriptionCheckout {
  SubscriptionCheckout(this.service, this.square);
  final FirebaseService service;
  final SquareService square;
  String hash(String value) => sha256.convert(utf8.encode(value)).toString();

  Future<Map<String, dynamic>> checkout({
    required String companyId,
    required String plan,
    required String key,
    String? sourceId,
    int? expectedPriceCents,
  }) async {
    if (!ampsPlans.containsKey(plan) ||
        !RegExp(r'^[a-zA-Z0-9_-]{16,64}$').hasMatch(key)) {
      throw const PlanLimitException(
        'VALIDATION',
        'A supported plan and stable idempotency key are required.',
        status: 400,
      );
    }
    final price = ampsPlans[plan]!.priceCents;
    if (expectedPriceCents != null && expectedPriceCents != price) {
      throw const PlanLimitException(
        'PRICE_CHANGED',
        'Refresh the current subscription price before paying.',
        status: 409,
      );
    }
    final sub = await SubscriptionRepo(service).findByCompany(companyId);
    if (sub == null) {
      throw const PlanLimitException(
        'NOT_FOUND',
        'Subscription not found.',
        status: 404,
      );
    }
    final id = hash('$companyId:$key');
    final providerKey = 'amps_${id.substring(0, 32)}';
    final intent = await service.tablesDB.transaction((tx) async {
      final previous = await tx.get('subscription_checkout_intents', id);
      final lock = await tx.get('subscription_billing_locks', companyId);
      final sr = await tx.get('subscriptions', sub.id);
      if (previous != null) {
        if (previous.data['company_id'] != companyId ||
            previous.data['plan'] != plan ||
            previous.data['amount_cents'] != price) {
          throw const PlanLimitException(
            'IDEMPOTENCY_CONFLICT',
            'This payment key belongs to another checkout.',
            status: 409,
          );
        }
        if (previous.data['state'] == 'failed') {
          throw const PlanLimitException(
            'PAYMENT_FAILED',
            'This checkout failed. Start a new payment attempt.',
            status: 402,
          );
        }
        // Completed or pending lookups do not require a reusable card nonce.
        if (previous.data['state'] != 'paid' &&
            sourceId != null &&
            sourceId.isNotEmpty &&
            previous.data['source_hash'] != hash(sourceId)) {
          throw const PlanLimitException(
            'PAYMENT_PENDING',
            'An earlier attempt is unresolved. Check billing before starting another payment.',
            status: 409,
          );
        }
        return previous;
      }
      if (sourceId == null || sourceId.isEmpty) {
        throw const PlanLimitException(
          'VALIDATION',
          'source_id is required for a new checkout.',
          status: 400,
        );
      }
      if (sr == null || activePaid(Subscription.fromRow(sr))) {
        throw const PlanLimitException(
          'SUBSCRIPTION_ACTIVE',
          'An active paid plan already exists. Paid plan changes require billing reconciliation.',
          status: 409,
        );
      }
      if (lock?.data['active_intent'] != null) {
        throw const PlanLimitException(
          'PAYMENT_PENDING',
          'An earlier checkout is unresolved. Check billing before starting another payment.',
          status: 409,
        );
      }
      final now = DateTime.now().toUtc();
      final created = tx.create('subscription_checkout_intents', id, {
        'company_id': companyId,
        'subscription_id': sub.id,
        'plan': plan,
        'amount_cents': price,
        'source_hash': hash(sourceId),
        'provider_key': providerKey,
        'state': 'prepared',
        'period_start': now.toIso8601String(),
        'period_end': nextBillingMonth(now).toIso8601String(),
      });
      if (lock == null) {
        tx.create('subscription_billing_locks', companyId, {
          'active_intent': id,
        });
      } else {
        tx.update('subscription_billing_locks', companyId, {
          'active_intent': id,
        });
      }
      return created;
    });
    if (intent.data['state'] == 'paid') {
      return _response(
        intent.data,
        await SubscriptionRepo(service).findByCompany(companyId),
      );
    }
    final known = intent.data['payment_id'] as String?;
    if (known == null && (sourceId == null || sourceId.isEmpty)) {
      return _pending();
    }
    final SquarePaymentResult payment;
    try {
      payment = known != null
          ? await square.getPayment(known)
          : await square.createPayment(
              sourceId: sourceId!,
              amountCents: price,
              idempotencyKey: providerKey,
              referenceId: providerKey,
              note: 'GuildMark $plan one-month sandbox subscription',
            );
    } on SquareException catch (e) {
      if (e.definitiveDecline) await _fail(companyId, id);
      rethrow;
    }
    await service.tablesDB.transaction((tx) async {
      final row = await tx.get('subscription_checkout_intents', id);
      if (row!.data['state'] != 'paid') {
        tx.update('subscription_checkout_intents', id, {
          'payment_id': payment.id,
          'state': 'pending',
        });
      }
    });
    if ({'FAILED', 'CANCELED'}.contains(payment.status)) {
      await _fail(companyId, id);
      throw const PlanLimitException(
        'PAYMENT_FAILED',
        'Payment was not completed.',
        status: 402,
      );
    }
    if (payment.status != 'COMPLETED') return _pending();
    if (payment.amountCents != price ||
        payment.currency != 'USD' ||
        payment.referenceId != providerKey ||
        payment.locationId != square.locationId) {
      throw const PlanLimitException(
        'PAYMENT_RECONCILIATION_REQUIRED',
        'Payment details do not match this checkout. Access has not been granted.',
        status: 409,
      );
    }
    final completed = await service.tablesDB.transaction((tx) async {
      final row = await tx.get('subscription_checkout_intents', id);
      final sr = await tx.get('subscriptions', sub.id);
      final lock = await tx.get('subscription_billing_locks', companyId);
      final invoice = await tx.get('subscription_invoices', id);
      if (row!.data['state'] == 'paid') return row;
      if (lock?.data['active_intent'] != id ||
          sr == null ||
          activePaid(Subscription.fromRow(sr))) {
        throw const PlanLimitException(
          'PAYMENT_RECONCILIATION_REQUIRED',
          'Subscription changed while payment was processing; billing reconciliation is required.',
          status: 409,
        );
      }
      tx.update('subscriptions', sub.id, {
        'plan': plan,
        'status': 'active',
        'amps_ever_paid': true,
        'square_subscription_id': null,
        'cancelled_at': null,
        'current_period_start': row.data['period_start'],
        'current_period_end': row.data['period_end'],
      });
      if (invoice == null) {
        tx.create('subscription_invoices', id, {
          'company_id': companyId,
          'subscription_id': sub.id,
          'plan': plan,
          'amount_cents': price,
          'currency': 'USD',
          'status': 'paid',
          'square_payment_id': payment.id,
          'receipt_url': payment.receiptUrl,
          'period_start': row.data['period_start'],
          'period_end': row.data['period_end'],
        });
      }
      tx.update('subscription_billing_locks', companyId, {
        'active_intent': null,
      });
      return tx.update('subscription_checkout_intents', id, {
        'state': 'paid',
        'receipt_url': payment.receiptUrl,
      });
    });
    return _response(
      completed.data,
      await SubscriptionRepo(service).findByCompany(companyId),
    );
  }

  Map<String, dynamic> _pending() => {
    'status': 'pending',
    'granted': false,
    'code': 'PAYMENT_PENDING',
    'message': 'Payment is awaiting confirmation. Access has not been granted.',
  };
  Map<String, dynamic> _response(
    Map<String, dynamic> intent,
    Subscription? current,
  ) => {
    'status': 'paid',
    'granted': activePaid(current) && current?.plan == intent['plan'],
    'subscription': current?.toJson(),
    'invoice': {
      'plan': intent['plan'],
      'amount_cents': intent['amount_cents'],
      'status': 'paid',
      'receipt_url': intent['receipt_url'],
    },
  };
  Future<void> _fail(String company, String id) =>
      service.tablesDB.transaction((tx) async {
        final intent = await tx.get('subscription_checkout_intents', id);
        final lock = await tx.get('subscription_billing_locks', company);
        if (intent != null && intent.data['state'] != 'paid') {
          tx.update('subscription_checkout_intents', id, {'state': 'failed'});
        }
        if (lock?.data['active_intent'] == id) {
          tx.update('subscription_billing_locks', company, {
            'active_intent': null,
          });
        }
      });
}
