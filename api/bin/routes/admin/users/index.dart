import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final params = context.request.uri.queryParameters;
  final limit = (int.tryParse(params['limit'] ?? '50') ?? 50).clamp(1, 200);
  final offset = int.tryParse(params['offset'] ?? '0') ?? 0;
  final search = (params['q'] ?? '').trim();
  final plan = (params['plan'] ?? '').trim();

  final db = context.read<Db>();

  // Build a shared WHERE clause (reused for both the data query and the count).
  final conditions = <String>[];
  final baseParams = <String, dynamic>{};

  if (search.isNotEmpty) {
    conditions.add(
      '(u.email ILIKE @search OR u.full_name ILIKE @search OR c.name ILIKE @search)',
    );
    baseParams['search'] = '%$search%';
  }
  if (plan.isNotEmpty) {
    conditions.add('s.plan::text = @plan');
    baseParams['plan'] = plan;
  }

  final where = conditions.isEmpty ? '' : 'WHERE ${conditions.join(' AND ')}';

  final rows = await db.query(
    '''
    SELECT
      u.id::text,
      u.email::text,
      u.full_name,
      u.role::text,
      u.created_at,
      c.id::text  AS company_id,
      c.name      AS company_name,
      c.size_band,
      c.industry,
      COALESCE(s.plan::text,   'free')   AS plan,
      COALESCE(s.status::text, 'active') AS subscription_status
    FROM users u
    JOIN  companies     c ON c.id = u.company_id
    LEFT  JOIN subscriptions s ON s.company_id = c.id
    $where
    ORDER BY u.created_at DESC
    LIMIT @limit OFFSET @offset
    ''',
    parameters: {...baseParams, 'limit': limit, 'offset': offset},
  );

  final countRows = await db.query(
    '''
    SELECT COUNT(*)::int AS total
    FROM users u
    JOIN  companies     c ON c.id = u.company_id
    LEFT  JOIN subscriptions s ON s.company_id = c.id
    $where
    ''',
    parameters: baseParams,
  );

  final total = countRows.first.toColumnMap()['total'] as int? ?? 0;

  return Response.json(
    body: {
      'total': total,
      'limit': limit,
      'offset': offset,
      'users': rows.map((r) {
        final row = r.toColumnMap();
        return {
          'id': row['id'].toString(),
          'email': row['email'].toString(),
          'full_name': row['full_name'].toString(),
          'role': row['role'].toString(),
          'created_at': (row['created_at'] as DateTime).toIso8601String(),
          'company_id': row['company_id'].toString(),
          'company_name': row['company_name'].toString(),
          'size_band': row['size_band']?.toString(),
          'industry': row['industry']?.toString(),
          'plan': row['plan'].toString(),
          'subscription_status': row['subscription_status'].toString(),
        };
      }).toList(),
    },
  );
}
