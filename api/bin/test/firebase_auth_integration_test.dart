import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:crypto/crypto.dart' as hash;
import 'package:guildmark_api/webauthn/webauthn.dart';
import 'package:http/testing.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';
import '../routes/_middleware.dart' as root;
import '../routes/auth/signup.dart' as signup;
import '../routes/auth/login.dart' as login;
import '../routes/auth/refresh.dart' as refresh;
import '../routes/auth/logout.dart' as logout;
import '../routes/auth/forgot_password.dart' as forgot;
import '../routes/auth/reset_password.dart' as reset;
import '../routes/admin/auth.dart' as staff;
import '../routes/admin/config/index.dart' as admin;
import '../routes/admin/passkey/register/begin.dart' as register;
import '../routes/admin/passkey/register/complete.dart' as registerComplete;
import '../routes/admin/passkey/auth/complete.dart' as assertionComplete;
import '../routes/partner/_middleware.dart' as partnerMiddleware;
import '../routes/partner/auth/login.dart' as partnerLogin;

class Config extends Mock implements AppConfig {}

Future<Map<String, dynamic>> nodeCrypto(Map<String, dynamic> input) async {
  final process = await Process.start('node', [
    '-e',
    """
    const c = require('node:crypto'); let text = '';
    process.stdin.on('data', b => text += b);
    process.stdin.on('end', () => {
      const data = JSON.parse(text);
      if (!data.key) {
        const {privateKey} = data.rsa
          ? c.generateKeyPairSync('rsa', {modulusLength: 2048})
          : c.generateKeyPairSync('ec', {namedCurve: 'prime256v1'});
        process.stdout.write(JSON.stringify(privateKey.export({format: 'jwk'})));
      } else {
        const key = c.createPrivateKey({key: data.key, format: 'jwk'});
        const signature = c.sign('sha256', Buffer.from(data.message, 'base64url'), key);
        process.stdout.write(JSON.stringify({signature: signature.toString('base64url')}));
      }
    });
  """,
  ]);
  process.stdin.write(jsonEncode(input));
  await process.stdin.close();
  final output = await utf8.decoder.bind(process.stdout).join();
  expect(await process.exitCode, 0);
  return jsonDecode(output) as Map<String, dynamic>;
}

List<int> cborBytes(List<int> bytes) => [
  0x59,
  bytes.length >> 8,
  bytes.length & 255,
  ...bytes,
];
List<int> derInteger(List<int> bytes) {
  var start = 0;
  while (start < bytes.length - 1 && bytes[start] == 0) {
    start++;
  }
  final value = bytes.sublist(start);
  if (value[0] >= 128) value.insert(0, 0);
  return [2, value.length, ...value];
}

String derSignature(List<int> raw) {
  final inner = [
    ...derInteger(raw.sublist(0, 32)),
    ...derInteger(raw.sublist(32)),
  ];
  return toBase64Url([0x30, inner.length, ...inner]);
}

