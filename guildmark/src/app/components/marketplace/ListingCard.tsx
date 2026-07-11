/** A marketplace listing card, linking to the PDP with a compare toggle. */
import { Link } from "react-router";
import { Building2, ChevronRight as Arrow, GitCompare, TrendingUp } from "lucide-react";
import { MarketSignal } from "../MarketSignal";
import { SpecPill } from "../SpecPill";
import { useCompare } from "../CompareContext";
import { CONDITION_LABEL, GRADE_COLOR } from "../../constants/marketplace.constants";
import { BODY, DISPLAY, MONO } from "../../constants/typography";
import { ROUTE } from "../../constants/routes.constants";
import { ageLabel, buildSpecs, categoryIcon, demandSignal, isNewListing, listingPrice } from "../../services/marketplace.service";
import type { MarketplaceListing } from "../../models/marketplace";

export function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const { atMax, isCompared, toggle } = useCompare();
  const compared = isCompared(listing.id);
  const disabledCompare = atMax(listing);
  const grade = listing.condition_grade;
  const Icon = categoryIcon(listing.asset_type);
  const photo = listing.product_images?.[0];
  const price = listingPrice(listing);
  const quantity = listing.quantity ?? 1;
  const specs = buildSpecs(listing);

  return (
    <Link to={ROUTE.marketplaceListing(listing.id)} className="border flex flex-col group hover:border-primary transition-colors"
      style={{ background: "var(--card)", borderColor: compared ? "var(--primary)" : "var(--border)" }}>
      {/* Photo (or category placeholder) */}
      <div className="h-32 relative flex items-center justify-center overflow-hidden" style={{ background: "var(--secondary)" }}>
        {photo
          ? <img src={photo} alt={listing.model_name ?? "Listing"} className="w-full h-full object-cover" loading="lazy" />
          : <Icon size={30} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />}
        <div className="absolute top-2 left-2 flex-col gap-1">
          {grade && (
            <span className="text-[9px] px-1.5 py-0.5" style={{ color: 'var(--background)', border: `1px solid color-mix(in srgb, ${GRADE_COLOR[grade]} 30%, transparent)`, background: GRADE_COLOR[grade], fontFamily: MONO }}>
              {CONDITION_LABEL[grade]}
            </span>
          )}
          {isNewListing(listing) && (
            <span className="text-[9px] px-1.5 py-0.5 flex items-center gap-0.5" style={{ color: "#fff", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)", background: "var(--primary)", fontFamily: MONO }}>
              <TrendingUp size={8} /> NEW
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2"><MarketSignal strength={demandSignal(listing)} /></div>
        {/* Compare toggle — don't trigger the card link */}
        <button
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (!disabledCompare) toggle(listing); }}
          disabled={disabledCompare}
          title={disabledCompare ? "Max 4 per category" : compared ? "Remove from compare" : "Add to compare"}
          className={`absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 text-[9px] tracking-wider transition-all ${compared ? "opacity-100" : "opacity-0 group-hover:opacity-100"} disabled:opacity-30`}
          style={{ fontFamily: MONO, color: "#fff", background: compared ? "var(--primary)" : "rgba(0,0,0,0.65)" }}>
          <GitCompare size={9} /> {compared ? "ADDED" : "COMPARE"}
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm font-medium leading-snug mb-1 truncate" style={{ fontFamily: BODY }}>{listing.model_name ?? "Unknown Model"}</p>
        <p className="text-[10px] flex items-center gap-1 mb-3 truncate" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
          <Building2 size={9} className="shrink-0" />
          {listing.seller_name ?? "B2B Seller"}{listing.seller_industry ? ` · ${listing.seller_industry}` : ""}
        </p>
        {specs.length > 0 && <div className="flex gap-1.5 flex-wrap mb-4">{specs.slice(0, 3).map((spec) => <SpecPill key={spec}>{spec}</SpecPill>)}</div>}
        <div className="flex items-end justify-between pt-3 border-t border-border mt-auto">
          <div>
            <div className="text-lg leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{price > 0 ? `$${price.toLocaleString()}` : "—"}</div>
            <div className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>×{quantity} · {ageLabel(listing.created_at)}</div>
          </div>
          <span className="flex items-center gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary)", fontFamily: MONO }}>View <Arrow size={11} /></span>
        </div>
      </div>
    </Link>
  );
}
