/** Total Fleet Value KPI card with a hover listed-vs-market breakdown popover. */
import { ArrowUpRight } from "lucide-react";
import { BigNumber } from "./BigNumber";
import { StatLabel } from "./StatLabel";
import { MONO } from "../../constants/typography";
import { vsMarketPercent } from "../../services/dashboard.service";

interface FleetValueCardProps {
  ampsPortfolioValue: number;
  inMarketValue: number;
  isPending: boolean;
  stagedValue: number;
  totalFleetValue: number;
  totalListedValue: number;
  totalMarketValue: number;
}

export function FleetValueCard({
  ampsPortfolioValue, inMarketValue, isPending, stagedValue, totalFleetValue, totalListedValue, totalMarketValue,
}: FleetValueCardProps) {
  const marketPercent = vsMarketPercent(totalListedValue, totalMarketValue);

  return (
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
          {marketPercent != null && (
            <div className="flex items-center justify-between gap-6 pt-2 border-t border-border">
              <span style={{ color: "var(--muted-foreground)" }}>vs. market</span>
              <span className="tabular-nums" style={{ fontFamily: MONO, color: marketPercent > 0 ? "var(--chart-4)" : "var(--chart-3)" }}>
                {marketPercent > 0 ? "+" : ""}
                {marketPercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
