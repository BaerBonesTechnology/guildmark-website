library;

import 'package:dart_frog/dart_frog.dart';

import '../../lib/auth/jwt.dart';
import '../../lib/config.dart';
import '../../lib/crypto_utils.dart';
import '../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final cfg = context.read<AppConfig>();
  if (cfg.adminAuthUser == null || cfg.adminAuthPass == null) {
    return jsonError(503, 'ADMIN_AUTH_NOT_CONFIGURED', 'Admin credentials are not configured');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  final username = (body?['username'] as String?)?.trim();
  final password = body?['password'] as String?;

  if (username == null || username.isEmpty || password == null || password.isEmpty) {
    return badRequest('username and password are required');
  }

  // Use constant-time comparison to prevent timing-based credential inference.
  final userMatch = constantTimeEquals(username, cfg.adminAuthUser!);
  final passMatch = constantTimeEquals(password, cfg.adminAuthPass!);
  if (!userMatch || !passMatch) {
    return unauthorized('Invalid credentials');
  }

  final token = context.read<JwtService>().issueAccessToken(
    AccessClaims(userId: 'admin', companyId: 'admin', role: 'admin'),
  );

  return Response.json(body: {'access_token': token});
}
