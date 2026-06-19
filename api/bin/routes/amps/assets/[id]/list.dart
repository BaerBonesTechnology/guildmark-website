import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/repos/asset_repo.dart';
import 'package:guildmark_api/repos/listing_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final db = context.read<Db>();
  final ml = context.read<MlClient>();

  // Validate the asset belongs to this company.
  final asset = await AssetRepo(db).findById(id: id, companyId: auth.companyId);
  if (asset == null) return notFound('Asset $id not found');

  // Request fair market value from the ML service.
  double? fmv;
  try {
    final valuation = await ml.estimateFairMarketValue(
      ValuationRequest(
        assetType: asset.assetType,
        modelName: asset.modelName,
        conditionGrade: asset.conditionGrade,
        ageMonths: _ageMonths(asset.purchaseDate),
        cpuScore: asset.cpuScore,
        ramGb: asset.ramGb?.toInt() ?? 0,
        storageGb: asset.storageGb?.toInt() ?? 0,
        originalPrice: asset.originalPurchasePrice,
      ),
    );
    fmv = valuation.fairMarketValue;
  } on MlServiceException {
    // Non-fatal — proceed without FMV; listing will be flagged 'insufficient_data'.
  }

  // Allow caller to override the listed price; fall back to FMV.
  final body = await context.request.json() as Map<String, dynamic>?;
  final overridePrice = (body?['listed_price'] as num?)?.toDouble();
  final listedPrice = overridePrice ?? fmv ?? 0.0;

  if (listedPrice <= 0) {
    return badRequest(
      'ML service returned no estimate and no listed_price was provided',
    );
  }

  final listing = await ListingRepo(db).create(
    companyId: auth.companyId,
    assetId: id,
    listedPrice: listedPrice,
    fairMarketValue: fmv,
  );

  return Response.json(
    statusCode: 201,
    body: {
      'listing_id': listing.id,
      'buyer_ask_price': fmv,
      'listing': listing.toJson(),
    },
  );
}

int _ageMonths(DateTime? purchaseDate) {
  if (purchaseDate == null) return 0;
  final delta = DateTime.now().difference(purchaseDate);
  return (delta.inDays / 30.44).floor().clamp(0, 240);
}
