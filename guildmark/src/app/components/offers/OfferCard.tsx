import { ArrowUpRight } from "lucide-react";
import {
  OFFER_STATUS_COLOR,
  OFFER_STATUS_LABEL,
} from "../../constants/offer.constants";
import {
  counterpartyLabel,
  effectiveOfferStatus,
  formatOfferDate,
  offerCardHint,
  offerMoney,
  offerSubtotal,
} from "../../services/offer.service";
import type { OfferRole, SellerOffer } from "../../models/offer";
export function OfferCard({
  offer,
  role,
  onSelect,
  now,
}: {
  offer: SellerOffer;
  role: OfferRole;
  onSelect: () => void;
  now: number;
}) {
  const status = effectiveOfferStatus(offer, now);
  const color = OFFER_STATUS_COLOR[status];
  return (
    <li className="gm-offer-card">
      <div>
        <span className="gm-offer-meta">
          {counterpartyLabel(offer, role)} · {offer.quantity}{" "}
          {offer.quantity === 1 ? "unit" : "units"}
        </span>
        <h2>{offer.model_name || "Hardware listing"}</h2>
        <p>Expires {formatOfferDate(offer.expires_at)}</p>
        {offer.counter_price != null && (
          <p className="gm-offer-counter-note">
            Counter: {offerMoney(offer.counter_price)} / unit
          </p>
        )}
      </div>
      <div className="gm-offer-card-money">
        <strong>
          {offerMoney(offer.offer_price)}
          <span> / unit</span>
        </strong>
        <small>
          {offerMoney(offerSubtotal(offer.offer_price, offer.quantity))} before
          fees
        </small>
      </div>
      <span
        className="gm-offer-badge"
        style={{
          color,
          borderColor: `color-mix(in srgb,${color} 28%,transparent)`,
          background: `color-mix(in srgb,${color} 7%,var(--card))`,
        }}
      >
        {OFFER_STATUS_LABEL[status]}
      </span>
      <button
        className="gm-text-link"
        aria-label={`View offer ${offer.id}`}
        onClick={onSelect}
      >
        {offerCardHint(offer, role, now)}{" "}
        <ArrowUpRight size={15} aria-hidden="true" />
      </button>
    </li>
  );
}
