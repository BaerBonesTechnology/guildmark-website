---
schema_version: 1
id: "commercial_policy"
updated_on: "2026-10-30"
currency: "USD"
marketplace_fees:
  status: "user_approved_rates"
  buyer:
    percent: 2.8
    rate: 0.028
  seller:
    tier_order: "Free, Starter, Growth, Pro"
    free:
      percent: 14
      rate: 0.14
    starter:
      percent: 14
      rate: 0.14
    growth:
      percent: 12
      rate: 0.12
    pro:
      percent: 10
      rate: 0.10
  interpretation: "Latest user-approved seller schedule explicitly sets Free and Starter to 14%, Growth to 12%, and Pro to 10%."
  calculation_basis: "Retain existing application calculation behavior; rates alone do not change which tax, shipping, or service components form the fee base. Confirm the published description before launch."
  rollout: "User authorized local application pricing and limit reconciliation. Application defaults, active demo seed configuration, business drafts, provider catalog, and persisted runtime configuration require verification against this schedule. This record does not claim deployment or live provider changes."
subscription_catalog:
  status: "user_approved_prices_assets_credits_and_seat_design"
  approved_on: "2026-10-30"
  billing_unit: "Company per month"
  currency: "USD"
  free:
    monthly_price: 0
    access: "Marketplace only; no AMPS subscription access."
  starter:
    monthly_price: 39
    monthly_price_cents: 3900
    active_physical_asset_units: 100
    included_owner_seats: 1
    fresh_successful_valuation_credits_per_billing_month: 200
  growth:
    monthly_price: 99
    monthly_price_cents: 9900
    active_physical_asset_units: 500
    included_owner_seats: 1
    fresh_successful_valuation_credits_per_billing_month: 1000
  pro:
    monthly_price: 199
    monthly_price_cents: 19900
    active_physical_asset_units: 2000
    included_owner_seats: 1
    fresh_successful_valuation_credits_per_billing_month: 4000
  seat_design:
    status: "user_approved_design_pending_billing_and_memberships"
    included_owner_seats_all_paid_plans: 1
    extra_seat_monthly_price_basis: "Approximately 20 percent of base, rounded to approved USD 8/20/40."
    approved_extra_seat_monthly_prices_usd: {starter: 8, growth: 20, pro: 40}
    paid_addon_counts: 0
    implementation: "Metadata and model only. No extra-seat purchase, paid entitlement, invitation workflow, or automatic charge is established."
    supersession: "Latest working design supersedes earlier 2/5/15 included-seat capacities. Prices, physical-unit limits and valuation credits remain approved; the user approved the rounded one-owner plus USD 8/20/40 extra-seat design. Paid activation remains blocked pending implementation and verification."
    permission_targets: "Owner and Billing Admin may authorize spending. Operator manages permitted inventory. Viewer has read-only access. All roles and memberships require implementation and verification."
    unresolved: "No maximum additional-seat count approved. Confirm invitation counting, role assignment, deactivation, transfer, proration, refunds and billing lifecycle before activation."
  asset_counting: "SUM(quantity) of active in-scope physical asset units, not the number of records."
  assistant_request_limit: "Five asset records per request on every paid tier; this does not override company physical-unit limits."
  implementation_status: "Approved catalog; local implementation and independent quota, billing, and provisioning verification are pending. Approval is not evidence of enforcement or production readiness."
  capability_status: "See amps-commercial-plan.md and amps-launch-readiness.md for implementation gaps. Unfinished workflows and integrations are not working paid features."
  subscription_policies_pending: "Cancellation timing, downgrades, grace periods, data access and retention, overage treatment, and refund details require explicit policy and implementation validation."
network_services_fee:
  status: "user_approved"
  percent: 4
  rate: 0.04
  applies_to: "Elected GuildMark Network services"
  modeling_basis:
    payer: "Buyer"
    fee_base: "Elected network-service subtotal, excluding hardware and shipping"
    status: "assumed_pending_published_checkout_wording"
    qualification: "The user approved the 4% rate; the payer and calculation base are the modeling interpretation stated in chat, not an explicitly confirmed fee-base policy."
  economics:
    - "Keep the provider quote, actual provider cost, and any service markup separate from this fee."
    - "Treat the fee as a contribution toward processing and coordination costs, not automatic profit margin."
  rollout: "Recorded for the economics model only. Checkout implementation and live configuration are unchanged; this record does not authorize code changes or deployment."
