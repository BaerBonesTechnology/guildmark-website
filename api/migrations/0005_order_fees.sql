-- Fee snapshot columns on orders.
--
-- All fee fields are locked at order creation time from the seller's
-- subscription plan at that moment. Plan changes do not affect existing orders.
--
-- escrow_amount = amount - seller_fee
--   This is what the seller will net when escrow releases. It is stored
--   as an accounting record; actual fee collection is handled separately
--   (buyer_fee via Square at checkout, seller_fee via GuildMark Wallet payout).

ALTER TABLE orders
    -- Seller-side fee (varies by subscription plan)
    ADD COLUMN seller_fee_pct   NUMERIC(5,4)  NOT NULL DEFAULT 0.0800,
    ADD COLUMN seller_fee       NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Buyer-side fee (flat 3% across all tiers)
    ADD COLUMN buyer_fee_pct    NUMERIC(5,4)  NOT NULL DEFAULT 0.0300,
    ADD COLUMN buyer_fee        NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Total platform revenue from this order
    ADD COLUMN platform_fee     NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Seller's net after platform deduction (amount - seller_fee)
    ADD COLUMN escrow_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Payment terms (Net 30/60 deferral)
    ADD COLUMN payment_terms    TEXT          NOT NULL DEFAULT 'immediate',
    ADD COLUMN deferral_fee_pct NUMERIC(5,4)  NOT NULL DEFAULT 0,
    ADD COLUMN deferral_fee     NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN payment_due_at   TIMESTAMPTZ;

ALTER TABLE orders
    ADD CONSTRAINT orders_payment_terms_check
        CHECK (payment_terms IN ('immediate', 'net_30', 'net_60'));
