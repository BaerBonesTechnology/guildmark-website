"""Request/response schemas for the ML service.

These mirror the Dart `MlClient` types in `../api/lib/ml/ml_client.dart` —
keep them in sync when adding fields.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

AssetType = Literal[
    "laptop", "desktop", "server", "phone",
    "tablet", "networking", "monitor", "software", "license", "other",
]
ConditionGrade = Literal["A", "B", "C"]


class ValuationRequest(BaseModel):
    asset_type:      AssetType
    model_name:      str
    condition_grade: ConditionGrade
    age_months:      int = Field(ge=0, le=240)
    cpu_score:       float | None = None
    ram_gb:          int   | None = None
    storage_gb:      int   | None = None
    original_price:  float | None = None


class ValuationResponse(BaseModel):
    fair_market_value: float
    confidence:        float = Field(ge=0, le=1)
    model_version:     str


class DepreciationRequest(BaseModel):
    company_id:     str
    horizon_months: int = Field(ge=1, le=36, default=12)
    # Optional: pass current portfolio value if the caller already has it,
    # otherwise the model uses a default decay curve.
    current_value:  float | None = None


class DepreciationPoint(BaseModel):
    month:           str    # YYYY-MM
    projected_value: float


class DepreciationResponse(BaseModel):
    forecast:      list[DepreciationPoint]
    model_version: str
