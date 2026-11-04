/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'dart:math';

import 'package:guildmark_api/firebase/firestore.dart';

import 'package:guildmark_api/firebase/collections.dart';

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
  final int    demandScore; // 1–5
  final String peakDate;   // YYYY-MM-DD — estimated optimal sell date
  final String status;     // "ready" | "hold"

  Map<String, dynamic> toJson() => {
        'asset_id':     assetId,
        'model_name':   modelName,
        'specs':        specs,
        'demand_score': demandScore,
        'peak_date':    peakDate,
        'status':       status,
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

  final double totalFleetValue;     // inMarketValue + stagedValue + ampsPortfolioValue
  final double inMarketValue;       // active listings only
  final double stagedValue;         // draft / expired / withdrawn listings
  final double ampsPortfolioValue;  // latest valuation_snapshots row (0 if no AMPS data)
  final double totalListedValue;    // SUM(listed_price) across all non-sold listings
  final double totalMarketValue;    // SUM(fair_market_value) across all non-sold listings
  final double projectedLoss6mo;    // 0.0 until ML depreciation endpoint is built
  final int    recoveryOpportunity; // non-overpriced active listing count
  final int    idleUnits;           // total quantity across active listings
  final double fleetEfficiencyPct;  // % of active listings that are not overpriced
  final int    activeListings;
  final int    pendingOffers;
  final double totalRecovered;
  final int    overpricedCount;
  final List<HighDemandAsset> highDemandAssets;

  Map<String, dynamic> toJson() => {
        'total_fleet_value':    totalFleetValue,
        'in_market_value':      inMarketValue,
        'staged_value':         stagedValue,
        'amps_portfolio_value': ampsPortfolioValue,
        'total_listed_value':   totalListedValue,
        'total_market_value':   totalMarketValue,
        'projected_loss_6mo':   projectedLoss6mo,
        'recovery_opportunity': recoveryOpportunity,
        'idle_units':           idleUnits,
        'fleet_efficiency_pct': fleetEfficiencyPct,
        'active_listings':      activeListings,
        'pending_offers':       pendingOffers,
        'total_recovered':      totalRecovered,
        'overpriced_count':     overpricedCount,
        'high_demand_assets':   highDemandAssets.map((a) => a.toJson()).toList(),
        'value_trend':          <Map<String, dynamic>>[],  // populated by ML tier
      };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

class DashboardRepo {
  DashboardRepo(this._aw);
  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  static const _pageSize = 30;

  /// Aggregate seller dashboard stats for a single company.
  ///
  /// Derives fleet KPIs from the listings + assets collections (fetched and
  /// reduced in Dart) so that free-tier accounts see real data without
  /// needing AMPS features.
  ///
  /// [projected_loss_6mo] and [value_trend] remain 0 / empty until the ML
  /// depreciation forecast endpoint is integrated.
  Future<DashboardSummary> summarize(String companyId) async {
    // ── Fetch: all listings + assets for the company (§1c page loop) ────────
    final listings =
        await _pageAll(Collections.listings, [Query.equal('company_id', companyId)]);
    final assets =
        await _pageAll(Collections.assets, [Query.equal('company_id', companyId)]);
    final assetById = <String, Row>{for (final a in assets) a.$id: a};

    // ── Reduce: the main SQL aggregate, in Dart ─────────────────────────────
    var activeListings = 0;
    var goodListings = 0;
    var overpricedCount = 0;
    var idleUnits = 0;
    var inMarketValue = 0.0;
    var stagedValue = 0.0;
    var totalRecovered = 0.0;
    var totalListedValue = 0.0;
    var totalMarketValue = 0.0;
    final activeRows = <Row>[];

    for (final l in listings) {
      final asset = assetById[l.data['asset_id'] as String?];
      // JOIN assets — listings without a resolvable asset are excluded.
      if (asset == null) continue;

      final status = (l.data['status'] as String?) ?? 'draft';
      final flag = (l.data['valuation_flag'] as String?) ?? 'standard';
      final listedPrice = _centsToDollars(l.data['listed_price_cents']) ?? 0.0;
      final fairMarketValue =
          _centsToDollars(l.data['fair_market_value_cents']) ?? 0.0;

      switch (status) {
        case 'active':
          activeListings++;
          inMarketValue += listedPrice;
          idleUnits += (asset.data['quantity'] as num?)?.toInt() ?? 0;
          if (flag == 'seller_overpriced') {
            overpricedCount++;
          } else {
            goodListings++;
          }
          activeRows.add(l);
        case 'draft' || 'expired' || 'withdrawn':
          stagedValue += listedPrice;
        case 'sold':
          totalRecovered += listedPrice;
      }
      if (status != 'sold') {
        totalListedValue += listedPrice;
        totalMarketValue += fairMarketValue;
      }
    }

    // ── AMPS portfolio snapshot (latest nightly run, 0 if none yet) ─────────
    final snapRes = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.valuationSnapshots,
      queries: [
        Query.equal('company_id', companyId),
        Query.orderDesc('snapshot_date'),
        Query.limit(1),
      ],
    );
    final ampsPortfolioValue = snapRes.rows.isEmpty
        ? 0.0
        : _centsToDollars(
              snapRes.rows.first.data['total_portfolio_value_cents'],
            ) ??
            0.0;

    // ── Pending offers: JOIN listings → IN-query on listing ids + .total ────
    var pendingOffers = 0;
    final listingIds = listings.map((l) => l.$id).toList();
    for (var i = 0; i < listingIds.length; i += _pageSize) {
      final chunk =
          listingIds.sublist(i, min(i + _pageSize, listingIds.length));
      final res = await _db.listRows(
        databaseId: Collections.databaseId,
        tableId: Collections.buyerOffers,
        queries: [
          Query.equal('listing_id', chunk),
          Query.equal('status', 'pending'),
          Query.limit(1),
        ],
      );
      pendingOffers += res.total;
    }

    // ── High-demand assets — top 8 active listings sorted by urgency ────────
    // Demand score mapping (mirrors frontend MarketSignal logic):
    //   distressed → 5, standard → 3, insufficient_data → 2, overpriced → 1
    // Status: distressed/standard = "ready", others = "hold"
    activeRows.sort((a, b) {
      final rank = _flagRank(a.data['valuation_flag'] as String?)
          .compareTo(_flagRank(b.data['valuation_flag'] as String?));
      if (rank != 0) return rank;
      return a.$createdAt.compareTo(b.$createdAt); // created_at ASC
    });

    final highDemandAssets = activeRows.take(8).map((l) {
      final asset = assetById[l.data['asset_id'] as String?];
      final flag = (l.data['valuation_flag'] as String?) ?? '';
      final ramGb = (asset?.data['ram_gb'] as num?)?.toInt() ?? 0;
      final stoGb = (asset?.data['storage_gb'] as num?)?.toInt() ?? 0;
      final cpu = (asset?.data['cpu_score'] as num?)?.toInt() ?? 0;
      final specParts = <String>[
        if (ramGb > 0) '$ramGb GB RAM',
        if (stoGb > 0) '$stoGb GB SSD',
        if (cpu > 0) 'CPU $cpu',
      ];

      final demandScore = switch (flag) {
        'distressed'        => 5,
        'standard'          => 3,
        'insufficient_data' => 2,
        _                   => 1,
      };

      // peak_date = listing created_at + 90 days, as YYYY-MM-DD.
      final peak = DateTime.parse(l.$createdAt).add(const Duration(days: 90));
      final peakDate = '${peak.year.toString().padLeft(4, '0')}-'
          '${peak.month.toString().padLeft(2, '0')}-'
          '${peak.day.toString().padLeft(2, '0')}';

      return HighDemandAsset(
        assetId:     asset?.$id ?? '',
        modelName:   asset?.data['model_name'] as String? ?? 'Unknown',
        specs:       specParts.isEmpty ? '—' : specParts.join(' / '),
        demandScore: demandScore,
        peakDate:    peakDate,
        status:      (flag == 'distressed' || flag == 'standard')
            ? 'ready'
            : 'hold',
      );
    }).toList();

    // ── Assemble ────────────────────────────────────────────────────────────
    final totalFleetValue = inMarketValue + stagedValue + ampsPortfolioValue;
    final efficiencyPct = activeListings > 0
        ? (goodListings / activeListings) * 100.0
        : 0.0;

    return DashboardSummary(
      totalFleetValue:     totalFleetValue,
      inMarketValue:       inMarketValue,
      stagedValue:         stagedValue,
      ampsPortfolioValue:  ampsPortfolioValue,
      totalListedValue:    totalListedValue,
      totalMarketValue:    totalMarketValue,
      projectedLoss6mo:    0,   // ML feature — not yet built
      recoveryOpportunity: goodListings,
      idleUnits:           idleUnits,
      fleetEfficiencyPct:  efficiencyPct,
      activeListings:      activeListings,
      pendingOffers:       pendingOffers,
      totalRecovered:      totalRecovered,
      overpricedCount:     overpricedCount,
      highDemandAssets:    highDemandAssets,
    );
  }

  /// Page through every row matching [queries] (Query.limit + Query.offset
  /// loop until a short page). Per-company sets are bounded (§1c).
  Future<List<Row>> _pageAll(String tableId, List<String> queries) async {
    final all = <Row>[];
    var offset = 0;
    while (true) {
      final res = await _db.listRows(
        databaseId: Collections.databaseId,
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

  static int _flagRank(String? flag) => switch (flag) {
        'distressed'        => 1,
        'standard'          => 2,
        'insufficient_data' => 3,
        _                   => 4,
      };

  static double? _centsToDollars(Object? cents) =>
      cents == null ? null : (cents as num).toInt() / 100.0;
}
