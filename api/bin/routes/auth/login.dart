/// POST /auth/login
///
/// Body:    { email, password }
/// Returns: { access_token, user }
/// Side:    Sets `astech_refresh` httpOnly cookie.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../lib/auth/jwt.dart';
import '../../lib/auth/password.dart';
import '../../lib/config.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/user_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  final email = body?['email'] as String?;
  final password = body?['password'] as String?;
  if (email == null || password == null) {
    return badRequest('email and password required');
  }

  final repo = UserRepo(context.read<Db>());
  final user = await repo.findByEmail(email);
  // Same response either way — don't disclose whether the email exists.
  if (user == null || !verifyPassword(password, user.passwordHash)) {
    return unauthorized('Invalid credentials');
  }

  final cfg = context.read<AppConfig>();
  final jwt = context.read<JwtService>();
  final accessToken = jwt.issueAccessToken(AccessClaims(
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
  ));

  final refreshPlain = generateRefreshTokenPlaintext();
  final refreshExp = DateTime.now().toUtc().add(cfg.refreshTokenTtl);
  await repo.insertRefreshToken(
    userId: user.id,
    plaintextToken: refreshPlain,
    expiresAt: refreshExp,
  );

  return Response.json(
    body: {
      'access_token': accessToken,
      'user': user.toAuthUser(),
    },
    headers: {
      'Set-Cookie': _refreshCookie(refreshPlain, cfg.refreshTokenTtl),
    },
  );
}

String _refreshCookie(String value, Duration ttl) {
  return 'astech_refresh=$value; '
      'Path=/auth; '
      'Max-Age=${ttl.inSeconds}; '
      'HttpOnly; '
      'SameSite=Strict; '
      'Secure'; // In dev over plain HTTP, browsers tolerate this on localhost.
}
