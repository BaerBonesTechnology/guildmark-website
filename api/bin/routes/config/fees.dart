import 'package:dart_frog/dart_frog.dart';

import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/config_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final cfg = await ConfigRepo(context.read<Db>()).get();
  return Response.json(body: cfg.toJson());
}
