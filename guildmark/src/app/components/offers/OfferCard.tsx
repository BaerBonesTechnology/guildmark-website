/** A single offer row — presentational; opens the respond/detail dialog. */
import { Building2, ShoppingCart } from "lucide-react";
import { OFFER_STATUS_BADGE } from "../../constants/offer.constants";
import {
  counterpartyLabel,
  formatOfferDate,
  isOfferActionable,
  offerCardHint,
  priceDeltaClass,
  priceDeltaPercent,
} from "../../services/offer.service";
import type { OfferRole, SellerOffer } from "../../models/offer";

interface OfferCardProps {
  offer: SellerOffer;
  onSelect: () => void;
  role: OfferRole;
}

export function OfferCard({ offer, onSelect, role }: OfferCardProps) {
  const actionable = isOfferActionable(offer, role);
  const deltaPercent = priceDeltaPercent(offer.offer_price, offer.listed_price);
  const listedPrice = offer.listed_price ?? null;

  return (
    <button onClick={onSelect} className="w-full text-left bg-card border border-border p-5 hover:border-primary transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-secondary border border-border">
              <ShoppingCart size={14} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-body font-medium truncate">{offer.model_name ?? `Listing ${offer.listing_id.slice(0, 8)}…`}</p>
              <p className="text-2xs font-mono text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Building2 size={11} /> {counterpartyLabel(offer, role)} · Qty {offer.quantity}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pl-11">
            <span className="text-2xl leading-none font-display font-bold text-primary">
              ${offer.offer_price.toLocaleString()}
              <span className="text-2xs font-mono font-normal text-muted-foreground">/unit</span>
            </span>
            {listedPrice != null && (
              <span className="text-2xs font-mono text-muted-foreground">
                vs ${listedPrice.toLocaleString()}
                {deltaPercent != null && (
                  <span className={priceDeltaClass(deltaPercent)}> ({deltaPercent >= 0 ? "+" : ""}{deltaPercent.toFixed(0)}%)</span>
                )}
              </span>
            )}
            {offer.counter_price != null && (
              <span className="text-2xs font-mono text-amps-accent">Counter ${offer.counter_price.toLocaleString()}</span>
            )}
          </div>
          <p className="text-2xs font-mono text-muted-foreground pl-11">
            Placed {formatOfferDate(offer.created_at)} · Expires {formatOfferDate(offer.expires_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1 text-2xs px-2 py-0.5 tracking-wider uppercase font-mono border ${OFFER_STATUS_BADGE[offer.status]}`}>
            {offer.status}
          </span>
          <span className={`text-2xs font-mono tracking-wider ${actionable ? "text-primary" : "text-muted-foreground"}`}>
            {offerCardHint(offer, role)}
          </span>
        </div>
      </div>
    </button>
  );
}
