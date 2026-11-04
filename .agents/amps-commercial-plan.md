---
schema_version: 1
id: amps_commercial_plan
name: AMPS Commercial Plan
status: approved_prices_and_limits_pending_implementation
recorded_on: '2026-10-30'
currency: USD
purpose: Record approved AMPS monthly company prices and numerical limits, with unfinished feature targets, launch
  gates, and economic assumptions clearly separated.
approval_boundary:
- The user approved Starter/Growth/Pro monthly prices of USD 39/99/199 and the physical-unit and valuation-credit
  limits below; earlier 2/5/15 seats are superseded by the user-approved one-owner and rounded USD 8/20/40 extra-seat
  design on October 30 2026.
- Local application pricing and limit implementation is authorized; enforcement, working capabilities, billing integration,
  and production readiness still require evidence.
- The USD 25 Pro discretionary benefit and 5 percent pool remain unapproved proposals; price and limit approval
  does not approve them.
- Model inputs and proposed policy are separate from measured costs and current product capability.
positioning:
- AMPS should earn its subscription through valuation, portfolio decisions, and resale preparation, alongside reliable
  asset records.
- Asset tracking alone is insufficient evidence that customers will choose these limits or prices. Validate willingness
  to pay with prospective asset owners.
plans:
  free:
    monthly_company_price: 0
    product_access: Marketplace only; no AMPS subscription access.
    approved_seller_fee_percent: 14
  starter:
    monthly_company_price: 39
    active_physical_asset_unit_limit: 100
    included_owner_seats: 1
    monthly_valuation_credit_limit: 200
    approved_seller_fee_percent: 14
    target_customer: Small asset owner testing valuation and resale preparation.
    features: All core AMPS launch targets, subject to the launch gates below.
  growth:
    monthly_company_price: 99
    active_physical_asset_unit_limit: 500
    included_owner_seats: 1
    monthly_valuation_credit_limit: 1000
    approved_seller_fee_percent: 12
    target_customer: Asset owner managing a larger fleet and repeated disposition batches.
    features: All core AMPS launch targets; future history reports and batch workflow improvements remain roadmap
      items.
  pro:
    monthly_company_price: 199
    active_physical_asset_unit_limit: 2000
    included_owner_seats: 1
    monthly_valuation_credit_limit: 4000
    approved_seller_fee_percent: 10
    target_customer: Larger asset owner needing more fleet, user, and valuation capacity.
    features: All core AMPS launch targets; future saved or custom reports and integration onboarding remain roadmap
      items.
seat_design:
  status: user_approved_design_pending_membership_roles_and_verified_billing
  included_owner_per_paid_company: 1
  extra_seat_price_basis: Approximately 20 percent of base, rounded to approved USD 8/20/40.
  approved_monthly_extra_seat_prices_usd:
    starter: 8
    growth: 20
    pro: 40
  paid_extra_seats_default: 0
  revenue_boundary: Model seat prices only. No earned add-on revenue, working purchase flow or paid extra-seat entitlement
    is assumed. No automatic extra-seat charges are approved.
  approved_maximum_extra_seats: null
  role_targets:
    owner: Company ownership and authorized purchasing.
    billing_admin: Explicitly delegated purchasing and billing; distinct from inventory editing.
    operator: Permitted inventory operations without purchasing authority.
    viewer: Read-only company data access.
  activation_gates: Persisted company memberships, invitations, role enforcement, seat lifecycle, verified billing
    and reconciliation must pass tests before additional seats can be purchased or activated.
  processing_target: If approved and billed on the same company invoice, calculate processing on the combined base
    and add-on amount with one fixed processing fee, not a second fixed fee per seat. Incremental support and cloud
    costs remain unknown.
shared_fees:
  buyer_fee_percent: 2.8
  network_service_fee_percent: 4
  policy: Retain these user-approved rates; the approved subscription prices and limits do not change them.
  calculation_basis: Confirm the applicable subtotal, collection responsibility, tax, shipping, refund, and discount
    treatment in the approved fee policy.
