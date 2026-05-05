"""Fair market value regressor.

Wraps a scikit-learn GradientBoostingRegressor with categorical encoding
done up front. The model is small, lazy-loaded once per process from a
joblib artifact in ``$ML_MODEL_DIR``.

If the artifact is missing (e.g., first boot before training has run), the
class falls back to a deterministic rules-based estimator so requests don't
fail outright.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODEL_VERSION = "valuation-0.1.0"

# Condition grade -> remaining-value multiplier. Tuned to match the
# rubric the design brief lays out (A: like-new, B: light wear, C: heavy wear).
_CONDITION_MULT = {"A": 1.00, "B": 0.78, "C": 0.55}

# Asset-type -> base price baseline (USD), used only for the rules fallback.
_FALLBACK_BASE_PRICE = {
    "laptop":     950.0,
    "desktop":    700.0,
    "server":     2500.0,
    "phone":      450.0,
    "tablet":     400.0,
    "networking": 600.0,
    "monitor":    220.0,
    "software":   80.0,
    "license":    50.0,
    "other":      300.0,
}


@dataclass
class ValuationFeatures:
    asset_type:      str
    condition_grade: str
    age_months:      int
    cpu_score:       float | None
    ram_gb:          int   | None
    storage_gb:      int   | None
    original_price:  float | None


class ValuationModel:
    """Lazy-loaded singleton wrapper around the trained regressor."""

    _instance: "ValuationModel | None" = None

    def __init__(self, pipeline: object | None) -> None:
        self._pipeline = pipeline   # sklearn Pipeline if available, else None

    @classmethod
    def load(cls) -> "ValuationModel":
        if cls._instance is not None:
            return cls._instance
        path = Path(os.environ.get("ML_MODEL_DIR", "./models")) / "valuation.joblib"
        pipeline = joblib.load(path) if path.exists() else None
        cls._instance = cls(pipeline)
        return cls._instance

    def predict(self, f: ValuationFeatures) -> tuple[float, float]:
        """Return (fair_market_value, confidence)."""
        if self._pipeline is None:
            return self._rule_based(f), 0.40       # low confidence — no model

        df    = pd.DataFrame([self._row(f)])
        value = float(self._pipeline.predict(df)[0])
        # Confidence proxy: how close the prediction is to a sane band.
        # Real systems would use quantile regression or MAPIE.
        confidence = self._confidence(value, f)
        return max(value, 0.0), confidence

    # -- helpers ------------------------------------------------------------

    @staticmethod
    def _row(f: ValuationFeatures) -> dict[str, float | str]:
        return {
            "asset_type":      f.asset_type,
            "condition_grade": f.condition_grade,
            "age_months":      f.age_months,
            "cpu_score":       f.cpu_score      or 0.0,
            "ram_gb":          f.ram_gb         or 0,
            "storage_gb":      f.storage_gb     or 0,
            "original_price":  f.original_price or 0.0,
        }

    @staticmethod
    def _rule_based(f: ValuationFeatures) -> float:
        """Deterministic fallback so the endpoint never 500s pre-training."""
        anchor = (
            f.original_price
            or _FALLBACK_BASE_PRICE.get(f.asset_type, 300.0)
        )
        # Geometric depreciation: ~25% loss in year 1, asymptote at 15%.
        decay = max(0.15, 0.75 ** (f.age_months / 12))
        cond  = _CONDITION_MULT.get(f.condition_grade, 0.7)
        return round(anchor * decay * cond, 2)

    @staticmethod
    def _confidence(value: float, f: ValuationFeatures) -> float:
        if f.original_price and f.original_price > 0:
            ratio = value / f.original_price
            # Sane band: 5%–110% of original. Pull confidence from how
            # comfortably the prediction sits inside that band.
            if 0.05 <= ratio <= 1.10:
                return float(np.clip(1.0 - abs(ratio - 0.5) / 0.6, 0.5, 0.9))
        return 0.6


def feature_columns() -> list[str]:
    """Order of columns expected by the trained pipeline."""
    return [
        "asset_type", "condition_grade", "age_months",
        "cpu_score", "ram_gb", "storage_gb",
        "original_price",
    ]
