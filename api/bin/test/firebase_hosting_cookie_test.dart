import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_routes.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/config.dart';
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';

class Config extends Mock implements AppConfig {}

class Sessions extends Mock implements FirebaseSessions {}

void main() {
  test(
    'cloud logout receives Hosting __session and clears matching secure cookie',
    () async {
      final cfg = Config();
      final sessions = Sessions();
      when(() => cfg.authMode).thenReturn('firebase');
      when(() => cfg.corsOrigin).thenReturn('https://guildmark.co');
      when(
        () => cfg.adminCorsOrigin,
      ).thenReturn('https://devdash.guildmark.co');
      when(
        () => cfg.partnerCorsOrigin,
      ).thenReturn('https://partners.guildmark.co');
      when(() => cfg.publicApiPrefix).thenReturn('/api');
      when(
        () => sessions.logout('test-handle', 'customer'),
      ).thenAnswer((_) async {});
      final handler = ((RequestContext c) => firebaseAuthRoute(c, 'logout'))
          .use(provider<AppConfig>((_) => cfg))
          .use(provider<FirebaseSessions>((_) => sessions));
      final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
      final client = http.Client();
      try {
        final response = await client.post(
          Uri.parse('http://127.0.0.1:${server.port}/api/auth/logout'),
          headers: {
            'origin': 'https://guildmark.co',
            'cookie': '__session=test-handle',
          },
        );
        expect(response.statusCode, 200);
        expect(
          response.headers['set-cookie'],
          contains(
            '__session=; Path=/api/auth; Max-Age=0; HttpOnly; SameSite=Strict; Secure',
          ),
        );
        expect(response.headers['cache-control'], 'no-store');
      } finally {
        client.close();
        await server.close(force: true);
      }
      verify(() => sessions.logout('test-handle', 'customer')).called(1);
    },
  );
}
