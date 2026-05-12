import { TrendingUp, TrendingDown, Package, AlertCircle, FileText, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { usePortfolioSummary } from "../../lib/apiHooks";
import { grades, chartColors } from "../../lib/tokens";

export function PortfolioOverview() {
  const { data: portfolio, isLoading, error } = usePortfolioSummary();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <p className="font-mono text-muted-foreground">Failed to load portfolio data</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="font-mono">Retry</Button>
        </div>
      </div>
    );
  }

  // Shape API data for charts
  const fleetByType = Object.entries(portfolio?.by_type ?? {}).map(([name, d], i) => ({
    name, value: d.count,
    color: ["#8B5CF6","#A78BFA","#C4B5FD","#DDD6FE"][i % 4],
  }));

  const fleetByCondition = Object.entries(portfolio?.by_condition ?? {}).map(([name, d]) => ({
    name: name === "A" ? "Excellent (A)" : name === "B" ? "Good (B)" : "Fair (C)",
    value: d.count,
    color: name === "A" ? grades.A.bg : name === "B" ? grades.B.bg : grades.C.bg,
  }));

  const portfolioData = (portfolio?.trend ?? []).map(t => ({
    month:     new Date(t.snapshot_date).toLocaleDateString("en-US", { month: "short" }),
    portfolio: t.total_portfolio_value,
    book:      t.total_book_value,
  }));

  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const depPct = portfolio ? (portfolio.depreciation_pct * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-semibold mb-2">Portfolio Overview</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Real-time insights into your asset portfolio value and health
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground mb-1">Total Portfolio Value</p>
                <p className="text-3xl font-mono font-semibold">{fmt(portfolio?.total_portfolio_value ?? 0)}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-danger" />
                  <span className="text-danger font-mono">-{depPct}%</span>
                  <span className="text-muted-foreground font-mono text-xs">vs book value</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amps-accent to-amps-highlight flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground mb-1">Total Devices</p>
                <p className="text-3xl font-mono font-semibold">{portfolio?.total_devices ?? 0}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <span className="text-muted-foreground font-mono text-xs">Across {Object.keys(portfolio?.by_type ?? {}).length} types</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amps-accent/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-amps-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground mb-1">Avg Depreciation</p>
                <p className="text-3xl font-mono font-semibold">{depPct}%</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <span className="text-success font-mono">
                    {parseFloat(depPct) < 30 ? "Within target" : "Above target"}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground mb-1">Assets at Risk</p>
                <p className="text-3xl font-mono font-semibold">{portfolio?.assets_at_risk ?? 0}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-warning font-mono">Needs attention</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Portfolio Value Over Time</CardTitle>
          <p className="text-sm text-muted-foreground font-mono">
            Market value vs book value (last 6 months)
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData} key="portfolio-area-chart">
                <defs key="defs-portfolio">
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1" key="gradient-portfolio">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} key="portfolio-stop-1" />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} key="portfolio-stop-2" />
                  </linearGradient>
                  <linearGradient id="bookGradient" x1="0" y1="0" x2="0" y2="1" key="gradient-book">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3} key="book-stop-1" />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} key="book-stop-2" />
                  </linearGradient>
                </defs>
                <CartesianGrid key="grid-portfolio" strokeDasharray="3 3" className="stroke-muted" />
                <XAxis key="xaxis-portfolio" dataKey="month" className="text-xs font-mono" />
                <YAxis key="yaxis-portfolio" className="text-xs font-mono" />
                <Tooltip
                  key="tooltip-portfolio"
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  labelClassName="font-mono"
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend key="legend-portfolio" />
                <Area
                  key="area-portfolio"
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                  name="Market Value"
                />
                <Area
                  key="area-book"
                  type="monotone"
                  dataKey="book"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  fill="url(#bookGradient)"
                  name="Book Value"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Fleet by Asset Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key="pie-chart-type">
                  <Pie
                    key="pie-type"
                    data={fleetByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {fleetByType.map((entry, index) => (
                      <Cell key={`fleet-type-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    key="tooltip-type"
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend key="legend-type" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Fleet by Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key="pie-chart-condition">
                  <Pie
                    key="pie-condition"
                    data={fleetByCondition}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {fleetByCondition.map((entry, index) => (
                      <Cell key={`fleet-condition-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    key="tooltip-condition"
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend key="legend-condition" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Assets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono">Top Assets by Type</CardTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                Fleet composition by asset category
              </p>
            </div>
            <Button asChild variant="outline" className="font-mono">
              <Link to="/amps/assets">View All Assets</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">Asset Type</TableHead>
                <TableHead className="font-mono text-right">Devices</TableHead>
                <TableHead className="font-mono text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(portfolio?.by_type ?? {}).map(([type, data]) => (
                <TableRow key={type}>
                  <TableCell className="font-mono capitalize">{type}</TableCell>
                  <TableCell className="font-mono text-right">{data.count}</TableCell>
                  <TableCell className="font-mono text-right font-semibold">
                    {fmt(data.value)}
                  </TableCell>
                </TableRow>
              ))}
              {Object.keys(portfolio?.by_type ?? {}).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center font-mono text-muted-foreground py-8">
                    No assets yet — connect your MDM or add assets manually
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-amps-accent/30 bg-gradient-to-br from-amps-accent/5 to-transparent">
        <CardHeader>
          <CardTitle className="font-mono">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 font-mono">
              <Link to="/amps/assets?filter=aging">
                <AlertCircle className="h-5 w-5" />
                <span>List Aging Assets</span>
                <span className="text-xs text-muted-foreground">Assets &gt; 36 months</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 font-mono">
              <Link to="/amps/invoices?action=generate">
                <FileText className="h-5 w-5" />
                <span>Generate Report</span>
                <span className="text-xs text-muted-foreground">Portfolio PDF</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 font-mono">
              <Link to="/amps/mdm">
                <Cloud className="h-5 w-5" />
                <span>Connect MDM</span>
                <span className="text-xs text-muted-foreground">Sync devices</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
