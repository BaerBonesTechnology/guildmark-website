/**
 * OfferDialog — the offer-management surface used by both Offers tabs.
 *   • role="received": pending offers show Accept / Counter / Decline.
 *   • role="placed":   read-only status; an accepted offer can be completed.
 * Never navigates straight to the PDP.
 */
import { Building2, Check, CheckCircle2, Package, RefreshCw, X } from "lucide-react";
import { Link } from "react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { OFFER_STATUS_COPY, OFFER_STATUS_TEXT } from "../../constants/offer.constants";
import { ROUTE } from "../../constants/routes.constants";
import { counterpartyLabel, formatOfferDate, priceDeltaClass, priceDeltaPercent } from "../../services/offer.service";
import { useOfferDialogViewModel } from "../../viewmodels/useOfferDialogViewModel";
import type { OfferRole, SellerOffer } from "../../models/offer";

interface OfferDialogProps {
  mode: OfferRole;
  offer: SellerOffer | null;
  onOpenChange: (open: boolean) => void;
}

export function OfferDialog({ mode, offer, onOpenChange }: OfferDialogProps) {
  const model = useOfferDialogViewModel(offer?.id ?? "", () => onOpenChange(false));

  if (!offer) return null;

  const canRespond = mode === "received" && offer.status === "pending";
  const deltaPercent = priceDeltaPercent(offer.offer_price, offer.listed_price);
  const listedPrice = offer.listed_price ?? null;

  const handleClose = () => {
    model.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{offer.model_name ?? `Listing ${offer.listing_id.slice(0, 8)}…`}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 font-mono">
            <Building2 size={12} /> {counterpartyLabel(offer, mode)} · Qty {offer.quantity}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-px bg-border border border-border">
            <div className="p-4 bg-card">
              <p className="text-2xs tracking-widest uppercase font-mono text-muted-foreground mb-1">{mode === "received" ? "Their offer" : "Your offer"}</p>
              <p className="text-2xl leading-none font-display font-bold text-primary">${offer.offer_price.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-card">
              <p className="text-2xs tracking-widest uppercase font-mono text-muted-foreground mb-1">Listed price</p>
              <p className="text-2xl leading-none font-display font-bold">
                {listedPrice != null ? `$${listedPrice.toLocaleString()}` : "—"}
                {deltaPercent != null && (
                  <span className={`text-xs ml-1.5 font-mono ${priceDeltaClass(deltaPercent)}`}>{deltaPercent >= 0 ? "+" : ""}{deltaPercent.toFixed(0)}%</span>
                )}
              </p>
            </div>
          </div>

          <p className="text-2xs font-mono text-muted-foreground">Placed {formatOfferDate(offer.created_at)} · Expires {formatOfferDate(offer.expires_at)}</p>
          {offer.message && <p className="text-sm font-body italic border-l-2 border-border pl-3 text-muted-foreground">"{offer.message}"</p>}
          {offer.counter_price != null && (
            <p className="text-xs font-mono text-amps-accent">{mode === "received" ? "You countered at" : "Seller countered at"} ${offer.counter_price.toLocaleString()}</p>
          )}

          {canRespond ? (
            model.isCountering ? (
              <div className="space-y-2">
                <label className="text-2xs tracking-widest uppercase font-mono text-muted-foreground block">Counter price / unit</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input type="number" min="0.01" step="0.01" value={model.counterPrice} autoFocus
                      onChange={(event) => model.setCounterPrice(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") model.sendCounter(); }}
                      className="w-full pl-6 pr-3 py-2 text-sm bg-input-background border border-border focus:outline-none focus:border-primary" />
                  </div>
                  <button disabled={model.isBusy} onClick={model.sendCounter} className="px-4 py-2 text-sm font-medium text-white bg-amps-accent hover:opacity-90 transition-opacity disabled:opacity-50">Send counter</button>
                  <button onClick={model.cancelCounter} className="px-3 py-2 text-sm border border-border hover:border-foreground transition-colors">Back</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button disabled={model.isBusy} onClick={model.accept} className="inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-white bg-grade-a hover:opacity-90 transition-opacity disabled:opacity-50"><Check size={15} /> Accept</button>
                <button disabled={model.isBusy} onClick={() => model.startCounter(String(offer.offer_price))} className="inline-flex items-center justify-center gap-1.5 py-2.5 text-sm border border-border hover:border-foreground transition-colors disabled:opacity-50"><RefreshCw size={15} /> Counter</button>
                <button disabled={model.isBusy} onClick={model.decline} className="inline-flex items-center justify-center gap-1.5 py-2.5 text-sm border border-border hover:border-foreground transition-colors disabled:opacity-50 text-chart-4"><X size={15} /> Decline</button>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 bg-secondary border border-border p-3">
              <CheckCircle2 size={15} className={OFFER_STATUS_TEXT[offer.status]} />
              <p className="text-sm font-body">{OFFER_STATUS_COPY[offer.status][mode]}</p>
            </div>
          )}

          {mode === "placed" && offer.status === "accepted" && (
            <Link to={ROUTE.marketplaceListing(offer.listing_id)} onClick={handleClose}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-white bg-primary hover:opacity-90 transition-opacity">
              <Package size={15} /> Complete purchase
            </Link>
          )}

          <Link to={ROUTE.marketplaceListing(offer.listing_id)} className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
            View listing →
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
