-- Partner password-reset tokens + auto-increment partner code sequence.
--
-- partner_code_seq drives "GM-XXXX" partner identifiers so codes are unique
-- and generated without a DB round-trip race.
--
-- partner_reset_tokens mirrors the main-app refresh-token pattern:
--   1. POST /partner/auth/forgot-password  → insert row, email plaintext link
--   2. POST /partner/auth/reset-password   → consume row (set used_at), update hash

CREATE SEQUENCE IF NOT EXISTS partner_code_seq
    START  WITH 1000
    INCREMENT BY 1
    NO CYCLE;

CREATE TABLE partner_reset_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id  UUID        NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    -- 1-hour TTL is standard for password-reset flows
    expires_at  TIMESTAMPTZ NOT NULL,
    -- Set when the token is consumed so it cannot be replayed
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX partner_reset_tokens_partner_id_idx ON partner_reset_tokens(partner_id);
CREATE INDEX partner_reset_tokens_expires_at_idx ON partner_reset_tokens(expires_at);
