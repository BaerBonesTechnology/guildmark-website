/// POST /auth/signup
///
/// Body:    { email, password, full_name, company_name, company_size, industry }
/// Returns: { access_token, user }
/// Side:    Sets `astech_refresh` httpOnly cookie.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../lib/auth/jwt.dart';
import '../../lib/auth/password.dart';
import '../../lib/config.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/subscription_repo.dart';
import '../../lib/repos/user_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  if (body == null) return badRequest('Missing body');

  final email = body['email'] as String?;
  final password = body['password'] as String?;
  final fullName = body['full_name'] as String?;
  final companyName = body['company_name'] as String?;
  final companySize = body['company_size'] as String?;
  final industry = body['industry'] as String?;

  if ([email, password, fullName, companyName, companySize, industry]
      .any((v) => v == null || v!.isEmpty)) {
    return badRequest('All fields are required');
  }
  if (password!.length < 8) {
    return badRequest('Password must be at least 8 characters',
        code: 'WEAK_PASSWORD');
  }

  final db   = context.read<Db>();
  final repo = UserRepo(db);
  if (await repo.findByEmail(email!) != null) {
    return jsonError(
        409, 'EMAIL_TAKEN', 'An account with this email already exists');
  }

  final user = await repo.create(
    email: email,
    passwordHash: hashPassword(password),
    fullName: fullName!,
    companyName: companyName!,
    companySize: companySize!,
    industry: industry!,
  );

  // Every new company starts on the free tier.
  await SubscriptionRepo(db).createFree(user.companyId);

  final cfg = context.read<AppConfig>();
  final jwt = context.read<JwtService>();
  final accessToken = jwt.issueAccessToken(AccessClaims(
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
  ));

  final refreshPlain = generateRefreshTokenPlaintext();
  await repo.insertRefreshToken(
    userId: user.id,
    plaintextToken: refreshPlain,
    expiresAt: DateTime.now().toUtc().add(cfg.refreshTokenTtl),
  );

  return Response.json(
    statusCode: 201,
    body: {
      'access_token': accessToken,
      'user': user.toAuthUser(),
    },
    headers: {
      'Set-Cookie':
          'astech_refresh=$refreshPlain; Path=/auth; Max-Age=${cfg.refreshTokenTtl.inSeconds}; HttpOnly; SameSite=Strict; Secure',
    },
  );
}
