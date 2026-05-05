"""FastAPI app for AsTech ML inference."""
from __future__ import annotations

import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from models.depreciation import DepreciationModel
from models.depreciation import MODEL_VERSION as DEP_VERSION
from models.valuation import MODEL_VERSION as VAL_VERSION
from models.valuation import ValuationFeatures, ValuationModel
from schemas import (
    DepreciationPoint,
    DepreciationRequest,
    DepreciationResponse,
    TrackModelRequest,
    ValuationRequest,
    ValuationResponse,
)

_SEEN_QUERIES_FILE = Path(os.environ.get("ML_MODEL_DIR", "./model_artifacts")) / "seen_queries.json"


def _load_seen_queries() -> list[dict]:
    if _SEEN_QUERIES_FILE.exists():
        try:
            return json.loads(_SEEN_QUERIES_FILE.read_text())
        except Exception:
            return []
    return []


def _save_seen_queries(entries: list[dict]) -> None:
    _SEEN_QUERIES_FILE.parent.mkdir(parents=True, exist_ok=True)
    _SEEN_QUERIES_FILE.write_text(json.dumps(entries, indent=2))

log = logging.getLogger("astech.ml")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm both model singletons so the first request isn't slow.
    ValuationModel.load()
    DepreciationModel.load()
    log.info("ML models loaded; service ready")
    yield


app = FastAPI(
    title="AsTech ML",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "astech-ml"}


@app.post("/predict/valuation", response_model=ValuationResponse)
def predict_valuation(req: ValuationRequest) -> ValuationResponse:
    try:
        model = ValuationModel.load()
        fmv, confidence = model.predict(
            ValuationFeatures(
                asset_type=req.asset_type,
                condition_grade=req.condition_grade,
                age_months=req.age_months,
                cpu_score=req.cpu_score,
                ram_gb=req.ram_gb,
                storage_gb=req.storage_gb,
                original_price=req.original_price,
            )
        )
    except Exception as exc:  # noqa: BLE001 — surface model errors as 500
        log.exception("valuation prediction failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ValuationResponse(
        fair_market_value=fmv,
        confidence=confidence,
        model_version=VAL_VERSION,
    )


@app.post("/predict/depreciation", response_model=DepreciationResponse)
def predict_depreciation(req: DepreciationRequest) -> DepreciationResponse:
    model = DepreciationModel.load()
    starting_value = req.current_value if req.current_value and req.current_value > 0 else 100_000.0
    points = model.forecast(
        starting_value=starting_value,
        horizon_months=req.horizon_months,
    )
    return DepreciationResponse(
        forecast=[DepreciationPoint(month=m, projected_value=v) for m, v in points],
        model_version=DEP_VERSION,
    )


@app.post("/data/track", status_code=202)
def track_model(req: TrackModelRequest) -> JSONResponse:
    """Record a new model_name so the next training run fetches eBay data for it.

    Idempotent — duplicate (model_name, asset_type) pairs are silently dropped.
    Returns 202 Accepted immediately; no training is triggered synchronously.
    """
    entries = _load_seen_queries()

    # Deduplicate by (model_name, asset_type).
    existing = {(e["model_name"], e["asset_type"]) for e in entries}
    key = (req.model_name, req.asset_type)
    if key in existing:
        return JSONResponse(status_code=202, content={"status": "already_tracked"})

    entries.append({
        "model_name": req.model_name,
        "asset_type": req.asset_type,
        "added_at": datetime.now(timezone.utc).isoformat(),
    })
    _save_seen_queries(entries)
    log.info("tracked new model for training: %r (%s)", req.model_name, req.asset_type)
    return JSONResponse(status_code=202, content={"status": "tracked", "total": len(entries)})
