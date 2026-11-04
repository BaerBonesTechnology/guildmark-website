# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **sellers / ITAD vendors** — businesses and IT-asset-disposition
vendors liquidating retired enterprise hardware fleets, often in quantity. The
offload / listing-creation path is the priority surface.

Secondary: **IT buyers** — IT asset managers, procurement teams, and MSPs at
SMBs through enterprises sourcing trustworthy refurbished enterprise hardware.
They are the audience for the marketplace PLP/PDP. Buyer trust exists to let
sellers recover fair value.

## Product Purpose

GuildMark is a business-focused B2B marketplace for secondary-market
enterprise hardware, including small businesses. Businesses can create an account
and enter the dashboard immediately. Manual verification earns a Verified
business badge and is required to publish listings
and sell; signup, browsing, buying, and inventory remain available before review.
Businesses list and sell retired IT assets; business
buyers source them. Every unit carries condition grading, a fair-market
valuation, and compliance provenance (data erasure, warranty, functional state).
Success = sellers recover fair value quickly from trusted buyers, and buyers
transact with confidence.

## Positioning

A business-focused network — no consumers, no gray market — where
every listing is backed by condition grading, a defensible fair-market
valuation, and compliance provenance. That trust infrastructure is what a
generic hardware-resale listing site could not truthfully claim.

## Operating Context

Sellers list from retired fleets (the offload flow), frequently in volume.
Buyers browse the marketplace listing page, filter by category / grade / specs,
compare listings side by side, and make offers. Offers are two-sided (buyer ask
and seller offer, with accept / reject / counter / expire). Tiered subscription
and AMPS (asset-management) access gate parts of the product.

## Capabilities and Constraints

- **Condition grading taxonomy** — grades A / B / C are fixed product vocabulary
  the UI must reflect accurately.
- **Valuation model** — valuation flags (standard / seller_overpriced /
  distressed / insufficient_data) plus fair_market_value, est_book_value,
  seller_recovery_ratio, and depreciation anchor each listing to a market value.
- **Compliance signals (load-bearing, never cosmetic)** — data_wipe_status
  (not_wiped / wiped / certified), warranty_status (none / active / expired),
  functional_status (fully_functional / functional_with_issues / for_parts).
  These are factual and must stay truthful and visible.
- **Tiered access** — subscription tiers and AMPS gating (TierGate / UpgradeWall)
  are durable product surfaces.
- **Backend: Firebase** — user-confirmed as the authoritative direction
  (correcting an earlier Appwrite assumption). NOTE: some current code still
  references the Appwrite SDK (e.g. the listing photo uploader). Treat Firebase
  as the target; do not assume Appwrite- or Postgres-era data shapes.
- **Stack** — React + TypeScript + Vite, organized MVVM
  (Model / Service / ViewModel / View) per `guildmark/CONTRIBUTING.md`.

## Brand Commitments

- Name: **GuildMark**; the marketplace is branded **GuildMarket**.
- Typography is a proportional system (Inter / DM Sans); monospace has been
  retired. Recorded as an existing factual constraint, not a visual direction.

## Evidence on Hand

Working React application: marketplace PLP/PDP, two-sided offers, AMPS,
dashboards, insights, and pre-launch pages. No confirmed customer testimonials,
benchmarks, pricing claims, or press — future work must not fabricate these.

## Product Principles

1. **Trust is the product.** Grading, valuation, and compliance facts are
   load-bearing; they must read as verifiable, never decorative.
2. **Serve the seller's recovery first.** The fastest honest path from a retired
   asset to a fair-value sale drives the product; buyer trust enables it.
3. **Business-focused: verify before selling.** Signup is available
   immediately to businesses, including small businesses. Manual review
   earns a Verified business badge and is required to publish listings or sell.
   Signup, browsing, buying, and inventory remain available before approval.
   The badge confirms reviewed registration and
   representation; it does not certify transactions or listing quality. The
   experience stays B2B-professional. Subscription tiers and AMPS gating remain
   unchanged.
4. **Truthful signals only.** Never soften or inflate condition, value, or
   compliance state to make a sale.
