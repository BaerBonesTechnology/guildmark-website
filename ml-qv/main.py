"""FastAPI app for AsTech ML inference."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException

from models.depreciation import DepreciationModel
from models.depreciation import MODEL_VERSION as DEP_VERSION
from models.valuation import MODEL_VERSION as VAL_VERSION
from models.valuation import ValuationFeatures, ValuationModel
from schemas import (
    DepreciationPoint,
    DepreciationRequest,
    DepreciationResponse,
    ValuationRequest,
    ValuationResponse,
)

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
