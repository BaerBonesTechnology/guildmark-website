/** Resale value-cliff area chart (12-month depreciation forecast). */
import { BarChart2 } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CHART_CURRENT_COLOR, CHART_UPGRADE_COLOR } from "../../constants/dashboard.constants";
import { MONO } from "../../constants/typography";

interface ResaleCliffPoint {
  current: number;
  month: string;
  upgrade: number;
}

export function ResaleCliffChart({ chartData }: { chartData: ResaleCliffPoint[] }) {
  return (
    <div className="border border-border p-6" style={{ background: "var(--card)" }}>
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
              <stop offset="5%" stopColor={CHART_CURRENT_COLOR} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_CURRENT_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUpgrade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_UPGRADE_COLOR} stopOpacity={0.2} />
              <stop offset="95%" stopColor={CHART_UPGRADE_COLOR} stopOpacity={0} />
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
          <Area type="monotone" dataKey="current" stroke={CHART_CURRENT_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" name="Current Inventory Value" />
          <Area type="monotone" dataKey="upgrade" stroke={CHART_UPGRADE_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorUpgrade)" name="New Upgrade Cost" />
        </AreaChart>
      </ResponsiveContainer>

    </div>
  );
}
