/** One asset-type group in the Compare drawer — side-by-side spec table. */
import { X } from "lucide-react";
import { useCompare } from "../CompareContext";
import {
  CATEGORY_ICON, CATEGORY_LABEL, COMPARE_GRADE_COLOR, COMPARE_ROWS, type RowKey,
} from "../../constants/compare.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import type { MarketplaceListing } from "../../models/marketplace";
import { cellValue, demandOf, priceOf } from "../../services/compare.service";

export function CategorySection({ category, listings }: { category: string; listings: MarketplaceListing[] }) {
  const { remove } = useCompare();
  const Icon = CATEGORY_ICON[category] ?? CATEGORY_ICON.other;
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
            {COMPARE_ROWS.map(({ key, label }, rowIdx) => (
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
                        color: key === "condition" && l.condition_grade ? COMPARE_GRADE_COLOR[l.condition_grade] : isBest ? "var(--primary)" : "var(--foreground)",
                      }}>
                      {cellValue(l, key as RowKey)}
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
