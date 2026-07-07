/// Appwrite implementation of PortfolioRepo — AMPS portfolio aggregates
/// (see ../../../POSTGRES_TO_APPWRITE.md and mailing_list_repo.dart for the
/// reference pattern).
///
/// The public interface is IDENTICAL to the Postgres PortfolioRepo so the
/// routes that consume it don't change; only the constructor dependency
/// (AppwriteService instead of Db) and the bodies differ.
///
/// Appwrite has no SUM/GROUP BY/DISTINCT ON (§1c): hero stats and bucket
/// breakdowns become a fetch + reduce — page the company's assets and
/// non-sold/withdrawn listings, pick the most recently updated listing per
/// asset in Dart, and aggregate. The trend series still reads (and upserts)
/// `valuation_snapshots`, which acts as the precomputed daily history.
library;

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/models/portfolio.dart';

class PortfolioRepo {
  PortfolioRepo(this._aw);
  final AppwriteService _aw;

  TablesDB get _db => _aw.tablesDB;

  static const _pageSize = 100;

  /// Hero stats + bucket breakdowns + N-month trend.
  ///
  /// Values are computed live from assets + their most recent active/draft
  /// listing. Assets without a listing still count toward device totals but
  /// contribute 0 to value aggregates.
  Future<PortfolioSummary> summarize({
    required String companyId,
    int trendMonths = 12,
  }) async {
    final now = DateTime.now().toUtc();

    // ── Fetch: assets + candidate listings (§1c page loops) ─────────────────
    final assets =
        await _pageAll(Aw.assets, [Query.equal('company_id', companyId)]);
    final listings = await _pageAll(Aw.listings, [
      Query.equal('company_id', companyId),
      // status NOT IN ('sold', 'withdrawn')
      Query.notEqual('status', 'sold'),
      Query.notEqual('status', 'withdrawn'),
    ]);

    // DISTINCT ON (asset_id) … ORDER BY updated_at DESC → keep the most
    // recently updated listing per asset ($updatedAt is ISO-8601, so string
    // comparison orders correctly).
    final latestByAsset = <String, Row>{};
    for (final l in listings) {
      final assetId = l.data['asset_id'] as String?;
      if (assetId == null) continue;
      final prev = latestByAsset[assetId];
      if (prev == null || l.$updatedAt.compareTo(prev.$updatedAt) > 0) {
        latestByAsset[assetId] = l;
      }
    }

    // ── Reduce: hero stats ──────────────────────────────────────────────────
    final totalDevices = assets.length;
    var totalPortfolioValue = 0.0;
    var totalBookValue = 0.0;
    var totalDepreciation = 0.0;
    var ageMonthsSum = 0.0;
    var assetsAtRisk = 0;
    final riskCutoff = DateTime.utc(now.year, now.month - 36, now.day);

    final byType = <String, _MutableBucket>{};
    final byCondition = <String, _MutableBucket>{};

    for (final a in assets) {
      final ll = latestByAsset[a.$id];
      final fmv = _centsToDollars(ll?.data['fair_market_value_cents']);
      final book = _centsToDollars(ll?.data['est_book_value_cents']);

      totalPortfolioValue += fmv ?? 0.0;
      totalBookValue += book ?? 0.0;
      final dep = (book ?? 0.0) - (fmv ?? 0.0);
      if (dep > 0) totalDepreciation += dep;

      // age(now, COALESCE(purchase_date, created_at)) in 30-day months.
      final purchaseStr = a.data['purchase_date'] as String?;
      final since = purchaseStr == null
          ? DateTime.parse(a.$createdAt)
          : DateTime.parse(purchaseStr);
      ageMonthsSum += now.difference(since).inSeconds / 2592000.0;

      if (since.isBefore(riskCutoff)) assetsAtRisk++;

      // GROUP BY asset_type / condition_grade with SUM(fmv).
      final type = (a.data['asset_type'] as String?) ?? 'other';
      final grade = (a.data['condition_grade'] as String?) ?? 'B';
      byType.putIfAbsent(type, _MutableBucket.new).add(fmv);
      byCondition.putIfAbsent(grade, _MutableBucket.new).add(fmv);
    }

    final avgAgeMonths = totalDevices > 0 ? ageMonthsSum / totalDevices : 0.0;
    final depreciationPct =
        totalBookValue > 0 ? totalDepreciation / totalBookValue : 0.0;

    // ── Trend upsert: today's live-computed values (§1c snapshots) ──────────
    // Keeps the snapshot table a rolling daily history without a cron job.
    await _upsertSnapshot(
      companyId: companyId,
      day: DateTime.utc(now.year, now.month, now.day),
      totalPortfolioValue: totalPortfolioValue,
      totalBookValue: totalBookValue,
      totalDepreciation: totalDepreciation,
      totalDevices: totalDevices,
    );

    // ── Trend series (historical snapshots) ─────────────────────────────────
    final since = DateTime.utc(now.year, now.month - trendMonths, now.day);
    final trendRows = await _pageAll(Aw.valuationSnapshots, [
      Query.equal('company_id', companyId),
      Query.greaterThanEqual('snapshot_date', since.toIso8601String()),
      Query.orderAsc('snapshot_date'),
    ]);
    final trend = trendRows
        .map(
          (r) => ValuationSnapshot(
            snapshotDate: DateTime.parse(r.data['snapshot_date'] as String),
            totalPortfolioValue:
                _centsToDollars(r.data['total_portfolio_value_cents']) ?? 0.0,
            totalBookValue:
                _centsToDollars(r.data['total_book_value_cents']) ?? 0.0,
            totalDepreciation:
                _centsToDollars(r.data['total_depreciation_cents']) ?? 0.0,
            totalDevices: (r.data['total_devices'] as num?)?.toInt() ?? 0,
          ),
        )
        .toList();

    return PortfolioSummary(
      totalDevices:        totalDevices,
      totalPortfolioValue: totalPortfolioValue,
      totalBookValue:      totalBookValue,
      totalDepreciation:   totalDepreciation,
      depreciationPct:     depreciationPct,
      avgAssetAgeMonths:   avgAgeMonths,
      assetsAtRisk:        assetsAtRisk,
      byType: byType.map((k, v) => MapEntry(k, v.toBucket())),
      byCondition: byCondition.map((k, v) => MapEntry(k, v.toBucket())),
      trend:               trend,
    );
  }

