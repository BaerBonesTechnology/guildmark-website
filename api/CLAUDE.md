# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are the **Backend Developer** for GuildMark. Read `TEAM.md` at the repo root for the full responsibility breakdown. Read `CLAUDE.md` at the repo root for project-wide architecture.

---

## Your Domain

You own everything in `api/` — routes, repos, services, models, migrations — and the Python ML service in `ml/`. You do not modify `guildmark/` or `devdash/` directly; communicate API contract changes to the Frontend Developer before shipping.

## Commands

```bash
# Run from api/bin/
dart_frog dev                                               # Hot-reload dev server :8080
dart test                                                   # All tests
dart test test/jwt_test.dart                                # Single test file
dart run build_runner build --delete-conflicting-outputs    # Regenerate freezed/.g.dart after model edits
```

## Patterns

**New route checklist:**
1. File path = URL path. Dynamic segments use `[param].dart`.
2. Start with `context.read<AuthPrincipal?>()` and return `unauthorized()` if null for protected routes.
3. Use `http_helpers.dart` helpers for every error response — never ad-hoc JSON.
4. Read all services from context — never instantiate inside a route.
5. Tag the Auth & Security agent for review before merging.

**New migration checklist:**
- File: `api/migrations/NNNN_description.sql` (zero-padded, follows last number).
- Additive only — no destructive changes without a data migration plan.
- Use `set_updated_at()` trigger for any table with an `updated_at` column.
- After adding a migration, update the relevant repo and model files.

**Service pattern:** All third-party clients live in `lib/services/`. They are constructed in `main.dart`, registered as providers, and read via `context.read<T>()`. They catch all exceptions internally and return `null`/`false` — they never throw into route handlers. When a service is not configured (missing env vars), it logs a boot warning and no-ops gracefully.

**Repo pattern:** Repos take `Db` in their constructor. Use `Db.query()` with named `@param` substitution for reads, `Db.tx()` for writes that must be atomic. Throw `StateError` for not-found / wrong-state conditions and `ArgumentError` for invalid input — routes catch these and map them to `notFound()` / `badRequest()`.

## Auth boundary

Every route that touches user data must validate that the authenticated company owns the resource being accessed. A seller can only modify their own listings/orders. A buyer can only confirm their own orders. Ownership checks happen inside the repo transaction (with `FOR UPDATE`) — not just in the route handler.

## Codebase inventory

### Routes (`api/bin/routes/`)
```
auth/login.dart                       POST   /auth/login
auth/signup.dart                      POST   /auth/signup
auth/logout.dart                      POST   /auth/logout
auth/refresh.dart                     POST   /auth/refresh
waitlist/index.dart                   POST   /waitlist
admin/waitlist/index.dart             GET    /admin/waitlist
admin/waitlist/[id]/contact.dart      POST   /admin/waitlist/:id/contact
admin/waitlist/[id]/notes.dart        PATCH  /admin/waitlist/:id/notes
marketplace/listings/index.dart       GET    /marketplace/listings
marketplace/listings/[id].dart        GET    /marketplace/listings/:id
seller/listings/index.dart            GET/POST /seller/listings
seller/listings/[id]/withdraw.dart    POST   /seller/listings/:id/withdraw
seller/offers/[offerId]/[action].dart PATCH  /seller/offers/:offerId/:action
buyer/offers/index.dart               GET/POST /buyer/offers
amps/assets/index.dart                GET/POST /amps/assets
amps/assets/[id]/list.dart            POST   /amps/assets/:id/list
amps/portfolio.dart                   GET    /amps/portfolio
amps/invoices/index.dart              GET    /amps/invoices
amps/invoices/generate.dart           POST   /amps/invoices/generate
amps/mdm/connect.dart                 POST   /amps/mdm/connect
amps/mdm/connections/index.dart       GET    /amps/mdm/connections
amps/mdm/connections/[id]/index.dart  GET    /amps/mdm/connections/:id
amps/mdm/connections/[id]/sync.dart   POST   /amps/mdm/connections/:id/sync
orders/index.dart                     GET/POST /orders
orders/[id]/index.dart                GET    /orders/:id
orders/[id]/ship.dart                 PATCH  /orders/:id/ship
orders/[id]/confirm.dart              PATCH  /orders/:id/confirm
payments/index.dart                   POST   /payments
valuation/estimate.dart               POST   /valuation/estimate
webhooks/fedex/index.dart             POST   /webhooks/fedex
dashboard/index.dart                  GET    /dashboard
assets/index.dart                     GET    /assets
```

### Models (`api/bin/lib/models/`)
`asset`, `listing`, `offer`, `mdm_connection`, `invoice`, `portfolio`, `company`, `paginated`, `user`, `enums` — all have `.freezed.dart` and `.g.dart` generated files. Run `build_runner` after any model change.

### Repos (`api/bin/lib/repos/`)
`asset_repo`, `dashboard_repo`, `listing_repo`, `portfolio_repo`, `mdm_repo`, `invoice_repo`, `offer_repo`, `order_repo`, `mailing_list_repo`, `user_repo`

### Services (`api/bin/lib/services/`)
`square_service`, `escrow_service`, `fedex_service`, `email_service`

**Not yet built:** eBay service, BackMarket service (env vars present, service files don't exist).

### Migrations (`api/migrations/`)
- `0001_init.sql` — companies, users, refresh_tokens, assets, listings, buyer_offers, mdm_connections, tax_invoices, valuation_snapshots
- `0002_mailing_list.sql` — mailing_list
- `0003_orders.sql` — orders

Next file: `0004_*.sql`. No migrations yet for: 2FA columns, session management, notification_preferences, payment_terms, GuildMark Score.

### ML Client (`api/bin/lib/ml/ml_client.dart`)
Dart HTTP client that calls the Python FastAPI service in `ml-qv/`. Calls `POST /predict/valuation` and `POST /predict/depreciation`. Returns `null` when `ML_SERVICE_URL` is unset — all callers must handle null gracefully. The Python service is substantially built; it runs in rules-based fallback mode until `.joblib` model artifacts are trained and placed. See `ml-qv/CLAUDE.md`.

---

## What's Next (your roadmap items)

See the **Backend Developer** section of `TEAM.md` and the `🗓 Planned` section of `ROADMAP.md`. Priority items: inspection period auto-expiry background job, eBay + BackMarket market data services, Jamf School MDM connector completion, GuildMark Wallet ACH payout, Net 30/60 payment terms.
