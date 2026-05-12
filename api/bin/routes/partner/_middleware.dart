/// Partner route middleware — injects PartnerPrincipal? for all /partner/* routes.
///
/// Auth routes (login, refresh, logout) operate with a null principal.
/// All other partner routes MUST call `context.read<PartnerPrincipal?>()` and
/// return 401 if it is null.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../lib/auth/jwt.dart';
import '../../lib/context.dart';

Handler middleware(Handler handler) {
  return (context) async {
    final principal = _extractPartnerPrincipal(context);
    return handler(context.provide<PartnerPrincipal?>(() => principal));
  };
}

PartnerPrincipal? _extractPartnerPrincipal(RequestContext context) {
  final header = context.request.headers['authorization'];
  if (header == null || !header.startsWith('Bearer ')) return null;
  final token  = header.substring('Bearer '.length);
  final claims = context.read<PartnerJwtService>().verifyAccessToken(token);
  if (claims == null) return null;
  return PartnerPrincipal.fromClaims(claims);
}
