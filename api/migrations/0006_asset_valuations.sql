-- Per-asset valuation history.
--
-- Every time a fair market value is computed by the ML service — whether via
-- listing creation or the standalone estimate endpoint — a row is written here.
-- This lets us track how each asset's listing price compares to market price
-- over time, across all listings that asset has ever appeared in.
--
-- price_to_fmv_ratio = listed_price / fair_market_value
--   > 1.0 → seller is asking above market
--   < 1.0 → seller is asking below market (distressed / quick sale)
--   NULL  → estimate-only call (no listing price at time of valuation)

CREATE TYPE valuation_source AS ENUM ('listing', 'estimate', 'scheduled');

CREATE TABLE asset_valuations (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id           UUID          NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    listing_id         UUID          REFERENCES listings(id) ON DELETE SET NULL,
    source             valuation_source NOT NULL DEFAULT 'estimate',

    -- Denormalised snapshot of the asset at valuation time so history is
    -- readable without joining back to assets (which may have changed).
    model_name         TEXT          NOT NULL,
    asset_type         TEXT          NOT NULL,
    condition_grade    TEXT          NOT NULL,
    age_months         INT           NOT NULL,

    -- ML output
    fair_market_value  NUMERIC(12,2) NOT NULL,
    confidence         NUMERIC(5,4)  NOT NULL,
    model_version      TEXT          NOT NULL,

    -- Listing context — NULL when source = 'estimate' or 'scheduled'
    listed_price       NUMERIC(12,2),
    price_to_fmv_ratio NUMERIC(8,4),

    created_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX asset_valuations_asset_id_idx
    ON asset_valuations(asset_id, created_at DESC);

CREATE INDEX asset_valuations_listing_id_idx
    ON asset_valuations(listing_id)
    WHERE listing_id IS NOT NULL;

-- Useful for market-wide queries: "what's the avg price_to_fmv_ratio for
-- laptops this month?" — feeds the DevDash market data dashboard.
CREATE INDEX asset_valuations_type_created_idx
    ON asset_valuations(asset_type, created_at DESC);
