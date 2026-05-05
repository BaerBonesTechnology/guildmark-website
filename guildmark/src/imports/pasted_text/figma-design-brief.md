Perfect. That combination — modern/approachable base with AMPS as a clearly elevated tier — is a well-established SaaS pattern. Think how Notion vs. Notion AI feels, or Linear vs. Linear Insights. Same DNA, distinct weight.

Here's the complete Figma brief:

---

## Figma File Structure

Organize as a single Figma file with four pages in this order:

```
1. Brand Foundation
2. Design System
3. Marketplace — Web
4. AMPS Dashboard
```

---

## Page 1 — Brand Foundation

Everything here feeds the design system. Define it first, token it second.

### Logo & Wordmark
- Primary logo — wordmark + mark lockup
- Mark only — for favicons, app icons, small contexts
- Wordmark only — for co-branding scenarios
- All variants in light and dark mode
- Clear space rules and minimum size

### Brand Personality Reference
Create a mood board section — not for client approval, but so the designer stays aligned. Pull reference from brands that share the target energy: Stripe for clean precision, Notion for approachability, Wise for trust without stuffiness. Label what you're borrowing from each and what you're deliberately not doing.

### Color
```
Primary palette
  Brand primary       — main CTAs, links, active states
  Brand secondary     — supporting accents, hover states

Semantic palette
  Success             — cleared transactions, compliant status
  Warning             — flagged assets, expiring contracts
  Danger              — overpriced flag, sync errors
  Info                — neutral system messages

AMPS premium palette  — distinct from marketplace
  AMPS accent         — used only in AMPS surfaces
  AMPS surface        — slightly elevated background vs marketplace
  AMPS highlight      — charts, portfolio value indicators

Neutral scale          — 9 stops from white to near-black
                         Used for text, borders, backgrounds
```

Each color needs: HEX, RGB, HSL, light mode use, dark mode use, accessibility notes (WCAG contrast ratio against white and black).

### Typography
```
Display     — hero headlines, large numbers (portfolio value, savings)
Heading     — H1 through H4
Body        — regular and small
Label       — form labels, table headers, badge text
Mono        — price figures, serial numbers, invoice numbers
```

Define: font family (recommend a geometric sans — Inter or Plus Jakarta Sans for the approachable energy), weights used (regular/medium/semibold only — never bold), line heights, letter spacing. Map each style to a Figma text style immediately.

### Iconography
- Decide on an icon library (Lucide or Phosphor — both have Flutter and React packages, which matters for implementation)
- Document the size scale: 16px, 20px, 24px, 32px
- Define stroke weight and corner radius rules so custom icons match

### Elevation & Shadow
- Three levels only: flat (cards), raised (modals/dropdowns), floating (tooltips)
- AMPS surfaces use a subtle background elevation to feel premium without feeling different

### Motion
- Easing curves: standard, enter, exit
- Duration scale: instant (0ms), fast (100ms), normal (200ms), slow (300ms)
- Rule: data loading uses skeleton states, not spinners

---

## Page 2 — Design System

Build as a component library with variants. Every component needs: default, hover, active, disabled, loading, error states. Dark mode is required for all.

