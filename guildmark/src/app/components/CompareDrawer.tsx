/**
 * CompareDrawer — fixed bottom tray + expandable side-by-side comparison for
 * marketplace listings (View). Grouped by category (asset_type). Open/flash
 * state and grouping live in useCompareDrawerViewModel; each group renders
 * through CategorySection. Presentation only.
 */
import { ChevronDown, ChevronUp, Package, X } from "lucide-react";
import { CategorySection } from "./compare/CategorySection";
import { CATEGORY_ICON, CATEGORY_LABEL } from "../constants/compare.constants";
import { BODY, MONO } from "../constants/typography";
import { useCompareDrawerViewModel } from "../viewmodels/useCompareDrawerViewModel";

export function CompareDrawer() {
  const { clear, compared, flashing, groups, open, setOpen } = useCompareDrawerViewModel();

  if (compared.length === 0) return null;

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
