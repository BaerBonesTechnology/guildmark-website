import 'package:dart_appwrite/dart_appwrite.dart' show Query;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // No SUM/AVG/JOIN in Appwrite — page active listings, stitch asset
  // quantities, reduce in Dart (POSTGRES_TO_APPWRITE.md §1c). Bounded by the
  // active-listing count, which is small pre-launch; revisit with a
  // precomputed stats row if this becomes hot.
  var totalListings = 0;
  var totalUnits = 0;
  var priceSum = 0; // cents, only listings that have a price
  var pricedCount = 0;
  var marketValueSum = 0; // cents

  String? cursor;
  while (true) {
    final page = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      queries: [
        Query.equal('status', 'active'),
        Query.limit(100),
        if (cursor != null) Query.cursorAfter(cursor),
      ],
    );
    if (page.rows.isEmpty) break;

    // Batch-fetch the joined assets for this page ($id IN list).
    final assetIds = page.rows
        .map((r) => r.data['asset_id'] as String)
        .toSet()
        .toList();
    final assets = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.assets,
      queries: [Query.equal(r'$id', assetIds), Query.limit(assetIds.length)],
    );
    final quantityByAsset = {
      for (final a in assets.rows) a.$id: (a.data['quantity'] as num?) ?? 1,
    };

    for (final row in page.rows) {
      final quantity = quantityByAsset[row.data['asset_id']];
      // INNER JOIN semantics: skip listings whose asset row is missing.
      if (quantity == null) continue;
      totalListings++;
      totalUnits += quantity.toInt();
      final priceCents = (row.data['listed_price_cents'] as num?)?.toInt();
      if (priceCents != null) {
        priceSum += priceCents;
        pricedCount++;
        marketValueSum += priceCents * quantity.toInt();
      }
    }

    if (page.rows.length < 100) break;
    cursor = page.rows.last.$id;
  }

  return Response.json(
    body: {
      'totalListings': totalListings,
      'totalUnits': totalUnits,
      'avgPricePerUnit': pricedCount == 0 ? 0.0 : priceSum / pricedCount / 100,
      'totalMarketValue': marketValueSum / 100,
    },
  );
}
