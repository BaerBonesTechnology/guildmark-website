import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart' show Query;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/repos/appwrite/listing_repo.dart';

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

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // ── Find all assets that already have a live (non-terminal) listing ──────
  // Was DISTINCT ON (asset) ORDER BY listing.updated_at DESC. Here: page the
  // company's live listings, keep the most recently updated listing per
  // asset, then batch-fetch the assets ($updatedAt is an ISO string, so
  // string comparison orders correctly).
  final latestListingByAsset = <String, ({String listingId, String updated})>{};
  String? cursor;
  while (true) {
    final page = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      queries: [
        Query.equal('company_id', auth.companyId),
        Query.notEqual('status', 'sold'),
        Query.limit(100),
        if (cursor != null) Query.cursorAfter(cursor),
      ],
    );
    if (page.rows.isEmpty) break;
    for (final row in page.rows) {
      if (row.data['status'] == 'withdrawn') continue;
      final assetId = row.data['asset_id'] as String;
      final prev = latestListingByAsset[assetId];
      if (prev == null || row.$updatedAt.compareTo(prev.updated) > 0) {
        latestListingByAsset[assetId] =
            (listingId: row.$id, updated: row.$updatedAt);
      }
    }
    if (page.rows.length < 100) break;
    cursor = page.rows.last.$id;
  }

  if (latestListingByAsset.isEmpty) {
    return Response.json(body: {'status': 'no_listings', 'asset_count': 0});
  }

  // Batch-fetch the assets (chunked $id IN queries).
  final items = <_WorkItem>[];
  final assetIds = latestListingByAsset.keys.toList();
  for (var i = 0; i < assetIds.length; i += 100) {
    final chunk = assetIds.sublist(
      i,
      i + 100 > assetIds.length ? assetIds.length : i + 100,
    );
    final assets = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.assets,
      queries: [Query.equal(r'$id', chunk), Query.limit(chunk.length)],
    );
    for (final a in assets.rows) {
      // Guard: only this company's assets (mirrors WHERE a.company_id = @cid).
      if (a.data['company_id'] != auth.companyId) continue;
      final d = a.data;
      final purchaseDate = d['purchase_date'] as String?;
      items.add(
        _WorkItem(
          assetId: a.$id,
          listingId: latestListingByAsset[a.$id]!.listingId,
          modelName: d['model_name'] as String,
          assetType: d['asset_type'] as String,
          conditionGrade: d['condition_grade'] as String? ?? 'B',
          purchaseDate:
              purchaseDate == null ? null : DateTime.parse(purchaseDate),
          cpuScore: (d['cpu_score'] as num?)?.toDouble(),
          ramGb: (d['ram_gb'] as num?)?.toInt(),
          storageGb: (d['storage_gb'] as num?)?.toInt(),
          originalPrice: d['original_purchase_price_cents'] == null
              ? null
              : (d['original_purchase_price_cents'] as num) / 100,
        ),
      );
    }
  }

  final assetCount = items.length;

  // Mark the job as running *before* returning so the status endpoint never
  // shows a stale 'idle' after the client has already called this route.
  await db.updateRow(
    databaseId: Aw.databaseId,
    tableId: Aw.companies,
    rowId: auth.companyId,
    data: {
      'valuation_status': 'running',
      'valuation_started_at': DateTime.now().toUtc().toIso8601String(),
      'valuation_asset_count': assetCount,
    },
  );

  // Snapshot all work items before spawning the background Future.
  // The RequestContext is request-scoped and must NOT be captured by the
  // closure — only plain values and the shared AppwriteService/MlClient
  // singletons.
  final companyId = auth.companyId;

  _runValuationJob(
    aw: aw,
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
  required AppwriteService aw,
  required MlClient ml,
  required String companyId,
  required List<_WorkItem> items,
}) async {
  final repo = ListingRepo(aw);

  Future<void> setStatus(String status) => aw.tablesDB.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.companies,
        rowId: companyId,
        data: {'valuation_status': status},
      );

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

    await setStatus('complete');
    stdout.writeln(
      '[valuate] job complete for company $companyId (${items.length} assets)',
    );
  } catch (e, st) {
    stderr.writeln('[valuate] job failed for company $companyId: $e\n$st');
    try {
      await setStatus('failed');
    } catch (_) {}
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
