/** Checkout presentation; Square lifecycle and payment retries remain in the view model. */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Loader2, CheckCircle2, AlertCircle, CreditCard, LockKeyhole, ArrowRight } from "lucide-react";
import type { MarketplaceListing } from "../models/marketplace";
import { money } from "../services/square.service";
import { categoryIcon } from "../services/marketplace.service";
import { useBuyNowViewModel } from "../viewmodels/useBuyNowViewModel";

interface Props {
  listing: MarketplaceListing;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  open: boolean;
  quantity: number;
}

export function BuyNowDialog({ listing, onOpenChange, onSuccess, open, quantity }: Props) {
  const {
    addr1, addr2, cardError, cardholderName, city, handlePay, isLoading, setAddr1, setAddr2,
    setCardholderName, setCity, setStateAb, setZip, stateAb, step, totals, unit, zip,
  } = useBuyNowViewModel(listing, quantity, open);
  const { buyerFee, buyerFeeRate, qty, subtotal, total } = totals;
  const Icon = categoryIcon(listing.asset_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gm-checkout">
        <DialogHeader className="gm-checkout-header">
          <p className="gm-eyebrow"><LockKeyhole size={13} /> GuildMark checkout</p>
          <DialogTitle>{step === "success" ? "Your next chapter is on its way." : "Make it yours."}</DialogTitle>
          <DialogDescription>{step === "card" ? "Review your order, then complete your payment." : "Your payment is confirmed. You can follow the next steps in My Orders."}</DialogDescription>
        </DialogHeader>

        {step === "card" ? <div className="gm-checkout-grid" aria-busy={isLoading}>
          <aside className="gm-checkout-summary" aria-label="Order summary">
            <h2>Order summary</h2>
            <div className="gm-checkout-product">
              <div className="gm-checkout-thumbnail">{listing.product_images?.[0] ? <img src={listing.product_images[0]} alt="" /> : <Icon size={34} strokeWidth={1} />}</div>
              <div><h3>{listing.model_name ?? "Hardware listing"}</h3><p>{listing.seller_name ?? "Business seller"}</p><span>{qty} {qty === 1 ? "unit" : "units"} × {money(unit)}</span></div>
            </div>
            <dl className="gm-order-totals">
              <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
              <div><dt>Buyer fee {buyerFeeRate != null && <span>({(buyerFeeRate * 100).toFixed(1)}%)</span>}</dt><dd>{buyerFee != null ? money(buyerFee) : "Loading…"}</dd></div>
              <div className="gm-order-total"><dt>Total due today<span>USD</span></dt><dd>{buyerFee != null ? money(total) : "—"}</dd></div>
            </dl>
            <p className="gm-checkout-assurance"><LockKeyhole size={15} /> Card payments are processed by Square.</p>
            <button className="gm-checkout-back" onClick={() => onOpenChange(false)} disabled={isLoading}>Back to listing</button>
          </aside>

          <div className="gm-checkout-payment">
            <section aria-labelledby="card-details-title">
              <h2 id="card-details-title"><span>01</span> Payment details</h2>
              <label className="gm-field" htmlFor="checkout-name">Cardholder name <span>(required)</span>
                <input id="checkout-name" placeholder="Full name on card" value={cardholderName} onChange={e => setCardholderName(e.target.value)} autoComplete="cc-name" disabled={isLoading} />
              </label>
              <div className="gm-card-field"><p>Card details</p><div id="gm-buynow-card" aria-label="Square card details" /></div>
            </section>
            <section aria-labelledby="billing-title">
              <h2 id="billing-title"><span>02</span> Billing address</h2>
              <div className="gm-customer-form">
                <label className="gm-field" htmlFor="checkout-address">Street address <span>(required)</span><input id="checkout-address" placeholder="Street address" value={addr1} onChange={e => setAddr1(e.target.value)} autoComplete="address-line1" disabled={isLoading} /></label>
                <label className="gm-field" htmlFor="checkout-address2">Apartment, suite, etc. <span>(optional)</span><input id="checkout-address2" placeholder="Apartment or suite" value={addr2} onChange={e => setAddr2(e.target.value)} autoComplete="address-line2" disabled={isLoading} /></label>
                <div className="gm-billing-locality">
                  <label className="gm-field" htmlFor="checkout-city">City <span>(required)</span><input id="checkout-city" placeholder="City" value={city} onChange={e => setCity(e.target.value)} autoComplete="address-level2" disabled={isLoading} /></label>
                  <label className="gm-field" htmlFor="checkout-state">State <span>(required)</span><input id="checkout-state" placeholder="NY" maxLength={2} value={stateAb} onChange={e => setStateAb(e.target.value.toUpperCase())} autoComplete="address-level1" disabled={isLoading} /></label>
                <label className="gm-field gm-zip-field" htmlFor="checkout-zip">ZIP code <span>(required)</span><input id="checkout-zip" placeholder="10001" value={zip} onChange={e => setZip(e.target.value)} autoComplete="postal-code" disabled={isLoading} /></label>
                </div>
              </div>
            </section>
            {cardError && <div className="gm-feedback gm-feedback-error" role="alert"><AlertCircle size={18} /><span>{cardError}</span></div>}
            <button className="gm-button gm-button-primary gm-full-width" onClick={handlePay} disabled={isLoading || unit <= 0 || buyerFee == null}>
              {isLoading ? <><Loader2 size={17} className="animate-spin" /> Processing payment…</> : <><CreditCard size={17} /> {buyerFee == null ? "Loading total…" : `Pay ${money(total)}`} <ArrowRight size={16} /></>}
            </button>
          </div>
        </div> : <div className="gm-checkout-success" role="status">
          <CheckCircle2 size={46} strokeWidth={1.5} />
          <h2>Thank you for your order.</h2>
          <p>{qty} {qty === 1 ? "unit" : "units"} · {listing.model_name ?? "Hardware listing"}</p>
          <p>Track your order and payment details under My Orders.</p>
          <button className="gm-button gm-button-primary" onClick={() => { onOpenChange(false); onSuccess?.(); }}>Done <ArrowRight size={17} /></button>
        </div>}
      </DialogContent>
    </Dialog>
  );
}
