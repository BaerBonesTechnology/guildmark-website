-- Password reset token table.
-- Flow: POST /auth/forgot-password → inserts row + emails link
--       POST /auth/reset-password  → validates token, hashes + writes new password, marks used

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,  -- SHA-256 of the plaintext token sent via email
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,                  -- NULL until redeemed; each token is single-use
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON password_reset_tokens(expires_at);
