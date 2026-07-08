import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/partner_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final raw = context.request.headers['cookie'];
  final token = _extract(raw, 'partner_refresh');
  if (token != null) {
    final aw = context.read<AppwriteService?>();
    // Logout must always succeed client-side; skip revocation if the
    // datastore is unavailable — the token expires on its own.
    if (aw != null) {
      await PartnerRepo(aw).revokeRefreshToken(token);
    }
  }

  return Response.json(
    body: {'ok': true},
    headers: {
      'Set-Cookie':
          'partner_refresh=; Path=/partner/auth; Max-Age=0; HttpOnly; SameSite=Strict; Secure',
    },
  );
}

String? _extract(String? cookieHeader, String name) {
  if (cookieHeader == null) return null;
  for (final part in cookieHeader.split(';')) {
    final kv = part.trim().split('=');
    if (kv.length == 2 && kv[0] == name) return kv[1];
  }
  return null;
}
