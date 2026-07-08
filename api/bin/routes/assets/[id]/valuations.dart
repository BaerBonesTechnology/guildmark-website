import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/asset_repo.dart';
import 'package:guildmark_api/repos/appwrite/asset_valuation_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  // Verify the asset belongs to the caller's company.
  final asset = await AssetRepo(aw).findById(
    id: id,
    companyId: auth.companyId,
  );
  if (asset == null) return notFound('Asset $id not found');

  final params = context.request.uri.queryParameters;
  final limit = int.tryParse(params['limit'] ?? '50')?.clamp(1, 200) ?? 50;

  final history = await AssetValuationRepo(aw).findByAsset(id, limit: limit);

  return Response.json(
    body: {
      'asset_id': id,
      'model_name': asset.modelName,
      'asset_type': asset.assetType,
      'count': history.length,
      'valuations': history.map((v) => v.toJson()).toList(),
    },
  );
}
