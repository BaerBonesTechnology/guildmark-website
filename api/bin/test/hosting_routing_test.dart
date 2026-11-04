import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/http_routing.dart';
import 'package:http/http.dart' as http;
import 'package:test/test.dart';

void main() {
  test('Firebase Hosting prefix is stripped before route dispatch', () async {
    final server = await serve(
      apiRouter(
        (Router()..get('/auth/refresh', (_) => Response(body: 'matched'))).call,
      ),
      InternetAddress.loopbackIPv4,
      0,
    );
    final client = http.Client();
    try {
      for (final path in ['/api/auth/refresh', '/auth/refresh']) {
        final response = await client.get(
          Uri.parse('http://127.0.0.1:${server.port}$path'),
        );
        expect(response.statusCode, 200);
        expect(response.body, 'matched');
      }
    } finally {
      client.close();
      await server.close(force: true);
    }
  });
}
