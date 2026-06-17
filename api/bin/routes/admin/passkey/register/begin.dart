import 'dart:math';
import 'dart:typed_data';

import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/auth/jwt.dart';
import '../../../../lib/config.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';
import '../../../../lib/webauthn/webauthn.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final cfg = context.read<AppConfig>();
  final jwt = context.read<JwtService>();
  final db = context.read<Db>();

  if (cfg.webauthnRpId == null) {
    return serverError('WebAuthn not configured (WEBAUTHN_RP_ID missing)');
  }

  // ── Verify setup token ───────────────────────────────────────────────────
  final authHeader = context.request.headers['Authorization'] ?? '';
  final raw = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  final claims = jwt.verifyAccessToken(raw);

  if (claims == null || claims.companyId != 'devdash_setup') {
    return unauthorized('Valid setup token required');
  }

  final employeeId = claims.userId;

  // ── Look up the employee for user info ───────────────────────────────────
  final empRows = await db.query(
    'SELECT email::text, full_name FROM guildmark_employees WHERE id = @id LIMIT 1',
    parameters: {'id': employeeId},
  );
  if (empRows.isEmpty) return unauthorized('Employee not found');

  final emp = empRows.first.toColumnMap();
  final email = emp['email'].toString();
  final fullName = emp['full_name']?.toString() ?? email;

  // ── Generate challenge ───────────────────────────────────────────────────
  final challengeBytes = _randomBytes(32);
  final challengeB64 = toBase64Url(challengeBytes);

  final chalRows = await db.query(
    '''
    INSERT INTO employee_passkey_challenges
      (employee_id, challenge, type)
    VALUES (@eid, @chal, 'registration')
    RETURNING id::text
    ''',
    parameters: {'eid': employeeId, 'chal': challengeB64},
  );
  final challengeId = chalRows.first.toColumnMap()['id'].toString();

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
      ],
      'authenticator_selection': {
        'resident_key': 'preferred',
        'user_verification': 'preferred',
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
