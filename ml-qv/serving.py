"""Immutable serving entrypoint. Never trains or mutates model state."""
import hashlib
import json
import os
from pathlib import Path

def verify_artifacts(directory: Path):
    manifest = json.loads((directory / "manifest.json").read_text())
    for name in ("valuation.joblib", "depreciation.joblib"):
        actual = hashlib.sha256((directory / name).read_bytes()).hexdigest()
        if manifest.get("sha256", {}).get(name) != actual:
            raise RuntimeError("Model artifact integrity check failed")
    return manifest

# Must be set before importing the application and constructing model singletons.
os.environ["ML_SERVING_ONLY"] = "true"
os.environ["ML_RETRAIN_CRON"] = "off"
verify_artifacts(Path(os.environ.get("ML_MODEL_DIR", "/app/model_artifacts")))
from main import app  # noqa: E402,F401
