"""Fit per-asset-type monthly decay priors for the depreciation forecaster.

Until we have real portfolio history, we derive priors directly from the
synthetic valuation data: for each asset_type, fit log(fmv/original_price) ~
age_months and convert the slope into a monthly multiplicative decay.

Run:
    python -m training.train_depreciation
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import joblib
import numpy as np

from training.synthetic_data import generate_valuation_data


def main() -> None:
    df = generate_valuation_data(n=10_000)
    df = df[df["fmv"] > 0]

    priors: dict[str, float] = {}
    for asset_type, group in df.groupby("asset_type"):
        # Avoid log(0) and stabilize against synthetic noise.
        ratio = (group["fmv"] / group["original_price"]).clip(lower=0.05)
        log_ratio = np.log(ratio)
        ages = group["age_months"].to_numpy()
        if len(ages) < 50 or float(np.std(ages)) == 0.0:
            continue

        # Slope of log(ratio) vs age_months -> per-month log decay.
        slope, _ = np.polyfit(ages, log_ratio, 1)
        # exp(slope) is the per-month multiplicative decay; clamp to a sane band.
        decay = float(np.clip(np.exp(slope), 0.93, 0.999))
        priors[str(asset_type)] = decay

    print("[train_depreciation] decay priors:")
    for k, v in sorted(priors.items()):
        annual = (v ** 12 - 1) * 100
        print(f"  {k:<12} monthly={v:.4f}  annual_change={annual:+.2f}%")

    out_dir = Path(os.environ.get("ML_MODEL_DIR", "./models"))
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "depreciation.joblib"
    joblib.dump(priors, out_path)
    print(f"[train_depreciation] wrote {out_path}")


if __name__ == "__main__":
    sys.exit(main())
