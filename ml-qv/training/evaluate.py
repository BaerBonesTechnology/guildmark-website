"""ML model evaluation — generates a self-contained HTML report with charts.

Trains both models in-memory from synthetic data (fast, no eBay calls), then
evaluates on a held-out test split and writes a report to eval_output/.

If a trained artifact already exists in $ML_MODEL_DIR, pass --artifact to load
it instead of re-training — useful for evaluating the production model.

Run (from ml-qv/):
    python -m training.evaluate               # synthetic train + eval
    python -m training.evaluate --artifact    # load saved .joblib artifact

Output:
    eval_output/report.html   (self-contained — open in any browser)
"""
from __future__ import annotations

import argparse
import base64
import io
import os
import sys
from pathlib import Path
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib
matplotlib.use("Agg")   # no display needed
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from models.valuation import feature_columns, ValuationModel
from models.depreciation import DepreciationModel
from training.synthetic_data import generate_valuation_data
# from training.retail_data import RetailPriceFetcher  # Amazon PA API — disabled for now

# ── Style ──────────────────────────────────────────────────────────────────────
sns.set_theme(style="whitegrid", palette="muted", font_scale=1.1)
PALETTE = {
    "laptop":     "#4C72B0",
    # "desktop":    "#55A868",
    # "server":     "#C44E52",
    # "phone":      "#8172B2",
    # "tablet":     "#937860",
    # "networking": "#DA8BC3",
    # "monitor":    "#8C8C8C",
    # "software":   "#CCB974",
    # "license":    "#64B5CD",
    # "other":      "#BBBBBB",
}
CONDITION_PALETTE = {"A": "#2ECC71", "B": "#F39C12", "C": "#E74C3C"}

N_TRAIN = 8_000
N_EVAL  = 2_000
RAND    = 42


# ── Helpers ───────────────────────────────────────────────────────────────────

