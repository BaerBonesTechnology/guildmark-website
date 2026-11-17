/** Contract for the read-only, company-scoped AMPS guided assistant. */
export type AssistantIntent = "portfolio_summary" | "value_assets" | "listing_previews";

export interface AssistantAsset {
  asset_id: string;
  model_name: string;
  asset_type: string;
  condition_grade: string;
  quantity: number;
  purchase_date: string | null;
  cpu_score: number | null;
  ram_gb: number | null;
  storage_gb: number | null;
}

export interface AssistantResult {
  asset_id: string;
  model_name: string;
  quantity: number;
  status: "estimated" | "missing_data" | "unavailable";
  missing_fields: string[];
  fair_market_value_per_unit: number | null;
  total_value: number | null;
  confidence: number | null;
  model_version: string | null;
  valuation_basis: "unknown";
  listing_preview?: {
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_value: number;
    status: "preview_only";
  };
}

export interface AssistantResponse {
  mode: "guided";
  intent: AssistantIntent;
  message: string;
  as_of: string;
  assets: AssistantAsset[];
  results: AssistantResult[];
  totals: { estimated_value: number; estimated_units: number; unestimated_units: number };
  warnings: string[];
  portfolio?: { asset_records: number; shown_records: number; shown_units: number; truncated: boolean };
}
