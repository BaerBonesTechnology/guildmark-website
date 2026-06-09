/// POST /amps/mdm/connections/:id/sync — trigger an immediate sync run.
///
/// In production this should enqueue a background job (e.g. a Postgres-backed
/// job queue or a message broker message) so the HTTP response returns
/// quickly. The job worker is responsible for:
///   1. Decrypting credentials from mdm_connections.credentials_cipher
///   2. Calling the MDM API to pull device records
///   3. Upserting records into the assets table
///   4. Calling MdmRepo.recordSyncResult with the outcome
///
/// TODO: Replace the stub response with a real job-enqueue call once the
/// worker infrastructure is in place.

import 'package:dart_frog/dart_frog.dart';

import '../../../../../lib/context.dart';
import '../../../../../lib/db/pool.dart';
import '../../../../../lib/http_helpers.dart';
import '../../../../../lib/repos/mdm_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  // Verify the connection exists and belongs to this company.
  final connections = await MdmRepo(context.read<Db>()).findByCompany(auth.companyId);
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
