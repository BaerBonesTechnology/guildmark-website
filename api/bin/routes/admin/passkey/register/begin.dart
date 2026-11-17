import 'dart:math';
import 'dart:typed_data';

import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/webauthn/webauthn.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final cfg = context.read<AppConfig>();
  final jwt = context.read<JwtService>();
  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  if (cfg.webauthnRpId == null) {
    return serverError('WebAuthn not configured (WEBAUTHN_RP_ID missing)');
  }

  // ── Verify setup token ───────────────────────────────────────────────────
  final authHeader = context.request.headers['Authorization'] ?? '';
  final raw = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  final sessions = firebaseSessions(context);
  final claims = sessions == null ? jwt.verifyAccessToken(raw) : null;
  final firebasePrincipal = sessions == null
      ? null
      : await sessions.principal(raw);

  if (sessions == null
      ? (claims == null ||
            claims.companyId != 'devdash_setup' ||
            claims.audience != 'staff_setup')
      : (firebasePrincipal == null ||
            firebasePrincipal.audience != 'staff_setup')) {
    return unauthorized('Valid setup token required');
  }

  final employeeId = firebasePrincipal?.userId ?? claims!.userId;

  // ── Look up the employee for user info ───────────────────────────────────
  Row emp;
  try {
    emp = await db.getRow(
      databaseId: Collections.databaseId,
      tableId: Collections.guildmarkEmployees,
      rowId: employeeId,
    );
  } on DatastoreException catch (e) {
    if (e.code == 404) return unauthorized('Employee not found');
    rethrow;
  }

  final email = emp.data['email'].toString();
  final fullName = emp.data['full_name']?.toString() ?? email;

  // ── Generate challenge ───────────────────────────────────────────────────
  final challengeBytes = _randomBytes(32);
  final challengeB64 = toBase64Url(challengeBytes);

  // PG set expires_at via a column default (now() + 5 minutes); Appwrite has
  // no expression defaults, so compute it here.
  final chalRow = await db.createRow(
    databaseId: Collections.databaseId,
    tableId: Collections.employeePasskeyChallenges,
    rowId: ID.unique(),
    data: {
      'employee_id': employeeId,
      'challenge': challengeB64,
      'type': 'registration',
      'expires_at': DateTime.now()
          .toUtc()
          .add(const Duration(minutes: 5))
          .toIso8601String(),
    },
  );
  final challengeId = chalRow.$id;

  return Response.json(
    body: {
      'challenge_id': challengeId,
      'challenge': challengeB64,
      'rp': {
        'id': cfg.webauthnRpId,
        'name': cfg.webauthnRpName ?? 'GuildMark DevDash',
      },
      'user': {
        'id': toBase64Url(employeeId.codeUnits),
        'name': email,
        'display_name': fullName,
      },
      'pub_key_cred_params': [
        {'type': 'public-key', 'alg': -7}, // ES256
        {'type': 'public-key', 'alg': -257}, // RS256 (Windows Hello)
      ],
      'authenticator_selection': {
        'resident_key': 'preferred',
        'user_verification': 'required',
        'authenticator_attachment': 'platform',
      },
      'timeout': 60000,
      'attestation': 'none',
    },
  );
}

Uint8List _randomBytes(int length) {
  final rng = Random.secure();
  return Uint8List.fromList(
    List<int>.generate(length, (_) => rng.nextInt(256)),
  );
}
