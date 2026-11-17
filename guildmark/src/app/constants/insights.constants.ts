/** Market Insights page data — chart series, stat cards, sources, constants. */

export interface NavLink {
  href: string;
  label: string;
}

export interface SeasonalityPoint {
  quarter: string;
  value: number;
}

export interface Source {
  label: string;
  n: number;
  url: string;
}

export interface StatCardData {
  cite?: number;
  icon: string;
  label: string;
  tag: string;
  tagClass: string;
  value: string;
}

export interface TechLagPoint {
  min: number;
  segment: string;
  variance: number;
}

// Average commercial device value used to estimate fleet size from portfolio value.
export const AVG_DEVICE_VALUE = 1_200;
export const CADENCE_MONTHS = 12;
export const REFRESH_CYCLE_MONTHS = 48; // 4-year cycle

export const NAV_LINKS: NavLink[] = [
  { href: "#stockpile", label: "The Stockpile Problem" },
  { href: "#seasonality", label: "Market Rhythms" },
  { href: "#demand", label: "SMB Demand Gap" },
];

export const PURCHASING_DATA: SeasonalityPoint[] = [
  { quarter: "Q1 (Jan–Mar)", value: 35 },
  { quarter: "Q2 (Apr–Jun)", value: 20 },
  { quarter: "Q3 (Jul–Sep)", value: 25 },
  { quarter: "Q4 (Oct–Dec)", value: 100 },
];

export const SUPPLY_DATA: SeasonalityPoint[] = [
  { quarter: "Q1 (Jan–Mar)", value: 20 },
  { quarter: "Q2 (Apr–Jun)", value: 15 },
  { quarter: "Q3 (Jul–Sep)", value: 20 },
  { quarter: "Q4 (Oct–Dec)", value: 85 },
];

export const TECH_LAG_DATA: TechLagPoint[] = [
  { segment: "SMBs (<100)", min: 3.5, variance: 1.5 },
  { segment: "Mid-Market (100–500)", min: 2.5, variance: 0.5 },
  { segment: "Large Enterprise", min: 1.5, variance: 0.5 },
];

export const DEMAND_STAT_CARDS: StatCardData[] = [
  { icon: "📈", value: "$10.54B", label: "Global Refurbished Market Size", tag: "+11.2% Annual Growth", tagClass: "bg-primary/10 text-muted-foreground", cite: 9 },
  { icon: "🤝", value: ">54%", label: "SMBs Opting for Refurbished", tag: "Mainstream procurement channel", tagClass: "bg-muted text-muted-foreground", cite: 9 },
  { icon: "💰", value: "130%", label: "DRAM & SSD Price Surge (2026)", tag: "AI PC wave driving enterprise offload", tagClass: "bg-amber-500/10 text-amber-400", cite: 3 },
];

export const SOURCES: Source[] = [
  { n: 1, label: "Gartner — Worldwide IT Spending to Grow 10.8% in 2026, Totaling $6.15 Trillion", url: "https://www.gartner.com/en/newsroom/press-releases/2026-02-03-gartner-forecasts-worldwide-it-spending-to-grow-10-point-8-percent-in-2026-totaling-6-point-15-trillion-dollars" },
  { n: 2, label: "TechnologyChecker.io — Technology Trends Shaping Business IT in 2026", url: "https://technologychecker.io/blog/technology-trends" },
  { n: 3, label: "PCMag — Inside the 2026 RAM Crunch: Why AI Will Make Your Next Laptop Much Pricier", url: "https://www.pcmag.com/explainers/inside-2026-ram-crunch-why-ai-will-make-your-next-laptop-much-pricier" },
  { n: 4, label: "Gartner — Surging Memory Costs Will Reduce Global PC and Smartphone Shipments in 2026", url: "https://www.gartner.com/en/newsroom/press-releases/2026-02-26-gartner-says-surging-memory-costs-will-reduce-global-pc-and-smartphone-shipments-in-2026" },
  { n: 5, label: "HP — AI PC vs. Traditional PC: Upgrade Guide for Business", url: "https://www.hp.com/us-en/shop/tech-takes/ai-pc-vs-traditional-pc-upgrade-guide" },
  { n: 6, label: "Future Market Insights — AI PC Market Size, Share and Growth Forecast", url: "https://www.futuremarketinsights.com/reports/ai-pc-market" },
  { n: 7, label: "IDC — Global Memory Shortage Crisis: Market Analysis and Impact on PC Markets in 2026", url: "https://www.idc.com/resource-center/blog/global-memory-shortage-crisis-market-analysis-and-the-potential-impact-on-the-smartphone-and-pc-markets-in-2026/" },
  { n: 8, label: "Microsoft — AI PCs and ROI for Business", url: "https://www.microsoft.com/en-us/windows/business/knowledge-center/ai-pcs-and-roi" },
  { n: 9, label: "Mordor Intelligence — Refurbished Computers and Laptops Market Report", url: "https://www.mordorintelligence.com/industry-reports/refurbished-computers-and-laptops-market" },
  { n: 10, label: "GM Insights — IT Asset Disposition (ITAD) Market Size and Forecast", url: "https://www.gminsights.com/industry-analysis/it-asset-disposition-market" },
  { n: 11, label: "LeadingIT — How Long Should Business Laptops Really Last?", url: "https://goleadingit.com/blog/how-long-should-business-laptops-really-last/" },
  { n: 12, label: "allwhere — Laptop Depreciation Rate: What Businesses Need to Know", url: "https://www.allwhere.co/post/laptop-depreciation-rate" },
  { n: 13, label: "growrk — Laptop Depreciation Rate Guide for Remote Teams", url: "https://growrk.com/blog/laptop-depreciation-rate" },
  { n: 14, label: "OpenPR — Global Refurbished Computers and Laptops Market to Reach USD Billions by 2030", url: "https://www.openpr.com/news/4455778/global-refurbished-computers-and-laptops-market-to-reach-usd" },
  { n: 15, label: "Yo!Kart — Top Multi-Vendor Marketplaces in USA", url: "https://www.yo-kart.com/blog/top-multi-vendor-marketplaces-in-usa/" },
  { n: 16, label: "Rigby — Essential B2B Marketplace Features", url: "https://www.rigbyjs.com/blog/b2b-marketplace-features" },
  { n: 17, label: "SourceForge — Top B2B Marketplaces Software Directory", url: "https://sourceforge.net/software/b2b-marketplaces/" },
  { n: 18, label: "Ellen MacArthur Foundation — FLOOW2: Business-to-Business Asset Sharing", url: "https://www.ellenmacarthurfoundation.org/circular-examples/business-to-business-asset-sharing" },
  { n: 19, label: "Circulary — FLOOW2: B2B Sharing Platform for Idle Assets", url: "http://www.circulary.eu/project/floow2-b2b-sharing/" },
  { n: 20, label: "FatBit Technologies — Top eCommerce Marketplaces in the World", url: "https://www.fatbit.com/fab/top-ecommerce-marketplaces-in-the-world/" },
  { n: 21, label: "Circle Economy — FLOOW2: Facilitating the Use of Idle Assets Through an Online B2B Marketplace", url: "https://www.circle-economy.com/resources/floow2-facilitating-the-use-of-idle-assets-through-an-online-b2b-marketplace" },
  { n: 22, label: "Blancco — Two in Five Global Organizations Waste More Than $100,000 a Year Storing Useless IT Hardware", url: "https://blancco.com/research-two-in-five-global-organizations-waste-more-than-100000-a-year-storing-useless-it-hardware/" },
];
