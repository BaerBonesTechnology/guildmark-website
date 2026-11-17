---
schema_version: 1
id: "deployment_strategy"
status: "proposed_for_review"
as_of: "2026-10-30"
region: "us-central1"
currency: "USD"
objective: "Keep the public product reachable with low idle infrastructure cost and measurable contribution per completed order."
deployment_authorization: "Planning only. No cloud resources, billing settings, APIs, DNS, or live data are changed by this plan."
architecture:
  frontends: "Serve storefront, DevDash, and partner Vite builds through Firebase Hosting. No persistent frontend containers."
  api: "Cloud Run request-based service, minimum instances 0, maximum 2 initially; benchmark 1 vCPU, 512 MiB, concurrency 20 before committing capacity."
  datastore: "Firestore default database and Cloud Storage in the same eligible US region where appropriate; server-authorized access to business records."
  ml: "Separate private, request-based Cloud Run inference service, minimum 0. Load an immutable reviewed artifact. Disable startup training and the in-process scheduler. Benchmark memory, concurrency, cold starts, and request timeout."
  tasks: "Use durable, idempotent task handling for work that must complete beyond a request; use explicit jobs for training and batch evaluation."
  model_state: "Keep model artifacts, tracked queries, job status, and required recovery state in durable storage; do not rely on instance-local files or process locks."
  connectivity: "Avoid reserved public IPs, VPC connectors, NAT, and external load balancers unless a verified requirement justifies their recurring cost."
launch_gates:
  - "Implement and verify production identity-token validation, secure session cookies, provisioning, recovery, and abuse controls; the explicit cloud adapter now has signature, revocation and cookie tests, while HTTPS staging verification and abuse controls remain required."
  - "Package a reviewed ML artifact and prove missing/corrupt artifacts fail readiness rather than trigger cold-start training."
  - "Implement service-account invocation and Google ID-token authentication for private ML; the existing shared application bearer token alone does not satisfy Cloud Run IAM."
  - "Replace required fire-and-forget workflows and process-local scheduling/state with durable, retry-safe execution."
  - "Bound marketplace database reads, cache shared results, resize images, and avoid duplicate inference requests for unchanged asset inputs and model version."
  - "Verify production Firestore indexes, ownership checks, HTTPS sessions, webhook retries, payment reconciliation, and settlement responsibilities in staging."
  - "Observe a cold-start burst, realistic concurrent uploads, memory limits, partial ML failure, worker termination, and webhook retry before pilot traffic."
benchmark_journeys:
  - "Static landing page and marketplace browse at several active-listing counts."
  - "Product detail and company portfolio at several inventory sizes."
  - "Five-record assistant valuation followed by listing preview."
  - "Image upload, authenticated session restore, and sandbox checkout."
  - "An idle observation period demonstrating no unintended scheduler, probe, or keep-alive traffic."
benchmark_measures:
  - "Cold and warm p50/p95/p99 latency, allocated active instance-seconds, CPU and peak memory."
  - "Billable document, index, aggregation and skipped-record reads; writes; API calls; bytes delivered; image operations; ML calls; logs."
  - "Timeout, error, retry, OOM, throttling, duplicate-action and cross-company-access behavior."
  - "Treat monthly traffic scenarios as cost estimates, not proof that the initial two-instance cap supports every peak."
historical_baseline:
  total: 298.62
  compute_engine: 293.01
  networking: 5.61
  period_days_stated_by_user: 90
  normalized_30_day_cost: 99.54
  period_caveat: "Billing filename spans June 1 to September 30, 2026; the service-level aggregate contains no daily or monthly allocation. The 90-day period is the user's stated basis."
  cpu_context: "316 exported samples from July 8 to September 24 average 23.3077% fractional CPU utilization. Sampling and aggregation do not establish instantaneous peak capacity or traffic attribution."
  traffic_context: "Network exports contain VM received/sent byte rates, not site sessions, billable internet-egress attribution, or per-visit costs."
  current_legacy_resources: "VM stopped; retained 100 GiB and 40 GiB balanced disks and assigned static external IP. Approximately $18/month list-price exposure if retained with billing enabled, separate from the new deployment estimate. Preserve data before any retirement decision."
