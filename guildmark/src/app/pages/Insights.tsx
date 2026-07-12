/**
 * Market Insights page — public, no auth required (View).
 *
 * Visualises the research data underpinning the GuildMark marketplace
 * opportunity: the stockpile cost problem, seasonal purchasing rhythms,
 * and the SMB technology generation lag. Calculator state, the live decay
 * tick, and derived metrics live in useInsightsViewModel.
 *
 * Uses Recharts (already in package.json) so no additional dependencies
 * are needed.
 */
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Cite } from "../components/insights/Cite";
import { InsightCard } from "../components/insights/InsightCard";
import { MetricBox } from "../components/insights/MetricBox";
import { SectionLabel } from "../components/insights/SectionLabel";
import { SeasonalityTooltip } from "../components/insights/SeasonalityTooltip";
import { StatCard } from "../components/insights/StatCard";
import { TechLagTooltip } from "../components/insights/TechLagTooltip";
import {
  AVG_DEVICE_VALUE, CADENCE_MONTHS, DEMAND_STAT_CARDS, NAV_LINKS, SOURCES, TECH_LAG_DATA,
} from "../constants/insights.constants";
import { formatCurrency } from "../services/insights.service";
import { useInsightsViewModel } from "../viewmodels/useInsightsViewModel";

export function InsightPage({ inDrawer = false }: { inDrawer?: boolean }) {
  const { activeView, assetValue, barColor, metrics, seasonalityData, setActiveView, setAssetValue } = useInsightsViewModel();
  const { accumulated, carryingCost, costPerDay, costPerHour, estimatedDevices, idleDevices, lostValue, monthlyOffload } = metrics;

  return (
    <div className={`text-foreground ${inDrawer ? "" : "-mx-6 -my-6 min-h-screen"}`}>

      {/* ── Hero ── */}
      <header className="mx-auto px-6 py-8">
        {/* <p className="text-xs  uppercase tracking-widest text-muted-foreground mb-4">
                    Market Research · 2025–2026
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                    Capitalizing on the IT Hardware{" "}
                    <span className="text-muted-foreground">Lifecycle Gap</span>
                </h1>
                <p className="text-lg text-muted-foreground mx-auto leading-relaxed ">
                    The secondary B2B hardware market is driven by predictable refresh cycles,
                    unspent corporate budgets, and a real technology gap between large enterprises
                    and small businesses. Here is the data behind the GuildMarket opportunity.
                </p> */}
        <div className="flex justify-around gap-6 mt-10 text-md ">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-muted-foreground hover:text-muted-foreground px-20 py-5 hover:bg-primary/10 border-b-2 border-transparent hover:border-primary transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </header>

      {/* ── Section 1: Stockpile Cost ── */}
      <section id="stockpile" className="px-6 py-16 border-t border-border">
        <div className=" mx-auto">
          <SectionLabel>01 · The Cost of Inaction</SectionLabel>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Idle Hardware is a Liability, Not an Asset
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Every laptop, server, and workstation a company buys is on a clock. Finance
            depreciates it, IT refreshes it, and somewhere around year three to five the
            asset stops being an asset and starts being a liability sitting in a supply
            closet. Multiply that across every mid-market and enterprise IT fleet and you
            get a large, predictable, perpetually replenished pool of hardware that still
            has years of useful life left in it.

            That pool is the market GuildMark is built for. <br /><br />
            2 in 5 organizations spend over $100,000 a year just to store hardware they are
            not using.<Cite n={22} /> On top of that, carrying costs eat about 21% of the original
            purchase price every year.<Cite n={22} /> Move the slider to see what that looks like for any fleet size.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Idle Asset Cost Calculator
                </h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Estimates based on Blancco industry averages.<Cite n={22} />
                </p>
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    <label htmlFor="assetValue" className="text-sm text-foreground ">
                      Original Value of Idle Fleet
                    </label>
                    <span className="font-bold text-muted-foreground  text-lg">
                      {formatCurrency(assetValue)}
                    </span>
                  </div>
                  <input
                    id="assetValue"
                    type="range"
                    min={50_000}
                    max={2_000_000}
                    step={10_000}
                    value={assetValue}
                    onChange={(e) => setAssetValue(Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none bg-border accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground  mt-1">
                    <span>$50k</span><span>$2M</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MetricBox
                  label="Annual Carrying Cost"
                  value={formatCurrency(carryingCost)}
                  sub="21% for storage, insurance, opportunity"
                  valueClass="text-red-400"
                />
                <MetricBox
                  label="Lost Recoverable Value"
                  value={formatCurrency(lostValue)}
                  sub="~50% avg depreciation from delay"
                  valueClass="text-amber-400"
                />
              </div>
            </div>

            {/* Value decay clock */}
            <div className="bg-card border border-red-900/30 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs  uppercase tracking-widest text-red-400">
                    Value Decay, Live
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-6">
                  Cost accumulating since you opened this page
                </h3>
                <div className="text-center py-4">
                  <span className="text-5xl font-bold  text-red-400 tabular-nums">
                    {formatCurrency(accumulated)}
                  </span>
                  <p className="text-muted-foreground text-sm  mt-2">and counting</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                  <span className="block text-xs text-muted-foreground  mb-1">Per Hour</span>
                  <span className="text-lg font-bold  text-red-300">
                    {formatCurrency(costPerHour)}
                  </span>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                  <span className="block text-xs text-muted-foreground  mb-1">Per Day</span>
                  <span className="text-lg font-bold  text-red-300">
                    {formatCurrency(costPerDay)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet idle grid + supply cadence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

            {/* Fleet idle grid */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-foreground mb-1">Your Estimated Fleet</h3>
              <p className="text-sm text-muted-foreground mb-6 ">
                ~{estimatedDevices.toLocaleString()} devices at ${AVG_DEVICE_VALUE.toLocaleString()} avg ·{" "}
                <span className="text-amber-400">{idleDevices} idle</span> based on the 80% survey average<Cite n={22} />
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: Math.min(estimatedDevices, 120) }).map((_, ndx) => {
                  const idleThreshold = Math.round(Math.min(estimatedDevices, 120) * 0.25);
                  const isIdle = ndx < idleThreshold;
                  return (
                    <div
                      key={ndx}
                      title={isIdle ? "Idle, not deployed" : "Active"}
                      className={`w-4 h-4 rounded-sm transition-colors ${isIdle
                        ? "bg-amber-500/40 border border-amber-500/30"
                        : "bg-primary/30 border border-primary/20"
                        }`}
                    />
                  );
                })}
                {estimatedDevices > 120 && (
                  <span className="text-xs text-muted-foreground  self-end ml-1">
                    +{(estimatedDevices - 120).toLocaleString()} more
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6 mt-5 text-xs  text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-primary/30 border border-primary/20 inline-block" />
                  Active
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-500/40 border border-amber-500/30 inline-block" />
                  Idle / undeployed
                </span>
              </div>
            </div>

            {/* Supply cadence strip */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-foreground mb-1">Recurring Offload Supply</h3>
              <p className="text-sm text-muted-foreground mb-6 ">
                On a 4-year refresh cycle this fleet generates{" "}
                <span className="text-muted-foreground">{monthlyOffload} units per month</span> on a steady, predictable schedule
              </p>
              <div className="grid grid-cols-12 gap-1 items-end h-28">
                {Array.from({ length: CADENCE_MONTHS }).map((_, ndx) => {
                  const isQ4Adjacent = ndx === 0 || ndx === 11;
                  const height = isQ4Adjacent ? 100 : 55 + Math.round(Math.sin(ndx * 0.8) * 15);
                  const label = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][ndx];
                  return (
                    <div key={ndx} className="flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-muted-foreground text-xs  font-bold">
                        {Math.round(monthlyOffload * (isQ4Adjacent ? 1.4 : height / 80))}
                      </span>
                      <div
                        className="w-full rounded-t bg-primary/40 border-t border-primary/60 transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-muted-foreground text-muted-foreground ">{label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground  mt-4">
                Estimated units available for marketplace listing per month
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 2: Seasonality ── */}
      <section
        id="seasonality"
        className="px-6 py-16 border-t border-border bg-muted/30"
      >
        <div className="mx-auto">
          <SectionLabel>02 · Market Rhythms</SectionLabel>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Purchasing is Seasonal and tech supply lags around 3–4 Years
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Corporate hardware doesn't leave service at random. It leaves on a schedule;
            lease expirations, warranty windows, OS end-of-life, and standard three-to-five
            year refresh policies. Because those cycles are planned and budgeted, the supply
            of good, recent-generation used hardware is not a one-time windfall; it is a
            recurring, forecastable stream. A marketplace that can meet sellers at the
            moment of refresh captures inventory the seller was going to retire anyway.
            <br /><br />
            Most corporate budgets are use-it-or-lose-it, so IT teams bulk-purchase in Q4
            before funds expire.<Cite n={1} /> Hardware bought in Q4 then shows up on
            the secondary market 3 to 4 years later,<Cite n={11} /> which means GuildMarket can
            forecast seller supply waves using public PC shipment data.<Cite n={4} />
          </p>

          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h3 className="text-lg font-semibold text-foreground">
                Purchasing Volume vs. Future Supply Lag
              </h3>
              <div className="flex bg-muted rounded-lg p-1 border border-border  text-sm gap-1">
                {(["purchasing", "supply"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setActiveView(v)}
                    className={`px-4 py-2 rounded-md transition-all ${activeView === v
                      ? v === "purchasing"
                        ? "bg-primary/20 text-muted-foreground"
                        : "bg-amber-500/20 text-amber-400"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {v === "purchasing" ? "Primary Purchasing (Yr 0)" : "Secondary Supply (Yr 3–4)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={seasonalityData}
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fill: "currentColor", fontSize: 12, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "currentColor", fontSize: 12, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Relative Activity",
                      angle: -90,
                      position: "insideLeft",
                      fill: "currentColor",
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                  />
                  <Tooltip content={<SeasonalityTooltip view={activeView} />} cursor={{ fill: "rgba(100,116,139,0.08)" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {seasonalityData.map((entry) => (
                      <Cell key={entry.quarter} fill={barColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InsightCard accent="green" title="The Q4 Phenomenon">
                Q4 (Oct to Dec) is by far the busiest period. Unspent capital budgets
                do not roll over, so IT teams buy in bulk to use up their allocation
                before the year closes. It is the single biggest driver of hardware
                movement on the calendar.
              </InsightCard>
              <InsightCard accent="slate" title="The GuildMark Alignment">
                Seller volume on the marketplace lags Q4 purchases by 3 to 4 years.
                Buyer volume also peaks in Q4, because companies shop for discounted
                refurbished gear with whatever budget is left. Both sides of the
                marketplace are most active at the same time of year.
              </InsightCard>
            </div>
          </div>
          <p className="text-muted-foreground mt-10 leading-relaxed">Disposition is almost never the priority for an internal IT team. The result is
            predictable: equipment that could recover real value instead depreciates in
            storage, and the recovery window quietly closes as newer models arrive. Sellers
            aren't looking to run an auction — they want the fastest path to a fair price
            with the compliance paperwork handled. Speed and certainty, not squeezing the
            last dollar, are what move surplus hardware.
          </p>
        </div>
      </section>

      {/* ── Section 3: SMB Demand Gap ── */}
      <section id="demand" className="px-6 py-16 border-t border-border">
        <div className=" mx-auto">
          <SectionLabel>03 · SMB Demand Gap</SectionLabel>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            The Generational Technology Gap
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            The same device that a large enterprise considers obsolete is often a
            significant upgrade for a small business. Enterprises standardize on current
            hardware for support and security reasons; small businesses optimize for cost
            per capable machine. That mismatch is the engine of the secondary market: one
            side has capable hardware it no longer wants, the other side wants capable
            hardware it can afford. GuildMark sits in the middle, matching graded,
            data-sanitized supply to verified B2B demand.<br/><br />
            Refurbished hardware is already the mainstream choice. Over 54% of SMBs
            buy certified refurb.<Cite n={9} /> The opportunity is in connecting mid-market
            sellers retiring 2 to 3 year old hardware<Cite n={11} /> with SMB buyers running
            3 to 5 year old fleets on break-fix cycles.<Cite n={9} />
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {DEMAND_STAT_CARDS.map((card) => (
              <StatCard
                key={card.label}
                icon={card.icon}
                value={card.value}
                label={card.label}
                tag={card.tag}
                tagClass={card.tagClass}
                cite={card.cite}
              />
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Technology Generation Lag by Segment
            </h3>
            <p className="text-sm text-muted-foreground mb-8 ">
              Average active fleet age by company size.<Cite n={9} /><Cite n={11} /> The gap between
              mid-market and SMB fleets is where the marketplace transaction happens.
            </p>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={TECH_LAG_DATA}
                  margin={{ top: 4, right: 32, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 6]}
                    tick={{ fill: "currentColor", fontSize: 12, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Fleet Age (Years)",
                      position: "insideBottom",
                      offset: -2,
                      fill: "currentColor",
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="segment"
                    width={160}
                    tick={{ fill: "currentColor", fontSize: 12, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<TechLagTooltip />} cursor={{ fill: "rgba(100,116,139,0.08)" }} />
                  <Bar dataKey="min" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="variance" stackId="a" fill="#1D4ED8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-foreground flex items-start gap-3">
              <span className="text-xl">💡</span>
              <p>
                An SMB buying on GuildMarket gets devices that are 2 to 3 years old from
                a mid-market seller. The seller considers them end of life, but those
                same devices are{" "}
                <em className="text-muted-foreground">newer</em> than most of what the SMB
                is currently running. The seller recovers cash, the buyer gets better
                hardware for less than new. Both sides come out ahead.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-border bg-muted/30">
        <div className="mx-auto space-y-6">
          <SectionLabel>04 • Market Fit</SectionLabel>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Why a purpose-built marketplace wins
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Generic resale channels weren't designed for business hardware. They don't grade
            condition consistently, they don't certify data destruction, and they don't
            give a finance team the write-off documentation an audit requires. A B2B
            marketplace that treats those as first-class features: condition grading,
            NIST 800-88 data sanitization, escrow-secured payment, and audit-ready invoices, device comparison. We strive to remove the friction that keeps surplus hardware sitting in closets.
          </p>

          <ul className="list-disc pl-6 space-y-3 text-muted-foreground mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              The Opportunity
            </h2>
            <li className="mb-3">
              <strong>Recurring supply</strong> from planned refresh cycles rather than one-off sales.
            </li>
            <li>
              <strong>Motivated sellers</strong> who value speed, certainty, and compliance over top dollar.
            </li>
            <li>
              <strong>Structural demand</strong> from the enterprise-to-SMB capability gap.
            </li>
            <li>
              <strong>Defensible differentiation</strong> through grading, data destruction, and escrow.
            </li>
          </ul>
          <strong className="text-lg text-foreground justify-center flex">
            The hardware lifecycle gap isn't a temporary inefficiency — it's a permanent
            feature of how businesses buy and retire technology. GuildMark's opportunity is
            to make the transition from *liability in a closet* to *value on a balance
            sheet* fast, compliant, and repeatable.
          </strong>
        </div>
      </section>

      {/* ── Sources ── */}
      <footer id="sources" className="border-t border-border px-6 py-12">
        <div className="mx-auto">
          <p className="text-xs  uppercase tracking-widest text-muted-foreground mb-6">
            Sources
          </p>
          <ol className="space-y-3">
            {SOURCES.map(({ n, label, url }) => (
              <li key={n} className="flex items-start gap-3 text-sm ">
                <span className="text-muted-foreground shrink-0">[{n}]</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-muted-foreground leading-relaxed"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </footer>
    </div>
  );
}
