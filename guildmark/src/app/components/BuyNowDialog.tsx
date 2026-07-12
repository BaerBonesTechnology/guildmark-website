/**
 * BuyNowDialog — Square-backed one-click purchase for a marketplace listing (View).
 *
 * Step 1 — card: Square Web Payments card form + billing address + order summary
 * Step 2 — success: order confirmation
 *
 * The Square SDK lifecycle, order math, and payment flow live in
 * useBuyNowViewModel / square.service. Presentation only.
 */
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, CheckCircle2, AlertCircle, CreditCard, ShieldCheck } from "lucide-react";
import { MONO } from "../constants/typography";
import type { MarketplaceListing } from "../models/marketplace";
import { money } from "../services/square.service";
import { useBuyNowViewModel } from "../viewmodels/useBuyNowViewModel";

const inputCls =
  "w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50";

interface Props {
  listing: MarketplaceListing;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful purchase, just before the dialog closes. */
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {step === "success" ? "Order confirmed" : "Buy Now"}
          </DialogTitle>
          <DialogDescription>
            {step === "card"
              ? "Escrow-secured purchase. Your card is tokenised by Square — we never see it."
              : `Your order for ${listing.model_name ?? "this listing"} is funded and in escrow.`}
          </DialogDescription>
        </DialogHeader>

        {step === "card" && (
          <div className="space-y-5 py-2">
            {/* Order summary */}
            <div className="rounded-lg border bg-muted p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{listing.model_name ?? "Listing"}</span>
                <span className="text-xs text-muted-foreground" style={{ fontFamily: MONO }}>×{qty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({qty} × {money(unit)})</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Buyer fee
                  {buyerFeeRate != null && (
                    <span className="text-xs text-muted-foreground/60">({(buyerFeeRate * 100).toFixed(1)}%)</span>
                  )}
                </span>
                <span>{buyerFee != null ? money(buyerFee) : "—"}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total due today</span>
                <span className="font-bold">{money(total)}</span>
              </div>
            </div>

            {/* Card details */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Card Details</p>
              <div className="space-y-1">
                <label className="text-xs text-foreground/70">Cardholder Name *</label>
                <input className={inputCls} placeholder="Jane Smith" value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)} autoComplete="cc-name" disabled={isLoading} />
              </div>
              <div className="space-y-1">

                <div id="gm-buynow-card" className="rounded-md border border-input bg-input-background p-1 min-h-[56px]" />
              </div>
            </div>

            {/* Billing address */}
            <div className="space-y-3 border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Billing Address</p>
              <div className="space-y-1">
                <label className="text-xs text-foreground/70">Address Line 1 *</label>
                <input className={inputCls} placeholder="123 Main St" value={addr1}
                  onChange={(e) => setAddr1(e.target.value)} autoComplete="address-line1" disabled={isLoading} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/70">Address Line 2</label>
                <input className={inputCls} placeholder="Suite 400" value={addr2}
                  onChange={(e) => setAddr2(e.target.value)} autoComplete="address-line2" disabled={isLoading} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-foreground/70">City *</label>
                  <input className={inputCls} placeholder="New York" value={city}
                    onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" disabled={isLoading} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-foreground/70">State *</label>
                  <input className={inputCls} placeholder="NY" maxLength={2} value={stateAb}
                    onChange={(e) => setStateAb(e.target.value.toUpperCase())} autoComplete="address-level1" disabled={isLoading} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/70">ZIP Code *</label>
                <input className={`${inputCls} max-w-[160px]`} placeholder="10001" value={zip}
                  onChange={(e) => setZip(e.target.value)} autoComplete="postal-code" disabled={isLoading} />
              </div>
            </div>

            {cardError && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {cardError}
              </div>
            )}

            <div className="flex gap-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2" onClick={handlePay} disabled={isLoading || unit <= 0}>
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  : <><CreditCard className="w-4 h-4" /> Pay {money(total)}</>}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Secured by Square · Funds are held in escrow until you confirm delivery.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Payment received</p>
              <p className="text-sm text-muted-foreground">
                {money(total)} charged. Your order is funded and held in escrow — track it under My Orders.
                A receipt has been emailed to you.
              </p>
            </div>
            <Button className="mt-2 bg-primary hover:bg-primary/90 text-white"
              onClick={() => { onOpenChange(false); onSuccess?.(); }}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
