/**
 * ExecutiveDashboard — seller/fleet overview page (View).
 * KPI values come from useDashboardViewModel; the fleet-value card, resale
 * chart, and high-intent table are their own components. The Total Fleet Value
 * card keeps its hover Value-Breakdown popover.
 */
import { ArrowDownRight, AlertTriangle, Loader2, TrendingDown } from "lucide-react";
import { BigNumber } from "../components/dashboard/BigNumber";
import { FleetValueCard } from "../components/dashboard/FleetValueCard";
import { HighIntentAssetsTable } from "../components/dashboard/HighIntentAssetsTable";
import { ResaleCliffChart } from "../components/dashboard/ResaleCliffChart";
import { StatLabel } from "../components/dashboard/StatLabel";
import { BODY, DISPLAY } from "../constants/typography";
import { useDashboardViewModel } from "../viewmodels/useDashboardViewModel";

export function ExecutiveDashboard() {
  const {
    activeListings, ampsPortfolioValue, chartData, efficiencyPct, error, highDemandAssets,
    inMarketValue, isError, isPending, overpricedCount, pendingOffers, projectedLoss,
    recoveryOpportunity, stagedValue, totalFleetValue, totalListedValue, totalMarketValue, totalRecovered,
  } = useDashboardViewModel();

  const smallStats = [
    { label: "Active Listings", value: isPending ? "—" : `${activeListings}` },
    { label: "Pending Offers", value: isPending ? "—" : `${pendingOffers}` },
    { label: "Fleet Efficiency", value: isPending ? "—" : `${efficiencyPct.toFixed(0)}%`, sub: "Not overpriced" },
    { label: "Total Recovered", value: isPending ? "—" : `$${totalRecovered.toLocaleString()}`, accent: true },
  ];

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
        <FleetValueCard
          ampsPortfolioValue={ampsPortfolioValue}
          inMarketValue={inMarketValue}
          isPending={isPending}
          stagedValue={stagedValue}
          totalFleetValue={totalFleetValue}
          totalListedValue={totalListedValue}
          totalMarketValue={totalMarketValue}
        />

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
        {smallStats.map((stat) => (
          <div key={stat.label} className="flex-1 min-w-0 p-4 flex flex-col gap-2" style={{ background: "var(--card)" }}>
            <StatLabel>{stat.label}</StatLabel>
            <div className="text-2xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700, color: stat.accent ? "var(--primary)" : "var(--foreground)" }}>{stat.value}</div>
            {stat.sub && <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Resale Cliff Chart ────────────────────────────────────────────── */}
      {chartData.length > 0 ? <ResaleCliffChart chartData={chartData} /> : null}

      {/* ── High-Intent Asset Table ───────────────────────────────────────── */}
      <HighIntentAssetsTable assets={highDemandAssets} />
    </div>
  );
}
