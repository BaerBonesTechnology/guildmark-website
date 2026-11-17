import { Link, useLocation } from "react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, Building2, CheckCircle2, GitCompare, Loader2 } from "lucide-react";
import { BuyNowDialog } from "../components/BuyNowDialog";
import { ProductGallery } from "../components/product/ProductGallery";
import { ProductLogisticsPanel } from "../components/product/ProductLogisticsPanel";
import { ProductSpecTable } from "../components/product/ProductSpecTable";
import { ProductSpecTiles } from "../components/product/ProductSpecTiles";
import { ROUTE } from "../constants/routes.constants";
import { categoryIcon } from "../services/marketplace.service";
import { buildSpecRows } from "../services/product.service";
import { money } from "../services/square.service";
import { useProductDetailViewModel } from "../viewmodels/useProductDetailViewModel";
import { BusinessBadge } from "../components/signup/BusinessBadge";

function BackLink() {
  return <Link to={ROUTE.marketplace} className="gm-back-link"><ArrowLeft size={15} /> Back to marketplace</Link>;
}

export function ProductDetail() {
  const offerBase = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const {
    atMax, buyOpen, error, formError, imageIndex, isCompared, isError, isPending, isSubmitting,
    listing, offerPrice, offerTotal, purchased, quantity, setBuyOpen, setFormError, setImageIndex,
    setOfferPrice, setPurchased, setQuantity, submitOffer, submitted, toggle,
  } = useProductDetailViewModel();

  if (isPending || isError || !listing) {
    return <div className="gm-container gm-product"><BackLink /><div className="gm-market-empty" role={isPending ? "status" : "alert"}>
      {isPending ? <><Loader2 size={25} className="animate-spin" /><p>Loading listing…</p></> : <><AlertTriangle size={25} /><h1>Listing unavailable</h1><p>{error instanceof Error ? error.message : "This listing could not be found or is no longer active."}</p></>}
    </div></div>;
  }

  const price = listing.listed_price ?? listing.buyer_ask_price ?? 0;
  const available = listing.quantity ?? 1;
  const compared = isCompared(listing.id);
  const specRows = buildSpecRows(listing);

  return (
    <div className="gm-container gm-product">
      <BackLink />
      <div className="gm-product-grid">
        <ProductGallery grade={listing.condition_grade} imageIndex={imageIndex} images={listing.product_images ?? []} modelName={listing.model_name ?? "Hardware listing"} onSelectImage={setImageIndex} placeholderIcon={categoryIcon(listing.asset_type)} />
        <section className="gm-product-purchase" aria-labelledby="product-title">
          <p className="gm-eyebrow">{listing.asset_type ?? "Business hardware"}</p>
          <h1 id="product-title">{listing.model_name ?? "Hardware listing"}</h1>
          <p className="gm-product-seller"><Building2 size={16} /> {listing.seller_name ?? "Business seller"}</p>
          <BusinessBadge companyId={listing.company_id} />
          <div className="gm-product-price"><strong>{price > 0 ? money(price) : "Price unavailable"}</strong>{price > 0 && <span>per unit · USD</span>}</div>
          <p className="gm-product-stock">{available} {available === 1 ? "unit" : "units"} available</p>
          {purchased || submitted ? <div className="gm-feedback gm-feedback-success" role="status"><CheckCircle2 size={21} /><div><h2>{purchased ? "Order placed" : "Offer submitted"}</h2><p>{purchased ? "Payment confirmed. Track your order and payment details under My Orders." : "The seller can accept, counter, or decline. Track the response under My Offers."}</p></div></div> : <>
            <label className="gm-field gm-order-quantity" htmlFor="product-quantity">Quantity
              <input id="product-quantity" type="number" min="1" max={available} step="1" value={quantity} disabled={isSubmitting} onChange={event => { setQuantity(event.target.value); setFormError(null); }} />
            </label>
            <button className="gm-button gm-button-primary gm-full-width" onClick={() => setBuyOpen(true)} disabled={price <= 0 || available < 1 || isSubmitting}>Continue to checkout <ArrowRight size={17} /></button>
            <p className="gm-purchase-note">Review your order and buyer fee before payment.</p>
            <details className="gm-offer-panel"><summary>Prefer to make an offer?</summary>
              <form className="gm-customer-form" noValidate onSubmit={event=>{event.preventDefault();submitOffer();}}>
                <label className="gm-field" htmlFor="offer-price">Offer price per unit (USD)<input id="offer-price" type="number" min="0.01" step="0.01" value={offerPrice} disabled={isSubmitting} onChange={event => { setOfferPrice(event.target.value); setFormError(null); }} /></label>
                <p className="gm-purchase-note">Your offer is for the quantity selected above. {offerTotal != null && <>Total before fees: {money(offerTotal)}. </>}Sending an offer does not create an order or charge payment.</p>
                {formError && <p className="gm-feedback gm-feedback-error" role="alert">{formError}</p>}
                <button type="submit" className="gm-button gm-button-secondary" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Submit offer"}</button>
                <Link className="gm-text-link" to={`${offerBase}/offers?tab=placed`}>Review My Offers</Link>
              </form>
            </details>
          </>}
          <button className="gm-product-compare" aria-pressed={compared} disabled={atMax(listing)} onClick={() => toggle(listing)} title={atMax(listing) ? "Maximum 4 per category" : undefined}><GitCompare size={16} /> {compared ? "Added to comparison" : "Add to comparison"}</button>
        </section>
        <div className="gm-product-information"><ProductSpecTiles available={available} listing={listing} />{specRows.length > 0 && <ProductSpecTable specRows={specRows} />}<ProductLogisticsPanel listing={listing} /></div>
      </div>
      <BuyNowDialog open={buyOpen} onOpenChange={setBuyOpen} listing={listing} quantity={Math.max(1, parseInt(quantity, 10) || 1)} onSuccess={() => setPurchased(true)} />
    </div>
  );
}
