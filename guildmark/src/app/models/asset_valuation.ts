export interface AssetValuation {
  id: string;
  asset_id: string;
  listing_id?: string;
  source: "listing" | "estimate" | "scheduled";
  model_name: string;
  asset_type: string;
  condition_grade: string;
  age_months: number;
  fair_market_value: number;
  confidence: number;
  model_version: string;
  listed_price?: number;
  price_to_fmv_ratio?: number;
  created_at: string;
}

export interface AssetValuationsResponse {
  asset_id: string;
  model_name: string;
  asset_type: string;
  count: number;
  valuations: AssetValuation[];
}
