import 'dart:io';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/business_verification.dart';

Handler middleware(Handler handler) {
  return handler
      .use(_authMiddleware())
      .use(_errorMiddleware())
      .use(_corsMiddleware());
}

Middleware _errorMiddleware() {
  return (handler) {
    return (context) async {
      try {
        return await handler(context);
      } on SellerVerificationRequired {
        return jsonError(
          403,
          SellerVerificationRequired.code,
          SellerVerificationRequired.message,
        );
      } on FirebaseAuthFailure catch (e) {
        if (e.code != 'AUTH_UNAVAILABLE') {
          return unauthorized('Invalid credentials');
        }
        return jsonError(
          503,
          'AUTH_UNAVAILABLE',
          'Authentication temporarily unavailable',
        );
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
      final sessions = firebaseSessions(context);
      if (sessions != null &&
          context.request.method != HttpMethod.get &&
          context.request.method != HttpMethod.options) {
        final cfg = context.read<AppConfig>();
        final origin = context.request.headers['origin'];
        final allowed =
            [cfg.corsOrigin, cfg.adminCorsOrigin, cfg.partnerCorsOrigin]
                .whereType<String>()
                .expand((s) => s.split(','))
                .map((s) => s.trim())
                .toSet();
        if (origin != null && !allowed.contains(origin)) {
          return forbidden('Origin not allowed');
        }
      }
      final auth = await _extractPrincipal(context);
      final requestPath = context.request.uri.path;
      final path = requestPath.startsWith('/api/')
          ? requestPath.substring(4)
          : requestPath;
      if (auth != null && auth.audience != 'customer') {
        if (!path.startsWith('/admin/')) {
          return forbidden('Staff tokens cannot access customer routes');
        }
        const setupPaths = {
          '/admin/passkey/register/begin',
          '/admin/passkey/register/complete',
        };
        if (auth.audience == 'staff_setup' && !setupPaths.contains(path)) {
          return forbidden('Setup tokens may only register a passkey');
        }
      }
      return handler(context.provide<AuthPrincipal?>(() => auth));
    };
  };
}

Future<AuthPrincipal?> _extractPrincipal(RequestContext context) async {
  final header = context.request.headers['authorization'];
  if (header == null || !header.startsWith('Bearer ')) return null;
  final token = header.substring('Bearer '.length);
  final sessions = firebaseSessions(context);
  if (sessions != null) return sessions.principal(token);
  final claims = context.read<JwtService>().verifyAccessToken(token);
  if (claims == null) return null;
  return AuthPrincipal.fromClaims(claims);
}
