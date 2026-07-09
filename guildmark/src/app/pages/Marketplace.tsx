import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  Search, ChevronLeft, ChevronRight, ChevronRight as Arrow, Building2,
  Laptop, Monitor, Server, Smartphone, Tablet, Network, Package, TrendingUp,
} from "lucide-react";
import { SpecPill } from "../components/SpecPill";
import { MarketSignal } from "../components/MarketSignal";
import { useMarketplaceListings } from "../lib/apiHooks";
import { api } from "../lib/api";
import type { MarketplaceListing } from "../models/marketplace";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const PAGE_SIZE = 12;

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}
function ageLabel(iso: string): string {
  const d = daysAgo(iso);
  return d <= 0 ? "today" : d === 1 ? "1d ago" : `${d}d ago`;
}
function buildSpecs(l: MarketplaceListing): string[] {
  const p: string[] = [];
  if (l.ram_gb)     p.push(`${l.ram_gb} GB RAM`);
  if (l.storage_gb) p.push(`${l.storage_gb} GB SSD`);
  if (l.cpu_score)  p.push(`CPU ${l.cpu_score}`);
  if (l.asset_type) p.push(l.asset_type);
  return p;
}
function demandSignal(l: MarketplaceListing): 1 | 2 | 3 | 4 | 5 {
  const newBoost = daysAgo(l.created_at) <= 3 ? 1 : 0;
  const base: Record<string, number> = { distressed: 4, standard: 3, insufficient_data: 2, seller_overpriced: 1 };
  return Math.min(5, Math.max(1, (base[l.valuation_flag] ?? 2) + newBoost)) as 1 | 2 | 3 | 4 | 5;
}

const GRADE_COLOR: Record<string, string> = { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)" };
const conditionLabel: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };
const CATEGORY_ICON: Record<string, React.ElementType> = {
  laptop: Laptop, desktop: Monitor, server: Server, phone: Smartphone,
  tablet: Tablet, networking: Network, monitor: Monitor,
};

// asset_type value → label. Multi-select filters operate on these keys.
const CATEGORIES: { type: string; label: string }[] = [
  { type: "laptop", label: "Laptops" },
  { type: "desktop", label: "Desktops" },
  { type: "server", label: "Servers" },
  { type: "phone", label: "Phones" },
  { type: "tablet", label: "Tablets" },
  { type: "networking", label: "Networking" },
];
const GRADES = [
  { grade: "A", label: "Grade A" },
  { grade: "B", label: "Grade B" },
  { grade: "C", label: "Grade C" },
];

// ── Filter sidebar (multi-select checkboxes) ─────────────────────────────────

function FilterRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 w-full text-left group py-0.5">
      <span className="w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors"
        style={{ borderColor: checked ? "var(--primary)" : "var(--border)", background: checked ? "var(--primary)" : "transparent" }}>
        {checked && <span className="w-1.5 h-1.5" style={{ background: "#fff" }} />}
      </span>
      <span className="text-xs group-hover:text-foreground transition-colors" style={{ color: checked ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: BODY }}>{label}</span>
    </button>
  );
}
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-4">
      <p className="text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: "var(--foreground)", fontFamily: MONO }}>{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

