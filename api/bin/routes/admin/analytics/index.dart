import 'package:dart_appwrite/dart_appwrite.dart' show Query, TablesDB;
import 'package:dart_appwrite/models.dart' show Row;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final params = context.request.uri.queryParameters;
  final days = int.tryParse(params['days'] ?? '30') ?? 30;
  final allTime = days <= 0;

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // Shared date filter — null means no lower bound (all time).
  final from = allTime
      ? null
      : DateTime.now().toUtc().subtract(Duration(days: days));
  final fromIso = from?.toIso8601String();
  final dateQueries = [
    if (fromIso != null) Query.greaterThanEqual(r'$createdAt', fromIso),
  ];

  // ── Summary counts ────────────────────────────────────────────────────────
  // SQL COUNT(*) → listRows(.total) with Query.limit(1) (§1c: Appwrite has no
  // aggregates). SUM/GROUP BY below page rows and reduce in Dart — acceptable
  // for a bounded, admin-scale dataset but O(rows) per request.

  Future<int> count(String tableId, [List<String> queries = const []]) async {
    final res = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: tableId,
      queries: [...queries, Query.limit(1)],
    );
    return res.total;
  }

  final totalUsers = await count(Aw.users);
  final newUsers = allTime ? totalUsers : await count(Aw.users, dateQueries);

  final totalSubscribers = await count(Aw.mailingList);
  final newSubscribers = allTime
      ? totalSubscribers
      : await count(Aw.mailingList, dateQueries);

  final totalListings = await count(Aw.listings);
  final activeListings = await count(Aw.listings, [
    Query.equal('status', 'active'),
  ]);

  // Orders in the window — paged once, then reduced for count / completed /
  // GMV / per-day activity (§1c tradeoff: no SUM or GROUP BY server-side).
  final orderRows = await _listAll(db, Aw.orders, dateQueries);
  final totalOrders = orderRows.length;
  var completedOrders = 0;
  var gmvCents = 0;
  for (final r in orderRows) {
    if (r.data['status'] == 'complete') {
      completedOrders += 1;
      gmvCents += (r.data['amount_cents'] as num? ?? 0).toInt();
    }
  }

  // ── Subscription breakdown ────────────────────────────────────────────────
  // companies LEFT JOIN subscriptions GROUP BY plan → page both tables and
  // group in Dart (subscriptions is unique per company_id, so this is 1:1).
  final companyRows = await _listAll(db, Aw.companies, const []);
  final subRows = await _listAll(db, Aw.subscriptions, const []);
  final planByCompany = {
    for (final s in subRows)
      s.data['company_id'] as String: (s.data['plan'] as String?) ?? 'free',
  };
  final planCounts = <String, int>{};
  for (final c in companyRows) {
    final plan = planByCompany[c.$id] ?? 'free';
    planCounts[plan] = (planCounts[plan] ?? 0) + 1;
  }
  final planKeys = planCounts.keys.toList()..sort();

  // ── Time-series (GROUP BY day → bucket by $createdAt date in Dart) ────────
  final userGrowth = _perDayCounts(await _listAll(db, Aw.users, dateQueries));
  final mailingGrowth = _perDayCounts(
    await _listAll(db, Aw.mailingList, dateQueries),
  );

  final orderBuckets = <String, List<Row>>{};
  for (final r in orderRows) {
    orderBuckets.putIfAbsent(_day(r), () => []).add(r);
  }
  final orderDates = orderBuckets.keys.toList()..sort();

  return Response.json(
    body: {
      'period': {
        'days': days,
        'all_time': allTime,
        'from': from?.toIso8601String(),
      },
      'summary': {
        'total_users': totalUsers,
        'new_users': newUsers,
        'total_subscribers': totalSubscribers,
        'new_subscribers': newSubscribers,
        'total_listings': totalListings,
        'active_listings': activeListings,
        'total_orders': totalOrders,
        'completed_orders': completedOrders,
        // amount_cents (int) → dollars (double) at the boundary
        'gmv': gmvCents / 100.0,
      },
      'subscription_breakdown': [
        for (final plan in planKeys)
          {'plan': plan, 'count': planCounts[plan] ?? 0},
      ],
      'user_growth': userGrowth,
      'mailing_list_growth': mailingGrowth,
      'order_activity': [
        for (final date in orderDates)
          {
            'date': date,
            'count': orderBuckets[date]!.length,
            'amount':
                orderBuckets[date]!.fold<int>(
                  0,
                  (sum, r) =>
                      sum + (r.data['amount_cents'] as num? ?? 0).toInt(),
                ) /
                100.0,
          },
      ],
    },
  );
}

/// UTC calendar day of a row's creation ("YYYY-MM-DD"), matching
/// `date_trunc('day', created_at)::date::text`.
String _day(Row row) =>
    DateTime.parse(row.$createdAt).toUtc().toIso8601String().substring(0, 10);

List<Map<String, dynamic>> _perDayCounts(List<Row> rows) {
  final counts = <String, int>{};
  for (final r in rows) {
    final day = _day(r);
    counts[day] = (counts[day] ?? 0) + 1;
  }
  final dates = counts.keys.toList()..sort();
  return [
    for (final date in dates) {'date': date, 'count': counts[date] ?? 0},
  ];
}

/// Pages through every row matching [queries] (Appwrite caps page sizes; the
/// SQL aggregates were unbounded).
Future<List<Row>> _listAll(
  TablesDB db,
  String tableId,
  List<String> queries,
) async {
  final rows = <Row>[];
  String? cursor;
  while (true) {
    final page = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: tableId,
      queries: [
        ...queries,
        Query.orderAsc(r'$createdAt'),
        Query.limit(100),
        if (cursor != null) Query.cursorAfter(cursor),
      ],
    );
    rows.addAll(page.rows);
    if (page.rows.length < 100) return rows;
    cursor = page.rows.last.$id;
  }
}
