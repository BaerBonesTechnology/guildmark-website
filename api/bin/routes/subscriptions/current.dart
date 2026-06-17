import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/subscription_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final db = context.read<Db>();
  final repo = SubscriptionRepo(db);

  final sub = await repo.findByCompany(auth.companyId);
  if (sub == null) {
    // Should not happen — every company gets a free sub at signup.
    return notFound('Subscription not found');
  }

  // Fetch billing invoices (latest 24)
  final invoiceRows = await db.query(
    '''
    SELECT id::text, plan::text, amount_cents, currency, status,
           receipt_url, period_start, period_end, created_at
    FROM subscription_invoices
    WHERE company_id = @cid
    ORDER BY created_at DESC
    LIMIT 24
    ''',
    parameters: {'cid': auth.companyId},
  );

  final invoices = invoiceRows.map((r) {
    final row = r.toColumnMap();
    return {
      'id': row['id'].toString(),
      'plan': row['plan'].toString(),
      'amount_cents': row['amount_cents'] as int,
      'currency': row['currency'].toString(),
      'status': row['status'].toString(),
      'receipt_url': row['receipt_url']?.toString(),
      'period_start': (row['period_start'] as DateTime?)?.toIso8601String(),
      'period_end': (row['period_end'] as DateTime?)?.toIso8601String(),
      'created_at': (row['created_at'] as DateTime).toIso8601String(),
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
