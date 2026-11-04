import 'dart:convert';
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_routing.dart';
import 'package:guildmark_api/services/square_service.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';
import '../routes/_middleware.dart' as middleware;
import '../routes/admin/auth.dart' as staff;
import '../routes/admin/config/index.dart' as pricing;
import '../routes/auth/login.dart' as login;
import '../routes/auth/refresh.dart' as refresh;
import '../routes/auth/signup.dart' as signup;

class MockConfig extends Mock implements AppConfig {}

void main() {
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  test(
    'real signup, refresh rotation, staff login, and prefixed authorization',
    () async {
      final service = FirebaseService(
        projectId: 'demo-guildmark',
        emulatorHost: host,
      );
      final config = MockConfig();
      when(() => config.corsOrigin).thenReturn('http://localhost');
      when(() => config.adminCorsOrigin).thenReturn(null);
      when(() => config.partnerCorsOrigin).thenReturn(null);
      when(() => config.refreshTokenTtl).thenReturn(const Duration(days: 7));
      when(() => config.publicApiPrefix).thenReturn('/api');
      when(() => config.webauthnRpId).thenReturn(null);
      when(() => config.adminAuthUser).thenReturn(null);
      when(() => config.adminAuthPass).thenReturn(null);
      final jwt = JwtService(
        accessSecret: 'local-integration-only-secret',
        accessTtl: const Duration(minutes: 15),
      );
      final routes = Router()
        ..post('/auth/signup', signup.onRequest)
        ..post('/auth/login', login.onRequest)
        ..post('/auth/refresh', refresh.onRequest)
        ..post('/admin/auth', staff.onRequest)
        ..get('/admin/config', pricing.onRequest);
      final handler = apiRouter(middleware.middleware(routes.call))
          .use(provider<AppConfig>((_) => config))
          .use(provider<JwtService>((_) => jwt))
          .use(provider<FirebaseService?>((_) => service))
          .use(provider<SquareService?>((_) => null));
      final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
      final client = http.Client();
      final base = 'http://127.0.0.1:${server.port}/api';
      final suffix = ID.unique();
      const password = 'local-test-password-only';
      try {
        final registered = await client.post(
          Uri.parse('$base/auth/signup'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': '$suffix@example.com',
            'password': password,
            'full_name': 'Pilot Owner',
            'company_name': 'Pilot Company',
          }),
        );
        expect(registered.statusCode, 201, reason: registered.body);
        final token =
            (jsonDecode(registered.body) as Map)['access_token'] as String;
        expect(jwt.verifyAccessToken(token)!.audience, 'customer');
        final cookie = registered.headers['set-cookie']!;
        expect(cookie, contains('Path=/api/auth;'));
        expect(cookie, contains('HttpOnly; SameSite=Strict; Secure'));
        final forbidden = await client.get(
          Uri.parse('$base/admin/config'),
          headers: {'Authorization': 'Bearer $token'},
        );
        expect(forbidden.statusCode, 403);
        final cookieValue = cookie.split(';').first;
        final renewed = await client.post(
          Uri.parse('$base/auth/refresh'),
          headers: {'Cookie': cookieValue},
        );
        expect(renewed.statusCode, 200, reason: renewed.body);
        final replay = await client.post(
          Uri.parse('$base/auth/refresh'),
          headers: {'Cookie': cookieValue},
        );
        expect(replay.statusCode, 401);
        final loggedIn = await client.post(
          Uri.parse('$base/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': '$suffix@example.com',
            'password': password,
          }),
        );
        expect(loggedIn.statusCode, 200);
        await service.tablesDB.createRow(
          databaseId: '',
          tableId: 'guildmark_employees',
          rowId: ID.unique(),
          data: {
            'email': 'staff-$suffix@example.com',
            'password_hash': hashPassword(password),
            'full_name': 'Staff',
            'role': 'admin',
            'is_active': true,
          },
        );
        try {
          await service.tablesDB.createRow(
            databaseId: '',
            tableId: 'platform_config',
            rowId: 'config',
            data: {'payment_terms_enabled': false},
          );
        } on DatastoreException catch (error) {
          if (error.code != 409) rethrow;
        }
        final employee = await client.post(
          Uri.parse('$base/admin/auth'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': 'staff-$suffix@example.com',
            'password': password,
          }),
        );
        expect(employee.statusCode, 200, reason: employee.body);
        final staffToken =
            (jsonDecode(employee.body) as Map)['access_token'] as String;
        expect(jwt.verifyAccessToken(staffToken)!.audience, 'staff');
        final allowed = await client.get(
          Uri.parse('$base/admin/config'),
          headers: {'Authorization': 'Bearer $staffToken'},
        );
        expect(allowed.statusCode, 200, reason: allowed.body);
      } finally {
        client.close();
        await server.close(force: true);
        service.close();
      }
    },
    skip: host == null ? 'Requires the Firestore emulator' : false,
  );
}
