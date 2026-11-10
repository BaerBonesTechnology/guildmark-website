# GuildMark Firebase migration

Status: `guildmark-dev` is deployed for HTTPS staging as of November 4, 2026. The user authorized dev billing and deployment. Production resources, billing, DNS and data were not changed. Earlier local-only milestone notes below are historical; see the current dev rollout record at the end.

Both CLIs were verified as `jtwilliams@guildmark.co`. Firebase lists `guildmark-dev` for development and `guildmark-prod` (display name “GuildMark”) for production. Local aliases `dev` and `prod` point to those existing projects; emulator commands explicitly use `demo-guildmark`.

## Target architecture

- Firebase Hosting: three static Vite frontends, each forwarding `/api/**` to Cloud Run.
- Cloud Run: existing Dart Frog API; minimum instances 0, maximum instances 2.
- Firestore: application data, with server-side IAM and browser access denied.
- Cloud Storage: product images; public reads, server-only writes.
- Local startup uses Firebase Authentication behind the API, with the Auth emulator. Existing JWT/password code is retained for an explicit legacy rollback; it is never a fallback within Firebase mode. Cloud Auth cutover remains disabled.
- No Postgres, Appwrite, frontend containers, or always-on ML instance are required by this target. ML is disabled in the deployment template.

The service specification is a future deployment template. Actual spend depends on requests, database operations, storage, egress, builds, and logs. Maximum instances and budget alerts are not hard total-spend caps.

## Local workflow without billing

### Start the whole stack with Doppler (Windows)

From `D:\Projects`, run:

```powershell
.\start-local.ps1
```

This selects `guildmark/dev_personal` explicitly, loads Doppler once, checks dependencies and free ports, starts the Firebase emulators, seeds local configuration, starts ML and the API, and starts all three Vite apps. Existing processes are never stopped to make room. Stop any individually running services first, or use `-PortOffset 10000` to start an isolated second stack.

| Service | Default URL |
| --- | --- |
| Storefront | http://localhost:5173 |
| Staff dashboard | http://localhost:3001 |
| Partner portal | http://localhost:3002 |
| API | http://127.0.0.1:8080/api/ |
| ML health | http://127.0.0.1:8001/health |
| Firebase emulator UI | http://127.0.0.1:4000 |

Keep that terminal open. Ctrl+C saves local data before stopping the process tree owned by the launcher; startup failure also cleans it up. Per-service logs are in the printed `tmp/local-stack/<run>/` directory. Auth, Firestore and Storage are imported together from `state/local-firebase/ports-0/` on restart. The launcher exports after seeding, every 60 seconds, and before shutdown, retaining three snapshots. An abrupt termination can lose changes since the last completed export. Each port offset has its own state directory; state is ignored by Git. These exports are development recovery snapshots, not coordinated production database backups.

### Seeded local accounts and checkout fixtures

The launcher creates these accounts on first use. Their shared **initial local-only password** is `GuildMark-local-2026!`:

| Account | Email | Purpose |
| --- | --- | --- |
| Buyer | `buyer@guildmark.test` | Customer admin of Local Buyer Company; purchase seeded listings |
| Seller | `seller@guildmark.test` | Customer admin of Local Seller Company; inspect listings and orders |
| Staff | `staff@guildmark.co` | GuildMark administrator; enroll a passkey at first dashboard login |

The staff identity starts with `{"role":"staff","staff_permissions":["superadmin"]}` and a separate active employee record with GuildMark's `admin` role. Customer company admins have no staff access. Claims alone do not grant API access or bypass passkeys: the API checks the employee record and staff session. Existing local identities keep their passwords and claims, and existing linked employees keep their IDs, roles, status and passkeys. Cloud identities and claims are untouched.

The seller owns two active synthetic listings: 25 laptops at $100 each and 10 monitors at $50 each. Log in as the buyer to test checkout; a one-laptop order is $103 with the default 3% buyer fee. Reseeding preserves changed passwords, stock counters, orders, listing changes, permissions and passkeys. It does not replenish sold or reserved inventory. Actual browser payment testing still needs valid Square sandbox configuration and a sandbox card; seeding never charges a provider.

Use `-Ephemeral` for a fresh disposable scenario without importing or overwriting saved state. `-SmokeTest` is also always ephemeral. Starting Firebase CLI directly does not enable this launcher's persistence. To seed already-running **demo** emulators manually, set `FIREBASE_PROJECT_ID`, `FIREBASE_AUTH_EMULATOR_HOST`, and `FIRESTORE_EMULATOR_HOST`, then run `dart run tool/firebase_seed.dart --fixtures` from `api/bin`; both hosts must be loopback. Use the launcher for automatic saves.

ML and frontends hot reload. The API is generated with `dart_frog build` and run without the interactive Dart Frog CLI; restart the launcher after Dart changes. The launcher binds the API/ML/emulators to loopback and proxies `/api` through each frontend. It enables the local storefront for development while leaving debug shortcuts off. Vite receives only public Doppler values and skips `.env` files in this launcher mode, including any stale `VITE_SQUARE_ACCESS_TOKEN`. Provider URLs use sandbox endpoints; no cloud services are deployed. Doppler credentials are fetched remotely, and actions you invoke in the app can still contact configured external providers.

The prepared ML environment is `ml-qv/.venv-py312`. The launcher requires Java, Firebase CLI, Dart/Dart Frog, Node, existing frontend dependencies, and the JWT/ML secrets in Doppler. It does not install dependencies or change your saved Doppler configuration.

```powershell
# Validate configuration without starting services:
.\start-local.ps1 -CheckOnly
# Start, verify all services and API proxies, then stop:
.\start-local.ps1 -PortOffset 10000 -SmokeTest
# Select another development config:
.\start-local.ps1 -Config dev
# Launcher regression tests:
.\ml-qv\.venv-py312\Scripts\python.exe scripts/test_local_stack.py
.\ml-qv\.venv-py312\Scripts\python.exe scripts/test_local_emulator_state.py
# Two isolated emulator boots verify saved accounts/data (ports offset 10000):
.\ml-qv\.venv-py312\Scripts\python.exe scripts/test_emulator_restart.py
```

### Start services individually

Use Firebase CLI, Java 21+, a Dart SDK satisfying `api/bin/pubspec.yaml`, and existing frontend dependencies. From the repository root, start emulators in one terminal:

```powershell
firebase emulators:start --only "auth,firestore,storage" --project demo-guildmark
```

Start the API in another terminal:

```powershell
./scripts/start-firebase-api.ps1
```

