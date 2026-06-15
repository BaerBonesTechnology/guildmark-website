/// POST /partner/auth/logout
///
/// Revokes the current partner refresh token (best-effort) and clears the
/// `partner_refresh` cookie.

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/partner_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final raw   = context.request.headers['cookie'];
  final token = _extract(raw, 'partner_refresh');
  if (token != null) {
    await PartnerRepo(context.read<Db>()).revokeRefreshToken(token);
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
