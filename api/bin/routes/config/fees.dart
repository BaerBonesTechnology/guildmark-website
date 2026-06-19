import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/config_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final cfg = await ConfigRepo(context.read<Db>()).get();
  return Response.json(body: cfg.toJson());
}
