/// GET /amps/valuation-status — poll the state of the background valuation job.
///
/// Returns:
///   {
///     "status":      "idle" | "running" | "complete" | "failed",
///     "asset_count": <int>,     // number of assets in the current/last run
///     "started_at":  <ISO8601 | null>
///   }
///
/// The frontend polls this at 3-second intervals while status == "running"
/// and dismisses its loading banner once "complete" or "failed" is received.

import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/models/json_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final db   = context.read<Db>();
  final rows = await db.query(
    '''
    SELECT valuation_status, valuation_started_at, valuation_asset_count
    FROM companies
    WHERE id = @cid::uuid
    LIMIT 1
    ''',
    parameters: {'cid': auth.companyId},
  );

  if (rows.isEmpty) return notFound('Company not found');

  final row = rows.first.toColumnMap();

  return Response.json(body: {
    'status':      row['valuation_status'] as String? ?? 'idle',
    'asset_count': numToIntOrNull(row['valuation_asset_count']) ?? 0,
    'started_at':  (row['valuation_started_at'] as DateTime?)?.toIso8601String(),
  });
}
