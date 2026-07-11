// ---------------------------------------------------------------------------
// Buyer Offers
// ---------------------------------------------------------------------------

export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "countered";

/** Which side of an offer the current user is viewing it from.
 *  `received` = a seller managing offers on their listings;
 *  `placed`   = a buyer tracking offers they submitted. */
export type OfferRole = "received" | "placed";

// Field names are snake_case to match the API response verbatim
// (Dart models serialize with field_rename: snake, and the fetch does no
// key mapping).
export interface BuyerOffer {
  id:                string;
  listing_id:        string;
  buyer_company_id:  string;
  offer_price:       number;
  quantity:          number;
  status:            OfferStatus;
  counter_price:     number | null;
  message:           string | null;
  expires_at:        string;
  created_at:        string;
  // Joined by GET /buyer/offers so the inbox shows the product, not a bare id.
  model_name?:       string | null;
  listed_price?:     number | null;
}

/** An offer as seen by the seller — additionally carries the buyer's company
 *  name (GET /seller/offers) so the inbox can show who made each offer. */
export interface SellerOffer extends BuyerOffer {
  buyer_name?:   string | null;
}
