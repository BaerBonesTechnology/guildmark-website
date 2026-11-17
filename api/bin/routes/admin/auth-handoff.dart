import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/admin_handoff.dart';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext c) async {
  if (c.request.method != HttpMethod.post)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  final cfg = c.read<AppConfig>();
  final sessions = firebaseSessions(c);
  final db = c.read<FirebaseService?>();
  if (cfg.firebaseProjectId != 'guildmark-dev' ||
      sessions == null ||
      db == null)
    return jsonError(
      503,
      'HANDOFF_UNAVAILABLE',
      'Staff sign-in transfer unavailable.',
    );
  try {
    final body = await boundedJson(c.request);
    if (body is! Map<String, dynamic> ||
        body['state'] is! String ||
        !RegExp(r'^[a-f0-9]{64}$').hasMatch(body['state'] as String))
      return badRequest('Invalid sign-in state');
    final service = AdminHandoff(db, sessions.resolveHash);
    final origin = c.request.headers['origin'];
    if (body['action'] == 'issue') {
      final principal = c.read<AuthPrincipal?>();
      final raw = bearer(c);
      if (principal?.audience != 'staff' || raw == null)
        return unauthorized('Verified staff session required');
      if (origin != cfg.adminCorsOrigin ||
          body['target_origin'] != cfg.corsOrigin)
        return forbidden('Sign-in target not allowed');
      final code = await service.issue(
        FirebaseSessions.digest(raw),
        body['state'] as String,
        cfg.corsOrigin,
      );
      return Response.json(
        headers: {'Cache-Control': 'no-store'},
        body: {'code': code},
      );
    }
    if (body['action'] == 'redeem') {
      final code = body['code'];
      if (origin != cfg.corsOrigin)
        return forbidden('Sign-in origin not allowed');
      if (code is! String || !RegExp(r'^[a-zA-Z0-9_-]{32,128}$').hasMatch(code))
        return badRequest('Invalid sign-in code');
      final token = await service.redeem(
        code,
        body['state'] as String,
        origin!,
      );
      return Response.json(
        headers: {'Cache-Control': 'no-store'},
        body: {'access_token': token},
      );
    }
    return badRequest('Unsupported sign-in action');
  } on FirebaseAuthFailure {
    return unauthorized(
      'Sign-in transfer expired or already used. Sign in again.',
    );
  } on DatastoreException {
    return unauthorized(
      'Sign-in transfer expired or already used. Sign in again.',
    );
  }
}