core_launch_targets_all_paid_plans:
- Persisted asset inventory with create, read, update, and delete workflows.
- Validated CSV import and export scoped to the authenticated company.
- Portfolio summary grounded in the company's persisted asset data.
- Supported laptop model valuations with inputs, estimate limitations, and model information.
- Read-only guided AMPS assistant for inventory, supported valuations, and unsaved listing previews.
- Invoice drafts with validated source data; this remains pending implementation and is not a completed invoicing
  service.
limit_definitions:
  active_assets:
    unit: Physical units, calculated as SUM(quantity) across active in-scope asset records.
    rules:
    - A record containing 50 physical devices counts as 50 units, not one asset toward the cap.
    - Enforce quantity, import, edit, and reactivation limits centrally so grouping records cannot bypass the cap.
    - Define active and archived lifecycle states and counting behavior before enforcement; archival must not silently
      remove transaction history or ownership evidence.
  seats:
    unit: 'Approved design: one included owner; paid extra company user prices are approved, but paid entitlements
      are not implemented.'
    rules:
    - Implement and verify invitations, role-based permissions, and active-seat counting before promising additional
      seats.
    - Specify pending-invitation, deactivation, and ownership-transfer behavior before launch.
  valuation_credits:
    unit: Successful fresh supported asset estimates per company billing month.
    rules:
    - Count a fresh successful estimate for a distinct asset record as one credit; value quantities using the unit
      estimate and show the aggregation separately.
    - Quantity still counts toward the physical asset cap even when one inference supplies a unit estimate for a
      grouped record.
    - Do not consume another credit for a cached result, a failed estimate, or an idempotent retry of the same successful
      request.
    - Define freshness, cache validity, success recording, billing-period boundaries, and concurrent-request handling
      before enforcing the counters.
    - All estimate routes must use the same company credit ledger; the assistant must not be the only metered entry
      point.
  assistant_batch:
    supported_asset_type: Laptop only for the current guided assistant valuation flow.
    maximum_asset_records_per_request: 5
    applies_to: Every paid tier.
    rules:
    - Five selected records is a request boundary, not a five-device cap or permission to bypass company unit limits.
    - Listing previews remain unsaved and do not publish marketplace listings.
    - The current valuation confidence is a heuristic, not a certified valuation or calibrated accuracy guarantee.
current_delivery_status:
  review_basis: Post-implementation local verification, October 30 2026. Root browser/API checks and API/frontend
    suites passed as scoped in amps-launch-readiness.md. No production deployment or live recurring payment validation
    is implied.
  backend_api_backed:
  - Portfolio summary, with quantity-aware value aggregation still requiring correction and verification.
  - Read-only guided assistant with supported valuation and listing-preview actions.
  - Persisted inventory create/read/update/archive workflow with reload verification.
  - Atomic CSV import of 1 to 50 records; rejected over-cap batches save no partial rows. CSV export preserves quantity
    and purchase dates.
  - Atomic company physical-unit limits and central paid laptop valuation credits with cache reuse; locally verified
    exact-cap and changed-input behavior.
  local_state_prototypes:
  - MDM connection and synchronization demonstrations are simulated and are not verified working integrations.
  - Invoice screens use local React state and are not a validated persisted invoice workflow.
  - MDM API placeholders do not establish that a synchronization job is enqueued or performed.
  - PDF invoice download remains a TODO.
  - A real single-asset listing API exists, but bulk UI buttons without handlers are not working bulk publication.
    The assistant remains preview-only.
  not_enforced:
  - Additional-seat provisioning, company memberships and invitation workflows remain unavailable; one included
    owner only.
  - Owner/Billing Admin/Operator/Viewer membership roles and verified extra-seat billing remain launch requirements.
  claims_boundary:
  - Do not sell a working MDM connection until the connector is functional and verified in the intended environment.
  - Do not advertise automation, SSO, a dedicated account manager, unlimited usage, or assistant listing publication
    as included capabilities.
  - API-backed and locally verified do not mean deployed, production-authenticated, or commercially launch-ready.
  verified_local_evidence:
  - Root verified 99+2 physical units rejected without partial writes, 99+1 persisted at100, and an additional license
    saved with100 physical units across3 records.
  - Fresh laptop estimates charged credits0 to2; cached previews2 to2; changed input2 to3; cached preview3 to3.
    Selected totals represented100 physical units.
  - 101 Dart API tests passed with1 opt-in fixture skip;24 frontend Node tests and AMPS-enabled build passed. See
    readiness file for optional pristine-fixture caveat and evidence paths.
  remaining_launch_requirements:
  - Production authentication and deployment rehearsal.
  - Recurring paid-invoice and signed provider/webhook reconciliation; manual unknown-payment recovery.
  - Existing runtime price configuration and provider catalog verification.
  - Memberships, invitations, purchasing-role enforcement and extra-seat billing.
  - Durable background jobs and deployed ML cache-version rotation.
  - Legacy portfolio quantity-aware aggregation remains unverified; do not infer its correctness from the assistant
    quantity totals.
  - MDM integrations and persisted invoice/PDF workflows remain unfinished;4 percent service-fee collection is not
    implemented by this AMPS patch.
