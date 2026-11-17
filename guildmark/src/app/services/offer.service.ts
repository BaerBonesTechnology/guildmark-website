import type { OfferRole, OfferStatus, SellerOffer } from "../models/offer";
import { validListingPrice, validListingQuantity } from "./listing.service";

export function counterpartyLabel(offer: SellerOffer, role: OfferRole): string {
  return role === "received"
    ? offer.buyer_name || "Business buyer"
    : "Listing seller";
}
export function formatOfferDate(iso: string): string {
  return Number.isFinite(Date.parse(iso))
    ? new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Unavailable";
}
export function effectiveOfferStatus(
  offer: SellerOffer,
  now = Date.now(),
): OfferStatus {
  return ["pending", "accepted"].includes(offer.status) &&
    Date.parse(offer.expires_at) <= now
    ? "expired"
    : offer.status;
}
export function hasLiveOfferTerms(
  offer: SellerOffer,
  now = Date.now(),
): boolean {
  return (
    Date.parse(offer.expires_at) > now &&
    Number.isFinite(offer.offer_price) &&
    offer.offer_price > 0 &&
    Number.isSafeInteger(offer.quantity) &&
    offer.quantity > 0
  );
}
export function isOfferActionable(
  offer: SellerOffer,
  role: OfferRole,
  now = Date.now(),
): boolean {
  return (
    hasLiveOfferTerms(offer, now) &&
    (role === "received" ? offer.status === "pending" : false)
  );
}
export function canCreateOfferOrder(
  offer: SellerOffer,
  role: OfferRole,
  now = Date.now(),
): boolean {
  return (
    role === "received" &&
    offer.status === "accepted" &&
    hasLiveOfferTerms(offer, now)
  );
}
export function offerCardHint(
  offer: SellerOffer,
  role: OfferRole,
  now = Date.now(),
): string {
  return isOfferActionable(offer, role, now) ? "Respond" : "View offer";
}
export function pendingOfferCount(
  offers: SellerOffer[],
  now = Date.now(),
): number {
  return offers.filter(
    (offer) =>
      effectiveOfferStatus(offer, now) === "pending" &&
      hasLiveOfferTerms(offer, now),
  ).length;
}
export function priceDeltaClass(_deltaPercent: number): string {
  return "text-muted-foreground";
}
export function priceDeltaPercent(
  offerPrice: number,
  listedPrice: number | null | undefined,
): number | null {
  return Number.isFinite(offerPrice) &&
    offerPrice > 0 &&
    listedPrice != null &&
    Number.isFinite(listedPrice) &&
    listedPrice > 0
    ? ((offerPrice - listedPrice) / listedPrice) * 100
    : null;
}
export function offerMoney(amount: number | null | undefined): string {
  return amount != null && Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    : "Unavailable";
}
export function offerSubtotal(price: number, quantity: number): number | null {
  return Number.isFinite(price) &&
    price > 0 &&
    Number.isSafeInteger(quantity) &&
    quantity > 0
    ? (Math.round(price * 100) * quantity) / 100
    : null;
}
export function validateOfferTerms(
  price: string,
  quantity: string,
  available?: number,
): string | null {
  if (!validListingPrice(price))
    return "Enter a unit price from $0.01 to $1,000,000 with at most two decimal places.";
  if (!validListingQuantity(quantity))
    return "Enter a whole quantity from 1 to 100,000.";
  if (
    available != null &&
    (!Number.isFinite(available) || Number(quantity) > available)
  )
    return "The quantity exceeds the currently available stock.";
  return null;
}
export function offersPage(
  offers: SellerOffer[],
  search: string,
  status: string,
  rawPage: string | null,
  now = Date.now(),
) {
  const term = search.trim().toLocaleLowerCase();
  const filtered = offers.filter(
    (offer) =>
      (status === "all" || effectiveOfferStatus(offer, now) === status) &&
      [
        offer.id,
        offer.model_name,
        offer.listing_id,
        offer.buyer_name,
        offer.message,
      ].some((value) => value?.toLocaleLowerCase().includes(term)),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8));
  const parsed = Number(rawPage);
  const page =
    Number.isSafeInteger(parsed) && parsed > 0
      ? Math.min(parsed, totalPages)
      : 1;
  return {
    page,
    totalPages,
    filteredCount: filtered.length,
    pageItems: filtered.slice((page - 1) * 8, page * 8),
  };
}
