import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';

import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/context.dart';

Handler middleware(Handler handler) {
  return (context) async {
    final principal = await _extractPartnerPrincipal(context);
    return handler(context.provide<PartnerPrincipal?>(() => principal));
  };
}

Future<PartnerPrincipal?> _extractPartnerPrincipal(
  RequestContext context,
) async {
  final header = context.request.headers['authorization'];
  if (header == null || !header.startsWith('Bearer ')) return null;
  final token = header.substring('Bearer '.length);
  final sessions = firebaseSessions(context);
  if (sessions != null) return sessions.partner(token);
  final claims = context.read<PartnerJwtService>().verifyAccessToken(token);
  if (claims == null) return null;
  return PartnerPrincipal.fromClaims(claims);
}
