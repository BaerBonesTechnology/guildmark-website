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

  final body = await context.request.json() as Map<String, dynamic>?;
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
  final placeholderNonce = Uint8List(12);

  final connection = await MdmRepo(context.read<Db>()).create(
    companyId: auth.companyId,
    mdmType: mdmType,
    encryptedCredentials: placeholderCipher,
    nonce: placeholderNonce,
  );

  return Response.json(statusCode: 201, body: connection.toJson());
}
