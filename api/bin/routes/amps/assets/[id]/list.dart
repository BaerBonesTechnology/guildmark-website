import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/services/metered_valuation.dart';
import 'package:guildmark_api/repos/firestore/asset_repo.dart';
import 'package:guildmark_api/repos/firestore/listing_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final ml = context.read<MlClient>();

  // Validate the asset belongs to this company.
  final asset = await AssetRepo(aw).findById(id: id, companyId: auth.companyId);
  if (asset == null) return notFound('Asset $id not found');

  // Request fair market value from the ML service.
  double? fmv;
  try {
    if (asset.purchaseDate == null) {
      throw const PlanLimitException(
        'MISSING_DATA',
        'Purchase date is unknown.',
      );
    }
    final valuation = await MeteredValuation(aw, ml).estimate(
      auth.companyId,
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
      assetId: asset.id,
    );
    fmv = valuation.fairMarketValue;
  } on PlanLimitException {
    // No extra inference when credits are exhausted.
  } on Exception {
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

  final listing = await ListingRepo(aw).create(
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
