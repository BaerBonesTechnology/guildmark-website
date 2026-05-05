# GuildMark Roadmap

> Last updated: May 2026
> Status key: ✅ Done · 🔧 In progress · 🗓 Planned · 💡 Idea
>
> **Codebase reality check (May 2026):** The Dart API, React frontends, and all four third-party service integrations (Escrow, FedEx, Square, Resend) are fully wired. The Python ML service lives in **`ml-qv/`** (not `ml/` — that's an empty placeholder); it is substantially built with two models, training scripts, and an eBay data retrieval client, but model artifacts have not been trained yet. DevDash has three pages (Login, Dashboard, MailingList); all other admin views are planned. Three migrations exist (`0001_init`, `0002_mailing_list`, `0003_orders`); next is `0004_*`.

---

## 💰 Business Model

### AMPS Subscription Tiers

AMPS is the primary membership product. The marketplace is open to all — subscription tier determines seller-side transaction fees, valuation refresh cadence, MDM access, and feature gates.

| Feature | Free | Starter | Growth | Pro |
|---|---|---|---|---|
| **Price** | $0 | $17.99/mo | $34.99/mo | $69.99/mo |
| **Valuation refresh** | Weekly | Daily | Daily | Every 12 hrs |
| **MDM connections** | None | 1 | Unlimited | Unlimited |
| **Tax invoice generation** | ❌ | ❌ | ✅ | ✅ |
| **Disposal PDF** | ❌ | ❌ | ❌ | ✅ |
| **Device wiping service** | $15/device | $15/device | $12/device | $8/device |
| **Marketplace seller fee** | 8% | 6% | 5% | 3% |

### Transaction Fees

| Fee | Rate | Notes |
|---|---|---|
| Seller-side | 8% / 6% / 5% / 3% | Determined by seller's AMPS tier (Free / Starter / Growth / Pro) |
| Buyer-side | 3% | Flat across all tiers — not tied to AMPS membership |
| Net 30/60 deferral | 1.3% | Charged to buyer at time of payment terms selection; non-refundable |

### Device Wiping Service

Per-device add-on available at all tiers. Pricing is discounted for paying members. Requires a wipe certificate artifact per device (enterprise procurement requirement). Third-party wiping vendor integration TBD.

---

## ✅ Completed

### Infrastructure
- Docker Compose orchestration (postgres, api, guildmark, devdash, ml)
- `start.sh` and `start.cmd` with dev / db-only / build / ml / down modes
- Root `.env` as single source of truth across all services
- Migration runner (SQL files applied on boot)

### Auth
- Signup + login with JWT access/refresh tokens
- Password hashing (bcrypt), refresh token rotation
- Role-based access: admin / member / viewer
- Password reset (forgot-password flow with time-limited token sent via Resend)

### AMPS (Asset Management & Portfolio System)
- Asset inventory — manual entry + MDM sync
- Portfolio valuation snapshots (nightly cadence)
- Depreciation tracking, condition grading
- Tax invoice / disposal document generation (PDF)
- MDM integrations: Jamf Pro, Intune (Jamf School partial)

### Marketplace
- Seller listings with ML-powered fair market valuation
- Buyer offer flow (place / accept / reject / counter)
- Marketplace browsing with valuation flags

### Orders & Payments
- Full order lifecycle: awaiting payment → funded → shipped → delivered → inspecting → complete / disputed / cancelled
- Escrow.com integration — transaction creation, inspection period, fund release
- FedEx Track API (OAuth 2.0 + token caching)
- FedEx delivery webhook → auto-trigger escrow `receive` on delivery
- Buyer manual confirm → escrow `accept` (immediate release)
- Inspection period auto-expiry endpoint (expires stale deliveries)
- Buyer dispute route (`POST /orders/:id/dispute`)
- Square Web Payments (sandbox)

### Email (Resend)
- Waitlist confirmation
- Escrow funding notification (buyer)
- Delivery confirmation + inspection deadline (buyer)
- Offer received notification (seller)
- Offer status notification (buyer)
- Password reset link

### Frontend (GuildMark)
- Landing / pre-launch waitlist page
- Auth (login / signup / forgot password / reset password)
- Marketplace browser
- My Listings + listing creation
- AMPS dashboard (portfolio, inventory, invoices, MDM connections)
- Orders & Transactions list page
- Order Detail page with lifecycle timeline
- Buyer Offer Inbox with tabs and counter-offer UI
- Account Settings page
- Type system split into per-model files under `src/app/models/`

### DevDash (Admin Panel)
- Waitlist management (view, contact, notes)

---

## 🔧 In Progress

### ML Service (`ml-qv/`)
- The FastAPI service is substantially built: `/health`, `/predict/valuation`, `/predict/depreciation`, `ValuationModel` (GradientBoostingRegressor with rules-based fallback), `DepreciationModel` (exponential decay), training scripts, synthetic data generator, `requirements.txt`, `Dockerfile`.
- `train_valuation.py` now fetches real eBay fixed-price listings via `DataGrabber` (17 queries across 7 asset types) and blends with synthetic data for age/price signal that eBay doesn't expose. Ready to run once `EBAY_APP_ID` and `EBAY_CERT_ID` are in the environment.
- **Remaining gap:** model artifacts (`valuation.joblib`, `depreciation.joblib`) have not been trained and placed — the service runs in fallback mode (confidence 0.40) until they are.
- Note: `ml/` is an empty scaffold placeholder — the real service is in `ml-qv/`.

### Market Data
- eBay OAuth client-credentials flow — **built in `ml-qv/training/data_retrieval.py`** as a training data source (fetches fixed-price listings, maps conditions to A/B/C grades). A separate Dart backend service for real-time price display in DevDash is still needed.
- BackMarket price feed (API key wired, no client built yet — neither in ml-qv nor the Dart API)

### MDM
- Jamf School connector (Dart migration helper file exists; full sync logic incomplete)



## 🗓 Planned

### Payments & Finance
- **Square production cutover** — swap sandbox keys, test live card payments
- **GuildMark Wallet** — ACH payout to sellers using the routing/account already in `.env`; needs a Dwolla or Square payout call wired to the `GM_WALLET_ACH_*` vars
- **Stripe Connect (optional)** — evaluate as an alternative to Square for platform-level delayed payouts if escrow is not required on lower-value transactions
- **Invoice auto-generation on order complete** — create a `TaxInvoice` row when an order reaches `complete` status
- **Net 30 / Net 60 payment terms** — allow verified buyers to defer payment rather than funding escrow upfront; seller ships against a purchase order, buyer pays within 30 or 60 days; requires a `payment_terms` field on orders (`immediate`, `net_30`, `net_60`), 1.3% deferral fee charged at selection, creditworthiness check before a buyer is eligible, automated payment reminder emails at 7 days / due date / overdue, and ACH debit on the due date via the GuildMark Wallet; late payments accrue a configurable penalty rate

### AMPS Subscription Billing
- **`subscriptions` table** — migration `0004_subscriptions.sql`; columns: `company_id`, `plan` (enum: `free`, `starter`, `growth`, `pro`), `status` (`active`, `cancelled`, `past_due`), `billing_cycle_anchor`, `square_subscription_id`
- **Subscription middleware** — read active plan from `subscriptions` on every AMPS route; gate tax invoice generation at Growth, disposal PDF at Pro, MDM connection count at tier limit
- **Seller fee resolution** — `POST /orders` looks up seller's active plan and applies the correct fee split (8/6/5/3%) at order creation time; store `platform_fee` and `seller_fee_pct` on the `orders` row
- **Square recurring billing** — wire Square Subscriptions API for monthly billing; handle webhook events for payment failure, cancellation, and renewal
- **Valuation refresh scheduler** — background job that runs at the correct cadence per company based on their plan tier (weekly / daily / 12hr); writes `valuation_snapshot` rows
- **Subscription management UI** — Settings page in GuildMark showing current plan, usage, upgrade/downgrade flow; billing history

### Device Wiping Service
- **Vendor integration** — select and integrate a certified data wiping provider (e.g. Blancco or equivalent); wire to a `wipe_orders` table tracking device serial, requested date, status, and certificate URL
- **Wipe certificate generation** — PDF certificate per device issued on completion; stored and accessible from AMPS asset detail
- **Per-device billing** — charge at tier rate ($15 / $12 / $8) via Square at wipe order creation; refundable if vendor cannot complete
- **Offload workflow integration** — surface wipe service as a step in the existing OffloadWorkflow page before a device is listed

### Escrow & Order Flow
- **Dispute resolution UI** — DevDash UI for admin review, manual escrow release or refund trigger (Backend API is completed)
- **Buyer-initiated cancellation** — cancel before shipment, trigger escrow refund
- **Carrier flexibility** — UPS and USPS tracking webhooks alongside FedEx

### Auth & Security
- **2FA (TOTP)** — toggle already exists in Settings UI; needs backend (`/auth/2fa/enable`, `/auth/2fa/verify`) and `authenticator_secret` column on `users`
- **Session management** — list active refresh tokens, revoke individual sessions from Settings

### Notifications
- **Notification preferences** — Settings UI toggle already exists; wire to a `notification_preferences` table and gate Resend sends accordingly

### Marketplace & Discovery
- **Search + filters** — full-text search on `model_name`, filter by `asset_type`, `condition_grade`, price range
- **Saved searches / watchlist** — buyer saves a filter set and gets notified on new matches
- **Bulk listing** — seller uploads CSV to create multiple listings at once
- **Listing expiry** — auto-expire listings after configurable TTL, notify seller

### AMPS
- **Jamf School sync** — complete the MDM connector started in the migration files
- **Scheduled valuation refresh** — nightly job re-values the whole portfolio and writes a `valuation_snapshot` row per company
- **Asset lifecycle alerts** — flag assets approaching end-of-life based on age + condition grade
- **Bulk export** — CSV/XLSX download of full asset inventory

### ML Service
- **Train and place model artifacts** — run `python -m training.train_valuation` and `train_depreciation` in `ml-qv/`; mount resulting `.joblib` files at `$ML_MODEL_DIR` in Docker so the service exits fallback mode
- **Wire real eBay data into training** — ✅ Done. `train_valuation.py` now uses `DataGrabber` with a hybrid eBay + synthetic approach.
- **Confidence threshold warnings** — define the threshold (e.g. < 0.55) below which the valuation route should add a warning flag; surface it in the GuildMark and AMPS UIs
- **Retraining pipeline** — ingest `orders` rows where `status = 'complete'` as ground truth; coordinate with Backend Developer on DB access pattern

### DevDash (Admin)
- **Order management** — view all orders, manually override status, trigger escrow actions
- **Company KYB verification** — approve / reject companies before they can list
- **User management** — suspend, reassign roles, impersonate for support
- **Market data dashboard** — eBay + BackMarket price trend charts for each asset type
- **Email log** — see all Resend sends, delivery status

### Frontend
- **Notifications panel** — bell icon + slide-over showing recent activity
- **Dark mode** — theme toggle (hook exists in `useTheme.ts`)
- **Mobile responsive pass** — audit AMPS and Marketplace on small viewports

### Platform & Growth
- **GuildMark Score** — creditworthiness / reliability score per company based on order history
- **Bulk purchase agreements** — multi-asset orders with tiered pricing
- **Certified refurbishment partners** — third-party refurb marketplace tier
- **API access for enterprise buyers** — public-facing REST API with API key auth so procurement teams can query inventory programmatically
- **Carbon offset integration** — calculate and optionally offset CO₂ from device reuse vs. disposal
- **Multi-currency support** — CAD, GBP, EUR listings for cross-border B2B deals
