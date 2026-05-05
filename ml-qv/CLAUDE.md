# CLAUDE.md

This file provides guidance when working in this repository.

You are the **ML Developer** for GuildMark. Read `TEAM.md` at the repo root for the full responsibility breakdown. Read `CLAUDE.md` at the repo root for project-wide architecture.

---

## Your Domain

You own the Python ML service — model training, evaluation, artifact packaging, and the FastAPI inference server. The Backend Developer owns the Docker service configuration and the Dart client (`api/bin/lib/ml/ml_client.dart`) that calls this service. Coordinate on the API contract before changing request/response shapes.

---

## Service Contract

The Dart API calls three endpoints:

```
GET  /health                  → { "status": "ok", "service": "astech-ml" }
POST /predict/valuation       → ValuationRequest → ValuationResponse
POST /predict/depreciation    → DepreciationRequest → DepreciationResponse
```

**ValuationResponse** (must stay in sync with `ml_client.dart`):
```json
{ "fair_market_value": 1250.00, "confidence": 0.87, "model_version": "valuation-0.1.0" }
```

**DepreciationResponse**:
```json
{ "forecast": [{ "month": "2026-06", "projected_value": 48200.00 }, ...], "model_version": "depreciation-0.1.0" }
```

---

## Running the service

```bash
# With Docker (from repo root)
./start.sh --ml         # Starts postgres + api + frontends + ml service

# Locally (from ml-qv/)
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Environment variables
ML_PORT=8001
ML_MODEL_DIR=./models     # Where .joblib artifacts are loaded from
EBAY_APP_ID=...           # eBay Browse API — used only during training
EBAY_CERT_ID=...
EBAY_SANDBOX=0            # Set to "1" for eBay sandbox
```

---

## Codebase inventory

```
main.py                       FastAPI app — /health, /predict/valuation, /predict/depreciation
schemas.py                    Pydantic request/response models (mirrors ml_client.dart)
models/valuation.py           ValuationModel — GradientBoostingRegressor + rules-based fallback
models/depreciation.py        DepreciationModel — exponential decay forecaster, per-type priors
training/synthetic_data.py    Generates plausible training records when real data is unavailable
training/data_retrieval.py    DataGrabber — eBay Browse API OAuth client for real price data
training/train_valuation.py   Trains and saves valuation.joblib to $ML_MODEL_DIR
training/train_depreciation.py Trains and saves depreciation.joblib to $ML_MODEL_DIR
tests/test_valuation.py       Unit tests
requirements.txt              fastapi, uvicorn, scikit-learn, xgboost, pandas, numpy, joblib, requests
Dockerfile                    Container build (prod)
```

---

## Model artifacts

Artifacts are loaded from `$ML_MODEL_DIR` (default `./models/`):
- `valuation.joblib` — sklearn Pipeline (ColumnTransformer + GradientBoostingRegressor)
- `depreciation.joblib` — dict mapping asset_type → monthly decay multiplier

**If artifacts are missing**, the service still starts and responds:
- `ValuationModel` falls back to a deterministic rules-based estimator (confidence = 0.40)
- `DepreciationModel` uses a hardcoded default monthly decay (0.985 ≈ 16.5%/yr)

**To train and generate artifacts:**
```bash
cd ml-qv
python -m training.train_valuation       # writes models/valuation.joblib
python -m training.train_depreciation    # writes models/depreciation.joblib
```

Both scripts currently use synthetic data. Pass real eBay data via `DataGrabber` for better accuracy.

---

## eBay data pipeline

`training/data_retrieval.py` implements a full eBay Browse API client:
- OAuth 2.0 client-credentials flow (auto-refresh)
- Pagination up to 400 fixed-price listings per query
- Condition ID → AsTech grade mapping (A/B/C)
- Aspect parsing for RAM, storage from listing metadata
- `clean_and_preprocess_data()` normalizes and imputes missing spec fields

To pull real training data:
```python
from training.data_retrieval import DataGrabber
df = DataGrabber().retrieve_and_process_data("Apple MacBook Pro M2 14 inch")
```

Requires `EBAY_APP_ID` and `EBAY_CERT_ID` env vars.

---

## What's Next (your roadmap items)

See the **ML Developer** section of `TEAM.md` and `ROADMAP.md`.

Priority items:
1. **Train and commit initial artifacts** — run both training scripts, place `.joblib` files in the Docker-mounted `model_artifacts/` directory so the service stops using the fallback
2. **Wire real eBay data into training** — use `DataGrabber` instead of `synthetic_data` in `train_valuation.py`; requires `EBAY_APP_ID` + `EBAY_CERT_ID` in `.env`
3. **Confidence threshold definitions** — decide the threshold below which the API should surface a warning in the UI; communicate to Frontend Developer
4. **Retraining pipeline** — ingest completed orders (`status = 'complete'`) from the `orders` table as ground truth; coordinate with Backend Developer on DB access
5. **GuildMark Score algorithm** — design and implement using order history, dispute rate, payment timeliness, company age
6. **Carbon offset model** — estimate kg CO₂ saved per device reuse
