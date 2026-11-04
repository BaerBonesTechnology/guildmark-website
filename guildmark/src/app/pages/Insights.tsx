import { Link, useLocation } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useInsightsViewModel } from "../viewmodels/useInsightsViewModel";
import { formatCurrency } from "../services/insights.service";
import { TECH_LAG_DATA, SOURCES } from "../constants/insights.constants";
import { PulseDataTable } from "../components/insights/PulseDataTable";
import "../../styles/market-pulse.css";

export function InsightPage({ inDrawer = false }: { inDrawer?: boolean }) {
  const vm = useInsightsViewModel();
  const Heading = inDrawer ? "h2" : "h1";
  const base = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const series = vm.seasonalityData.map((p) => ({
    ...p,
    short: p.quarter.slice(0, 2),
  }));
  const ages = TECH_LAG_DATA.map((p) => ({ ...p, max: p.min + p.variance }));
  const tooltipStyle = {
    background: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: 0,
  };
  return (
    <div
      className={`gm-pulse ${inDrawer ? "gm-pulse-drawer" : "gm-container"}`}
    >
      <header className="gm-pulse-heading">
        <Heading className="gm-pulse-title">
          Market context.
          <br />
          Better fleet decisions.
        </Heading>
        <p>
          Explore the cost of holding equipment and the patterns behind refresh
          cycles.
        </p>
      </header>
      <aside className="gm-pulse-notice">
        <strong>Planning scenarios, not a live market feed.</strong>
        <p>
          Charts use illustrative assumptions. They do not represent GuildMark
          transactions, current demand, or a valuation of your equipment.
        </p>
      </aside>
      <nav className="gm-pulse-nav" aria-label="Market Pulse sections">
        <Link to="#stockpile" preventScrollReset>
          Holding costs
        </Link>
        <Link to="#seasonality" preventScrollReset>
          Seasonal patterns
        </Link>
        <Link to="#demand" preventScrollReset>
          Refresh cycles
        </Link>
        <Link to="#sources" preventScrollReset>
          Method & sources
        </Link>
      </nav>
      <section id="stockpile" className="gm-pulse-section">
        <header>
          <span className="gm-pulse-index">01 / Holding costs</span>
          <h2>What does waiting cost?</h2>
          <p>
            Use an example idle-fleet purchase value to explore a simple annual
            carrying-cost scenario.
          </p>
        </header>
        <div className="gm-pulse-calculator">
          <div className="gm-pulse-card">
            <h3>Idle-fleet scenario</h3>
            <label htmlFor="pulse-value">
              Original purchase value of idle equipment
            </label>
            <output htmlFor="pulse-value">
              {formatCurrency(vm.assetValue)}
            </output>
            <input
              id="pulse-value"
              type="range"
              min={50000}
              max={2000000}
              step={10000}
              value={vm.assetValue}
              aria-valuetext={formatCurrency(vm.assetValue)}
              onChange={(e) => vm.setAssetValue(Number(e.target.value))}
            />
            <div className="gm-pulse-range">
              <span>$50,000</span>
              <span>$2,000,000</span>
            </div>
            <button
              className="gm-pulse-reset"
              onClick={() => vm.setAssetValue(500000)}
            >
              Reset to $500,000
            </button>
            <p>
              The input represents equipment already idle. It does not estimate
              how much of your fleet is unused.
            </p>
          </div>
          <div className="gm-pulse-card gm-pulse-cost">
            <span className="gm-pulse-index">
              Illustrative annual carrying cost
            </span>
            <strong>{formatCurrency(vm.metrics.carryingCost)}</strong>
            <p>At a fixed 21% annual cost assumption.</p>
            <dl>
              <div>
                <dt>Per month</dt>
                <dd>{formatCurrency(vm.metrics.carryingCost / 12)}</dd>
              </div>
              <div>
                <dt>Per day</dt>
                <dd>{formatCurrency(vm.metrics.costPerDay)}</dd>
              </div>
            </dl>
            <p>
              21% is a scenario input, not a verified industry average. Excludes
              depreciation, resale proceeds, fees, and tax effects.
            </p>
          </div>
        </div>
      </section>
      <section id="seasonality" className="gm-pulse-section">
        <header>
          <span className="gm-pulse-index">02 / Seasonal patterns</span>
          <h2>A calendar for planning.</h2>
          <p>
            Compare two illustrative quarterly profiles. Activity is an
            arbitrary index, not a percentage, market share, or observed sales
            volume.
          </p>
        </header>
        <div className="gm-pulse-card">
          <div className="gm-pulse-chart-heading">
            <div>
              <h3>Quarterly activity scenario</h3>
              <p id="pulse-season-note">
                {vm.activeView === "purchasing"
                  ? "Purchasing"
                  : "Resale supply"}{" "}
                · illustrative index points
              </p>
            </div>
            <div
              className="gm-pulse-switch"
              role="group"
              aria-label="Activity scenario"
            >
              {(["purchasing", "supply"] as const).map((v) => (
                <button
                  key={v}
                  aria-pressed={vm.activeView === v}
                  onClick={() => vm.setActiveView(v)}
                >
                  {v === "purchasing" ? "Purchasing" : "Resale supply"}
                </button>
              ))}
            </div>
          </div>
          <div
            className="gm-pulse-chart"
            role="img"
            aria-label={`${vm.activeView === "purchasing" ? "Purchasing" : "Resale supply"} activity scenario. Highest in Q4. Exact values are available in the chart data disclosure.`}
            aria-describedby="pulse-season-note"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series}
                margin={{ top: 16, right: 8, bottom: 8, left: -12 }}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="short"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.quarter || "Quarter"
                  }
                  formatter={(v: number) => [
                    `${v} index points`,
                    vm.activeView === "purchasing"
                      ? "Purchasing"
                      : "Resale supply",
                  ]}
                  cursor={{ fill: "var(--muted)" }}
                />
                <Bar
                  dataKey="value"
                  fill={
                    vm.activeView === "purchasing"
                      ? "var(--primary)"
                      : "var(--foreground)"
                  }
                  maxBarSize={80}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <PulseDataTable
            caption={`${vm.activeView === "purchasing" ? "Purchasing" : "Resale supply"} scenario — illustrative index points`}
            headers={["Quarter", "Activity index"]}
            rows={vm.seasonalityData.map((p) => [p.quarter, p.value])}
          />
          <p className="gm-pulse-footnote">
            These fixed profiles illustrate a possible year-end concentration.
            No quarter guarantees stronger prices or faster sales.
          </p>
        </div>
      </section>
      <section id="demand" className="gm-pulse-section">
        <header>
          <span className="gm-pulse-index">03 / Refresh cycles</span>
          <h2>Different fleets. Different timelines.</h2>
          <p>
            Example fleet-age ranges show how a device retired by one
            organization might still suit another. These are planning
            assumptions, not measured segment averages.
          </p>
        </header>
        <div className="gm-pulse-card">
          <h3>Illustrative fleet-age ranges</h3>
          <p>Years in service · shaded bars show the assumed range.</p>
          <div
            className="gm-pulse-chart gm-pulse-age"
            role="img"
            aria-label="Illustrative fleet ages: SMBs 3.5 to 5 years, mid-market 2.5 to 3 years, large enterprise 1.5 to 2 years. Exact values below."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ages}
                layout="vertical"
                margin={{ top: 16, right: 12, bottom: 8, left: 0 }}
                accessibilityLayer
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis
                  type="number"
                  domain={[0, 6]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="segment"
                  width={100}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(_, __, item) => [
                    `${item.payload.min}–${item.payload.max} years`,
                    "Assumed range",
                  ]}
                  cursor={{ fill: "var(--muted)" }}
                />
                <Bar
                  dataKey="min"
                  stackId="age"
                  fill="transparent"
                  tooltipType="none"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="variance"
                  stackId="age"
                  fill="var(--primary)"
                  maxBarSize={30}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <PulseDataTable
            caption="Example fleet-age ranges in years"
            headers={["Segment", "From", "To"]}
            rows={ages.map((p) => [p.segment, p.min, p.max])}
          />
          <p className="gm-pulse-footnote">
            Age alone does not determine value or suitability. Review
            specifications, condition, functional status, and data-wipe
            disclosures.
          </p>
        </div>
      </section>
      <section id="sources" className="gm-pulse-section gm-pulse-method">
        <span className="gm-pulse-index">04 / Method & sources</span>
        <h2>Know what’s behind the numbers.</h2>
        <div className="gm-pulse-method-grid">
          <div>
            <h3>Scenario methodology</h3>
            <ul>
              <li>Annual holding cost = selected idle purchase value × 21%.</li>
              <li>
                Monthly and daily costs divide the annual estimate by 12 and
                365.
              </li>
              <li>
                Quarterly profiles and fleet-age ranges are fixed illustrative
                values from this page’s model.
              </li>
              <li>
                No live market, inventory, transaction, or valuation data is
                used.
              </li>
            </ul>
          </div>
          <div>
            <h3>Historical research context</h3>
            <p>
              A Blancco study published in January 2019 surveyed 600 data-center
              experts. Its findings describe that sample, not today’s market or
              your fleet.
            </p>
            <a
              href={SOURCES.find((s) => s.n === 22)?.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the Blancco research{" "}
              <span className="gm-pulse-sr">(opens in a new tab)</span>↗
            </a>
            <p>
              This source does not establish the 21% assumption or validate the
              chart scenarios above.
            </p>
          </div>
        </div>
      </section>
      <aside className="gm-pulse-next">
        <div>
          <h2>Ready to review your equipment?</h2>
          <p>Start with actual condition, specifications, and asking prices.</p>
        </div>
        <Link
          className="gm-button gm-button-primary"
          to={`${base}/my-listings`}
        >
          Review My Listings ↗
        </Link>
      </aside>
    </div>
  );
}
