import 'dart:convert';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/repos/firestore/product_image_repo.dart';
import 'package:guildmark_api/services/cms.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext c) async {
  final db = c.read<FirebaseService?>()!;
  if (c.request.method == HttpMethod.get) {
    final cursor = c.request.uri.queryParameters['cursor'];
    final rows = await db.tablesDB.listRows(
      databaseId: '',
      tableId: 'cms_media',
      queries: [
        Query.orderDesc(r'$id'),
        Query.limit(51),
        if (cursor != null) Query.cursorAfter(cursor),
      ],
    );
    return Response.json(
      body: {
        'media': rows.rows
            .take(50)
            .map((r) => {'id': r.$id, ...r.data})
            .toList(),
        'next_cursor': rows.rows.length > 50 ? rows.rows[49].$id : null,
      },
    );
  }
  if (c.request.method != HttpMethod.post) return Response(statusCode: 405);
  final body = await boundedJson(c.request, maxBytes: 7100000);
  if (body is! Map ||
      body['base64'] is! String ||
      body['name'] is! String ||
      body['alt'] is! String)
    throw CmsFailure(400, 'Image, filename and alternative text required.');
  final name = (body['name'] as String).trim(),
      alt = (body['alt'] as String).trim();
  if (name.isEmpty || name.length > 160 || alt.isEmpty || alt.length > 300)
    throw CmsFailure(
      400,
      'Add a filename and image description (up to 300 characters).',
    );
  final bytes = base64Decode(body['base64'] as String);
  if (bytes.length > 5 * 1024 * 1024 || bytes.length < 12)
    throw CmsFailure(400, 'Choose a PNG, JPEG or WebP image up to 5 MB.');
  final png = [137, 80, 78, 71, 13, 10, 26, 10], jpeg = [255, 216, 255];
  bool starts(List<int> signature) => List.generate(
    signature.length,
    (i) => bytes[i] == signature[i],
  ).every((v) => v);
  final type = starts(png)
      ? 'image/png'
      : starts(jpeg)
      ? 'image/jpeg'
      : ascii.decode(bytes.sublist(0, 4), allowInvalid: true) == 'RIFF' &&
            ascii.decode(bytes.sublist(8, 12), allowInvalid: true) == 'WEBP'
      ? 'image/webp'
      : null;
  if (type == null)
    throw CmsFailure(
      400,
      'Only PNG, JPEG and WebP images are supported. SVG and HTML are not accepted.',
    );
  final image = await ProductImageRepo(
    db,
    prefix: 'cms-media',
  ).upload(bytes: bytes, filename: name, contentType: type);
  await Cms(db).authorize(c.read<AuthPrincipal?>());
  final row = await db.tablesDB.createRow(
    databaseId: '',
    tableId: 'cms_media',
    rowId: image.fileId,
    data: {
      'name': name,
      'alt': alt,
      'url': image.url,
      'content_type': type,
      'size': bytes.length,
      'uploaded_by': c.read<AuthPrincipal?>()!.userId,
      'created_at': DateTime.now().toUtc().toIso8601String(),
    },
  );
  return Response.json(statusCode: 201, body: {'id': row.$id, ...row.data});
}
