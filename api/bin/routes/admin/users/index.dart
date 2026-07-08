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
  final limit = (int.tryParse(params['limit'] ?? '50') ?? 50).clamp(1, 200);
  final offset = int.tryParse(params['offset'] ?? '0') ?? 0;
  final search = (params['q'] ?? '').trim();
  final plan = (params['plan'] ?? '').trim();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // No joins in Appwrite (§1b) and the search/plan filters span joined fields
  // (company name, subscription plan), so: page all three tables, stitch and
  // filter in Dart, then apply offset/limit in memory (§1c fetch+reduce
  // tradeoff — fine for a bounded, admin-scale dataset).
  final userRows = await _listAll(db, Aw.users, [
    Query.orderDesc(r'$createdAt'),
  ]);
  final companyRows = await _listAll(db, Aw.companies, []);
  final subRows = await _listAll(db, Aw.subscriptions, []);

  final companiesById = {for (final r in companyRows) r.$id: r};
  final subsByCompany = {
    for (final r in subRows) r.data['company_id'] as String: r,
  };

  final needle = search.toLowerCase();
  final stitched = <Map<String, dynamic>>[];
  for (final u in userRows) {
    final companyId = u.data['company_id'] as String;
    final company = companiesById[companyId];
    // Mirror the INNER JOIN: skip users whose company row is missing.
    if (company == null) continue;
    final sub = subsByCompany[companyId];

    final email = u.data['email'].toString();
    final fullName = u.data['full_name'].toString();
    final companyName = company.data['name'].toString();
    final userPlan = (sub?.data['plan'] as String?) ?? 'free';
    final subStatus = (sub?.data['status'] as String?) ?? 'active';

    if (needle.isNotEmpty &&
        !email.toLowerCase().contains(needle) &&
        !fullName.toLowerCase().contains(needle) &&
        !companyName.toLowerCase().contains(needle)) {
      continue;
    }
    if (plan.isNotEmpty && userPlan != plan) continue;

    stitched.add({
      'id': u.$id,
      'email': email,
      'full_name': fullName,
      'role': u.data['role'].toString(),
      'created_at': u.$createdAt,
      'company_id': company.$id,
      'company_name': companyName,
      'size_band': company.data['size_band'] as String?,
      'industry': company.data['industry'] as String?,
      'plan': userPlan,
      'subscription_status': subStatus,
    });
  }

  final total = stitched.length;
  final pageItems = stitched.skip(offset).take(limit).toList();

  return Response.json(
    body: {
      'total': total,
      'limit': limit,
      'offset': offset,
      'users': pageItems,
    },
  );
}

/// Pages through an entire table (Appwrite caps page sizes; the old SQL was
/// unbounded).
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
        Query.limit(100),
        if (cursor != null) Query.cursorAfter(cursor),
      ],
    );
    rows.addAll(page.rows);
    if (page.rows.length < 100) return rows;
    cursor = page.rows.last.$id;
  }
}
