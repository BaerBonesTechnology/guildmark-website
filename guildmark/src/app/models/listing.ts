// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

import type { AssetType, ConditionGrade } from "./asset";

export type ValuationFlag =
  | "standard" | "seller_overpriced" | "distressed" | "insufficient_data";

export type ListingStatus =
  | "draft" | "active" | "sold" | "expired" | "withdrawn";

// Device-spec value sets (mirror the Appwrite enum columns on `assets`).
export type FunctionalStatus =
  | "fully_functional" | "functional_with_issues" | "for_parts";
export type DataWipeStatus = "not_wiped" | "wiped" | "certified";
export type WarrantyStatus = "none" | "active" | "expired";
export type StorageType = "ssd" | "nvme" | "hdd" | "emmc" | "other";

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
  // Listing photos (URLs). Empty/absent listings fall back to a placeholder;
  // the PLP card shows the first image, the PDP shows the full gallery.
  product_images?:        string[];
  // Joined from asset
  model_name?:            string;
  asset_type?:            AssetType;
  condition_grade?:       ConditionGrade;
  quantity?:              number;
  cpu_score?:             number | null;
  ram_gb?:                number | null;
  storage_gb?:            number | null;
  // Device-spec detail (joined from asset) — surfaced on the PLP/PDP.
  manufacturer?:          string;
  model_number?:          string;
  year_of_manufacture?:   number | null;
  functional_status?:     FunctionalStatus;
  known_defects?:         string;
  data_wipe_status?:      DataWipeStatus;
  warranty_status?:       WarrantyStatus;
  warranty_expiration?:   string | null;
  included_accessories?:  string;
  ships_from_location?:   string;
  cpu_model?:             string;
  cpu_cores?:             number | null;
  cpu_speed_ghz?:         number | null;
  ram_type?:              string;
  storage_type?:          StorageType;
  gpu_model?:             string;
  screen_size_in?:        number | null;
  screen_resolution?:     string;
  touchscreen?:           boolean;
  form_factor?:           string;
  power_supply_watts?:    number | null;
  panel_type?:            string;
  refresh_rate_hz?:       number | null;
  ports?:                 string;
  port_count?:            number | null;
  throughput?:            string;
  managed?:               boolean;
  carrier_locked?:        boolean;
}
