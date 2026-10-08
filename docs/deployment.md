# GuildMark deployment after infrastructure simplification

Production runs one AOT-compiled Dart Frog API container. Valuation runs in the
API process, the datastore is Appwrite Cloud, and the three SPAs deploy separately
to Cloudflare Pages. No production Python, PostgreSQL, frontend nginx, or
self-hosted Appwrite containers are started by the deployment scripts.

## Valuation behavior

The deterministic estimator uses the Python fallback's base prices, condition
multipliers, 25% annual geometric depreciation, and 15% residual-value floor.
CPU/RAM/storage premiums use `ml-qv/training/synthetic_data.py` coefficients:
CPU score / 250 × 10%, RAM GB / 64 × 5%, storage GB / 2048 × 5%. Each contribution
saturates at its reference specification, limiting the combined premium to 20%.
Missing specifications add no premium. Confidence is 0.40, and the version is
`valuation-rules-1.0.0`; this is not equivalent to the trained sklearn model.
Python training code and model artifacts remain available for offline research.

`POST /valuation/estimate` requires authentication. The plan's sample request
(no model_name required) produces $900:

```json
{"asset_type":"laptop","condition_grade":"A","age_months":12,"original_price":1200}
```

`GET /valuation/depreciation?horizon_months=12` uses the authenticated company's
real portfolio value and supports 1–36 months. It compounds by 0.985 monthly,
rounding only returned points. The service supports weighted per-type priors;
without configured priors, each type uses the default. Empty portfolios return
zero projections; missing datastores return 503 rather than fabricated values.
Existing asset valuation history remains readable at `/assets/:id/valuations`.

## Appwrite Cloud cutover

1. Create the Cloud project and copy its endpoint, project ID, and server API key
   into your secret manager. `.env.example` lists the required startup settings.
   The default endpoint is `https://cloud.appwrite.io/v1`; override it with the
   regional endpoint shown in your project's console.
2. From `api/bin`, run `dart pub get`, then `dart run tool/appwrite_setup.dart`
   with the target Cloud environment injected to initialize its schema.
3. Migrate existing self-hosted Appwrite records and storage to that project,
   preserving IDs. Verify counts, permissions, accounts, and representative API
   reads/writes before changing production credentials. The legacy Postgres
   backfill tool does not migrate a self-hosted Appwrite database to Cloud.
4. Deploy the API, verify authentication and application flows, and only then
   retire legacy containers. Deployment scripts deliberately do not remove
   containers or volumes automatically. Retain backups for rollback.

Changing an endpoint does not migrate data. Cloud credentials and data migration
must be completed before retiring the old datastore. The self-hosted compose
file remains available explicitly through `./start.sh --appwrite`.

## Cloudflare Pages

Create three Pages projects using repository root as the working directory:

| Project | Build command | Output directory |
| --- | --- | --- |
| Marketplace | `npm run install:guildmark && npm run build:guildmark` | `guildmark/dist` |
| Admin | `npm run install:devdash && npm run build:devdash` | `devdash/dist` |
| Partners | `npm run install:partners && npm run build:partners` | `partners/dist` |

Use Node 22 and pnpm 10.33.3 (for admin and partners), matching the Docker builds.
The root is an orchestration package, not a pnpm workspace. Each frontend keeps
its own lockfile; the main app uses npm, while admin and partners use pnpm.
`npm run install:all` and `npm run build:all` install/build all three locally.
For Pages, disable automatic dependency installation if using these explicit
install commands (`SKIP_DEPENDENCY_INSTALL=true`).

Set `VITE_API_URL=https://api.guildmark.co` for every Pages project, and
`ADMIN_VITE_API_URL` to the same value for the admin project. These are build-time
values. Never put server API keys into `VITE_*` settings. Each public `_redirects`
file is copied into `dist`, providing `/* /index.html 200` SPA routing.

Attach the existing frontend custom domains and set API CORS origins to their
exact HTTPS origins. Preview domains require explicit CORS configuration.
Verify refresh-cookie behavior on the final custom domains; Pages preview
origins are cross-site and may not share the production cookie behavior.

References: [Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
and [Appwrite HTTPS endpoints](https://appwrite.io/docs/advanced/security/https).

## API and ingress

Run `scripts/deploy.sh` (or `.cmd`) with secrets in Doppler or the root `.env`.
It builds and starts only `api`, using cached Docker layers. The image contains
the native executable and CA certificates, runs as an unprivileged user, and
contains no Dart SDK or Python runtime.

The API is HTTP on container port 8080 and is bound to host loopback by default.
Provide HTTPS ingress separately, for example a host-managed TLS proxy or a
host-managed Cloudflare Tunnel forwarding to `http://127.0.0.1:8080`. Cloudflare
DNS proxying alone does not provide TLS on a plain HTTP origin. Do not switch
Cloudflare to Flexible TLS to compensate. Set `API_BIND_ADDRESS` only when your
chosen ingress needs another bind address and firewall rules are in place.
Removing the old nginx container requires this ingress cutover first.

`./start.sh` / `--dev` starts local API/frontend containers (ports 8080/3000/3001/
3002). `--prod` selects API-only production. `--logs` and `--down` use the dev
stack unless `COMPOSE_FILE` selects another file. There is no implicit branch
selection, PostgreSQL waiting, or automatic deployment cron installation.
For hot reload, run the frontends' dev scripts and `dart_frog dev` in `api/bin`
with the appropriate environment injected.

The old startup script may already have installed a daily deployment cron on an
existing host. Review and remove that entry during cutover; these code changes
do not modify the host's scheduler. Staging has its own network and loopback
ports 9080 (API), 4000 (marketplace), and 4001 (admin), independent of prod nginx.

## Verification and operating limits

Run `dart test` from `api/bin`, `npm run build:all` from the root, and
`docker compose -f docker-compose.prod.yml config --services` (must print `api`).
After deployment, measure `docker stats --no-stream` at idle and under realistic
load. The plan's <50 MB RAM and $4–$5/month figures are targets, not guarantees:
actual usage depends on concurrency, dataset size, provider pricing, and managed
service limits. No restrictive 50 MB container limit is imposed without measuring
normal operation, since that could cause out-of-memory restarts.

### Local verification (2026-10-08)

- 13 Dart tests passed, including the authenticated estimate route without any
  ML or datastore provider connection, input validation, and forecast horizons.
- Dart Frog production generation and native AOT compilation succeeded.
- 100 authenticated HTTP requests to the compiled macOS arm64 API returned
  $900 FMV / 0.40 confidence; observed RSS after the run was 22.8 MiB.
- All three frontend builds passed and contained their `_redirects` files.
- Production Compose resolves to one service: `api`.

The macOS smoke test is not a Linux container/load benchmark. Docker was not
running, so Linux image execution and container RAM remain unverified. Existing
Dart analyzer lint findings remain; the analysis reported no compilation errors.
Cloud migration, DNS/Pages cutover, and production billing were not performed.
