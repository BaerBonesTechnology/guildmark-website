/// Cloud Firebase session signature and claim validation.
library;

import 'dart:convert';

import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:http/http.dart' as http;

class FirebaseSessionVerifier {
  FirebaseSessionVerifier({required this.projectId, required this.client});
  final String projectId;
  final http.Client client;
  Map<String, RSAPublicKey> _keys = {};
  DateTime _expires = DateTime.fromMillisecondsSinceEpoch(0);
  Future<void>? _loading;
  Future<void> _refresh() async {
    final response = await client
        .get(
          Uri.parse(
            'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys',
          ),
        )
        .timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw StateError('Signing keys unavailable');
    }
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final keys = json.map(
      (id, cert) => MapEntry(id, RSAPublicKey.cert(cert as String)),
    );
    if (keys.isEmpty) throw StateError('No signing keys');
    final seconds =
        int.tryParse(
          RegExp(
                r'max-age=(\d+)',
              ).firstMatch(response.headers['cache-control'] ?? '')?.group(1) ??
              '',
        ) ??
        0;
    _keys = keys;
    _expires = DateTime.now().add(Duration(seconds: seconds.clamp(0, 21600)));
  }

  Future<bool> verify(String token, String uid) async {
    try {
      if (token.length > 16384 || uid.isEmpty || uid.length > 128) return false;
      final parts = token.split('.');
      if (parts.length != 3) return false;
      final header =
          jsonDecode(
                utf8.decode(base64Url.decode(base64Url.normalize(parts[0]))),
              )
              as Map;
      if (header['alg'] != 'RS256' ||
          header['kid'] is! String ||
          (header['kid'] as String).isEmpty) {
        return false;
      }
      if (!DateTime.now().isBefore(_expires)) {
        try {
          await (_loading ??= _refresh());
        } finally {
          _loading = null;
        }
      }
      final key = _keys[header['kid']];
      if (key == null) return false;
      final jwt = JWT.verify(token, key, checkHeaderType: false);
      final c = jwt.payload as Map;
      final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      bool integer(Object? v) => v is num && v.isFinite && v == v.round();
      return c['sub'] == uid &&
          c['aud'] == projectId &&
          c['iss'] == 'https://session.firebase.google.com/$projectId' &&
          integer(c['exp']) &&
          integer(c['iat']) &&
          integer(c['auth_time']) &&
          (c['exp'] as num) > now &&
          (c['iat'] as num) <= now &&
          (c['iat'] as num) > 0 &&
          (c['auth_time'] as num) > 0 &&
          (c['auth_time'] as num) <= now;
    } on Object {
      return false;
    }
  }
}