### Foundations (auto-layout frames)
- Spacing scale — 4px base, document every step (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- Border radius scale — 4px, 8px, 12px, 16px, full
- Grid — 12-column for desktop (1440px), 4-column for tablet (768px)

### Core Components

**Buttons**
```
Primary, Secondary, Ghost, Danger
Sizes: sm / md / lg
States: default, hover, loading (spinner), disabled
With icon left, with icon right, icon only
```

**Form elements**
```
Text input — default, focus, error, disabled
Select / dropdown
Textarea
Checkbox, Radio, Toggle
Date picker (needed for invoice date, contract end date)
File upload (for MDM credential setup)
Form validation messages
```

**Data display**
```
Table — sortable headers, row hover, row selection, empty state, loading skeleton
Stat card — large number, label, trend indicator (up/down/neutral)
Badge — status variants matching semantic colors
Tag — asset type, condition grade (A/B/C with distinct colors)
Progress bar — depreciation indicator
Tooltip
```

**Navigation**
```
Top nav — logo, primary links, user menu, notification bell
Sidebar — for AMPS dashboard (collapsible)
Breadcrumb
Tabs — horizontal, used for marketplace listing detail
```

**Feedback**
```
Toast notifications — success, warning, error, info
Empty states — with illustration placeholder and CTA
Loading skeleton — card variant, table row variant, stat card variant
Error boundary — full page error state
Modal — with and without destructive action
Confirmation dialog
```

**Data visualization components**
```
Line chart — portfolio value over time (AMPS only)
Bar chart — assets by type/condition
Donut chart — portfolio composition
Trend indicator — inline sparkline for value changes
Price comparison bar — shows seller offer vs buyer ask vs market anchor
```

**AMPS-specific components**
```
Portfolio value hero — large number display with trend
Asset health indicator — condition grade with battery/compliance sub-info
MDM sync status pill — last sync time, device count, connected/error state
Invoice card — invoice number, date, write-off amount, download button
Tier badge — Starter / Growth / Business / Scale / Enterprise
```

---

## Page 3 — Marketplace Web

### User flows to cover

Two user types — seller and buyer — with distinct navigation and intent. Define which screens serve each.

**Onboarding flow**
```
Landing page (public)
  Hero — value proposition split by user type (sell / buy)
  How it works — 3 steps for each side
  Trust signals — market price transparency callout
  AMPS upsell — "Manage your whole fleet" banner
  Pricing section — marketplace fees, AMPS tier table
  Footer

Sign up / sign in
  Account type selection — Selling / Buying / Both
  Company details form
  Email verification
```

**Seller flow**
```
Seller dashboard
  Active listings summary
  Valuation flag alerts (overpriced assets needing attention)
  Recent offers received
  Quick stats: total listed value, total recovered, pending offers

Create listing (manual — for non-MDM users)
  Step 1: Asset type + model name (specs autofilled from MDM if connected, manual otherwise)
  Step 2: Condition grade selector with rubric explainer
  Step 3: Quantity + reason for offload
  Step 4: Purchase date + original price (optional but recommended)
  Step 5: Price recommendation — shows our suggested price vs their ask
           Transparent market anchor displayed here

Listing detail (seller view)
  Asset specs (auto-populated)
  Current valuation breakdown — market anchor, seller offer, buyer ask
  Offers received
  Price recommendation nudge if flagged as overpriced
  Edit / withdraw listing actions

MDM connection setup
  Connect Jamf Pro / Jamf School / Intune
  Step-by-step credential entry
  Sync status after connection
  Asset import preview — "We found X devices"
  Bulk listing from MDM sync (multi-select + list)
```

**Buyer flow**
```
Marketplace browse
  Filter sidebar — asset type, condition grade, price range, age
  Asset card grid — model, condition badge, price, vs market indicator
  Sort — price, newest, best value vs market

Asset detail (buyer view)
  Full specs
  Condition grade with what it means
  Price — buyer ask, market anchor reference ("X% below market")
  Seller info — company size, industry (anonymized)
  Make offer CTA
  Similar listings

Offer flow
  Offer amount input
  Quantity selector
  Message to seller (optional)
  Fee summary — platform fee, total
  Confirmation

Buyer dashboard
  Active offers — pending / accepted / countered
  Purchase history
  Saved listings
```

---

## Page 4 — AMPS Dashboard

AMPS gets its own navigation shell — sidebar layout, slightly elevated surface color, AMPS branding treatment in the nav.

### Screens

**Portfolio overview (home)**
```
Hero stat row
  Total portfolio value — large display number with trend vs last month
  Total devices managed
  Avg depreciation %
  Assets at risk count

Value over time chart
  12-month line chart
  Portfolio value vs book value as two lines
  Hover state shows exact values on date

Fleet breakdown
  Donut — by asset type
  Donut — by condition grade
  Table — top 10 assets by value

Quick actions
  List aging assets (pre-filtered to assets > 36 months old)
  Generate portfolio report
  Connect MDM (if not connected)
```

**Asset inventory**
```
Full table of all MDM-synced assets
Columns: model, type, condition, age, fair market value, book value, depreciation %, status, last sync
Sortable, filterable, searchable
Row actions: view detail, create listing, generate invoice
Bulk actions: create listings, export CSV

Asset detail (AMPS view)
  All specs
  Valuation history — mini line chart for this specific asset
  Condition breakdown — what signals determined the grade
  MDM sync log — last 5 syncs for this device
  Actions: list on marketplace, generate write-off invoice
```

**MDM connections**
```
Connected sources list — Jamf Pro / School / Intune cards
Each card: connection status, last sync, device count, sync now button
Add connection flow — per MDM type with credential entry
Sync history log
```

**Invoices**
```
Invoice list — date, asset, type, write-off amount, market value, PDF download
Create invoice flow
  Asset search / select
  Invoice type — disposal / loss / sale / donation
  Date
  Preview — shows all values before generating
  PDF generation + download
```

**Settings**
```
Company profile
Subscription — current tier, usage, upgrade/downgrade
MDM connections (link to MDM page)
Team members — invite, roles (Admin / Member / Viewer)
Notification preferences — sync failures, valuation alerts, offer activity
Billing history
```

---

## Handoff Requirements

Every screen needs:

- Desktop frame at 1440px width
- Component annotations linking back to design system
- Interaction notes — what happens on click, hover, form submit
- API dependency notes — which data fields each component consumes (maps to your TypeScript service layer)
- Empty state defined for every data-dependent section
- Loading state defined for every data-dependent section
- Dark mode variant for every screen

Prototype connections needed for:
- Full seller onboarding → listing creation flow
- Full buyer browse → offer flow
- AMPS MDM connection setup flow
- AMPS invoice generation flow

These four prototypes are what you hand to a developer for sprint planning. Everything else is reference.

---

## Recommended Figma File Plugins

- **Tokens Studio** — for exporting design tokens directly to your TypeScript codebase as CSS variables or a JSON token file that feeds Tailwind
- **Stark** — accessibility contrast checking as you build
- **Iconify** — if using Lucide or Phosphor, pulls icons directly into Figma without manual import
- **Lorem Ipsum** — realistic placeholder data for tables and stat cards (use real-looking asset names and prices, not Lorem Ipsum text)

The Tokens Studio plugin is particularly worth setting up properly from day one — it means your design tokens and your Tailwind config stay in sync automatically, which eliminates an entire category of designer-developer handoff friction.