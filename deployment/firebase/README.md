# GuildMark Firebase migration

Status: local migration foundation targeting `guildmark-prod`. Billing remains disabled. No cloud deployment, DNS change, production-data import, or resource deletion has been performed.

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

`start-local.ps1` forces `AUTH_MODE=firebase-emulator`, `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`, `WEBAUTHN_RP_ID=localhost`, and the matching dashboard origin (including any port offset). Auth and Firestore must both use loopback emulators and the same `demo-` project. Invalid/missing emulator settings fail closed; there is no cloud Auth fallback or production unsigned-token verifier.

The browser talks only to GuildMark routes. Firebase handles credentials, password reset codes, disabled accounts and Firebase session cookies. The API stores those cookies server-side and gives clients random session handles. Only handle hashes are stored. The existing `access_token` response field and bearer transport remain compatible; customer/partner session restore uses host-only HttpOnly, SameSite=Strict cookies scoped to the appropriate auth path. These local HTTP cookies omit Secure; HTTPS cookie policy and signed Firebase verification are required before cloud launch. Sessions expire after eight hours without sliding renewal; `/auth/refresh` restores an existing session until that deadline. Logout revokes that particular session immediately. Password resets also invalidate API sessions, including sessions created in the same second.

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

Auth tests cover signup/login/restore/logout, reset replay and revocation, disabled users, audience separation, emulator-only configuration, Firebase outages, and a complete passkey registration/assertion flow using independently generated Node crypto signatures. Legacy auth code and its tests remain until a separate cloud-cutover review; `AUTH_MODE=legacy` is required to run it outside test fixtures. The runtime defaults to emulator mode and fails startup if it is not configured; Firebase-mode failures never invoke it. Before enabling cloud Auth, implement signed-cookie verification with trusted Google keys, workload identity for admin operations, secure cookies, abuse limits, account migration/provisioning, and real email delivery/verification.

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
