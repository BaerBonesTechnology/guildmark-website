# GuildMark — Team Responsibilities

> Last updated: May 2026
> Each role owns the files, decisions, and roadmap items listed below.
> Cross-role work goes through the Project Manager for prioritization.

---

## 🗂 Project Manager

**Owns:** Roadmap sequencing, sprint planning, cross-team coordination, stakeholder communication, DevDash operational usage.

### Responsibilities
- Maintains `ROADMAP.md` — moves items between sections as work is completed or re-prioritized
- Runs sprint planning and writes acceptance criteria for each roadmap item before it's picked up
- Coordinates handoffs between roles (e.g. when Backend ships a new endpoint, Frontend and Auth know)
- Owns DevDash as the day-to-day operational tool — waitlist management, order oversight, company KYB approvals, email logs
- Manages API keys, `.env` secrets rotation, and access to third-party dashboards (Escrow.com, FedEx, Resend, Square, eBay, BackMarket)
- Tracks open bugs and writes reproduction steps before assigning to a dev

### Files Owned
```
ROADMAP.md
TEAM.md
.env             ← secret rotation & access control
devdash/         ← operational admin panel
```

### Roadmap Items to Drive
- Company KYB verification process (define approval criteria)
- Net 30 / Net 60 eligibility criteria (who qualifies, what the penalty rate is)
- GuildMark Score weighting (define the business logic before dev builds it)
- Certified refurbishment partner onboarding process
- Carbon offset integration — choose provider, define pricing model

---

## 🔐 Auth & Security

**Owns:** All authentication flows, token lifecycle, encryption, access control, webhook verification, and compliance posture.

### Responsibilities
- JWT issuance, refresh token rotation, and revocation
- Password hashing (bcrypt) and reset flows
- 2FA (TOTP) — backend implementation and secrets storage
- AES-GCM encryption for MDM credentials at rest
- HMAC-SHA256 webhook signature verification (FedEx, future providers)
- Rate limiting and brute-force protection on auth endpoints
- Session management — active token listing and per-device revocation
- Security review of any new route before it ships (especially payment and webhook routes)
- API key auth system for enterprise buyer API access
- CORS policy and header hardening

### Files Owned
```
api/bin/lib/auth/
api/bin/routes/auth/
api/bin/lib/config.dart          ← secret loading patterns
api/migrations/                  ← auth-related schema changes
```

### Roadmap Items
- Password reset flow (time-limited token via Resend)
- 2FA (TOTP) — `/auth/2fa/enable`, `/auth/2fa/verify`, `authenticator_secret` column
- Session management — list + revoke refresh tokens from Settings
- API key auth for enterprise buyer API access
- Security audit of Escrow.com and FedEx webhook endpoints
- Rate limiting middleware on login / signup routes

### Works Closely With
- **Backend Dev** — reviews all new routes for auth/authz correctness
- **Frontend Dev** — coordinates Settings UI flows (2FA toggle, session list)
- **PM** — signs off on KYB and company verification policies

---

## 🖥 Frontend Developer

**Owns:** The GuildMark React application — all pages, components, hooks, and models. UI for the DevDash admin panel.

### Responsibilities
- React + TypeScript + Vite + Tailwind v4 + shadcn/ui
- All pages under `src/app/pages/` and components under `src/app/components/`
- React Query hooks (`src/app/hooks/`, `src/app/lib/apiHooks.ts`)
- Type model files under `src/app/models/` — keep in sync with backend API shapes
- Figma → code implementation for new screens
- Responsive layout (mobile + desktop)
- Dark mode implementation (`useTheme.ts` hook already exists)
- DevDash UI (`devdash/`) for new admin features

### Files Owned
```
guildmark/src/
devdash/src/
guildmark/src/app/models/        ← frontend type definitions
guildmark/src/app/hooks/
guildmark/src/app/pages/
guildmark/src/app/components/
guildmark/src/app/lib/api.ts
guildmark/src/app/lib/apiHooks.ts
guildmark/src/app/routes.tsx
```

### Roadmap Items
- Order detail page (escrow status, tracking timeline, inspect/confirm actions)
- Buyer offer inbox (incoming + outgoing offers with status)
- Notifications panel (bell icon + slide-over)
- Dark mode (wire `useTheme.ts` to Tailwind dark variant)
- Mobile responsive audit across AMPS and Marketplace
- Saved searches / watchlist UI
- Bulk listing CSV upload UI
- Net 30 / Net 60 payment terms selector at checkout
- GuildMark Score display on company profiles
- Multi-currency listing display
- DevDash: order management, user management, market data charts, email log

### Works Closely With
- **Backend Dev** — aligns on API response shapes before building pages; updates `src/app/models/` when endpoints change
- **Auth & Security** — implements 2FA, session management, and password reset UI in Settings
- **PM** — receives Figma screens and acceptance criteria before starting new pages

---

## ⚙️ Backend Developer (Dart + Python)

**Owns:** The Dart Frog API, the Python ML service infrastructure, all database migrations, and third-party service integrations.

