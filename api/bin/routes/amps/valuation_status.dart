import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/models/json_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final db = context.read<Db>();
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

  return Response.json(
    body: {
      'status': row['valuation_status'] as String? ?? 'idle',
      'asset_count': numToIntOrNull(row['valuation_asset_count']) ?? 0,
      'started_at': (row['valuation_started_at'] as DateTime?)
          ?.toIso8601String(),
    },
  );
}
