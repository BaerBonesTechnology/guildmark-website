/// GET /assets/:id/valuations
///
/// Returns the valuation history for a single asset — all ML valuations ever
/// recorded for it, newest first. Each row includes the fair market value at
/// the time, the listed price (if from a listing), and the price-to-FMV ratio
/// so callers can see how this asset has been priced relative to market.
///
/// Scoped to the caller's company — cannot read another company's assets.
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/asset_repo.dart';
import '../../../lib/repos/asset_valuation_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final db = context.read<Db>();

  // Verify the asset belongs to the caller's company.
  final asset = await AssetRepo(db).findById(
    id: id,
    companyId: auth.companyId,
  );
  if (asset == null) return notFound('Asset $id not found');

  final params = context.request.uri.queryParameters;
  final limit  = int.tryParse(params['limit'] ?? '50')?.clamp(1, 200) ?? 50;

  final history = await AssetValuationRepo(db).findByAsset(id, limit: limit);

  return Response.json(body: {
    'asset_id':   id,
    'model_name': asset.modelName,
    'asset_type': asset.assetType,
    'count':      history.length,
    'valuations': history.map((v) => v.toJson()).toList(),
  });
}
