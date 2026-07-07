-- Feature flag: Net 30/60 deferred payment terms.
--
-- OFF by default: GuildMark has no financing partners yet, so term-based
-- payment must not be purchasable in production. Order routes check this
-- flag server-side at order creation and reject net_30/net_60 while it is
-- false. Toggled from DevDash (Platform Pricing page).
--
-- Eligibility criteria (per-company approval, credit limits) are deliberately
-- deferred until a financing partner is in place — add columns here when that
-- lands.

ALTER TABLE platform_config
    ADD COLUMN payment_terms_enabled BOOLEAN NOT NULL DEFAULT false;