The launcher loads the local environment example, seeds platform fees with deferred payments OFF, and starts port 8080. To customize, copy `backend.env.example` to `backend.env` in this directory (ignored) and pass `-EnvironmentFile` with its path. Set `FIREBASE_ADMIN_EMAIL` and `FIREBASE_ADMIN_PASSWORD` before starting to seed a local staff account. Never commit the password. Seeding refuses a non-demo project.

Vite development servers force `/api` and proxy to `http://127.0.0.1:8080`; set `GM_LOCAL_API_TARGET` for a different local API port. Production builds retain their configured URL. Old Doppler values such as `http://localhost:8443` no longer override development routing.

A self-contained test run starts and stops its own emulators:

```powershell
firebase emulators:exec --only "auth,firestore,storage" --project demo-guildmark "powershell -NoProfile -File scripts/run-firebase-tests.ps1"
```

Stop manually running emulators first to avoid port conflicts. Tests create synthetic demo data only. A plain `dart test` skips integration suites when emulator variables are absent, so use the command above for migration verification. For ML tests, install `ml-qv/requirements-dev.txt` and run `python -m pytest` from `ml-qv/`.

## Local Firebase Authentication

`start-local.ps1` forces `AUTH_MODE=firebase-emulator`, `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`, `WEBAUTHN_RP_ID=localhost`, and the matching dashboard origin (including any port offset). Auth and Firestore must both use loopback emulators and the same `demo-` project. Invalid/missing emulator settings fail closed; there is no automatic cloud fallback. Cloud mode is explicit and verifies signatures; see the cloud integration section below.

The browser talks only to GuildMark routes. Firebase handles credentials, password reset codes, disabled accounts and Firebase session cookies. The API stores those cookies server-side and gives clients random session handles. Only handle hashes are stored. The existing `access_token` response field and bearer transport remain compatible; customer/partner session restore uses host-only HttpOnly, SameSite=Strict cookies scoped to the appropriate auth path. These local HTTP cookies omit Secure; Cloud mode implements secure Hosting cookies and signed verification; HTTPS rehearsal is still required before launch. Sessions expire after eight hours without sliding renewal; `/auth/refresh` restores an existing session until that deadline. Logout revokes that particular session immediately. Password resets also invalidate API sessions, including sessions created in the same second.

New Firebase-mode accounts have no application password hash, legacy refresh record, or legacy reset token. Membership is linked by Firebase UID, never automatically by email. Company admins remain customers; active employee membership and a verified passkey are required for staff. Setup/pending staff sessions last five minutes, cannot read staff data, and are consumed when upgraded. Role changes, employee deactivation and partner suspension are checked against current server records. Direct Firebase tokens and legacy JWTs are rejected in Firebase mode. Legacy env-admin credentials are not a staff login bypass.

The automatic staff fixture above is sufficient for normal local testing. To provision an additional local staff account (password is prompted without echo; nothing is saved to Doppler):

```powershell
$env:FIREBASE_ADMIN_EMAIL = 'you@example.com'
$env:FIREBASE_ADMIN_PASSWORD = [Net.NetworkCredential]::new('', (Read-Host 'Local staff password (12+ characters)' -AsSecureString)).Password
.\start-local.ps1
# After stopping:
Remove-Item Env:FIREBASE_ADMIN_PASSWORD
```

Open the staff dashboard using **localhost**, not 127.0.0.1, and enroll a passkey when prompted. The launcher restores saved emulator data on subsequent starts, so enrollment is only required once for a retained account and browser/device credential. Previous legacy accounts are not silently migrated. Additional customer accounts can be created through the storefront. Staff can be provisioned through the local seed or authorized employee API; partner fixtures require both a Firebase identity and a partner row with its `firebase_uid`.

`test/local_fixtures_test.dart` verifies fixture idempotency, customer/staff separation, initial custom claims, permission changes, password changes, passkey preservation and a checkout reservation. It requires `LOCAL_FIXTURE_TESTS=true` and fresh isolated Auth/Firestore emulators; do not point this mutating test at your saved development data. The restart test above verifies Auth UIDs/passwords, a passkey record, inventory, an order and a Storage upload across a real export/import cycle.

Reset emails are simulated locally. The emulator log/UI exposes the local action link; to exercise GuildMark's reset screen, use `http://localhost:5173/reset-password?oobCode=CODE` with that emulator code. Nothing is emailed externally by the Firebase-mode reset route. Signup in this mode also avoids automatic Square customer creation; payment/customer-provider integration remains a separate pilot check.

Auth tests cover signup/login/restore/logout, reset replay and revocation, disabled users, audience separation, emulator-only configuration, Firebase outages, and a complete passkey registration/assertion flow using independently generated Node crypto signatures. Legacy auth code and its tests remain until a separate cloud-cutover review; `AUTH_MODE=legacy` is required to run it outside test fixtures. The runtime defaults to emulator mode and fails startup if it is not configured; Firebase-mode failures never invoke it. Signed-cookie verification, workload identity and secure cookies are implemented in the explicit cloud adapter. Before rollout, verify abuse limits, account migration/provisioning, email delivery/verification and HTTPS journeys in staging.

Passkey registration advertises both ES256 and RS256 for Windows Hello compatibility. The API stores the selected algorithm with the public key and verifies assertions using that stored algorithm; older ES256 records without this field remain supported. RSA credentials require a 2048–4096-bit modulus. Customer/staff separation, user verification, RP/origin binding and challenge replay checks still apply. Registration now updates DevDash's shared auth state before navigating, avoiding a successful enrollment bouncing back to login. Run `pnpm test` in `devdash` for the component regressions and `pnpm exec tsc --noEmit -p tsconfig.app.json` for its type check. The API emulator suite passes 73 tests; the mutating fixture test is run separately against fresh emulators.

### HAR diagnosis: failed DevDash login

The supplied HAR captured POST and OPTIONS requests from `http://localhost:3001` to `http://localhost:8443/admin/auth`, both with status 0 and no response. The active DevDash Doppler value was `VITE_API_URL=http://localhost:8443`; nginx configuration reserves that legacy port, but no listener was running. The requests failed before the API could authenticate or answer CORS. Development Vite configuration now uses `/api` through its proxy even when Doppler supplies that stale value. Restart Vite/the launcher to load it. No Doppler or cloud settings were modified.

## Compatibility and limits

