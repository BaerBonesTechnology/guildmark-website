/// GET /partner/account
///
/// Returns the authenticated partner's profile + recent payout history.
///
/// Requires: valid partner JWT.

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final db = context.read<Db>();

  // Partner profile + running balance.
  final partnerRows = await db.query(
    '''
    SELECT id::text,
           email::text,
           company_name,
           partner_code,
           status::text,
           rating::float8,
           total_jobs_completed,
           available_balance::float8,
           service_radius_miles,
           city,
           state,
           created_at
    FROM   partners
    WHERE  id = @pid
    LIMIT 1
    ''',
    parameters: {'pid': principal.partnerId},
  );
  if (partnerRows.isEmpty) return unauthorized('Partner not found');
  final p = partnerRows.first.toColumnMap();

  // Most recent 20 payouts.
  final payoutRows = await db.query(
    '''
    SELECT id::text,
           payout_ref,
           amount_cents,
           method,
           status::text,
           paid_at,
           created_at
    FROM   partner_payouts
    WHERE  partner_id = @pid
    ORDER BY created_at DESC
    LIMIT 20
    ''',
    parameters: {'pid': principal.partnerId},
  );

  final payouts = payoutRows.map((row) {
    final r = row.toColumnMap();
    return {
      'id':           r['id'].toString(),
      'payout_ref':   r['payout_ref'].toString(),
      'amount_cents': (r['amount_cents'] as num?)?.toInt() ?? 0,
      'method':       r['method'].toString(),
      'status':       r['status'].toString(),
      'paid_at':      r['paid_at']?.toString(),
      'created_at':   r['created_at'].toString(),
    };
  }).toList();

  return Response.json(
    body: {
      'partner': {
        'id':                   p['id'].toString(),
        'email':                p['email'].toString(),
        'company_name':         p['company_name'].toString(),
        'partner_code':         p['partner_code'].toString(),
        'status':               p['status'].toString(),
        'rating':               (p['rating'] as num?)?.toDouble() ?? 5.0,
        'total_jobs_completed': (p['total_jobs_completed'] as num?)?.toInt() ?? 0,
        'available_balance':    (p['available_balance'] as num?)?.toDouble() ?? 0.0,
        'service_radius_miles': (p['service_radius_miles'] as num?)?.toInt() ?? 50,
        'city':                 p['city']?.toString(),
        'state':                p['state']?.toString(),
        'created_at':           p['created_at'].toString(),
      },
      'payouts': payouts,
    },
  );
}
