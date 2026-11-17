import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  final db = context.read<FirebaseService?>();
  if (db == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Inventory unavailable.');
  }
  try {
    final body = await boundedJson(context.request, maxBytes: 262144);
    if (body is! Map<String, dynamic> ||
        body.keys.any((k) => !{'assets', 'idempotency_key'}.contains(k)) ||
        body['assets'] is! List) {
      return badRequest('assets array and idempotency_key required.');
    }
    final raw = body['assets'] as List;
    if (raw.isEmpty ||
        raw.length > 50 ||
        raw.any((r) => r is! Map<String, dynamic>) ||
        body['idempotency_key'] is! String) {
      return badRequest('Import 1..50 valid records with an idempotency key.');
    }
    final data = raw
        .cast<Map<String, dynamic>>()
        .map(AmpsInventoryRepo.validate)
        .toList();
    final rows = await AmpsInventoryRepo(db).createRows(
      auth.companyId,
      data,
      idempotencyKey: body['idempotency_key'] as String,
    );
    return Response.json(
      statusCode: 201,
      body: {
        'assets': rows.map(AmpsInventoryRepo.json).toList(),
        'imported_records': rows.length,
        'imported_units': inventoryUnits(rows),
      },
    );
  } on PlanLimitException catch (e) {
    return jsonError(e.status, e.code, e.message);
  } on FormatException {
    return badRequest('Invalid JSON.');
  }
}
