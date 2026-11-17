import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/auth/firebase_routes.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/firestore/user_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (firebaseSessions(context) != null) {
    return firebaseAuthRoute(context, 'refresh');
  }
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final oldToken = _readRefreshCookie(context);
  if (oldToken == null) return unauthorized('No refresh token');

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final cfg = context.read<AppConfig>();
  final repo = UserRepo(aw);
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
          'astech_refresh=$newPlain; Path=${cfg.publicApiPrefix}/auth; Max-Age=${cfg.refreshTokenTtl.inSeconds}; HttpOnly; SameSite=Strict; Secure',
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
