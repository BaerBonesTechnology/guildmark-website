import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/mailing_list_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.patch) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  final notes = body?['notes'] as String?;
  if (notes == null) return badRequest('notes is required');

  final repo = MailingListRepo(context.read<Db>());
  final entry = await repo.updateNotes(id: id, notes: notes);

  if (entry == null) return notFound('Subscriber not found');

  return Response.json(body: entry.toJson());
}