void main() {
  test('emulator adapter refuses cloud projects and non-loopback hosts', () {
    for (final pair in [
      ('guildmark-prod', '127.0.0.1:9099'),
      ('demo-test', 'remote.example:9099'),
      ('demo-test', ''),
      ('demo-test', '127.0.0.1:9099/path'),
      ('demo-test', 'user@localhost:9099'),
    ]) {
      expect(
        () => FirebaseAuth(projectId: pair.$1, host: pair.$2),
        throwsArgumentError,
      );
    }
  });
  test(
    'passkey authenticator data checks RP, presence and user verification',
    () {
      final valid = Uint8List.fromList([
        ...hash.sha256.convert(utf8.encode('localhost')).bytes,
        5,
        0,
        0,
        0,
        0,
      ]);
      verifyAuthenticatorData(valid, 'localhost');
      expect(
        () => verifyAuthenticatorData(valid, 'other.test'),
        throwsFormatException,
      );
      for (final flags in [0, 1, 4]) {
        final invalid = Uint8List.fromList(valid)..[32] = flags;
        expect(
          () => verifyAuthenticatorData(invalid, 'localhost'),
          throwsFormatException,
        );
      }
    },
  );
  final host = Platform.environment['FIREBASE_AUTH_EMULATOR_HOST'];
  final dbHost = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'Firebase API authentication',
    () {
      late FirebaseAuth auth;
      late FirebaseService store;
      late FirebaseSessions sessions;
      late Config cfg;
      late String email;
      const password = 'Local-test-password-123!';
      final jwt = JwtService(
        accessSecret: 'test-legacy-secret',
        accessTtl: const Duration(minutes: 15),
      );
      setUp(() {
        auth = FirebaseAuth(projectId: 'demo-guildmark', host: host!);
        store = FirebaseService(
          projectId: 'demo-guildmark',
          emulatorHost: dbHost,
        );
        sessions = FirebaseSessions(auth, store);
        email = '${ID.unique()}@example.test';
        cfg = Config();
        when(() => cfg.authMode).thenReturn('firebase-emulator');
        when(() => cfg.publicApiPrefix).thenReturn('/api');
        when(() => cfg.corsOrigin).thenReturn('http://localhost:5173');
        when(() => cfg.adminCorsOrigin).thenReturn('http://localhost:3001');
        when(() => cfg.partnerCorsOrigin).thenReturn('http://localhost:3002');
        when(() => cfg.webauthnRpId).thenReturn('localhost');
        when(() => cfg.webauthnRpName).thenReturn('GuildMark Local');
      });
      tearDown(() {
        auth.close();
        store.close();
      });
      Future<http.Response> request(
        Handler route,
        String path, {
        Map<String, dynamic>? body,
        String? token,
        String? cookie,
        String? origin,
        String method = 'POST',
      }) async {
        final handler = root
            .middleware(route)
            .use(provider<AppConfig>((_) => cfg))
            .use(provider<FirebaseSessions>((_) => sessions))
            .use(provider<FirebaseService?>((_) => store))
            .use(provider<JwtService>((_) => jwt));
        final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
        try {
          final req = http.Request(
            method,
            Uri.parse('http://127.0.0.1:${server.port}$path'),
          );
          req.headers.addAll({
            'content-type': 'application/json',
            if (token != null) 'authorization': 'Bearer $token',
            'cookie': ?cookie,
            'origin': ?origin,
          });
          if (body != null) req.body = jsonEncode(body);
          final client = http.Client();
          try {
            return await http.Response.fromStream(await client.send(req));
          } finally {
            client.close();
          }
        } finally {
          await server.close(force: true);
        }
      }

      Map<String, dynamic> data(http.Response r) =>
          jsonDecode(r.body) as Map<String, dynamic>;
      Future<http.Response> customer() => request(
        signup.onRequest,
        '/api/auth/signup',
        body: {
          'email': email,
          'password': password,
          'full_name': 'Pilot Owner',
          'company_name': 'Pilot Company',
          'role': 'superadmin',
          'audience': 'staff',
          'firebase_uid': 'attacker-selected',
        },
      );
      Future<Map<String, dynamic>> employee() async {
        final account = await auth.signUp(email, password);
        final id = ID.unique();
        await store.tablesDB.createRow(
          databaseId: '',
          tableId: 'guildmark_employees',
          rowId: id,
          data: {
            'firebase_uid': account['localId'],
            'email': email,
            'full_name': 'Local Staff',
            'role': 'admin',
            'is_active': true,
          },
        );
        return {...account, 'employee_id': id};
      }

      test(
        'signup, login, restore and logout use Firebase without legacy password/token records',
        () async {
          final created = await customer();
          expect(created.statusCode, 201, reason: created.body);
          final token = data(created)['access_token'] as String;
          expect(
            token.split('.'),
            hasLength(1),
          ); // Firebase stays behind the API.
          expect(
            created.headers['set-cookie'],
            contains('HttpOnly; SameSite=Strict'),
          );
          final principal = await sessions.principal(token);
          expect(principal!.audience, 'customer');
          expect(principal.role, 'admin'); // Company admin, never staff.
          final user = await sessions.row('users', principal.userId);
          expect(user!.data['password_hash'], isNull);
          expect(user.data['firebase_uid'], isNot('attacker-selected'));
          final signedIn = await request(
            login.onRequest,
            '/api/auth/login',
            body: {'email': email, 'password': password},
          );
          expect(signedIn.statusCode, 200, reason: signedIn.body);
          final cookie = created.headers['set-cookie']!.split(';').first;
          expect(
            (await request(
              refresh.onRequest,
              '/api/auth/refresh',
              cookie: cookie,
            )).statusCode,
            200,
          );
          expect(
            (await request(
              logout.onRequest,
              '/api/auth/logout',
              cookie: cookie,
            )).statusCode,
            200,
          );
          expect(await sessions.principal(token), isNull);
          expect(
            (await request(
              refresh.onRequest,
              '/api/auth/refresh',
              cookie: cookie,
            )).statusCode,
            401,
          );
          expect(
            await sessions.principal(data(signedIn)['access_token'] as String),
            isNotNull,
          );
        },
      );
      test(
        'customer admin cannot authenticate as staff or call staff routes',
        () async {
          final created = await customer();
          final token = data(created)['access_token'] as String;
          final denied = await request(
            admin.onRequest,
            '/api/admin/config',
            token: token,
            method: 'GET',
          );
          expect(denied.statusCode, 403);
          expect(
            (await request(
              staff.onRequest,
              '/api/admin/auth',
              body: {'email': email, 'password': password},
            )).statusCode,
            401,
          );
        },
      );
      test(
        'staff passwords issue setup-only sessions and raw Firebase tokens cannot bypass MFA',
        () async {
          final account = await employee();
          final signedIn = await request(
            staff.onRequest,
            '/api/admin/auth',
            body: {'email': email, 'password': password},
          );
          expect(signedIn.statusCode, 200, reason: signedIn.body);
          expect(data(signedIn)['requires_passkey_setup'], true);
          expect(data(signedIn)['access_token'], isNull);
          final setup = data(signedIn)['setup_token'] as String;
          expect((await sessions.principal(setup))!.audience, 'staff_setup');
          expect(
            (await request(
              admin.onRequest,
              '/api/admin/config',
              token: setup,
              method: 'GET',
            )).statusCode,
            403,
          );
          expect(
            (await request(
              register.onRequest,
              '/api/admin/passkey/register/begin',
              token: setup,
            )).statusCode,
            200,
          );
          expect(
            (await request(
              admin.onRequest,
              '/api/admin/config',
              token: account['idToken'] as String,
              method: 'GET',
            )).statusCode,
            401,
          );
          expect(
            (await request(
              login.onRequest,
              '/api/auth/login',
              body: {'email': email, 'password': password},
            )).statusCode,
            401,
          );
        },
      );
      test(
        'staff promotion is single-use; staff is excluded from customer APIs; deactivation takes effect immediately',
        () async {
          final account = await employee();
          final restricted = await sessions.issue(account, 'staff_pending');
          final results = await Future.wait(
            List.generate(2, (_) async {
              try {
                return await sessions.completeStaff(
                  FirebaseSessions.digest(restricted),
                  'staff_pending',
                  account['employee_id'] as String,
                );
              } on FirebaseAuthFailure {
                return null;
              }
            }),
          );
          expect(results.whereType<String>(), hasLength(1));
          final token = results.whereType<String>().single;
          expect(await sessions.resolve(restricted), isNull);
          expect((await sessions.principal(token))!.isStaffAdministrator, true);
          final denied = await request(
            (_) => Response.json(body: {'ok': true}),
            '/api/orders',
            token: token,
            method: 'GET',
          );
          expect(denied.statusCode, 403);
          await store.tablesDB.updateRow(
            databaseId: '',
            tableId: 'guildmark_employees',
            rowId: account['employee_id'] as String,
            data: {'is_active': false},
          );
          expect(await sessions.principal(token), isNull);
        },
      );
      test(
        'legacy JWTs and guessed handles fail closed in Firebase mode',
        () async {
          await customer();
          for (final token in [
            'invalid',
            jwt.issueAccessToken(
              AccessClaims(
                userId: 'admin',
                companyId: 'devdash',
                role: 'admin',
                audience: 'staff',
              ),
            ),
          ]) {
            expect(
              (await request(
                admin.onRequest,
                '/api/admin/config',
                token: token,
                method: 'GET',
              )).statusCode,
              401,
            );
          }
        },
      );
      test(
        'wrong password, unknown identity and unlinked Firebase account cannot sign in',
        () async {
          await customer();
          expect(
            (await request(
              login.onRequest,
              '/api/auth/login',
              body: {'email': email, 'password': 'incorrect'},
            )).statusCode,
            401,
          );
          final orphanEmail = '${ID.unique()}@example.test';
          await auth.signUp(orphanEmail, password);
          expect(
            (await request(
              login.onRequest,
              '/api/auth/login',
              body: {'email': orphanEmail, 'password': password},
            )).statusCode,
            401,
          );
        },
      );
      test(
        'disabled Firebase identity invalidates an existing API session',
        () async {
          final created = await customer();
          final token = data(created)['access_token'] as String;
          final session = await sessions.resolve(token);
          await auth.call('accounts:update', {
            'localId': session!.data['uid'],
            'disableUser': true,
          }, admin: true);
          expect(await sessions.resolve(token), isNull);
        },
      );
      test(
        'CSRF origin rejection and expiry do not fall back to legacy refresh',
        () async {
          final created = await customer();
          final token = data(created)['access_token'] as String;
          final cookie = created.headers['set-cookie']!.split(';').first;
          expect(
            (await request(
              refresh.onRequest,
              '/api/auth/refresh',
              cookie: cookie,
              origin: 'https://evil.test',
            )).statusCode,
            403,
          );
          await store.tablesDB.updateRow(
            databaseId: '',
            tableId: FirebaseSessions.collection,
            rowId: FirebaseSessions.digest(token),
            data: {'expires_at': '2000-01-01T00:00:00Z'},
          );
          expect(
            (await request(
              refresh.onRequest,
              '/api/auth/refresh',
              cookie: cookie,
            )).statusCode,
            401,
          );
        },
      );
      test(
        'Firebase reset codes work once, revoke sessions, and unknown emails do not enumerate',
        () async {
          final created = await customer();
          final token = data(created)['access_token'] as String;
          final known = await request(
            forgot.onRequest,
            '/api/auth/forgot_password',
            body: {'email': email},
          );
          final unknown = await request(
            forgot.onRequest,
            '/api/auth/forgot_password',
            body: {'email': 'missing-${ID.unique()}@example.test'},
          );
          expect(known.statusCode, 200);
          expect(unknown.body, known.body);
          final codes =
              jsonDecode(
                    (await http.get(
                      Uri.parse(
                        'http://$host/emulator/v1/projects/demo-guildmark/oobCodes',
                      ),
                    )).body,
                  )
                  as Map;
          final code = (codes['oobCodes'] as List)
              .cast<Map<String, dynamic>>()
              .lastWhere(
                (e) => e['email'] == email,
              )['oobCode'];
          final changed = await request(
            reset.onRequest,
            '/api/auth/reset_password',
            body: {'token': code, 'new_password': 'New-local-password-123!'},
          );
          expect(changed.statusCode, 200, reason: changed.body);
          expect(await sessions.resolve(token), isNull);
          expect(
            (await request(
              reset.onRequest,
              '/api/auth/reset_password',
              body: {'token': code, 'new_password': password},
            )).statusCode,
            422,
          );
          expect(
            (await request(
              login.onRequest,
              '/api/auth/login',
              body: {'email': email, 'password': password},
            )).statusCode,
            401,
          );
        },
      );
      for (final rsa in [false, true]) {
        test(
          '${rsa ? "RS256" : "ES256"} staff registration and assertion enforce MFA and reject replay',
          () async {
            await employee();
            final first = await request(
              staff.onRequest,
              '/api/admin/auth',
              body: {'email': email, 'password': password},
            );
            final setup = data(first)['setup_token'] as String;
            final begin = data(
              await request(
                register.onRequest,
                '/api/admin/passkey/register/begin',
                token: setup,
              ),
            );
            expect(
              (begin['pub_key_cred_params'] as List).map(
                (dynamic p) => (p as Map)['alg'],
              ),
              containsAll([-7, -257]),
            );
            final key = await nodeCrypto({'rsa': rsa});
            final credId = List<int>.generate(32, (i) => i + (rsa ? 33 : 1));
            final cose = rsa
                ? [
                    0xa4,
                    1,
                    3,
                    3,
                    0x39,
                    0x01,
                    0x00,
                    0x20,
                    ...cborBytes(fromBase64Url(key['n'] as String)),
                    0x21,
                    ...cborBytes(fromBase64Url(key['e'] as String)),
                  ]
                : [
                    0xa5,
                    1,
                    2,
                    3,
                    0x26,
                    0x20,
                    1,
                    0x21,
                    ...cborBytes(fromBase64Url(key['x'] as String)),
                    0x22,
                    ...cborBytes(fromBase64Url(key['y'] as String)),
                  ];
            final authData = [
              ...hash.sha256.convert(utf8.encode('localhost')).bytes,
              0x45,
              0,
              0,
              0,
              0,
              ...List<int>.filled(16, 0),
              0,
              credId.length,
              ...credId,
              ...cose,
            ];
            final attestation = [
              0xa1,
              0x68,
              ...utf8.encode('authData'),
              ...cborBytes(authData),
            ];
            final registration = {
              'challenge_id': begin['challenge_id'],
              'credential_id': toBase64Url(credId),
              'attestation_object': toBase64Url(attestation),
              'client_data_json': toBase64Url(
                utf8.encode(
                  jsonEncode({
                    'type': 'webauthn.create',
                    'challenge': begin['challenge'],
                    'origin': 'http://localhost:3001',
                  }),
                ),
              ),
            };
            final wrongType = List<int>.of(authData);
            wrongType[authData.length - cose.length + 2] = rsa ? 2 : 3;
            final rejected = await request(
              registerComplete.onRequest,
              '/api/admin/passkey/register/complete',
              token: setup,
              body: {
                ...registration,
                'attestation_object': toBase64Url([
                  0xa1,
                  0x68,
                  ...utf8.encode('authData'),
                  ...cborBytes(wrongType),
                ]),
              },
            );
            expect(rejected.statusCode, 400, reason: rejected.body);
            final completed = await request(
              registerComplete.onRequest,
              '/api/admin/passkey/register/complete',
              token: setup,
              body: registration,
            );
            expect(completed.statusCode, 200, reason: completed.body);
            expect(
              (await sessions.principal(
                data(completed)['access_token'] as String,
              ))!.audience,
              'staff',
            );
            expect(await sessions.principal(setup), isNull);
            // Pre-existing ES256 credentials have no algorithm field.
            if (!rsa) {
              final saved = (await store.tablesDB.listRows(
                databaseId: '',
                tableId: 'employee_passkeys',
                queries: [Query.equal('credential_id', toBase64Url(credId))],
              )).rows.single;
              await store.tablesDB.updateRow(
                databaseId: '',
                tableId: 'employee_passkeys',
                rowId: saved.$id,
                data: {'algorithm': null},
              );
            }
            final again = data(
              await request(
                staff.onRequest,
                '/api/admin/auth',
                body: {'email': email, 'password': password},
              ),
            );
            expect(again['requires_passkey'], true);
            expect(again['access_token'], isNull);
            final client = utf8.encode(
              jsonEncode({
                'type': 'webauthn.get',
                'challenge': again['challenge'],
                'origin': 'http://localhost:3001',
              }),
            );
            final assertionData = [
              ...hash.sha256.convert(utf8.encode('localhost')).bytes,
              5,
              0,
              0,
              0,
              1,
            ];
            final signature = await nodeCrypto({
              'key': key,
              'message': toBase64Url([
                ...assertionData,
                ...hash.sha256.convert(client).bytes,
              ]),
            });
            final assertion = {
              'challenge_id': again['challenge_id'],
              'credential_id': toBase64Url(credId),
              'authenticator_data': toBase64Url(assertionData),
              'client_data_json': toBase64Url(client),
              'signature': signature['signature'],
            };
            final invalid = await request(
              assertionComplete.onRequest,
              '/api/admin/passkey/auth/complete',
              body: {
                ...assertion,
                'signature': derSignature(List.filled(64, 1)),
              },
            );
            expect(invalid.statusCode, 401);
            final valid = await request(
              assertionComplete.onRequest,
              '/api/admin/passkey/auth/complete',
              body: assertion,
            );
            expect(valid.statusCode, 200, reason: valid.body);
            expect(
              (await sessions.principal(
                data(valid)['access_token'] as String,
              ))!.isStaffAdministrator,
              true,
            );
            expect(
              (await request(
                assertionComplete.onRequest,
                '/api/admin/passkey/auth/complete',
                body: assertion,
              )).statusCode,
              400,
            );
          },
        );
      }
      test(
        'staff sign-in fails closed without passkeys configured or during Firebase outage',
        () async {
          await employee();
          when(() => cfg.webauthnRpId).thenReturn(null);
          expect(
            (await request(
              staff.onRequest,
              '/api/admin/auth',
              body: {'email': email, 'password': password},
            )).statusCode,
            503,
          );
          when(() => cfg.webauthnRpId).thenReturn('localhost');
          final broken = FirebaseAuth(
            projectId: 'demo-guildmark',
            host: host!,
            client: MockClient(
              (_) async => http.Response('upstream-secret-must-not-leak', 503),
            ),
          );
          sessions = FirebaseSessions(broken, store);
          try {
            final response = await request(
              staff.onRequest,
              '/api/admin/auth',
              body: {'email': email, 'password': password},
            );
            expect(response.statusCode, 503);
            expect(response.body, isNot(contains('upstream-secret')));
          } finally {
            broken.close();
          }
        },
      );
      test(
        'partner audience stays separate and suspension invalidates its session',
        () async {
          final account = await auth.signUp(email, password);
          final id = ID.unique();
          await store.tablesDB.createRow(
            databaseId: '',
            tableId: 'partners',
            rowId: id,
            data: {
              'firebase_uid': account['localId'],
              'email': email,
              'company_name': 'Partner',
              'partner_code': 'TEST-$id',
              'status': 'active',
            },
          );
          final response = await request(
            partnerLogin.onRequest,
            '/api/partner/auth/login',
            body: {'email': email, 'password': password},
          );
          expect(response.statusCode, 200, reason: response.body);
          final token = data(response)['access_token'] as String;
          expect(await sessions.principal(token), isNull);
          final route = partnerMiddleware.middleware(
            (context) => Response(
              statusCode: context.read<PartnerPrincipal?>() == null ? 401 : 200,
            ),
          );
          expect(
            (await request(
              route,
              '/api/partner/account',
              token: token,
              method: 'GET',
            )).statusCode,
            200,
          );
          await store.tablesDB.updateRow(
            databaseId: '',
            tableId: 'partners',
            rowId: id,
            data: {'status': 'suspended'},
          );
          expect(await sessions.partner(token), isNull);
        },
      );
    },
    skip: host == null || dbHost == null
        ? 'Requires local Auth and Firestore emulators'
        : false,
  );
}
