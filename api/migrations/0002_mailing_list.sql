-- GuildMark pre-launch mailing list
-- Stores waitlist signups from the pre-launch hero page.
-- Emails are stored as citext (case-insensitive) and deduplicated via UNIQUE.

CREATE TABLE IF NOT EXISTS mailing_list (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email        CITEXT      NOT NULL UNIQUE,
    source       TEXT        NOT NULL DEFAULT 'waitlist',  -- e.g. 'waitlist', 'footer', 'admin'
    notes        TEXT,                                     -- optional admin notes
    contacted_at TIMESTAMPTZ,                              -- null = never contacted
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX mailing_list_created_at_idx ON mailing_list(created_at DESC);
CREATE INDEX mailing_list_contacted_at_idx ON mailing_list(contacted_at);
