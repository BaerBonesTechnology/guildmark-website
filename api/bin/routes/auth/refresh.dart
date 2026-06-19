import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/user_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final oldToken = _readRefreshCookie(context);
  if (oldToken == null) return unauthorized('No refresh token');

  final cfg = context.read<AppConfig>();
  final repo = UserRepo(context.read<Db>());
  final newPlain = generateRefreshTokenPlaintext();
  final newExpiresAt = DateTime.now().toUtc().add(cfg.refreshTokenTtl);

  final user = await repo.rotateRefreshToken(
    plaintextToken: oldToken,
    newPlaintextToken: newPlain,
    newExpiresAt: newExpiresAt,
  );
  if (user == null) return unauthorized('Refresh token invalid or expired');

  final accessToken = context.read<JwtService>().issueAccessToken(
    AccessClaims(
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    ),
  );

  return Response.json(
    body: {
      'access_token': accessToken,
      'user': user.toAuthUser(),
    },
    headers: {
      'Set-Cookie':
          'astech_refresh=$newPlain; Path=/auth; Max-Age=${cfg.refreshTokenTtl.inSeconds}; HttpOnly; SameSite=Strict; Secure',
    },
  );
}

String? _readRefreshCookie(RequestContext context) {
  final raw = context.request.headers['cookie'];
  if (raw == null) return null;
  for (final part in raw.split(';')) {
    final kv = part.trim().split('=');
    if (kv.length == 2 && kv[0] == 'astech_refresh') return kv[1];
  }
  return null;
}
