"""Train the fair-market-value regressor using real eBay market data.

Strategy — hybrid eBay + synthetic:
  eBay Browse API provides real price signal across conditions and asset types.
  Synthetic data supplements age_months and original_price, which the Browse
  API does not expose on listings.  The two datasets are concatenated and the
  model trains on the blend. Asset types with strong eBay coverage get less
  synthetic fill-in.

Run:
    python -m training.train_valuation

Env vars:
    EBAY_APP_ID    — eBay application Client ID (required for live data)
    EBAY_CERT_ID   — eBay application Client Secret (required for live data)
    EBAY_SANDBOX   — set to "1" to hit the sandbox environment (limited data)
    ML_MODEL_DIR   — output directory for the artifact (default: ./models)
    EBAY_ONLY      — set to "1" to skip synthetic supplement (not recommended;
                     age_months will be NaN across all rows)
"""
from __future__ import annotations

import json
import logging
import os
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from models.valuation import feature_columns
from training.data_retrieval import DataGrabber
from training.synthetic_data import generate_valuation_data

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger("train_valuation")

# ---------------------------------------------------------------------------
# eBay search queries per asset type.
# Broad enough to return 200+ listings; specific enough to stay on-category.
# Multiple queries per type are intentional — they sample different price bands.
# ---------------------------------------------------------------------------
_EBAY_QUERIES: list[tuple[str, str]] = [
    # (asset_type, search query)
    ("laptop",     "Apple MacBook Pro laptop"),
    ("laptop",     "Dell XPS laptop"),
    ("laptop",     "Lenovo ThinkPad laptop"),
    ("laptop",     "HP EliteBook laptop"),
    # ("desktop",    "Apple Mac Mini desktop"),
    # ("desktop",    "Dell OptiPlex desktop"),
    # ("desktop",    "HP EliteDesk desktop"),
    # ("server",     "Dell PowerEdge server"),
    # ("server",     "HP ProLiant server rack"),
    # ("phone",      "Apple iPhone unlocked smartphone"),
    # ("phone",      "Samsung Galaxy S unlocked"),
    # ("tablet",     "Apple iPad Pro"),
    # ("tablet",     "Microsoft Surface Pro tablet"),
    # ("networking", "Cisco switch enterprise"),
    # ("networking", "Ubiquiti UniFi access point"),
    # ("monitor",    "Dell UltraSharp monitor"),
    # ("monitor",    "LG 4K monitor"),
]

# If an asset type has at least this many eBay rows, skip synthetic for it.
_MIN_EBAY_ROWS = 100

# Synthetic rows to add as a supplement (provides age/price signal).
_SYNTHETIC_ROWS = 3_000


def _load_seen_queries() -> list[tuple[str, str]]:
    """Load user-submitted model queries from the tracking file on the volume."""
    path = Path(os.environ.get("ML_MODEL_DIR", "./model_artifacts")) / "seen_queries.json"
    if not path.exists():
        return []
    try:
        entries = json.loads(path.read_text())
        return [(e["model_name"], e["asset_type"]) for e in entries
                if "model_name" in e and "asset_type" in e]
    except Exception as exc:
        log.warning("Could not load seen_queries.json: %s", exc)
        return []


