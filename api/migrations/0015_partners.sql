-- GuildMark Partner network.
--
-- Partners are third-party service companies that handle data sanitisation
-- (NIST 800-88 wipes), OS reimaging, and physical logistics for orders that
-- originate on the GuildMark marketplace.
--
-- Flow:
--   1. A buyer/seller order hits `funded` status in the `orders` table.
--   2. GuildMark (or an automated rule) publishes it to the partner workboard.
--   3. A partner claims the order  →  partner_service_assignments row created.
--   4. Partner works through the 4-step workflow and uploads evidence.
--   5. GuildMark approves and marks the assignment complete; payout accrues.
--
-- Auth uses the same httpOnly-cookie + short-lived JWT pattern as the main
-- guildmark app.  Partner tokens are prefixed "prt_" to distinguish them from
-- buyer/seller JWTs in logs.

-- ---------------------------------------------------------------------------
-- Partners
-- ---------------------------------------------------------------------------

CREATE TABLE partners (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name         TEXT        NOT NULL,
    email                CITEXT      NOT NULL UNIQUE,
    password_hash        TEXT        NOT NULL,
    -- Partner identifier shown in the dashboard (e.g. "GM-9421")
    partner_code         TEXT        NOT NULL UNIQUE,
    -- Service area
    service_radius_miles INT         NOT NULL DEFAULT 50,
    city                 TEXT,
    state                TEXT,
    -- Status — 'pending' until GuildMark approves the application
    status               TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'active', 'suspended')),
    -- Performance
    rating               NUMERIC(3,2) DEFAULT 5.00,
    total_jobs_completed INT          NOT NULL DEFAULT 0,
    -- Financials — running balance; positive = owed to partner
    available_balance    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    -- Square Customer ID for payouts
    square_customer_id   TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX partners_email_idx  ON partners(email);
CREATE INDEX partners_status_idx ON partners(status);

CREATE TRIGGER partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Partner refresh tokens  (same pattern as main app)
-- ---------------------------------------------------------------------------

CREATE TABLE partner_refresh_tokens (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id   UUID        NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    token_hash   TEXT        NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ NOT NULL,
    revoked_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX partner_refresh_tokens_partner_id_idx ON partner_refresh_tokens(partner_id);
CREATE INDEX partner_refresh_tokens_expires_at_idx ON partner_refresh_tokens(expires_at);

-- ---------------------------------------------------------------------------
-- Partner service assignments
-- ---------------------------------------------------------------------------

-- Services a partner provides for a given order.
-- One assignment per order (a partner takes the whole job).

CREATE TYPE partner_assignment_status AS ENUM (
    'available',            -- on the workboard; not yet claimed by any partner
    'claimed',              -- partner claimed the order; work not yet started
    'wipe_in_progress',     -- NIST 800-88 wipe running
    'wipe_complete',        -- wipe finished; awaiting reimage (if required)
    'reimage_in_progress',  -- OS reimaging running
    'reimage_complete',     -- reimage done; awaiting cert upload
    'awaiting_cert',        -- wipe/reimage done; cert not yet uploaded
    'cert_uploaded',        -- compliance cert uploaded; awaiting shipping
    'shipped',              -- device(s) handed to carrier
    'complete',             -- GuildMark confirmed receipt; payout queued
    'cancelled'             -- cancelled before completion
);

CREATE TABLE partner_service_assignments (
    id                   UUID                       PRIMARY KEY DEFAULT gen_random_uuid(),
    -- NULL when the assignment is still on the workboard (status = 'available').
    -- Set to the claiming partner's ID when they call the claim endpoint.
    partner_id           UUID                       REFERENCES partners(id) ON DELETE RESTRICT,
    -- Which marketplace order this assignment is for.
    -- NULL is allowed so the workboard can surface "synthetic" service requests
    -- before a buyer offer is accepted (future feature).
    order_id             UUID                       REFERENCES orders(id) ON DELETE RESTRICT,
    -- Human-readable reference (e.g. "ORD-7389") — denormalised for display
    order_ref            TEXT                       NOT NULL,
    -- Buyer company name — denormalised for display
    buyer_name           TEXT                       NOT NULL DEFAULT '',
    buyer_city           TEXT                       NOT NULL DEFAULT '',
    -- Service scope
    service_type         TEXT                       NOT NULL
                           CHECK (service_type IN ('wipe_only', 'wipe_and_reimage')),
    item_count           INT                        NOT NULL DEFAULT 1,
    -- Payout breakdown (in cents for precision; displayed as dollars)
    wipe_payout_cents    INT                        NOT NULL DEFAULT 0,
    reimage_payout_cents INT                        NOT NULL DEFAULT 0,
    -- Workflow evidence
    wipe_method          TEXT,                    -- e.g. "DoD 3-pass", "NIST Purge"
    reimage_os           TEXT,                    -- e.g. "Windows 11 22H2"
    cert_url             TEXT,                    -- uploaded compliance PDF
    tracking_number      TEXT,
    carrier              TEXT,
    -- Lifecycle
    status               partner_assignment_status NOT NULL DEFAULT 'available',
    claimed_at           TIMESTAMPTZ,
    completed_at         TIMESTAMPTZ,
    created_at           TIMESTAMPTZ               NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ               NOT NULL DEFAULT now()
);

CREATE INDEX psa_partner_id_idx ON partner_service_assignments(partner_id);
CREATE INDEX psa_order_id_idx   ON partner_service_assignments(order_id)
    WHERE order_id IS NOT NULL;
CREATE INDEX psa_status_idx     ON partner_service_assignments(status);

CREATE TRIGGER partner_service_assignments_updated_at
    BEFORE UPDATE ON partner_service_assignments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Partner payouts
-- ---------------------------------------------------------------------------

CREATE TABLE partner_payouts (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id           UUID        NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
    payout_ref           TEXT        NOT NULL UNIQUE,  -- e.g. "PO-0912"
    amount_cents         INT         NOT NULL CHECK (amount_cents > 0),
    method               TEXT        NOT NULL DEFAULT 'bank_transfer',
    status               TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'paid', 'failed')),
    paid_at              TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX partner_payouts_partner_id_idx ON partner_payouts(partner_id);

CREATE TRIGGER partner_payouts_updated_at
    BEFORE UPDATE ON partner_payouts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed: workboard demo rows  (visible without a real marketplace order)
-- ---------------------------------------------------------------------------
-- These rows let the partner portal show a realistic workboard immediately
-- after deploy.  service_type, payouts, buyer details mirror the Figma design.
-- They use a placeholder partner_id (nil UUID) — the claim endpoint will
-- replace them with real partners as they sign up.

INSERT INTO partner_service_assignments
    (order_ref, buyer_name, buyer_city, service_type,
     item_count, wipe_payout_cents, reimage_payout_cents, status)
VALUES
    ('ORD-7391', 'Acme Corp',    'San Francisco, CA', 'wipe_and_reimage', 45,  45000, 22500, 'available'),
    ('ORD-7392', 'Global Tech',  'San Jose, CA',      'wipe_only',        120, 120000, 0,    'available'),
    ('ORD-7395', 'Startup Inc',  'Oakland, CA',       'wipe_and_reimage', 15,  15000, 7500,  'available'),
    ('ORD-7398', 'Edu Systems',  'Palo Alto, CA',     'wipe_and_reimage', 60,  60000, 30000, 'available'),
    ('ORD-7401', 'Finance LLC',  'San Mateo, CA',     'wipe_only',        250, 250000, 0,    'available');
