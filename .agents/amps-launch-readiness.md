---
schema_version: 1
id: amps_launch_readiness
name: AMPS Launch Readiness
status: local_phase_verified_production_launch_gates_open
recorded_on: '2026-10-30'
scope: Approved AMPS catalog rollout and launch requirements; local work only.
commercial_authority: commercial-policy.md subscription_catalog and marketplace_fees
approved_catalog:
  monthly_company_prices_usd: Starter 39; Growth 99; Pro 199
  physical_asset_unit_limits: Starter 100; Growth 500; Pro 2000; count SUM(quantity).
  monthly_successful_fresh_valuation_credits: Starter 200; Growth 1000; Pro 4000
  seller_fee_percent: Free 14; Starter 14; Growth 12; Pro 10
  buyer_fee_percent: 2.8
  network_service_fee_percent: 4
seat_design:
  status: user_approved_design_not_live_paid_entitlement
  included_owner_all_paid_tiers: 1
  approved_extra_seat_prices_usd_monthly:
    starter: 8
    growth: 20
    pro: 40
  extra_seat_price_basis: Approximately 20 percent of base, rounded to USD 8/20/40 and approved by user. No automatic
    charges or working extra-seat entitlements.
  paid_extra_seat_count: 0
  maximum_extra_seats: Not approved.
  role_targets: Owner and Billing Admin spending privileges; Operator inventory privileges; Viewer read-only. Memberships
    and enforcement pending verification.
  supersession: Prior 2/5/15 included seats are superseded by this approved commercial design. Approved base prices,
    asset caps and valuation credits remain unchanged.
