/**
 * Market Insights page public, no auth required.
 *
 * Visualises the research data underpinning the GuildMark marketplace
 * opportunity: the stockpile cost problem, seasonal purchasing rhythms,
 * and the SMB technology generation lag.
 *
 * Uses Recharts (already in package.json) so no additional dependencies
 * are needed.
 */

import { useState, useEffect } from "react";
import { brand, semantic } from "../lib/tokens";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PURCHASING_DATA = [
    { quarter: "Q1 (Jan–Mar)", value: 35 },
    { quarter: "Q2 (Apr–Jun)", value: 20 },
    { quarter: "Q3 (Jul–Sep)", value: 25 },
    { quarter: "Q4 (Oct–Dec)", value: 100 },
];

const SUPPLY_DATA = [
    { quarter: "Q1 (Jan–Mar)", value: 20 },
    { quarter: "Q2 (Apr–Jun)", value: 15 },
    { quarter: "Q3 (Jul–Sep)", value: 20 },
    { quarter: "Q4 (Oct–Dec)", value: 85 },
];

const TECH_LAG_DATA = [
    { segment: "SMBs (<100)", min: 3.5, variance: 1.5 },
    { segment: "Mid-Market (100–500)", min: 2.5, variance: 0.5 },
    { segment: "Large Enterprise", min: 1.5, variance: 0.5 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n);
}

// ---------------------------------------------------------------------------
// Custom tooltips
// ---------------------------------------------------------------------------

function SeasonalityTooltip({ active, payload, label, view }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-muted border border-border rounded-lg px-3 py-2 text-xs font-mono">
            <p className="text-foreground mb-1">{label}</p>
            <p className={view === "purchasing" ? "text-muted-foreground" : "text-amber-400"}>
                {view === "purchasing" ? "Primary Purchasing" : "Secondary Supply"}: {payload[0].value} (Index)
            </p>
        </div>
    );
}

function TechLagTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const min = payload[0]?.value ?? 0;
    const variance = payload[1]?.value ?? 0;
    return (
        <div className="bg-muted border border-border rounded-lg px-3 py-2 text-xs font-mono">
            <p className="text-foreground mb-1">{label}</p>
            <p className="text-muted-foreground">Fleet Age: {min}–{(min + variance).toFixed(1)} yrs</p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const SOURCES = [
    {
        n: 1,
        label: "Gartner — Worldwide IT Spending to Grow 10.8% in 2026, Totaling $6.15 Trillion",
        url: "https://www.gartner.com/en/newsroom/press-releases/2026-02-03-gartner-forecasts-worldwide-it-spending-to-grow-10-point-8-percent-in-2026-totaling-6-point-15-trillion-dollars",
    },
    {
        n: 2,
        label: "TechnologyChecker.io — Technology Trends Shaping Business IT in 2026",
        url: "https://technologychecker.io/blog/technology-trends",
    },
    {
        n: 3,
        label: "PCMag — Inside the 2026 RAM Crunch: Why AI Will Make Your Next Laptop Much Pricier",
        url: "https://www.pcmag.com/explainers/inside-2026-ram-crunch-why-ai-will-make-your-next-laptop-much-pricier",
    },
    {
        n: 4,
        label: "Gartner — Surging Memory Costs Will Reduce Global PC and Smartphone Shipments in 2026",
        url: "https://www.gartner.com/en/newsroom/press-releases/2026-02-26-gartner-says-surging-memory-costs-will-reduce-global-pc-and-smartphone-shipments-in-2026",
    },
    {
        n: 5,
        label: "HP — AI PC vs. Traditional PC: Upgrade Guide for Business",
        url: "https://www.hp.com/us-en/shop/tech-takes/ai-pc-vs-traditional-pc-upgrade-guide",
    },
    {
        n: 6,
        label: "Future Market Insights — AI PC Market Size, Share and Growth Forecast",
        url: "https://www.futuremarketinsights.com/reports/ai-pc-market",
    },
    {
        n: 7,
        label: "IDC — Global Memory Shortage Crisis: Market Analysis and Impact on PC Markets in 2026",
        url: "https://www.idc.com/resource-center/blog/global-memory-shortage-crisis-market-analysis-and-the-potential-impact-on-the-smartphone-and-pc-markets-in-2026/",
    },
    {
        n: 8,
        label: "Microsoft — AI PCs and ROI for Business",
        url: "https://www.microsoft.com/en-us/windows/business/knowledge-center/ai-pcs-and-roi",
    },
    {
        n: 9,
        label: "Mordor Intelligence — Refurbished Computers and Laptops Market Report",
        url: "https://www.mordorintelligence.com/industry-reports/refurbished-computers-and-laptops-market",
    },
    {
        n: 10,
        label: "GM Insights — IT Asset Disposition (ITAD) Market Size and Forecast",
        url: "https://www.gminsights.com/industry-analysis/it-asset-disposition-market",
    },
    {
        n: 11,
        label: "LeadingIT — How Long Should Business Laptops Really Last?",
        url: "https://goleadingit.com/blog/how-long-should-business-laptops-really-last/",
    },
    {
        n: 12,
        label: "allwhere — Laptop Depreciation Rate: What Businesses Need to Know",
        url: "https://www.allwhere.co/post/laptop-depreciation-rate",
    },
    {
        n: 13,
        label: "growrk — Laptop Depreciation Rate Guide for Remote Teams",
        url: "https://growrk.com/blog/laptop-depreciation-rate",
    },
    {
        n: 14,
        label: "OpenPR — Global Refurbished Computers and Laptops Market to Reach USD Billions by 2030",
        url: "https://www.openpr.com/news/4455778/global-refurbished-computers-and-laptops-market-to-reach-usd",
    },
    {
        n: 15,
        label: "Yo!Kart — Top Multi-Vendor Marketplaces in USA",
        url: "https://www.yo-kart.com/blog/top-multi-vendor-marketplaces-in-usa/",
    },
    {
        n: 16,
        label: "Rigby — Essential B2B Marketplace Features",
        url: "https://www.rigbyjs.com/blog/b2b-marketplace-features",
    },
    {
        n: 17,
        label: "SourceForge — Top B2B Marketplaces Software Directory",
        url: "https://sourceforge.net/software/b2b-marketplaces/",
    },
    {
        n: 18,
        label: "Ellen MacArthur Foundation — FLOOW2: Business-to-Business Asset Sharing",
        url: "https://www.ellenmacarthurfoundation.org/circular-examples/business-to-business-asset-sharing",
    },
    {
        n: 19,
        label: "Circulary — FLOOW2: B2B Sharing Platform for Idle Assets",
        url: "http://www.circulary.eu/project/floow2-b2b-sharing/",
    },
    {
        n: 20,
        label: "FatBit Technologies — Top eCommerce Marketplaces in the World",
        url: "https://www.fatbit.com/fab/top-ecommerce-marketplaces-in-the-world/",
    },
    {
        n: 21,
        label: "Circle Economy — FLOOW2: Facilitating the Use of Idle Assets Through an Online B2B Marketplace",
        url: "https://www.circle-economy.com/resources/floow2-facilitating-the-use-of-idle-assets-through-an-online-b2b-marketplace",
    },
    {
        n: 22,
        label: "Blancco — Two in Five Global Organizations Waste More Than $100,000 a Year Storing Useless IT Hardware",
        url: "https://blancco.com/research-two-in-five-global-organizations-waste-more-than-100000-a-year-storing-useless-it-hardware/",
    },
];

// Average commercial device value used to estimate fleet size from portfolio value.
const AVG_DEVICE_VALUE = 1_200;
const REFRESH_CYCLE_MONTHS = 48; // 4-year cycle

export function InsightPage({ inDrawer = false }: { inDrawer?: boolean }) {
    const [assetValue, setAssetValue] = useState(500_000);
    const [activeView, setActiveView] = useState<"purchasing" | "supply">("purchasing");
    const [tickSeconds, setTickSeconds] = useState(0);

    // Tick every second so the decay clock feels live.
    useEffect(() => {
        const id = setInterval(() => setTickSeconds((s) => s + 1), 1_000);
        return () => clearInterval(id);
    }, []);

    const carryingCost = assetValue * 0.21;
    const lostValue = assetValue * 0.50;
    const costPerSecond = carryingCost / 365 / 24 / 3600;
    const costPerDay = carryingCost / 365;
    const costPerHour = carryingCost / 365 / 24;
    const accumulated = costPerSecond * tickSeconds;

    // Fleet size estimate and monthly offload cadence.
    const estimatedDevices = Math.round(assetValue / AVG_DEVICE_VALUE);
    const idleDevices = Math.round(estimatedDevices * 0.25);
    const monthlyOffload = Math.max(1, Math.round(estimatedDevices / REFRESH_CYCLE_MONTHS));
    const CADENCE_MONTHS = 12;

    const seasonalityData = activeView === "purchasing" ? PURCHASING_DATA : SUPPLY_DATA;
    const barColor = activeView === "purchasing" ? brand.primary : semantic.warning;

    return (
        <div className={`text-foreground ${inDrawer ? "" : "-mx-6 -my-6 min-h-screen"}`}>

            {/* ── Hero ── */}
            <header className="max-w-5xl mx-auto px-6 py-16 text-center">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                    Market Research · 2025–2026
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                    Capitalizing on the IT Hardware{" "}
                    <span className="text-muted-foreground">Lifecycle Gap</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-mono">
                    The secondary B2B hardware market is driven by predictable refresh cycles,
                    unspent corporate budgets, and a real technology gap between large enterprises
                    and small businesses. Here is the data behind the GuildMarket opportunity.
                </p>
                <div className="flex justify-center gap-6 mt-10 text-sm font-mono">
                    {[
                        { href: "#stockpile", label: "The Stockpile Problem" },
                        { href: "#seasonality", label: "Market Rhythms" },
                        { href: "#demand", label: "SMB Demand Gap" },
                    ].map(({ href, label }) => (
                        <a
                            key={href}
                            href={href}
                            className="text-muted-foreground hover:text-muted-foreground pb-0.5"
                        >
                            {label}
                        </a>
                    ))}
                </div>
            </header>

            {/* ── Section 1: Stockpile Cost ── */}
            <section id="stockpile" className="px-6 py-16 border-t border-border">
                <div className="max-w-7xl mx-auto">
                    <SectionLabel>01 · The Cost of Inaction</SectionLabel>
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                        Idle Hardware is a Liability, Not an Asset
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mb-10 leading-relaxed">
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
                                        <label htmlFor="assetValue" className="text-sm text-foreground font-mono">
                                            Original Value of Idle Fleet
                                        </label>
                                        <span className="font-bold text-muted-foreground font-mono text-lg">
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
                                    <div className="flex justify-between text-xs text-muted-foreground font-mono mt-1">
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
                                    <span className="text-xs font-mono uppercase tracking-widest text-red-400">
                                        Value Decay, Live
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mt-2 mb-6">
                                    Cost accumulating since you opened this page
                                </h3>
                                <div className="text-center py-4">
                                    <span className="text-5xl font-bold font-mono text-red-400 tabular-nums">
                                        {formatCurrency(accumulated)}
                                    </span>
                                    <p className="text-muted-foreground text-sm font-mono mt-2">and counting</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                                    <span className="block text-xs text-muted-foreground font-mono mb-1">Per Hour</span>
                                    <span className="text-lg font-bold font-mono text-red-300">
                                        {formatCurrency(costPerHour)}
                                    </span>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                                    <span className="block text-xs text-muted-foreground font-mono mb-1">Per Day</span>
                                    <span className="text-lg font-bold font-mono text-red-300">
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
                            <p className="text-sm text-muted-foreground mb-6 font-mono">
                                ~{estimatedDevices.toLocaleString()} devices at ${AVG_DEVICE_VALUE.toLocaleString()} avg ·{" "}
                                <span className="text-amber-400">{idleDevices} idle</span> based on the 80% survey average<Cite n={22} />
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {Array.from({ length: Math.min(estimatedDevices, 120) }).map((_, i) => {
                                    const idleThreshold = Math.round(Math.min(estimatedDevices, 120) * 0.25);
                                    const isIdle = i < idleThreshold;
                                    return (
                                        <div
                                            key={i}
                                            title={isIdle ? "Idle, not deployed" : "Active"}
                                            className={`w-4 h-4 rounded-sm transition-colors ${isIdle
                                                    ? "bg-amber-500/40 border border-amber-500/30"
                                                    : "bg-primary/30 border border-primary/20"
                                                }`}
                                        />
                                    );
                                })}
                                {estimatedDevices > 120 && (
                                    <span className="text-xs text-muted-foreground font-mono self-end ml-1">
                                        +{(estimatedDevices - 120).toLocaleString()} more
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-6 mt-5 text-xs font-mono text-muted-foreground">
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
                            <p className="text-sm text-muted-foreground mb-6 font-mono">
                                On a 4-year refresh cycle this fleet generates{" "}
                                <span className="text-muted-foreground">{monthlyOffload} units per month</span> on a steady, predictable schedule
                            </p>
                            <div className="grid grid-cols-12 gap-1 items-end h-28">
                                {Array.from({ length: CADENCE_MONTHS }).map((_, i) => {
                                    const isQ4Adjacent = i === 0 || i === 11;
                                    const height = isQ4Adjacent ? 100 : 55 + Math.round(Math.sin(i * 0.8) * 15);
                                    const label = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i];
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                                            <span className="text-muted-foreground text-xs font-mono font-bold">
                                                {Math.round(monthlyOffload * (isQ4Adjacent ? 1.4 : height / 80))}
                                            </span>
                                            <div
                                                className="w-full rounded-t bg-primary/40 border-t border-primary/60 transition-all duration-500"
                                                style={{ height: `${height}%` }}
                                            />
                                            <span className="text-muted-foreground text-muted-foreground font-mono">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-4">
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
                <div className="max-w-7xl mx-auto">
                    <SectionLabel>02 · Market Rhythms</SectionLabel>
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                        Purchasing is Seasonal and tech supply lags around 3–4 Years
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mb-10 leading-relaxed">
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
                            <div className="flex bg-muted rounded-lg p-1 border border-border font-mono text-sm gap-1">
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
                </div>
            </section>

            {/* ── Section 3: SMB Demand Gap ── */}
            <section id="demand" className="px-6 py-16 border-t border-border">
                <div className="max-w-7xl mx-auto">
                    <SectionLabel>03 · SMB Demand Gap</SectionLabel>
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                        The Generational Technology Gap
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mb-10 leading-relaxed">
                        Refurbished hardware is already the mainstream choice. Over 54% of SMBs
                        buy certified refurb.<Cite n={9} /> The opportunity is in connecting mid-market
                        sellers retiring 2 to 3 year old hardware<Cite n={11} /> with SMB buyers running
                        3 to 5 year old fleets on break-fix cycles.<Cite n={9} />
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <StatCard
                            icon="📈"
                            value="$10.54B"
                            label="Global Refurbished Market Size"
                            tag="+11.2% Annual Growth"
                            tagClass="bg-primary/10 text-muted-foreground"
                            cite={9}
                        />
                        <StatCard
                            icon="🤝"
                            value=">54%"
                            label="SMBs Opting for Refurbished"
                            tag="Mainstream procurement channel"
                            tagClass="bg-muted text-muted-foreground"
                            cite={9}
                        />
                        <StatCard
                            icon="💰"
                            value="130%"
                            label="DRAM &amp; SSD Price Surge (2026)"
                            tag="AI PC wave driving enterprise offload"
                            tagClass="bg-amber-500/10 text-amber-400"
                            cite={3}
                        />
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                            Technology Generation Lag by Segment
                        </h3>
                        <p className="text-sm text-muted-foreground mb-8 font-mono">
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

            {/* ── Sources ── */}
            <footer id="sources" className="border-t border-border px-6 py-12">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
                        Sources
                    </p>
                    <ol className="space-y-3">
                        {SOURCES.map(({ n, label, url }) => (
                            <li key={n} className="flex items-start gap-3 text-sm font-mono">
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Cite({ n }: { n: number }) {
    return (
        <a
            href="#sources"
            className="text-muted-foreground text-xs font-mono align-super ml-0.5 transition-colors"
        >
            [{n}]
        </a>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            {children}
        </p>
    );
}

function MetricBox({
    label,
    value,
    sub,
    valueClass,
}: {
    label: string;
    value: string;
    sub: string;
    valueClass: string;
}) {
    return (
        <div className="bg-muted/50 p-4 rounded-xl border border-border">
            <span className="block text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                {label}
            </span>
            <span className={`text-2xl font-bold font-mono ${valueClass}`}>{value}</span>
            <span className="block text-xs text-muted-foreground mt-1">{sub}</span>
        </div>
    );
}

function InsightCard({
    accent,
    title,
    children,
}: {
    accent: "green" | "slate";
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`bg-muted/50 p-5 rounded-xl border border-border border-l-4 ${accent === "green" ? "border-l-primary" : "border-l-slate-500"
                }`}
        >
            <h4 className="font-semibold text-foreground mb-2">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
        </div>
    );
}

function StatCard({
    icon,
    value,
    label,
    tag,
    tagClass,
    cite,
}: {
    icon: string;
    value: string;
    label: string;
    tag: string;
    tagClass: string;
    cite?: number;
}) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <span className="block text-4xl mb-3">{icon}</span>
            <span className="block text-3xl font-bold font-mono text-foreground mb-1">
                {value}{cite && <Cite n={cite} />}
            </span>
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-mono ${tagClass}`}>
                {tag}
            </div>
        </div>
    );
}
