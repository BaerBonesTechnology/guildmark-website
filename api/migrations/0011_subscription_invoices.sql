-- Subscription billing history.
-- One row per charge attempt against a subscription plan.
-- Tracks Square payment IDs, amounts, and receipt URLs for
-- display in the billing history panel of the AMPS Settings page.

CREATE TABLE subscription_invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID                NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id     UUID                NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    square_payment_id   TEXT                NOT NULL,
    plan                subscription_plan   NOT NULL,
    amount_cents        INT                 NOT NULL,
    currency            CHAR(3)             NOT NULL DEFAULT 'USD',
    status              TEXT                NOT NULL DEFAULT 'paid',  -- paid | refunded | failed
    receipt_url         TEXT,
    period_start        TIMESTAMPTZ         NOT NULL,
    period_end          TIMESTAMPTZ         NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sub_invoices_company_idx ON subscription_invoices(company_id, created_at DESC);
CREATE INDEX sub_invoices_sub_idx     ON subscription_invoices(subscription_id);
