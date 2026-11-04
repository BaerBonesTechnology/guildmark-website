import 'dart:typed_data';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';

import 'package:guildmark_api/firebase/collections.dart';
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
  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

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

  // ── Load challenge — identifies the employee ──────────────────────────────
  // PG did DELETE … RETURNING (consume-first). Appwrite has no conditional
  // delete-returning, so we read it here and delete it AFTER the assertion
  // verifies (the consume step). Race window: a failed attempt leaves the
  // challenge live until its 5-minute expiry, and two concurrent completes
  // could both pass the read — the deleteRow below is the commit point and
  // rejects the loser with a 404.
  Row chalRow;
  try {
    chalRow = await db.getRow(
      databaseId: Collections.databaseId,
      tableId: Collections.employeePasskeyChallenges,
      rowId: challengeId,
    );
  } on DatastoreException catch (e) {
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
  final employeeIdRaw = chalData['employee_id'] as String?;
  if (chalData['type'] != 'authentication' ||
      employeeIdRaw == null ||
      !chalExpires.isAfter(DateTime.now().toUtc())) {
    return badRequest(
      'Challenge not found, expired, or already used',
      code: 'INVALID_CHALLENGE',
    );
  }
  final expectedChallenge = chalData['challenge'].toString();
  final employeeId = employeeIdRaw;

  // ── Look up the passkey by credential_id ─────────────────────────────────
  final pkRows = await db.listRows(
    databaseId: Collections.databaseId,
    tableId: Collections.employeePasskeys,
    queries: [
      Query.equal('employee_id', employeeId),
      Query.equal('credential_id', credentialId),
      Query.limit(1),
    ],
  );
  if (pkRows.rows.isEmpty) {
    return unauthorized('Passkey not found for this employee');
  }

  final pk = pkRows.rows.first;
  final passkeyRowId = pk.$id;
  final storedCount = (pk.data['sign_count'] as num? ?? 0).toInt();
  // Existing ES256 records predate the algorithm field.
  final algorithm = (pk.data['algorithm'] as num?)?.toInt() ?? -7;
  Uint8List? keyBytes(String field) {
    final encoded = pk.data[field];
    if (encoded is! String) return null;
    try {
      return fromBase64Url(encoded);
    } on FormatException {
      return null;
    }
  }

  // ── Verify clientDataJSON ─────────────────────────────────────────────────
  final clientDataBytes = fromBase64Url(clientDataB64);
  try {
    verifyClientData(
      clientDataJson: clientDataBytes,
      expectedChallenge: expectedChallenge,
      expectedType: 'webauthn.get',
      expectedOrigin: cfg.adminCorsOrigin ?? _origin(cfg.webauthnRpId!),
    );
  } on FormatException catch (e) {
    return unauthorized('clientData verification failed: $e');
  }

  // ── Verify the signature using the stored credential's algorithm ──────────
  final authDataBytes = fromBase64Url(authDataB64);
  final derSignature = fromBase64Url(signatureB64);
  try {
    verifyAuthenticatorData(authDataBytes, cfg.webauthnRpId!);
  } on FormatException {
    return unauthorized('Authenticator verification failed');
  }

  final valid = await verifyAssertion(
    authenticatorData: authDataBytes,
    clientDataJson: clientDataBytes,
    derSignature: derSignature,
    algorithm: algorithm,
    publicKeyX: keyBytes('public_key_x'),
    publicKeyY: keyBytes('public_key_y'),
    publicKeyN: keyBytes('public_key_n'),
    publicKeyE: keyBytes('public_key_e'),
  );

  if (!valid) return unauthorized('Signature verification failed');

  // ── Replay / clone detection via sign count ───────────────────────────────
  // Parse signCount from authData bytes [33-36]
  int? newCount;
  if (authDataBytes.length >= 37) {
    newCount =
        (authDataBytes[33] << 24) |
        (authDataBytes[34] << 16) |
        (authDataBytes[35] << 8) |
        authDataBytes[36];
    if (storedCount > 0 && newCount <= storedCount) {
      // Possible cloned authenticator — reject
      return unauthorized('Sign count replay detected');
    }
  }

  // ── Consume the challenge (single-use commit point) ───────────────────────
  try {
    await db.deleteRow(
      databaseId: Collections.databaseId,
      tableId: Collections.employeePasskeyChallenges,
      rowId: challengeId,
    );
  } on DatastoreException catch (e) {
    if (e.code == 404) {
      // A concurrent request consumed it first — reject this one.
      return badRequest(
        'Challenge not found, expired, or already used',
        code: 'INVALID_CHALLENGE',
      );
    }
    rethrow;
  }

  final nowIso = DateTime.now().toUtc().toIso8601String();
  if (newCount != null) {
    await db.updateRow(
      databaseId: Collections.databaseId,
      tableId: Collections.employeePasskeys,
      rowId: passkeyRowId,
      data: {'sign_count': newCount, 'last_used_at': nowIso},
    );
  } else {
    // Authenticator doesn't implement counter — just update last_used_at
    await db.updateRow(
      databaseId: Collections.databaseId,
      tableId: Collections.employeePasskeys,
      rowId: passkeyRowId,
      data: {'last_used_at': nowIso},
    );
  }

  // ── Issue full access JWT ─────────────────────────────────────────────────
  Row emp;
  try {
    emp = await db.getRow(
      databaseId: Collections.databaseId,
      tableId: Collections.guildmarkEmployees,
      rowId: employeeId,
    );
  } on DatastoreException catch (e) {
    if (e.code == 404) return serverError('Employee not found');
    rethrow;
  }

  final email = emp.data['email'].toString();
  final fullName = emp.data['full_name']?.toString() ?? email;
  final role = emp.data['role']?.toString() ?? 'admin';

  // Update last_login_at
  await db.updateRow(
    databaseId: Collections.databaseId,
    tableId: Collections.guildmarkEmployees,
    rowId: employeeId,
    data: {'last_login_at': nowIso},
  );

  if (emp.data['is_active'] != true) return unauthorized('Employee inactive');
  final sessions = firebaseSessions(context);
  final pendingHash = chalData['firebase_session_hash'] as String?;
  if (sessions != null && pendingHash == null) {
    return unauthorized('Password sign-in required');
  }
  final token = sessions != null
      ? await sessions.completeStaff(pendingHash!, 'staff_pending', employeeId)
      : jwt.issueAccessToken(
          AccessClaims(
            userId: employeeId,
            companyId: 'devdash',
            role: role,
            audience: 'staff',
          ),
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
