import 'package:dart_frog/dart_frog.dart';

import '../../../lib/auth/jwt.dart';
import '../../../lib/config.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/partner_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final oldToken = _readRefreshCookie(context);
  if (oldToken == null) return unauthorized('No refresh token');

  final cfg = context.read<AppConfig>();
  final repo = PartnerRepo(context.read<Db>());
  final newPlain = generateRefreshTokenPlaintext();
  final newExpires = DateTime.now().toUtc().add(cfg.refreshTokenTtl);

  final partner = await repo.rotateRefreshToken(
    plaintextToken: oldToken,
    newPlaintextToken: newPlain,
    newExpiresAt: newExpires,
  );
  if (partner == null) return unauthorized('Refresh token invalid or expired');

  final accessToken = context.read<PartnerJwtService>().issueAccessToken(
    PartnerClaims(
      partnerId: partner.id,
      partnerCode: partner.partnerCode,
    ),
  );

  return Response.json(
    body: {
      'access_token': accessToken,
      'partner': partner.toAuthPartner(),
    },
    headers: {
      'Set-Cookie':
          'partner_refresh=$newPlain; Path=/partner/auth; '
          'Max-Age=${cfg.refreshTokenTtl.inSeconds}; '
          'HttpOnly; SameSite=Strict; Secure',
    },
  );
}

String? _readRefreshCookie(RequestContext context) {
  final raw = context.request.headers['cookie'];
  if (raw == null) return null;
  for (final part in raw.split(';')) {
    final kv = part.trim().split('=');
    if (kv.length == 2 && kv[0] == 'partner_refresh') return kv[1];
  }
  return null;
}
