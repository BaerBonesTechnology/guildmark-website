import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/ml/ml_client.dart';
import '../../lib/models/json_helpers.dart';
import '../../lib/repos/listing_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final ml = context.read<MlClient?>();
  if (ml == null) {
    return jsonError(503, 'ML_UNAVAILABLE', 'ML service not configured');
  }

  final db = context.read<Db>();

  // ── Find all assets that already have a live (non-terminal) listing ────────
  // DISTINCT ON (a.id) + ORDER BY l.updated_at DESC picks the most recently
  // updated listing per asset, so we refresh the correct row.
  final rows = await db.query(
    '''
    SELECT DISTINCT ON (a.id)
      a.id                      AS asset_id,
      a.model_name,
      a.asset_type::text        AS asset_type,
      a.condition_grade::text   AS condition_grade,
      a.purchase_date,
      a.original_purchase_price,
      a.cpu_score,
      a.ram_gb,
      a.storage_gb,
      l.id                      AS listing_id
    FROM assets a
    JOIN listings l
      ON  l.asset_id   = a.id
      AND l.company_id = @cid
      AND l.status NOT IN (\'sold\', \'withdrawn\')
    WHERE a.company_id = @cid
    ORDER BY a.id, l.updated_at DESC
    ''',
    parameters: {'cid': auth.companyId},
  );

  if (rows.isEmpty) {
    return Response.json(body: {'status': 'no_listings', 'asset_count': 0});
  }

  final assetCount = rows.length;

  // Mark the job as running *before* returning so the status endpoint never
  // shows a stale 'idle' after the client has already called this route.
  await db.query(
    '''
    UPDATE companies
    SET valuation_status      = \'running\',
        valuation_started_at  = now(),
        valuation_asset_count = @count
    WHERE id = @cid::uuid
    ''',
    parameters: {'cid': auth.companyId, 'count': assetCount},
  );

  // Snapshot all work items before spawning the background Future.
  // The RequestContext is request-scoped and must NOT be captured by the
  // closure — only plain values and the shared Db/MlClient singletons.
  final companyId = auth.companyId;
  final items = rows
      .map((r) {
        final row = r.toColumnMap();
        return _WorkItem(
          assetId: row['asset_id'] as String,
          listingId: row['listing_id'] as String,
          modelName: row['model_name'] as String,
          assetType: row['asset_type'] as String,
          conditionGrade: row['condition_grade'] as String,
          purchaseDate: row['purchase_date'] as DateTime?,
          cpuScore: numToDoubleOrNull(row['cpu_score']),
          ramGb: numToIntOrNull(row['ram_gb']),
          storageGb: numToIntOrNull(row['storage_gb']),
          originalPrice: numToDoubleOrNull(row['original_purchase_price']),
        );
      })
      .toList(growable: false);

  _runValuationJob(
    db: db,
    ml: ml,
    companyId: companyId,
    items: items,
  ).ignore();

  return Response.json(
    statusCode: 202,
    body: {'status': 'started', 'asset_count': assetCount},
  );
}

// ---------------------------------------------------------------------------
// Background job — runs outside of any request context
// ---------------------------------------------------------------------------

Future<void> _runValuationJob({
  required Db db,
  required MlClient ml,
  required String companyId,
  required List<_WorkItem> items,
}) async {
  final repo = ListingRepo(db);
  try {
    for (final item in items) {
      try {
        final valuation = await ml.estimateFairMarketValue(
          ValuationRequest(
            assetType: item.assetType,
            modelName: item.modelName,
            conditionGrade: item.conditionGrade,
            ageMonths: _ageMonths(item.purchaseDate),
            cpuScore: item.cpuScore,
            ramGb: item.ramGb,
            storageGb: item.storageGb,
            originalPrice: item.originalPrice,
          ),
        );
        await repo.updateFmvByListingId(
          listingId: item.listingId,
          companyId: companyId,
          fmv: valuation.fairMarketValue,
        );
      } catch (e) {
        // Non-fatal — log and continue so one bad asset doesn't abort the run.
        stderr.writeln('[valuate] skipping asset ${item.assetId}: $e');
      }
    }

    await db.query(
      "UPDATE companies SET valuation_status = 'complete' WHERE id = @cid::uuid",
      parameters: {'cid': companyId},
    );
    stdout.writeln(
      '[valuate] job complete for company $companyId (${items.length} assets)',
    );
  } catch (e, st) {
    stderr.writeln('[valuate] job failed for company $companyId: $e\n$st');
    await db
        .query(
          "UPDATE companies SET valuation_status = 'failed' WHERE id = @cid::uuid",
          parameters: {'cid': companyId},
        )
        .catchError((_) {});
  }
}

int _ageMonths(DateTime? purchaseDate) {
  if (purchaseDate == null) return 0;
  final delta = DateTime.now().difference(purchaseDate);
  return (delta.inDays / 30.44).floor().clamp(0, 240);
}

// ---------------------------------------------------------------------------
// Value object — plain data only, no context or request references
// ---------------------------------------------------------------------------

class _WorkItem {
  _WorkItem({
    required this.assetId,
    required this.listingId,
    required this.modelName,
    required this.assetType,
    required this.conditionGrade,
    this.purchaseDate,
    this.cpuScore,
    this.ramGb,
    this.storageGb,
    this.originalPrice,
  });

  final String assetId;
  final String listingId;
  final String modelName;
  final String assetType;
  final String conditionGrade;
  final DateTime? purchaseDate;
  final double? cpuScore;
  final int? ramGb;
  final int? storageGb;
  final double? originalPrice;
}
