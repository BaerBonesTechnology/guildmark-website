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

class PartnerPrincipal {
  PartnerPrincipal({required this.partnerId, required this.partnerCode});

  factory PartnerPrincipal.fromClaims(PartnerClaims c) => PartnerPrincipal(
    partnerId: c.partnerId,
    partnerCode: c.partnerCode,
  );

  final String partnerId;
  final String partnerCode;
}
