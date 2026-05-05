// ---------------------------------------------------------------------------
// Valuation (ML inference passthrough)
// ---------------------------------------------------------------------------

import type { AssetType, ConditionGrade } from "./asset";

export interface ValuationEstimateRequest {
  asset_type:       AssetType;
  model_name:       string;
  condition_grade:  ConditionGrade;
  age_months:       number;
  cpu_score:        number | null;
  ram_gb:           number | null;
  storage_gb:       number | null;
  original_price:   number | null;
}

export interface ValuationEstimateResponse {
  fair_market_value: number;
  confidence:        number;
  model_version:     string;
}
