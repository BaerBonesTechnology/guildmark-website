import 'package:dart_appwrite/dart_appwrite.dart' show Query;
import 'package:dart_appwrite/models.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final principal = context.read<PartnerPrincipal?>();
  if (principal == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // Was: status NOT IN ('complete','cancelled') OR completed_at > now()-30d.
  // NOT IN → equal(list) with the complementary statuses (Appwrite list =
  // IN); the recent-completion arm keeps just-finished jobs visible.
  final cutoff = DateTime.now()
      .toUtc()
      .subtract(const Duration(days: 30))
      .toIso8601String();

  // The Postgres query was unbounded — page explicitly (design doc §8).
  const pageSize = 100;
  final rows = <Row>[];
  var offset = 0;
  while (true) {
    final res = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.partnerServiceAssignments,
      queries: [
        Query.equal('partner_id', principal.partnerId),
        Query.or([
          Query.equal('status', [
            'available', 'claimed', 'wipe_in_progress', 'wipe_complete',
            'reimage_in_progress', 'reimage_complete', 'awaiting_cert',
            'cert_uploaded', 'shipped',
          ]),
          Query.greaterThan('completed_at', cutoff),
        ]),
        Query.orderDesc('claimed_at'),
        Query.limit(pageSize),
        Query.offset(offset),
      ],
    );
    rows.addAll(res.rows);
    if (res.rows.length < pageSize) break;
    offset += pageSize;
  }

  final items = rows.map((row) {
    final r = row.data;
    return {
      'id': row.$id,
      'order_ref': r['order_ref'].toString(),
      'buyer_name': (r['buyer_name'] as String?) ?? '',
      'buyer_city': (r['buyer_city'] as String?) ?? '',
      'service_type': r['service_type'].toString(),
      'item_count': (r['item_count'] as num?)?.toInt() ?? 0,
      'wipe_payout_cents': (r['wipe_payout_cents'] as num?)?.toInt() ?? 0,
      'reimage_payout_cents': (r['reimage_payout_cents'] as num?)?.toInt() ?? 0,
      'wipe_method': r['wipe_method'] as String?,
      'reimage_os': r['reimage_os'] as String?,
      'cert_url': r['cert_url'] as String?,
      'tracking_number': r['tracking_number'] as String?,
      'carrier': r['carrier'] as String?,
      'status': (r['status'] as String?) ?? 'available',
      'claimed_at': _ts(r['claimed_at']),
      'completed_at': _ts(r['completed_at']),
      'updated_at': _ts(row.$updatedAt),
    };
  }).toList();

  return Response.json(body: {'items': items});
}

/// Appwrite datetimes are ISO strings; the Postgres version serialized
/// DateTime.toString() — parse and re-stringify to keep the same format.
String? _ts(Object? iso) =>
    iso == null ? null : DateTime.parse(iso as String).toString();
