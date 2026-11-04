import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext c) async {
  final auth = c.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  if (!auth.isStaffAdministrator) return forbidden();
  if (c.request.method != HttpMethod.get)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  final db = c.read<FirebaseService?>();
  if (db == null)
    return jsonError(503, 'DB_UNAVAILABLE', 'Partner accounts unavailable.');
  final cursor = c.request.uri.queryParameters['cursor'];
  final page = await db.tablesDB.listRows(
    databaseId: '',
    tableId: 'partners',
    queries: [
      Query.orderAsc(r'$id'),
      Query.limit(51),
      if (cursor != null) Query.cursorAfter(cursor),
    ],
  );
  final rows = page.rows.take(50).toList();
  return Response.json(
    headers: {'Cache-Control': 'no-store'},
    body: {
      'total': page.total,
      'next_cursor': page.rows.length > 50 ? rows.last.$id : null,
      'partners': rows
          .map(
            (r) => {
              'id': r.$id,
              'email': r.data['email'],
              'company_name': r.data['company_name'],
              'partner_code': r.data['partner_code'],
              'status': r.data['status'],
              'total_jobs_completed': r.data['total_jobs_completed'] ?? 0,
            },
          )
          .toList(),
    },
  );
}
