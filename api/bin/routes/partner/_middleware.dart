import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/context.dart';

Handler middleware(Handler handler) {
  return (context) async {
    final principal = _extractPartnerPrincipal(context);
    return handler(context.provide<PartnerPrincipal?>(() => principal));
  };
}

PartnerPrincipal? _extractPartnerPrincipal(RequestContext context) {
  final header = context.request.headers['authorization'];
  if (header == null || !header.startsWith('Bearer ')) return null;
  final token = header.substring('Bearer '.length);
  final claims = context.read<PartnerJwtService>().verifyAccessToken(token);
  if (claims == null) return null;
  return PartnerPrincipal.fromClaims(claims);
}
