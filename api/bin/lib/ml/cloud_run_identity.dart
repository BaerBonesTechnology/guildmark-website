/// Workload identity for a fixed private Cloud Run audience.
library;

import 'dart:convert';
import 'package:http/http.dart' as http;

class CloudRunIdentity {
  CloudRunIdentity(this.audience, {http.Client? client})
    : _client = client ?? http.Client() {
    final url = Uri.parse(audience);
    if (url.scheme != 'https' ||
        !url.host.endsWith('.run.app') ||
        url.path.isNotEmpty ||
        url.hasQuery ||
        url.hasFragment ||
        url.userInfo.isNotEmpty) {
      throw ArgumentError('ML IAM audience must be a Cloud Run HTTPS origin');
    }
  }
  final String audience;
  final http.Client _client;
  String? _token;
  int _expires = 0;
  Future<String>? _loading;
  Future<String> token() async {
    if (_token != null &&
        DateTime.now().millisecondsSinceEpoch ~/ 1000 < _expires - 60)
      return _token!;
    try {
      return await (_loading ??= _fetch());
    } finally {
      _loading = null;
    }
  }

  Future<String> _fetch() async {
    final response = await _client
        .get(
          Uri.http(
            'metadata.google.internal',
            '/computeMetadata/v1/instance/service-accounts/default/identity',
            {'audience': audience, 'format': 'full'},
          ),
          headers: {'Metadata-Flavor': 'Google'},
        )
        .timeout(const Duration(seconds: 5));
    if (response.statusCode != 200 ||
        response.headers['metadata-flavor'] != 'Google')
      throw StateError('ML workload identity unavailable');
    final token = response.body;
    final parts = token.split('.');
    if (parts.length != 3)
      throw StateError('Invalid metadata identity response');
    final c =
        jsonDecode(utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))))
            as Map;
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    if (c['aud'] != audience ||
        c['exp'] is! int ||
        (c['exp'] as int) <= now + 60)
      throw StateError('Invalid metadata identity claims');
    _token = token;
    _expires = c['exp'] as int;
    return token;
  }
}
