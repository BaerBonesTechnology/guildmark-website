/// JWT issue + verify. Access tokens are short-lived (15 min default);
/// refresh tokens are opaque random strings stored hashed in the DB and
/// delivered via httpOnly cookie.
library;

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

  /// Returns null on any failure — never leaks the underlying reason to
  /// callers, since that becomes a 401 either way.
  AccessClaims? verifyAccessToken(String token) {
    try {
      final jwt = JWT.verify(token, SecretKey(accessSecret));
      return AccessClaims.fromJson(jwt.payload as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }
}

/// Generate a cryptographically random refresh token. Returned plaintext is
/// sent to the client; the SHA-256 hash is what gets stored.
String generateRefreshTokenPlaintext({int byteLength = 48}) {
  final rng = Random.secure();
  final bytes = List<int>.generate(byteLength, (_) => rng.nextInt(256));
  return base64Url.encode(bytes).replaceAll('=', '');
}
