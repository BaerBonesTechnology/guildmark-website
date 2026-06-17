import 'dart:convert';
import 'dart:math';

import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

class AccessClaims {
  AccessClaims({
    required this.userId,
    required this.companyId,
    required this.role,
  });

  final String userId;
  final String companyId;
  final String role;

  Map<String, dynamic> toJson() => {
    'sub': userId,
    'company_id': companyId,
    'role': role,
  };

  static AccessClaims fromJson(Map<String, dynamic> json) => AccessClaims(
    userId: json['sub'] as String,
    companyId: json['company_id'] as String,
    role: json['role'] as String,
  );
}

class JwtService {
  JwtService({required this.accessSecret, required this.accessTtl});

  final String accessSecret;
  final Duration accessTtl;

  String issueAccessToken(AccessClaims claims) {
    final jwt = JWT(claims.toJson());
    return jwt.sign(
      SecretKey(accessSecret),
      expiresIn: accessTtl,
    );
  }

  AccessClaims? verifyAccessToken(String token) {
    try {
      final jwt = JWT.verify(token, SecretKey(accessSecret));
      return AccessClaims.fromJson(jwt.payload as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }
}

String generateRefreshTokenPlaintext({int byteLength = 48}) {
  final rng = Random.secure();
  final bytes = List<int>.generate(byteLength, (_) => rng.nextInt(256));
  return base64Url.encode(bytes).replaceAll('=', '');
}

// ---------------------------------------------------------------------------
// Partner JWT — separate claims type + service so partner tokens can never be
// used against main-app endpoints (and vice versa). The `iss: "prt"` claim
// provides an additional guard beyond the structural type difference.
// ---------------------------------------------------------------------------

class PartnerClaims {
  PartnerClaims({required this.partnerId, required this.partnerCode});

  final String partnerId;
  final String partnerCode;

  Map<String, dynamic> toJson() => {
    'sub': partnerId,
    'partner_code': partnerCode,
    'iss': 'prt',
  };

  static PartnerClaims fromJson(Map<String, dynamic> json) => PartnerClaims(
    partnerId: json['sub'] as String,
    partnerCode: json['partner_code'] as String,
  );
}

class PartnerJwtService {
  PartnerJwtService({required this.accessSecret, required this.accessTtl});

  final String accessSecret;
  final Duration accessTtl;

  String issueAccessToken(PartnerClaims claims) {
    final jwt = JWT(claims.toJson());
    return jwt.sign(SecretKey(accessSecret), expiresIn: accessTtl);
  }

  PartnerClaims? verifyAccessToken(String token) {
    try {
      final jwt = JWT.verify(token, SecretKey(accessSecret));
      final payload = jwt.payload as Map<String, dynamic>;
      // Reject tokens not issued by the partner auth service.
      if (payload['iss'] != 'prt') return null;
      return PartnerClaims.fromJson(payload);
    } catch (_) {
      return null;
    }
  }
}