verification_rules:
- Approval of a price or cap is not evidence that it is implemented or enforced.
- Keep each gate pending until its implementation, environment, and test evidence are recorded.
- Local emulator checks do not establish provider sandbox, production authentication, HTTPS, or deployment readiness.
- Do not modify cloud settings, payment-provider catalogs, secrets, or customer data under this checklist alone.
gates:
  production_authentication:
    status: blocked_before_rollout_review
    observed: main.dart accepts legacy and firebase-emulator auth modes. FirebaseAuth requires a demo project and
      explicit loopback emulator host; production Firebase authentication is not established by that path.
    references:
    - api/bin/main.dart
    - api/bin/lib/auth/firebase_auth.dart
    - api/bin/lib/auth/firebase_sessions.dart
    required_evidence: A deliberate production authentication path with token or session validation, refresh and
      revocation, secure HTTPS cookies, and cross-company and staff/customer isolation checks.
  catalog_consistency:
    status: local_catalog_verified_runtime_and_provider_reconciliation_pending
    observed: Root browser/API checks confirm approved base prices, fees, one included owner and rounded extra-seat
      price metadata. Existing persisted platform configuration and live provider catalogs are not established by
      these local checks.
    required_evidence: Matching approved prices, integer cents, physical-unit caps, seats, and credits across plan
      cards, settings, checkout, server catalog, seed fixtures, and API responses. Validate persisted runtime overrides
      and Square catalog variation amounts without assuming local constants control the provider.
  billing_authorization:
    status: local_owner_guard_implemented_full_membership_roles_pending
    observed: Read-only review confirms a persisted customer billing-owner check on checkout/cancellation rather
      than JWT role alone. Owner/Billing Admin/Operator/Viewer membership lifecycle and additional-seat provisioning
      remain unfinished.
    references:
    - api/bin/routes/subscriptions/checkout.dart
    - api/bin/routes/subscriptions/cancel.dart
    required_evidence: Only authorized company billing roles can purchase, switch, or cancel a plan; another company,
      ordinary member, or forged role cannot change billing.
  payment_and_provisioning:
    status: sandbox_single_period_guarded_recurring_and_live_provider_validation_blocked
    observed: Sandbox single-period checkout persists an idempotent company-scoped intent and billing lock, requires
      COMPLETED payment and exact amount/currency/reference/location before atomic invoice and plan provisioning.
      Configured recurring plans return 503 before provider mutation after read-only catalog verification; production
      direct charges are disabled. This is not a working recurring billing service.
    required_evidence: Persisted idempotent checkout attempts; authoritative amount, currency, company, and provider
      status checks; no activation from pending or failed payments; recovery after timeout or database failure;
      signed replay-safe lifecycle events; renewal and failed-payment reconciliation; invoices matching the actual
      charge.
    unresolved_unknown_payment: If the provider charge succeeds but its response/payment ID is lost, a persisted
      prepared intent may remain company-locked after browser reload when the original nonce is unavailable. Keep
      access ungranted and require manual reconciliation; do not encourage a second charge or claim automated recovery.
  cancellation_and_downgrade:
    status: pending_policy_and_reconciliation
    observed: Provider cancellation failure now returns an unconfirmed error instead of claiming successful cancellation.
      Effective period-end access, refunds, grace, downgrade and retention policies still need approval and reconciliation;
      local cancellation must not be represented as proven end-of-period service.
    required_evidence: Approved effective-date, refund, grace, downgrade, and retention policy; provider cancellation
      reconciliation; correct period-end access; retry-safe failure handling; clear customer status while provider
      outcome is uncertain.
  physical_unit_cap:
    status: local_physical_quantity_and_nonphysical_cap_ui_verified
    required_evidence: Atomic company-wide SUM(quantity) checks on create, quantity increase, import, reactivation,
      and any parallel write path. Test exact cap, one over cap, grouped records, concurrent requests, and attempts
      to supply another company ID.
    observed: Atomic company-wide create/import/update paths count physical quantities, including paid marketplace
      create paths. Root verified 99 plus 2 rejected atomically and 99 plus 1 persisted at 100. At 100/100, a license
      record saved through the UI without increasing physical-unit usage or consuming valuation credits. Three saved
      records represented 100 physical units; paid inference remains laptop-only.
  valuation_credit_cap:
    status: local_fresh_cache_credit_flow_verified_launch_operations_pending
    required_evidence: One company billing-period ledger across direct estimates, assistant, listing-related valuations,
      and background refresh. Test concurrent last-credit requests, idempotent retries, cached estimates, failed
      inference, reset boundaries, and downgrade. Distinguish user-requested fresh valuations from maintenance operations
      before charging a credit.
    observed: Shared metering covers inference entry points; paid estimates are centrally laptop-only, cache reuse
      avoids duplicate credit charges, and failure leases release reservations. Root real-ML evidence verifies 0
      to 2, cache 2 to 2, one changed input 2 to 3 and cached preview 3 to 3. Full production rollover, operating
      limits and deployed model-version rotation still require validation.
    cache_version_launch_gate: Tie deployed model changes to explicit ML cache-version rotation and verify cache
      invalidation across all instances; a static version string must not silently preserve old-model estimates.
  seats_and_permissions:
    status: pending_implementation_and_tests
    observed: One-owner and extra-seat approved metadata is not a working membership, invitation, role or add-on
      billing system.
    required_evidence: Persisted invitations and company memberships; one included owner; approved paid capacity
      and verified billing before extra-seat activation; transactional seat counting; deactivation and transfer;
      Owner/Billing Admin purchase authorization distinct from Operator/Viewer data access; no staff/admin privilege
      leakage. No automatic charge or arbitrary extra-seat cap is approved.
  persisted_asset_workflow:
    status: local_create_edit_reload_csv_quantity_verified
    required_evidence: Inventory CRUD persists across reload and sessions; CSV import/export preserves quantity
      and ownership, validates data and caps, and reports partial failures without silently losing records. Company
      boundaries hold on every endpoint.
    observed: Root actual browser/API checks verified persisted creation, purchase-date edits and reload, atomic
      rejected import, successful exact-cap CSV import and quantity/date export. Maintain company isolation and
      archive/reservation regression coverage before deployment.
  portfolio_and_assistant:
    status: local_quantity_and_real_ml_cache_verified_full_fleet_limits_explicit
    observed: Local integration verified quantity-aware totals for 100 units, supported laptop estimates, cache
      reuse and read-only unsaved listing previews. Five selected asset records remain the request cap. The guided
      assistant first-50 display must not be presented as full-fleet coverage; full inventory pagination is distinct.
    required_evidence: Correct per-unit and quantity-weighted totals, clearly paginated full-fleet selection, supported
      laptop valuation inputs and failure states, no cross-company disclosure, no hidden listing creation, and no
      quota bypass through alternative routes.
  invoices_and_integrations:
    status: not_ready_as_paid_feature_claims
    observed: Invoice local-state screens, invoice PDF TODOs, simulated MDM sync, and placeholder endpoints do not
      establish working services.
    required_evidence: Persisted, source-validated invoice drafts and tested export before advertising them. Verify
      each MDM integration and durable synchronization workflow before making connector promises.
  public_surface_and_errors:
    status: local_frontend_tests_build_and_inventory_cap_ui_verified_launch_claims_pending
    required_evidence: Accurate plan copy and fee descriptions; no unlimited, SSO, dedicated manager, MDM, or automation
      promise without delivery. Preserve prelaunch and AMPS feature flags. Provide accessible loading, empty, quota,
      permission, payment-pending, and provider-failure states without displaying success on uncertain outcomes.
    observed: Root verified current local plan metadata, persistent inventory UI and successful license-record creation
      at the physical-device cap. Additional seats remain unavailable to purchase; MDM/invoice/automation features
      cannot be promised without evidence. Nonphysical inventory storage does not enable unsupported non-laptop
      paid valuations.
  deployment_rehearsal:
    status: pending_separate_authorized_environment_work
    required_evidence: HTTPS authentication, production indexes, IAM and secrets, payment-provider sandbox and webhook
      tests, backup and recovery, durable jobs, telemetry, and cost checks in the intended environment before launch.
      No deployment is claimed by local tests.
  subscription_expiry:
    status: fail_closed_implemented_local_suite_passed
    observed: Read-only code confirms paid access requires an approved plan, active status, non-null period start/end,
      start not in the future and unexpired end. Backend confirms missing or expired paid periods fail closed. Retained
      inventory access is distinct from fresh paid actions.
    required_evidence: Verify intended production renewal events maintain periods and do not grant indefinite legacy
      paid access. Establish deliberate migration and reconciliation for missing legacy periods.
  durable_background_operations:
    status: pending_production_job_design_and_rehearsal
    required_evidence: Durable queued jobs, restart recovery, idempotent retries, failure visibility and quota accounting
      for background valuation/MDM work in the intended hosting environment. Request-scoped or in-process fire-and-forget
      execution is not a durable queue.
  network_service_collection:
    status: approved_rate_collection_not_implemented_outside_amps_patch_scope
    observed: The approved 4 percent network-service rate does not establish actual checkout collection, provider
      payout reconciliation or service-quote implementation. This was not delivered by the AMPS pricing/quota patch.
    required_evidence: Implement and verify agreed service fee basis, authoritative quotes, collection, refunds
      and provider settlement before claiming live service-fee revenue.
