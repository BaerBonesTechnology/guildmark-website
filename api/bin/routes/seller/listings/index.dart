/// GET  /seller/listings   — list this company's listings
/// POST /seller/listings   — create a new listing (calls ML for valuation)
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/models/asset.dart';
import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/ml/ml_client.dart';
import '../../../lib/repos/asset_repo.dart';
import '../../../lib/repos/asset_valuation_repo.dart';
import '../../../lib/repos/listing_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  switch (context.request.method) {
    case HttpMethod.get:
      final listings =
          await ListingRepo(context.read<Db>()).findByCompany(auth.companyId);
      return Response.json(body: listings.map((l) => l.toJson()).toList());

    case HttpMethod.post:
      final body = await context.request.json() as Map<String, dynamic>?;
      if (body == null) return badRequest('Missing body');

      final modelName = body['model_name'] as String?;
      final assetType = body['asset_type'] as String?;
      final condition = body['condition'] as String?;
      final quantity = body['quantity'] as int?;
      final price = (body['listed_price'] as num?)?.toDouble();
      final assetId = body['asset_id'] as String?;

      if (modelName == null ||
          assetType == null ||
          condition == null ||
          quantity == null ||
          price == null) {
        return badRequest(
            'model_name, asset_type, condition, quantity, listed_price required');
      }
      if (price <= 0) return badRequest('listed_price must be positive');

      final db = context.read<Db>();
      final ml = context.read<MlClient?>();

      // Resolve or auto-create the asset record.
      // When asset_id is omitted the caller is creating a brand-new listing
      // without a pre-existing inventory entry — we create the asset first.
      final Asset asset;
      if (assetId == null) {
        final ramRaw = body['ram_gb'];
        final storageRaw = body['storage_gb'];
        final cpuRaw = body['cpu_score'];
        asset = await AssetRepo(db).create(
          companyId: auth.companyId,
          modelName: modelName,
          assetType: assetType,
          conditionGrade: condition,
          quantity: quantity,
          reasonForOffload: body['reason'] as String?,
          ramGb: ramRaw != null ? (ramRaw as num).toDouble() : null,
          storageGb: storageRaw != null ? (storageRaw as num).toDouble() : null,
          cpuScore: cpuRaw != null ? (cpuRaw as num).toInt() : null,
          serialNumber: body['serial_number'] as String?,
          department: body['department'] as String?,
        );
      } else {
        final found = await AssetRepo(db)
            .findById(id: assetId, companyId: auth.companyId);
        if (found == null) return notFound('Asset $assetId not found');
        asset = found;
      }

      // Get ML valuation so we can flag overpriced listings at creation time.
      double? fmv;
      String? mlVersion;
      double? mlConfidence;
      final ageMonths = _ageMonths(asset.purchaseDate);

      try {
        final valuation = await ml?.estimateFairMarketValue(ValuationRequest(
          assetType: asset.assetType,
          modelName: asset.modelName,
          conditionGrade: asset.conditionGrade,
          ageMonths: ageMonths,
          cpuScore: asset.cpuScore,
          ramGb: asset.ramGb?.toInt() ?? 0,
          storageGb: asset.storageGb?.toInt() ?? 0,
          originalPrice: asset.originalPurchasePrice,
        ));
        fmv = valuation?.fairMarketValue;
        mlVersion = valuation?.modelVersion;
        mlConfidence = valuation?.confidence;
      } on MlServiceException {
        // Non-fatal — we still create the listing; it will be flagged
        // 'insufficient_data' by the repo.
      }

      // Tell the ML service about this model so the next training run fetches
      // real eBay market data for it. Fire-and-forget — never blocks the response.
      ml
          ?.trackModel(
            modelName: asset.modelName,
            assetType: asset.assetType,
          )
          .ignore();

      final listing = await ListingRepo(db).create(
        companyId: auth.companyId,
        assetId: asset.id,
        listedPrice: price,
        fairMarketValue: fmv,
      );

      // Record valuation history — fire-and-forget so a DB hiccup here
      // never rolls back the listing creation.
      if (fmv != null && mlVersion != null && mlConfidence != null) {
        AssetValuationRepo(db)
            .record(
              assetId: asset.id,
              listingId: listing.id,
              source: 'listing',
              modelName: asset.modelName,
              assetType: asset.assetType,
              conditionGrade: asset.conditionGrade,
              ageMonths: ageMonths,
              fairMarketValue: fmv,
              confidence: mlConfidence,
              modelVersion: mlVersion,
              listedPrice: price,
            )
            .ignore();
      }

      return Response.json(statusCode: 201, body: listing.toJson());

    default:
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST');
  }
}

int _ageMonths(DateTime? purchaseDate) {
  if (purchaseDate == null) return 0;
  final now = DateTime.now();
  final delta = now.difference(purchaseDate);
  return (delta.inDays / 30.44).floor().clamp(0, 240);
}
