/** High-intent assets table — active listings recommended for offload. */
import { Package } from "lucide-react";
import { MarketSignal } from "../MarketSignal";
import { SpecPill } from "../SpecPill";
import { HIGH_INTENT_HEADERS } from "../../constants/dashboard.constants";
import { MONO } from "../../constants/typography";

interface HighIntentAsset {
  asset_id: string;
  demand_score: number;
  model_name: string;
  peak_date: string;
  specs: string;
  status: string;
}

export function HighIntentAssetsTable({ assets }: { assets: HighIntentAsset[] }) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="p-6 border-b border-border">
        <p className="text-sm font-medium">High-Intent Assets</p>
        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Active listings recommended for immediate offload</p>
      </div>

      {assets.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3" style={{ color: "var(--muted-foreground)" }}>
          <Package className="w-8 h-8" style={{ opacity: 0.4 }} />
          <p className="text-sm">No active listings yet</p>
          <p className="text-xs text-center max-w-[280px]" style={{ opacity: 0.7 }}>Publish listings from My Listings to see fleet recommendations here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {HIGH_INTENT_HEADERS.map((header) => (
                  <th key={header} className="text-left p-4 text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, ndx) => (
                <tr key={asset.asset_id} className={ndx !== assets.length - 1 ? "border-b border-border/50" : ""}>
                  <td className="p-4"><span className="text-sm">{asset.model_name}</span></td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {asset.specs.split(" / ").filter(Boolean).map((spec) => <SpecPill key={spec}>{spec}</SpecPill>)}
                    </div>
                  </td>
                  <td className="p-4"><MarketSignal strength={Math.min(5, Math.max(1, asset.demand_score)) as 1 | 2 | 3 | 4 | 5} /></td>
                  <td className="p-4"><span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{asset.peak_date}</span></td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs border"
                      style={asset.status === "ready"
                        ? { color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)", background: "color-mix(in srgb, var(--primary) 8%, transparent)" }
                        : { color: "var(--muted-foreground)", borderColor: "var(--border)", background: "var(--secondary)" }}>
                      {asset.status === "ready" ? "Ready to Offload" : "Hold"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
