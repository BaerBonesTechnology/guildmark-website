import 'dart:convert';
import 'dart:io';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_session_verifier.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:test/test.dart';

void main() {
  late Directory temp;
  late String cert;
  late RSAPrivateKey key;
  const project = 'guildmark-test';
  const uid = 'firebase-user';
  String token({
    Map<String, dynamic> patch = const {},
    String kid = 'current',
  }) {
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    return JWT(
      {
        'sub': uid,
        'aud': project,
        'iss': 'https://session.firebase.google.com/$project',
        'iat': now - 10,
        'auth_time': now - 20,
        'exp': now + 300,
        ...patch,
      },
      header: {'kid': kid},
    ).sign(key, algorithm: JWTAlgorithm.RS256, noIssueAt: true);
  }

  setUpAll(() async {
    temp = await Directory.systemTemp.createTemp('firebase-auth-test-');
    final result = await Process.run('openssl', [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-keyout',
      '${temp.path}/key.pem',
      '-out',
      '${temp.path}/cert.pem',
      '-days',
      '1',
      '-subj',
      '/CN=fixture',
    ]);
    expect(
      result.exitCode,
      0,
      reason: 'OpenSSL is required for ephemeral test certificates',
    );
    key = RSAPrivateKey(await File('${temp.path}/key.pem').readAsString());
    cert = await File('${temp.path}/cert.pem').readAsString();
  });
  tearDownAll(() async {
    await temp.delete(recursive: true);
  });
  test('signed cloud sessions validate and cache trusted certificates', () async {
    var fetches = 0;
    final v = FirebaseSessionVerifier(
      projectId: project,
      client: MockClient((r) async {
        fetches++;
        expect(
          r.url.toString(),
          'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys',
        );
        return http.Response(
          jsonEncode({'current': cert}),
          200,
          headers: {'cache-control': 'public, max-age=3600'},
        );
      }),
    );
    expect(await v.verify(token(), uid), isTrue);
    expect(await v.verify(token(), uid), isTrue);
    expect(fetches, 1);
    for (final patch in <Map<String, dynamic>>[
      {'aud': 'other-project'},
      {'iss': 'https://securetoken.google.com/$project'},
      {'sub': 'other-user'},
      {'exp': 0},
      {'iat': 9999999999},
      {'auth_time': 9999999999},
      {'exp': null},
      {'iat': null},
      {'auth_time': null},
      {'auth_time': -1},
    ]) {
      expect(
        await v.verify(token(patch: patch), uid),
        isFalse,
        reason: patch.toString(),
      );
    }
    expect(await v.verify(token(kid: 'unknown'), uid), isFalse);
    final parts = token().split('.');
    parts[2] = 'AA';
    expect(await v.verify(parts.join('.'), uid), isFalse);
    expect(
      await v.verify(
        JWT({'sub': uid}, header: {'kid': 'current'}).sign(SecretKey('test')),
        uid,
      ),
      isFalse,
    );
    expect(await v.verify('unsigned', uid), isFalse);
  });
  test('missing or unavailable signing certificates fail closed', () async {
    final v = FirebaseSessionVerifier(
      projectId: project,
      client: MockClient((_) async => http.Response('unavailable', 503)),
    );
    expect(await v.verify(token(), uid), isFalse);
  });
  test(
    'cloud identity uses public API key and project-scoped ADC admin calls',
    () async {
      final a = FirebaseAuth.cloud(
        projectId: project,
        apiKey: 'fixture-public-key',
        client: MockClient((r) async {
          expect(r.url.host, 'identitytoolkit.googleapis.com');
          expect(r.url.scheme, 'https');
          expect(r.url.path, '/v1/accounts:signInWithPassword');
          expect(r.url.queryParameters['key'], 'fixture-public-key');
          expect(r.headers['Authorization'], isNull);
          return http.Response(jsonEncode({'localId': uid}), 200);
        }),
        adminClient: () async => MockClient((r) async {
          expect(r.url.path, startsWith('/v1/projects/$project'));
          expect(r.url.queryParameters, isEmpty);
          expect(r.headers['Authorization'], isNot('Bearer owner'));
          if (r.url.path.endsWith(':createSessionCookie')) {
            expect(jsonDecode(r.body)['validDuration'], '28800');
            return http.Response('{"sessionCookie":"fixture-cookie"}', 200);
          }
          return http.Response(
            jsonEncode({
              'users': [
                {'localId': uid},
              ],
            }),
            200,
          );
        }),
      );
      expect((await a.signIn('seller@test.test', 'password'))['localId'], uid);
      expect(await a.sessionCookie('id-token'), 'fixture-cookie');
      expect((await a.user(uid))?['localId'], uid);
      a.close();
    },
  );
  test('cloud session checks account disable and token revocation', () async {
    var disabled = false;
    var validSince = 0;
    final a = FirebaseAuth.cloud(
      projectId: project,
      apiKey: 'fixture',
      client: MockClient(
        (_) async => http.Response(
          jsonEncode({'current': cert}),
          200,
          headers: {'cache-control': 'max-age=3600'},
        ),
      ),
      adminClient: () async => MockClient(
        (_) async => http.Response(
          jsonEncode({
            'users': [
              {
                'localId': uid,
                'disabled': disabled,
                'validSince': '$validSince',
              },
            ],
          }),
          200,
        ),
      ),
    );
    expect(await a.validSession(token(), uid), isTrue);
    disabled = true;
    expect(await a.validSession(token(), uid), isFalse);
    disabled = false;
    validSince = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    expect(await a.validSession(token(), uid), isFalse);
    a.close();
  });
  test(
    'cloud mode rejects demo projects and mixed cloud/emulator sessions',
    () {
      expect(
        () => FirebaseAuth.cloud(projectId: 'demo-guildmark', apiKey: 'key'),
        throwsArgumentError,
      );
      final a = FirebaseAuth.cloud(projectId: project, apiKey: 'key');
      expect(
        () => FirebaseSessions(
          a,
          FirebaseService(projectId: project, emulatorHost: '127.0.0.1:8085'),
        ),
        throwsArgumentError,
      );
      expect(
        () => FirebaseAuth(projectId: project, host: '127.0.0.1:9099'),
        throwsArgumentError,
      );
      a.close();
    },
  );
}
