/// DELETE /admin/users/:id — permanently remove a user account.
///
/// Deletes the user's company row, which cascades to: users, assets,
/// listings, subscriptions, orders, refresh_tokens, and any other
/// company-scoped data. This is a hard delete — use with care.
/// Admin-only.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.delete) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'DELETE only');
  }

  final db = context.read<Db>();

  // Delete the company that owns this user — cascades to everything.
  final result = await db.query(
    '''
    DELETE FROM companies
    WHERE id = (SELECT company_id FROM users WHERE id = @uid)
    RETURNING id::text
    ''',
    parameters: {'uid': id},
  );

  if (result.isEmpty) return notFound('User not found');

  return Response(statusCode: 204);
}
