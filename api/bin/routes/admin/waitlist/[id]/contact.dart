import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';
import '../../../../lib/repos/mailing_list_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  // Body is optional — some callers send no payload when there's no note.
  Map<String, dynamic>? body;
  try {
    body = await context.request.json() as Map<String, dynamic>?;
  } catch (_) {
    body = null;
  }
  final notes = body?['notes'] as String?;

  final repo = MailingListRepo(context.read<Db>());
  final entry = await repo.markContacted(id: id, notes: notes);

  if (entry == null) return notFound('Subscriber not found');

  return Response.json(body: entry.toJson());
}
