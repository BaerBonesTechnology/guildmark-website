import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/firestore.dart';

Future<Response> onRequest(RequestContext c) async {
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  final db = c.read<FirebaseService?>();
  if (db == null) return Response(statusCode: 503);
  final cursor = c.request.uri.queryParameters['cursor'];
  final rows = await db.tablesDB.listRows(
    databaseId: '',
    tableId: 'cms_posts',
    queries: [
      Query.equal('published_visible', true),
      Query.orderAsc(r'$id'),
      Query.limit(51),
      if (cursor != null) Query.cursorAfter(cursor),
    ],
  );
  return Response.json(
    headers: {'Cache-Control': 'no-store'},
    body: {
      'posts': rows.rows
          .take(50)
          .map(
            (r) =>
                Map<String, dynamic>.from(r.data['published'] as Map)
                  ..remove('body'),
          )
          .toList(),
      'next_cursor': rows.rows.length > 50 ? rows.rows[49].$id : null,
    },
  );
}
