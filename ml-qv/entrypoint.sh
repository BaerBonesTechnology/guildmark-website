#!/usr/bin/env bash
# GuildMark ML service entrypoint.
#
# Trains model artifacts at container startup if they are missing, then
# launches uvicorn. Training is skipped if both .joblib files already exist
# on the mounted volume — subsequent restarts start immediately.
#
# Env vars:
#   ML_MODEL_DIR   — artifact directory (default: /app/model_artifacts)
#   RETRAIN        — set to "1" to force re-training even if artifacts exist
#   EBAY_APP_ID    — required for real eBay price data in train_valuation
#   EBAY_CERT_ID   — required for real eBay price data in train_valuation
#   ML_PORT        — uvicorn port (default: 8001)

set -euo pipefail

MODEL_DIR="${ML_MODEL_DIR:-/app/model_artifacts}"
VAL_ARTIFACT="$MODEL_DIR/valuation.joblib"
DEP_ARTIFACT="$MODEL_DIR/depreciation.joblib"

mkdir -p "$MODEL_DIR"

should_train() {
  [[ "${RETRAIN:-0}" == "1" ]] \
    || [[ ! -f "$VAL_ARTIFACT" ]] \
    || [[ ! -f "$DEP_ARTIFACT" ]]
}

if should_train; then
  if [[ "${RETRAIN:-0}" == "1" ]]; then
    echo "[entrypoint] RETRAIN=1 — forcing re-training..."
  else
    echo "[entrypoint] Model artifacts not found — training now..."
  fi

  if [[ -z "${EBAY_APP_ID:-}" || -z "${EBAY_CERT_ID:-}" ]]; then
    echo "[entrypoint] WARNING: EBAY_APP_ID / EBAY_CERT_ID not set."
    echo "[entrypoint]   train_valuation will use synthetic data only."
  fi

  # Log how many user-tracked models will be included in this run.
  SEEN_FILE="$MODEL_DIR/seen_queries.json"
  if [[ -f "$SEEN_FILE" ]]; then
    TRACKED_COUNT=$(python3 -c "import json; d=json.load(open('$SEEN_FILE')); print(len(d))" 2>/dev/null || echo "?")
    echo "[entrypoint] seen_queries.json: $TRACKED_COUNT user-tracked model(s) will be included."
  fi

  echo "[entrypoint] Running train_valuation..."
  python -m training.train_valuation

  echo "[entrypoint] Running train_depreciation..."
  python -m training.train_depreciation

  echo "[entrypoint] Training complete. Artifacts written to $MODEL_DIR"
else
  echo "[entrypoint] Artifacts already present — skipping training."
  echo "[entrypoint]   valuation:    $VAL_ARTIFACT"
  echo "[entrypoint]   depreciation: $DEP_ARTIFACT"
  echo "[entrypoint] Set RETRAIN=1 to force a retrain."
fi

echo "[entrypoint] Starting uvicorn on port ${ML_PORT:-8001}..."
exec uvicorn main:app --host 0.0.0.0 --port "${ML_PORT:-8001}"