### Responsibilities
- Dart Frog API routes, repos, models, and services
- Database schema — writes and reviews all SQL migrations
- Third-party integrations: Escrow.com, FedEx, Square, Resend, eBay, BackMarket, Jamf, Intune
- Python ML service — FastAPI app, model serving, Docker image
- Background jobs (inspection auto-expiry, nightly valuation refresh, Net 30/60 payment collection)
- Docker Compose service configuration
- API contract ownership — communicates shape changes to Frontend before shipping

### Files Owned
```
api/
api/bin/lib/repos/
api/bin/lib/services/
api/bin/lib/models/
api/bin/routes/
api/migrations/
ml/
docker-compose.yml
start.sh / start.cmd
```

### Roadmap Items

**Escrow & Orders**
- Inspection period auto-expiry background job (`Dart Timer` or cron)
- Dispute resolution route + escrow refund trigger
- Buyer-initiated cancellation + escrow refund
- Invoice auto-generation on order complete
- Net 30 / Net 60 — `payment_terms` field, ACH debit on due date, overdue handling
- UPS and USPS carrier tracking webhooks

**Payments**
- Square production cutover
- GuildMark Wallet ACH payout via `GM_WALLET_ACH_*` vars
- Stripe Connect evaluation

**Marketplace**
- Full-text search on listings (`pg_trgm` or `tsvector`)
- Bulk listing via CSV upload endpoint
- Listing expiry background job

**Market Data**
- eBay OAuth service + price feed polling
- BackMarket API price feed

**AMPS & MDM**
- Jamf School connector completion
- Scheduled nightly valuation refresh job
- Asset lifecycle alert logic
- Bulk asset CSV export endpoint

**Notifications**
- `notification_preferences` table and per-user gating on Resend sends
- Offer received + offer status emails

**Platform**
- Enterprise buyer API key auth (coordinate spec with Auth & Security)
- GuildMark Score computation
- Multi-currency `currency` field on listings and orders
- Carbon offset calculation endpoint

**Python ML Service**
- Model artifact build + mount documentation
- Retraining pipeline (ingest completed order prices)

### Works Closely With
- **Auth & Security** — all new routes reviewed before shipping; shares migration responsibility
- **ML Dev** — Python service infrastructure; Backend owns the server, ML Dev owns the model
- **Frontend Dev** — communicates API contract changes; unblocks with mock responses when needed
- **PM** — estimates effort and flags blockers during sprint planning

---

## 🤖 ML Developer

**Owns:** The valuation model, training pipeline, inference quality, and all ML-specific business logic (GuildMark Score, carbon offset calculations).

### Responsibilities
- Valuation model training, evaluation, and versioning
- Feature engineering from asset data (age, condition, CPU score, RAM, storage, eBay/BackMarket anchors)
- Model artifact packaging and deployment into the Python ML service
- Inference quality monitoring — confidence scoring, drift detection
- Retraining pipeline — ingesting completed order prices as ground truth
- GuildMark Score algorithm design and implementation
- Carbon offset estimation model
- Collaborates with Backend Dev on the Python service API contract (`/estimate`, `/health`)

### Files Owned
```
ml/
ml/model_artifacts/
ml/train/                        ← training scripts (to be created)
ml/notebooks/                    ← exploratory analysis (to be created)
```

### Roadmap Items
- Model artifact delivery — build artifacts, document mount process for Docker `--profile ml`
- Confidence threshold logic — define thresholds; surface warnings to Frontend via the API response
- Retraining pipeline — scheduled ingestion of `orders` table where `status = 'complete'`
- eBay + BackMarket price anchors as model features (raw data provided by Backend Dev)
- GuildMark Score — design algorithm using order history, dispute rate, payment timeliness, company age
- Carbon offset model — estimate kg CO₂ saved per device reuse vs. manufacture + disposal
- Valuation flag logic (`standard`, `seller_overpriced`, `distressed`, `insufficient_data`) — review and improve thresholds

### Works Closely With
- **Backend Dev** — Python service infrastructure, API contract for `/estimate`, feature data availability
- **PM** — communicates model limitations and confidence ranges so they can be reflected in product decisions (e.g. when to show a valuation warning)

---

## 📋 Ownership Quick Reference

| Area | Owner |
|---|---|
| Auth flows, JWT, 2FA, sessions | Auth & Security |
| MDM credential encryption | Auth & Security |
| Webhook HMAC verification | Auth & Security |
| Dart Frog API routes & repos | Backend Dev |
| SQL migrations | Backend Dev |
| Escrow.com, FedEx, Square, Resend integrations | Backend Dev |
| Python ML service (infra) | Backend Dev |
| Valuation model & training | ML Dev |
| GuildMark Score algorithm | ML Dev |
| Carbon offset model | ML Dev |
| React pages & components | Frontend Dev |
| Frontend type models | Frontend Dev |
| React Query hooks | Frontend Dev |
| DevDash UI | Frontend Dev |
| ROADMAP.md | PM |
| `.env` secret rotation | PM |
| Sprint planning & acceptance criteria | PM |
| Third-party API key management | PM |
| DevDash operational use | PM |
