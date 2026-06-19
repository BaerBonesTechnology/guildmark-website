import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/models/json_helpers.dart';

// ---------------------------------------------------------------------------
// High-demand asset entry (top listings recommended for immediate offload)
// ---------------------------------------------------------------------------

class HighDemandAsset {
  HighDemandAsset({
    required this.assetId,
    required this.modelName,
    required this.specs,
    required this.demandScore,
    required this.peakDate,
    required this.status,
  });

  final String assetId;
  final String modelName;
  final String specs;
  final int demandScore; // 1–5
  final String peakDate; // YYYY-MM-DD — estimated optimal sell date
  final String status; // "ready" | "hold"

  Map<String, dynamic> toJson() => {
    'asset_id': assetId,
    'model_name': modelName,
    'specs': specs,
    'demand_score': demandScore,
    'peak_date': peakDate,
    'status': status,
  };
}

// ---------------------------------------------------------------------------
// Summary model
// ---------------------------------------------------------------------------

class DashboardSummary {
  DashboardSummary({
    required this.totalFleetValue,
    required this.inMarketValue,
    required this.stagedValue,
    required this.ampsPortfolioValue,
    required this.totalListedValue,
    required this.totalMarketValue,
    required this.projectedLoss6mo,
    required this.recoveryOpportunity,
    required this.idleUnits,
    required this.fleetEfficiencyPct,
    required this.activeListings,
    required this.pendingOffers,
    required this.totalRecovered,
    required this.overpricedCount,
    required this.highDemandAssets,
  });

  final double
  totalFleetValue; // inMarketValue + stagedValue + ampsPortfolioValue
  final double inMarketValue; // active listings only
  final double stagedValue; // draft / expired / withdrawn listings
  final double
  ampsPortfolioValue; // latest valuation_snapshots row (0 if no AMPS data)
  final double
  totalListedValue; // SUM(listed_price) across all non-sold listings
  final double
  totalMarketValue; // SUM(fair_market_value) across all non-sold listings
  final double projectedLoss6mo; // 0.0 until ML depreciation endpoint is built
  final int recoveryOpportunity; // non-overpriced active listing count
  final int idleUnits; // total quantity across active listings
  final double
  fleetEfficiencyPct; // % of active listings that are not overpriced
  final int activeListings;
  final int pendingOffers;
  final double totalRecovered;
  final int overpricedCount;
  final List<HighDemandAsset> highDemandAssets;

