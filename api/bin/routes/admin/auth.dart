import 'dart:math';
import 'dart:typed_data';

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/crypto_utils.dart';
import 'package:guildmark_api/db/pool.dart';
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
  final db = context.read<Db>();

  // ── 1. Employee table lookup ─────────────────────────────────────────────
  final rows = await db.query(
    '''
    SELECT id::text, email::text, password_hash, full_name, role::text
    FROM guildmark_employees
    WHERE email = @email AND is_active = true
    LIMIT 1
    ''',
    parameters: {'email': email},
  );

  if (rows.isNotEmpty) {
    final row = rows.first.toColumnMap();
    final hash = row['password_hash'].toString();

    if (!verifyPassword(password, hash))
      return unauthorized('Invalid credentials');

    final id = row['id'].toString();
    final role = row['full_name'] != null ? row['role'].toString() : 'admin';
    final fullName = row['full_name']?.toString() ?? 'Employee';

    // Update last_login_at
    await db.query(
      'UPDATE guildmark_employees SET last_login_at = now() WHERE id = @id',
      parameters: {'id': id},
    );

    // ── Passkey 2FA (only when WEBAUTHN_RP_ID is configured) ────────────────
    if (cfg.webauthnRpId != null) {
      // Check for existing passkeys
      final pkRows = await db.query(
        '''
        SELECT credential_id
        FROM employee_passkeys
        WHERE employee_id = @eid
        ORDER BY created_at ASC
        ''',
        parameters: {'eid': id},
      );

      if (pkRows.isNotEmpty) {
        // ── Path A: employee has passkeys — issue authentication challenge ──
        final challengeBytes = _randomBytes(32);
        final challengeB64 = toBase64Url(challengeBytes);

        final chalRows = await db.query(
          '''
          INSERT INTO employee_passkey_challenges
            (employee_id, challenge, type)
          VALUES (@eid, @chal, 'authentication')
          RETURNING id::text
          ''',
          parameters: {'eid': id, 'chal': challengeB64},
        );
        final challengeId = chalRows.first.toColumnMap()['id'].toString();

        final allowCredentials = pkRows.map((r) {
          final cred = r.toColumnMap()['credential_id'].toString();
          return {'id': cred, 'type': 'public-key'};
        }).toList();

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
