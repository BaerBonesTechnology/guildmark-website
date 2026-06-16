/// Request-scoped context — auth principal, DB handle, ML client.
///
/// Dart Frog providers attach these to `RequestContext`; route handlers read
/// them via `context.read<T>()`.
library;

import 'auth/jwt.dart';

class AuthPrincipal {
  AuthPrincipal({
    required this.userId,
    required this.companyId,
    required this.role,
  });

  factory AuthPrincipal.fromClaims(AccessClaims c) => AuthPrincipal(
        userId: c.userId,
        companyId: c.companyId,
        role: c.role,
      );

  final String userId;
  final String companyId;
  final String role;
}

/// Injected into all /partner/* requests. Null when no valid partner JWT is
/// present — auth routes use the null case to issue a new token; protected
/// routes return 401 when this is null.
class PartnerPrincipal {
  PartnerPrincipal({required this.partnerId, required this.partnerCode});

  factory PartnerPrincipal.fromClaims(PartnerClaims c) => PartnerPrincipal(
        partnerId:   c.partnerId,
        partnerCode: c.partnerCode,
      );

  final String partnerId;
  final String partnerCode;
}