def _fig_to_b64(fig: plt.Figure) -> str:
    """Encode a matplotlib figure as a base64 PNG string."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=130, bbox_inches="tight")
    buf.seek(0)
    plt.close(fig)
    return base64.b64encode(buf.read()).decode()


def _train_valuation_model(X_train, y_train) -> Pipeline:
    categorical = ["asset_type", "condition_grade"]
    numerical = [c for c in feature_columns() if c not in categorical]
    pre = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ("num", StandardScaler(), numerical),
    ])
    pipe = Pipeline([
        ("preprocess", pre),
        ("regressor", GradientBoostingRegressor(
            n_estimators=300, max_depth=5, learning_rate=0.05,
            subsample=0.8, random_state=RAND,
        )),
    ])
    pipe.fit(X_train, y_train)
    return pipe


# ── Charts ────────────────────────────────────────────────────────────────────

def chart_predicted_vs_actual(df_test: pd.DataFrame, preds: np.ndarray) -> str:
    fig, ax = plt.subplots(figsize=(7, 6))
    for atype, grp in df_test.groupby("asset_type"):
        idx = grp.index
        ax.scatter(grp["fmv"], preds[idx], alpha=0.45, s=18,
                   color=PALETTE.get(str(atype), "#999"), label=atype)
    lim = max(df_test["fmv"].max(), preds.max()) * 1.05
    ax.plot([0, lim], [0, lim], "k--", lw=1, label="perfect fit")
    ax.set_xlabel("Actual FMV ($)")
    ax.set_ylabel("Predicted FMV ($)")
    ax.set_title("Predicted vs Actual Fair Market Value")
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    ax.legend(fontsize=8, ncol=2)
    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_residuals(df_test: pd.DataFrame, preds: np.ndarray) -> str:
    residuals = preds - df_test["fmv"].values
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    # Histogram
    axes[0].hist(residuals, bins=60, color="#4C72B0", edgecolor="white", alpha=0.85)
    axes[0].axvline(0, color="red", lw=1.5, linestyle="--")
    axes[0].set_xlabel("Residual ($predicted − $actual)")
    axes[0].set_ylabel("Count")
    axes[0].set_title("Residual Distribution")
    axes[0].xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))

    # Residuals vs predicted
    axes[1].scatter(preds, residuals, alpha=0.3, s=12, color="#4C72B0")
    axes[1].axhline(0, color="red", lw=1.5, linestyle="--")
    axes[1].set_xlabel("Predicted FMV ($)")
    axes[1].set_ylabel("Residual")
    axes[1].set_title("Residuals vs Predicted")
    axes[1].xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    axes[1].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))

    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_mae_by_type(df_test: pd.DataFrame, preds: np.ndarray) -> str:
    rows = []
    for atype, grp in df_test.groupby("asset_type"):
        idx = grp.index
        mae = mean_absolute_error(grp["fmv"], preds[idx])
        rows.append({"asset_type": atype, "MAE": mae})
    mae_df = pd.DataFrame(rows).sort_values("MAE", ascending=True)

    fig, ax = plt.subplots(figsize=(7, 4))
    colors = [PALETTE.get(str(t), "#999") for t in mae_df["asset_type"]]
    bars = ax.barh(mae_df["asset_type"], mae_df["MAE"], color=colors, edgecolor="white")
    ax.bar_label(bars, fmt="$%.0f", padding=4, fontsize=9)
    ax.set_xlabel("Mean Absolute Error ($)")
    ax.set_title("MAE by Asset Type")
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_feature_importance(model: Pipeline) -> str:
    regressor = model.named_steps["regressor"]
    preprocessor = model.named_steps["preprocess"]

    # Get feature names out of the ColumnTransformer
    cat_enc = preprocessor.named_transformers_["cat"]
    cat_names = cat_enc.get_feature_names_out(["asset_type", "condition_grade"]).tolist()
    num_names = [c for c in feature_columns() if c not in ("asset_type", "condition_grade")]
    all_names = cat_names + num_names

    importances = regressor.feature_importances_
    fi = pd.Series(importances, index=all_names).sort_values(ascending=True)
    # Collapse one-hot categories into their group sum for readability
    fi_grouped = {}
    for name, val in fi.items():
        group = name.split("_")[0] if name.startswith("asset_type") else (
            "condition" if name.startswith("condition") else name
        )
        fi_grouped[group] = fi_grouped.get(group, 0.0) + val
    fi_grouped = pd.Series(fi_grouped).sort_values(ascending=True)

    fig, ax = plt.subplots(figsize=(7, 4))
    fi_grouped.plot.barh(ax=ax, color="#4C72B0", edgecolor="white")
    ax.set_xlabel("Importance (sum of gains)")
    ax.set_title("Feature Importance (grouped)")
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{x:.3f}"))
    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_price_by_type(df: pd.DataFrame) -> str:
    fig, ax = plt.subplots(figsize=(10, 5))
    order = df.groupby("asset_type")["fmv"].median().sort_values(ascending=False).index
    sns.boxplot(data=df, x="asset_type", y="fmv", order=order,
                hue="asset_type", palette=PALETTE, legend=False,
                ax=ax, fliersize=2, linewidth=0.8)
    ax.set_xlabel("Asset Type")
    ax.set_ylabel("Fair Market Value ($)")
    ax.set_title("Price Distribution by Asset Type (training data)")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_price_by_condition(df: pd.DataFrame) -> str:
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.violinplot(data=df, x="condition_grade", y="fmv",
                   hue="condition_grade", palette=CONDITION_PALETTE,
                   order=["A", "B", "C"], legend=False,
                   ax=ax, inner="quartile", linewidth=0.8)
    ax.set_xlabel("Condition Grade")
    ax.set_ylabel("Fair Market Value ($)")
    ax.set_title("Price Distribution by Condition")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_depreciation_curves(dep_model: DepreciationModel) -> str:
    horizon = 60
    starting = 2_000.0
    asset_types = list(PALETTE.keys())

    fig, ax = plt.subplots(figsize=(10, 5))
    for atype in asset_types:
        # Use per-type weight so each curve uses only that type's prior.
        points = dep_model.forecast(
            starting_value=starting,
            horizon_months=horizon,
            type_weights={atype: 1.0},
        )
        months = [p[0] for p in points]
        values = [p[1] for p in points]
        x_ticks = list(range(len(months)))
        ax.plot(x_ticks, values, label=atype, color=PALETTE[atype], linewidth=2)

    # X-axis: show every 12 months
    tick_positions = list(range(0, horizon, 12))
    tick_labels = [months[i] for i in tick_positions if i < len(months)]
    ax.set_xticks(tick_positions[:len(tick_labels)])
    ax.set_xticklabels(tick_labels, rotation=30, ha="right", fontsize=8)

    ax.axhline(starting * 0.15, color="red", linestyle="--", lw=1, label="15% floor")
    ax.set_xlabel("Month")
    ax.set_ylabel("Projected Value ($)")
    ax.set_title(f"Depreciation Forecast — {horizon}-Month Horizon (starting ${starting:,.0f})")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    ax.legend(fontsize=8, ncol=2)
    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_price_trajectory_by_type(val_pipeline: Pipeline, df_train: pd.DataFrame) -> str:
    """Predicted FMV for each asset type across ages 0–72 months.

    Holds condition=B and specs at per-type medians from the training data so
    each line reflects only the age-driven depreciation as learned by the model.
    """
    age_steps = list(range(0, 73, 6))  # 0, 6, 12, … 72
    asset_types = list(PALETTE.keys())

    # Per-type median specs from training data (fallback to global median).
    global_medians = {
        "cpu_score":      float(df_train["cpu_score"].median()),
        "ram_gb":         float(df_train["ram_gb"].median()),
        "storage_gb":     float(df_train["storage_gb"].median()),
        "original_price": float(df_train["original_price"].median()),
    }
    type_medians: dict[str, dict] = {}
    for atype in asset_types:
        grp = df_train[df_train["asset_type"] == atype]
        if len(grp) < 5:
            type_medians[atype] = global_medians.copy()
        else:
            type_medians[atype] = {
                "cpu_score":      float(grp["cpu_score"].median()),
                "ram_gb":         float(grp["ram_gb"].median()),
                "storage_gb":     float(grp["storage_gb"].median()),
                "original_price": float(grp["original_price"].median()),
            }

    fig, ax = plt.subplots(figsize=(11, 5))

    for atype in asset_types:
        meds = type_medians[atype]
        rows = []
        for age in age_steps:
            rows.append({
                "asset_type":     atype,
                "condition_grade": "B",
                "age_months":     age,
                "cpu_score":      meds["cpu_score"],
                "ram_gb":         meds["ram_gb"],
                "storage_gb":     meds["storage_gb"],
                "original_price": meds["original_price"],
            })
        grid = pd.DataFrame(rows)[feature_columns()]
        predicted = val_pipeline.predict(grid)

        # Normalise to % of age-0 price so different-value types sit on the same scale.
        baseline = predicted[0] if predicted[0] > 0 else 1.0
        pct = (predicted / baseline) * 100

        ax.plot(age_steps, pct,
                label=f"{atype} (${meds['original_price']:,.0f} baseline)",
                color=PALETTE[atype], linewidth=2.2, marker="o", markersize=4)

    ax.axhline(100, color="#cccccc", lw=0.8, linestyle="--")
    ax.set_xlabel("Asset Age (months)")
    ax.set_ylabel("Predicted Value (% of new price)")
    ax.set_title("Model-Predicted Price Trajectory by Asset Type\n"
                 "(Condition B · per-type median specs · normalised to age-0 price)")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{x:.0f}%"))
    ax.set_xticks(age_steps)
    ax.legend(fontsize=8, ncol=2)
    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_fmv_vs_depreciation(
    val_pipeline: Pipeline,
    df_train: pd.DataFrame,
    dep_model: "DepreciationModel",
    retail_prices: dict[str, float] | None = None,
) -> str:
    """Overlay ML-predicted FMV against the depreciation model's forecast.

    Both series start from the same age-0 valuation so the y-axis is in
    absolute dollars and crossings are immediately visible. A cross means the
    two models disagree on the current trajectory — useful for spotting where
    the rule-based depreciation diverges from what the market actually pays.

    If ``retail_prices`` is provided (keyed by asset_type), a horizontal band
    is drawn showing the current Amazon street price for a new unit, making
    the discount-from-retail gap visible at every age point.

    Solid lines   = GBR valuation model (market-anchored)
    Dashed lines  = Exponential depreciation model (fitted priors)
    Dotted lines  = Amazon retail price for new unit (reference ceiling)
    """
    age_steps = list(range(0, 73, 6))
    asset_types = list(PALETTE.keys())

    global_medians = {
        "cpu_score":      float(df_train["cpu_score"].median()),
        "ram_gb":         float(df_train["ram_gb"].median()),
        "storage_gb":     float(df_train["storage_gb"].median()),
        "original_price": float(df_train["original_price"].median()),
    }
    type_medians: dict[str, dict] = {}
    for atype in asset_types:
        grp = df_train[df_train["asset_type"] == atype]
        type_medians[atype] = {
            k: float(grp[k].median()) if len(grp) >= 5 else global_medians[k]
            for k in global_medians
        }

    fig, ax = plt.subplots(figsize=(11, 5))
    cross_annotations: list[tuple[float, float, str]] = []

    for atype in asset_types:
        meds = type_medians[atype]
        color = PALETTE[atype]

        # ── Valuation model predictions (absolute $) ─────────────────────────
        rows = [
            {
                "asset_type":      atype,
                "condition_grade": "B",
                "age_months":      age,
                "cpu_score":       meds["cpu_score"],
                "ram_gb":          meds["ram_gb"],
                "storage_gb":      meds["storage_gb"],
                "original_price":  meds["original_price"],
            }
            for age in age_steps
        ]
        val_preds = val_pipeline.predict(pd.DataFrame(rows)[feature_columns()])

        # ── Depreciation model forecast (same age-0 anchor) ──────────────────
        # forecast() returns (YYYY-MM, value) for months 1…horizon from today,
        # so index i → age (i+1) months.  Age 0 = the anchor itself.
        anchor = float(val_preds[0])
        dep_points = dep_model.forecast(
            starting_value=anchor,
            horizon_months=age_steps[-1],
            type_weights={atype: 1.0},
        )
        dep_by_age: dict[int, float] = {0: anchor}
        for idx, (_, v) in enumerate(dep_points):
            dep_by_age[idx + 1] = v
        dep_values = [dep_by_age.get(age, float("nan")) for age in age_steps]

        ax.plot(age_steps, val_preds,
                color=color, linewidth=2.2, marker="o", markersize=3,
                label=f"{atype} — valuation model")
        ax.plot(age_steps, dep_values,
                color=color, linewidth=1.8, linestyle="--",
                label=f"{atype} — depreciation model")

        # Detect crossings (sign changes in the difference series)
        diff = np.array(val_preds) - np.array(dep_values, dtype=float)
        for i in range(len(diff) - 1):
            if np.isnan(diff[i]) or np.isnan(diff[i + 1]):
                continue
            if diff[i] * diff[i + 1] < 0:
                # Linear interpolation for approximate crossing month
                t = age_steps[i] + (age_steps[i + 1] - age_steps[i]) * (
                    -diff[i] / (diff[i + 1] - diff[i])
                )
                crossing_val = float(np.interp(t, age_steps, val_preds))
                cross_annotations.append((t, crossing_val, atype))

    # ── Retail reference overlay (Amazon PA API — disabled for now) ───────────
    # if retail_prices:
    #     for atype, retail in retail_prices.items():
    #         if atype not in PALETTE:
    #             continue
    #         color = PALETTE[atype]
    #         ax.axhline(retail, color=color, linewidth=1.2, linestyle=":", alpha=0.7)
    #         ax.text(age_steps[-1] + 0.5, retail,
    #                 f"  {atype} retail\n  ${retail:,.0f}",
    #                 va="center", ha="left", fontsize=6.5, color=color, alpha=0.85)
    #         if atype == asset_types[0]:
    #             first_type_preds = val_pipeline.predict(
    #                 pd.DataFrame([{
    #                     "asset_type": atype, "condition_grade": "B",
    #                     "age_months": age, **{k: type_medians[atype][k]
    #                     for k in ("cpu_score", "ram_gb", "storage_gb", "original_price")},
    #                 } for age in age_steps])[feature_columns()]
    #             )
    #             ax.fill_between(age_steps, first_type_preds, retail,
    #                             where=[p < retail for p in first_type_preds],
    #                             alpha=0.06, color=color,
    #                             label=f"{atype} discount from retail")

    # Mark crossings
    for t, v, atype in cross_annotations:
        ax.annotate(
            f"✕ {atype}\n~{t:.0f}mo",
            xy=(t, v), xytext=(t + 3, v * 1.06),
            fontsize=7, color=PALETTE.get(atype, "#555"),
            arrowprops=dict(arrowstyle="-", color="#aaa", lw=0.8),
        )

    ax.set_xlabel("Asset Age (months)")
    ax.set_ylabel("Predicted Value ($)")
    ax.set_title("Fair Market Value vs Depreciation Model\n"
                 "(Solid = GBR valuation · Dashed = exponential depreciation · Condition B)")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    ax.set_xticks(age_steps)
    ax.legend(fontsize=7, ncol=2)
    fig.tight_layout()
    return _fig_to_b64(fig)


def chart_confidence_vs_accuracy(df_test: pd.DataFrame, preds: np.ndarray,
                                  confidences: np.ndarray) -> str:
    """Bucket predictions by confidence and show actual MAE per bucket."""
    df = df_test.copy()
    df["predicted"] = preds
    df["confidence"] = confidences
    df["abs_error"] = np.abs(preds - df["fmv"].values)
    df["conf_bin"] = pd.cut(df["confidence"], bins=5, precision=2)

    grp = df.groupby("conf_bin", observed=True).agg(
        mae=("abs_error", "mean"),
        count=("abs_error", "count"),
    ).reset_index()

    fig, ax1 = plt.subplots(figsize=(8, 4))
    ax2 = ax1.twinx()
    bins = [str(b) for b in grp["conf_bin"]]
    x = range(len(bins))

    bars = ax1.bar(x, grp["mae"], color="#4C72B0", alpha=0.75, label="MAE")
    ax2.plot(x, grp["count"], "o-", color="#E74C3C", label="Count", linewidth=2)

    ax1.set_xticks(list(x))
    ax1.set_xticklabels(bins, rotation=20, ha="right", fontsize=8)
    ax1.set_xlabel("Confidence Bucket")
    ax1.set_ylabel("MAE ($)", color="#4C72B0")
    ax1.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    ax2.set_ylabel("# Predictions", color="#E74C3C")
    ax1.set_title("Confidence vs Actual Error")

    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, fontsize=8)
    fig.tight_layout()
    return _fig_to_b64(fig)


# ── Report assembly ────────────────────────────────────────────────────────────

def _metric_card(label: str, value: str) -> str:
    return f"""
    <div class="card">
        <div class="metric-label">{label}</div>
        <div class="metric-value">{value}</div>
    </div>"""


def _chart_section(title: str, description: str, b64: str) -> str:
    return f"""
    <section>
        <h2>{title}</h2>
        <p class="desc">{description}</p>
        <img src="data:image/png;base64,{b64}" alt="{title}">
    </section>"""


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GuildMark ML Evaluation Report</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         background: #f4f6f9; color: #1a1a2e; line-height: 1.6; }}
  header {{ background: #1a1a2e; color: white; padding: 2rem 3rem; }}
  header h1 {{ font-size: 1.7rem; font-weight: 700; }}
  header p  {{ color: #a0aec0; font-size: 0.9rem; margin-top: 0.3rem; }}
  .metrics {{ display: flex; flex-wrap: wrap; gap: 1rem; padding: 2rem 3rem 0; }}
  .card {{ background: white; border-radius: 10px; padding: 1.2rem 1.8rem;
           box-shadow: 0 1px 4px rgba(0,0,0,.08); min-width: 160px; }}
  .metric-label {{ font-size: 0.78rem; color: #718096; text-transform: uppercase;
                   letter-spacing: 0.05em; }}
  .metric-value {{ font-size: 1.6rem; font-weight: 700; margin-top: 0.2rem; color: #2d3748; }}
  main {{ padding: 2rem 3rem; display: grid;
          grid-template-columns: repeat(auto-fit, minmax(560px, 1fr));
          gap: 2rem; }}
  section {{ background: white; border-radius: 10px;
             padding: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,.08); }}
  section h2 {{ font-size: 1.05rem; font-weight: 600; margin-bottom: 0.4rem; }}
  section .desc {{ font-size: 0.82rem; color: #718096; margin-bottom: 1rem; }}
  section img {{ width: 100%; border-radius: 6px; }}
  footer {{ text-align: center; padding: 2rem; color: #a0aec0; font-size: 0.8rem; }}
</style>
</head>
<body>
<header>
  <h1>GuildMark ML — Evaluation Report</h1>
  <p>Generated {timestamp} · {data_source} · {n_train} training rows · {n_test} test rows</p>
</header>
<div class="metrics">
{metric_cards}
</div>
<main>
{sections}
</main>
<footer>GuildMark ML Service · valuation-0.1.0 · depreciation-0.1.0</footer>
</body>
</html>
"""


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate GuildMark ML models")
    parser.add_argument(
        "--artifact", action="store_true",
        help="Load saved .joblib from $ML_MODEL_DIR instead of training in-memory",
    )
    # parser.add_argument(
    #     "--retail", action="store_true",
    #     help=(
    #         "Fetch current Amazon retail prices and overlay them on the FMV/depreciation "
    #         "chart. Requires AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_ASSOCIATE_TAG."
    #     ),
    # )
    args = parser.parse_args()

    print("=== GuildMark ML Evaluation ===")

    # ── Data ─────────────────────────────────────────────────────────────────
    total = N_TRAIN + N_EVAL
    print(f"Generating {total:,} synthetic records...")
    df_all = generate_valuation_data(n=total)

    df_train, df_test = train_test_split(df_all, test_size=N_EVAL, random_state=RAND)
    X_train = df_train[feature_columns()]
    y_train = df_train["fmv"]
    X_test  = df_test[feature_columns()]
    y_test  = df_test["fmv"]

    data_source = "synthetic data"

    # ── Valuation model ───────────────────────────────────────────────────────
    if args.artifact:
        model_dir = Path(os.environ.get("ML_MODEL_DIR", "./model_artifacts"))
        artifact = model_dir / "valuation.joblib"
        if not artifact.exists():
            print(f"ERROR: No artifact at {artifact}. Run train_valuation first.")
            sys.exit(1)
        print(f"Loading artifact from {artifact}...")
        val_pipeline = joblib.load(artifact)
        data_source = f"artifact ({artifact.name})"
    else:
        print("Training valuation model in-memory...")
        val_pipeline = _train_valuation_model(X_train, y_train)

    print("Running predictions on test set...")
    preds = val_pipeline.predict(X_test)
    df_test = df_test.reset_index(drop=True)

    # Collect confidence scores using ValuationModel._confidence heuristic.
    from models.valuation import ValuationModel, ValuationFeatures
    _vm = ValuationModel(val_pipeline)
    confidences = np.array([
        _vm._confidence(float(preds[i]), ValuationFeatures(
            asset_type=str(row["asset_type"]),
            condition_grade=str(row["condition_grade"]),
            age_months=int(row["age_months"]),
            cpu_score=float(row["cpu_score"]),
            ram_gb=int(row["ram_gb"]),
            storage_gb=int(row["storage_gb"]),
            original_price=float(row["original_price"]),
        ))
        for i, (_, row) in enumerate(df_test.iterrows())
    ])

    mae  = mean_absolute_error(y_test, preds)
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    r2   = r2_score(y_test, preds)
    mape = float(np.mean(np.abs((y_test.values - preds) / np.clip(y_test.values, 1, None))) * 100)
    avg_conf = float(confidences.mean())

    print(f"  MAE  = ${mae:,.2f}")
    print(f"  RMSE = ${rmse:,.2f}")
    print(f"  R²   = {r2:.4f}")
    print(f"  MAPE = {mape:.2f}%")
    print(f"  Avg Confidence = {avg_conf:.3f}")

    # ── Depreciation model ────────────────────────────────────────────────────
    print("Training depreciation model in-memory...")
    import numpy as _np
    dep_priors: dict[str, float] = {}
    for asset_type, grp in df_train.groupby("asset_type"):
        ratio = (grp["fmv"] / grp["original_price"]).clip(lower=0.05)
        log_ratio = _np.log(ratio)
        ages = grp["age_months"].to_numpy()
        if len(ages) < 50 or float(_np.std(ages)) == 0.0:
            continue
        slope, _ = _np.polyfit(ages, log_ratio, 1)
        decay = float(_np.clip(_np.exp(slope), 0.93, 0.999))
        dep_priors[str(asset_type)] = decay
    dep_model = DepreciationModel(dep_priors)

    # ── Retail prices (Amazon PA API — disabled for now) ─────────────────────
    # retail_prices: dict[str, float] = {}
    # if args.retail:
    #     print("Fetching Amazon retail prices...")
    #     retail_prices = RetailPriceFetcher().fetch_by_type(list(PALETTE.keys()))
    #     if retail_prices:
    #         print("  Retail reference prices:")
    #         for atype, price in sorted(retail_prices.items()):
    #             print(f"    {atype:<12} ${price:,.2f}")
    #     else:
    #         print("  No retail prices returned — overlay will be skipped.")
    retail_prices: dict[str, float] = {}

    # ── Generate charts ───────────────────────────────────────────────────────
    print("Generating charts...")
    charts = {
        "pred_vs_actual":     chart_predicted_vs_actual(df_test, preds),
        "residuals":          chart_residuals(df_test, preds),
        "mae_by_type":        chart_mae_by_type(df_test, preds),
        "feature_importance": chart_feature_importance(val_pipeline),
        "price_by_type":      chart_price_by_type(df_all),
        "price_by_condition": chart_price_by_condition(df_all),
        "depreciation":       chart_depreciation_curves(dep_model),
        "confidence_vs_acc":  chart_confidence_vs_accuracy(df_test, preds, confidences),
        "price_trajectory":   chart_price_trajectory_by_type(val_pipeline, df_train),
        "fmv_vs_dep":         chart_fmv_vs_depreciation(
                                  val_pipeline, df_train, dep_model,
                                  retail_prices=retail_prices or None,
                              ),
    }

    # ── Assemble HTML ─────────────────────────────────────────────────────────
    metric_cards = (
        _metric_card("MAE", f"${mae:,.0f}")
        + _metric_card("RMSE", f"${rmse:,.0f}")
        + _metric_card("R²", f"{r2:.4f}")
        + _metric_card("MAPE", f"{mape:.1f}%")
        + _metric_card("Avg Confidence", f"{avg_conf:.3f}")
        + _metric_card("Test Rows", f"{len(df_test):,}")
        # + "".join(                                          # Amazon PA API — disabled
        #     _metric_card(f"Retail ({atype})", f"${price:,.0f}")
        #     for atype, price in sorted(retail_prices.items())
        # )
    )

    sections = (
        _chart_section(
            "Predicted vs Actual",
            "Each point is a held-out test asset. A perfect model would lie on the dashed line. "
            "Spread indicates where the model over- or under-estimates.",
            charts["pred_vs_actual"],
        )
        + _chart_section(
            "Residuals",
            "Left: distribution of (predicted − actual). Should be centered near $0 with symmetric tails. "
            "Right: residuals vs predicted — look for patterns or heteroskedasticity.",
            charts["residuals"],
        )
        + _chart_section(
            "MAE by Asset Type",
            "Mean absolute error broken down by category. Higher-value categories (servers) naturally "
            "have larger dollar errors even at the same percentage accuracy.",
            charts["mae_by_type"],
        )
        + _chart_section(
            "Feature Importance",
            "How much each input feature drives predictions in the gradient boosted tree. "
            "One-hot features (asset_type, condition) are summed into their group.",
            charts["feature_importance"],
        )
        + _chart_section(
            "Price Distribution by Asset Type",
            "Box plot of fair market values across the training set. Whiskers = 1.5× IQR. "
            "Useful for spotting outliers and understanding value ranges per category.",
            charts["price_by_type"],
        )
        + _chart_section(
            "Price Distribution by Condition Grade",
            "Violin plot of FMV by condition. A (like-new) should sit clearly above C (heavy wear). "
            "Narrow violins indicate low variance; wide violins indicate high spread.",
            charts["price_by_condition"],
        )
        + _chart_section(
            "Depreciation Forecast (60 months)",
            "Projected portfolio value over 5 years starting at $2,000 per asset type, "
            "using fitted per-type decay priors. Red dashed line = 15% residual value floor.",
            charts["depreciation"],
        )
        + _chart_section(
            "Confidence vs Actual Error",
            "Do higher confidence scores correlate with lower MAE? "
            "Blue bars = actual MAE per confidence bucket; red line = number of predictions in each bucket.",
            charts["confidence_vs_acc"],
        )
        + _chart_section(
            "FMV vs Depreciation Model (crossover chart)",
            "Solid lines = what the GBR model predicts the market will pay at each age. "
            "Dashed lines = what the exponential depreciation model forecasts from the same starting value. "
            "Dotted lines = current Amazon retail price for a new unit (run with --retail to populate). "
            "A crossing (✕) flags where the two models diverge — the valuation model has picked up "
            "a market signal (e.g. slow early depreciation on premium SKUs, or accelerated drop past peak) "
            "that the simpler decay curve misses. "
            "The shaded band shows the discount-from-retail gap for the primary asset type.",
            charts["fmv_vs_dep"],
        )
        + _chart_section(
            "Price Trajectory by Asset Type (0–72 months)",
            "What the model predicts will happen to each device category's value over 6 years. "
            "Condition B, per-type median specs, normalised to 100% at age 0 so curves are comparable "
            "across categories with very different absolute prices. "
            "Steeper drops = faster depreciation as learned from real market data.",
            charts["price_trajectory"],
        )
    )

    html = HTML_TEMPLATE.format(
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"),
        data_source=data_source,
        n_train=f"{len(df_train):,}",
        n_test=f"{len(df_test):,}",
        metric_cards=metric_cards,
        sections=sections,
    )

    out_dir = Path("eval_output")
    out_dir.mkdir(exist_ok=True)
    report_path = out_dir / "report.html"
    report_path.write_text(html, encoding="utf-8")
    print(f"\n✓ Report written to {report_path.resolve()}")
    print("  Open in a browser: file://" + str(report_path.resolve()).replace("\\", "/"))


if __name__ == "__main__":
    sys.exit(main())
