/**
 * Product Detail Page (PDP) — View. Full listing view with on-page buying.
 * State + logic live in useProductDetailViewModel; spec/gallery/logistics
 * blocks are their own components. Buy Now opens the Square dialog; the
 * make-an-offer form is the negotiation path.
 */
import { Link } from "react-router";
import { AlertTriangle, ArrowLeft, Building2, CheckCircle2, GitCompare, Loader2 } from "lucide-react";
import { BuyNowDialog } from "../components/BuyNowDialog";
import { MarketSignal } from "../components/MarketSignal";
import { ProductGallery } from "../components/product/ProductGallery";
import { ProductLogisticsPanel } from "../components/product/ProductLogisticsPanel";
import { ProductSpecTable } from "../components/product/ProductSpecTable";
import { ProductSpecTiles } from "../components/product/ProductSpecTiles";
import { BODY, DISPLAY, MONO } from "../constants/typography";
import { categoryIcon, demandSignal } from "../services/marketplace.service";
import { buildSpecRows } from "../services/product.service";
import { useProductDetailViewModel } from "../viewmodels/useProductDetailViewModel";

function BackLink() {
  return (
    <Link to="/pre/marketplace" className="inline-flex items-center gap-1.5 text-xs mb-5 hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
      <ArrowLeft size={13} /> Back to GuildMarket
    </Link>
  );
}

export function ProductDetail() {
  const {
    atMax, buyOpen, error, formError, imageIndex, isCompared, isError, isPending, isSubmitting,
    listing, offerPrice, purchased, quantity, setBuyOpen, setFormError, setImageIndex,
    setOfferPrice, setPurchased, setQuantity, submitOffer, submitted, toggle,
  } = useProductDetailViewModel();

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
  const images = listing.product_images ?? [];
  const compared = isCompared(listing.id);
  const disabledCompare = atMax(listing);
  const specRows = buildSpecRows(listing);

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto" style={{ fontFamily: BODY }}>
      <BackLink />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left — media gallery + specs */}
        <div className="space-y-4">
          <ProductGallery
            grade={listing.condition_grade}
            imageIndex={imageIndex}
            images={images}
            modelName={listing.model_name ?? "Listing"}
            onSelectImage={setImageIndex}
            placeholderIcon={categoryIcon(listing.asset_type)}
          />
          <ProductSpecTiles available={available} listing={listing} />
          {specRows.length > 0 && <ProductSpecTable specRows={specRows} />}
          <ProductLogisticsPanel listing={listing} />
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
            <button onClick={() => { if (!disabledCompare) toggle(listing); }} disabled={disabledCompare}
              title={disabledCompare ? "Max 4 per category" : undefined}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-wider mb-3 transition-colors disabled:opacity-40"
              style={{ fontFamily: MONO, border: `1px solid ${compared ? "var(--primary)" : "var(--border)"}`, color: compared ? "#fff" : "var(--muted-foreground)", background: compared ? "var(--primary)" : "transparent" }}>
              <GitCompare size={11} /> {compared ? "ADDED TO COMPARE" : "ADD TO COMPARE"}
            </button>
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

            {purchased ? (
              <div className="border border-border p-5 flex items-start gap-3" style={{ background: "var(--secondary)" }}>
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">Order placed</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Payment received and funds are held in escrow. Track it under My Orders.</p>
                </div>
              </div>
            ) : submitted ? (
              <div className="border border-border p-5 flex items-start gap-3" style={{ background: "var(--secondary)" }}>
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">Offer submitted</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>The seller will be notified and can accept, counter, or decline. Track it under My Offers.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setBuyOpen(true)} disabled={price <= 0}
                  className="w-full py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "var(--primary)", color: "#fff", fontFamily: BODY }}>
                  {price > 0 ? `Buy Now · $${price.toLocaleString()}` : "Unavailable"}
                </button>

                <div className="border-t border-border pt-4">
                  <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Or make an offer</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Price / unit</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted-foreground)" }}>$</span>
                        <input type="number" min="0.01" step="0.01" value={offerPrice} onChange={(event) => { setOfferPrice(event.target.value); setFormError(null); }}
                          className="w-full pl-6 pr-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary"
                          style={{ fontFamily: BODY, background: "var(--input-background)" }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Quantity</label>
                      <input type="number" min="1" step="1" value={quantity} onChange={(event) => { setQuantity(event.target.value); setFormError(null); }}
                        className="w-full px-3 py-2.5 text-sm border border-border text-foreground focus:outline-none focus:border-primary"
                        style={{ fontFamily: BODY, background: "var(--input-background)" }} />
                    </div>
                  </div>
                  {formError && <p className="text-xs mb-3" style={{ color: "var(--chart-4)" }}>{formError}</p>}
                  <button onClick={submitOffer} disabled={isSubmitting}
                    className="w-full py-3 text-sm border border-border hover:border-foreground transition-colors disabled:opacity-50" style={{ fontFamily: BODY }}>
                    {isSubmitting ? "Submitting…" : "Submit offer"}
                  </button>
                  <p className="text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>{available} unit{available === 1 ? "" : "s"} available · escrow-secured payment on acceptance</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BuyNowDialog
        open={buyOpen}
        onOpenChange={setBuyOpen}
        listing={listing}
        quantity={Math.max(1, parseInt(quantity, 10) || 1)}
        onSuccess={() => setPurchased(true)}
      />
    </div>
  );
}
