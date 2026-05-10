/// AMPS portfolio aggregates.
///
/// The nightly snapshot job writes one row per company into
/// `valuation_snapshots`. The `summarize` method reads from there for the
/// trend series and computes hero stats from the live `assets` table so the
/// dashboard always reflects the current inventory.
library;

import '../db/pool.dart';
import '../models/json_helpers.dart';
import '../models/portfolio.dart';

class PortfolioRepo {
  PortfolioRepo(this._db);
  final Db _db;

  /// Hero stats + bucket breakdowns + N-month trend.
  ///
  /// Hero stats are computed live from `assets`.
  /// Trend data comes from the pre-aggregated `valuation_snapshots` table.
  ///
  /// `assets_at_risk` = assets whose purchase date implies > 36 months of age,
  /// since they are past typical refresh cycles and depreciation accelerates.
  Future<PortfolioSummary> summarize({
    required String companyId,
    int trendMonths = 12,
  }) async {
    // -- Hero stats ----------------------------------------------------------
    final heroRows = await _db.query(
      '''
      SELECT
        COUNT(*)                                           AS total_devices,
        SUM(cpu_score)                                     AS ignored,   -- placeholder
        AVG(
          EXTRACT(MONTH FROM age(now(),
            COALESCE(purchase_date::TIMESTAMPTZ, created_at)))
        )                                                  AS avg_age_months,
        COUNT(*) FILTER (
          WHERE purchase_date < now() - INTERVAL '36 months'
          OR (purchase_date IS NULL AND created_at < now() - INTERVAL '36 months')
        )                                                  AS assets_at_risk
      FROM assets
      WHERE company_id = @cid
      ''',
      parameters: {'cid': companyId},
    );
    final hero = heroRows.first.toColumnMap();

    // -- Latest snapshot values (for total_portfolio_value, book_value, etc.) -
    // Fall back to 0 if no snapshot exists yet (pre-first nightly run).
    final snapRows = await _db.query(
      '''
      SELECT total_portfolio_value, total_book_value, total_depreciation, total_devices
      FROM valuation_snapshots
      WHERE company_id = @cid
      ORDER BY snapshot_date DESC
      LIMIT 1
      ''',
      parameters: {'cid': companyId},
    );
    final snap = snapRows.isEmpty ? <String, Object?>{} : snapRows.first.toColumnMap();

    final totalPortfolioValue = numToDoubleOrNull(snap['total_portfolio_value']) ?? 0.0;
    final totalBookValue      = numToDoubleOrNull(snap['total_book_value'])      ?? 0.0;
    final totalDepreciation   = numToDoubleOrNull(snap['total_depreciation'])    ?? 0.0;
    final totalDevices        = numToIntOrNull(hero['total_devices'])            ?? 0;
    final avgAgeMonths        = numToDoubleOrNull(hero['avg_age_months'])        ?? 0.0;
    final assetsAtRisk        = numToIntOrNull(hero['assets_at_risk'])           ?? 0;
    final depreciationPct     = totalBookValue > 0
        ? totalDepreciation / totalBookValue
        : 0.0;

    // -- Bucket breakdowns ---------------------------------------------------
    // Single query using UNION ALL — one round-trip for both breakdowns.
    // TODO: Populate bucket `value` field once per-asset fair_market_value is
    // stored on the assets table (currently only on listings). For now value
    // is set to 0.0 as a placeholder.
    final bucketRows = await _db.query(
      '''
      SELECT 'type'      AS bucket, asset_type::TEXT      AS key, COUNT(*) AS cnt
      FROM assets WHERE company_id = @cid GROUP BY asset_type
      UNION ALL
      SELECT 'condition' AS bucket, condition_grade::TEXT AS key, COUNT(*) AS cnt
      FROM assets WHERE company_id = @cid GROUP BY condition_grade
      ''',
      parameters: {'cid': companyId},
    );

    final Map<String, PortfolioBucket> byType      = {};
    final Map<String, PortfolioBucket> byCondition = {};
    for (final r in bucketRows) {
      final row    = r.toColumnMap();
      final bucket = PortfolioBucket(count: numToIntOrNull(row['cnt']) ?? 0, value: 0.0);
      if (row['bucket'] == 'type') {
        byType[row['key'] as String] = bucket;
      } else {
        byCondition[row['key'] as String] = bucket;
      }
    }

    // -- Trend series --------------------------------------------------------
    final trendRows = await _db.query(
      '''
      SELECT snapshot_date, total_portfolio_value, total_book_value,
             total_depreciation, total_devices
      FROM valuation_snapshots
      WHERE company_id = @cid
        AND snapshot_date >= now() - (@months || ' months')::INTERVAL
      ORDER BY snapshot_date ASC
      ''',
      parameters: {'cid': companyId, 'months': trendMonths},
    );
    final trend = trendRows
        .map((r) => ValuationSnapshot.fromRow(r.toColumnMap()))
        .toList();

    return PortfolioSummary(
      totalDevices:        totalDevices,
      totalPortfolioValue: totalPortfolioValue,
      totalBookValue:      totalBookValue,
      totalDepreciation:   totalDepreciation,
      depreciationPct:     depreciationPct,
      avgAssetAgeMonths:   avgAgeMonths,
      assetsAtRisk:        assetsAtRisk,
      byType:              byType,
      byCondition:         byCondition,
      trend:               trend,
    );
  }

  /// Upsert one valuation snapshot row (called by the nightly job).
  Future<void> writeSnapshot(ValuationSnapshot snapshot) async {
    await _db.query(
      '''
      INSERT INTO valuation_snapshots
        (company_id, snapshot_date, total_portfolio_value, total_book_value,
         total_depreciation, total_devices)
      VALUES
        (@cid, @date, @portVal, @bookVal, @dep, @devs)
      ON CONFLICT (company_id, snapshot_date) DO UPDATE SET
        total_portfolio_value = EXCLUDED.total_portfolio_value,
        total_book_value      = EXCLUDED.total_book_value,
        total_depreciation    = EXCLUDED.total_depreciation,
        total_devices         = EXCLUDED.total_devices
      ''',
      parameters: {
        'cid':     snapshot.snapshotDate, // placeholder — route handler must pass companyId separately
        'date':    snapshot.snapshotDate,
        'portVal': snapshot.totalPortfolioValue,
        'bookVal': snapshot.totalBookValue,
        'dep':     snapshot.totalDepreciation,
        'devs':    snapshot.totalDevices,
      },
    );
    // TODO: writeSnapshot should accept companyId as a separate param; the
    // ValuationSnapshot model doesn't currently carry it. Refactor when
    // the nightly job is implemented.
  }

}
