import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // The Postgres query was unbounded — page explicitly (design doc §8).
  const pageSize = 100;
  final rows = <Row>[];
  var offset = 0;
  while (true) {
    final res = await db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.partnerServiceAssignments,
      queries: [
        Query.equal('status', 'available'),
        Query.isNull('partner_id'),
        Query.orderDesc(r'$createdAt'),
        Query.limit(pageSize),
        Query.offset(offset),
      ],
    );
    rows.addAll(res.rows);
    if (res.rows.length < pageSize) break;
    offset += pageSize;
  }

  final items = await Future.wait(
    rows.map((row) async {
      final r = row.data;
      bool imagingOnly = r['service_type'] == 'reimage_only';
      if (r['order_id'] is String) {
        try {
          final order = await db.getRow(
            databaseId: '',
            tableId: 'orders',
            rowId: r['order_id'] as String,
          );
          imagingOnly =
              imagingOnly ||
              order.data['service_requirement'] == 'reimage_only';
        } on DatastoreException catch (e) {
          if (e.code != 404) rethrow;
        }
      }

      return {
        'id': row.$id,
        'order_ref': r['order_ref'] as String? ?? 'Service ${row.$id}',
        'buyer_name': (r['buyer_name'] as String?) ?? '',
        'buyer_city': (r['buyer_city'] as String?) ?? '',
        'service_type': imagingOnly
            ? 'reimage_only'
            : r['service_type'] as String? ?? 'wipe_and_reimage',
        'item_count': (r['item_count'] as num?)?.toInt() ?? 0,
        'wipe_payout_cents': imagingOnly
            ? 0
            : (r['wipe_payout_cents'] as num?)?.toInt() ?? 0,
        'reimage_payout_cents':
            (r['reimage_payout_cents'] as num?)?.toInt() ?? 0,
        'created_at': DateTime.parse(row.$createdAt).toString(),
      };
    }).toList(),
  );

  return Response.json(body: {'items': items});
}