roadmap_not_included_until_verified:
  growth:
  - History reports.
  - Batch workflow improvements.
  pro:
  - Saved and custom reports.
  - Integration onboarding after the relevant integrations function and are tested.
proposed_billing_and_limit_policy:
  billing: Monthly per company; cancellation takes effect at the end of the billing period.
  overage_policy: No automatic overage charges or automatic upgrades; overage prices are not defined.
  cap_behavior:
  - At the asset cap, pause additions or edits that increase counted units; allow actions that reduce the count.
  - At the valuation-credit cap, pause fresh valuation refreshes without charging for additional credits.
  - At the seat cap, pause additional active-seat provisioning until capacity is available.
  - Retaining access to view and export existing data after a cap or downgrade is the proposed product target, subject
    to the approved access and retention policy.
  policy_decisions_pending:
  - Exact grace periods, effective downgrade rules, and treatment of accounts already above a lower-tier cap.
  - Post-cancellation access, data export window, retention period, and deletion behavior.
  - Proration, refunds, renewals, failed payments, and billing-period definitions.
  boundary: No grace period, permanent access, or data-deletion promise is approved by this proposal.
economic_assumptions_for_workbook:
  subscriber_count_default: 0
  actual_subscriber_count: Unknown; do not report modeled subscribers or MRR as traction.
  support_loaded_cost_per_hour: 30
  support_minutes_per_account_per_month:
    starter: 10
    growth: 20
    pro: 30
  incremental_cloud_allowance_per_account_per_month:
    starter: 1
    growth: 3
    pro: 8
  cloud_allowance_basis: Incremental storage and background-operations allowance only. Excludes per-visit serving
    cost already modeled on Growth; do not count that serving cost twice. These allowances are assumptions, not
    observed costs or vendor quotes.
  subscription_processing_assumption: 2.9 percent plus USD 0.30 per successful monthly subscription payment, rounded
    to cents; verify the actual merchant rate.
  illustrative_subscription_contribution_per_account_per_month:
    starter: 31.57
    growth: 82.83
    pro: 169.93
  contribution_basis: Approved subscription price less assumed payment processing, support time at USD 30 per hour,
    and the tier's incremental cloud allowance. Before fixed company costs, customer acquisition, and any Pro marketplace
    credits or discretionary reserve allocation.
  assumptions_status: Planning inputs to measure, not observed costs or provider quotes.
  support_boundary: The support-minute assumptions are economic estimates, not included support entitlements, response-time
    promises, or customer-facing caps.
