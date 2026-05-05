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
