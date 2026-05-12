/// POST /admin/passkey/register/complete
///
/// Completes the WebAuthn registration ceremony.
///
/// Auth: Bearer token with companyId == 'devdash_setup'.
///
/// Body:
///   {
///     challenge_id:     string  — from /register/begin
///     credential_id:    string  — base64url, from navigator.credentials.create()
///     attestation_object: string — base64url CBOR attestation object
///     client_data_json: string  — base64url JSON from the authenticator
///     friendly_name:    string? — optional human label (e.g. "Work MacBook")
///   }
///
/// On success:
///   Issues a full access JWT and returns { access_token, employee }
library;

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
  final db  = context.read<Db>();

  if (cfg.webauthnRpId == null) {
    return serverError('WebAuthn not configured (WEBAUTHN_RP_ID missing)');
  }

  // ── Verify setup token ───────────────────────────────────────────────────
  final authHeader = context.request.headers['Authorization'] ?? '';
  final raw        = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  final claims     = jwt.verifyAccessToken(raw);

  if (claims == null || claims.companyId != 'devdash_setup') {
    return unauthorized('Valid setup token required');
  }

  final employeeId = claims.userId;

  // ── Parse body ───────────────────────────────────────────────────────────
  final body = await context.request.json() as Map<String, dynamic>?;
  final challengeId      = body?['challenge_id']      as String?;
  final credentialId     = body?['credential_id']     as String?;
  final attestationB64   = body?['attestation_object'] as String?;
  final clientDataB64    = body?['client_data_json']  as String?;
  final friendlyName     = (body?['friendly_name'] as String?)?.trim();

  if (challengeId == null || credentialId == null ||
      attestationB64 == null || clientDataB64 == null) {
    return badRequest('challenge_id, credential_id, attestation_object, client_data_json required');
  }

  // ── Consume challenge (single-use) ───────────────────────────────────────
  final chalRows = await db.query(
    '''
    DELETE FROM employee_passkey_challenges
    WHERE id = @cid
      AND employee_id = @eid
      AND type = 'registration'
      AND expires_at > now()
    RETURNING challenge
    ''',
    parameters: {'cid': challengeId, 'eid': employeeId},
  );
  if (chalRows.isEmpty) {
    return badRequest('Challenge not found, expired, or already used', code: 'INVALID_CHALLENGE');
  }
  final expectedChallenge = chalRows.first.toColumnMap()['challenge'].toString();

  // ── Decode clientDataJSON and verify ─────────────────────────────────────
  final clientDataBytes = fromBase64Url(clientDataB64);
  try {
    verifyClientData(
      clientDataJson:     clientDataBytes,
      expectedChallenge:  expectedChallenge,
      expectedType:       'webauthn.create',
      expectedOrigin:     _origin(cfg.webauthnRpId!),
    );
  } on FormatException catch (e) {
    return badRequest('clientData verification failed: $e', code: 'CLIENT_DATA_MISMATCH');
  }

  // ── Parse attestation object → authData → credential ─────────────────────
  final ParsedCredential cred;
  try {
    final attObjBytes = fromBase64Url(attestationB64);
    final authData    = parseAttestationObject(attObjBytes);
    cred              = parseAuthData(authData);
  } on FormatException catch (e) {
    return badRequest('Attestation parsing failed: $e', code: 'ATTESTATION_ERROR');
  }

  // ── Verify the credential ID returned matches what was parsed ─────────────
  final parsedCredId = toBase64Url(cred.credentialId);
  if (parsedCredId != credentialId.replaceAll('=', '')) {
    return badRequest('credential_id mismatch', code: 'CREDENTIAL_ID_MISMATCH');
  }

  // ── Persist the new passkey ───────────────────────────────────────────────
  try {
    await db.query(
      '''
      INSERT INTO employee_passkeys
        (employee_id, credential_id, public_key_x, public_key_y,
         sign_count, aaguid, friendly_name)
      VALUES
        (@eid, @cred_id, @pk_x, @pk_y, @sc, @aaguid, @name)
      ''',
      parameters: {
        'eid':     employeeId,
        'cred_id': credentialId,
        'pk_x':    toBase64Url(cred.publicKeyX),
        'pk_y':    toBase64Url(cred.publicKeyY),
        'sc':      cred.signCount,
        'aaguid':  cred.aaguid,
        'name':    (friendlyName?.isNotEmpty == true) ? friendlyName : 'Passkey',
      },
    );
  } catch (e) {
    // credential_id UNIQUE violation means already registered
    if (e.toString().contains('unique') || e.toString().contains('duplicate')) {
      return badRequest('This passkey is already registered', code: 'DUPLICATE_CREDENTIAL');
    }
    rethrow;
  }

  // ── Issue full access JWT ─────────────────────────────────────────────────
  final empRows = await db.query(
    'SELECT email::text, full_name, role::text FROM guildmark_employees WHERE id = @id LIMIT 1',
    parameters: {'id': employeeId},
  );
  if (empRows.isEmpty) return serverError('Employee vanished');

  final emp      = empRows.first.toColumnMap();
  final email    = emp['email'].toString();
  final fullName = emp['full_name']?.toString() ?? email;
  final role     = emp['role']?.toString() ?? 'admin';

  final token = jwt.issueAccessToken(
    AccessClaims(userId: employeeId, companyId: 'devdash', role: role),
  );

  return Response.json(body: {
    'access_token': token,
    'employee': {
      'id':        employeeId,
      'email':     email,
      'full_name': fullName,
      'role':      role,
    },
  });
}

/// Derive origin from RP ID. Assumes HTTPS in production, allows HTTP for localhost.
String _origin(String rpId) {
  if (rpId == 'localhost' || rpId.startsWith('localhost:')) {
    return 'http://$rpId';
  }
  return 'https://$rpId';
}
