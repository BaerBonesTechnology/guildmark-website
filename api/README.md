# AsTech Server

Two-tier server for the AsTech marketplace + AMPS dashboard.

```
astech-server/
├── api/        Dart Frog HTTP API   — auth, CRUD, marketplace, AMPS, MDM
├── py/         Python FastAPI ML    — fair-market-value + depreciation models
├── migrations/ Postgres schema      — raw SQL, applied by api/ on boot
└── docker-compose.yml
```

## Why two languages

- **Dart (api/)** owns every request the frontend makes. AOT-compiled native
  binary, isolate-based concurrency, single-file deploy. Fast where latency
  matters.
- **Python (py/)** owns ML training and inference. Scikit-learn / XGBoost /
  Pandas have no real Dart equivalent. The Dart layer calls it over HTTP for
  valuation requests; everything else stays in Dart.

The split is deliberate: keep the hot path in Dart, keep the ML stack where
the libraries live.

## Quickstart

The fastest path is the bundled startup script — it boots Postgres + ML in
Docker, waits for both to be healthy, then runs the Dart API in the
foreground for hot reload. Ctrl+C tears everything down.

```bash
./start.sh                # default: Docker for db+ml, local Dart API
./start.sh --all-docker   # everything in Docker
./start.sh --no-db        # only run the Dart API (db+ml already up)
./start.sh --logs         # tail logs of running services
./start.sh --help         # show all flags
```

Manual equivalents if you want finer control:

```bash
# 1. Bring up Postgres + ML service
docker compose up -d postgres ml

# 2. Run the Dart API in dev (hot reload)
cd api
dart pub get
dart_frog dev            # http://localhost:8080

# 3. (Optional) Train models
cd py
pip install -r requirements.txt
python -m app.training.train_valuation
python -m app.training.train_depreciation
```

The frontend's `.env.local` should set `VITE_API_URL=http://localhost:8080`.

## Architecture at a glance

```
┌──────────────────┐    HTTP/JSON     ┌─────────────────┐
│  React frontend  │ ───────────────▶ │  Dart Frog API  │
│  (port 5173)     │                  │  (port 8080)    │
└──────────────────┘                  └────────┬────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                   ┌──────────────┐    ┌──────────────┐     ┌──────────────┐
                   │  Postgres    │    │ Python ML    │     │  External    │
                   │  (port 5432) │    │ (port 8001)  │     │  Jamf/Intune │
                   └──────────────┘    └──────────────┘     │  Semantics3  │
                                                            └──────────────┘
```

## Endpoints

The frontend's `src/app/lib/apiHooks.ts` is the source of truth for the HTTP
contract. The Dart API mirrors it 1:1; the Python ML service is internal-only
and never exposed to the browser.

See `api/README.md` and `py/README.md` for component-level docs.