  /// ON CONFLICT (company_id, snapshot_date) DO UPDATE → existence check,
  /// then create-or-update; the unique (company_id, snapshot_date) index
  /// resolves the check-then-create race (409 → update the winner's row).
  Future<void> _upsertSnapshot({
    required String companyId,
    required DateTime day,
    required double totalPortfolioValue,
    required double totalBookValue,
    required double totalDepreciation,
    required int totalDevices,
  }) async {
    final dayIso = day.toIso8601String();
    final nextDayIso = day.add(const Duration(days: 1)).toIso8601String();
    final values = <String, dynamic>{
      'total_portfolio_value_cents': _dollarsToCents(totalPortfolioValue),
      'total_book_value_cents': _dollarsToCents(totalBookValue),
      'total_depreciation_cents': _dollarsToCents(totalDepreciation),
      'total_devices': totalDevices,
    };

    Future<Row?> findToday() async {
      final res = await _db.listRows(
        databaseId: Aw.databaseId,
        tableId: Aw.valuationSnapshots,
        queries: [
          Query.equal('company_id', companyId),
          Query.greaterThanEqual('snapshot_date', dayIso),
          Query.lessThan('snapshot_date', nextDayIso),
          Query.limit(1),
        ],
      );
      return res.rows.isEmpty ? null : res.rows.first;
    }

    final existing = await findToday();
    if (existing != null) {
      await _db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.valuationSnapshots,
        rowId: existing.$id,
        data: values,
      );
      return;
    }

    try {
      await _db.createRow(
        databaseId: Aw.databaseId,
        tableId: Aw.valuationSnapshots,
        rowId: ID.unique(),
        data: {
          'company_id': companyId,
          'snapshot_date': dayIso,
          ...values,
        },
      );
    } on AppwriteException catch (e) {
      if (e.code != 409) rethrow;
      // Lost the create race — a concurrent call inserted today's snapshot;
      // update it instead.
      final winner = await findToday();
      if (winner != null) {
        await _db.updateRow(
          databaseId: Aw.databaseId,
          tableId: Aw.valuationSnapshots,
          rowId: winner.$id,
          data: values,
        );
      }
    }
  }

  /// Page through every row matching [queries] (Query.limit + Query.offset
  /// loop until a short page). Per-company sets are bounded (§1c).
  Future<List<Row>> _pageAll(String tableId, List<String> queries) async {
    final all = <Row>[];
    var offset = 0;
    while (true) {
      final res = await _db.listRows(
        databaseId: Aw.databaseId,
        tableId: tableId,
        queries: [
          ...queries,
          Query.limit(_pageSize),
          Query.offset(offset),
        ],
      );
      all.addAll(res.rows);
      if (res.rows.length < _pageSize) break;
      offset += _pageSize;
    }
    return all;
  }

  static double? _centsToDollars(Object? cents) =>
      cents == null ? null : (cents as num).toInt() / 100.0;

  static int _dollarsToCents(double dollars) => (dollars * 100).round();
}

/// Accumulator for the GROUP BY buckets (count + SUM of fair market value).
class _MutableBucket {
  int count = 0;
  double value = 0;

  void add(double? fmv) {
    count++;
    value += fmv ?? 0.0;
  }

  PortfolioBucket toBucket() => PortfolioBucket(count: count, value: value);
}