def main() -> None:
    grabber = DataGrabber()
    ebay_frames: list[pd.DataFrame] = []

    # Merge built-in queries with any models tracked via POST /data/track.
    # Deduplicate by query string so resubmissions don't double-fetch.
    seen = _load_seen_queries()
    built_in_queries = set(q for _, q in _EBAY_QUERIES)
    extra_queries = [(atype, name) for name, atype in seen
                     if name not in built_in_queries]
    all_queries = _EBAY_QUERIES + extra_queries
    if extra_queries:
        log.info("Loaded %d user-tracked model(s) from seen_queries.json:", len(extra_queries))
        for atype, name in extra_queries:
            log.info("  [%s]  %r", atype, name)

    log.info("=== Fetching eBay market data ===")
    for asset_type, query in all_queries:
        log.info("eBay query  [%s]  %r", asset_type, query)
        df = grabber.retrieve_and_process_data(query)
        if not df.empty:
            # Override DataGrabber's inferred asset_type with our explicit label
            # so training labels stay consistent regardless of eBay category names.
            df["asset_type"] = asset_type
            ebay_frames.append(df)
            log.info("  → %d rows", len(df))
        else:
            log.warning("  → no data returned for %r", query)

    # ── Combine and re-clean eBay rows ────────────────────────────────────────
    if ebay_frames:
        ebay_df = pd.concat(ebay_frames, ignore_index=True)
        ebay_df = grabber.clean_and_preprocess_data(ebay_df)
        log.info("eBay combined rows after cleaning: %d", len(ebay_df))
    else:
        log.warning("No eBay data retrieved — training on synthetic data only.")
        ebay_df = pd.DataFrame(columns=feature_columns() + ["fmv"])

    ebay_counts: dict[str, int] = {}
    if not ebay_df.empty and "asset_type" in ebay_df.columns:
        ebay_counts = ebay_df.groupby("asset_type").size().to_dict()

    # ── Synthetic supplement ──────────────────────────────────────────────────
    # Always supplement because eBay listings omit age_months and original_price.
    # We drop synthetic rows for types that are already well covered by eBay so
    # real price signal dominates for those categories.
    if os.environ.get("EBAY_ONLY") != "1":
        log.info("Generating %d synthetic rows for age/price signal...", _SYNTHETIC_ROWS)
        synth_df = generate_valuation_data(n=_SYNTHETIC_ROWS)

        well_covered = {t for t, cnt in ebay_counts.items() if cnt >= _MIN_EBAY_ROWS}
        if well_covered:
            synth_df = synth_df[~synth_df["asset_type"].isin(well_covered)].copy()
            log.info(
                "Dropped synthetic rows for well-covered types (%s) — %d synthetic rows remain",
                ", ".join(sorted(well_covered)),
                len(synth_df),
            )
    else:
        log.info("EBAY_ONLY=1 — skipping synthetic supplement.")
        synth_df = pd.DataFrame(columns=feature_columns() + ["fmv"])

    # ── Merge and final clean ─────────────────────────────────────────────────
    combined = pd.concat([ebay_df, synth_df], ignore_index=True)
    combined = combined.dropna(subset=["fmv"])
    combined = combined[combined["fmv"] > 0]

    # Impute any remaining NaNs in numeric feature columns with the global
    # median so StandardScaler doesn't blow up.
    for col in feature_columns():
        if col in ("asset_type", "condition_grade"):
            continue
        nan_count = combined[col].isna().sum()
        if nan_count > 0:
            median_val = combined[col].median()
            combined[col] = combined[col].fillna(median_val)
            log.info("Imputed %d NaNs in %r with median=%.1f", nan_count, col, median_val)

    log.info("=== Training set summary (%d rows total) ===", len(combined))
    for asset_type, cnt in sorted(combined.groupby("asset_type").size().items()):
        ebay_cnt = ebay_counts.get(str(asset_type), 0)
        synth_cnt = cnt - ebay_cnt
        log.info("  %-12s  total=%-5d  ebay=%-5d  synthetic=%d",
                 asset_type, cnt, ebay_cnt, synth_cnt)

    if len(combined) < 200:
        log.error("Not enough training data (%d rows). Aborting.", len(combined))
        sys.exit(1)

    # ── Build and train pipeline ───────────────────────────────────────────────
    X = combined[feature_columns()]
    y = combined["fmv"]

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
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            random_state=42,
        )),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
    )
    log.info("Training on %d rows, evaluating on %d rows...", len(X_train), len(X_test))
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    log.info("=== Results: MAE=$%.2f  R²=%.4f ===", mae, r2)

    out_dir = Path(os.environ.get("ML_MODEL_DIR", "./models"))
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "valuation.joblib"
    joblib.dump(model, out_path)
    log.info("Wrote %s", out_path)


if __name__ == "__main__":
    sys.exit(main())
