# AsTech ML Service

FastAPI inference service for the AsTech platform. The Dart API at `../api`
forwards valuation requests here over HTTP.

## Endpoints

| Method | Path                    | Purpose                                  |
| ------ | ----------------------- | ---------------------------------------- |
| GET    | `/health`               | Liveness probe                           |
| POST   | `/predict/valuation`    | Single-asset fair market value           |
| POST   | `/predict/depreciation` | Portfolio depreciation forecast (12mo)   |

The service is internal-only — it never sees a browser. Auth is handled by
the Dart layer; the ML container should not be exposed to the public network.

## Models

| Name           | Algorithm              | Inputs                                                    | Output                  |
| -------------- | ---------------------- | --------------------------------------------------------- | ----------------------- |
| Valuation      | Gradient Boosted Trees | asset_type, model, condition, age, cpu, ram, storage, MSRP | fair_market_value (USD) |
| Depreciation   | Exponential decay fit  | company portfolio history                                 | 12 monthly projections  |

Both models are trained offline (`python -m app.training.train_*`), persisted
as joblib files in `./models/`, and lazy-loaded on first request.

## Running

```bash
# Local dev (no Docker)
python -m venv .venv
source .venv/bin/activate              # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m app.training.train_valuation  # writes models/valuation.joblib
python -m app.training.train_depreciation
uvicorn app.main:app --reload --port 8001
```

```bash
# Via docker-compose (from repo root)
docker-compose up -d ml
```

## Synthetic data note

`app/training/synthetic_data.py` generates plausible asset records so the
service has something to predict against on day one. Replace with real
training data once you have closed-deal history from the marketplace.
