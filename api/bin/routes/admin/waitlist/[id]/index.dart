import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';
import '../../../../lib/repos/mailing_list_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.delete) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'DELETE only');
  }

  final repo = MailingListRepo(context.read<Db>());
  final deleted = await repo.delete(id);
  if (!deleted) return notFound('Subscriber not found');

  return Response(statusCode: 204);
}
