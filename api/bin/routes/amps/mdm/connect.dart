/// POST /amps/mdm/connect — register a Jamf Pro / Jamf School / Intune source.
///
/// Credentials are validated against the target MDM before storage.
/// The credential blob is encrypted at the app layer before being persisted.
///
/// TODO: Implement per-MDM credential validation:
///   - jamf_pro:     POST {base_url}/api/v1/auth/token with client_id/secret
///   - jamf_school:  GET  {base_url}/api/devices with x-api-key header
///   - intune:       POST graph.microsoft.com/oauth2/token with client_credentials
/// Until real validation is in place, credentials are stored without
/// verification (trust the client). Flip the `_validateCredentials` call to
/// fail-closed once each connector is built.
///
/// TODO: After storing the connection, trigger an immediate background sync so
/// the user sees their devices without waiting for the next scheduled run.
library;

import 'dart:typed_data';

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/mdm_repo.dart';

const _allowedTypes = {'jamf_pro', 'jamf_school', 'intune'};

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body    = await context.request.json() as Map<String, dynamic>?;
  final mdmType = body?['mdm_type'] as String?;
  if (mdmType == null || !_allowedTypes.contains(mdmType)) {
    return badRequest('mdm_type must be one of: ${_allowedTypes.join(', ')}');
  }

  // TODO: Validate required credential fields per MDM type.
  // e.g. jamf_pro needs jamf_instance_url + jamf_client_id + jamf_client_secret.
  // Reject early with 400 if any required credential field is missing.

  // TODO: Replace these placeholder bytes with real AES-GCM encrypted
  // credentials once lib/mdm/credentials.dart is implemented.
  // The credentials map should be serialized to JSON then encrypted.
  final placeholderCipher = Uint8List(0);
  final placeholderNonce  = Uint8List(12);

  final connection = await MdmRepo(context.read<Db>()).create(
    companyId:            auth.companyId,
    mdmType:              mdmType,
    encryptedCredentials: placeholderCipher,
    nonce:                placeholderNonce,
  );

  return Response.json(statusCode: 201, body: connection.toJson());
}
