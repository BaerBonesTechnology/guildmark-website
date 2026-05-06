/// Global middleware — CORS + JSON content type + auth principal injection.
///
/// Routes that require auth read `context.read<AuthPrincipal?>()` and reject
/// nulls themselves (so optional-auth endpoints like the public marketplace
/// can opt in).
library;

import 'package:dart_frog/dart_frog.dart';

import '../lib/auth/jwt.dart';
import '../lib/config.dart';
import '../lib/context.dart';

Handler middleware(Handler handler) {
  return handler.use(_corsMiddleware()).use(_authMiddleware());
}

Middleware _corsMiddleware() {
  return (handler) {
    return (context) async {
      final cfg = context.read<AppConfig>();
      final allowed = [
        cfg.corsOrigin,
        if (cfg.adminCorsOrigin != null) cfg.adminCorsOrigin!,
      ].join(',');
      final origin = _resolveOrigin(
        context.request.headers['origin'] ?? '',
        allowed,
      );
      if (context.request.method == HttpMethod.options) {
        return Response(headers: _corsHeaders(origin));
      }
      final response = await handler(context);
      return response.copyWith(
        headers: {...response.headers, ..._corsHeaders(origin)},
      );
    };
  };
}

String _resolveOrigin(String requestOrigin, String allowed) {
  final origins = allowed.split(',').map((s) => s.trim()).toSet();
  if (origins.contains('*') || origins.contains(requestOrigin)) {
    return requestOrigin.isEmpty ? '*' : requestOrigin;
  }
  return origins.first;
}

Map<String, String> _corsHeaders(String origin) => {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Origin',
    };

Middleware _authMiddleware() {
  return (handler) {
    return (context) async {
      final auth = _extractPrincipal(context);
      return handler(context.provide<AuthPrincipal?>(() => auth));
    };
  };
}

AuthPrincipal? _extractPrincipal(RequestContext context) {
  final header = context.request.headers['authorization'];
  if (header == null || !header.startsWith('Bearer ')) return null;
  final token = header.substring('Bearer '.length);
  final claims = context.read<JwtService>().verifyAccessToken(token);
  if (claims == null) return null;
  return AuthPrincipal.fromClaims(claims);
}
