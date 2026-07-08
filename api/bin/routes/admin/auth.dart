import 'dart:math';
import 'dart:typed_data';

import 'package:dart_appwrite/dart_appwrite.dart' show ID, Query;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
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

  final body = await context.request.json() as Map<String, dynamic>?;
  final email =
      (body?['email'] as String?)?.trim().toLowerCase() ??
      (body?['username'] as String?)?.trim().toLowerCase();
  final password = body?['password'] as String?;

  if (email == null || email.isEmpty || password == null || password.isEmpty) {
    return badRequest('email and password are required');
  }

  final cfg = context.read<AppConfig>();
  final jwt = context.read<JwtService>();
  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // ── 1. Employee table lookup ─────────────────────────────────────────────
  final rows = await db.listRows(
    databaseId: Aw.databaseId,
    tableId: Aw.guildmarkEmployees,
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

    if (!verifyPassword(password, hash)) {
      return unauthorized('Invalid credentials');
    }

    final id = row.$id;
    final role = data['full_name'] != null
        ? data['role'].toString()
        : 'admin';
    final fullName = data['full_name']?.toString() ?? 'Employee';

    // Update last_login_at
    await db.updateRow(
      databaseId: Aw.databaseId,
      tableId: Aw.guildmarkEmployees,
      rowId: id,
      data: {'last_login_at': DateTime.now().toUtc().toIso8601String()},
    );

    // ── Passkey 2FA (only when WEBAUTHN_RP_ID is configured) ────────────────
    if (cfg.webauthnRpId != null) {
      // Check for existing passkeys (an employee has at most a handful).
      final pkRows = await db.listRows(
        databaseId: Aw.databaseId,
        tableId: Aw.employeePasskeys,
        queries: [
          Query.equal('employee_id', id),
          Query.orderAsc(r'$createdAt'),
          Query.limit(100),
        ],
      );

      if (pkRows.rows.isNotEmpty) {
        // ── Path A: employee has passkeys — issue authentication challenge ──
        final challengeBytes = _randomBytes(32);
        final challengeB64 = toBase64Url(challengeBytes);

        // PG set expires_at via a column default (now() + 5 minutes);
        // Appwrite has no expression defaults, so compute it here.
        final chalRow = await db.createRow(
          databaseId: Aw.databaseId,
          tableId: Aw.employeePasskeyChallenges,
          rowId: ID.unique(),
          data: {
            'employee_id': id,
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
        final setupToken = jwt.issueAccessToken(
          AccessClaims(userId: id, companyId: 'devdash_setup', role: role),
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
      AccessClaims(userId: id, companyId: 'devdash', role: 'admin'),
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
  if (cfg.adminAuthUser != null && cfg.adminAuthPass != null) {
    final userMatch = constantTimeEquals(email, cfg.adminAuthUser!);
    final passMatch = constantTimeEquals(password, cfg.adminAuthPass!);
    if (userMatch && passMatch) {
      final token = jwt.issueAccessToken(
        AccessClaims(userId: 'admin', companyId: 'devdash', role: 'admin'),
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
