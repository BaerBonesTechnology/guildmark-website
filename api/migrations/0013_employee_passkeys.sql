-- Passkey (WebAuthn) 2FA for DevDash employees.
--
-- Replaces IP-allowlisting as the second factor after password authentication.
-- Each employee may have multiple passkeys (e.g. laptop + phone).
-- Only ES256 / P-256 keys are stored; other algorithms are rejected at
-- registration time.
--
-- Flow:
--   1. POST /admin/auth → password check passes →
--        if passkeys exist: return challenge_id + challenge + allowCredentials
--        if no passkeys:    return setup_token (limited JWT) + requires_passkey_setup
--   2a. POST /admin/passkey/auth/complete → verify assertion → issue full JWT
--   2b. POST /admin/passkey/register/begin  (setup_token required) → return challenge
--       POST /admin/passkey/register/complete → verify + store → issue full JWT

-- ---------------------------------------------------------------------------
-- Stored credentials
-- ---------------------------------------------------------------------------

CREATE TABLE employee_passkeys (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID         NOT NULL REFERENCES guildmark_employees(id) ON DELETE CASCADE,
    -- base64url-encoded credential ID as returned by navigator.credentials.create()
    credential_id   TEXT         NOT NULL UNIQUE,
    -- ECDSA P-256 public key coordinates (base64url, 32 bytes each)
    public_key_x    TEXT         NOT NULL,
    public_key_y    TEXT         NOT NULL,
    -- Monotonically increasing counter — used to detect cloned authenticators.
    -- Stored as BIGINT because the WebAuthn spec allows 32-bit unsigned values.
    sign_count      BIGINT       NOT NULL DEFAULT 0,
    -- Authenticator AAGUID (base64url). Identifies the device model.
    aaguid          TEXT,
    -- Human-readable label the employee gave this key (e.g. "Work MacBook").
    friendly_name   TEXT         NOT NULL DEFAULT 'Passkey',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_used_at    TIMESTAMPTZ
);

CREATE INDEX passkeys_employee_id_idx ON employee_passkeys(employee_id);

-- ---------------------------------------------------------------------------
-- One-time challenges (registration and authentication)
-- ---------------------------------------------------------------------------

CREATE TABLE employee_passkey_challenges (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Null during authentication before we know which employee is logging in.
    -- Populated at registration time and can be used to confirm the right employee.
    employee_id     UUID    REFERENCES guildmark_employees(id) ON DELETE CASCADE,
    -- Random bytes as base64url (32 bytes = 256 bits of entropy).
    challenge       TEXT    NOT NULL,
    -- 'registration' | 'authentication'
    type            TEXT    NOT NULL CHECK (type IN ('registration', 'authentication')),
    -- Short TTL — challenges are single-use; consumed on complete.
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '5 minutes'
);

CREATE INDEX challenges_expires_idx ON employee_passkey_challenges(expires_at);
