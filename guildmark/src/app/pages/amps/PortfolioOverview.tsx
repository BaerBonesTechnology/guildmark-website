import { TrendingUp, TrendingDown, Package, AlertCircle, FileText, Cloud, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { usePortfolioSummary } from "../../lib/apiHooks";
import { grades } from "../../lib/tokens";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const ACCENT = "var(--amps-accent)";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
};

function StatCard({ label, value, icon: Icon, sub, subColor }: {
  label: string; value: string; icon: React.ElementType; sub?: React.ReactNode; subColor?: string;
}) {
  return (
    <div className="p-5" style={{ background: "var(--card)" }}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
          <p className="text-3xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{value}</p>
          {sub && <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: subColor ?? "var(--muted-foreground)", fontFamily: MONO }}>{sub}</div>}
        </div>
        <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
          <Icon size={16} style={{ color: ACCENT }} />
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] tracking-widest uppercase block" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{title}</span>
          {subtitle && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</span>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function PortfolioOverview() {
  const { data: portfolio, isLoading, error } = usePortfolioSummary();

  if (isLoading) {
    return (
      <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
        <div className="h-9 w-64 mb-6 animate-pulse" style={{ background: "var(--secondary)" }} />
        <div className="grid grid-cols-4 gap-px border border-border mb-6" style={{ background: "var(--border)" }}>
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse" style={{ background: "var(--card)" }} />)}
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

  const fleetByType = Object.entries(portfolio?.by_type ?? {}).map(([name, d], i) => ({
    name, value: d.count, color: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"][i % 4],
  }));
  const fleetByCondition = Object.entries(portfolio?.by_condition ?? {}).map(([name, d]) => ({
    name: name === "A" ? "Excellent (A)" : name === "B" ? "Good (B)" : "Fair (C)",
    value: d.count,
    color: name === "A" ? grades.A.bg : name === "B" ? grades.B.bg : grades.C.bg,
  }));
  const portfolioData = (portfolio?.trend ?? []).map((t) => ({
    month: new Date(t.snapshot_date).toLocaleDateString("en-US", { month: "short" }),
    portfolio: t.total_portfolio_value,
    book: t.total_book_value,
  }));

  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const depPct = portfolio ? (portfolio.depreciation_pct * 100).toFixed(1) : "0";

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.3rem)", lineHeight: 1 }}>Portfolio Overview</h1>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Real-time insight into your asset portfolio value and health</p>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border mb-6" style={{ background: "var(--border)" }}>
        <StatCard label="Total Portfolio Value" value={fmt(portfolio?.total_portfolio_value ?? 0)} icon={TrendingUp}
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
              <AreaChart data={portfolioData}>
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
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `$${value.toLocaleString()}`} />
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
                <Pie data={fleetByType} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {fleetByType.map((entry, index) => <Cell key={`type-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Fleet by Condition">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fleetByCondition} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {fleetByCondition.map((entry, index) => <Cell key={`cond-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
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
                  <td className="py-2.5 text-right" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{fmt(data.value)}</td>
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
        {[
          { to: "/pre/amps/assets?filter=aging", icon: AlertCircle, label: "List Aging Assets", sub: "Assets > 36 months" },
          { to: "/pre/amps/invoices?action=generate", icon: FileText, label: "Generate Report", sub: "Portfolio PDF" },
          { to: "/pre/amps/mdm", icon: Cloud, label: "Connect MDM", sub: "Sync devices" },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link key={to} to={to} className="border border-border p-5 flex flex-col gap-2 hover:border-[color:var(--amps-accent)] transition-colors group" style={{ background: "var(--card)" }}>
            <Icon size={18} style={{ color: ACCENT }} />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
