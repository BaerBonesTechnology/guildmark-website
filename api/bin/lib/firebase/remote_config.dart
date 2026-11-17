/// Public presentation flags. Pricing and authorization remain server-owned.
library;

import 'dart:convert';

import 'package:googleapis_auth/auth_io.dart' as google;
import 'package:http/http.dart' as http;

class FirebaseRemoteConfig {
  FirebaseRemoteConfig({
    required this.projectId,
    Future<http.Client> Function()? client,
    DateTime Function()? clock,
  }) : _factory =
           client ??
           (() => google.clientViaApplicationDefaultCredentials(
             scopes: ['https://www.googleapis.com/auth/firebase.remoteconfig'],
           )),
       _clock = clock ?? DateTime.now {
    if (!RegExp(r'^[a-z][a-z0-9-]{4,28}[a-z0-9]$').hasMatch(projectId) ||
        projectId.startsWith('demo-')) {
      throw ArgumentError('Remote Config requires a real project');
    }
  }
  final String projectId;
  final Future<http.Client> Function() _factory;
  final DateTime Function() _clock;
  Future<http.Client>? _client;
  Future<Map<String, bool>>? _loading;
  Map<String, bool> _flags = const {
    'launch_enabled': false,
    'amps_enabled': false,
  };
  DateTime _expires = DateTime.fromMillisecondsSinceEpoch(0);
  Future<Map<String, bool>> flags() async {
    if (_clock().isBefore(_expires)) return Map.of(_flags);
    try {
      return await (_loading ??= _fetch());
    } finally {
      _loading = null;
    }
  }

  Future<Map<String, bool>> _fetch() async {
    try {
      final client = await (_client ??= _factory()).timeout(
        const Duration(seconds: 5),
      );
      final response = await client
          .get(
            Uri.https(
              'firebaseremoteconfig.googleapis.com',
              '/v1/projects/$projectId/remoteConfig',
            ),
          )
          .timeout(const Duration(seconds: 5));
      if (response.statusCode != 200) {
        throw StateError('Remote Config unavailable');
      }
      final body = jsonDecode(response.body) as Map;
      final parameters = body['parameters'] as Map? ?? {};
      _flags = {
        for (final name in ['launch_enabled', 'amps_enabled'])
          name:
              parameters[name] is Map &&
              (parameters[name] as Map)['defaultValue'] is Map &&
              ((parameters[name] as Map)['defaultValue'] as Map)['value'] ==
                  'true',
      };
      _expires = _clock().add(const Duration(seconds: 60));
    } on Object {
      // Never reuse enabled flags after an outage. Bound retries per instance.
      _flags = const {'launch_enabled': false, 'amps_enabled': false};
      _expires = _clock().add(const Duration(seconds: 15));
    }
    return Map.of(_flags);
  }
}
