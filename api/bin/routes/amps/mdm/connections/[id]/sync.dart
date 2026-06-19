import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/mdm_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  // Verify the connection exists and belongs to this company.
  final connections = await MdmRepo(
    context.read<Db>(),
  ).findByCompany(auth.companyId);
  final exists = connections.any((c) => c.id == id);
  if (!exists) return notFound('MDM connection $id not found');

  // TODO: Enqueue a sync job and return a run_id so the client can poll status.
  return Response.json(
    statusCode: 202,
    body: {
      'run_id': null,
      'message': 'Sync job enqueue not yet implemented; job worker needed',
    },
  );
}
