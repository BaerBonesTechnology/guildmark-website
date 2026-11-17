import 'dart:convert';
import 'package:dart_frog/dart_frog.dart';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/paid_invoice.dart';
import 'package:guildmark_api/services/recurring_billing.dart';
import 'package:guildmark_api/services/square_service.dart';

Future<Response> onRequest(RequestContext c) async {
  if (c.request.method != HttpMethod.post)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  final cfg = c.read<AppConfig>();
  final store = c.read<FirebaseService?>();
  final square = c.read<SquareService?>();
  if (!cfg.recurringBillingEnabled ||
      cfg.firebaseProjectId != 'guildmark-dev' ||
      cfg.squareEnvironment != 'sandbox' ||
      store == null ||
      square == null ||
      cfg.squareMerchantId == null ||
      cfg.squareMerchantId!.isEmpty)
    return jsonError(
      503,
      'BILLING_UNAVAILABLE',
      'Billing webhook unavailable.',
    );
  final raw = await c.request.body();
  if (utf8.encode(raw).length > 262144)
    return jsonError(413, 'TOO_LARGE', 'Webhook exceeds limit');
  if (!squareSignature(
    raw,
    c.request.headers['x-square-hmacsha256-signature'] ?? '',
    cfg.squareWebhookKey ?? '',
    cfg.squareWebhookUrl ?? '',
  ))
    return unauthorized('Invalid webhook signature');
  try {
    final body = jsonDecode(raw) as Map;
    final event = body['event_id'];
    final type = body['type'];
    if (event is! String ||
        event.length > 200 ||
        type is! String ||
        body['merchant_id'] != cfg.squareMerchantId)
      return badRequest('Invalid billing event');
    if (!type.startsWith('invoice.') && !type.startsWith('subscription.'))
      return Response.json(body: {'ignored': true});
    final id = sha256.convert(utf8.encode(event)).toString();
    final service = RecurringBilling(store, square);
    final old = await service.row('square_billing_events', id);
    if (old?.data['state'] == 'complete')
      return Response.json(body: {'duplicate': true});
    final data = body['data'] as Map;
    final object = data['object'] as Map;
    final resource = (object['invoice'] ?? object['subscription']) as Map?;
    final resourceId = resource?['id'] ?? data['id'];
    if (resourceId is! String || resourceId.isEmpty)
      return badRequest('Billing resource missing');
    await store.tablesDB.transaction((tx) async {
      final existing = await tx.get('square_billing_events', id);
      if (existing == null)
        tx.create('square_billing_events', id, {
          'event_id': event,
          'type': type,
          'resource_id': resourceId,
          'state': 'received',
        });
    });
    String? provider;
    if (type.startsWith('invoice.')) {
      final i =
          (await square.billing(
                'GET',
                '/invoices/${Uri.encodeComponent(resourceId)}',
              ))['invoice']
              as Map;
      provider = i['subscription_id'] as String?;
    } else {
      provider = resourceId;
    }
    if (provider != null) await service.reconcile(provider);
    await store.tablesDB.updateRow(
      databaseId: '',
      tableId: 'square_billing_events',
      rowId: id,
      data: {
        'state': 'complete',
        'completed_at': DateTime.now().toUtc().toIso8601String(),
      },
    );
    return Response.json(body: {'ok': true});
  } catch (_) {
    return jsonError(
      503,
      'RECONCILIATION_RETRY',
      'Billing event was not reconciled; retry delivery.',
    );
  }
}
