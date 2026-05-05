/**
 * ExecutiveDashboard — seller/fleet overview page.
 *
 * KPI cards are wired to /dashboard via useDashboard().
 * The resale-cliff chart and high-intent asset table are driven by
 * /amps/portfolio via usePortfolioSummary().
 *
 * TODO: The backend DashboardRepo.summarize() currently returns a lightweight
 * count-only summary (active_listings, pending_offers, total_listed_value,
 * total_recovered, overpriced_count). The full DashboardData shape that this
 * page expects — including projected_loss_6mo, fleet_efficiency_pct,
 * high_demand_assets, and value_trend — requires additional backend work:
 *   1. Extend DashboardSummary / the /dashboard route to include those fields.
 *   2. The ML depreciation forecast endpoint can power projected_loss_6mo.
 *   3. high_demand_assets needs a demand-signal table or eBay comp query.
 * Until then, those sections fall back to the static placeholder data below.
 */

import { ArrowDown, ArrowUp, TrendingDown, Loader2, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ValueBadge } from "../components/ValueBadge";
import { SpecPill } from "../components/SpecPill";
import { MarketSignal } from "../components/MarketSignal";
import { useDashboard } from "../lib/apiHooks";

// ---------------------------------------------------------------------------
// Fallback / placeholder data
// These sections need real API backing — see module-level TODO above.
// ---------------------------------------------------------------------------

const PLACEHOLDER_CHART_DATA = [
  { month: "Apr 26", current: 42500, upgrade: 45000 },
  { month: "May 26", current: 41200, upgrade: 45000 },
  { month: "Jun 26", current: 39800, upgrade: 45000 },
  { month: "Jul 26", current: 38100, upgrade: 45000 },
  { month: "Aug 26", current: 36200, upgrade: 45000 },
  { month: "Sep 26", current: 30100, upgrade: 45000 },
  { month: "Oct 26", current: 28500, upgrade: 45000 },
  { month: "Nov 26", current: 27200, upgrade: 45000 },
  { month: "Dec 26", current: 26100, upgrade: 45000 },
  { month: "Jan 27", current: 25200, upgrade: 45000 },
  { month: "Feb 27", current: 24500, upgrade: 45000 },
  { month: "Mar 27", current: 23800, upgrade: 45000 },
];

// TODO: Replace with data from GET /dashboard → high_demand_assets once
// the backend demand-signal query is implemented.
const PLACEHOLDER_HIGH_INTENT = [
  { tag: "MBP-2023-042", specs: "M2 Pro / 16GB / 512GB", demand: 5, peakDate: "Sept 2026", status: "ready" },
  { tag: "MBP-2023-018", specs: "M2 Max / 32GB / 1TB",   demand: 5, peakDate: "Sept 2026", status: "ready" },
  { tag: "MBA-2023-091", specs: "M2 / 16GB / 256GB",      demand: 5, peakDate: "Oct 2026",  status: "ready" },
  { tag: "WS-2022-004",  specs: "Intel i9 / 64GB / 2TB",  demand: 2, peakDate: "May 2026",  status: "hold"  },
  { tag: "MBP-2022-156", specs: "M1 Pro / 16GB / 512GB",  demand: 4, peakDate: "Aug 2026",  status: "ready" },
  { tag: "MBA-2022-203", specs: "M1 / 8GB / 256GB",       demand: 3, peakDate: "Jul 2026",  status: "hold"  },
];

// ---------------------------------------------------------------------------

export function ExecutiveDashboard() {
  const { data, isPending, isError, error } = useDashboard();

  // KPI values — prefer live data, fall back to 0 while loading or on error.
  // TODO: Map total_fleet_value, projected_loss_6mo, recovery_opportunity
  // directly from backend once those fields are added to DashboardSummary.
  const totalFleetValue      = data?.total_fleet_value     ?? 0;
  const projectedLoss        = data?.projected_loss_6mo    ?? 0;
  const recoveryOpportunity  = data?.recovery_opportunity  ?? 0;

  // TODO: Replace PLACEHOLDER_CHART_DATA with data?.value_trend once the
  // /dashboard route returns that field (driven by ML depreciation forecast).
  const chartData = (data as any)?.value_trend ?? PLACEHOLDER_CHART_DATA;

  // TODO: Replace PLACEHOLDER_HIGH_INTENT with data?.high_demand_assets once
  // the backend demand-score query is implemented.
  const highIntentAssets = (data as any)?.high_demand_assets ?? PLACEHOLDER_HIGH_INTENT;

  return (
    <div className="space-y-6 pb-20">
      {/* Loading / error banner */}
      {isPending && (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-sm">
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

      {/* Header Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">Total Fleet Value</p>
              <p className="text-3xl font-mono text-[#3B82F6] mt-2">
                {isPending ? "—" : `$${totalFleetValue.toLocaleString()}`}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">Current market rate</p>
            </div>
            <ArrowUp className="w-5 h-5 text-[#3B82F6]" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">Projected Loss (6-Mo)</p>
              <p className="text-3xl font-mono text-red-500 dark:text-red-400 mt-2">
                {isPending ? "—" : `-$${Math.abs(projectedLoss).toLocaleString()}`}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">If held without action</p>
            </div>
            <ArrowDown className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">"Zero-Loss" Opportunity</p>
              <p className="text-3xl font-mono text-[#60A5FA] mt-2">
                {isPending ? "—" : `${recoveryOpportunity} units`}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">90%+ of book value recoverable</p>
            </div>
            <TrendingDown className="w-5 h-5 text-[#60A5FA]" />
          </div>
        </div>
      </div>

      {/* Resale Cliff Chart */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="font-mono text-slate-900 dark:text-slate-100">Resale Value Cliff Analysis</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">12-month depreciation forecast vs. new upgrade cost</p>
        </div>

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
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-300 dark:text-slate-600" opacity={0.2} />
            <XAxis dataKey="month" stroke="currentColor" className="text-slate-600 dark:text-slate-400" style={{ fontSize: "12px", fontFamily: "monospace" }} />
            <YAxis stroke="currentColor" className="text-slate-600 dark:text-slate-400" style={{ fontSize: "12px", fontFamily: "monospace" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                color:           "hsl(var(--popover-foreground))",
                border:          "1px solid hsl(var(--border))",
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
      </div>

      {/* High-Intent Asset List */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="font-mono text-slate-900 dark:text-slate-100">High-Intent Assets</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">Recommended for immediate offload</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50">
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Asset Tag</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Specs</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Market Demand</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Peak Value Date</th>
                <th className="text-left p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {highIntentAssets.map((asset: any, idx: number) => (
                <tr key={asset.tag ?? asset.asset_id} className={idx !== highIntentAssets.length - 1 ? "border-b border-slate-100 dark:border-slate-700/30" : ""}>
                  <td className="p-4">
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-200">{asset.tag ?? asset.asset_id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {(asset.specs ?? "").split(" / ").map((spec: string) => (
                        <SpecPill key={spec}>{spec}</SpecPill>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <MarketSignal strength={(asset.demand ?? asset.demand_score ?? 3) as 1 | 2 | 3 | 4 | 5} />
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-slate-600 dark:text-slate-300">{asset.peakDate ?? asset.peak_date}</span>
                  </td>
                  <td className="p-4">
                    <button
                      className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                        asset.status === "ready"
                          ? "bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30"
                          : "bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {asset.status === "ready" ? "Ready to Offload" : "Hold"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
