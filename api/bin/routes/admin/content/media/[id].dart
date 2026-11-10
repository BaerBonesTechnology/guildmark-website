import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';

Future<Response> onRequest(RequestContext c, String id) async {
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  if (!Cms.validId(id)) throw CmsFailure(400, 'Invalid media ID.');
  final row = await c.read<FirebaseService?>()!.tablesDB.getRow(
    databaseId: '',
    tableId: 'cms_media',
    rowId: id,
  );
  return Response.json(body: {'id': id, ...row.data});
}
