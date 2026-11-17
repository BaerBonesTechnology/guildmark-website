/** Listing card: readable condition, real specifications and clear unit pricing. */
import { Link } from "react-router";
import { ArrowUpRight, Check, GitCompare, TrendingUp } from "lucide-react";
import { useCompare } from "../CompareContext";
import { CONDITION_LABEL } from "../../constants/marketplace.constants";
import { ROUTE } from "../../constants/routes.constants";
import { buildSpecs, buildTrustSignals, categoryIcon, demandSignal, listingPrice } from "../../services/marketplace.service";
import type { MarketplaceListing } from "../../models/marketplace";

export function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const { atMax, isCompared, toggle } = useCompare();
  const compared = isCompared(listing.id);
  const Icon = categoryIcon(listing.asset_type);
  const photo = listing.product_images?.[0];
  const price = listingPrice(listing);
  const trust = buildTrustSignals(listing);
  const demand = demandSignal(listing);
  return <article className={`gm-listing${compared ? " gm-listing-compared" : ""}`}>
    <Link to={ROUTE.marketplaceListing(listing.id)} className="gm-listing-link">
      <div className="gm-listing-image">
        {photo ? <img src={photo} alt={listing.model_name ?? "Hardware listing"} loading="lazy" /> : <div className="gm-listing-placeholder"><Icon size={58} strokeWidth={1} /><span>Photo not provided</span></div>}
        {listing.condition_grade && <span className={`gm-condition gm-condition-${listing.condition_grade.toLowerCase()}`}>{CONDITION_LABEL[listing.condition_grade]}</span>}
        {demand >= 4 && <span className="gm-demand"><TrendingUp size={11} strokeWidth={2} aria-hidden="true" />In demand</span>}
      </div>
      <div className="gm-listing-details"><p className="gm-listing-category">{listing.asset_type ?? "Business hardware"}</p><h2>{listing.model_name ?? "Hardware listing"}</h2><p className="gm-listing-seller">{listing.seller_name ?? "Business seller"}</p><p className="gm-listing-specs">{buildSpecs(listing).filter(spec => spec !== listing.asset_type).slice(0, 3).join(" · ") || "View listing for specifications"}</p>{trust.length > 0 && <ul className="gm-listing-trust">{trust.map(s => <li key={s.label} className={`gm-trust gm-trust-${s.tone}`}><s.Icon size={12} strokeWidth={2} aria-hidden="true" />{s.label}</li>)}</ul>}<div className="gm-listing-price"><div><strong>{price > 0 ? `$${price.toLocaleString()}` : "Price unavailable"}</strong><span> / unit</span><small>{listing.quantity ?? 1} units available</small></div><ArrowUpRight size={18} /></div></div>
    </Link>
    <button className="gm-compare-button" aria-pressed={compared} disabled={atMax(listing)} onClick={() => toggle(listing)} title={atMax(listing) ? "Maximum 4 per category" : undefined}>{compared ? <Check size={14} /> : <GitCompare size={14} />}{compared ? "Added to comparison" : "Compare"}</button>
  </article>;
}
