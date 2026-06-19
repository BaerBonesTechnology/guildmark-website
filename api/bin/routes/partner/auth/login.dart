import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/partner_repo.dart';

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

  final repo = PartnerRepo(context.read<Db>());
  final partner = await repo.findByEmail(email);

  // Same vague error either way — never disclose whether the email exists.
  if (partner == null || !verifyPassword(password, partner.passwordHash)) {
    return unauthorized('Invalid credentials');
  }

  // Suspended partners cannot log in; pending partners CAN (they need to
  // see their dashboard even before GuildMark approves them).
  if (partner.status == 'suspended') {
    return jsonError(
      403,
      'ACCOUNT_SUSPENDED',
      'Your partner account has been suspended. Contact support.',
    );
  }

  final cfg = context.read<AppConfig>();
  final jwt = context.read<PartnerJwtService>();

  final accessToken = jwt.issueAccessToken(
    PartnerClaims(
      partnerId: partner.id,
      partnerCode: partner.partnerCode,
    ),
  );

  final refreshPlain = generateRefreshTokenPlaintext();
  final refreshExp = DateTime.now().toUtc().add(cfg.refreshTokenTtl);
  await repo.insertRefreshToken(
    partnerId: partner.id,
    plaintextToken: refreshPlain,
    expiresAt: refreshExp,
  );

  return Response.json(
    body: {
      'access_token': accessToken,
      'partner': partner.toAuthPartner(),
    },
    headers: {
      'Set-Cookie': _refreshCookie(refreshPlain, cfg.refreshTokenTtl),
    },
  );
}

String _refreshCookie(String value, Duration ttl) =>
    'partner_refresh=$value; '
    'Path=/partner/auth; '
    'Max-Age=${ttl.inSeconds}; '
    'HttpOnly; '
    'SameSite=Strict; '
    'Secure';
