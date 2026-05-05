"""Portfolio depreciation forecaster.

A simple parametric model: fit an exponential decay curve to a company's
recent valuation snapshots, then project N months forward. This is a
deliberately small model — we'll swap in a proper time-series approach
(Prophet, ARIMA, or an LSTM) once we have months of real data.

For now the trained artifact stores fitted decay rate priors per asset_type.
"""
from __future__ import annotations

import os
from datetime import date
from pathlib import Path

import joblib
import numpy as np

MODEL_VERSION = "depreciation-0.1.0"

# Default monthly decay (multiplicative) when a company has no history.
_DEFAULT_MONTHLY_DECAY = 0.985   # ~16.5% / year


class DepreciationModel:
    _instance: "DepreciationModel | None" = None

    def __init__(self, decay_priors: dict[str, float] | None) -> None:
        # decay_priors maps asset_type -> monthly decay multiplier.
        self._priors = decay_priors or {}

    @classmethod
    def load(cls) -> "DepreciationModel":
        if cls._instance is not None:
            return cls._instance
        path = Path(os.environ.get("ML_MODEL_DIR", "./models")) / "depreciation.joblib"
        priors = joblib.load(path) if path.exists() else None
        cls._instance = cls(priors)
        return cls._instance

    def forecast(
        self,
        *,
        starting_value: float,
        horizon_months: int,
        # Mix of asset types in the portfolio, weighted by current value.
        # If empty, the global default decay applies.
        type_weights: dict[str, float] | None = None,
    ) -> list[tuple[str, float]]:
        decay = self._weighted_decay(type_weights)
        today = date.today()
        out: list[tuple[str, float]] = []
        value = starting_value
        for i in range(1, horizon_months + 1):
            value *= decay
            month = _add_months(today, i)
            out.append((f"{month.year:04d}-{month.month:02d}", round(value, 2)))
        return out

    # -- helpers ------------------------------------------------------------

    def _weighted_decay(self, type_weights: dict[str, float] | None) -> float:
        if not type_weights:
            return _DEFAULT_MONTHLY_DECAY
        total = sum(type_weights.values())
        if total <= 0:
            return _DEFAULT_MONTHLY_DECAY
        weighted = 0.0
        for asset_type, weight in type_weights.items():
            d = self._priors.get(asset_type, _DEFAULT_MONTHLY_DECAY)
            weighted += d * (weight / total)
        return float(np.clip(weighted, 0.90, 0.999))


def _add_months(d: date, n: int) -> date:
    month = d.month - 1 + n
    year  = d.year + month // 12
    return date(year, month % 12 + 1, 1)