cost_model:
  artifact: "outputs/deployment-economics/GuildMark_Deployment_Economics.xlsx"
  approach: "Target-workload scenario at public marginal rates, without free allowances or credits. This is not current observed usage."
  monthly_reserve: 5
  reserve_basis: "Editable planning allowance, not a vendor quote or guaranteed all-inclusive idle bill. Validate persistent storage, logs, registry, builds, backups, task/job usage, and support services separately."
  target_session:
    static_hosting_mib: 1
    image_delivery_mib: 2
    image_get_operations: 10
    api_requests: 5
    api_response_mib_per_request: 0.05
    api_effective_billed_seconds_per_request: 0.1
    api_startup_seconds_per_session: 1
    api_vcpu: 1
    api_memory_gib: 0.5
    firestore_billable_reads: 80
    fraction_sessions_using_ml: 0.02
    predictions_per_ml_session: 3
    ml_effective_billed_seconds_per_prediction: 0.25
    ml_vcpu: 1
    ml_memory_gib: 1
  measurement_notes:
    - "Effective billed seconds include allocated compute and rounding; measure concurrency and cold starts instead of substituting raw handler CPU time."
    - "ML prediction duration is an assumption requiring cold-start measurement."
    - "US image delivery and egress assumptions do not price Australia, China, or every destination."
    - "The API response delivery allowance uses a $0.12/GiB assumption. Verify the final direct Cloud Run versus Firebase Hosting rewrite path and its billed network SKU during staging; do not double count the same response or assume Hosting delivery is free."
    - "Free quotas are shared and reset on different schedules. Firestore daily quotas cannot be pooled across bursty days."
    - "A heavier page, unbounded query, bot traffic, or repeated inference can materially raise cost per session."
sale_coverage:
  buyer_rate: 0.028
  seller_rates: "Free 0.14, Starter 0.12, Growth 0.10, Pro 0.08."
  card_rate: 0.029
  card_fixed: 0.30
  card_basis: "Published US Square API rate; verify the actual merchant agreement before adopting as company cost."
  proposed_operations_reserve_per_order: 10
  default_monthly_orders: 1
  formula: "Collected marketplace fees minus processor cost on full customer charge, service/fulfillment costs, operational reserve, allocated monthly baseline, and any profit reserve; divide remaining traffic budget by modeled cost per session, round down, and subtract the converting visit. Negative contribution funds zero additional visits."
  limitations:
    - "Coverage measures serving-cost break-even, not the number of paid-acquisition visits the business can afford."
    - "Subscriptions are excluded until dollar prices, paying accounts, and support costs are confirmed."
    - "Pass-through service receipts must fund provider payables and can still create payment-processing expense."
    - "A first sale covers the entire monthly baseline by default; increasing assumed monthly orders must not be mistaken for existing traction."
rollout:
  - "Prepare serving-only builds and close auth, IAM, durable-task and query/image cost gaps locally."
  - "Rehearse in isolated staging with representative synthetic data and payment sandbox."
  - "Measure idle behavior plus cold/warm and burst workloads; replace cost-model assumptions with observed units."
  - "Set billing alerts, application rate limits, upload limits, bounded ML usage and concurrency. Maximum instances and alerts are not hard total-spend caps."
  - "Review evidence and authorize a small pilot deployment; keep rollback resources explicit and time-bound."
  - "Revisit minimum instances only when measured latency or customer demand justifies their recurring cost."
sources:
  - "https://firebase.google.com/pricing"
  - "https://cloud.google.com/run/pricing"
  - "https://cloud.google.com/firestore/pricing"
  - "https://cloud.google.com/storage/pricing"
  - "https://developer.squareup.com/docs/payments-pricing"
  - "https://docs.cloud.google.com/run/docs/container-contract"
  - "https://docs.cloud.google.com/run/docs/authenticating/service-to-service"
  - "https://docs.cloud.google.com/run/docs/configuring/billing-settings"
---
