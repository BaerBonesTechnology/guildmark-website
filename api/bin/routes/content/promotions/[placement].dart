import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';

Future<Response> onRequest(RequestContext c, String placement) async {
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  if (!Cms.placements.contains(placement)) return Response(statusCode: 404);
  final db = c.read<FirebaseService?>();
  if (db == null) return Response(statusCode: 503);
  final candidates = <Map<String, dynamic>>[];
  String? cursor;
  final now = DateTime.now().toUtc();
  do {
    final rows = await db.tablesDB.listRows(
      databaseId: '',
      tableId: 'cms_promotions',
      queries: [
        Query.equal('published_visible', true),
        Query.orderAsc(r'$id'),
        Query.limit(100),
        if (cursor != null) Query.cursorAfter(cursor),
      ],
    );
    for (final row in rows.rows) {
      final raw = row.data['published'];
      if (raw is! Map) continue;
      final p = Map<String, dynamic>.from(raw);
      if (p['placement'] == placement && Cms.promotionActive(p, now))
        candidates.add(p);
    }
    cursor = rows.rows.length == 100 ? rows.rows.last.$id : null;
  } while (cursor != null);
  candidates.sort((a, b) {
    final rank = (int.tryParse(b['priority'] as String? ?? '') ?? 0).compareTo(
      int.tryParse(a['priority'] as String? ?? '') ?? 0,
    );
    return rank != 0 ? rank : (a['id'] as String).compareTo(b['id'] as String);
  });
  final selected = candidates.isEmpty ? null : candidates.first;
  return Response.json(
    headers: {'Cache-Control': 'no-store'},
    body: {
      'promotion': selected == null
          ? null
          : {
              for (final key in [
                'id',
                'title',
                'excerpt',
                'cover_url',
                'cover_alt',
                'placement',
                'cta_label',
                'target_url',
                'disclosure',
                'sponsor',
              ])
                key: selected[key],
            },
    },
  );
}
