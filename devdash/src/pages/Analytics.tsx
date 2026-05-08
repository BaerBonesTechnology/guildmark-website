import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart2, RefreshCw, Users, Mail,
  ShoppingCart, TrendingUp, Package,
} from "lucide-react";
import { useApi } from "../hooks/useAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Summary {
  total_users: number;
  new_users: number;
  total_subscribers: number;
  new_subscribers: number;
  total_listings: number;
  active_listings: number;
  total_orders: number;
  completed_orders: number;
  gmv: number;
}

interface PlanCount   { plan: string; count: number }
interface DayCount    { date: string; count: number }
interface OrderDay    { date: string; count: number; amount: number }

interface AnalyticsData {
  period: { days: number; all_time: boolean; from: string | null };
  summary: Summary;
  subscription_breakdown: PlanCount[];
  user_growth: DayCount[];
  mailing_list_growth: DayCount[];
  order_activity: OrderDay[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PERIODS = [
  { label: "7d",  days: 7  },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 0  },
];

const PLAN_COLORS: Record<string, string> = {
  free:    "#64748b",
  starter: "#3b82f6",
  growth:  "#8b5cf6",
  pro:     "#f59e0b",
};

const MAX_RETRIES = 3;

// ── Helper components ─────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color = "text-blue-400",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-mono text-white">{value}</p>
      {sub && <p className="text-xs font-mono text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

const chartTheme = {
  grid:    "#1e293b",
  axis:    "#475569",
  tooltip: { bg: "#0f172a", border: "#334155", text: "#f1f5f9" },
};

function CustomTooltip({ active, payload, label, prefix = "", suffix = "" }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono shadow-lg">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white">
          {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtMoney(n: number) {
  return n >= 1000
    ? `$${(n / 1000).toFixed(1)}k`
    : `$${n.toLocaleString()}`;
}

// ── Main component ────────────────────────────────────────────────────────────

export function Analytics() {
  const apiFetch = useApi();
  const apiFetchRef = useRef(apiFetch);
  apiFetchRef.current = apiFetch;

  const [days, setDays]       = useState(30);
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await apiFetchRef.current<AnalyticsData>(
          `/admin/analytics?days=${days}`
        );
        setData(result);
        setLoading(false);
        return;
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setLoading(false);
          return;
        }
        await new Promise(r => setTimeout(r, attempt * 600));
      }
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const s = data?.summary;
  const periodLabel = days === 0 ? "all time" : `last ${days}d`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            Analytics
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">
            {days === 0 ? "All time" : `Last ${days} days`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            {PERIODS.map(p => (
              <button
                key={p.days}
                onClick={() => setDays(p.days)}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  days === p.days
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="ml-4 text-xs underline underline-offset-2 shrink-0">
            Try again
          </button>
        </div>
      )}

      {loading && !data ? (
        <div className="text-center text-slate-600 font-mono py-20">Loading…</div>
      ) : data ? (
        <>
          {/* ── Stat cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={Users}
              label="Total users"
              value={s!.total_users.toLocaleString()}
              sub={`+${s!.new_users} ${periodLabel}`}
              color="text-blue-400"
            />
            <StatCard
              icon={Mail}
              label="Subscribers"
              value={s!.total_subscribers.toLocaleString()}
              sub={`+${s!.new_subscribers} ${periodLabel}`}
              color="text-violet-400"
            />
            <StatCard
              icon={Package}
              label="Listings"
              value={s!.total_listings.toLocaleString()}
              sub={`${s!.active_listings} active`}
              color="text-amber-400"
            />
            <StatCard
              icon={ShoppingCart}
              label="Orders"
              value={s!.total_orders.toLocaleString()}
              sub={`${s!.completed_orders} completed`}
              color="text-green-400"
            />
            <StatCard
              icon={TrendingUp}
              label="GMV"
              value={fmtMoney(s!.gmv)}
              sub={periodLabel}
              color="text-emerald-400"
            />
          </div>

          {/* ── Line charts row ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="User signups">
              {data.user_growth.length === 0 ? (
                <p className="text-slate-600 font-mono text-sm py-8 text-center">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.user_growth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={fmtDate}
                      tick={{ fill: chartTheme.axis, fontSize: 10, fontFamily: "monospace" }}
                      axisLine={false} tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: chartTheme.axis, fontSize: 10, fontFamily: "monospace" }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone" dataKey="count"
                      stroke="#3b82f6" strokeWidth={2}
                      dot={false} activeDot={{ r: 4, fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Mailing list signups">
              {data.mailing_list_growth.length === 0 ? (
                <p className="text-slate-600 font-mono text-sm py-8 text-center">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.mailing_list_growth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={fmtDate}
                      tick={{ fill: chartTheme.axis, fontSize: 10, fontFamily: "monospace" }}
                      axisLine={false} tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: chartTheme.axis, fontSize: 10, fontFamily: "monospace" }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone" dataKey="count"
                      stroke="#8b5cf6" strokeWidth={2}
                      dot={false} activeDot={{ r: 4, fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ── Bottom row: order activity + subscription breakdown ────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Order activity takes 2/3 */}
            <div className="lg:col-span-2">
              <ChartCard title="Order activity">
                {data.order_activity.length === 0 ? (
                  <p className="text-slate-600 font-mono text-sm py-8 text-center">No orders yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.order_activity} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={fmtDate}
                        tick={{ fill: chartTheme.axis, fontSize: 10, fontFamily: "monospace" }}
                        axisLine={false} tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: chartTheme.axis, fontSize: 10, fontFamily: "monospace" }}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Subscription breakdown takes 1/3 */}
            <ChartCard title="Plan breakdown">
              {data.subscription_breakdown.length === 0 ? (
                <p className="text-slate-600 font-mono text-sm py-8 text-center">No data</p>
              ) : (
                <div className="space-y-3 pt-1">
                  {(["free", "starter", "growth", "pro"] as const).map(plan => {
                    const entry = data.subscription_breakdown.find(b => b.plan === plan);
                    const count = entry?.count ?? 0;
                    const total = data.subscription_breakdown.reduce((a, b) => a + b.count, 0);
                    const pct   = total > 0 ? (count / total) * 100 : 0;
                    const color = PLAN_COLORS[plan];
                    return (
                      <div key={plan}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-slate-400 capitalize">{plan}</span>
                          <span className="text-xs font-mono text-slate-500">{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs font-mono text-slate-600 pt-2">
                    {data.subscription_breakdown.reduce((a, b) => a + b.count, 0)} companies total
                  </p>
                </div>
              )}
            </ChartCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
