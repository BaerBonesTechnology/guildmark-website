/// GET /amps/assets — paginated, filterable AMPS asset inventory.
///
/// Query params: asset_type, condition_grade, search, filter (e.g. "aging"),
///               page, page_size.
library;

import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext context) async {
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final store = context.read<FirebaseService?>();
  if (store == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Inventory is unavailable.');
  }
  final repo = AmpsInventoryRepo(store);
  try {
    if (context.request.method == HttpMethod.post) {
      final body = await boundedJson(context.request);
      if (body is! Map<String, dynamic>) {
        return badRequest('A JSON asset is required.');
      }
      final data = AmpsInventoryRepo.validate(body);
      final created = await repo.createRows(auth.companyId, [
        data,
      ], idempotencyKey: body['idempotency_key'] as String?);
      return Response.json(
        statusCode: 201,
        body: AmpsInventoryRepo.json(created.single),
      );
    }
    if (context.request.method != HttpMethod.get) {
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only');
    }
    final q = context.request.uri.queryParameters;
    final page = int.tryParse(q['page'] ?? '1') ?? 1;
    final size = int.tryParse(q['page_size'] ?? '50') ?? 50;
    if (page < 1 || size < 1 || size > 100) {
      return badRequest('page must be positive and page_size 1..100.');
    }
    final all = await repo.rows(auth.companyId);
    final filtered = all
        .where(
          (r) =>
              (q['include_archived'] == 'true' || r.data['archived'] != true) &&
              (q['asset_type'] == null ||
                  r.data['asset_type'] == q['asset_type']) &&
              (q['condition_grade'] == null ||
                  r.data['condition_grade'] == q['condition_grade']) &&
              (q['search'] == null ||
                  (r.data['model_name'] as String? ?? '')
                      .toLowerCase()
                      .contains(q['search']!.toLowerCase())),
        )
        .toList();
    return Response.json(
      body: {
        'data': filtered
            .skip((page - 1) * size)
            .take(size)
            .map(AmpsInventoryRepo.json)
            .toList(),
        'total': filtered.length,
        'page': page,
        'page_size': size,
        'total_pages': (filtered.length / size).ceil(),
      },
    );
  } on PlanLimitException catch (e) {
    return jsonError(e.status, e.code, e.message);
  } on FormatException {
    return badRequest('Invalid JSON.');
  }
}
