/// Provider-fetched facts only; webhook fields never authorize access.
library;

import 'dart:convert';
import 'package:crypto/crypto.dart';

DateTime billingMonth(DateTime anchor, int months) {
  final first = DateTime.utc(anchor.year, anchor.month + months);
  final last = DateTime.utc(first.year, first.month + 1, 0).day;
  return DateTime.utc(
    first.year,
    first.month,
    anchor.day > last ? last : anchor.day,
  );
}

String billingDate(DateTime d) => d.toIso8601String().substring(0, 10);
DateTime exactBillingDate(Object? value) {
  if (value is! String || !RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(value))
    throw StateError('Invalid billing date');
  final date = DateTime.parse(value + 'T00:00:00Z');
  if (billingDate(date) != value) throw StateError('Invalid billing date');
  return date;
}

bool squareSignature(String raw, String signature, String key, String url) {
  if (key.isEmpty || url.isEmpty) return false;
  final expected = base64Encode(
    Hmac(sha256, utf8.encode(key)).convert(utf8.encode(url + raw)).bytes,
  );
  if (signature.length != expected.length) return false;
  var difference = 0;
  for (var i = 0; i < expected.length; i++) {
    difference |= signature.codeUnitAt(i) ^ expected.codeUnitAt(i);
  }
  return difference == 0;
}

class PaidInvoice {
  PaidInvoice(
    this.id,
    this.version,
    this.start,
    this.end,
    this.eligible,
    this.state,
  );
  final String id, state;
  final int version;
  final DateTime start, end;
  final bool eligible;
  static PaidInvoice verify(
    Map<String, dynamic> link,
    Map<String, dynamic> subscription,
    Map<String, dynamic> invoice,
    Map<String, dynamic>? order,
    List<Map<String, dynamic>> payments,
  ) {
    verifyBillingSubscription(link, subscription);
    if (invoice['subscription_id'] != link['square_subscription_id'] ||
        invoice['location_id'] != link['location_id'] ||
        invoice['timezone'] != 'UTC' ||
        (invoice['primary_recipient'] as Map?)?['customer_id'] !=
            link['customer_id'])
      throw StateError('Invoice ownership mismatch');
    final requests = invoice['payment_requests'] as List?;
    if (requests == null || requests.length != 1)
      throw StateError('Unsupported invoice schedule');
    final payment = requests.single as Map;
    if (payment['request_type'] != 'BALANCE')
      throw StateError('Unsupported invoice schedule');
    bool money(Object? v) =>
        v is Map &&
        v['currency'] == 'USD' &&
        v['amount'] == link['amount_cents'];
    if (!money(payment['computed_amount_money']))
      throw StateError('Invoice price mismatch');
    final start = exactBillingDate(payment['due_date']);
    final anchor = exactBillingDate(link['start_date']);
    final months = (start.year - anchor.year) * 12 + start.month - anchor.month;
    if (months < 0 || months > 1200 || start != billingMonth(anchor, months))
      throw StateError('Invoice period mismatch');
    final end = billingMonth(anchor, months + 1);
    var eligible = invoice['status'] == 'PAID';
    var state = eligible ? 'paid' : invoice['status'].toString().toLowerCase();
    if (eligible) {
      if (!money(payment['total_completed_amount_money']) ||
          order == null ||
          order['id'] != invoice['order_id'] ||
          order['location_id'] != link['location_id'] ||
          order['state'] != 'COMPLETED' ||
          !money(order['total_money']) ||
          payments.isEmpty)
        throw StateError('Paid invoice lacks matching completed payment');
      var total = 0;
      final tenderIds = (order['tenders'] as List? ?? [])
          .map((t) => (t as Map)['payment_id'] ?? t['id'])
          .toSet();
      final seen = <String>{};
      for (final p in payments) {
        final amount = p['amount_money'] as Map?;
        if (p['id'] is! String ||
            !tenderIds.contains(p['id']) ||
            !seen.add(p['id'] as String) ||
            p['status'] != 'COMPLETED' ||
            p['source_type'] != 'CARD' ||
            p['order_id'] != order['id'] ||
            p['location_id'] != link['location_id'] ||
            amount?['currency'] != 'USD' ||
            amount?['amount'] is! int)
          throw StateError('Payment ownership mismatch');
        total += amount!['amount'] as int;
        if (((p['refunded_money'] as Map?)?['amount'] as num? ?? 0) > 0) {
          eligible = false;
          state = 'refunded';
        }
      }
      if (total != link['amount_cents'])
        throw StateError('Payment amount mismatch');
    }
    final canceled = subscription['canceled_date'];
    if (canceled != null && !start.isBefore(exactBillingDate(canceled)))
      eligible = false;
    if (invoice['id'] is! String || invoice['version'] is! int)
      throw StateError('Invoice identity unavailable');
    return PaidInvoice(
      invoice['id'] as String,
      invoice['version'] as int,
      start,
      end,
      eligible,
      state,
    );
  }
}

void verifyBillingSubscription(
  Map<String, dynamic> link,
  Map<String, dynamic> subscription,
) {
  for (final pair in [
    ('id', 'square_subscription_id'),
    ('customer_id', 'customer_id'),
    ('location_id', 'location_id'),
    ('plan_variation_id', 'variation_id'),
  ]) {
    if (subscription[pair.$1] != link[pair.$2])
      throw StateError('Subscription ownership mismatch');
  }
  if (subscription['timezone'] != 'UTC' ||
      subscription['start_date'] != link['start_date'])
    throw StateError('Subscription cadence changed');
}
