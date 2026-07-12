/**
 * AMPS Portfolio Overview — fleet value & health dashboard (View).
 * Summary fetch and chart transforms live in usePortfolioOverviewViewModel;
 * StatCard and Panel are shared AMPS components. Presentation only.
 */
import { AlertCircle, ArrowRight, Package, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "../../components/amps/Panel";
import { StatCard } from "../../components/amps/StatCard";
import { AMPS_ACCENT, AMPS_TOOLTIP_STYLE, PORTFOLIO_QUICK_ACTIONS } from "../../constants/amps.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { formatUsd } from "../../services/portfolio.service";
import { usePortfolioOverviewViewModel } from "../../viewmodels/usePortfolioOverviewViewModel";

export function PortfolioOverview() {
  const { conditionSlices, depPct, error, isLoading, portfolio, trendData, typeSlices } = usePortfolioOverviewViewModel();

  if (isLoading) {
    return (
      <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
        <div className="h-9 w-64 mb-6 animate-pulse" style={{ background: "var(--secondary)" }} />
        <div className="grid grid-cols-4 gap-px border border-border mb-6" style={{ background: "var(--border)" }}>
          {[...Array(4)].map((_, ndx) => <div key={ndx} className="h-28 animate-pulse" style={{ background: "var(--card)" }} />)}
        </div>
        <div className="border border-border h-80 animate-pulse" style={{ background: "var(--card)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
        <div className="border border-border p-8 flex items-start gap-4" style={{ background: "var(--card)", borderLeft: "3px solid var(--chart-4)" }}>
          <AlertCircle size={22} className="mt-0.5 shrink-0" style={{ color: "var(--chart-4)" }} />
          <div>
            <p className="font-medium mb-1">Failed to load portfolio data</p>
            <button onClick={() => window.location.reload()} className="text-xs mt-1 px-3 py-1.5 border border-border hover:border-foreground transition-colors">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Portfolio Overview</h1>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Real-time insight into your asset portfolio value and health</p>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border mb-6" style={{ background: "var(--border)" }}>
        <StatCard label="Total Portfolio Value" value={formatUsd(portfolio?.total_portfolio_value ?? 0)} icon={TrendingUp}
          sub={<><TrendingDown size={12} style={{ color: "var(--chart-4)" }} /> <span style={{ color: "var(--chart-4)" }}>-{depPct}%</span> vs book</>} />
        <StatCard label="Total Devices" value={String(portfolio?.total_devices ?? 0)} icon={Package}
          sub={<>Across {Object.keys(portfolio?.by_type ?? {}).length} types</>} />
        <StatCard label="Avg Depreciation" value={`${depPct}%`} icon={TrendingDown}
          sub={parseFloat(depPct) < 30 ? "Within target" : "Above target"} subColor={parseFloat(depPct) < 30 ? "var(--grade-a)" : "var(--grade-b)"} />
        <StatCard label="Assets at Risk" value={String(portfolio?.assets_at_risk ?? 0)} icon={AlertCircle}
          sub={<><AlertCircle size={12} style={{ color: "var(--grade-b)" }} /> Needs attention</>} subColor="var(--grade-b)" />
      </div>

      {/* Value over time */}
      <div className="mb-6">
        <Panel title="Portfolio Value Over Time" subtitle="Market value vs book value (last 6 months)">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bookGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "monospace" }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11, fontFamily: "monospace" }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={AMPS_TOOLTIP_STYLE} formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="portfolio" stroke="#8B5CF6" strokeWidth={2} fill="url(#portfolioGradient)" name="Market Value" />
                <Area type="monotone" dataKey="book" stroke="#94A3B8" strokeWidth={2} fill="url(#bookGradient)" name="Book Value" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Fleet breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Panel title="Fleet by Asset Type">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeSlices} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {typeSlices.map((entry, index) => <Cell key={`type-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={AMPS_TOOLTIP_STYLE} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Fleet by Condition">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={conditionSlices} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {conditionSlices.map((entry, index) => <Cell key={`cond-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={AMPS_TOOLTIP_STYLE} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Top assets */}
      <div className="mb-6">
        <Panel title="Top Assets by Type" subtitle="Fleet composition by category"
          action={<Link to="/pre/amps/assets" className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-border hover:border-foreground transition-colors">View All <ArrowRight size={12} /></Link>}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Asset Type", "Devices", "Total Value"].map((h, i) => (
                  <th key={h} className={`py-2 text-[10px] tracking-wider uppercase font-normal ${i === 0 ? "text-left" : "text-right"}`} style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(portfolio?.by_type ?? {}).map(([type, data]) => (
                <tr key={type} className="border-b border-border last:border-0">
                  <td className="py-2.5 capitalize">{type}</td>
                  <td className="py-2.5 text-right" style={{ fontFamily: MONO }}>{data.count}</td>
                  <td className="py-2.5 text-right" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{formatUsd(data.value)}</td>
                </tr>
              ))}
              {Object.keys(portfolio?.by_type ?? {}).length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-sm" style={{ color: "var(--muted-foreground)" }}>No assets yet — connect your MDM or add assets manually</td></tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PORTFOLIO_QUICK_ACTIONS.map(({ to, icon: Icon, label, sub }) => (
          <Link key={to} to={to} className="border border-border p-5 flex flex-col gap-2 hover:border-[color:var(--amps-accent)] transition-colors group" style={{ background: "var(--card)" }}>
            <Icon size={18} style={{ color: AMPS_ACCENT }} />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
