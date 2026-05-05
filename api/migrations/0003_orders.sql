-- Orders — created when a buyer offer is accepted.
-- Each order has an Escrow.com transaction to hold funds during transit,
-- and a FedEx tracking number that triggers automatic escrow release on delivery.

CREATE TYPE order_status AS ENUM (
  'awaiting_payment',  -- escrow transaction created; buyer must fund
  'funded',            -- escrow funded by buyer; waiting for seller to ship
  'shipped',           -- seller has provided tracking number
  'delivered',         -- FedEx confirmed delivery; inspection period active
  'inspecting',        -- delivery confirmed; buyer reviewing before release
  'complete',          -- buyer accepted delivery; funds released to seller
  'disputed',          -- dispute raised; manual review required
  'cancelled'          -- order cancelled before shipment
);

CREATE TABLE orders (
  id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id               UUID          NOT NULL REFERENCES buyer_offers(id) ON DELETE RESTRICT,
  seller_company_id      UUID          NOT NULL REFERENCES companies(id)    ON DELETE RESTRICT,
  buyer_company_id       UUID          NOT NULL REFERENCES companies(id)    ON DELETE RESTRICT,

  -- Financials — snapshot from the offer at the moment the order is created
  amount                 NUMERIC(12,2) NOT NULL,
  quantity               INT           NOT NULL CHECK (quantity > 0),

  -- Escrow.com integration
  escrow_transaction_id  TEXT,
  escrow_status          TEXT,
  escrow_payment_url     TEXT,   -- URL for buyer to fund the escrow

  -- Shipping / FedEx tracking
  carrier                TEXT          NOT NULL DEFAULT 'fedex',
  tracking_number        TEXT,
  shipped_at             TIMESTAMPTZ,
  delivered_at           TIMESTAMPTZ,
  inspection_ends_at     TIMESTAMPTZ,  -- set on delivery; funds auto-release after

  -- Lifecycle
  status                 order_status  NOT NULL DEFAULT 'awaiting_payment',
  completed_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- One order per accepted offer
  UNIQUE (offer_id)
);

CREATE INDEX orders_seller_company_id_idx  ON orders(seller_company_id);
CREATE INDEX orders_buyer_company_id_idx   ON orders(buyer_company_id);
CREATE INDEX orders_status_idx             ON orders(status);
-- Sparse index — only rows that have a tracking number are searchable.
CREATE INDEX orders_tracking_number_idx    ON orders(tracking_number)
  WHERE tracking_number IS NOT NULL;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
