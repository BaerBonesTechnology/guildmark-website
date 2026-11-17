/** PDP condition & logistics panel (functional status, data-wipe, warranty…). */
import { ShieldCheck } from "lucide-react";
import { FUNCTIONAL_LABEL, WARRANTY_LABEL, WIPE_LABEL } from "../../constants/product.constants";
import { MONO } from "../../constants/typography";
import type { MarketplaceListing } from "../../models/marketplace";

export function ProductLogisticsPanel({ listing }: { listing: MarketplaceListing }) {
  return (
    <div className="border border-border p-5 space-y-4" style={{ background: "var(--card)" }}>
      <span className="text-[10px] tracking-widest uppercase block" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Condition &amp; Logistics</span>
      <div className="flex flex-wrap gap-2">
        {listing.functional_status && (
          <span className="text-[10px] px-2 py-1 flex items-center gap-1.5" style={{ fontFamily: MONO, border: "1px solid var(--border)", color: "var(--foreground)" }}>
            {FUNCTIONAL_LABEL[listing.functional_status] ?? listing.functional_status}
          </span>
        )}
        {listing.data_wipe_status && (
          <span className="text-[10px] px-2 py-1 flex items-center gap-1.5"
            style={{ fontFamily: MONO, border: `1px solid color-mix(in srgb, var(--primary) ${listing.data_wipe_status === "certified" ? 40 : 20}%, transparent)`, color: listing.data_wipe_status === "certified" ? "var(--primary)" : "var(--muted-foreground)" }}>
            <ShieldCheck size={10} /> {WIPE_LABEL[listing.data_wipe_status] ?? listing.data_wipe_status}
          </span>
        )}
        {listing.warranty_status && listing.warranty_status !== "none" && (
          <span className="text-[10px] px-2 py-1" style={{ fontFamily: MONO, border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
            {WARRANTY_LABEL[listing.warranty_status] ?? listing.warranty_status}
            {listing.warranty_expiration ? ` · ${new Date(listing.warranty_expiration).toLocaleDateString()}` : ""}
          </span>
        )}
      </div>
      {listing.known_defects && (
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Known defects</p>
          <p className="text-sm" style={{ color: "var(--foreground)" }}>{listing.known_defects}</p>
        </div>
      )}
      {listing.included_accessories && (
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Included accessories</p>
          <p className="text-sm">{listing.included_accessories}</p>
        </div>
      )}
      {listing.ships_from_location && (
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Ships from</p>
          <p className="text-sm">{listing.ships_from_location}</p>
        </div>
      )}
      {!listing.functional_status && !listing.data_wipe_status && !listing.known_defects &&
        !listing.included_accessories && !listing.ships_from_location &&
        (listing.warranty_status === "none" || !listing.warranty_status) && (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No additional condition details provided.</p>
        )}
    </div>
  );
}
