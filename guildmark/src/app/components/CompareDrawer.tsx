/**
 * CompareDrawer — fixed bottom tray + expandable side-by-side comparison for
 * marketplace listings. Grouped by category (asset_type). Highlights the
 * lowest price and highest demand per group.
 */

import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, X, Laptop, Monitor, Server, Smartphone, Tablet, Network, Package } from "lucide-react";
import { useCompare, categoryOf } from "./CompareContext";
import type { MarketplaceListing } from "../models/marketplace";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const CATEGORY_ICON: Record<string, React.ElementType> = {
  laptop: Laptop, desktop: Monitor, server: Server, phone: Smartphone,
  tablet: Tablet, networking: Network, monitor: Monitor, other: Package,
};
const CATEGORY_LABEL: Record<string, string> = {
  laptop: "Laptops", desktop: "Desktops", server: "Servers", phone: "Phones",
  tablet: "Tablets", networking: "Networking", monitor: "Monitors", other: "Other",
};
const GRADE_COLOR: Record<string, string> = { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)" };
const conditionLabel: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };

function priceOf(l: MarketplaceListing) { return l.listed_price ?? l.buyer_ask_price ?? 0; }
function daysAgo(iso: string) { return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000); }
function demandOf(l: MarketplaceListing): number {
  const boost = daysAgo(l.created_at) <= 3 ? 1 : 0;
  const base: Record<string, number> = { distressed: 4, standard: 3, insufficient_data: 2, seller_overpriced: 1 };
  return Math.min(5, Math.max(1, (base[l.valuation_flag] ?? 2) + boost));
}

function groupByCategory(listings: MarketplaceListing[]): Record<string, MarketplaceListing[]> {
  return listings.reduce<Record<string, MarketplaceListing[]>>((acc, l) => {
    const c = categoryOf(l);
    (acc[c] ??= []).push(l);
    return acc;
  }, {});
}

type RowKey = "price" | "condition" | "demand" | "seller" | "ram" | "storage" | "cpu" | "qty";
const ROWS: { key: RowKey; label: string }[] = [
  { key: "price", label: "Price / unit" },
  { key: "condition", label: "Condition" },
  { key: "demand", label: "Demand" },
  { key: "seller", label: "Seller" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "cpu", label: "CPU Score" },
  { key: "qty", label: "Qty Available" },
];

function cellValue(l: MarketplaceListing, key: RowKey): string {
  switch (key) {
    case "price": return priceOf(l) > 0 ? `$${priceOf(l).toLocaleString()}` : "—";
    case "condition": return l.condition_grade ? conditionLabel[l.condition_grade] : "—";
    case "demand": return `${demandOf(l)}/5`;
    case "seller": return l.seller_name ?? "B2B Seller";
    case "ram": return l.ram_gb != null ? `${l.ram_gb} GB` : "—";
    case "storage": return l.storage_gb != null ? `${l.storage_gb} GB` : "—";
    case "cpu": return l.cpu_score != null ? `${l.cpu_score}` : "—";
    case "qty": return `×${l.quantity ?? 1}`;
  }
}

