import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Handler middleware(Handler handler) {
  return handler
      .use(_errorMiddleware())
      .use(_corsMiddleware())
      .use(_authMiddleware());
}

Middleware _errorMiddleware() {
  return (handler) {
    return (context) async {
      try {
        return await handler(context);
      } catch (e, st) {
        stderr.writeln(
          '[error] ${context.request.method} '
          '${context.request.uri.path} — $e\n$st',
        );
        return serverError('An unexpected error occurred');
      }
    };
  };
}

Middleware _corsMiddleware() {
  return (handler) {
    return (context) async {
      final cfg = context.read<AppConfig>();
      final allowed = [
        cfg.corsOrigin,
        if (cfg.adminCorsOrigin != null) cfg.adminCorsOrigin!,
        if (cfg.partnerCorsOrigin != null) cfg.partnerCorsOrigin!,
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