separate_risk_reserve_proposal:
  status: proposed_for_review
  pro_discretionary_reserve_per_company_per_month: 25
  company_pool_cap_percent: 5
  boundary: Keep separate from subscription entitlement and revenue. This is not a cap on customer refunds or payment
    obligations.
  current_workbook_basis: Marketplace contribution only, referenced by Growth!K24 in the existing economics model.
    Subscription revenue remains excluded from this pool unless its inclusion is explicitly modeled and approved;
    catalog approval alone does not expand the reserve.
  proposed_pool_budget: No more than 5 percent of positive company marketplace contribution; a negative contribution
    does not create a negative reserve or a funding credit.
  funding_boundary: The proposed USD 25 per Pro company per month is discretionary and subject to the company pool;
    it is not a guaranteed funded amount or a customer benefit.
  pending_definition: Approve reserve accounting, allocation, and use rules before adopting this proposal as policy.
customer_upgrade_economics:
  basis: Compare approved monthly subscription charges and user-approved seller fees at the same eligible monthly
    hardware GMV. Exclude tax and other benefits; verify the final fee basis before using these figures commercially.
  starter_to_growth:
    additional_monthly_subscription: 60
    seller_fee_saving_percentage_points: 2
    monthly_hardware_gmv_for_fee_savings_to_offset_upgrade: 3000
    formula: (99 - 39) / (0.14 - 0.12) = 3000
  growth_to_pro:
    additional_monthly_subscription: 100
    seller_fee_saving_percentage_points: 2
    monthly_hardware_gmv_for_fee_savings_to_offset_upgrade: 5000
    formula: (199 - 99) / (0.12 - 0.10) = 5000
  growth_compared_with_free:
    monthly_hardware_gmv_for_fee_savings_to_offset_full_subscription: 4950
    formula: 99 / (0.14 - 0.12) = 4950
  pro_compared_with_free:
    monthly_hardware_gmv_for_fee_savings_to_offset_full_subscription: 4975
    formula: 199 / (0.14 - 0.10) = 4975
  starter_boundary: Starter and Free both have a user-approved 14 percent seller fee. Starter must justify its subscription
    price through delivered AMPS functionality; there is no seller-fee saving against Free.
existing_price_conflicts:
  public_pages: 39 / 79 / 149 monthly; limits of 350 / 700 / unlimited appear in existing materials.
  checkout_configuration: 49 / 149 / 349 monthly; limits of 100 / 500 / unlimited appear in existing configuration.
  resolution: The approved 39 / 99 / 199 prices, asset caps and credits supersede earlier descriptions. The approved
    one-owner plus rounded paid-seat design supersedes earlier 2/5/15 seats. Reconcile pages, checkout, provider
    catalog, billing, and enforcement; this policy file does not itself change runtime behavior.
launch_gates:
- Persist inventory changes and verify import and export correctness, ownership, quantity counting, and recovery
  after reload.
- Correct portfolio fair-market-value aggregation to count physical quantities and include quantity in CSV export
  and reimport.
- Implement full-fleet pagination for assistant selection and summaries; a 50-record display must not be presented
  as the entire fleet. Retain the five-record request limit.
- Verify production authentication, company isolation, role-based permissions, seat invitations, and entitlement
  provisioning.
- Enforce all tier counters centrally across routes, including imports, direct estimates, retries, and concurrent
  requests.
- Reconcile approved prices and fees across marketing pages, checkout, billing events, renewal, cancellation, refunds,
  and provisioning.
- Reconcile the Square catalog with client and backend fallback prices and the amount actually recorded and charged.
- Implement and validate invoice drafts before listing them as an available plan feature.
- Verify each integration's actual operation before including connection or synchronization benefits.
- Measure support workload, marginal inference and serving costs, and conversion before treating the workbook assumptions
  as forecasts.
competitive_context:
  source: https://snipeitapp.com/pricing
  checked_on: '2026-10-30'
  observed_offer: Snipe-IT Basic Hosting lists USD 39.99 monthly and unlimited assets and users.
  implication: Test AMPS value in valuation and resale decisions rather than assume a limited asset tracker is competitively
    superior. This is one pricing reference, not a complete competitor analysis.
---
