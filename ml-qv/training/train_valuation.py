"""Train the fair-market-value regressor and persist to ``$ML_MODEL_DIR``.

Run:
    python -m training.train_valuation
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import joblib
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from models.valuation import feature_columns
from training.synthetic_data import generate_valuation_data


def main() -> None:
    df = generate_valuation_data(n=5000)
    X = df[feature_columns()]
    y = df["fmv"]

    categorical = ["asset_type", "condition_grade"]
    numerical = [c for c in feature_columns() if c not in categorical]

    preprocess = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
            ("num", StandardScaler(), numerical),
        ]
    )
    model = Pipeline(steps=[
        ("preprocess", preprocess),
        ("regressor", GradientBoostingRegressor(
            n_estimators=250,
            max_depth=5,
            learning_rate=0.05,
            random_state=42,
        )),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"[train_valuation] MAE=${mae:,.2f}  R2={r2:.4f}")

    out_dir = Path(os.environ.get("ML_MODEL_DIR", "./models"))
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "valuation.joblib"
    joblib.dump(model, out_path)
    print(f"[train_valuation] wrote {out_path}")


if __name__ == "__main__":
    sys.exit(main())
