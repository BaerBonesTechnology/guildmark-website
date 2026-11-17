import 'dart:convert';
import 'package:guildmark_api/firebase/remote_config.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:test/test.dart';

void main() {
  test(
    'Remote Config exposes only exact boolean defaults, caches and fails closed',
    () async {
      var now = DateTime.utc(2026);
      var calls = 0;
      var failure = false;
      final rc = FirebaseRemoteConfig(
        projectId: 'guildmark-test',
        clock: () => now,
        client: () async => MockClient((r) async {
          calls++;
          expect(
            r.url.toString(),
            'https://firebaseremoteconfig.googleapis.com/v1/projects/guildmark-test/remoteConfig',
          );
          if (failure) return http.Response('PRIVATE_CONFIG', 503);
          return http.Response(
            jsonEncode({
              'parameters': {
                'launch_enabled': {
                  'defaultValue': {'value': 'true'},
                },
                'amps_enabled': {
                  'defaultValue': {'value': 'false'},
                  'conditionalValues': {
                    'all': {'value': 'true'},
                  },
                },
                'api_secret': {
                  'defaultValue': {'value': 'SECRET'},
                },
              },
            }),
            200,
          );
        }),
      );
      expect(await rc.flags(), {'launch_enabled': true, 'amps_enabled': false});
      final copy = await rc.flags();
      copy['launch_enabled'] = false;
      expect((await rc.flags())['launch_enabled'], true);
      expect(calls, 1);
      failure = true;
      now = now.add(const Duration(seconds: 61));
      expect(await rc.flags(), {
        'launch_enabled': false,
        'amps_enabled': false,
      });
      expect(calls, 2);
      await rc.flags();
      expect(calls, 2);
    },
  );
  test('Remote Config refuses a demo cloud fallback', () {
    expect(
      () => FirebaseRemoteConfig(projectId: 'demo-guildmark'),
      throwsArgumentError,
    );
  });
}
