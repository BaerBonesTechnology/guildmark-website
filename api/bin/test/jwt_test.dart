import 'package:astech_api/auth/jwt.dart';
import 'package:test/test.dart';

void main() {
  group('JwtService', () {
    final svc = JwtService(
      accessSecret: 'test_secret_long_enough_for_hs256',
      accessTtl: const Duration(minutes: 15),
    );

    test('issues and verifies a token round-trip', () {
      final claims = AccessClaims(
        userId: 'u-1',
        companyId: 'c-1',
        role: 'admin',
      );
      final token = svc.issueAccessToken(claims);
      final verified = svc.verifyAccessToken(token);

      expect(verified, isNotNull);
      expect(verified!.userId, 'u-1');
      expect(verified.companyId, 'c-1');
      expect(verified.role, 'admin');
    });

    test('returns null for a tampered token', () {
      final token = svc.issueAccessToken(
        AccessClaims(userId: 'u', companyId: 'c', role: 'r'),
      );
      final tampered = '${token}xyz';
      expect(svc.verifyAccessToken(tampered), isNull);
    });
  });
}
