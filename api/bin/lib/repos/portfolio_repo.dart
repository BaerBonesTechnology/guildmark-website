import '../db/pool.dart';
import '../models/json_helpers.dart';
import '../models/portfolio.dart';

class PortfolioRepo {
  PortfolioRepo(this._db);
  final Db _db;

  Future<PortfolioSummary> summarize({
    required String companyId,
    int trendMonths = 12,
  }) async {
    // ── Live hero stats ──────────────────────────────────────────────────────
    // CTE `ll` picks the most recently updated non-sold/withdrawn listing for
    // each asset. Assets with no such listing appear with NULL FMV/book values.
    final heroRows = await _db.query(
      '''
      WITH ll AS (
        SELECT DISTINCT ON (asset_id)
          asset_id,
          fair_market_value,
          est_book_value
        FROM listings
        WHERE company_id = @cid
          AND status NOT IN (\'sold\', \'withdrawn\')
        ORDER BY asset_id, updated_at DESC
      )
      SELECT
        COUNT(DISTINCT a.id)                                          AS total_devices,
        COALESCE(SUM(ll.fair_market_value),                     0)   AS total_portfolio_value,
        COALESCE(SUM(ll.est_book_value),                        0)   AS total_book_value,
        COALESCE(SUM(GREATEST(
          COALESCE(ll.est_book_value,    0)
          - COALESCE(ll.fair_market_value, 0), 0
        )),                                                     0)   AS total_depreciation,
        COALESCE(AVG(
          EXTRACT(EPOCH FROM age(now(),
            COALESCE(a.purchase_date::TIMESTAMPTZ, a.created_at)
          )) / 2592000.0
        ),                                                      0)   AS avg_age_months,
        COUNT(a.id) FILTER (
          WHERE a.purchase_date < now() - INTERVAL \'36 months\'
            OR (a.purchase_date IS NULL
                AND a.created_at  < now() - INTERVAL \'36 months\')
        )                                                             AS assets_at_risk
      FROM assets a
      LEFT JOIN ll ON ll.asset_id = a.id
      WHERE a.company_id = @cid
      ''',
      parameters: {'cid': companyId},
    );
    final hero = heroRows.first.toColumnMap();

    final totalPortfolioValue =
        numToDoubleOrNull(hero['total_portfolio_value']) ?? 0.0;
    final totalBookValue = numToDoubleOrNull(hero['total_book_value']) ?? 0.0;
    final totalDepreciation =
        numToDoubleOrNull(hero['total_depreciation']) ?? 0.0;
    final totalDevices = numToIntOrNull(hero['total_devices']) ?? 0;
    final avgAgeMonths = numToDoubleOrNull(hero['avg_age_months']) ?? 0.0;
    final assetsAtRisk = numToIntOrNull(hero['assets_at_risk']) ?? 0;
    final depreciationPct = totalBookValue > 0
        ? totalDepreciation / totalBookValue
        : 0.0;

    // ── Bucket breakdowns (type + condition) with live FMV values ────────────
    final bucketRows = await _db.query(
      '''
      WITH ll AS (
        SELECT DISTINCT ON (asset_id)
          asset_id,
          fair_market_value
        FROM listings
        WHERE company_id = @cid
          AND status NOT IN (\'sold\', \'withdrawn\')
        ORDER BY asset_id, updated_at DESC
      )
      SELECT \'type\'      AS bucket,
             a.asset_type::TEXT      AS key,
             COUNT(*)                AS cnt,
             COALESCE(SUM(ll.fair_market_value), 0) AS value
      FROM assets a
      LEFT JOIN ll ON ll.asset_id = a.id
      WHERE a.company_id = @cid
      GROUP BY a.asset_type
      UNION ALL
      SELECT \'condition\' AS bucket,
             a.condition_grade::TEXT AS key,
             COUNT(*)                AS cnt,
             COALESCE(SUM(ll.fair_market_value), 0) AS value
      FROM assets a
      LEFT JOIN ll ON ll.asset_id = a.id
      WHERE a.company_id = @cid
      GROUP BY a.condition_grade
      ''',
      parameters: {'cid': companyId},
    );

    final Map<String, PortfolioBucket> byType = {};
    final Map<String, PortfolioBucket> byCondition = {};
    for (final r in bucketRows) {
      final row = r.toColumnMap();
      final bucket = PortfolioBucket(
        count: numToIntOrNull(row['cnt']) ?? 0,
        value: numToDoubleOrNull(row['value']) ?? 0.0,
      );
      if (row['bucket'] == 'type') {
        byType[row['key'] as String] = bucket;
      } else {
        byCondition[row['key'] as String] = bucket;
      }
    }

    // ── Trend series (historical snapshots) ──────────────────────────────────
    // Upsert today's live-computed values so the chart accumulates daily
    // history automatically without a separate cron job.
    final today = DateTime.now().toUtc();
    final todayStr =
        '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

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
        'cid': companyId,
        'date': todayStr,
        'portVal': totalPortfolioValue,
        'bookVal': totalBookValue,
        'dep': totalDepreciation,
        'devs': totalDevices,
      },
    );

    final trendRows = await _db.query(
      '''
      SELECT snapshot_date, total_portfolio_value, total_book_value,
             total_depreciation, total_devices
      FROM valuation_snapshots
      WHERE company_id = @cid
        AND snapshot_date >= now() - (@months || \' months\')::INTERVAL
      ORDER BY snapshot_date ASC
      ''',
      parameters: {'cid': companyId, 'months': trendMonths},
    );
    final trend = trendRows
        .map((r) => ValuationSnapshot.fromRow(r.toColumnMap()))
        .toList();

    return PortfolioSummary(
      totalDevices: totalDevices,
      totalPortfolioValue: totalPortfolioValue,
      totalBookValue: totalBookValue,
      totalDepreciation: totalDepreciation,
      depreciationPct: depreciationPct,
      avgAssetAgeMonths: avgAgeMonths,
      assetsAtRisk: assetsAtRisk,
      byType: byType,
      byCondition: byCondition,
      trend: trend,
    );
  }
}
