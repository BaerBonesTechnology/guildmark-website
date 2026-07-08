import 'package:dart_appwrite/dart_appwrite.dart' show AppwriteException, ID;
import 'package:dart_appwrite/models.dart' show Row;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/webauthn/webauthn.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final cfg = context.read<AppConfig>();
  final jwt = context.read<JwtService>();
  final aw = context.read<AppwriteService?>();
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
  final claims = jwt.verifyAccessToken(raw);

  if (claims == null || claims.companyId != 'devdash_setup') {
    return unauthorized('Valid setup token required');
  }

  final employeeId = claims.userId;

  // ── Parse body ───────────────────────────────────────────────────────────
  final body = await context.request.json() as Map<String, dynamic>?;
  final challengeId = body?['challenge_id'] as String?;
  final credentialId = body?['credential_id'] as String?;
  final attestationB64 = body?['attestation_object'] as String?;
  final clientDataB64 = body?['client_data_json'] as String?;
  final friendlyName = (body?['friendly_name'] as String?)?.trim();

  if (challengeId == null ||
      credentialId == null ||
      attestationB64 == null ||
      clientDataB64 == null) {
    return badRequest(
      'challenge_id, credential_id, attestation_object, client_data_json required',
    );
  }

  // ── Load the challenge ────────────────────────────────────────────────────
  // PG did DELETE … RETURNING (consume-first). Appwrite has no conditional
  // delete-returning, so we read it here and delete it after clientData
  // verification (the consume step below is the single-use commit point).
  Row chalRow;
  try {
    chalRow = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.employeePasskeyChallenges,
      rowId: challengeId,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) {
      return badRequest(
        'Challenge not found, expired, or already used',
        code: 'INVALID_CHALLENGE',
      );
    }
    rethrow;
  }
  final chalData = chalRow.data;
  final chalExpires = DateTime.parse(chalData['expires_at'] as String);
  if (chalData['employee_id'] != employeeId ||
      chalData['type'] != 'registration' ||
      !chalExpires.isAfter(DateTime.now().toUtc())) {
    return badRequest(
      'Challenge not found, expired, or already used',
      code: 'INVALID_CHALLENGE',
    );
  }
  final expectedChallenge = chalData['challenge'].toString();

  // ── Decode clientDataJSON and verify ─────────────────────────────────────
  final clientDataBytes = fromBase64Url(clientDataB64);
  try {
    verifyClientData(
      clientDataJson: clientDataBytes,
      expectedChallenge: expectedChallenge,
      expectedType: 'webauthn.create',
      expectedOrigin: _origin(cfg.webauthnRpId!),
    );
  } on FormatException catch (e) {
    return badRequest(
      'clientData verification failed: $e',
      code: 'CLIENT_DATA_MISMATCH',
    );
  }

  // ── Parse attestation object → authData → credential ─────────────────────
  final ParsedCredential cred;
  try {
    final attObjBytes = fromBase64Url(attestationB64);
    final authData = parseAttestationObject(attObjBytes);
    cred = parseAuthData(authData);
  } on FormatException catch (e) {
    return badRequest(
      'Attestation parsing failed: $e',
      code: 'ATTESTATION_ERROR',
    );
  }

  // ── Verify the credential ID returned matches what was parsed ─────────────
  final parsedCredId = toBase64Url(cred.credentialId);
  if (parsedCredId != credentialId.replaceAll('=', '')) {
    return badRequest('credential_id mismatch', code: 'CREDENTIAL_ID_MISMATCH');
  }

  // ── Consume challenge (single-use) ───────────────────────────────────────
  // Two concurrent completes could both pass the read above; this delete is
  // the tie-breaker — the loser gets a 404 and is rejected.
  try {
    await db.deleteRow(
      databaseId: Aw.databaseId,
      tableId: Aw.employeePasskeyChallenges,
      rowId: challengeId,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) {
      return badRequest(
        'Challenge not found, expired, or already used',
        code: 'INVALID_CHALLENGE',
      );
    }
    rethrow;
  }

  // ── Persist the new passkey ───────────────────────────────────────────────
  try {
    await db.createRow(
      databaseId: Aw.databaseId,
      tableId: Aw.employeePasskeys,
      rowId: ID.unique(),
      data: {
        'employee_id': employeeId,
        'credential_id': credentialId,
        'public_key_x': toBase64Url(cred.publicKeyX),
        'public_key_y': toBase64Url(cred.publicKeyY),
        'sign_count': cred.signCount,
        'aaguid': cred.aaguid,
        'friendly_name': (friendlyName?.isNotEmpty ?? false)
            ? friendlyName
            : 'Passkey',
      },
    );
  } on AppwriteException catch (e) {
    // credential_id unique index violation means already registered
    if (e.code == 409) {
      return badRequest(
        'This passkey is already registered',
        code: 'DUPLICATE_CREDENTIAL',
      );
    }
    rethrow;
  }

  // ── Issue full access JWT ─────────────────────────────────────────────────
  Row emp;
  try {
    emp = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.guildmarkEmployees,
      rowId: employeeId,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) return serverError('Employee vanished');
    rethrow;
  }

  final email = emp.data['email'].toString();
  final fullName = emp.data['full_name']?.toString() ?? email;
  final role = emp.data['role']?.toString() ?? 'admin';

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
