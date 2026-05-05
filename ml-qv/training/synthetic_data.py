"""Synthetic training data generator.

Used to supplement eBay data for features the Browse API does not expose
(age_months, original_price, cpu_score). The shape matches what the live
system will eventually feed in via the assets table.

The "anchor" price here represents the customer's original purchase price
(`original_price` on the asset row).
"""
from __future__ import annotations

import numpy as np
import pandas as pd

_RNG = np.random.default_rng(seed=42)

# Coarse anchors per asset type — typical new-unit price range, USD.
_TYPE_ANCHORS = {
    "laptop": (900, 2400),
    # "desktop": (650, 1800),
    # "server": (1800, 6500),
    # "phone": (350, 1100),
    # "tablet": (300, 1000),
    # "networking": (400, 1500),
    # "monitor": (180, 600),
    # "software": (40, 250),
    # "license": (30, 200),
    # "other": (200, 800),
}

_CONDITION_DECAY = {"A": 1.00, "B": 0.78, "C": 0.55}


def generate_valuation_data(n: int = 5000) -> pd.DataFrame:
    """Return a DataFrame matching ValuationModel.feature_columns() + 'fmv'."""
    types = list(_TYPE_ANCHORS.keys())
    rows = []
    for _ in range(n):
        asset_type = _RNG.choice(types)
        lo, hi = _TYPE_ANCHORS[asset_type]
        original_price = _RNG.uniform(lo, hi)
        condition = _RNG.choice(["A", "B", "C"], p=[0.25, 0.55, 0.20])
        age_months = int(_RNG.integers(0, 84))
        cpu_score = _RNG.uniform(50, 250)
        ram_gb = int(_RNG.choice([4, 8, 16, 32, 64]))
        storage_gb = int(_RNG.choice([128, 256, 512, 1024, 2048]))

        # Truth function: geometric decay × condition × small spec premium.
        decay = max(0.15, 0.78 ** (age_months / 12))
        spec_lift = (
                (cpu_score / 250) * 0.10
                + (ram_gb / 64) * 0.05
                + (storage_gb / 2048) * 0.05
        )
        fmv = original_price * decay * _CONDITION_DECAY[condition] * (1 + spec_lift)
        # Multiplicative noise.
        fmv *= _RNG.normal(loc=1.0, scale=0.10)
        fmv = max(fmv, 5.0)

        rows.append({
            "asset_type": asset_type,
            "condition_grade": condition,
            "age_months": age_months,
            "cpu_score": cpu_score,
            "ram_gb": ram_gb,
            "storage_gb": storage_gb,
            "original_price": original_price,
            "fmv": fmv,
        })

    return pd.DataFrame(rows)
