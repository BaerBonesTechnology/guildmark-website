import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/remote_config.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final remote = context.read<FirebaseRemoteConfig?>();
  return Response.json(
    headers: {'Cache-Control': 'no-store'},
    body: {
      'flags': remote == null
          ? {'launch_enabled': false, 'amps_enabled': false}
          : await remote.flags(),
    },
  );
}
