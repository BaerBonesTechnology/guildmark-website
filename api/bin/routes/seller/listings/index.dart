/// GET  /seller/listings   — list this company's listings
/// POST /seller/listings   — create a new listing (calls ML for valuation)
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/ml/ml_client.dart';
import '../../../lib/repos/asset_repo.dart';
import '../../../lib/repos/listing_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  switch (context.request.method) {
    case HttpMethod.get:
      final listings = await ListingRepo(context.read<Db>()).findByCompany(auth.companyId);
      return Response.json(body: listings.map((l) => l.toJson()).toList());

    case HttpMethod.post:
      final body = await context.request.json() as Map<String, dynamic>?;
      if (body == null) return badRequest('Missing body');

      final modelName  = body['model_name']   as String?;
      final assetType  = body['asset_type']   as String?;
      final condition  = body['condition']    as String?;
      final quantity   = body['quantity']     as int?;
      final price      = (body['listed_price'] as num?)?.toDouble();
      final assetId    = body['asset_id']     as String?;

      if (modelName == null || assetType == null || condition == null ||
          quantity == null || price == null) {
        return badRequest('model_name, asset_type, condition, quantity, listed_price required');
      }
      if (price <= 0) return badRequest('listed_price must be positive');

      final db   = context.read<Db>();
      final ml   = context.read<MlClient>();

      // Resolve or validate the assetId.
      // TODO: If asset_id is null, auto-create an asset record from the body
      // fields before creating the listing. For now we require it.
      if (assetId == null) {
        return badRequest('asset_id required; auto-create flow not yet implemented');
      }
      final asset = await AssetRepo(db).findById(id: assetId, companyId: auth.companyId);
      if (asset == null) return notFound('Asset $assetId not found');

      // Get ML valuation so we can flag overpriced listings at creation time.
      double? fmv;
      try {
        final valuation = await ml.estimateFairMarketValue(ValuationRequest(
          assetType:      asset.assetType,
          modelName:      asset.modelName,
          conditionGrade: asset.conditionGrade,
          ageMonths:      _ageMonths(asset.purchaseDate),
          cpuScore:       asset.cpuScore,
          ramGb:          asset.ramGb,
          storageGb:      asset.storageGb,
          originalPrice:  asset.originalPurchasePrice,
        ));
        fmv = valuation.fairMarketValue;
      } on MlServiceException {
        // Non-fatal — we still create the listing; it will be flagged
        // 'insufficient_data' by the repo.
      }

      // Tell the ML service about this model so the next training run fetches
      // real eBay market data for it. Fire-and-forget — never blocks the response.
      ml.trackModel(
        modelName: asset.modelName,
        assetType: asset.assetType,
      ).ignore();

      final listing = await ListingRepo(db).create(
        companyId:      auth.companyId,
        assetId:        assetId,
        listedPrice:    price,
        fairMarketValue: fmv,
      );
      return Response.json(statusCode: 201, body: listing.toJson());

    default:
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST');
  }
}

int _ageMonths(DateTime? purchaseDate) {
  if (purchaseDate == null) return 0;
  final now   = DateTime.now();
  final delta = now.difference(purchaseDate);
  return (delta.inDays / 30.44).floor().clamp(0, 240);
}
