// ---------------------------------------------------------------------------
// Buyer Offers
// ---------------------------------------------------------------------------

export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "countered";

export interface BuyerOffer {
  id:              string;
  listingId:       string;
  buyerCompanyId:  string;
  offerPrice:      number;
  quantity:        number;
  status:          OfferStatus;
  counterPrice:    number | null;
  message:         string | null;
  expiresAt:       string;
  createdAt:       string;
}
