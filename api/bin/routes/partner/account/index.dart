import 'package:dart_appwrite/dart_appwrite.dart' show AppwriteException, Query;
import 'package:dart_appwrite/models.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // Partner profile + running balance.
  final Row partner;
  try {
    partner = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.partners,
      rowId: principal.partnerId,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) return unauthorized('Partner not found');
    rethrow;
  }
  final p = partner.data;

  // Most recent 20 payouts.
  final payoutRows = await db.listRows(
    databaseId: Aw.databaseId,
    tableId: Aw.partnerPayouts,
    queries: [
      Query.equal('partner_id', principal.partnerId),
      Query.orderDesc(r'$createdAt'),
      Query.limit(20),
    ],
  );

  final payouts = payoutRows.rows.map((row) {
    final r = row.data;
    return {
      'id': row.$id,
      'payout_ref': r['payout_ref'].toString(),
      'amount_cents': (r['amount_cents'] as num?)?.toInt() ?? 0,
      'method': (r['method'] as String?) ?? 'bank_transfer',
      'status': (r['status'] as String?) ?? 'pending',
      'paid_at': _ts(r['paid_at']),
      'created_at': _ts(row.$createdAt),
    };
  }).toList();

  return Response.json(
    body: {
      'partner': {
        'id': partner.$id,
        'email': p['email'].toString(),
        'company_name': p['company_name'].toString(),
        'partner_code': p['partner_code'].toString(),
        'status': (p['status'] as String?) ?? 'pending',
        'rating': (p['rating'] as num?)?.toDouble() ?? 5.0,
        'total_jobs_completed':
            (p['total_jobs_completed'] as num?)?.toInt() ?? 0,
        // Money is stored as integer cents; the API surfaces dollars.
        'available_balance':
            ((p['available_balance_cents'] as num?)?.toInt() ?? 0) / 100.0,
        'service_radius_miles':
            (p['service_radius_miles'] as num?)?.toInt() ?? 50,
        'city': p['city'] as String?,
        'state': p['state'] as String?,
        'created_at': _ts(partner.$createdAt),
      },
      'payouts': payouts,
    },
  );
}

/// Appwrite datetimes are ISO strings; the Postgres version serialized
/// DateTime.toString() — parse and re-stringify to keep the same format.
String? _ts(Object? iso) =>
    iso == null ? null : DateTime.parse(iso as String).toString();
