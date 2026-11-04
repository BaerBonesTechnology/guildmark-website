import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/models/asset.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/services/metered_valuation.dart';
import 'package:guildmark_api/repos/firestore/asset_repo.dart';
import 'package:guildmark_api/repos/firestore/asset_valuation_repo.dart';
import 'package:guildmark_api/repos/firestore/listing_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  switch (context.request.method) {
    case HttpMethod.get:
      final listings = await ListingRepo(aw).findByCompany(auth.companyId);
      return Response.json(body: listings.map((l) => l.toJson()).toList());

    case HttpMethod.post:
      final body = await context.request.json() as Map<String, dynamic>?;
      if (body == null) return badRequest('Missing body');

      if (body.containsKey('company_id') ||
          body.containsKey('owner_id') ||
          body['quantity'] is! int ||
          (body['quantity'] as int) < 1 ||
          (body['quantity'] as int) > 100000) {
        return badRequest(
          'Quantity must be a positive integer; tenant overrides are not permitted.',
        );
      }
      for (final k in [
        'listed_price',
        'original_price',
        'cpu_score',
        'ram_gb',
        'storage_gb',
      ]) {
        final v = body[k];
        if (v != null && (v is! num || !v.isFinite || v < 0 || v > 1000000)) {
          return badRequest('$k must be a finite non-negative number.');
        }
      }
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
          'model_name, asset_type, condition, quantity, listed_price required',
        );
      }
      if (price <= 0) return badRequest('listed_price must be positive');

      final ml = context.read<MlClient?>();

      // Resolve or auto-create the asset record.
      // When asset_id is omitted the caller is creating a brand-new listing
      // without a pre-existing inventory entry — we create the asset first.
      final Asset asset;
      if (assetId == null) {
        final ramRaw = body['ram_gb'];
        final storageRaw = body['storage_gb'];
        final cpuRaw = body['cpu_score'];
        try {
          asset = await AssetRepo(aw).create(
            companyId: auth.companyId,
            modelName: modelName,
            assetType: assetType,
            conditionGrade: condition,
            quantity: quantity,
            reasonForOffload: body['reason'] as String?,
            ramGb: ramRaw != null ? (ramRaw as num).toDouble() : null,
            storageGb: storageRaw != null
                ? (storageRaw as num).toDouble()
                : null,
            cpuScore: cpuRaw != null ? (cpuRaw as num).toInt() : null,
            serialNumber: body['serial_number'] as String?,
            department: body['department'] as String?,
            // ── Marketplace device-spec fields ──────────────────────────────
            manufacturer: body['manufacturer'] as String?,
            modelNumber: body['model_number'] as String?,
            yearOfManufacture: _int(body['year_of_manufacture']),
            functionalStatus: body['functional_status'] as String?,
            knownDefects: body['known_defects'] as String?,
            dataWipeStatus: body['data_wipe_status'] as String?,
            warrantyStatus: body['warranty_status'] as String?,
            warrantyExpiration: _date(body['warranty_expiration']),
            includedAccessories: body['included_accessories'] as String?,
            shipsFromLocation: body['ships_from_location'] as String?,
            cpuModel: body['cpu_model'] as String?,
            cpuCores: _int(body['cpu_cores']),
            cpuSpeedGhz: _double(body['cpu_speed_ghz']),
            ramType: body['ram_type'] as String?,
            storageType: body['storage_type'] as String?,
            gpuModel: body['gpu_model'] as String?,
            screenSizeIn: _double(body['screen_size_in']),
            screenResolution: body['screen_resolution'] as String?,
            touchscreen: body['touchscreen'] as bool?,
            formFactor: body['form_factor'] as String?,
            powerSupplyWatts: _int(body['power_supply_watts']),
            panelType: body['panel_type'] as String?,
            refreshRateHz: _int(body['refresh_rate_hz']),
            ports: body['ports'] as String?,
            portCount: _int(body['port_count']),
            throughput: body['throughput'] as String?,
            managed: body['managed'] as bool?,
            carrierLocked: body['carrier_locked'] as bool?,
          );
        } on PlanLimitException catch (e) {
          return jsonError(e.status, e.code, e.message);
        }
      } else {
        final found = await AssetRepo(
          aw,
        ).findById(id: assetId, companyId: auth.companyId);
        if (found == null) return notFound('Asset $assetId not found');
        asset = found;
      }

      // Get ML valuation so we can flag overpriced listings at creation time.
      double? fmv;
      String? mlVersion;
      double? mlConfidence;
      final ageMonths = _ageMonths(asset.purchaseDate);

      try {
        final valuation = await (ml == null || asset.purchaseDate == null
            ? null
            : MeteredValuation(aw, ml).estimate(
                auth.companyId,
                ValuationRequest(
                  assetType: asset.assetType,
                  modelName: asset.modelName,
                  conditionGrade: asset.conditionGrade,
                  ageMonths: ageMonths,
                  cpuScore: asset.cpuScore,
                  ramGb: asset.ramGb?.toInt() ?? 0,
                  storageGb: asset.storageGb?.toInt() ?? 0,
                  originalPrice: asset.originalPurchasePrice,
                ),
                assetId: asset.id,
              ));
        fmv = valuation?.fairMarketValue;
        mlVersion = valuation?.modelVersion;
        mlConfidence = valuation?.confidence;
      } on PlanLimitException {
        // Preserve manually priced listing creation without additional inference.
      } on Exception {
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

      final listing = await ListingRepo(aw).create(
        companyId: auth.companyId,
        assetId: asset.id,
        listedPrice: price,
        fairMarketValue: fmv,
        productImages: _strList(body['product_images']),
      );

      // Record valuation history — fire-and-forget so a DB hiccup here
      // never rolls back the listing creation.
      if (fmv != null && mlVersion != null && mlConfidence != null) {
        AssetValuationRepo(aw)
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

/// Coerce a JSON number/string to int (null-safe, tolerant of "16" strings).
int? _int(Object? v) => switch (v) {
  final int i => i,
  final num n => n.toInt(),
  final String s => int.tryParse(s.trim()),
  _ => null,
};

/// Coerce a JSON number/string to double (null-safe).
double? _double(Object? v) => switch (v) {
  final num n => n.toDouble(),
  final String s => double.tryParse(s.trim()),
  _ => null,
};

/// Parse an ISO date string to DateTime (null-safe).
DateTime? _date(Object? v) =>
    v is String && v.isNotEmpty ? DateTime.tryParse(v) : null;

/// Coerce a JSON list to a `List<String>` of non-empty entries (null if empty).
List<String>? _strList(Object? v) {
  if (v is! List) return null;
  final out = v
      .map((e) => e.toString().trim())
      .where((e) => e.isNotEmpty)
      .toList();
  return out.isEmpty ? null : out;
}
