/// GET /admin/analytics?days=N
///
/// N = 7 | 30 | 90 | 0 (0 = all time).  Default: 30.
///
/// Returns summary stats + daily time-series for the analytics dashboard.
/// Admin-only.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final params = context.request.uri.queryParameters;
  final days   = int.tryParse(params['days'] ?? '30') ?? 30;
  final allTime = days <= 0;

  final db = context.read<Db>();

  // Shared date filter — null means no lower bound (all time).
  final from = allTime
      ? null
      : DateTime.now().toUtc().subtract(Duration(days: days));

  final dateFilter  = allTime ? '' : 'AND created_at >= @from';
  final dateParams  = allTime ? <String, dynamic>{} : <String, dynamic>{'from': from};

  // ── Summary counts ────────────────────────────────────────────────────────

  final totalUsersRow = await db.query(
    'SELECT COUNT(*)::int AS n FROM users',
  );
  final newUsersRow = await db.query(
    'SELECT COUNT(*)::int AS n FROM users WHERE true $dateFilter',
    parameters: dateParams,
  );

  final totalSubsRow = await db.query(
    'SELECT COUNT(*)::int AS n FROM mailing_list',
  );
  final newSubsRow = await db.query(
    'SELECT COUNT(*)::int AS n FROM mailing_list WHERE true $dateFilter',
    parameters: dateParams,
  );

  final listingsRow = await db.query(
    "SELECT COUNT(*)::int AS total, "
    "COUNT(*) FILTER (WHERE status = 'active')::int AS active "
    "FROM listings",
  );

  final ordersRow = await db.query(
    "SELECT COUNT(*)::int AS total, "
    "COUNT(*) FILTER (WHERE status = 'complete')::int AS completed, "
    "COALESCE(SUM(amount) FILTER (WHERE status = 'complete'), 0)::numeric AS gmv "
    "FROM orders WHERE true $dateFilter",
    parameters: dateParams,
  );

  final listingMap = listingsRow.first.toColumnMap();
  final orderMap   = ordersRow.first.toColumnMap();

  // ── Subscription breakdown ────────────────────────────────────────────────

  final planRows = await db.query(
    '''
    SELECT COALESCE(s.plan::text, 'free') AS plan, COUNT(*)::int AS count
    FROM companies c
    LEFT JOIN subscriptions s ON s.company_id = c.id
    GROUP BY 1
    ORDER BY 1
    ''',
  );

  // ── Time-series: user signups per day ─────────────────────────────────────

  final userGrowthRows = await db.query(
    '''
    SELECT date_trunc('day', created_at)::date::text AS date,
           COUNT(*)::int AS count
    FROM users
    WHERE true $dateFilter
    GROUP BY 1
    ORDER BY 1
    ''',
    parameters: dateParams,
  );

  // ── Time-series: mailing list signups per day ─────────────────────────────

  final mailingGrowthRows = await db.query(
    '''
    SELECT date_trunc('day', created_at)::date::text AS date,
           COUNT(*)::int AS count
    FROM mailing_list
    WHERE true $dateFilter
    GROUP BY 1
    ORDER BY 1
    ''',
    parameters: dateParams,
  );

  // ── Time-series: orders per day ───────────────────────────────────────────

  final orderActivityRows = await db.query(
    '''
    SELECT date_trunc('day', created_at)::date::text AS date,
           COUNT(*)::int                             AS count,
           COALESCE(SUM(amount), 0)::numeric         AS amount
    FROM orders
    WHERE true $dateFilter
    GROUP BY 1
    ORDER BY 1
    ''',
    parameters: dateParams,
  );

  return Response.json(body: {
    'period': {
      'days': days,
      'all_time': allTime,
      'from': from?.toIso8601String(),
    },
    'summary': {
      'total_users':       totalUsersRow.first.toColumnMap()['n'] as int? ?? 0,
      'new_users':         newUsersRow.first.toColumnMap()['n']   as int? ?? 0,
      'total_subscribers': totalSubsRow.first.toColumnMap()['n']  as int? ?? 0,
      'new_subscribers':   newSubsRow.first.toColumnMap()['n']    as int? ?? 0,
      'total_listings':    listingMap['total']                    as int? ?? 0,
      'active_listings':   listingMap['active']                   as int? ?? 0,
      'total_orders':      orderMap['total']                      as int? ?? 0,
      'completed_orders':  orderMap['completed']                  as int? ?? 0,
      'gmv':               double.tryParse(orderMap['gmv'].toString()) ?? 0.0,
    },
    'subscription_breakdown': planRows.map((r) {
      final row = r.toColumnMap();
      return {
        'plan':  row['plan'].toString(),
        'count': row['count'] as int? ?? 0,
      };
    }).toList(),
    'user_growth': userGrowthRows.map((r) {
      final row = r.toColumnMap();
      return {'date': row['date'].toString(), 'count': row['count'] as int? ?? 0};
    }).toList(),
    'mailing_list_growth': mailingGrowthRows.map((r) {
      final row = r.toColumnMap();
      return {'date': row['date'].toString(), 'count': row['count'] as int? ?? 0};
    }).toList(),
    'order_activity': orderActivityRows.map((r) {
      final row = r.toColumnMap();
      return {
        'date':   row['date'].toString(),
        'count':  row['count'] as int? ?? 0,
        'amount': double.tryParse(row['amount'].toString()) ?? 0.0,
      };
    }).toList(),
  });
}