The adapter retains API shapes, integer money fields, defaults, nullable fields, and uniqueness constraints. Unique values reserve documents in the same transaction as their owner. `schema.json` records definitions extracted from the previous schema. Google application default credentials replace Appwrite API keys; only explicitly configured local emulators receive the emulator owner credential.

Firestore `IN` joins are batched in groups of 30. Substring search uses indexed lowercase grams followed by full-substring verification. Queries requiring a local sort or substring verification have a 500-candidate cap and fail explicitly when too broad. Count aggregations preserve pagination totals. Narrow queries rather than raising the cap without a read-cost review.

Emulators do not enforce production composite indexes. The index file covers known query families; representative query checks remain a production/staging launch gate. Checkout inventory is now transactional. Legacy refresh rotation and payouts still need separate concurrency work; Firebase mode uses fixed-duration sessions and reads current partner status on each request.

## Hosting and sessions

`firebase.json` defines three Hosting targets, an API rewrite before SPA fallback, and local emulators. `.firebaserc` names intended sites; extra sites are not provisioned. Each frontend has a public `.env.production` using `/api`. Run `pnpm build` inside each app folder.

The API supports prefixed and direct routes. Production refresh cookies retain HttpOnly, Secure, and SameSite=Strict, with paths under `/api`. Rehearse browser cookie behavior over HTTPS before launch. Staff authorization is enforced by the API, not Hosting configuration.

Marketplace flags default to pre-launch, debug off, and AMPS hidden. Vite variables must contain only public configuration and payment SDK identifiers. JWT secrets, provider credentials, and ML tokens belong on the backend.

## Deferred launch work

Local verification: 72 Dart tests passed with Auth, Firestore and Storage emulators, including checkout concurrency/recovery, staff/customer boundaries, payment log redaction, ML credentials, Firestore uniqueness/pagination, and storage rules. Two Node tests verify checkout retry persistence; three Vite routing regressions and four launcher tests pass. The API and all three frontend builds pass. The full local launcher smoke test verified all services and frontend proxies plus signup, cookie restore, customer-to-staff denial, logout and cleanup. The changed Dart runtime and test files have no analyzer errors or warnings; the broader legacy Postgres helper still has two existing generic-type warnings. ML endpoint security tests previously passed (27 tests). Production indexes, HTTPS cookies, IAM, and paid-provider flows still require a staging rehearsal.

1. Account alignment is verified. Confirm the previous Firebase CLI session has been revoked: its account-list JSON exposed stored credentials during discovery. Changing the active account alone does not confirm revocation.
2. Enable billing when ready. Firebase is already registered on both projects. Select database/bucket regions and enable required APIs. Current templates use us-central1 for Hosting rewrites and Cloud Run.
3. Create a least-privilege API service account and Secret Manager secrets. Grant datastore access and bucket-scoped object access; do not download service-account keys.
4. Create Firestore and Storage, deploy rules/indexes, and add a guarded production bootstrap for platform configuration and the first staff account. The local seed command intentionally cannot seed production.
5. Complete payment/email/carrier secrets and WebAuthn settings in `cloudrun.yaml`, replace the image tag, and deploy with appropriate invoker access. The template does not create secrets, grant public invocation, or enable billing.
6. Create the additional Hosting sites, deploy frontends, configure domains, and test login, refresh, logout, staff passkeys, images, and indexed queries on HTTPS.
7. Verify budget alerts, monitoring, backup/restore, and cost limits. Private Cloud Run ML invocation and durable background work remain separate tasks; fire-and-forget work cannot be assumed to survive a response boundary.
8. Rehearse checkout with the actual provider sandbox, then complete refunds, seller settlement, accepted-offer funding verification, and fulfillment before accepting money. Retire the old Docker/Appwrite/Postgres deployment only after a verified cutover. Old startup scripts and offline migration tools are retained as legacy references.

## Checkout and inventory pilot

All verification for this milestone used the local emulators and an injected fake payment provider. No payment-provider account, deployment, or cloud resource was changed.

Buy-now requests require `idempotency_key`, positive integer `quantity`, and `expected_total_cents`; a new checkout also requires `source_id`. The backend calculates price and fees and rejects a changed total before reserving or charging. A retry must preserve its key, quantity, quoted total, and original source when available. The frontend persists only the key/quantity/total in session storage; the payment nonce stays in memory. It can resume a recorded payment after a reload without a new nonce.

The pending order, offer, and stock reservation commit together. Stock is shared by asset across duplicate listings: available = quantity - reserved_quantity - sold_quantity. Counters absent on older assets read as zero. Checkout slots prevent the same buyer starting another payment on a listing while an earlier attempt is unresolved. The pending order stores a hash of the source, stable Square request key, and fee snapshot. The raw nonce is never persisted. Square endpoints use exactly one `/v2` prefix.

| Result | Order / inventory behavior |
| --- | --- |
| Verified Square COMPLETED | Order funded; hold consumed once; sold stock removed from availability |
| Confirmed decline, FAILED, or CANCELED | Order cancelled; hold released once |
| Timeout, provider outage, uncertain response, or post-capture database failure | Pending order and stock retained; retry uses the original payment key |
| APPROVED/PENDING | Payment ID recorded; subsequent attempts query it; order remains unpaid |

Buy-now sends one full payment to Square. It no longer opens a second escrow funding request or claims the funds are in escrow. The arbitrary-amount `/payments` endpoint returns 410; purchases must use order-bound checkout. Shipping requires a funded order and the correct seller. Deferred payment terms remain unavailable for buy-now.

Accepted-offer order creation now validates expiry, ownership, and available stock inside the same transaction as the reservation. Its total multiplies unit price by quantity. Offer acceptance alone is a quote agreement; it does not reserve stock. The legacy accepted-offer escrow path remains awaiting payment and cannot ship until funding is verified. Its escrow verification, platform-fee collection, and settlement are still launch gates; use buy-now for the initial paid pilot.

### Manual recovery during the pilot

For a pending Square order, staff should look up the payment using the saved order reference. `POST /admin/orders/{id}/reconcile` with `{ "payment_id": "..." }` requires a staff administrator token. It fetches the authoritative provider payment and checks order reference, amount, USD currency, and location before consuming or releasing stock. Customer administrators and staff support roles cannot use it. A mismatch leaves the order unchanged. Inspect the returned status rather than treating HTTP 200 alone as confirmation.

Unknown payments do not expire into available stock automatically. After 15 minutes, an attempt without a recorded payment ID requires staff recovery rather than replaying an old nonce. If no provider payment can be conclusively identified, keep the hold until it is resolved; do not reset keys or counters to retry a charge. Automatic reconciliation, refunds and seller payouts remain future work. Old unpaid escrow reservations also require manual review before release.

