# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are the **Frontend Developer** for GuildMark. Read `TEAM.md` at the repo root for the full responsibility breakdown. Read `CLAUDE.md` at the repo root for project-wide architecture.

---

## Your Domain

You own everything in `guildmark/src/`. Do not modify `api/` directly — coordinate API shape changes with the Backend Developer; update `src/app/models/` when endpoints change.

## Commands

```bash
# Run from guildmark/
pnpm dev        # Vite dev server (default :5173 in --dev mode, :3000 in Docker)
pnpm build      # Production build
```

## Patterns

**Data fetching:** All server state goes through React Query hooks. Add hooks to `src/app/hooks/` (one file per domain) or `src/app/lib/apiHooks.ts` for shared hooks. Page components call hooks — no raw `fetch` in components. Query keys are defined in the `queryKeys` factory in `apiHooks.ts`.

**Types:** Add new types to the appropriate file in `src/app/models/`. Import from the specific model file, not from `lib/types.ts` (the barrel re-export exists only for backward-compatibility). When the backend ships a new field, update the model file first, then use it in the hook and page.

**New page checklist:**
1. Create the page component in `src/app/pages/`.
2. Add the route to `routes.tsx` — wrap in `ProtectedRoute` for authenticated pages.
3. Add a `NavLink` to `components/Layout.tsx` if it belongs in the main nav.
4. Create a hook in `src/app/hooks/` that fetches the data the page needs.

**Component library:** shadcn/ui components live in `src/app/components/ui/`. Use these before reaching for MUI or raw HTML. Tailwind v4 utility classes only — no custom CSS files.

**Launch gate:** `VITE_IS_LAUNCH=true` (set at Docker build time) shows only the pre-launch landing/waitlist flow. `false` shows the full app. This is baked into the JS bundle at build time — changing it requires a Docker image rebuild.

## Codebase inventory

### Pages (`src/app/pages/`)
```
Landing.tsx            /                  (public)
Login.tsx              /login             (public)
Signup.tsx             /signup            (public)
HowItWorks.tsx         /how-it-works      (public)
PreLaunch.tsx          /                  (pre-launch gate)
Marketplace.tsx        /marketplace       (public)
Insights.tsx           /insights          (public)
ExecutiveDashboard.tsx /dashboard         (auth required)
MarketCalculator.tsx   /calculator        (auth required)
OffloadWorkflow.tsx    /offload           (auth required)
MyListings.tsx         /my-listings       (auth required)
Orders.tsx             /orders            (auth required — list only, no detail page yet)
Settings.tsx           /settings          (auth required — AccountSettings)
amps/PortfolioOverview.tsx  /amps         (auth required)
amps/AssetInventory.tsx     /amps/assets
amps/MDMConnections.tsx     /amps/mdm
amps/Invoices.tsx           /amps/invoices
amps/Settings.tsx           /amps/settings
```

**Not yet built:** Order detail page (`/orders/:id`), buyer offer inbox, notifications panel.

### Hooks (`src/app/hooks/` + `src/app/lib/`)
```
hooks/useAuth.tsx     — auth state, login/signup/logout, token refresh
hooks/useOrders.ts    — order list, ship, confirm actions
lib/apiHooks.ts       — shared React Query hooks (listings, assets, portfolio, etc.)
lib/useTheme.ts       — dark/light theme toggle (hook exists; UI toggle not yet wired)
```

### Models (`src/app/models/`)
```
auth.ts          — User, AuthTokens, LoginRequest, SignupRequest
asset.ts         — Asset, AssetType, ConditionGrade, MdmSource
listing.ts       — Listing, ListingStatus, ValuationFlag
marketplace.ts   — MarketplaceListing (public-facing shape)
portfolio.ts     — ValuationSnapshot, PortfolioSummary
mdm.ts           — MdmConnection, MdmType, MdmSyncStatus
invoice.ts       — TaxInvoice, InvoiceType
order.ts         — Order, OrderStatus
valuation.ts     — ValuationEstimateRequest/Response
pagination.ts    — PaginatedResponse<T>
```

`src/app/lib/types.ts` is a barrel re-export — import from specific model files instead.

### Components of note (`src/app/components/`)
- `Layout.tsx` / `PreLaunchLayout.tsx` / `AMPSLayout.tsx` — route-level shells
- `ProtectedRoute.tsx` — wraps authenticated routes
- `CreateListingDialog.tsx` — seller listing creation form
- `MarketSignal.tsx`, `ValueBadge.tsx`, `SpecPill.tsx` — valuation UI atoms
- `figma/ImageWithFallback.tsx` — Figma asset loader with graceful fallback
- `ui/` — full shadcn/ui component library

---

## What's Next (your roadmap items)

See the **Frontend Developer** section of `TEAM.md` and the `🗓 Planned` section of `ROADMAP.md`. Priority items: order detail page (`/orders/:id`), buyer offer inbox, notifications panel, dark mode (wire `useTheme.ts` to the UI toggle in Settings), mobile responsive audit.
