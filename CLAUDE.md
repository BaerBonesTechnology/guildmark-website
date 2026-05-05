# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Team & Role System

Before starting work, read `TEAM.md`. Every agent operates in a specific role. Check which files you own and which roadmap items are yours — don't modify files owned by another role without a clear cross-role reason. `ROADMAP.md` is the source of truth for what's planned and what's done.

---

## Repo Structure

```
/
├── api/                    # Dart Frog HTTP API (backend)
│   ├── bin/
│   │   ├── main.dart       # Entry point — DI wiring for all singletons
│   │   ├── routes/         # File-system routing (path = URL)
│   │   ├── lib/
│   │   │   ├── auth/       # JWT issuance + verification
│   │   │   ├── config.dart # All env var loading — fail-loud on missing required
│   │   │   ├── context.dart# AuthPrincipal — attach via middleware, read in routes
│   │   │   ├── db/         # pool.dart (Db singleton), migrations.dart
│   │   │   ├── http_helpers.dart  # jsonError, badRequest, notFound, etc.
│   │   │   ├── models/     # Freezed + json_serializable models (.freezed.dart, .g.dart)
│   │   │   ├── repos/      # All DB queries — one file per domain
│   │   │   └── services/   # Third-party clients (Escrow, FedEx, Square, Resend, Email)
│   │   └── pubspec.yaml
│   └── migrations/         # *.sql files applied in lexicographic order on boot
├── guildmark/              # Marketplace React frontend (pnpm)
│   └── src/app/
│       ├── models/         # One TypeScript file per domain (auth, asset, order, etc.)
│       ├── hooks/          # React Query hooks — all data fetching lives here
│       ├── lib/
│       │   ├── api.ts      # Axios/fetch wrapper with token injection
│       │   ├── apiHooks.ts # Shared React Query hooks used across pages
│       │   └── types.ts    # Barrel re-export from models/ — kept for compat
│       ├── pages/          # Route-level components
│       └── routes.tsx      # React Router config with ProtectedRoute
├── devdash/                # Admin panel React frontend (pnpm)
├── ml-qv/                  # Python ML service (FastAPI) — optional Docker profile
├── docker-compose.yml      # Orchestrates all four services
├── start.sh / start.cmd    # Convenience launchers (see Modes below)
├── .env                    # Single source of truth for all secrets
├── ROADMAP.md
└── TEAM.md
```

---

## Commands

### Full stack (Docker)
```bash
./start.sh              # All services in Docker (postgres, api, guildmark, devdash)
./start.sh --dev        # DB in Docker; api + frontends run locally with hot reload
./start.sh --db-only    # Postgres only
./start.sh --build      # Force rebuild images then start
./start.sh --ml         # Include optional ML service
./start.sh --down       # Stop everything
start.cmd               # Windows equivalent — same flags
```

### API (Dart — run from api/bin/)
```bash
dart_frog dev                                  # Hot-reload dev server on :8080
dart run build_runner build --delete-conflicting-outputs  # Re-gen freezed + g.dart after model changes
dart test                                      # All tests
dart test test/jwt_test.dart                   # Single test file
```

### Frontends (run from guildmark/ or devdash/)
```bash
pnpm dev                # Vite dev server
pnpm build              # Production build
```

### Database
```bash
# Migrations run automatically on API boot — no manual step needed.
# To add a migration, create api/migrations/NNNN_description.sql
# Files are applied in lexicographic order; use zero-padded numbering.
```

---

## API Architecture

### Dependency injection
`main.dart` constructs all singletons (`AppConfig`, `Db`, `JwtService`, `SquareService`, `EmailService`, `EscrowService`, `FedexService`, `MlClient?`) and registers them via Dart Frog's `.use(provider<T>(...))`. Routes access them with `context.read<T>()`. Never instantiate services inside a route — always read from context.

