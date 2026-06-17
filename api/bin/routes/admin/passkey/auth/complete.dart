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

  // ── Parse body ───────────────────────────────────────────────────────────
  final body = await context.request.json() as Map<String, dynamic>?;
  final challengeId = body?['challenge_id'] as String?;
  final credentialId = body?['credential_id'] as String?;
  final authDataB64 = body?['authenticator_data'] as String?;
  final clientDataB64 = body?['client_data_json'] as String?;
  final signatureB64 = body?['signature'] as String?;

  if (challengeId == null ||
      credentialId == null ||
      authDataB64 == null ||
      clientDataB64 == null ||
      signatureB64 == null) {
    return badRequest(
      'challenge_id, credential_id, authenticator_data, client_data_json, signature required',
    );
  }

  // ── Consume challenge — identifies the employee ───────────────────────────
  final chalRows = await db.query(
    '''
    DELETE FROM employee_passkey_challenges
    WHERE id = @cid
      AND type = 'authentication'
      AND expires_at > now()
    RETURNING challenge, employee_id::text
    ''',
    parameters: {'cid': challengeId},
  );
  if (chalRows.isEmpty) {
    return badRequest(
      'Challenge not found, expired, or already used',
      code: 'INVALID_CHALLENGE',
    );
  }

  final chalRow = chalRows.first.toColumnMap();
  final expectedChallenge = chalRow['challenge'].toString();
  final employeeId = chalRow['employee_id'].toString();

  // ── Look up the passkey by credential_id ─────────────────────────────────
  final pkRows = await db.query(
    '''
    SELECT id::text, public_key_x, public_key_y, sign_count
    FROM employee_passkeys
    WHERE employee_id = @eid AND credential_id = @cred
    LIMIT 1
    ''',
    parameters: {'eid': employeeId, 'cred': credentialId},
  );
  if (pkRows.isEmpty) {
    return unauthorized('Passkey not found for this employee');
  }

  final pk = pkRows.first.toColumnMap();
  final passkeyRowId = pk['id'].toString();
  final storedCount = (pk['sign_count'] as num).toInt();
  final pkX = fromBase64Url(pk['public_key_x'].toString());
  final pkY = fromBase64Url(pk['public_key_y'].toString());

  // ── Verify clientDataJSON ─────────────────────────────────────────────────
  final clientDataBytes = fromBase64Url(clientDataB64);
  try {
    verifyClientData(
      clientDataJson: clientDataBytes,
      expectedChallenge: expectedChallenge,
      expectedType: 'webauthn.get',
      expectedOrigin: _origin(cfg.webauthnRpId!),
    );
  } on FormatException catch (e) {
    return unauthorized('clientData verification failed: $e');
  }

  // ── Verify ECDSA signature ────────────────────────────────────────────────
  final authDataBytes = fromBase64Url(authDataB64);
  final derSignature = fromBase64Url(signatureB64);

  final valid = await verifyAssertion(
    authenticatorData: authDataBytes,
    clientDataJson: clientDataBytes,
    derSignature: derSignature,
    publicKeyX: pkX,
    publicKeyY: pkY,
  );

  if (!valid) return unauthorized('Signature verification failed');

  // ── Replay / clone detection via sign count ───────────────────────────────
  // Parse signCount from authData bytes [33-36]
  if (authDataBytes.length >= 37) {
    final newCount =
        (authDataBytes[33] << 24) |
        (authDataBytes[34] << 16) |
        (authDataBytes[35] << 8) |
        authDataBytes[36];
    if (storedCount > 0 && newCount <= storedCount) {
      // Possible cloned authenticator — reject
      return unauthorized('Sign count replay detected');
    }
    await db.query(
      '''
      UPDATE employee_passkeys
      SET sign_count = @sc, last_used_at = now()
      WHERE id = @id
      ''',
      parameters: {'sc': newCount, 'id': passkeyRowId},
    );
  } else {
    // Authenticator doesn't implement counter — just update last_used_at
    await db.query(
      'UPDATE employee_passkeys SET last_used_at = now() WHERE id = @id',
      parameters: {'id': passkeyRowId},
    );
  }

  // ── Issue full access JWT ─────────────────────────────────────────────────
  final empRows = await db.query(
    '''
    SELECT email::text, full_name, role::text
    FROM guildmark_employees WHERE id = @id LIMIT 1
    ''',
    parameters: {'id': employeeId},
  );
  if (empRows.isEmpty) return serverError('Employee not found');

  final emp = empRows.first.toColumnMap();
  final email = emp['email'].toString();
  final fullName = emp['full_name']?.toString() ?? email;
  final role = emp['role']?.toString() ?? 'admin';

  // Update last_login_at
  await db.query(
    'UPDATE guildmark_employees SET last_login_at = now() WHERE id = @id',
    parameters: {'id': employeeId},
  );

  final token = jwt.issueAccessToken(
    AccessClaims(userId: employeeId, companyId: 'devdash', role: role),
  );

  return Response.json(
    body: {
      'access_token': token,
      'employee': {
        'id': employeeId,
        'email': email,
        'full_name': fullName,
        'role': role,
      },
    },
  );
}

String _origin(String rpId) {
  if (rpId == 'localhost' || rpId.startsWith('localhost:')) {
    return 'http://$rpId';
  }
  return 'https://$rpId';
}
