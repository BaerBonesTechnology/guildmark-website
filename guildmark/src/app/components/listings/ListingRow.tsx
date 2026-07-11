/** One row in the My Listings table, with publish / edit / withdraw actions. */
import { Pencil, Trash2, Zap } from "lucide-react";
import { ListingSpecPill } from "./ListingSpecPill";
import { DISPLAY, MONO } from "../../constants/typography";
import { gradeColor, listingFlagColor, listingTotalValue } from "../../services/listing.service";
import type { Listing } from "../../models/listing";

interface ListingRowProps {
  isPublishing: boolean;
  isWithdrawing: boolean;
  listing: Listing;
  onEdit: () => void;
  onPublish: () => void;
  onWithdraw: () => void;
  striped: boolean;
}

export function ListingRow({ isPublishing, isWithdrawing, listing, onEdit, onPublish, onWithdraw, striped }: ListingRowProps) {
  const flagColor = listingFlagColor(listing.valuation_flag ?? undefined);

  return (
    <tr className="border-b border-border last:border-0" style={{ background: striped ? "var(--secondary)" : "transparent" }}>
      <td className="py-3 px-4">
        <p className="font-medium">{listing.model_name ?? "Listing"}</p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {listing.asset_type && <ListingSpecPill>{listing.asset_type}</ListingSpecPill>}
          {listing.condition_grade && <span className="text-[9px] px-1.5 py-0.5 tracking-wide uppercase" style={{ fontFamily: MONO, color: gradeColor(listing.condition_grade), border: `1px solid color-mix(in srgb, ${gradeColor(listing.condition_grade)} 30%, transparent)` }}>Grade {listing.condition_grade}</span>}
          {listing.ram_gb != null && <ListingSpecPill>{listing.ram_gb}GB</ListingSpecPill>}
        </div>
      </td>
      <td className="py-3 px-4" style={{ fontFamily: MONO }}>{listing.quantity ?? 1}</td>
      <td className="py-3 px-4" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "1rem", color: flagColor }}>
        {listing.listed_price != null ? `$${listing.listed_price.toLocaleString()}` : "—"}
      </td>
      <td className="py-3 px-4" style={{ fontFamily: MONO }}>${listingTotalValue(listing).toLocaleString()}</td>
      <td className="py-3 px-4">
        <span className="text-[10px] px-2 py-0.5 tracking-wider uppercase" style={{
          fontFamily: MONO,
          color: listing.status === "active" ? "var(--primary)" : "var(--muted-foreground)",
          border: `1px solid ${listing.status === "active" ? "color-mix(in srgb, var(--primary) 35%, transparent)" : "var(--border)"}`,
          background: listing.status === "active" ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent",
        }}>{listing.status}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1">
          {listing.status === "draft" && (
            <button title="Publish to marketplace" disabled={isPublishing} onClick={onPublish}
              className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40" style={{ color: "var(--primary)" }}>
              <Zap size={13} />
            </button>
          )}
          <button title="Edit price" onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors" style={{ color: "var(--muted-foreground)" }}>
            <Pencil size={13} />
          </button>
          <button title="Withdraw listing" disabled={isWithdrawing} onClick={onWithdraw}
            className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40" style={{ color: "var(--chart-4)" }}>
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}
