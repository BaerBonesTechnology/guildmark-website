-- AsTech initial schema
-- Mirrors src/app/lib/types.ts in the frontend so payloads serialize 1:1.
-- Naming: snake_case columns, UUID primary keys, timestamptz throughout.

CREATE EXTENSION IF NOT EXISTS pgcrypto;     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;       -- case-insensitive emails

-- ---------------------------------------------------------------------------
-- Companies & users
-- ---------------------------------------------------------------------------

CREATE TABLE companies (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT        NOT NULL,
    size_band    TEXT,                                  -- e.g. "1-50", "51-200"
    industry     TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email           CITEXT      NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    full_name       TEXT        NOT NULL,
    role            user_role   NOT NULL DEFAULT 'member',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE email_verification_tokens (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   TEXT        NOT NULL UNIQUE,
    used_at      TIMESTAMPTZ,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX evt_user_id_idx ON email_verification_tokens(user_id);

CREATE TABLE user_totp (
    user_id      UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    secret_cipher BYTEA     NOT NULL,
    secret_nonce  BYTEA     NOT NULL,
    enabled       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
);

CREATE TABLE totp_backup_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash   TEXT NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX users_company_id_idx ON users(company_id);

-- Refresh tokens — opaque, server-side validated. Access tokens are JWT.
CREATE TABLE refresh_tokens (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   TEXT        NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ NOT NULL,
    revoked_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens(user_id);
CREATE INDEX refresh_tokens_expires_at_idx ON refresh_tokens(expires_at);

-- ---------------------------------------------------------------------------
-- Assets
-- ---------------------------------------------------------------------------

CREATE TYPE asset_type      AS ENUM (
    'laptop', 'desktop', 'server', 'phone',
    'tablet', 'networking', 'monitor', 'software', 'license', 'other'
);
CREATE TYPE condition_grade AS ENUM ('A', 'B', 'C');
CREATE TYPE mdm_source      AS ENUM ('manual', 'jamf_pro', 'jamf_school', 'intune');

CREATE TABLE assets (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id               UUID            NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    mdm_source               mdm_source      NOT NULL DEFAULT 'manual',
    serial_number            TEXT,
    model_name               TEXT            NOT NULL,
    asset_type               asset_type      NOT NULL,
    condition_grade          condition_grade NOT NULL DEFAULT 'B',
    quantity                 INT             NOT NULL DEFAULT 1 CHECK (quantity > 0),
    reason_for_offload       TEXT,
    purchase_date            DATE,
    original_purchase_price  NUMERIC(12, 2),
    -- MDM-derived
    os_version               TEXT,
    battery_health_pct       NUMERIC(5, 2),
    battery_cycles           INT,
    compliance_state         TEXT,
    assigned_user            TEXT,
    department               TEXT,
    cost_center              TEXT,
    last_mdm_sync            TIMESTAMPTZ,
    -- Spec metadata (sourced from MDM where available; manual otherwise)
    cpu_score                NUMERIC(8, 2),
    ram_gb                   INT,
    storage_gb               INT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (company_id, mdm_source, serial_number)
);

CREATE INDEX assets_company_id_idx       ON assets(company_id);
CREATE INDEX assets_asset_type_idx       ON assets(asset_type);
CREATE INDEX assets_condition_grade_idx  ON assets(condition_grade);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------

CREATE TYPE valuation_flag AS ENUM (
    'standard', 'seller_overpriced', 'distressed', 'insufficient_data'
);
CREATE TYPE listing_status AS ENUM (
    'draft', 'active', 'sold', 'expired', 'withdrawn'
);

CREATE TABLE listings (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id                 UUID            NOT NULL REFERENCES assets(id)    ON DELETE CASCADE,
    company_id               UUID            NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    listed_price             NUMERIC(12, 2),
    seller_offer_price       NUMERIC(12, 2),
    buyer_ask_price          NUMERIC(12, 2),
    gross_margin             NUMERIC(12, 2),
    consumer_market_anchor   NUMERIC(12, 2),
    fair_market_value        NUMERIC(12, 2),
    est_book_value           NUMERIC(12, 2),
    seller_recovery_ratio    NUMERIC(6, 4),
    depreciation_pct         NUMERIC(6, 4),
    age_months               INT,
    valuation_flag           valuation_flag NOT NULL DEFAULT 'standard',
    status                   listing_status NOT NULL DEFAULT 'draft',
    last_valued_at           TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX listings_company_id_idx ON listings(company_id);
CREATE INDEX listings_asset_id_idx   ON listings(asset_id);
CREATE INDEX listings_status_idx     ON listings(status);

-- ---------------------------------------------------------------------------
-- Buyer offers
-- ---------------------------------------------------------------------------

CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'countered');

CREATE TABLE buyer_offers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id        UUID         NOT NULL REFERENCES listings(id)  ON DELETE CASCADE,
    buyer_company_id  UUID         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    offer_price       NUMERIC(12, 2) NOT NULL,
    quantity          INT          NOT NULL CHECK (quantity > 0),
    status            offer_status NOT NULL DEFAULT 'pending',
    counter_price     NUMERIC(12, 2),
    message           TEXT,
    expires_at        TIMESTAMPTZ  NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX buyer_offers_listing_id_idx        ON buyer_offers(listing_id);
CREATE INDEX buyer_offers_buyer_company_id_idx  ON buyer_offers(buyer_company_id);
CREATE INDEX buyer_offers_status_idx            ON buyer_offers(status);

-- ---------------------------------------------------------------------------
-- MDM connections (credentials encrypted at app layer)
-- ---------------------------------------------------------------------------

CREATE TYPE mdm_type        AS ENUM ('jamf_pro', 'jamf_school', 'intune');
CREATE TYPE mdm_sync_status AS ENUM ('success', 'partial', 'failed');

CREATE TABLE mdm_connections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID            NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    mdm_type            mdm_type        NOT NULL,
    sync_enabled        BOOLEAN         NOT NULL DEFAULT TRUE,
    -- AES-GCM encrypted blob; key in env var, never plaintext at rest.
    credentials_cipher  BYTEA           NOT NULL,
    credentials_nonce   BYTEA           NOT NULL,
    last_sync_at        TIMESTAMPTZ,
    last_sync_status    mdm_sync_status,
    last_sync_error     TEXT,
    device_count        INT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (company_id, mdm_type)
);

-- ---------------------------------------------------------------------------
-- Tax invoices
-- ---------------------------------------------------------------------------

CREATE TYPE invoice_type AS ENUM ('disposal', 'loss', 'sale', 'donation');

CREATE TABLE tax_invoices (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id                  UUID            NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    asset_id                    UUID            REFERENCES assets(id) ON DELETE SET NULL,
    invoice_number              TEXT            NOT NULL UNIQUE,
    invoice_type                invoice_type    NOT NULL,
    invoice_date                DATE            NOT NULL,
    asset_description           TEXT            NOT NULL,
    serial_number               TEXT,
    original_cost               NUMERIC(12, 2),
    book_value_at_disposal      NUMERIC(12, 2),
    market_value_at_disposal    NUMERIC(12, 2) NOT NULL,
    write_off_amount            NUMERIC(12, 2) NOT NULL,
    market_anchor_ebay          NUMERIC(12, 2),
    pdf_storage_path            TEXT,
    generated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tax_invoices_company_id_idx ON tax_invoices(company_id);
CREATE INDEX tax_invoices_asset_id_idx   ON tax_invoices(asset_id);

-- ---------------------------------------------------------------------------
-- Portfolio valuation snapshots (nightly job writes one row per company)
-- ---------------------------------------------------------------------------

CREATE TABLE valuation_snapshots (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id             UUID         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    snapshot_date          DATE         NOT NULL,
    total_portfolio_value  NUMERIC(14, 2) NOT NULL,
    total_book_value       NUMERIC(14, 2) NOT NULL,
    total_depreciation     NUMERIC(14, 2) NOT NULL,
    total_devices          INT          NOT NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (company_id, snapshot_date)
);

CREATE INDEX valuation_snapshots_company_date_idx
    ON valuation_snapshots(company_id, snapshot_date DESC);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at        BEFORE UPDATE ON companies        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER users_updated_at            BEFORE UPDATE ON users            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER assets_updated_at           BEFORE UPDATE ON assets           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER listings_updated_at         BEFORE UPDATE ON listings         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER buyer_offers_updated_at     BEFORE UPDATE ON buyer_offers     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER mdm_connections_updated_at  BEFORE UPDATE ON mdm_connections  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
