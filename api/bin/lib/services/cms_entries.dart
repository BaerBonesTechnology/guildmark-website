import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';
import 'package:guildmark_api/services/request_json.dart';

Cms contentService(RequestContext c, String kind) {
  if (!{'page', 'faq', 'help', 'promotion'}.contains(kind))
    throw CmsFailure(404, 'Content type not found.');
  final db = c.read<FirebaseService?>();
  if (db == null) throw CmsFailure(503, 'Content storage unavailable.');
  return Cms(db, kind: kind);
}

Future<Response> contentList(RequestContext c, String kind) async {
  final service = contentService(c, kind);
  if (c.request.method == HttpMethod.post) {
    final body = await boundedJson(c.request, maxBytes: 150000);
    if (body is! Map<String, dynamic> || body['id'] is! String)
      throw CmsFailure(400, 'Draft ID required.');
    return Response.json(
      body: await service.mutate(
        body['id'] as String,
        c.read<AuthPrincipal?>()!,
        {...body, 'action': 'create'},
      ),
    );
  }
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  final cursor = c.request.uri.queryParameters['cursor'];
  final rows = await service.store.tablesDB.listRows(
    databaseId: '',
    tableId: service.postsTable,
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

Future<Response> contentDetail(RequestContext c, String kind, String id) async {
  final service = contentService(c, kind);
  if (!Cms.validId(id)) throw CmsFailure(400, 'Invalid content ID.');
  if (c.request.method == HttpMethod.post) {
    final body = await boundedJson(c.request, maxBytes: 150000);
    if (body is! Map<String, dynamic>)
      throw CmsFailure(400, 'Content action required.');
    return Response.json(
      body: await service.mutate(id, c.read<AuthPrincipal?>()!, body),
    );
  }
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  final row = await service.store.tablesDB.getRow(
    databaseId: '',
    tableId: service.postsTable,
    rowId: id,
  );
  return Response.json(body: {'id': id, ...row.data});
}

Future<Response> contentRevisions(
  RequestContext c,
  String kind,
  String id,
) async {
  final service = contentService(c, kind);
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  if (!Cms.validId(id)) throw CmsFailure(400, 'Invalid content ID.');
  final cursor = c.request.uri.queryParameters['cursor'];
  final rows = await service.store.tablesDB.listRows(
    databaseId: '',
    tableId: service.revisionsTable,
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

Future<Response> publishedContent(
  RequestContext c,
  String kind, {
  String? slug,
}) async {
  try {
    if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
    if (kind == 'promotion') throw CmsFailure(404, 'Content not found.');
    final service = contentService(c, kind);
    if (slug != null) {
      if (!RegExp(r'^[a-z0-9]+(?:-[a-z0-9]+)*$').hasMatch(slug))
        throw CmsFailure(404, 'Content not found.');
      final link = await service.store.tablesDB.getRow(
        databaseId: '',
        tableId: 'cms_slugs',
        rowId: service.slugKey(slug),
      );
      final row = await service.store.tablesDB.getRow(
        databaseId: '',
        tableId: service.postsTable,
        rowId: link.data['post_id'] as String,
      );
      if (row.data['published'] == null)
        throw CmsFailure(404, 'Content not found.');
      return Response.json(
        headers: {'Cache-Control': 'no-store'},
        body: row.data['published'],
      );
    }
    final cursor = c.request.uri.queryParameters['cursor'];
    final rows = await service.store.tablesDB.listRows(
      databaseId: '',
      tableId: service.postsTable,
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
        'posts': rows.rows.take(50).map((r) {
          final p = Map<String, dynamic>.from(r.data['published'] as Map);
          if (kind != 'faq') p.remove('body');
          return p;
        }).toList(),
        'next_cursor': rows.rows.length > 50 ? rows.rows[49].$id : null,
      },
    );
  } on CmsFailure catch (e) {
    return Response.json(
      statusCode: e.status,
      headers: {'Cache-Control': 'no-store'},
      body: {'error': e.message},
    );
  } on DatastoreException catch (e) {
    if (e.code == 404)
      return Response.json(
        statusCode: 404,
        headers: {'Cache-Control': 'no-store'},
        body: {'error': 'Content not found.'},
      );
    rethrow;
  }
}
