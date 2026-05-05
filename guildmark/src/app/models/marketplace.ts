// ---------------------------------------------------------------------------
// Marketplace
// ---------------------------------------------------------------------------

import type { Listing } from "./listing";

export interface MarketplaceListing extends Listing {
  seller_industry?:   string;
  seller_size_band?:  string;
}

export interface BuyerOffer {
  id:               string;
  listing_id:       string;
  buyer_company_id: string;
  offer_price:      number;
  quantity:         number;
  status:           "pending" | "accepted" | "rejected" | "expired" | "countered";
  expires_at:       string;
  created_at:       string;
}
