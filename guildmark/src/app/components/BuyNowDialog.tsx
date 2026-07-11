/**
 * BuyNowDialog — Square-backed one-click purchase for a marketplace listing.
 *
 * Step 1 — card: Square Web Payments card form + billing address + order summary
 * Step 2 — success: order confirmation
 *
 * Square tokenises card number, CVV, and expiry in browser-hosted iframes so
 * raw card data never touches our servers; only the one-time nonce (cnon:…) is
 * sent to POST /marketplace/listings/:id/buy, which charges the buyer their
 * portion (subtotal + buyer fee) and opens escrow.
 */
import { useState, useEffect, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, CheckCircle2, AlertCircle, CreditCard, ShieldCheck } from "lucide-react";
import { useBuyListing, usePlatformFees } from "../lib/apiHooks";
import { squareApplicationId, squareLocationId, squareEnvironment } from "../config";
import type { MarketplaceListing } from "../models/marketplace";

const MONO = "'JetBrains Mono', monospace";

// ── Lazy-load the Square Web Payments SDK ───────────────────────────────────
const SQUARE_SDK_URLS: Record<string, string> = {
  production: "https://web.squarecdn.com/v1/square.js",
  sandbox:    "https://sandbox.web.squarecdn.com/v1/square.js",
};

let squareSdkPromise: Promise<void> | null = null;

function loadSquareSdk(): Promise<void> {
  if (window.Square) return Promise.resolve();
  if (squareSdkPromise) return squareSdkPromise;

  squareSdkPromise = new Promise((resolve, reject) => {
    const url = SQUARE_SDK_URLS[squareEnvironment] ?? SQUARE_SDK_URLS.sandbox;
    const script = document.createElement("script");
    script.src     = url;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Square SDK from ${url}`));
    document.head.appendChild(script);
  });

  return squareSdkPromise;
}

type SquareCardForm = {
  attach:   (selector: string) => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
  destroy:  () => Promise<void>;
};

const inputCls =
  "w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50";

type Step = "card" | "success";

interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  listing:      MarketplaceListing;
  quantity:     number;
  /** Called after a successful purchase, just before the dialog closes. */
  onSuccess?:   () => void;
}

export function BuyNowDialog({ open, onOpenChange, listing, quantity, onSuccess }: Props) {
  const buy = useBuyListing(listing.id);
  const { data: fees } = usePlatformFees();

  const [step,      setStep]      = useState<Step>("card");
  const [cardError, setCardError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [addr1,   setAddr1]   = useState("");
  const [addr2,   setAddr2]   = useState("");
  const [city,    setCity]    = useState("");
  const [stateAb, setStateAb] = useState("");
  const [zip,     setZip]     = useState("");

  const cardRef = useRef<SquareCardForm | null>(null);
  const [cardInitKey, setCardInitKey] = useState(0);

  // ── Order math (mirrors the backend buy.dart fee snapshot) ────────────────
  const unit       = listing.listed_price ?? listing.buyer_ask_price ?? 0;
  const qty        = Math.max(1, quantity);
  const subtotal   = unit * qty;
  const buyerFeeR  = fees?.buyer_fee ?? null;
  const buyerFee   = buyerFeeR != null ? subtotal * buyerFeeR : null;
  const total      = buyerFee != null ? subtotal + buyerFee : subtotal;

  // Mount the Square card form when we reach the card step (or on retry).
  useEffect(() => {
    if (step !== "card" || !open) return;
    let cancelled = false;

    (async () => {
      setCardError("");
      try {
        await loadSquareSdk();
        if (!window.Square) throw new Error("Square SDK not available");
        const payments = await window.Square.payments(squareApplicationId, squareLocationId);
        const card = await payments.card();
        if (cancelled) { await card.destroy().catch(() => {}); return; }
        cardRef.current = card;
        await card.attach("#gm-buynow-card");
      } catch (err) {
        if (!cancelled) setCardError(err instanceof Error ? err.message : "Failed to load payment form");
      }
    })();

    return () => {
      cancelled = true;
      cardRef.current?.destroy().catch(() => {});
      cardRef.current = null;
    };
  }, [step, open, cardInitKey]);

  // Reset when the dialog closes.
  useEffect(() => {
    if (!open) {
      setStep("card");
      setCardError("");
      setIsLoading(false);
      setCardInitKey(0);
      setCardholderName("");
      setAddr1(""); setAddr2(""); setCity(""); setStateAb(""); setZip("");
      buy.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePay() {
    // Sandbox shortcut — bypass the SDK card form and use Square's static test
    // nonce so backend config can be verified without a matching frontend appId.
    const isSandbox = squareEnvironment === "sandbox" || squareApplicationId.startsWith("sandbox-");
    if (isSandbox) {
      setIsLoading(true);
      setCardError("");
      try {
        await buy.mutateAsync({ source_id: "cnon:card-nonce-ok", quantity: qty, payment_terms: "immediate" });
        setStep("success");
      } catch (err) {
        setCardError(err instanceof Error ? err.message : "Payment failed.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Production flow — real SDK tokenisation.
    if (!cardRef.current) { setCardError("Payment form not ready — please wait."); return; }
    if (!cardholderName.trim()) { setCardError("Cardholder name is required."); return; }
    if (!addr1.trim() || !city.trim() || !stateAb.trim() || !zip.trim()) {
      setCardError("Please fill in all required billing address fields (marked *).");
      return;
    }

    setIsLoading(true);
    setCardError("");
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK" || !result.token) {
        setCardError(result.errors?.[0]?.message ?? "Card tokenisation failed");
        setIsLoading(false);
        return;
      }
      await buy.mutateAsync({ source_id: result.token, quantity: qty, payment_terms: "immediate" });
      setStep("success");
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      // The nonce is single-use — force a fresh card form for the next attempt.
      setCardInitKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }

  const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

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
                  {buyerFeeR != null && (
                    <span className="text-xs text-muted-foreground/60">({(buyerFeeR * 100).toFixed(1)}%)</span>
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