service_pricing:
  status: "user_clarified"
  source: "Chosen GuildMark Network partner"
  basis: "Partner quote for each selected job; no flat GuildMark service cost is assumed."
  network_fee: "Model the separate 4% GuildMark fee on the partner-quoted service subtotal, subject to the fee-base qualification above."
shipping_pricing:
  status: "user_clarified"
  source: "FedEx"
  basis: "Actual shipment pricing from a live FedEx quote, rather than a flat GuildMark shipping allowance."
pass_through_model:
  status: "modeling_assumption"
  service_collection: "Collect the partner-quoted amount and pay that amount to the selected partner."
  shipping_collection: "Collect the FedEx-quoted amount and pay that amount to the carrier."
  guildmark_subsidy_default: 0
  payment_flow: "Assume collection in GuildMark checkout for modeling; direct payment by the customer to the partner or carrier has not been confirmed."
  qualification: "Quote availability, live API integration, checkout collection, and settlement are requirements or assumptions, not claims about implemented behavior. Final invoice differences remain unresolved."
pro_discretionary_benefits:
  status: "proposal_pending_validation"
  eligibility_basis: "Verified Pro buyer company; eligibility rules require confirmation."
  company_month_cap:
    status: "proposed_not_user_approved"
    amount_usd: 25
    scope: "Total discretionary subsidies and credits per eligible company per calendar month, not per user, asset, or order."
    rollover: false
  company_wide_planning_reserve:
    status: "proposed_not_user_approved"
    percent: 5
    rate: 0.05
    basis: "Positive company-wide contribution after modeled costs and before Pro discretionary subsidies; zero allocation when that contribution is not positive."
  qualification: "The cap and reserve are planning proposals pending real claim data and subscription economics. Neither is a promised entitlement or an implemented benefit."
  tier_separation:
    - "Buyer Pro benefit eligibility is separate from the seller's commission tier."
    - "A Pro buyer purchasing from a Free seller still models the Free seller commission; purchasing from a Pro seller models the Pro seller commission."
  exclusions:
    - "The proposed discretionary budget does not cap mandatory refunds, actually incurred Square fees, or principal losses."
    - "Recognize full actual costs and liabilities in the ledger regardless of remaining benefit budget."
  loss_assumptions: "Return rates, claim frequency, and recoverable amounts are unknown. Do not assume returns or losses are rare."
  rollout: "Planning and economics documentation only; no checkout, live configuration, or accounting implementation changes are authorized by this record."
open_decisions:
  - "Funding purpose and amount"
  - "Shipping payer obligations, quote validity, and any explicitly approved subsidies"
  - "Partner and carrier final-invoice adjustments, cancellations, and refunds"
  - "Collection and settlement flow versus direct customer payment to providers"
  - "Published network-service fee payer and calculation-base wording"
  - "Tax applicability and refund treatment for the network-services fee"
  - "Pro discretionary benefit eligibility, cap, and reserve allocation; measured subscription economics"
  - "Measured return and claim rates, actual refund costs, and recoverable principal"
source_precedence:
  - "The latest approved Free/Starter/Growth/Pro seller schedule of 14%/14%/12%/10% supersedes the earlier 14%/12%/10%/8% schedule."
  - "This user-approved schedule supersedes conflicting marketplace fee percentages in supplied historical plans, slides, and old seed defaults."
  - "The approved USD 39/99/199 subscription catalog and explicit physical-unit and valuation-credit limits supersede older conflicting descriptions. Earlier 2/5/15 seats are superseded by the separate approved seat design."
  - "Illustrative financial scenarios must identify their assumed tier mix and costs and must not be presented as forecasts or actual subscribers or MRR."
---
