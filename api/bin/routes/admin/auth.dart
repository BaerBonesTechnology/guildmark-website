import 'dart:math';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'dart:typed_data';

import 'package:guildmark_api/firebase/firestore.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/crypto_utils.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/webauthn/webauthn.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  if (firebaseSessions(context) != null &&
      !(context.request.headers['content-type'] ?? '').startsWith(
        'application/json',
      )) {
    return badRequest('JSON body required');
  }
  final body = await context.request.json() as Map<String, dynamic>?;
  final email =
      (body?['email'] as String?)?.trim().toLowerCase() ??
      (body?['username'] as String?)?.trim().toLowerCase();
  final password = body?['password'] as String?;

  if (email == null || email.isEmpty || password == null || password.isEmpty) {
    return badRequest('email and password are required');
  }

  final cfg = context.read<AppConfig>();
  final sessions = firebaseSessions(context);
  if (sessions != null && cfg.webauthnRpId == null) {
    return jsonError(503, 'MFA_REQUIRED', 'Staff passkeys must be configured');
  }
  final jwt = context.read<JwtService>();
  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // ── 1. Employee table lookup ─────────────────────────────────────────────
  final rows = await db.listRows(
    databaseId: Collections.databaseId,
    tableId: Collections.guildmarkEmployees,
    queries: [
      Query.equal('email', email),
      Query.equal('is_active', true),
      Query.limit(1),
    ],
  );

  if (rows.rows.isNotEmpty) {
    final row = rows.rows.first;
    final data = row.data;
    final hash = data['password_hash'].toString();

    Map<String, dynamic>? firebaseLogin;
    if (sessions != null) {
      try {
        firebaseLogin = await sessions.auth.signIn(email, password);
        if (data['firebase_uid'] != firebaseLogin['localId']) {
          return unauthorized('Invalid credentials');
        }
      } on FirebaseAuthFailure catch (e) {
        return e.code == 'AUTH_UNAVAILABLE'
            ? jsonError(
                503,
                'AUTH_UNAVAILABLE',
                'Authentication temporarily unavailable',
              )
            : unauthorized('Invalid credentials');
      }
    } else if (!verifyPassword(password, hash)) {
      return unauthorized('Invalid credentials');
    }

    final id = row.$id;
    final role = data['role']?.toString() ?? 'support';
    final fullName = data['full_name']?.toString() ?? 'Employee';

    // Update last_login_at
    await db.updateRow(
      databaseId: Collections.databaseId,
      tableId: Collections.guildmarkEmployees,
      rowId: id,
      data: {'last_login_at': DateTime.now().toUtc().toIso8601String()},
    );

    // ── Passkey 2FA (only when WEBAUTHN_RP_ID is configured) ────────────────
    if (cfg.webauthnRpId != null) {
      // Check for existing passkeys (an employee has at most a handful).
      final pkRows = await db.listRows(
        databaseId: Collections.databaseId,
        tableId: Collections.employeePasskeys,
        queries: [
          Query.equal('employee_id', id),
          Query.orderAsc(r'$createdAt'),
          Query.limit(100),
        ],
      );

      if (pkRows.rows.isNotEmpty) {
        // ── Path A: employee has passkeys — issue authentication challenge ──
        final pending = sessions == null
            ? null
            : await sessions.issue(firebaseLogin!, 'staff_pending');
        final challengeBytes = _randomBytes(32);
        final challengeB64 = toBase64Url(challengeBytes);

        // PG set expires_at via a column default (now() + 5 minutes);
        // Appwrite has no expression defaults, so compute it here.
        final chalRow = await db.createRow(
          databaseId: Collections.databaseId,
          tableId: Collections.employeePasskeyChallenges,
          rowId: ID.unique(),
          data: {
            'employee_id': id,
            if (pending != null)
              'firebase_session_hash': FirebaseSessions.digest(pending),
            'challenge': challengeB64,
            'type': 'authentication',
            'expires_at': DateTime.now()
                .toUtc()
                .add(const Duration(minutes: 5))
                .toIso8601String(),
          },
        );
        final challengeId = chalRow.$id;

        final allowCredentials = pkRows.rows
            .map(
              (r) => {
                'id': r.data['credential_id'].toString(),
                'type': 'public-key',
              },
            )
            .toList();

        return Response.json(
          body: {
            'requires_passkey': true,
            'challenge_id': challengeId,
            'challenge': challengeB64,
            'allow_credentials': allowCredentials,
          },
        );
      } else {
        // ── Path B: no passkeys yet — issue a setup token ───────────────────
        final setupToken = sessions != null
            ? await sessions.issue(firebaseLogin!, 'staff_setup')
            : jwt.issueAccessToken(
                AccessClaims(
                  userId: id,
                  companyId: 'devdash_setup',
                  role: role,
                  audience: 'staff_setup',
                ),
              );
        return Response.json(
          body: {
            'requires_passkey_setup': true,
            'setup_token': setupToken,
            'employee': {
              'id': id,
              'email': email,
              'full_name': fullName,
              'role': role,
            },
          },
        );
      }
    }

    // ── Path C: passkeys not configured — issue full JWT immediately ─────────
    final token = jwt.issueAccessToken(
      AccessClaims(
        userId: id,
        companyId: 'devdash',
        role: role,
        audience: 'staff',
      ),
    );
    return Response.json(
      body: {
        'access_token': token,
        'employee': {
          'id': id,
          'email': email,
          'full_name': fullName,
          'role': role,
        },
      },
    );
  }

  // ── 2. Env-var fallback (bootstrap / emergency access) ───────────────────
  if (sessions == null &&
      cfg.adminAuthUser != null &&
      cfg.adminAuthPass != null) {
    final userMatch = constantTimeEquals(email, cfg.adminAuthUser!);
    final passMatch = constantTimeEquals(password, cfg.adminAuthPass!);
    if (userMatch && passMatch) {
      final token = jwt.issueAccessToken(
        AccessClaims(
          userId: 'admin',
          companyId: 'devdash',
          role: 'admin',
          audience: 'staff',
        ),
      );
      return Response.json(
        body: {
          'access_token': token,
          'employee': {
            'id': 'admin',
            'email': cfg.adminAuthUser!,
            'full_name': 'Admin',
            'role': 'superadmin',
          },
        },
      );
    }
  }

  return unauthorized('Invalid credentials');
}

Uint8List _randomBytes(int length) {
  final rng = Random.secure();
  return Uint8List.fromList(
    List<int>.generate(length, (_) => rng.nextInt(256)),
  );
}
