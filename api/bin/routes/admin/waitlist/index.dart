/// GET  /admin/waitlist        — paginated subscriber list
/// POST /admin/waitlist        — (reserved for future bulk actions)
///
/// Admin-only. Requires a valid JWT with role = 'admin'.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/mailing_list_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final params = context.request.uri.queryParameters;
  final limit = int.tryParse(params['limit'] ?? '50') ?? 50;
  final offset = int.tryParse(params['offset'] ?? '0') ?? 0;
  final uncontactedOnly = params['uncontacted'] == 'true';
  final source = params['source']; // e.g. 'partner', 'waitlist', 'contact'

  final repo = MailingListRepo(context.read<Db>());
  final entries = await repo.list(
    limit: limit.clamp(1, 200),
    offset: offset,
    uncontactedOnly: uncontactedOnly,
    source: source,
  );
  final total = await repo.count(source: source);

  return Response.json(body: {
    'total': total,
    'limit': limit,
    'offset': offset,
    'entries': entries.map((e) => e.toJson()).toList(),
  });
}
