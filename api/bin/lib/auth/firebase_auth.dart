/// Firebase identity with explicitly isolated cloud and emulator modes.
library;

import 'dart:async';
import 'dart:convert';

import 'package:googleapis_auth/auth_io.dart' as google;
import 'package:guildmark_api/auth/firebase_session_verifier.dart';
import 'package:http/http.dart' as http;

class FirebaseAuthFailure implements Exception {
  FirebaseAuthFailure(this.code);
  final String code;
  @override
  String toString() => 'FirebaseAuthFailure($code)';
}

class FirebaseAuth {
  FirebaseAuth({
    required this.projectId,
    required String host,
    http.Client? client,
  }) : _client = client ?? http.Client() {
    final uri = Uri.tryParse('http://$host');
    if (!projectId.startsWith('demo-') ||
        uri == null ||
        !{'127.0.0.1', 'localhost', '::1'}.contains(uri.host) ||
        !uri.hasPort ||
        uri.userInfo.isNotEmpty ||
        uri.path.isNotEmpty ||
        uri.hasQuery ||
        uri.hasFragment) {
      throw ArgumentError(
        'Firebase Auth requires a demo project and explicit loopback emulator host',
      );
    }
    _base = uri;
  }
  FirebaseAuth.cloud({
    required this.projectId,
    required String apiKey,
    http.Client? client,
    Future<http.Client> Function()? adminClient,
  }) : _client = client ?? http.Client() {
    if (!RegExp(r'^[a-z][a-z0-9-]{4,28}[a-z0-9]$').hasMatch(projectId) ||
        projectId.startsWith('demo-') ||
        apiKey.trim().isEmpty) {
      throw ArgumentError(
        'Cloud Firebase Auth requires a real project and API key',
      );
    }
    _base = Uri.https('identitytoolkit.googleapis.com', '');
    _apiKey = apiKey;
    _cloud = true;
    _adminFactory =
        adminClient ??
        () => google.clientViaApplicationDefaultCredentials(
          scopes: ['https://www.googleapis.com/auth/identitytoolkit'],
        );
    _verifier = FirebaseSessionVerifier(projectId: projectId, client: _client);
  }
  bool _cloud = false;
  bool get isCloud => _cloud;
  String _apiKey = 'local-emulator-key';
  Future<http.Client> Function()? _adminFactory;
  Future<http.Client>? _admin;
  FirebaseSessionVerifier? _verifier;
  final String projectId;
  final http.Client _client;
  late final Uri _base;

  Future<Map<String, dynamic>> call(
    String operation,
    Map<String, dynamic> body, {
    bool admin = false,
  }) async {
    final prefix = _cloud ? '' : '/identitytoolkit.googleapis.com';
    final path = admin
        ? '$prefix/v1/projects/$projectId${operation.startsWith(':') ? '' : '/'}$operation'
        : '$prefix/v1/$operation';
    try {
      final client = _cloud && admin
          ? await (_admin ??= _adminFactory!())
          : _client;
      final response = await client
          .post(
            _base.replace(
              path: path,
              queryParameters: admin && _cloud ? null : {'key': _apiKey},
            ),
            headers: {
              'Content-Type': 'application/json',
              if (admin && !_cloud) 'Authorization': 'Bearer owner',
            },
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 10));
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode != 200) {
        final code = (data['error']?['message'] ?? '')
            .toString()
            .split(' : ')
            .first;
        // Only known codes escape this boundary; never log upstream bodies.
        throw FirebaseAuthFailure(
          {
                'EMAIL_EXISTS',
                'EMAIL_NOT_FOUND',
                'INVALID_PASSWORD',
                'INVALID_LOGIN_CREDENTIALS',
                'USER_DISABLED',
                'INVALID_OOB_CODE',
                'EXPIRED_OOB_CODE',
                'WEAK_PASSWORD',
                'INVALID_EMAIL',
                'TOKEN_EXPIRED',
              }.contains(code)
              ? code
              : 'AUTH_UNAVAILABLE',
        );
      }
      return data;
    } on FirebaseAuthFailure {
      rethrow;
    } catch (_) {
      throw FirebaseAuthFailure('AUTH_UNAVAILABLE');
    }
  }

  Future<Map<String, dynamic>> signIn(String email, String password) =>
      call('accounts:signInWithPassword', {
        'email': email.trim().toLowerCase(),
        'password': password,
        'returnSecureToken': true,
      });
  Future<Map<String, dynamic>> signUp(String email, String password) =>
      call('accounts:signUp', {
        'email': email.trim().toLowerCase(),
        'password': password,
        'returnSecureToken': true,
      });
  Future<void> deleteUser(String uid) async {
    await call('accounts:delete', {'localId': uid}, admin: true);
  }

  Future<Map<String, dynamic>?> user(String uid) async {
    final response = await call('accounts:lookup', {
      'localId': [uid],
    }, admin: true);
    final users = response['users'] as List? ?? [];
    return users.isEmpty ? null : Map<String, dynamic>.from(users.first as Map);
  }

  Future<String> sessionCookie(String idToken) async {
    final response = await call(':createSessionCookie', {
      'idToken': idToken,
      'validDuration': '28800',
    }, admin: true);
    return response['sessionCookie'] as String;
  }

  Future<void> resetEmail(String email) async {
    try {
      await call('accounts:sendOobCode', {
        'requestType': 'PASSWORD_RESET',
        'email': email.trim().toLowerCase(),
      });
    } on FirebaseAuthFailure catch (e) {
      if (e.code != 'EMAIL_NOT_FOUND') rethrow;
    }
  }

  Future<void> resetPassword(String code, String password) async {
    await call('accounts:resetPassword', {
      'oobCode': code,
      'newPassword': password,
    });
  }

  /// Cookies are only loaded from API-owned session records, never accepted
  /// directly from a caller. Emulator unsigned tokens must never reach cloud.
  Future<bool> validSession(String cookie, String uid) async {
    try {
      if (_cloud && !await _verifier!.verify(cookie, uid)) return false;
      final parts = cookie.split('.');
      if (parts.length != 3) return false;
      final claims =
          jsonDecode(
                utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
              )
              as Map;
      final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      if (claims['sub'] != uid ||
          claims['aud'] != projectId ||
          claims['iss'] != 'https://session.firebase.google.com/$projectId' ||
          (claims['exp'] as num) <= now ||
          (claims['iat'] as num) > now ||
          (claims['auth_time'] as num) > now) {
        return false;
      }
      final account = await user(uid);
      return account != null &&
          account['disabled'] != true &&
          (claims['auth_time'] as num) >=
              int.parse(account['validSince']?.toString() ?? '0');
    } on FirebaseAuthFailure {
      rethrow;
    } catch (_) {
      return false;
    }
  }

  void close() {
    _client.close();
    unawaited(_admin?.then((client) => client.close()));
  }
}
