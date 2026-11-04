import 'dart:convert';

import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/repos/firestore/asset_repo.dart';
import 'package:guildmark_api/services/amps_assistant.dart';
import 'package:guildmark_api/services/metered_valuation.dart';

/// AMPS middleware applies the existing subscription entitlement check.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.audience != 'customer') return forbidden();
  try {
    final text = await context.request.body();
    if (utf8.encode(text).length > 8192) {
      return jsonError(
        413,
        'REQUEST_TOO_LARGE',
        'Assistant request exceeds 8 KB.',
      );
    }
    final decoded = jsonDecode(text);
    if (decoded is! Map<String, dynamic>) {
      return badRequest('A JSON object is required.');
    }
    AmpsAssistant.validate(decoded);
    final db = context.read<FirebaseService?>();
    if (db == null) {
      return jsonError(503, 'DB_UNAVAILABLE', 'Inventory is unavailable.');
    }
    final ml = context.read<MlClient?>();
    final assistant = AmpsAssistant(
      AssetRepo(db),
      ml,
      estimate: ml == null
          ? null
          : (company, request, id) => MeteredValuation(
              db,
              ml,
            ).estimate(company, request, assetId: id),
    );
    final result = await assistant.respond(
      companyId: principal.companyId,
      body: decoded,
    );
    return Response.json(body: result);
  } on AssistantRequestException catch (error) {
    return jsonError(error.status, 'ASSISTANT_REQUEST', error.message);
  } on FormatException {
    return badRequest('A valid JSON object is required.');
  } on Exception {
    return jsonError(
      503,
      'ASSISTANT_UNAVAILABLE',
      'The assistant could not read your inventory. Please try again.',
    );
  }
}
