/** Offer business logic — pure functions, no React, no side effects (Service). */
import type { OfferRole, SellerOffer } from "../models/offer";

/** Label for the other party in an offer, from the viewer's perspective. */
export function counterpartyLabel(offer: SellerOffer, role: OfferRole): string {
  return role === "received" ? (offer.buyer_name ?? "B2B Buyer") : "Seller";
}

/** Human-readable date, e.g. "Mar 5, 2026". */
export function formatOfferDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

/** Whether this role can take a primary action on the offer right now. */
export function isOfferActionable(offer: SellerOffer, role: OfferRole): boolean {
  return role === "received" ? offer.status === "pending" : offer.status === "accepted";
}

/** Short call-to-action hint shown on an offer card. */
export function offerCardHint(offer: SellerOffer, role: OfferRole): string {
  if (role === "received") return offer.status === "pending" ? "Respond →" : "View →";
  return offer.status === "accepted" ? "Complete →" : "View →";
}

/** How many offers are still awaiting a response. */
export function pendingOfferCount(offers: SellerOffer[]): number {
  return offers.filter((offer) => offer.status === "pending").length;
}

/** Tailwind text-colour class for a positive (green) or negative (red) delta. */
export function priceDeltaClass(deltaPercent: number): string {
  return deltaPercent >= 0 ? "text-grade-a" : "text-chart-4";
}

/** Offer price vs the listed price as a percentage, or null when unknown. */
export function priceDeltaPercent(offerPrice: number, listedPrice: number | null | undefined): number | null {
  if (!listedPrice || listedPrice <= 0) return null;
  return ((offerPrice - listedPrice) / listedPrice) * 100;
}
