/**
 * ExecutiveDashboard — seller/fleet overview page.
 *
 * KPI cards are wired to /dashboard via useDashboard().
 * All free-tier data (fleet value, recovery opportunity, high-demand assets)
 * is derived from the company's listings + assets tables in the backend.
 *
 * projected_loss_6mo and value_trend remain 0/empty until the ML
 * depreciation forecast endpoint is built (AMPS tier).
 */

import { ArrowDown, ArrowUp, TrendingDown, Package, Loader2, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ValueBadge } from "../components/ValueBadge";
import { SpecPill } from "../components/SpecPill";
import { MarketSignal } from "../components/MarketSignal";
import { useDashboard } from "../lib/apiHooks";

export function ExecutiveDashboard() {
  const { data, isPending, isError, error } = useDashboard();

  const totalFleetValue      = data?.total_fleet_value     ?? 0;
  const inMarketValue        = data?.in_market_value       ?? 0;
  const stagedValue          = data?.staged_value          ?? 0;
  const ampsPortfolioValue   = data?.amps_portfolio_value  ?? 0;
  const totalListedValue     = data?.total_listed_value    ?? 0;
  const totalMarketValue     = data?.total_market_value    ?? 0;
  const projectedLoss        = data?.projected_loss_6mo    ?? 0;
  const recoveryOpportunity  = data?.recovery_opportunity  ?? 0;
  const activeListings       = data?.active_listings       ?? 0;
  const pendingOffers        = data?.pending_offers        ?? 0;
  const idleUnits            = data?.idle_units            ?? 0;
  const efficiencyPct        = data?.fleet_efficiency_pct  ?? 0;
  const overpricedCount      = data?.overpriced_count      ?? 0;
  const totalRecovered       = data?.total_recovered       ?? 0;
  const chartData            = data?.value_trend           ?? [];
  const highDemandAssets     = data?.high_demand_assets    ?? [];

  return (
    <div className="space-y-6 pb-20">
      {/* Loading / error banner */}
      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading dashboard data…
        </div>
      )}
      {isError && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="font-mono text-sm text-amber-700 dark:text-amber-300">
            {error instanceof Error ? error.message : "Failed to load dashboard. Showing placeholder values."}
          </p>
        </div>
      )}

      {/* ── Top KPI row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Fleet Value — hover reveals listed vs market value tooltip */}
        <div className="relative group bg-card border border-border rounded-lg p-6 cursor-default">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Total Fleet Value</p>
              <p className="text-3xl font-mono text-primary mt-2">
                {isPending ? "—" : `$${totalFleetValue.toLocaleString()}`}
              </p>
              {/* Breakdown row */}
              <div className="flex gap-3 mt-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">
                  <span className="text-foreground">${inMarketValue.toLocaleString()}</span> in market
                </span>
                {stagedValue > 0 && (
                  <span className="text-xs font-mono text-muted-foreground">
                    <span className="text-foreground">${stagedValue.toLocaleString()}</span> staged
                  </span>
                )}
                {ampsPortfolioValue > 0 && (
                  <span className="text-xs font-mono text-muted-foreground">
                    <span className="text-amps-accent">${ampsPortfolioValue.toLocaleString()}</span> AMPS
                  </span>
                )}
              </div>
            </div>
            <ArrowUp className="w-5 h-5 text-primary shrink-0" />
          </div>

          {/* Hover tooltip — listed vs market value */}
          <div className="
            absolute left-0 top-full mt-2 z-20 w-full
            opacity-0 pointer-events-none translate-y-1
            group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0
            transition-all duration-150
          ">
            <div className="bg-popover border border-border rounded-lg shadow-lg p-4 font-mono text-xs space-y-2">
              <p className="text-muted-foreground uppercase tracking-wide text-[10px] mb-3">Value Breakdown</p>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Listed value</span>
                <span className="text-foreground tabular-nums">
                  ${totalListedValue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Market value (FMV)</span>
                <span className={totalMarketValue > 0 ? "text-foreground tabular-nums" : "text-muted-foreground/60 tabular-nums"}>
                  {totalMarketValue > 0 ? `$${totalMarketValue.toLocaleString()}` : "—"}
                </span>
              </div>
              {totalMarketValue > 0 && totalListedValue > 0 && (
                <div className="flex items-center justify-between gap-6 pt-2 border-t border-border">
                  <span className="text-muted-foreground">vs. market</span>
                  <span className={
                    totalListedValue > totalMarketValue
                      ? "text-red-500 tabular-nums"
                      : "text-emerald-500 tabular-nums"
                  }>
                    {totalListedValue > totalMarketValue ? "+" : ""}
                    {((totalListedValue / totalMarketValue - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projected Loss */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Projected Loss (6-Mo)</p>
              <p className="text-3xl font-mono text-red-500 dark:text-red-400 mt-2">
                {isPending ? "—" : projectedLoss > 0 ? `-$${Math.abs(projectedLoss).toLocaleString()}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {projectedLoss > 0 ? "If held without action" : "Upgrade to AMPS for forecast"}
              </p>
            </div>
            <ArrowDown className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
        </div>

        {/* Recovery Opportunity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">"Zero-Loss" Opportunity</p>
              <p className="text-3xl font-mono text-primary mt-2">
                {isPending ? "—" : `${recoveryOpportunity} listing${recoveryOpportunity !== 1 ? "s" : ""}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Priced to sell · {overpricedCount} overpriced
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* ── Secondary stats row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Active Listings</p>
          <p className="text-2xl font-mono text-foreground mt-1">{isPending ? "—" : activeListings}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Pending Offers</p>
          <p className="text-2xl font-mono text-foreground mt-1">{isPending ? "—" : pendingOffers}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Fleet Efficiency</p>
          <p className="text-2xl font-mono text-foreground mt-1">
            {isPending ? "—" : `${efficiencyPct.toFixed(0)}%`}
          </p>
          <p className="text-xs text-muted-foreground font-mono">Not overpriced</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Total Recovered</p>
          <p className="text-2xl font-mono text-primary mt-1">
            {isPending ? "—" : `$${totalRecovered.toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* ── Resale Cliff Chart ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6">
          <h2 className="font-mono text-foreground">Resale Value Cliff Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            12-month depreciation forecast vs. new upgrade cost
            {chartData.length === 0 && (
              <span className="ml-2 text-xs text-muted-foreground/70">(available on AMPS)</span>
            )}
          </p>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} key="dashboard-area-chart">
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60A5FA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="colorUpgrade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
              <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" style={{ fontSize: "12px", fontFamily: "monospace" }} />
              <YAxis stroke="currentColor" className="text-muted-foreground" style={{ fontSize: "12px", fontFamily: "monospace" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  color:           "var(--popover-foreground)",
                  border:          "1px solid var(--border)",
                  borderRadius:    "6px",
                  fontFamily:      "monospace",
                  fontSize:        "12px",
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }} />
              <Area type="monotone" dataKey="current" stroke="#60A5FA" strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" name="Current Inventory Value" />
              <Area type="monotone" dataKey="upgrade" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUpgrade)" name="New Upgrade Cost" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center gap-3 bg-muted/30 rounded-lg border border-dashed border-border">
            <TrendingDown className="w-8 h-8 text-muted-foreground/50" />
            <p className="font-mono text-sm text-muted-foreground">ML depreciation forecast requires AMPS</p>
          </div>
        )}
      </div>

      {/* ── High-Intent Asset Table ───────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="font-mono text-foreground">High-Intent Assets</h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono">Active listings recommended for immediate offload</p>
        </div>

        {highDemandAssets.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Package className="w-8 h-8 text-muted-foreground/40" />
            <p className="font-mono text-sm">No active listings yet</p>
            <p className="font-mono text-xs text-muted-foreground/70">Publish listings from My Listings to see fleet recommendations here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-mono text-muted-foreground uppercase tracking-wide">Model</th>
                  <th className="text-left p-4 text-xs font-mono text-muted-foreground uppercase tracking-wide">Specs</th>
                  <th className="text-left p-4 text-xs font-mono text-muted-foreground uppercase tracking-wide">Market Demand</th>
                  <th className="text-left p-4 text-xs font-mono text-muted-foreground uppercase tracking-wide">Optimal Sell By</th>
                  <th className="text-left p-4 text-xs font-mono text-muted-foreground uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {highDemandAssets.map((asset, idx) => (
                  <tr
                    key={asset.asset_id}
                    className={idx !== highDemandAssets.length - 1 ? "border-b border-border/50" : ""}
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-foreground">{asset.model_name}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {asset.specs.split(" / ").filter(Boolean).map((spec) => (
                          <SpecPill key={spec}>{spec}</SpecPill>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <MarketSignal strength={Math.min(5, Math.max(1, asset.demand_score)) as 1 | 2 | 3 | 4 | 5} />
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-muted-foreground">{asset.peak_date}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded text-xs font-mono ${
                        asset.status === "ready"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {asset.status === "ready" ? "Ready to Offload" : "Hold"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
