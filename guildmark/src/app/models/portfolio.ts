// ---------------------------------------------------------------------------
// AMPS Portfolio
// ---------------------------------------------------------------------------

export interface ValuationSnapshot {
  snapshot_date:         string;
  total_portfolio_value: number;
  total_book_value:      number;
  total_depreciation:    number;
  total_devices:         number;
}

export interface PortfolioSummary {
  total_devices:         number;
  total_portfolio_value: number;
  total_book_value:      number;
  total_depreciation:    number;
  depreciation_pct:      number;
  avg_asset_age_months:  number;
  assets_at_risk:        number;
  by_type:               Record<string, { count: number; value: number }>;
  by_condition:          Record<string, { count: number; value: number }>;
  trend:                 ValuationSnapshot[];
}