### Auth flow
`routes/_middleware.dart` runs on every request. It extracts the `Bearer` token, calls `JwtService.verifyAccessToken()`, and provides `AuthPrincipal?` to the context. Routes that require auth call `context.read<AuthPrincipal?>()` and return `unauthorized()` on null. Optional-auth routes (public marketplace) just skip the null check.

### Adding a new route
1. Create the file at the path matching the URL (e.g. `routes/orders/[id]/ship.dart` → `PATCH /orders/:id/ship`).
2. Read auth: `final auth = context.read<AuthPrincipal?>();`
3. Use `http_helpers.dart` for all error responses — never return raw `Response` with ad-hoc JSON.
4. Read services from context; never construct them in the route.
5. No new route ships without Auth & Security review.

### Database patterns
`Db.query()` takes named SQL with `@param` substitution — never string interpolation. Mutations that need consistency use `Db.tx()`. Repos are plain classes that take `Db` in their constructor. Models that need JSON serialization use `freezed` + `json_serializable` (run `build_runner` after changes). New models that don't need serialization use plain Dart classes like `MailingListEntry`.

### Error shapes
All errors return `{ "code": "SCREAMING_SNAKE", "error": "human message" }`. Use the helpers in `http_helpers.dart`. Use `notImplemented()` instead of fake 200s for routes whose integrations aren't wired yet.

### Password encoding in DATABASE_URL
Passwords containing `:` or `@` must be percent-encoded in `DATABASE_URL` (e.g. `@` → `%40`). `pool.dart` calls `Uri.decodeComponent()` on both halves of `userInfo` to restore them correctly.

---

## Frontend Architecture

### Data fetching
All server state goes through React Query. Hooks live in `src/app/hooks/` (one per domain) or `src/app/lib/apiHooks.ts` (shared). Page components call hooks — no raw `fetch` in components.

### Type system
Types are split into `src/app/models/` — one file per domain (`asset.ts`, `order.ts`, etc.). `src/app/lib/types.ts` is a barrel re-export kept for backward compatibility. New imports should point to the specific model file, not `types.ts`.

### Routing
`routes.tsx` uses `ProtectedRoute` for authenticated pages. The `VITE_IS_LAUNCH` env var gates the pre-launch / full-app switch — `true` shows only the waitlist landing page.

---

## Key Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Full postgres URI including credentials |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | ✅ | Different secrets |
| `SQUARE_ACCESS_TOKEN` / `SQUARE_LOCATION_ID` | ✅ | Sandbox keys work locally |
| `RESEND_API_KEY` | optional | Emails skipped when absent |
| `ESCROW_API_KEY` + `ESCROW_EMAIL` | optional | Escrow steps skipped when absent |
| `FEDEX_CLIENT_ID` + `FEDEX_CLIENT_SECRET` | optional | Tracking disabled when absent |
| `FEDEX_WEBHOOK_SECRET` | optional | Webhook HMAC verification skipped when absent |
| `ML_SERVICE_URL` | optional | Valuation endpoints return 503 when absent |

Copy `.env.example` to `.env` and fill in values. The API fails loud on startup for any missing *required* variable.

---

## Third-Party Integrations

| Service | Files | Notes |
|---|---|---|
| Escrow.com | `lib/services/escrow_service.dart` | Sandbox: `ESCROW_ENVIRONMENT=sandbox` |
| FedEx Track | `lib/services/fedex_service.dart` | OAuth token cached in-memory; sandbox via `FEDEX_ENVIRONMENT=sandbox` |
| Resend | `lib/services/email_service.dart` | From address: `noreply@guildmark.co` |
| Square | `lib/services/square_service.dart` | Sandbox by default |
| ML service (ml-qv) | `lib/ml/ml_client.dart` | HTTP to Python FastAPI in `ml-qv/`; nullable — callers must handle null |

---

## Order Lifecycle

```
awaiting_payment → funded → shipped → delivered → inspecting → complete
                                                              ↘ disputed
                  ↘ cancelled (before shipment)
```

