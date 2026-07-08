import 'package:dart_appwrite/dart_appwrite.dart' show Query;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/subscription_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final repo = SubscriptionRepo(aw);

  final sub = await repo.findByCompany(auth.companyId);
  if (sub == null) {
    // Should not happen — every company gets a free sub at signup.
    return notFound('Subscription not found');
  }

  // Fetch billing invoices (latest 24)
  final invoiceRows = await aw.tablesDB.listRows(
    databaseId: Aw.databaseId,
    tableId: Aw.subscriptionInvoices,
    queries: [
      Query.equal('company_id', auth.companyId),
      Query.orderDesc(r'$createdAt'),
      Query.limit(24),
    ],
  );

  final invoices = invoiceRows.rows.map((r) {
    final row = r.data;
    return {
      'id': r.$id,
      'plan': row['plan'].toString(),
      'amount_cents': (row['amount_cents'] as num).toInt(),
      'currency': (row['currency'] as String?) ?? 'USD',
      'status': (row['status'] as String?) ?? 'paid',
      'receipt_url': row['receipt_url'] as String?,
      'period_start': _iso(row['period_start']),
      'period_end': _iso(row['period_end']),
      'created_at': DateTime.parse(r.$createdAt).toIso8601String(),
    };
  }).toList();

  return Response.json(
    body: {
      ...sub.toJson(),
      'id': sub.id,
      'company_id': sub.companyId,
      'invoices': invoices,
    },
  );
}

/// Normalize an Appwrite datetime string to the same DateTime
/// .toIso8601String() format the Postgres version emitted.
String? _iso(Object? v) =>
    v == null ? null : DateTime.parse(v as String).toIso8601String();