  Map<String, dynamic> toJson() => {
    'total_fleet_value': totalFleetValue,
    'in_market_value': inMarketValue,
    'staged_value': stagedValue,
    'amps_portfolio_value': ampsPortfolioValue,
    'total_listed_value': totalListedValue,
    'total_market_value': totalMarketValue,
    'projected_loss_6mo': projectedLoss6mo,
    'recovery_opportunity': recoveryOpportunity,
    'idle_units': idleUnits,
    'fleet_efficiency_pct': fleetEfficiencyPct,
    'active_listings': activeListings,
    'pending_offers': pendingOffers,
    'total_recovered': totalRecovered,
    'overpriced_count': overpricedCount,
    'high_demand_assets': highDemandAssets.map((a) => a.toJson()).toList(),
    'value_trend': <Map<String, dynamic>>[], // populated by ML tier
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

class DashboardRepo {
  DashboardRepo(this._db);
  final Db _db;

  Future<DashboardSummary> summarize(String companyId) async {
    // ── Main aggregate ───────────────────────────────────────────────────────
    final aggResult = await _db.query(
      '''
      SELECT
        COUNT(*)   FILTER (WHERE l.status = 'active')                                AS active_listings,
        COALESCE(SUM(l.listed_price) FILTER (WHERE l.status = 'active'),         0)  AS in_market_value,
        COALESCE(SUM(l.listed_price) FILTER (WHERE l.status IN (
                                               'draft', 'expired', 'withdrawn')), 0)  AS staged_value,
        COALESCE(SUM(l.listed_price) FILTER (WHERE l.status = 'sold'),           0)  AS total_recovered,
        COALESCE(SUM(a.quantity)     FILTER (WHERE l.status = 'active'),          0)  AS idle_units,
        COUNT(*)   FILTER (WHERE l.status = 'active'
                             AND l.valuation_flag::text <> 'seller_overpriced')       AS good_listings,
        COUNT(*)   FILTER (WHERE l.status = 'active'
                             AND l.valuation_flag::text  = 'seller_overpriced')       AS overpriced_count,
        -- listed value = all non-sold listed prices (what the company is asking)
        COALESCE(SUM(l.listed_price) FILTER (WHERE l.status <> 'sold'),          0)  AS total_listed_value,
        -- market value = ML fair market value for non-sold listings (what they're worth)
        COALESCE(SUM(l.fair_market_value) FILTER (WHERE l.status <> 'sold'),     0)  AS total_market_value
      FROM listings l
      JOIN assets   a ON a.id = l.asset_id
      WHERE l.company_id = @cid
      ''',
      parameters: {'cid': companyId},
    );

    // ── AMPS portfolio snapshot (latest nightly run, 0 if none yet) ──────────
    final snapResult = await _db.query(
      '''
      SELECT COALESCE(total_portfolio_value, 0) AS amps_portfolio_value
      FROM valuation_snapshots
      WHERE company_id = @cid
      ORDER BY snapshot_date DESC
      LIMIT 1
      ''',
      parameters: {'cid': companyId},
    );

    // ── Pending offers ───────────────────────────────────────────────────────
    final offerResult = await _db.query(
      '''
      SELECT COUNT(*) AS pending_offers
      FROM buyer_offers bo
      JOIN listings l ON l.id = bo.listing_id
      WHERE l.company_id = @cid AND bo.status = 'pending'
      ''',
      parameters: {'cid': companyId},
    );

    // ── High-demand assets — top 8 active listings sorted by urgency ─────────
    // Demand score mapping (mirrors frontend MarketSignal logic):
    //   distressed → 5, standard → 3, insufficient_data → 2, overpriced → 1
    // Status: distressed/standard = "ready", others = "hold"
    final assetResult = await _db.query(
      '''
      SELECT
        a.id::text                                 AS asset_id,
        a.model_name,
        l.valuation_flag::text                     AS valuation_flag,
        COALESCE(a.quantity, 1)                    AS quantity,
        COALESCE(a.ram_gb,     0)::int             AS ram_gb,
        COALESCE(a.storage_gb, 0)::int             AS storage_gb,
        COALESCE(a.cpu_score,  0)::int             AS cpu_score,
        (l.created_at + INTERVAL '90 days')::date  AS peak_date
      FROM listings l
      JOIN assets   a ON a.id = l.asset_id
      WHERE l.company_id = @cid AND l.status = 'active'
      ORDER BY
        CASE l.valuation_flag::text
          WHEN 'distressed'        THEN 1
          WHEN 'standard'          THEN 2
          WHEN 'insufficient_data' THEN 3
          ELSE 4
        END,
        l.created_at ASC
      LIMIT 8
      ''',
      parameters: {'cid': companyId},
    );

    // ── Assemble ─────────────────────────────────────────────────────────────
    final aggRow = aggResult.first.toColumnMap();
    final oRow = offerResult.first.toColumnMap();
    final snapRow = snapResult.isEmpty
        ? <String, Object?>{}
        : snapResult.first.toColumnMap();

    final activeListings = numToIntOrNull(aggRow['active_listings']) ?? 0;
    final goodListings = numToIntOrNull(aggRow['good_listings']) ?? 0;
    final overpricedCount = numToIntOrNull(aggRow['overpriced_count']) ?? 0;
    final inMarketValue = numToDoubleOrNull(aggRow['in_market_value']) ?? 0.0;
    final stagedValue = numToDoubleOrNull(aggRow['staged_value']) ?? 0.0;
    final totalRecovered = numToDoubleOrNull(aggRow['total_recovered']) ?? 0.0;
    final totalListedValue =
        numToDoubleOrNull(aggRow['total_listed_value']) ?? 0.0;
    final totalMarketValue =
        numToDoubleOrNull(aggRow['total_market_value']) ?? 0.0;
    final idleUnits = numToIntOrNull(aggRow['idle_units']) ?? 0;
    final pendingOffers = numToIntOrNull(oRow['pending_offers']) ?? 0;
    final ampsPortfolioValue =
        numToDoubleOrNull(snapRow['amps_portfolio_value']) ?? 0.0;

    final totalFleetValue = inMarketValue + stagedValue + ampsPortfolioValue;

    final efficiencyPct = activeListings > 0
        ? (goodListings / activeListings) * 100.0
        : 0.0;

    final highDemandAssets = assetResult.map((row) {
      final r = row.toColumnMap();
      final flag = r['valuation_flag']?.toString() ?? '';
      final ramGb = numToIntOrNull(r['ram_gb']) ?? 0;
      final stoGb = numToIntOrNull(r['storage_gb']) ?? 0;
      final cpu = numToIntOrNull(r['cpu_score']) ?? 0;
      final specParts = <String>[
        if (ramGb > 0) '$ramGb GB RAM',
        if (stoGb > 0) '$stoGb GB SSD',
        if (cpu > 0) 'CPU $cpu',
      ];

      final demandScore = switch (flag) {
        'distressed' => 5,
        'standard' => 3,
        'insufficient_data' => 2,
        _ => 1,
      };

      return HighDemandAsset(
        assetId: r['asset_id']?.toString() ?? '',
        modelName: r['model_name']?.toString() ?? 'Unknown',
        specs: specParts.isEmpty ? '—' : specParts.join(' / '),
        demandScore: demandScore,
        peakDate: r['peak_date']?.toString().split(' ').first ?? '',
        status: (flag == 'distressed' || flag == 'standard') ? 'ready' : 'hold',
      );
    }).toList();

    return DashboardSummary(
      totalFleetValue: totalFleetValue,
      inMarketValue: inMarketValue,
      stagedValue: stagedValue,
      ampsPortfolioValue: ampsPortfolioValue,
      totalListedValue: totalListedValue,
      totalMarketValue: totalMarketValue,
      projectedLoss6mo: 0.0, // ML feature — not yet built
      recoveryOpportunity: goodListings,
      idleUnits: idleUnits,
      fleetEfficiencyPct: efficiencyPct,
      activeListings: activeListings,
      pendingOffers: pendingOffers,
      totalRecovered: totalRecovered,
      overpricedCount: overpricedCount,
      highDemandAssets: highDemandAssets,
    );
  }
}
