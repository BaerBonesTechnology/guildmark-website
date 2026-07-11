/**
 * ExecutiveDashboard — seller/fleet overview page.
 *
 * KPI cards are wired to /dashboard via useDashboard().
 * All free-tier data (fleet value, recovery opportunity, high-demand assets)
 * is derived from the company's listings + assets tables in the backend.
 *
 * projected_loss_6mo and value_trend remain 0/empty until the ML
 * depreciation forecast endpoint is built (AMPS tier).
 *
 * Design: sharp-bordered cards, Barlow Condensed figures, JetBrains Mono
 * labels, DM Sans body. The Total Fleet Value card keeps its hover
 * Value-Breakdown popover (listed vs. market value).
 */

import { ArrowUpRight, ArrowDownRight, TrendingDown, Package, Loader2, AlertTriangle, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { SpecPill } from "../components/SpecPill";
import { MarketSignal } from "../components/MarketSignal";
import { useDashboard } from "../lib/apiHooks";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const CHART_A = "#2d6ef0";
const CHART_B = "#5b8ff7";

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
      {children}
    </span>
  );
}

function BigNumber({ children, color = "var(--foreground)" }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="text-4xl leading-none tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 700, color }}>
      {children}
    </div>
  );
}

export function ExecutiveDashboard() {
  const { data, isPending, isError, error } = useDashboard();

  const totalFleetValue = data?.total_fleet_value ?? 0;
  const inMarketValue = data?.in_market_value ?? 0;
  const stagedValue = data?.staged_value ?? 0;
  const ampsPortfolioValue = data?.amps_portfolio_value ?? 0;
  const totalListedValue = data?.total_listed_value ?? 0;
  const totalMarketValue = data?.total_market_value ?? 0;
  const projectedLoss = data?.projected_loss_6mo ?? 0;
  const recoveryOpportunity = data?.recovery_opportunity ?? 0;
  const activeListings = data?.active_listings ?? 0;
  const pendingOffers = data?.pending_offers ?? 0;
  const idleUnits = data?.idle_units ?? 0;
  const efficiencyPct = data?.fleet_efficiency_pct ?? 0;
  const overpricedCount = data?.overpriced_count ?? 0;
  const totalRecovered = data?.total_recovered ?? 0;
  const chartData = data?.value_trend ?? [];
  const highDemandAssets = data?.high_demand_assets ?? [];

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto space-y-4" style={{ fontFamily: BODY }}>
      {/* Loading / error banner */}
      {isPending && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading dashboard data…
        </div>
      )}
      {isError && (
        <div className="border border-border p-4 flex items-start gap-3" style={{ background: "var(--card)", borderLeft: "3px solid var(--chart-4)" }}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--chart-4)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {error instanceof Error ? error.message : "Failed to load dashboard. Showing placeholder values."}
          </p>
        </div>
      )}

      {/* ── Big stats ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-px border border-border" style={{ background: "var(--border)" }}>
        {/* Total Fleet Value — hover reveals the listed-vs-market breakdown */}
        <div className="relative group flex-1 min-w-0 p-6 flex flex-col gap-3 cursor-default" style={{ background: "var(--card)" }}>
          <div className="flex items-start justify-between gap-3">
            <StatLabel>Total Fleet Value</StatLabel>
            <ArrowUpRight size={16} className="shrink-0" style={{ color: "var(--primary)" }} />
          </div>
          <BigNumber color="var(--primary)">{isPending ? "—" : `$${totalFleetValue.toLocaleString()}`}</BigNumber>
          <div className="flex gap-3 flex-wrap text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span><span style={{ color: "var(--foreground)" }}>${inMarketValue.toLocaleString()}</span> in market</span>
            {stagedValue > 0 && <span><span style={{ color: "var(--foreground)" }}>${stagedValue.toLocaleString()}</span> staged</span>}
            {ampsPortfolioValue > 0 && <span><span style={{ color: "var(--amps-accent)" }}>${ampsPortfolioValue.toLocaleString()}</span> AMPS</span>}
          </div>

          {/* Hover popover — listed vs market value */}
          <div className="absolute left-0 top-full mt-1 z-30 w-full opacity-0 pointer-events-none translate-y-1 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-150">
            <div className="border border-border p-4 text-xs space-y-2" style={{ background: "var(--popover)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
              <p className="tracking-widest uppercase text-[10px] mb-3" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Value Breakdown</p>
              <div className="flex items-center justify-between gap-6">
                <span style={{ color: "var(--muted-foreground)" }}>Listed value</span>
                <span className="tabular-nums" style={{ fontFamily: MONO }}>${totalListedValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span style={{ color: "var(--muted-foreground)" }}>Market value (FMV)</span>
                <span className="tabular-nums" style={{ fontFamily: MONO, color: totalMarketValue > 0 ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  {totalMarketValue > 0 ? `$${totalMarketValue.toLocaleString()}` : "—"}
                </span>
              </div>
              {totalMarketValue > 0 && totalListedValue > 0 && (
                <div className="flex items-center justify-between gap-6 pt-2 border-t border-border">
                  <span style={{ color: "var(--muted-foreground)" }}>vs. market</span>
                  <span className="tabular-nums" style={{ fontFamily: MONO, color: totalListedValue > totalMarketValue ? "var(--chart-4)" : "var(--chart-3)" }}>
                    {totalListedValue > totalMarketValue ? "+" : ""}
                    {((totalListedValue / totalMarketValue - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projected Loss */}
        <div className="flex-1 min-w-0 p-6 flex flex-col gap-3" style={{ background: "var(--card)" }}>
          <div className="flex items-start justify-between gap-3">
            <StatLabel>Projected Loss (6-Mo)</StatLabel>
            <ArrowDownRight size={16} className="shrink-0" style={{ color: "var(--chart-4)" }} />
          </div>
          <BigNumber color="var(--chart-4)">{isPending ? "—" : projectedLoss > 0 ? `-$${Math.abs(projectedLoss).toLocaleString()}` : "—"}</BigNumber>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {projectedLoss > 0 ? "If held without action" : "Upgrade to AMPS for forecast"}
          </div>
        </div>

        {/* Zero-Loss Opportunity */}
        <div className="flex-1 min-w-0 p-6 flex flex-col gap-3" style={{ background: "var(--card)" }}>
          <div className="flex items-start justify-between gap-3">
            <StatLabel>"Zero-Loss" Opportunity</StatLabel>
            <TrendingDown size={16} className="shrink-0" style={{ color: "var(--primary)" }} />
          </div>
          <BigNumber color="var(--primary)">{isPending ? "—" : `${recoveryOpportunity} listing${recoveryOpportunity !== 1 ? "s" : ""}`}</BigNumber>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Priced to sell · {overpricedCount} overpriced</div>
        </div>
      </div>

      {/* ── Small stats ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-px border border-border" style={{ background: "var(--border)" }}>
        {[
          { label: "Active Listings", value: isPending ? "—" : `${activeListings}` },
          { label: "Pending Offers", value: isPending ? "—" : `${pendingOffers}` },
          { label: "Fleet Efficiency", value: isPending ? "—" : `${efficiencyPct.toFixed(0)}%`, sub: "Not overpriced" },
          { label: "Total Recovered", value: isPending ? "—" : `$${totalRecovered.toLocaleString()}`, accent: true },
        ].map((s) => (
          <div key={s.label} className="flex-1 min-w-0 p-4 flex flex-col gap-2" style={{ background: "var(--card)" }}>
            <StatLabel>{s.label}</StatLabel>
            <div className="text-2xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700, color: s.accent ? "var(--primary)" : "var(--foreground)" }}>{s.value}</div>
            {s.sub && <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Resale Cliff Chart ────────────────────────────────────────────── */}
      {chartData.length > 0 ? (<div className="border border-border p-6" style={{ background: "var(--card)" }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-medium mb-1">Resale Value Cliff Analysis</p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
              12-month depreciation forecast vs. new upgrade cost
              {chartData.length === 0 && (
                <span className="px-1.5 py-0.5 text-[9px] tracking-widest border" style={{ borderColor: "var(--amps-accent)", color: "var(--amps-accent)", fontFamily: MONO }}>AMPS</span>
              )}
            </p>
          </div>
          <BarChart2 size={16} className="shrink-0 mt-0.5" style={{ color: "var(--muted-foreground)" }} />
        </div>


        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} key="dashboard-area-chart">
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_B} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_B} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUpgrade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_A} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_A} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
            <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" style={{ fontSize: "12px", fontFamily: "monospace" }} />
            <YAxis stroke="currentColor" className="text-muted-foreground" style={{ fontSize: "12px", fontFamily: "monospace" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                color: "var(--popover-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "0px",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }} />
            <Area type="monotone" dataKey="current" stroke={CHART_B} strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" name="Current Inventory Value" />
            <Area type="monotone" dataKey="upgrade" stroke={CHART_A} strokeWidth={2} fillOpacity={1} fill="url(#colorUpgrade)" name="New Upgrade Cost" />
          </AreaChart>
        </ResponsiveContainer>

      </div>
      ) : null}
      {/* ── High-Intent Asset Table ───────────────────────────────────────── */}
      <div className="border border-border" style={{ background: "var(--card)" }}>
        <div className="p-6 border-b border-border">
          <p className="text-sm font-medium">High-Intent Assets</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Active listings recommended for immediate offload</p>
        </div>

        {highDemandAssets.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3" style={{ color: "var(--muted-foreground)" }}>
            <Package className="w-8 h-8" style={{ opacity: 0.4 }} />
            <p className="text-sm">No active listings yet</p>
            <p className="text-xs text-center max-w-[280px]" style={{ opacity: 0.7 }}>Publish listings from My Listings to see fleet recommendations here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Model", "Specs", "Market Demand", "Optimal Sell By", "Action"].map((h) => (
                    <th key={h} className="text-left p-4 text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {highDemandAssets.map((asset, idx) => (
                  <tr key={asset.asset_id} className={idx !== highDemandAssets.length - 1 ? "border-b border-border/50" : ""}>
                    <td className="p-4"><span className="text-sm">{asset.model_name}</span></td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {asset.specs.split(" / ").filter(Boolean).map((spec) => <SpecPill key={spec}>{spec}</SpecPill>)}
                      </div>
                    </td>
                    <td className="p-4"><MarketSignal strength={Math.min(5, Math.max(1, asset.demand_score)) as 1 | 2 | 3 | 4 | 5} /></td>
                    <td className="p-4"><span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{asset.peak_date}</span></td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs border"
                        style={asset.status === "ready"
                          ? { color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)", background: "color-mix(in srgb, var(--primary) 8%, transparent)" }
                          : { color: "var(--muted-foreground)", borderColor: "var(--border)", background: "var(--secondary)" }}>
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
