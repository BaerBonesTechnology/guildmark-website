/**
 * Product Detail Page (PDP) — full listing view with on-page buying.
 *
 * Replaces the old detail/offer popups. Loads the listing via useListing(id)
 * and offers two paths:
 *   • Buy at list price  → one-click offer at the asking price
 *   • Make an offer      → price + quantity form (useMakeOffer)
 *
 * A card "Buy Now" checkout (Square) is a separate stage; the offer flow is
 * the working path today.
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft, Building2, Cpu, HardDrive, MemoryStick, Package, Loader2, CheckCircle2, AlertTriangle,
  Laptop, Monitor, Server, Smartphone, Tablet, Network, ShieldCheck,
} from "lucide-react";
import { MarketSignal } from "../components/MarketSignal";
import { useListing, useMakeOffer } from "../lib/apiHooks";
import type { MarketplaceListing } from "../models/marketplace";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const CATEGORY_ICON: Record<string, React.ElementType> = {
  laptop: Laptop, desktop: Monitor, server: Server, phone: Smartphone,
  tablet: Tablet, networking: Network, monitor: Monitor,
};
const GRADE_COLOR: Record<string, string> = { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)" };
const conditionLabel: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };

function daysAgo(iso: string) { return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000); }
function demandSignal(l: MarketplaceListing): 1 | 2 | 3 | 4 | 5 {
  const newBoost = daysAgo(l.created_at) <= 3 ? 1 : 0;
  const base: Record<string, number> = { distressed: 4, standard: 3, insufficient_data: 2, seller_overpriced: 1 };
  return Math.min(5, Math.max(1, (base[l.valuation_flag] ?? 2) + newBoost)) as 1 | 2 | 3 | 4 | 5;
}

function SpecTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="p-4 flex items-center gap-3" style={{ background: "var(--card)" }}>
      <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
        <Icon size={13} style={{ color: "var(--muted-foreground)" }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{label}</p>
        <p className="text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/pre/marketplace" className="inline-flex items-center gap-1.5 text-xs mb-5 hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
      <ArrowLeft size={13} /> Back to GuildMarket
    </Link>
  );
}

export function ProductDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: listing, isPending, isError, error } = useListing(id);

  const makeOffer = useMakeOffer();
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (listing) { setOfferPrice(String(listing.listed_price ?? "")); setQuantity("1"); setFormError(null); setSubmitted(false); }
  }, [listing]);

  if (isPending) {
    return (
      <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
        <BackLink />
        <div className="border border-border py-24 flex flex-col items-center gap-3" style={{ background: "var(--card)" }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading listing…</p>
        </div>
      </div>
    );
  }
  if (isError || !listing) {
    return (
      <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
        <BackLink />
        <div className="border border-border p-8 flex items-start gap-4" style={{ background: "var(--card)", borderLeft: "3px solid var(--chart-4)" }}>
          <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0" style={{ color: "var(--chart-4)" }} />
          <div>
            <p className="font-medium mb-1">Listing unavailable</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {error instanceof Error ? error.message : "This listing could not be found or is no longer active."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const price = listing.listed_price ?? listing.buyer_ask_price ?? 0;
  const available = listing.quantity ?? 1;
  const Icon = CATEGORY_ICON[listing.asset_type ?? ""] ?? Package;
  const grade = listing.condition_grade;

  function submitOffer(atList = false) {
    const p = atList ? price : parseFloat(offerPrice);
    const q = parseInt(quantity, 10);
    if (isNaN(p) || p <= 0) { setFormError("Enter a valid offer price"); return; }
    if (isNaN(q) || q <= 0) { setFormError("Enter a valid quantity"); return; }
    setFormError(null);
    makeOffer.mutate({ listing_id: listing!.id, offer_price: p, quantity: q }, { onSuccess: () => setSubmitted(true) });
  }

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
      <BackLink />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left — media + specs */}
        <div className="space-y-4">
          <div className="border border-border h-[360px] relative flex items-center justify-center overflow-hidden" style={{ background: "var(--secondary)" }}>
            {listing.photo_url
              ? <img src={listing.photo_url} alt={listing.model_name ?? "Listing"} className="w-full h-full object-cover" />
              : <Icon size={64} className="opacity-25" style={{ color: "var(--muted-foreground)" }} />}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {grade && (
                <span className="text-[10px] px-2 py-0.5" style={{ color: GRADE_COLOR[grade], border: `1px solid color-mix(in srgb, ${GRADE_COLOR[grade]} 30%, transparent)`, background: "rgba(0,0,0,0.4)", fontFamily: MONO }}>
                  {conditionLabel[grade]}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 flex items-center gap-1" style={{ color: "#fff", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)", background: "var(--primary)", fontFamily: MONO }}>
                <ShieldCheck size={10} /> CERTIFIED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px border border-border" style={{ background: "var(--border)" }}>
            {listing.ram_gb != null && <SpecTile icon={MemoryStick} label="RAM" value={`${listing.ram_gb} GB`} />}
            {listing.storage_gb != null && <SpecTile icon={HardDrive} label="Storage" value={`${listing.storage_gb} GB`} />}
            {listing.cpu_score != null && <SpecTile icon={Cpu} label="CPU Score" value={`${listing.cpu_score}`} />}
            {listing.condition_grade && <SpecTile icon={ShieldCheck} label="Condition" value={conditionLabel[listing.condition_grade]} />}
            {listing.asset_type && <SpecTile icon={Icon} label="Type" value={listing.asset_type} />}
            <SpecTile icon={Package} label="Available" value={`${available} unit${available === 1 ? "" : "s"}`} />
          </div>
        </div>

        {/* Right — title, price, buy/offer */}
        <div className="space-y-4">
          <div className="border border-border p-6" style={{ background: "var(--card)" }}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1 }}>
                {listing.model_name ?? "Listing"}
              </h1>
              <MarketSignal strength={demandSignal(listing)} />
            </div>
            <p className="text-xs flex items-center gap-1.5 mb-5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
              <Building2 size={11} />
              {listing.seller_name ?? "B2B Seller"}
              {listing.seller_industry ? ` · ${listing.seller_industry}` : ""}
              {listing.seller_size_band ? ` · ${listing.seller_size_band}` : ""}
            </p>

            <div className="flex items-end gap-2 mb-1">
              <span className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Listed / unit</span>
            </div>
            <p className="text-5xl leading-none mb-6" style={{ fontFamily: DISPLAY, fontWeight: 700, color: "var(--primary)" }}>
              {price > 0 ? `$${price.toLocaleString()}` : "—"}
            </p>

            {submitted ? (
              <div className="border border-border p-5 flex items-start gap-3" style={{ background: "var(--secondary)" }}>
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">Offer submitted</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>The seller will be notified and can accept, counter, or decline. Track it under My Offers.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => submitOffer(true)} disabled={makeOffer.isPending || price <= 0}
                  className="w-full py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "var(--primary)", color: "#fff", fontFamily: BODY }}>
                  {makeOffer.isPending ? "Submitting…" : `Buy at list price · $${price.toLocaleString()}`}
                </button>

                <div className="border-t border-border pt-4">
                  <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Or make an offer</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Price / unit</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted-foreground)" }}>$</span>
                        <input type="number" min="0.01" step="0.01" value={offerPrice} onChange={(e) => { setOfferPrice(e.target.value); setFormError(null); }}
                          className="w-full pl-6 pr-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary"
                          style={{ fontFamily: BODY, background: "var(--input-background)" }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Quantity</label>
                      <input type="number" min="1" step="1" value={quantity} onChange={(e) => { setQuantity(e.target.value); setFormError(null); }}
                        className="w-full px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary"
                        style={{ fontFamily: BODY, background: "var(--input-background)" }} />
                    </div>
                  </div>
                  {formError && <p className="text-xs mb-3" style={{ color: "var(--chart-4)" }}>{formError}</p>}
                  <button onClick={() => submitOffer(false)} disabled={makeOffer.isPending}
                    className="w-full py-3 text-sm border border-border hover:border-foreground transition-colors disabled:opacity-50" style={{ fontFamily: BODY }}>
                    {makeOffer.isPending ? "Submitting…" : "Submit offer"}
                  </button>
                  <p className="text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>{available} unit{available === 1 ? "" : "s"} available · escrow-secured payment on acceptance</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
