import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/firestore.dart';

Future<Response> onRequest(RequestContext c, String slug) async {
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  if (!RegExp(r'^[a-z0-9]+(?:-[a-z0-9]+)*$').hasMatch(slug))
    return Response(statusCode: 404);
  final db = c.read<FirebaseService?>();
  if (db == null) return Response(statusCode: 503);
  try {
    final link = await db.tablesDB.getRow(
      databaseId: '',
      tableId: 'cms_slugs',
      rowId: slug,
    );
    final row = await db.tablesDB.getRow(
      databaseId: '',
      tableId: 'cms_posts',
      rowId: link.data['post_id'] as String,
    );
    if (row.data['published'] == null)
      return Response(statusCode: 404, headers: {'Cache-Control': 'no-store'});
    return Response.json(
      headers: {'Cache-Control': 'no-store'},
      body: row.data['published'],
    );
  } on DatastoreException catch (e) {
    if (e.code == 404)
      return Response(statusCode: 404, headers: {'Cache-Control': 'no-store'});
    rethrow;
  }
}
