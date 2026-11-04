import 'dart:io';

import 'package:dart_frog/dart_frog.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';

import '../routes/_middleware.dart' as root;
import '../routes/admin/config/index.dart' as config;
import '../routes/admin/employees/index.dart' as employees;
import '../routes/admin/orders/expire_inspections.dart' as expiry;
import '../routes/admin/users/index.dart' as users;

class MockConfig extends Mock implements AppConfig {}

Future<http.Response> send(
  Handler handler,
  String method,
  Uri uri, {
  Map<String, String>? headers,
}) async {
  final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
  final client = http.Client();
  try {
    final request = http.Request(
      method,
      uri.replace(host: '127.0.0.1', port: server.port),
    );
    if (headers != null) request.headers.addAll(headers);
    return await http.Response.fromStream(await client.send(request));
  } finally {
    client.close();
    await server.close(force: true);
  }
}

void main() {
  final jwt = JwtService(
    accessSecret: 'security-regression-test-secret',
    accessTtl: const Duration(minutes: 15),
  );
  final routes = <String, Handler>{
    'pricing': config.onRequest,
    'global users': users.onRequest,
    'employees': employees.onRequest,
    'inspection expiry': expiry.onRequest,
  };
  for (final entry in routes.entries) {
    for (final audience in ['customer', 'staff_setup', 'staff']) {
      test(
        '${entry.key} rejects $audience without staff admin privileges',
        () async {
          final principal = AuthPrincipal.fromClaims(
            AccessClaims(
              userId: 'user',
              companyId: 'devdash',
              role: audience == 'staff' ? 'support' : 'admin',
              audience: audience,
            ),
          );
          final handler = entry.value.use(
            provider<AuthPrincipal?>((_) => principal),
          );
          final response = await send(
            handler,
            entry.key == 'inspection expiry' ? 'POST' : 'GET',
            Uri.parse('http://localhost/admin/test'),
          );
          expect(response.statusCode, 403);
        },
      );
    }
    test('${entry.key} permits staff admin past authorization', () async {
      final handler = entry.value
          .use(
            provider<AuthPrincipal?>(
              (_) => AuthPrincipal(
                userId: 'employee',
                companyId: 'devdash',
                role: 'admin',
                audience: 'staff',
              ),
            ),
          )
          .use(provider<FirebaseService?>((_) => null));
      final response = await send(
        handler,
        entry.key == 'inspection expiry' ? 'POST' : 'GET',
        Uri.parse('http://localhost/admin/test'),
      );
      // Expiry checks the method first; the others check the datastore first.
      expect(response.statusCode, 503);
    });
  }
  test('legacy and unknown-audience tokens fail closed', () {
    for (final audience in [null, 'unknown', 'prt']) {
      final token = JWT({
        'sub': 'user',
        'company_id': 'devdash',
        'role': 'admin',
        'aud': ?audience,
      }).sign(SecretKey(jwt.accessSecret));
      expect(jwt.verifyAccessToken(token), isNull);
    }
  });
  test(
    'customer token remains customer through real authentication middleware',
    () async {
      final token = jwt.issueAccessToken(
        AccessClaims(userId: 'owner', companyId: 'company', role: 'admin'),
      );
      final configuration = MockConfig();
      when(() => configuration.corsOrigin).thenReturn('http://localhost');
      when(() => configuration.adminCorsOrigin).thenReturn(null);
      when(() => configuration.partnerCorsOrigin).thenReturn(null);
      final handler = root
          .middleware(config.onRequest)
          .use(provider<JwtService>((_) => jwt))
          .use(provider<AppConfig>((_) => configuration));
      final response = await send(
        handler,
        'GET',
        Uri.parse('http://localhost/admin/config'),
        headers: {'authorization': 'Bearer $token'},
      );
      expect(response.statusCode, 403);
    },
  );
  for (final audience in ['staff', 'staff_setup']) {
    test(
      '$audience cannot access customer routes through middleware',
      () async {
        final token = jwt.issueAccessToken(
          AccessClaims(
            userId: 'employee',
            companyId: 'devdash',
            role: 'admin',
            audience: audience,
          ),
        );
        final configuration = MockConfig();
        when(() => configuration.corsOrigin).thenReturn('http://localhost');
        when(() => configuration.adminCorsOrigin).thenReturn(null);
        when(() => configuration.partnerCorsOrigin).thenReturn(null);
        final handler = root
            .middleware((_) => Response.json(body: {'ok': true}))
            .use(provider<JwtService>((_) => jwt))
            .use(provider<AppConfig>((_) => configuration));
        final response = await send(
          handler,
          'GET',
          Uri.parse('http://localhost/orders'),
          headers: {'authorization': 'Bearer $token'},
        );
        expect(response.statusCode, 403);
      },
    );
  }
  test('staff and setup audiences survive signed round trips', () {
    for (final audience in ['staff', 'staff_setup']) {
      final token = jwt.issueAccessToken(
        AccessClaims(
          userId: 'employee',
          companyId: 'devdash',
          role: 'admin',
          audience: audience,
        ),
      );
      expect(jwt.verifyAccessToken(token)!.audience, audience);
    }
  });
}
