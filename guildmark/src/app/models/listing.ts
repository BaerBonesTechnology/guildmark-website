// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

import type { AssetType, ConditionGrade } from "./asset";

export type ValuationFlag =
  | "standard" | "seller_overpriced" | "distressed" | "insufficient_data";

export type ListingStatus =
  | "draft" | "active" | "sold" | "expired" | "withdrawn";

export interface Listing {
  id:                     string;
  asset_id:               string;
  company_id:             string;
  listed_price:           number | null;
  seller_offer_price:     number | null;
  buyer_ask_price:        number | null;
  gross_margin:           number | null;
  consumer_market_anchor: number | null;
  fair_market_value:      number | null;
  est_book_value:         number | null;
  seller_recovery_ratio:  number | null;
  depreciation_pct:       number | null;
  age_months:             number | null;
  valuation_flag:         ValuationFlag;
  status:                 ListingStatus;
  last_valued_at:         string | null;
  created_at:             string;
  // Joined from asset
  model_name?:            string;
  asset_type?:            AssetType;
  condition_grade?:       ConditionGrade;
  quantity?:              number;
  cpu_score?:             number | null;
  ram_gb?:                number | null;
  storage_gb?:            number | null;
}
