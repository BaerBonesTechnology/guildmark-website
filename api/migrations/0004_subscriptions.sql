-- AMPS subscription tiers.
-- Every company gets a row — free by default at signup.
-- The plan determines AMPS feature access, valuation refresh cadence,
-- and the seller-side marketplace fee applied at order creation.

CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'growth', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');

CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id              UUID                NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan                    subscription_plan   NOT NULL DEFAULT 'free',
    status                  subscription_status NOT NULL DEFAULT 'active',
    -- Square Subscriptions API identifier — null for the free tier.
    square_subscription_id  TEXT,
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (company_id)     -- one active subscription per company
);

CREATE INDEX subscriptions_plan_idx   ON subscriptions(plan);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seller-side fee by plan (reference comment — enforced in application layer):
--   free    → 8.00%
--   starter → 6.00%
--   growth  → 5.00%
--   pro     → 3.00%
-- Buyer-side fee is always 3.00%, flat across all tiers.
-- Net 30/60 deferral fee is always 1.30%, charged to buyer at order creation.