Run the emulator command above for Dart tests, and run `node --test tests/checkoutAttempt.test.mjs` inside `guildmark` for browser-state tests (Node 24). Local tests cover two buyers competing for stock, simultaneous retries, lost capture responses, database outages after capture, decline release, shared inventory, accepted-offer races, stale prices, expired offers, and reconciliation authorization. They do not replace a future provider sandbox and HTTPS browser rehearsal.

## References

- [Firebase Hosting and Cloud Run](https://firebase.google.com/docs/hosting/cloud-run)
- [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Firestore pricing](https://firebase.google.com/docs/firestore/pricing)
- [Firebase pricing](https://firebase.google.com/pricing)


## Cloud suite integration — November 4, 2026

Firestore remains the primary application database. Cloud SQL provisioning is deferred by user direction; no dual writes or placeholder SQL instance are introduced.

The implementation now supports `AUTH_MODE=firebase` for cloud identity, while `firebase-emulator` remains isolated to loopback demo projects. Configure `FIREBASE_PROJECT_ID` and `FIREBASE_WEB_API_KEY`; the latter is the Firebase project's Web API key, not a service-account private key. Admin identity operations use Application Default Credentials from the Cloud Run service identity. Cloud session cookies require RS256, a trusted cached Google session-signing certificate, matching issuer/audience/subject, valid timestamps, and a current non-disabled/non-revoked account. Identity records and audience checks remain in Firestore. Cloud mode rejects emulator overrides.

Customer and partner session restore uses the host-only `__session` cookie because Firebase Hosting strips other cookie names on Cloud Run rewrites. Cookies retain audience-specific paths, HttpOnly, SameSite=Strict and Secure. Staff passkey tokens keep their existing API flow. Emulator cookie names remain unchanged. The Cloud Run listener binds the supplied address in cloud mode; loopback binding applies only to local mode.

### Remote Config

Set `FIREBASE_REMOTE_CONFIG_ENABLED=true` on the API and `VITE_REMOTE_CONFIG_ENABLED=true` in storefront builds. The server reads Remote Config via workload identity and emits only `launch_enabled` and `amps_enabled` at GET `/api/config/features`. Only top-level parameter default values equal to the string `true` enable a flag; conditional values and parameter groups are not evaluated. This implementation supports global presentation flags, not per-user targeting or experiments. Templates and unrelated parameters are never returned to browsers.

The API caches successful reads for 60 seconds per instance. On failure both flags become false for a 15-second retry interval. The storefront waits at most two seconds before constructing its route arrays and falls back to disabled flags on timeout, malformed data or non-success. Flags apply on page load; they are not persisted. Local builds without Remote Config retain Vite flags. Flags do not grant entitlements, authorize requests, set prices, or store secrets. The initial template disables both flags; review before publishing. Deploying templates changes cloud state and has not been done in this work.

### Staging configuration and remaining gates

- Use a distinct staging Firebase project, Hosting targets, Storage bucket and Cloud Run identity before production. The checked-in `cloudrun.yaml` is a production-oriented template, not a deployment performed by this change.
- Enable Firebase Authentication email/password, configure authorized domains, email templates and recovery URLs. Restrict the Web API key to the required identity APIs and validate its intended server use.
- Grant the runtime identity the least privileges required for Firestore, object storage, Firebase Auth admin operations and read-only Remote Config. Keep credentials in workload identity/Secret Manager, never the browser bundle or repository.
- Populate Secret Manager references in the Cloud Run template, pin a tested image, verify CORS origins and WebAuthn RP/domain configuration. Do not set emulator hosts in cloud deployments.
- Rehearse signup, login, reload/refresh, password recovery, disabled/revoked users, logout, partner identity and staff passkeys through actual HTTPS Hosting rewrites. Test object upload/read/delete and tenant authorization against the staging bucket and Firestore indexes.
- Confirm abuse protection, email delivery, provisioning/migration, payment recovery, seller settlement and durable background tasks before opening paid traffic. Local emulator tests and injected HTTP tests do not establish these production properties.
- Firebase Hosting, Firestore and Storage infrastructure files already exist. No APIs, billing, IAM, DNS, resources, cloud data or live Remote Config templates were changed in this pass.

References: [session verification](https://firebase.google.com/docs/auth/admin/manage-cookies), [Hosting cookie forwarding](https://firebase.google.com/docs/hosting/manage-cache#using_cookies), [Remote Config REST API](https://firebase.google.com/docs/reference/remote-config/rest/v1/projects/getRemoteConfig).


## Deployed dev HTTPS staging — November 4, 2026

The user explicitly authorized linking **guildmark-dev only** to their existing billing account and deploying/testing the integration. Every cloud mutation used the dev project; neither the active CLI default nor production aliases were changed.

- Storefront: https://guildmark-dev.web.app
- Staff dashboard: https://guildmark-dev-devdash.web.app
- Partner portal: https://guildmark-dev-partners.web.app
- API: Cloud Run service `guildmark-api`, region `us-central1`, revision `guildmark-api-00001-qp6`, minimum 0 / maximum 2 instances. The tested image digest is pinned in `cloudrun.dev.yaml`.
- Firestore: default Native database in `us-central1`; 71 composite indexes are ready. Browser database access remains denied by rules.
- Storage: `guildmark-dev.firebasestorage.app`, US-CENTRAL1; API runtime has bucket-scoped object access, browser writes denied, product-image reads permitted.
- Authentication: email/password enabled; dev HTTPS domains authorized. Runtime admin operations use the dev service identity. No service-account key was downloaded.
- Remote Config: the dev template enables storefront and AMPS presentation. Auth, entitlement and pricing checks still run on the API.
- Secret Manager: dev-only API key and generated JWT secret versions; secret-level accessor grants for the API identity. No secret values are stored in these manifests or verification reports.
- Build identity: dedicated `guildmark-build` service account with source-bucket read, repository write, and build log write permissions. Docker uses the committed dependency lock and Dart Frog CLI 1.2.14.

`firebase.dev.json` uses explicit dev Hosting site IDs and a separate Remote Config template. Deploy with `firebase deploy --config firebase.dev.json --project guildmark-dev ...`; do not rely on the default project in `.firebaserc`. The production template and production Remote Config template were not deployed.

### Real HTTPS verification

Tests used the deployed services, synthetic `.test` identities and actual Firestore/Storage records; API responses were not mocked. Browser tests ran Chromium/Edge at 1440×1000 and 390×844. Passkeys used a virtual WebAuthn authenticator, not physical-device enrollment.

Verified on desktop and mobile viewports:

- Signup; secure, HttpOnly, SameSite=Strict `__session` cookies through Hosting rewrites; reload recovery; account records and logout.
- Photo upload via API and anonymous download from Firebase Storage; create/edit/publish/withdraw listings; actual marketplace detail; buyer offer and seller acceptance.
- Cross-company listing mutation denial; staff tokens denied on customer routes; unauthenticated direct database reads and object uploads denied.
- Password-reset request; reset using an admin-issued Firebase recovery code for a synthetic address; previous API session revoked; new-password sign-in. Delivery into a real email inbox was not verified.
- Fleet Dashboard, subscription/plan record, Orders, Offload and Market Pulse loading against real data.
- Staff passkey enrollment, passkey sign-in, analytics response, session persistence, and responsive layout.
- Partner sign-in, workboard/account responses, secure session recovery, logout, and responsive layout.

Cloud verification exposed two missing descending indexes: company/snapshot_date on valuation_snapshots and company/_createdAt on subscription_invoices. Both were added to the shared index manifest, deployed **only to dev**, and covered by `test/deployment_indexes_test.dart`. Emulator success alone does not establish production index completeness. Narrow portal layouts also required sidebar stacking and a wrapping analytics header; those frontend fixes were deployed only to dev.

Local evidence is under ignored `outputs/firebase-dev-https/` (JSON reports and screenshots). Test credentials and recovery tokens are not included in reports. Synthetic listings are withdrawn after verification, and test-only privileged identity records are deactivated after the final portal checks.

### Initial rollout limitations (payments/ML superseded below)

At the initial dev rollout, Square, escrow, carrier, email-provider and ML credentials/services were not configured in the dev runtime. No card capture, seller payout, funded shipping, paid AMPS entitlement or ML inference was claimed or performed. Real inbox delivery and physical phone/passkey hardware remain separate rehearsals. This deployment is dev staging, not approval for production or paid traffic. The Cloud SQL deferral remains in effect.


## Dev sandbox payments and private ML — November 4, 2026

The deployment fixes were committed and pushed to dev as `51ead02` before this integration work. This follow-up configures **guildmark-dev only**, not production.

### Payments

Square credentials from the existing development configuration were validated against the Square Sandbox Locations API and an active USD location. The backend access token is stored in dev Secret Manager. Both API configuration and browser build explicitly use sandbox mode; the API URL is fixed to `https://connect.squareupsandbox.com`. Public application/location IDs and the dev-only Vite build settings are in `frontend.dev.env`. Never supply `VITE_SQUARE_ACCESS_TOKEN` to a build. The staged browser bundle was checked against backend secret values and contains neither the Square access token nor the ML application token.

Marketplace checkout now tokenizes test cards through Square's actual hosted fields in sandbox, instead of substituting a static successful nonce. Real Square sandbox API checks verified declines release reservations, approvals reach COMPLETED, amounts and order references match, request replays return the same order, and stock is consumed once. Desktop and mobile test purchases each totaled USD 10.28. No real money was charged.

The existing sandbox-only AMPS workflow grants one paid period after a verified sandbox payment. It does not create a recurring subscription. This path was verified with Starter at USD 39, including retry behavior and fresh paid entitlements. Production recurring billing remains gated pending verified invoice reconciliation; no live plan IDs, recurring charges, settlement, seller payouts or refunds were enabled.

### ML

Cloud Run service `guildmark-ml` is private. Only `guildmark-api@guildmark-dev.iam.gserviceaccount.com` has a service-level invoker grant; no allUsers binding is present. The API obtains short-lived audience-specific ID tokens from workload metadata, caches them until shortly before expiry and sends them in `X-Serverless-Authorization`. A separate application token stays in `Authorization`; both runtime identities have access only to the required dev secret.

The serving image packages the existing local valuation/depreciation artifacts, records their SHA-256 values, verifies them before loading, and runs as a non-root user with read-only artifact files. `Dockerfile.serving` bypasses the old startup-training entrypoint. Scheduled training is off, and training/tracking endpoints return 405. Missing or corrupt artifacts fail startup instead of triggering training. Models are durable in the pinned container image; instance-local query tracking and model mutation are disabled. No eBay keys or training provider credentials were deployed.

`ml-artifacts.dev.json` records provenance and checksums. These artifacts are suitable for this integration rehearsal; their original training provenance and market calibration were not independently validated. This deployment does not establish model accuracy, production readiness, or forecast reliability. Rotate `ML_CACHE_VERSION` whenever changing the artifact/model version.

### Verification

Local tests: 29 Python ML tests; five Dart ML credential tests; two browser checkout-state tests; production storefront build. Real dev HTTPS checks at desktop and mobile viewports verified:

- Square hosted-card tokenization with official sandbox card data; completed provider payments; USD amount/reference checks; order and reservation persistence; safe request replay; stock reduction exactly once.
- Sandbox decline without consumed inventory; no backend credentials in browser bundles.
- Paid sandbox Starter period and idempotent retry; company entitlement and asset persistence; fresh valuation consumes one credit; identical repeat uses the cached valuation without another credit.
- Private valuation calls through the API; direct anonymous ML access denied; authorized depreciation forecast returns the requested horizon; wrong application bearer rejected; retraining/tracking disabled.
- Calculator estimates render from the live dev inference service, and inventory layouts are checked at desktop/mobile widths. A scoped relative scroll container prevents hidden inventory action labels from widening the mobile page.

Reports/screenshots are in ignored `outputs/dev-payments-ml/`. Sandbox orders/invoices are retained for audit; leftover synthetic listings are withdrawn. API and ML image digests are pinned in the dev manifests. Production resources and the production-oriented deployment templates were not changed. Full provider settlement, physical shipping, live recurring billing, real inbox delivery, model calibration and production rollout are outside this verification.

Build/deploy from an environment containing **only the public Vite keys** in `frontend.dev.env`; do not inject the full Doppler environment. Use the separate dev Hosting configuration and explicit `--project guildmark-dev` for all cloud commands. Existing local ML artifacts are ignored by Git; a future rebuild must supply the reviewed files matching `ml-artifacts.dev.json` or deliberately review a new artifact release. It must never train during serving startup.


## Dev recurring billing and paid-invoice reconciliation - November 4, 2026

This supersedes the single paid-period sandbox checkout described above. It is enabled only with `SQUARE_RECURRING_ENABLED=true`, project `guildmark-dev`, and Square sandbox. Production remains gated and was not deployed or configured. Existing single-period invoices are retained; new recurring agreements are blocked while an existing paid period or unresolved agreement is present. Cloud SQL remains deferred.

The dev catalog contains approved static monthly USD Starter ($39), Growth ($99) and Pro ($199) variations, pinned in `cloudrun.dev.yaml`. Browser checkout uses Square-hosted card fields and requires explicit monthly recurring consent. The API stores the terms, consent time, provider references and nonce hash; it never stores the card nonce or PAN. Stable customer/card/subscription keys and a company-level Firestore lock prevent a retry or another device from creating a second agreement. An uncertain outcome remains pending; recovery resumes every persisted step, including a missing local link after successful provider creation, without creating a second agreement. Recovery uses the original key or the owner-only `POST /api/subscriptions/reconcile`.

A subscription's ACTIVE state or charged-through date never grants access. Reconciliation retrieves the subscription, invoice, order and completed card payments directly from Square. It checks company/customer, subscription, location, variation, UTC cadence, exact USD amount, completed payment and refund status. A transaction writes the invoice ledger and paid entitlement together. Ledger identity is the SHA-256 of the Square invoice ID; invoice and subscription versions prevent stale observations from replacing newer billing state. Calendar periods preserve the original monthly anchor, including month-end clamping. Refunds revoke the affected current entitlement, and old refunded invoices do not retract a newer paid period. Future paid periods are not activated early.

`POST /api/webhooks/square` verifies Square's HMAC over the configured notification URL and raw body, checks the merchant, records the event durably, and awaits provider reconciliation. The payload's claimed payment state or amount is never trusted. Completed event IDs acknowledge duplicates. Failed reconciliation returns a retryable response. The webhook listens for invoice payment/update/refund/cancellation/failed-charge and subscription create/update events. Its signature is stored only in the dev `guildmark-square-webhook-signature` Secret Manager secret, accessible to the API identity. Square webhook URL: `https://guildmark-dev.web.app/api/webhooks/square`.

Cancellation requests the provider's end-of-period cancellation and preserves independently verified paid access until its UTC end. Billing remains accessible from `/amps/settings` even without AMPS asset access. The page exposes provider refresh, cancellation, UTC billing dates and responsive invoice history. Recurring plan changes, reactivation, annual plans, dunning/card replacement and seat add-ons are not enabled.

### Recovery deployment

`billing-job.dev.yaml` pins the same API image and runs `/app/bin/billing-reconcile`, a bounded, one-task recovery worker. `billing-scheduler.dev.json` records the authenticated 15-minute UTC schedule. The worker uses `guildmark-billing-worker@guildmark-dev.iam.gserviceaccount.com` with Firestore access and access to only the Square sandbox token. The scheduler identity has `roles/run.invoker` on this job, with OAuth to the Cloud Run Jobs API; there is no public recovery endpoint or process-local background scheduler. Worker startup rejects any other project/environment. Provider requests are bounded and sanitized; partial failures fail the job for retry. Current implementation checks up to 24 provider invoice IDs per agreement; it is scoped to dev and requires a reviewed historical-invoice strategy before production adoption.

Reapply the pinned job with `gcloud run jobs replace deployment/firebase/billing-job.dev.yaml --project=guildmark-dev --region=us-central1`. Run recovery with `gcloud run jobs execute guildmark-billing-reconcile --project=guildmark-dev --region=us-central1 --wait`. To inspect the trigger, use `gcloud scheduler jobs describe guildmark-billing-reconcile --project=guildmark-dev --location=us-central1`; its desired REST configuration is in the adjacent scheduler JSON. Keep explicit project arguments on every command because the workstation's default project is production.

### Verification and limits

Real HTTPS browser checks at 1440x1000 desktop and 390x844 mobile verify hosted card tokenization, consent required before submission, declined card without access, provider-confirmed $39 paid invoices, replay without a second invoice or extended period, duplicate-agreement rejection, billing refresh, cancellation retained through reload and paid access preserved. Real Square webhooks are received and reconciled. A signed replay test additionally rejects bad signatures/raw-body tampering, ignores payload-claimed amounts in favor of provider facts, and acknowledges duplicates without changing invoice count or period.

Firestore-emulator tests cover renewal, month-end anchors, unpaid subscriptions, exact price/ownership checks, concurrent invoice delivery/redelivery, unknown creation outcomes with stable provider keys and repaired local linkage, stale invoice/subscription events, refunds, cancellation and outages. Existing AMPS limit and marketplace checkout tests were also run; marketplace tests require the documented platform-config bootstrap in the isolated emulator. Native API builds and storefront Vite builds pass. Browser verification uses Edge emulation, not physical devices. A future calendar renewal has not elapsed in this session; renewal transitions are verified in the emulator rather than claimed as a real next-month charge.

Ignored evidence is in `outputs/dev-recurring/`: desktop/mobile screenshots, provider verification, webhook replay verification and cleanup reports. All synthetic recurring agreements, including exploratory probes, have renewal cancelled; paid invoices remain for audit. No real payments, production resources or production hosting releases were involved.

Final dev revision: `guildmark-api-00007-ndf`; API and recovery job share the pinned image digest in their manifests. Verification passed 53 Dart tests and three frontend payment-state tests. The final recovery execution completed with nine company agreements checked and zero failures. Ten sandbox invoices were generated across verification and the setup probe; all ten synthetic subscriptions have renewal cancelled. The combined ignored evidence report is `outputs/dev-recurring/report.json`.


## Dev payment recovery and integrated workspaces - November 4, 2026

Payment-method changes are separate from invoice settlement. Owner-only card updates require recurring consent and use a durable company lock, operation key, source hash and provider idempotency. A lost response resumes the existing operation. Updating the card neither pays an old invoice nor restarts a cancelled agreement. The Square-hosted fields use a compact layout; card data remains in Square's iframe.

The recovery action retrieves the existing due invoice and validates its subscription, customer, location, amount and period before returning its Square sandbox hosted-payment link. It does not create an invoice or submit a payment. Reconciliation checks the invoice recipient, order and exact completed tender/payment chain before granting access; the hosted-page payer need not be the invoice recipient. No tax or split-payout collection is enabled. Future custom tax and invoice payment-allocation work is recorded in `guildmark/ROADMAP.md`.

Real HTTPS desktop/mobile checks reused existing synthetic accounts and one new unpaid sandbox invoice across both widths. The declined attempt left that same invoice unpaid and access blocked. Paying that same invoice once restored access. Card updates created no extra invoices or charges, and a deliberately lost update response recovered without a duplicate. Renewal remains cancelled on every synthetic agreement. Evidence is in ignored `outputs/dev-recovery/`; these are Edge emulation checks, not physical-device tests.

The main dev website now serves `/workspaces`, `/admin/*` and `/partners/*`. The redesigned responsive shell uses a light palette, task navigation, focus indicators and mobile navigation. Customer, partner and staff sessions remain separate; all permissions are enforced by the API. Pending partners can inspect their own account but cannot access service work. Administrators can approve or suspend partner access with an audited transaction. Work and payout records are retained.

Staff authentication retains the existing devdash passkey relying-party domain. Main-site sign-in visits that secure login for password plus passkey, then transfers the verified session using a 90-second single-use code bound to state and destination origin. Redemption consumes the original staff session and preserves its original expiry. Bearer tokens never appear in the redirect URL. Existing legacy dev workspace URLs redirect to the main site; the devdash authentication routes remain available for passkeys.

Active legacy `admin` and `superadmin` staff can manage operations. Optional business-badge review is restricted to active `superadmin` and `compliance` staff. Badge decisions require a recorded reason; approval additionally requires registry and representation checks plus internal evidence. Verification does not gate customer signup, browsing, buying or inventory access. Seller publishing and selling require approved business verification. The coordinated signup work was checked locally with captured email; real verification-email inbox delivery has not been verified and depends on the configured email provider.

Before deployment, the combined backend suite passed 88 tests and both frontend builds passed. API and billing worker use the same pinned native image. All commands target `guildmark-dev` explicitly; no production configuration or resources were changed. Source changes remain uncommitted.


Final integrated workspace deployment: `guildmark-api-00011-9dk`. HTTPS checks at 1440px desktop and 390px mobile exercise real staff password/passkey authentication and handoff, partner pending-to-approved access, workboard/services/account views, business-review approval/denial and compliance-only authorization. Twelve legacy dev workspace redirects resolve to the main dev website. The partner list pages by document ID so imported records without `_createdAt` are not silently omitted. A regression test covers that case. No synthetic reviewer approved a real business; dedicated application fixtures are cleared to rejected after verification, and reused test staff/partner access is restored to its original disabled/suspended state. Screenshots and the final report are in ignored `outputs/dev-portals/`.

The final recovery execution `guildmark-billing-reconcile-ctr4f` completed successfully. API and worker share digest `sha256:59af5ff6ce116133e0210245a5aa4579e5c04effc7ed93a9e1d1b55938cb5593`. A final provider read confirmed the recovery agreement still has exactly one invoice, paid. The sanitized deployment report is `outputs/dev-portals/deployment-report.json`.


## Dev verification email configuration

The dev API now reads `RESEND_API_KEY` from version1 of dev-only Secret Manager secret `guildmark-resend-api-key`, with secret access granted only to the dev API service account. The existing locally configured sending-only Resend credential was copied privately; no provider key was rotated and production service configuration was not changed. Resend API URL is pinned to `https://api.resend.com/emails`. The email credential is not supplied to Vite, Firebase Hosting or the billing worker. Revision `guildmark-api-00012-tkv` retains the same tested native API image. Real inbox confirmation testing requires a selected recipient; API acceptance alone is not evidence of inbox delivery.


Real verification-email delivery was checked through the deployed HTTPS UI at desktop and mobile widths. Both messages arrived in the selected connected Gmail Inbox (not spam), and Gmail reported SPF, DKIM and DMARC passing. One initial desktop code expired; fresh desktop/mobile emails were then delivered. The user confirmed the emails worked and requested moving on, so automated browser code acceptance/reload checks were stopped rather than reported as complete. Test browsers were closed and only the two dedicated email-delivery QA Firebase identities were disabled. No seller approval, invoice or charge was created. Sanitized delivery evidence is in ignored `outputs/dev-email/`.


## Dev CMS blog editor and media library — November 5, 2026

The integrated Admin now provides `/admin/content` and `/admin/media`. Marketing staff can create/edit drafts, preview them, upload/reuse editorial images and restore saved revisions as new drafts. Active admin/superadmin staff can publish and unpublish. Every content read and mutation checks current staff authority; mutations recheck the employee within the Firestore transaction. Customer, partner, setup and other staff roles cannot obtain editor access.

`cms_posts` holds separate working drafts and published snapshots. `cms_slugs` reserves permanent article URLs. `cms_revisions` records immutable numbered snapshots with the action, actor and time. Saves require the expected version; conflicting edits return 409 while the UI preserves local text. Restore appends a new draft revision and does not change the live article. A publisher must explicitly publish that restored draft. Unpublishing hides the public article while retaining its draft and history. Draft and revision responses use no-store; the middleware preserves router fallback responses so mounted dynamic article routes remain reachable.

The Markdown editor provides formatting controls, image insertion, unsaved-change protection and a private preview using the same safe body renderer as the public article. Arbitrary raw HTML is ignored; the existing explicitly supported insight-report widget remains available. The public blog reads only published snapshots from `/api/content/blog`, with no-store responses so changes do not require rebuilding Hosting. Blog routes now work in both launch modes. Existing article `it-hardware-lifecycle-gap` was imported with its original URL and January 1, 2026 display date. SEO title/description are applied client-side; this milestone does not add server-side rendering.

Images are uploaded through the authorized API to `cms-media/` in the dev Firebase Storage bucket. PNG/JPEG/WebP only, maximum 5 MB, with required alternative text; SVG/HTML uploads are rejected. Assets are immutable and publicly viewable by their download link, as stated in the editor. Use public editorial imagery. Media metadata is held in `cms_media`. Its descending document-ID query requires the explicit `cms_media` index recorded in `firestore.indexes.json`; that index was created and verified READY in guildmark-dev only. Revision history is paginated, as are the article and media lists.

Final dev API revision: `guildmark-api-00014-8f4`, digest `sha256:b633f39db6e94918ae29290e8ea6fe4527595faedee395140b46233790d28c3f`. The dev billing job remains pinned to the same image; billing logic was unchanged. 96 targeted/emulator regression tests passed. Real HTTPS browser checks at 1440px desktop and 390px mobile verified draft privacy, image upload/selection/reuse, covers, private preview, live publication, draft/live isolation, immutable history, restore-as-draft followed by explicit republish, unpublishing, marketing publish denial, stale-edit text retention and HTML-script suppression. These are Edge desktop/mobile-emulation checks, not physical-device tests. Evidence is in ignored `outputs/dev-cms/`.

The reused synthetic staff account was restored to its original disabled state. Synthetic articles remain unpublished for audit; the original imported article remains published. No emails, invoices or payments were generated. Production resources and Hosting were not deployed or configured. CMS source changes remain uncommitted.


## Dev CMS pages, FAQs, help and footer navigation — November 10, 2026

Admin now includes Pages (`/admin/content/pages`), FAQs (`/admin/content/faqs`) and Help articles (`/admin/content/help`) beside Blog and Media. All use the same expected-version save, private preview, administrator-only publishing/unpublishing, immutable revision history and restore-as-draft workflow. Marketing staff can edit but cannot publish. Pages and FAQs require a title/question and body/answer to publish; help articles also require a summary and category. Author attribution is optional for help and omitted for pages/FAQs. Shared media may be reused across these types.

The shared Cms service isolates records in `cms_pages`, `cms_faqs`, `cms_help`, their own revision collections, and type-prefixed slug reservations. Existing `cms_posts`, blog slug keys and blog history remain compatible. Identical IDs and slugs in different content types do not overwrite one another. The authorized API lives under `/api/admin/content/entries/{page|faq|help}`; anonymous reads under `/api/content/entries/{page|faq|help}` return only published snapshots, with no-store headers. Lists are paginated. Public directories and detail routes are `/pages`, `/pages/:slug`, `/faqs`, `/faqs/:slug`, `/help`, `/help/:slug`; FAQs use accessible expandable answers, and the directories support text search. These are new public content routes; existing product screens, the hand-authored marketing homepage and legal policies are not replaced by CMS records. SEO metadata is applied client-side, as with the initial blog CMS.

The Workspaces hub page and its navbar entries have been removed. `/workspaces` now redirects home for old bookmarks. Public main/prelaunch, blog/content and legal footers link directly to Administration (`/admin`) and Partner Hub (`/partners`), with the existing role-specific authentication unchanged. Portal branding/back links return to the main website. Admin navigation scrolls within its available height so all content types remain reachable on mobile.

The asset-owner hero in `public-home.css` now uses normal letter spacing rather than negative tracking, and 1.14 line height at desktop and mobile sizes, keeping `r` and `n` distinct without changing the font. The public prelaunch layout was checked from dev HTTPS assets using a browser-only launch-flag override; cloud Remote Config was not changed.

Final dev API revision: `guildmark-api-00015-fgh`, digest `sha256:1fec46e8dac596bb2d9a56ed5b24038fa41f2edc24d7dc2eef2bfccca04678d8`. The dev worker is pinned to the same image; billing logic is unchanged. 108 targeted backend/regression tests passed, including type isolation, authorization, stale-version rejection, nested route handling and publication validation. Six real HTTPS content workflows (three types at 1440px desktop and 390px mobile) verified creation, draft privacy, preview, publishing, draft/live separation, revision restoration, republishing and unpublishing. Mobile marketing-role checks verify that publish controls are absent and direct publish calls return 403 while edits remain allowed. 46 CMS/navigation screenshots and two hero captures passed overflow checks. Main, blog/content, legal and prelaunch footer links were verified, and the legacy hub redirects home. The original blog URL/date remain intact.

Evidence is in ignored `outputs/dev-content-types/`. Dedicated QA content remains unpublished and the reused synthetic staff account was restored to its original access. No new accounts, verification emails, subscriptions, invoices or charges were created. Production resources, hosting and configuration remain untouched. Source changes remain uncommitted.


## Dev marketplace density and CMS placements — November 10, 2026

The marketplace uses a compact GuildMarket heading, equipment shortcuts, smaller image regions and horizontal cards on mobile. Price range and minimum available quantity join the existing equipment, grade and sort controls; URL state survives reloads. These filters still operate on the first 100 fetched results until the API supports combined server-side filters and sorting. Grade explanations are contextual, focusable/tappable tooltips. Public navbar/blog theme buttons were removed; signed-in desktop user menus and mobile navigation offer System default, Light and Dark. An unset preference follows the OS, with light as the normal browser default. Explicit existing preferences are preserved and synchronized across mounted views and tabs.

Admin → Banners & ads (`/admin/content/placements`) uses content kind `promotion`, `cms_promotions`, and `cms_promotion_revisions`. It shares CMS version checking, private previews, shared media, current-employee role enforcement, immutable revision history, administrator publishing/unpublishing and restore-as-draft. Creative IDs are internal and do not create public detail pages. Publication requires an allowlisted placement, a valid internal or HTTPS destination, CTA label, disclosure, priority 0–1000, and sponsor name for sponsored content. Optional UTC schedules must have a valid increasing window. Highest priority wins each slot; equal priorities resolve by stable ID. Empty/failed slots take no space. No advertising billing, targeting or tracking was added.

Public reads at `/api/content/promotions/{placement}` return only active published creative fields with no-store headers. Supported slots: `marketplace-banner` above quick filters; `marketplace-native` after up to four real result cards (at most once per result page, omitted in loading/error/empty states); `home-banner` below the asset-owner homepage hero; `content-banner` above the shared blog/content footer. Placements refresh each minute and on normal query refocus, so schedule boundaries propagate within the refresh interval on an open page. Sponsored placements are explicitly labelled and use sponsored links; native content has separate semantics from listing cards.

Deployment is dev only: Cloud Build `7bc87d7e-43eb-411b-a4e8-8c6de96fc1a7`, API revision `guildmark-api-00016-znw`, image digest `sha256:c2a5e75dd04dc3511ab5ca9083d0470a5ac9a68b9b0bf4c26be3e7bf66d01424`. The dev billing job manifest uses the matching image; no reconciliation job execution was requested. Production remains untouched and source remains uncommitted.

Verification: Vite production build and 27 CMS/emulator tests passed. Real dev HTTPS checks passed at 1440px desktop and 390px touch mobile for filters/reload, grade tooltips/Escape, OS theme changes and signed-in appearance controls. CMS checks exercised draft/media/preview, all four public placements, administrator-only publication (marketing publish denied), future scheduling, revision restore and unpublish on both viewports. Browser-only listing fixtures exercised populated layouts without creating marketplace transactions; the homepage test used a browser-only prelaunch flag override, with no Remote Config change. Evidence is in ignored `outputs/dev-marketplace-pass/`. Synthetic creatives are unpublished, QA staff access is restored, and no email/invoice/payment was created.