- `POST /orders` creates the order + Escrow.com transaction; buyer gets funding email.
- `PATCH /orders/:id/ship` attaches tracking number; status → `shipped`.
- `POST /webhooks/fedex` fires on FedEx DL event → calls `escrow.markReceived()` → status `delivered`.
- `PATCH /orders/:id/confirm` buyer confirms → `escrow.acceptDelivery()` → status `complete`.

---

## Migrations

Files in `api/migrations/` are applied automatically on every API boot by `MigrationRunner`. Applied versions are tracked in `schema_migrations`. Name new files `NNNN_short_description.sql` where `NNNN` follows from the last file. There are no down-migrations — write additive SQL only.

### Existing migrations
| File | Tables created |
|---|---|
| `0001_init.sql` | companies, users, refresh_tokens, assets, listings, buyer_offers, mdm_connections, tax_invoices, valuation_snapshots |
| `0002_mailing_list.sql` | mailing_list |
| `0003_orders.sql` | orders |

Next migration file: `0004_*.sql`.

---

## Freezed Models

After editing any file in `api/bin/lib/models/`, regenerate:
```bash
cd api/bin
dart run build_runner build --delete-conflicting-outputs
```
The generated `.freezed.dart` and `.g.dart` files are committed to the repo. Do not edit them by hand. New models that only need DB serialization (not JSON) can be plain Dart classes — see `MailingListEntry` in `lib/repos/mailing_list_repo.dart` as the pattern.

---

## Codebase Snapshot (May 2026)

### API routes (all under `api/bin/routes/`)
```
auth/login.dart          POST /auth/login
auth/signup.dart         POST /auth/signup
auth/logout.dart         POST /auth/logout
auth/refresh.dart        POST /auth/refresh
waitlist/index.dart      POST /waitlist  (public)
admin/waitlist/          GET/PATCH /admin/waitlist + contact + notes
marketplace/listings/    GET /marketplace/listings + [id]
seller/listings/         GET/POST /seller/listings + [id]/withdraw
seller/offers/           PATCH /seller/offers/[offerId]/[action]
buyer/offers/            GET/POST /buyer/offers
amps/assets/             GET/POST /amps/assets + [id]/list
amps/portfolio.dart      GET /amps/portfolio
amps/invoices/           GET /amps/invoices + generate
amps/mdm/                POST /amps/mdm/connect + /connections CRUD + [id]/sync
orders/                  GET/POST /orders + [id] + ship + confirm
payments/                POST /payments
valuation/estimate.dart  POST /valuation/estimate  (proxies to ML service)
webhooks/fedex/          POST /webhooks/fedex
dashboard/               GET /dashboard
assets/                  GET /assets
```

### ML service (Python / FastAPI) — `ml-qv/`
The service is substantially built: FastAPI app, `ValuationModel` (GradientBoostingRegressor + rules-based fallback), `DepreciationModel` (exponential decay), training scripts, synthetic data generator, eBay Browse API data retrieval client, `requirements.txt`, and `Dockerfile`. The Dart client calls `POST /predict/valuation` and `POST /predict/depreciation`. **Model artifacts (`valuation.joblib`, `depreciation.joblib`) have not yet been trained and placed** — until they are, the service runs in rules-based fallback mode (confidence 0.40). See `ml-qv/CLAUDE.md`. Note: `ml/` is an empty scaffold — ignore it.

### Frontend pages built (`guildmark/src/app/pages/`)
Landing, Login, Signup, HowItWorks, PreLaunch, Marketplace, Insights, ExecutiveDashboard, MarketCalculator, OffloadWorkflow, MyListings, Orders, Settings (AccountSettings), amps/PortfolioOverview, amps/AssetInventory, amps/MDMConnections, amps/Invoices, amps/Settings

### DevDash pages built (`devdash/src/pages/`)
Login, Dashboard, MailingList — all other admin pages (order management, KYB, user management, market data, email log) are planned but not yet created.
