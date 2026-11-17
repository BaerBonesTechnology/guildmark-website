import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  final db = context.read<FirebaseService?>();
  if (db == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Inventory unavailable.');
  }
  try {
    final repo = AmpsInventoryRepo(db);
    if (context.request.method == HttpMethod.delete) {
      await repo.update(auth.companyId, id, {}, archive: true);
      return Response.json(body: {'id': id, 'archived': true});
    }
    if (context.request.method == HttpMethod.patch) {
      final body = await boundedJson(context.request);
      if (body is! Map<String, dynamic>) {
        return badRequest('A JSON asset patch is required.');
      }
      final row = await repo.update(
        auth.companyId,
        id,
        AmpsInventoryRepo.validate(body, partial: true),
      );
      return Response.json(body: AmpsInventoryRepo.json(row));
    }
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH or DELETE only');
  } on PlanLimitException catch (e) {
    return jsonError(e.status, e.code, e.message);
  } on FormatException {
    return badRequest('Invalid JSON.');
  }
}
