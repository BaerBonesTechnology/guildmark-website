/// DELETE /amps/mdm/connections/:id — disconnect an MDM source.
///
/// TODO: Revoke OAuth tokens / API keys upstream before deleting the row so
/// the credentials don't remain valid after the user disconnects.

import 'package:dart_frog/dart_frog.dart';

import '../../../../../lib/context.dart';
import '../../../../../lib/db/pool.dart';
import '../../../../../lib/http_helpers.dart';
import '../../../../../lib/repos/mdm_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.delete) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'DELETE only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  await MdmRepo(context.read<Db>()).delete(id: id, companyId: auth.companyId);
  return Response(statusCode: 204);
}
