/** Offer-feature constants: no magic strings/numbers in the View or ViewModel. */
import type { OfferRole, OfferStatus } from "../models/offer";

/** Full badge classes (text + border colour + tint) per status. */
export const OFFER_STATUS_BADGE: Record<OfferStatus, string> = {
  accepted:  "text-grade-a border-grade-a/35 bg-grade-a/10",
  countered: "text-amps-accent border-amps-accent/35 bg-amps-accent/10",
  expired:   "text-muted-foreground border-border",
  pending:   "text-grade-b border-grade-b/35 bg-grade-b/10",
  rejected:  "text-chart-4 border-chart-4/35 bg-chart-4/10",
};

/** Resolution copy shown when an offer can no longer be acted on. */
export const OFFER_STATUS_COPY: Record<OfferStatus, Record<OfferRole, string>> = {
  accepted:  { received: "Accepted — awaiting buyer payment.", placed: "Accepted! Complete your purchase to fund escrow." },
  countered: { received: "Counter sent — awaiting the buyer.", placed: "The seller countered your offer." },
  expired:   { received: "This offer has expired.",            placed: "This offer has expired." },
  pending:   { received: "Awaiting your response.",            placed: "Awaiting the seller's response." },
  rejected:  { received: "This offer was declined.",           placed: "This offer was declined by the seller." },
};

/** Text-colour class per status (badge icons, status glyphs). */
export const OFFER_STATUS_TEXT: Record<OfferStatus, string> = {
  accepted:  "text-grade-a",
  countered: "text-amps-accent",
  expired:   "text-muted-foreground",
  pending:   "text-grade-b",
  rejected:  "text-chart-4",
};
