import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/mailing_list_repo.dart';

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

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  final repo = MailingListRepo(aw);
  final entry = await repo.markContacted(id: id, notes: notes);

  if (entry == null) return notFound('Subscriber not found');

  return Response.json(body: entry.toJson());
}
