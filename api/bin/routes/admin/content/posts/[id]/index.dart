import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext c, String id) async {
  if (!Cms.validId(id)) throw CmsFailure(400, 'Invalid article ID.');
  final db = c.read<FirebaseService?>()!;
  if (c.request.method == HttpMethod.post) {
    final body = await boundedJson(c.request, maxBytes: 150000);
    if (body is! Map<String, dynamic>)
      throw CmsFailure(400, 'Content action required.');
    return Response.json(
      body: await Cms(db).mutate(id, c.read<AuthPrincipal?>()!, body),
    );
  }
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  final row = await db.tablesDB.getRow(
    databaseId: '',
    tableId: 'cms_posts',
    rowId: id,
  );
  return Response.json(body: {'id': id, ...row.data});
}
