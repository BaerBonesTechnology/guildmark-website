import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext c) async {
  final db = c.read<FirebaseService?>()!;
  if (c.request.method == HttpMethod.post) {
    final body = await boundedJson(c.request, maxBytes: 150000);
    if (body is! Map<String, dynamic> || body['id'] is! String)
      throw CmsFailure(400, 'Draft ID required.');
    return Response.json(
      body: await Cms(db).mutate(
        body['id'] as String,
        c.read<AuthPrincipal?>()!,
        {...body, 'action': 'create'},
      ),
    );
  }
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  final cursor = c.request.uri.queryParameters['cursor'];
  final rows = await db.tablesDB.listRows(
    databaseId: '',
    tableId: 'cms_posts',
    queries: [
      Query.orderAsc(r'$id'),
      Query.limit(51),
      if (cursor != null) Query.cursorAfter(cursor),
    ],
  );
  return Response.json(
    body: {
      'posts': rows.rows.take(50).map((r) => {'id': r.$id, ...r.data}).toList(),
      'next_cursor': rows.rows.length > 50 ? rows.rows[49].$id : null,
    },
  );
}