unapproved_benefits:
  pro_company_month_cap_usd: 25
  company_pool_percent: 5
  status: proposed_not_user_approved
  boundary: Do not provision, promise, or charge for these discretionary benefits based on catalog approval. They
    do not cap refunds or liabilities.
handoff:
  product_delivery: Implement scoped code changes and provide changed files, commands, results, and remaining gaps.
  reliability: Review authorization, quota races, payment state, customer-facing errors, and local regression evidence
    independently.
  business: Align claims with verified delivery; retain economic assumptions and pending commercial policies explicitly.
  lead: Consolidate gate evidence and report demo readiness separately from production readiness.
local_phase:
  status: completed_with_scoped_local_evidence
  environment: Isolated local Firebase emulator, locally built AMPS frontend and existing ML artifact service. No
    deployment or live provider mutation claimed.
  evidence_provenance: Project Lead supplied full-suite and browser/API results; Reliability performed read-only
    code review. This record does not imply Reliability independently reran every test.
  automated_checks:
    backend: 101 Dart API tests passed, with 1 explicitly opt-in fixture test skipped in the main run.
    optional_fixture_caveat: A separate optional fixture attempt expected a pristine global employee count of 2
      but observed 8 in existing state. Treat this as a pristine-fixture requirement, not a confirmed core product
      regression.
    frontend: 24 Node tests passed; build with AMPS enabled passed.
  browser_api_verified:
  - Monthly prices USD 39/99/199; seller fees Free/Starter/Growth/Pro 14/14/12/10 percent; one included owner and
    additional-seat price metadata USD 8/20/40.
  - Created 99 physical units, edited purchase_date, and verified persisted records after reload.
  - Adding a 2-unit CSV batch at 99/100 was rejected without partial writes.
  - Imported a 1-unit CSV record and verified persisted total 100/100. CSV export preserves quantities and purchase
    dates.
  - 'Real local ML integration: first two fresh asset-record estimates increased credits 0 to 2. Listing previews
    reused cache with credits 2 to 2.'
  - 'Changing one model input caused exactly one fresh estimate: credits 2 to 3; preview reuse kept credits 3 to
    3. Selected quantity-aware totals represented 100 physical units.'
  - 'At the 100/100 physical-device cap, an additional license record saved through the UI: 3 saved records still
    represented 100 physical units. Saving software/license inventory consumed no valuation credits; paid inference
    remains laptop-only.'
  - Updated inventory-persisted.png shows 100/100 physical units, 1/1 included owner seats and 3/200 used valuation
    credits with 197 remaining after real-ML/cache verification.
  saved_evidence:
  - outputs/amps-launch-validation/real-ml-verification.json
  - outputs/amps-launch-validation/inventory-persisted.png
  - outputs/amps-launch-validation/verified-export.csv
  interpretation: Local feature and quota verification supports this completed phase. It does not establish measured
    ML accuracy, calibrated confidence, live payment reconciliation, production authentication or commercial launch
    readiness.
  code_graph: 'Project Lead regenerated the local code graph successfully: 4622 nodes and 7782 edges. This is navigation
    metadata, not additional runtime or deployment proof.'
  runtime_shutdown: API, ML, Vite and emulator validation processes are being stopped after local verification.
    No live deployment or continuously running service is claimed.
---
