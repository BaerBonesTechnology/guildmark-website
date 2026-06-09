/// GET /marketplace/stats
///
/// Public endpoint — no auth required.
/// Returns aggregate stats across all active marketplace listings:
///   totalListings    — count of active listing rows
///   totalUnits       — sum of asset quantities across active listings
///   avgPricePerUnit  — average listed_price where price is set
///   totalMarketValue — sum of (listed_price * quantity) across active listings

import 'package:dart_frog/dart_frog.dart';

import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/models/json_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final db = context.read<Db>();

  final result = await db.query('''
    SELECT
      COUNT(*)::int                                           AS total_listings,
      COALESCE(SUM(a.quantity), 0)::bigint                   AS total_units,
      COALESCE(AVG(l.listed_price), 0)::numeric              AS avg_price_per_unit,
      COALESCE(SUM(l.listed_price * a.quantity), 0)::numeric AS total_market_value
    FROM listings l
    JOIN assets a ON a.id = l.asset_id
    WHERE l.status = \'active\'
  ''');

  final row = result.first.toColumnMap();

  return Response.json(body: {
    'totalListings':    numToIntOrNull(row['total_listings'])       ?? 0,
    'totalUnits':       numToIntOrNull(row['total_units'])          ?? 0,
    'avgPricePerUnit':  numToDoubleOrNull(row['avg_price_per_unit']) ?? 0.0,
    'totalMarketValue': numToDoubleOrNull(row['total_market_value']) ?? 0.0,
  });
}
