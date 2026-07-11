/**
 * OfferDialog — the single offer-management surface used by both tabs of the
 * Offers page.
 *   • mode="seller" (Received): pending offers show Accept / Counter / Decline.
 *   • mode="buyer"  (Placed):   read-only status; accepted offers get a
 *     "Complete Purchase" action. Never navigates straight to the PDP.
 */
import { useState } from "react";
import { Link } from "react-router";
import { Check, X, RefreshCw, Building2, CheckCircle2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { useRespondToOffer } from "../lib/apiHooks";
import type { SellerOffer, OfferStatus } from "../models/offer";

const DISPLAY = "'Barlow Condensed', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const OFFER_STATUS_COLOR: Record<OfferStatus, string> = {
  pending: "var(--grade-b)", accepted: "var(--grade-a)", rejected: "var(--chart-4)",
  expired: "var(--muted-foreground)", countered: "var(--amps-accent)",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_COPY: Record<OfferStatus, { seller: string; buyer: string }> = {
  pending:   { seller: "Awaiting your response.",            buyer: "Awaiting the seller's response." },
  accepted:  { seller: "Accepted — awaiting buyer payment.", buyer: "Accepted! Complete your purchase to fund escrow." },
  countered: { seller: "Counter sent — awaiting the buyer.", buyer: "The seller countered your offer." },
  rejected:  { seller: "This offer was declined.",           buyer: "This offer was declined by the seller." },
  expired:   { seller: "This offer has expired.",            buyer: "This offer has expired." },
};

export function OfferDialog({ offer, mode, onOpenChange }: {
  offer: SellerOffer | null;
  mode: "seller" | "buyer";
  onOpenChange: (open: boolean) => void;
}) {
  const respond = useRespondToOffer();
  const [countering, setCountering] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");

  const close = () => { setCountering(false); setCounterPrice(""); onOpenChange(false); };

  if (!offer) return null;
  const listed = offer.listed_price ?? null;
  const diffPct = listed && listed > 0 ? ((offer.offer_price - listed) / listed) * 100 : null;
  const canRespond = mode === "seller" && offer.status === "pending";
  const busy = respond.isPending;

  const act = (action: "accept" | "reject" | "counter", counter_price?: number) =>
    respond.mutate({ offerId: offer.id, action, counter_price }, { onSuccess: close });

  const submitCounter = () => {
    const p = parseFloat(counterPrice);
    if (isNaN(p) || p <= 0) return;
    act("counter", p);
  };

  const counterparty = mode === "seller" ? (offer.buyer_name ?? "B2B Buyer") : "Seller";

  return (
    <Dialog open={!!offer} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{offer.model_name ?? `Listing ${offer.listing_id.slice(0, 8)}…`}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5" style={{ fontFamily: MONO }}>
            <Building2 size={12} /> {counterparty} · Qty {offer.quantity}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Offer vs listed price */}
          <div className="grid grid-cols-2 gap-px border border-border" style={{ background: "var(--border)" }}>
            <div className="p-4" style={{ background: "var(--card)" }}>
              <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{mode === "seller" ? "Their offer" : "Your offer"}</p>
              <p className="text-2xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700, color: "var(--primary)" }}>${offer.offer_price.toLocaleString()}</p>
            </div>
            <div className="p-4" style={{ background: "var(--card)" }}>
              <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Listed price</p>
              <p className="text-2xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>
                {listed != null ? `$${listed.toLocaleString()}` : "—"}
                {diffPct != null && <span className="text-xs ml-1.5" style={{ fontFamily: MONO, color: diffPct >= 0 ? "var(--grade-a)" : "var(--chart-4)" }}>{diffPct >= 0 ? "+" : ""}{diffPct.toFixed(0)}%</span>}
              </p>
            </div>
          </div>

          <p className="text-[10px]" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Placed {fmtDate(offer.created_at)} · Expires {fmtDate(offer.expires_at)}</p>
          {offer.message && <p className="text-sm italic border-l-2 border-border pl-3" style={{ color: "var(--muted-foreground)" }}>"{offer.message}"</p>}
          {offer.counter_price != null && (
            <p className="text-xs" style={{ color: "var(--amps-accent)", fontFamily: MONO }}>
              {mode === "seller" ? "You countered at" : "Seller countered at"} ${offer.counter_price.toLocaleString()}
            </p>
          )}

          {/* Actions */}
          {canRespond ? (
            countering ? (
              <div className="space-y-2">
                <label className="text-[10px] tracking-widest uppercase block" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Counter price / unit</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted-foreground)" }}>$</span>
                    <input type="number" min="0.01" step="0.01" value={counterPrice} autoFocus
                      onChange={(e) => setCounterPrice(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") submitCounter(); }}
                      className="w-full pl-6 pr-3 py-2 text-sm border border-border focus:outline-none focus:border-primary" style={{ background: "var(--input-background)" }} />
                  </div>
                  <button disabled={busy} onClick={submitCounter} className="px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50" style={{ background: "var(--amps-accent)" }}>Send counter</button>
                  <button onClick={() => setCountering(false)} className="px-3 py-2 text-sm border border-border hover:border-foreground transition-colors">Back</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button disabled={busy} onClick={() => act("accept")} className="inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50" style={{ background: "var(--grade-a)" }}>
                  <Check size={15} /> Accept
                </button>
                <button disabled={busy} onClick={() => { setCountering(true); setCounterPrice(String(offer.offer_price)); }} className="inline-flex items-center justify-center gap-1.5 py-2.5 text-sm border border-border hover:border-foreground transition-colors disabled:opacity-50">
                  <RefreshCw size={15} /> Counter
                </button>
                <button disabled={busy} onClick={() => act("reject")} className="inline-flex items-center justify-center gap-1.5 py-2.5 text-sm border border-border hover:border-foreground transition-colors disabled:opacity-50" style={{ color: "var(--chart-4)" }}>
                  <X size={15} /> Decline
                </button>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 border border-border p-3" style={{ background: "var(--secondary)" }}>
              <CheckCircle2 size={15} style={{ color: OFFER_STATUS_COLOR[offer.status] }} />
              <p className="text-sm">{STATUS_COPY[offer.status][mode]}</p>
            </div>
          )}

          {/* Buyer: complete purchase on an accepted offer */}
          {mode === "buyer" && offer.status === "accepted" && (
            <Link to={`/pre/marketplace/${offer.listing_id}`} onClick={close}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: "var(--primary)" }}>
              <Package size={15} /> Complete purchase
            </Link>
          )}

          <Link to={`/pre/marketplace/${offer.listing_id}`} className="inline-flex items-center gap-1 text-xs hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
            View listing →
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
