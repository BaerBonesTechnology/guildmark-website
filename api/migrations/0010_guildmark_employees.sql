-- GuildMark internal employee accounts for DevDash access.
--
-- Separate from the customer `users` table — employees authenticate
-- through /admin/auth and receive JWTs with role = 'devdash:<role>'.
-- The admin_auth_user/admin_auth_pass env-var single-account fallback
-- remains as an emergency escape hatch until at least one employee row exists.

CREATE TYPE employee_role AS ENUM (
    'superadmin',   -- full access: all DevDash sections + employee management
    'engineer',     -- analytics, users, config
    'support',      -- users, mailing list
    'marketing'     -- mailing list, partners, analytics (read-only)
);

CREATE TABLE guildmark_employees (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         CITEXT       NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    full_name     TEXT         NOT NULL,
    role          employee_role NOT NULL DEFAULT 'support',
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX employees_email_idx ON guildmark_employees(email);

CREATE TRIGGER employees_updated_at
    BEFORE UPDATE ON guildmark_employees
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Employee group tables (for team management — DevDash Team section)
CREATE TABLE employee_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employee_group_members (
    group_id    UUID NOT NULL REFERENCES employee_groups(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES guildmark_employees(id) ON DELETE CASCADE,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (group_id, employee_id)
);

-- Pending invites
CREATE TABLE employee_invites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       CITEXT      NOT NULL,
    role        employee_role NOT NULL DEFAULT 'support',
    invited_by  UUID        REFERENCES guildmark_employees(id) ON DELETE SET NULL,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
    accepted_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