function CategorySection({ category, listings }: { category: string; listings: MarketplaceListing[] }) {
  const { remove } = useCompare();
  const Icon = CATEGORY_ICON[category] ?? Package;
  const minPrice = Math.min(...listings.map(priceOf).filter((p) => p > 0));
  const maxDemand = Math.max(...listings.map(demandOf));

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="w-6 h-6 flex items-center justify-center" style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
          <Icon size={11} style={{ color: "var(--primary)" }} />
        </div>
        <span className="text-[10px] tracking-widest uppercase" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}>{CATEGORY_LABEL[category] ?? category}</span>
        <span className="text-[10px]" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}>· {listings.length} selected</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: "fixed", minWidth: Math.max(420, listings.length * 200 + 140) }}>
          <colgroup>
            <col style={{ width: 140 }} />
            {listings.map((l) => <col key={l.id} style={{ width: 200 }} />)}
          </colgroup>
          <thead>
            <tr>
              <th />
              {listings.map((l) => (
                <th key={l.id} className="pb-3 pr-4 align-top">
                  <div className="border border-border overflow-hidden" style={{ background: "var(--card)" }}>
                    {l.product_images?.[0]
                      ? <img src={l.product_images[0]} alt={l.model_name ?? ""} className="w-full h-24 object-cover" />
                      : <div className="w-full h-24 flex items-center justify-center" style={{ background: "var(--secondary)" }}><Icon size={24} className="opacity-30" style={{ color: "var(--muted-foreground)" }} /></div>}
                    <div className="p-3 relative">
                      <button onClick={() => remove(l.id)} className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X size={11} /></button>
                      <p className="text-xs font-medium leading-snug pr-5 truncate" style={{ fontFamily: BODY }}>{l.model_name ?? "Listing"}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ key, label }, rowIdx) => (
              <tr key={key} style={{ background: rowIdx % 2 === 0 ? "var(--card)" : "transparent" }}>
                <td className="py-2.5 px-3 text-[10px] uppercase tracking-wider align-middle" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}>{label}</td>
                {listings.map((l) => {
                  const isBest = (key === "price" && priceOf(l) === minPrice && priceOf(l) > 0) || (key === "demand" && demandOf(l) === maxDemand);
                  const emphasize = key === "price";
                  return (
                    <td key={l.id} className="py-2.5 pr-4 text-xs align-middle"
                      style={{
                        fontFamily: emphasize ? DISPLAY : BODY,
                        fontWeight: emphasize ? 700 : 400,
                        fontSize: emphasize ? "1rem" : undefined,
                        color: key === "condition" && l.condition_grade ? GRADE_COLOR[l.condition_grade] : isBest ? "var(--primary)" : "var(--foreground)",
                      }}>
                      {cellValue(l, key)}
                      {isBest && (
                        <span className="ml-1.5 text-[8px] tracking-widest px-1" style={{ fontFamily: MONO, color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)", background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}>
                          {key === "price" ? "LOWEST" : "TOP"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CompareDrawer() {
  const { compared, clear } = useCompare();
  const [open, setOpen] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const prevCount = useRef(compared.length);

  useEffect(() => {
    if (compared.length > prevCount.current) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 800);
      prevCount.current = compared.length;
      return () => clearTimeout(t);
    }
    prevCount.current = compared.length;
  }, [compared.length]);

  useEffect(() => { if (compared.length === 0) setOpen(false); }, [compared.length]);

  if (compared.length === 0) return null;

  const groups = groupByCategory(compared);

  return (
    <>
      <style>{`@keyframes compareFlash { 0%,30% { background: var(--primary); } 100% { background: var(--card); } }
        @keyframes drawerSlide { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border" style={{ background: "var(--card)", boxShadow: "0 -8px 32px rgba(0,0,0,0.25)", animation: "drawerSlide 0.25s ease-out" }}>
        {/* Collapsed tab */}
        <div className="flex items-center gap-3 h-11 px-5 cursor-pointer select-none" onClick={() => setOpen((o) => !o)}
          style={{ background: "var(--card)", animation: flashing ? "compareFlash 0.8s ease-out" : undefined }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {Object.keys(groups).map((cat) => {
              const Icon = CATEGORY_ICON[cat] ?? Package;
              return (
                <span key={cat} className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] tracking-widest shrink-0"
                  style={{ fontFamily: MONO, color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)", background: "color-mix(in srgb, var(--primary) 6%, transparent)" }}>
                  <Icon size={9} /> {groups[cat].length} {(CATEGORY_LABEL[cat] ?? cat).toUpperCase()}
                </span>
              );
            })}
            <span className="text-xs font-medium ml-1" style={{ fontFamily: BODY }}>Compare {compared.length} listing{compared.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={(e) => { e.stopPropagation(); clear(); }} className="text-[10px] hover:text-foreground transition-colors flex items-center gap-1" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}><X size={9} /> Clear</button>
            {open ? <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} /> : <ChevronUp size={14} style={{ color: "var(--muted-foreground)" }} />}
          </div>
        </div>

        {open && (
          <div className="border-t border-border overflow-y-auto" style={{ maxHeight: "65vh", background: "var(--background)" }}>
            <div className="px-6 py-4 flex items-center justify-between border-b border-border sticky top-0 z-10" style={{ background: "var(--card)" }}>
              <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: MONO, color: "var(--muted-foreground)" }}>Comparing {compared.length} listing{compared.length !== 1 ? "s" : ""}</p>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><ChevronDown size={14} /></button>
            </div>
            <div className="px-6 py-6">
              {Object.entries(groups).map(([cat, listings]) => <CategorySection key={cat} category={cat} listings={listings} />)}
            </div>
          </div>
        )}
      </div>

      {/* Spacer so page content clears the drawer */}
      <div style={{ height: open ? "65vh" : "2.75rem" }} />
    </>
  );
}
