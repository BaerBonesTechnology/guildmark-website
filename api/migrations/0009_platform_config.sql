-- Platform-wide fee configuration.
--
-- A single row (id = 1) owned by the admin. Rates are read at order-creation
-- time and snapshotted onto the order (existing orders are never affected by
-- later config changes).
--
-- Seller fees vary by subscription plan; buyer fee and deferral fee are flat.
-- Defaults match the values documented in 0004_subscriptions.sql.

CREATE TABLE platform_config (
    id                  INT  PRIMARY KEY DEFAULT 1,
    CONSTRAINT single_row CHECK (id = 1),

    -- Seller-side fees by subscription plan
    seller_fee_free     NUMERIC(5,4) NOT NULL DEFAULT 0.0800,
    seller_fee_starter  NUMERIC(5,4) NOT NULL DEFAULT 0.0600,
    seller_fee_growth   NUMERIC(5,4) NOT NULL DEFAULT 0.0500,
    seller_fee_pro      NUMERIC(5,4) NOT NULL DEFAULT 0.0300,

    -- Buyer-side flat fee (applied at checkout)
    buyer_fee           NUMERIC(5,4) NOT NULL DEFAULT 0.0300,

    -- Net-30 / Net-60 deferral fee (charged to buyer)
    deferral_fee        NUMERIC(5,4) NOT NULL DEFAULT 0.0130,

    -- Add-on service pricing (USD per unit)
    data_wipe_price     NUMERIC(8,2) NOT NULL DEFAULT 8.00,

    -- Audit trail
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by          TEXT         -- email of the admin who last saved

);

-- Seed the single config row with defaults
INSERT INTO platform_config (id) VALUES (1);