// ── Listing card (links to PDP) ──────────────────────────────────────────────

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const price = listing.listed_price ?? listing.buyer_ask_price ?? 0;
  const qty = listing.quantity ?? 1;
  const specs = buildSpecs(listing);
  const Icon = CATEGORY_ICON[listing.asset_type ?? ""] ?? Package;
  const grade = listing.condition_grade;
  const isNew = daysAgo(listing.created_at) <= 3;

  return (
    <Link to={`/pre/marketplace/${listing.id}`} className="border border-border flex flex-col group hover:border-primary transition-colors" style={{ background: "var(--card)" }}>
      {/* Photo (or category placeholder) */}
      <div className="h-32 relative flex items-center justify-center overflow-hidden" style={{ background: "var(--secondary)" }}>
        {listing.photo_url
          ? <img src={listing.photo_url} alt={listing.model_name ?? "Listing"} className="w-full h-full object-cover" loading="lazy" />
          : <Icon size={30} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />}
        <div className="absolute top-2 left-2 flex gap-1">
          {grade && (
            <span className="text-[9px] px-1.5 py-0.5" style={{ color: GRADE_COLOR[grade], border: `1px solid color-mix(in srgb, ${GRADE_COLOR[grade]} 30%, transparent)`, background: "rgba(0,0,0,0.35)", fontFamily: MONO }}>
              {conditionLabel[grade]}
            </span>
          )}
          {isNew && (
            <span className="text-[9px] px-1.5 py-0.5 flex items-center gap-0.5" style={{ color: "#fff", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)", background: "var(--primary)", fontFamily: MONO }}>
              <TrendingUp size={8} /> NEW
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2"><MarketSignal strength={demandSignal(listing)} /></div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm font-medium leading-snug mb-1 truncate" style={{ fontFamily: BODY }}>{listing.model_name ?? "Unknown Model"}</p>
        <p className="text-[10px] flex items-center gap-1 mb-3 truncate" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
          <Building2 size={9} className="shrink-0" />
          {listing.seller_name ?? "B2B Seller"}{listing.seller_industry ? ` · ${listing.seller_industry}` : ""}
        </p>
        {specs.length > 0 && <div className="flex gap-1.5 flex-wrap mb-4">{specs.slice(0, 3).map((s) => <SpecPill key={s}>{s}</SpecPill>)}</div>}
        <div className="flex items-end justify-between pt-3 border-t border-border mt-auto">
          <div>
            <div className="text-lg leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{price > 0 ? `$${price.toLocaleString()}` : "—"}</div>
            <div className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>×{qty} · {ageLabel(listing.created_at)}</div>
          </div>
          <span className="flex items-center gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary)", fontFamily: MONO }}>View <Arrow size={11} /></span>
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="border border-border animate-pulse" style={{ background: "var(--card)" }}>
      <div className="h-32" style={{ background: "var(--secondary)" }} />
      <div className="p-4 space-y-3">
        <div className="h-3 w-2/3" style={{ background: "var(--secondary)" }} />
        <div className="h-2 w-1/2" style={{ background: "var(--secondary)" }} />
        <div className="h-6 w-1/3" style={{ background: "var(--secondary)" }} />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function Marketplace() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [grades, setGrades] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState({ totalListings: 0, totalUnits: 0, avgPricePerUnit: "0", totalMarketValue: "0" });

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setPage(1); }, [categories, grades, sortBy]);

  useEffect(() => {
    api.get<{ totalListings: number; totalUnits: number; avgPricePerUnit: number; totalMarketValue: number }>("/marketplace/stats")
      .then((r) => setStats({
        totalListings: r.totalListings, totalUnits: r.totalUnits,
        avgPricePerUnit: r.avgPricePerUnit.toLocaleString("en-US", { maximumFractionDigits: 0 }),
        totalMarketValue: r.totalMarketValue.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      })).catch(() => {});
  }, []);

  // Search is server-side; category/condition are multi-select and filtered
  // client-side, so we pull a generous page. Fine pre-launch — revisit with
  // server-side multi-value filters if the catalog grows past a few hundred.
  const { data, isLoading, isError } = useMarketplaceListings({
    search: debouncedSearch || undefined,
    page: 1, page_size: 100,
  });

  const all = data?.data ?? [];

  const toggle = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    setter(next);
  };

  const filtered = useMemo(() => {
    const list = all.filter((l) => {
      const catOk = categories.size === 0 || (l.asset_type != null && categories.has(l.asset_type));
      const gradeOk = grades.size === 0 || (l.condition_grade != null && grades.has(l.condition_grade));
      return catOk && gradeOk;
    });
    return [...list].sort((a, b) => {
      const ap = a.listed_price ?? a.buyer_ask_price ?? 0;
      const bp = b.listed_price ?? b.buyer_ask_price ?? 0;
      if (sortBy === "price-low") return ap - bp;
      if (sortBy === "price-high") return bp - ap;
      if (sortBy === "demand") return demandSignal(b) - demandSignal(a);
      return 0; // newest — backend already returns created_at DESC
    });
  }, [all, categories, grades, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const anyFilter = categories.size > 0 || grades.size > 0;

  const STATS = [
    { label: "Listings", value: stats.totalListings.toLocaleString() },
    { label: "Units", value: stats.totalUnits.toLocaleString() },
    { label: "Avg / Unit", value: `$${stats.avgPricePerUnit}` },
    { label: "Market Value", value: `$${stats.totalMarketValue}` },
  ];

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
      {/* Header + stats */}
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>GuildMarket</p>
        <h1 className="tracking-tight mb-4" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
          Certified enterprise hardware,<br />from verified B2B sellers.
        </h1>
        <div className="flex flex-wrap gap-px border border-border w-fit" style={{ background: "var(--border)" }}>
          {STATS.map((s) => (
            <div key={s.label} className="px-5 py-2.5" style={{ background: "var(--card)" }}>
              <span className="text-[10px] tracking-widest uppercase mr-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{s.label}</span>
              <span className="text-sm" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Filters</p>
            {anyFilter && (
              <button onClick={() => { setCategories(new Set()); setGrades(new Set()); }}
                className="text-[10px] hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Clear</button>
            )}
          </div>
          <FilterSection title="Category">
            {CATEGORIES.map((c) => <FilterRow key={c.type} label={c.label} checked={categories.has(c.type)} onToggle={() => toggle(categories, c.type, setCategories)} />)}
          </FilterSection>
          <FilterSection title="Condition">
            {GRADES.map((g) => <FilterRow key={g.grade} label={g.label} checked={grades.has(g.grade)} onToggle={() => toggle(grades, g.grade, setGrades)} />)}
          </FilterSection>
        </aside>

        {/* Main */}
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets…"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                style={{ fontFamily: BODY, background: "var(--input-background)" }} />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary appearance-none"
              style={{ fontFamily: BODY, background: "var(--input-background)" }}>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="demand">High Demand</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : isError ? (
            <div className="border border-border py-16 text-center text-sm" style={{ background: "var(--card)", color: "var(--muted-foreground)" }}>Failed to load listings. Please try again.</div>
          ) : pageItems.length === 0 ? (
            <div className="border border-border py-16 text-center" style={{ background: "var(--card)", color: "var(--muted-foreground)" }}>
              <p className="text-sm font-medium mb-1">No listings found</p>
              <p className="text-xs">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{pageItems.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
          )}

          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Page {page} of {totalPages} · {filtered.length.toLocaleString()} listings</p>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors" style={{ fontFamily: BODY }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors" style={{ fontFamily: BODY }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
