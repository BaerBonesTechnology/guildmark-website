# AsTech ML Service

FastAPI inference service for the AsTech platform. The Dart API at `../api`
forwards valuation requests here over HTTP.

## Endpoints

| Method | Path                    | Purpose                                  |
| ------ | ----------------------- | ---------------------------------------- |
| GET    | `/health`               | Liveness probe                           |
| POST   | `/predict/valuation`    | Single-asset fair market value           |
| POST   | `/predict/depreciation` | Portfolio depreciation forecast (12mo)   |

The service is internal-only. Every endpoint except `/health` requires
`Authorization: Bearer <ML_SERVICE_TOKEN>`. The Dart API uses the same token.

## Models

| Name           | Algorithm              | Inputs                                                    | Output                  |
| -------------- | ---------------------- | --------------------------------------------------------- | ----------------------- |
| Valuation      | Gradient Boosted Trees | asset_type, model, condition, age, cpu, ram, storage, MSRP | fair_market_value (USD) |
| Depreciation   | Exponential decay fit  | company portfolio history                                 | 12 monthly projections  |

Both models are trained offline, persisted as joblib files under `ML_MODEL_DIR`,
and loaded at startup. Without trained artifacts the models use their fallback
estimates; a healthy service does not mean trained models are present.

## Running

Use Python 3.12 for the pinned dependencies. This workspace has a prepared
environment in `.venv-py312`; the root `.venv` is a different environment.
Use `python -m uvicorn` with the explicit interpreter to avoid accidentally
running the global Python installation's `uvicorn.exe`.

```powershell
cd D:\Projects\ml-qv
doppler run -- .\.venv-py312\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload

# Install/update dependencies and run tests in this same environment:
.\.venv-py312\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv-py312\Scripts\python.exe -m pytest
```

The local Doppler config is `guildmark/dev_personal`. `ML_MODEL_DIR` points to
`D:/Projects/ml-qv/model_artifacts`, `ML_SERVICE_URL` is `http://localhost:8001`,
and `ML_SERVICE_TOKEN` is shared with the API. `ML_RETRAIN_CRON=off` keeps
scheduled retraining disabled during local development. Restart the API after
changing the shared token so it loads the updated value.

```bash
# Via docker-compose (from repo root)
docker-compose up -d ml
```

## Synthetic data note

`training/synthetic_data.py` generates plausible asset records so the
service has something to predict against on day one. Replace with real
training data once you have closed-deal history from the marketplace.
