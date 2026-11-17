import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';

Future<Response> onRequest(RequestContext c, String id) async {
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  if (!Cms.validId(id)) throw CmsFailure(400, 'Invalid article ID.');
  final cursor = c.request.uri.queryParameters['cursor'];
  final rows = await c.read<FirebaseService?>()!.tablesDB.listRows(
    databaseId: '',
    tableId: 'cms_revisions',
    queries: [
      Query.equal('post_id', id),
      Query.orderDesc(r'$id'),
      Query.limit(51),
      if (cursor != null) Query.cursorAfter(cursor),
    ],
  );
  return Response.json(
    body: {
      'revisions': rows.rows.take(50).map((r) => r.data).toList(),
      'next_cursor': rows.rows.length > 50 ? rows.rows[49].$id : null,
    },
  );
}
