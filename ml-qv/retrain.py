"""Daily in-process model retraining.

The valuation and depreciation models are cached as class singletons
(``ValuationModel._instance``), so writing fresh ``.joblib`` files to disk is
not enough — the running process must drop the cached models and reload. This
module owns both halves: it runs the training modules in a subprocess, and on
success invalidates + re-warms the singletons so the next request serves the
new model without a restart.

Scheduling is an in-app APScheduler cron job (no host cron, no sidecar), so it
behaves identically in local dev and on the prod VM. Configure with:

  ML_RETRAIN_CRON   5-field cron expr (default "0 3 * * *" — 03:00 daily).
                    Set to "off" / "disabled" / "" to disable the schedule
                    (e.g. when the container is only serving, not owning the
                    retrain — a single writer avoids duplicate work).
  ML_MODEL_DIR      Artifact dir the training writes and the models read.
"""
from __future__ import annotations

import asyncio
import logging
import os
import sys
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from models.depreciation import DepreciationModel
from models.valuation import ValuationModel

log = logging.getLogger("astech.ml.retrain")

_DEFAULT_CRON = "0 3 * * *"  # 03:00 every day (server-local time)
_DISABLED = {"", "off", "disabled", "none", "false", "0"}

# Guards against overlapping runs (a long retrain + a manual trigger, or a
# slow run bleeding into the next scheduled tick).
_lock = asyncio.Lock()
_last_run: dict[str, object] = {"at": None, "ok": None, "detail": "never run"}


def last_run() -> dict[str, object]:
    """Snapshot of the most recent retrain (for the /retrain status endpoint)."""
    return dict(_last_run)


async def _run_trainer(module: str) -> None:
    """Run one training module as a subprocess; raise on non-zero exit.

    Subprocess (not in-process import) so a training crash, native-lib abort,
    or memory blowup can't take the API process down — the old model keeps
    serving. Inherits the environment, so ML_MODEL_DIR / EBAY_* flow through.
    """
    proc = await asyncio.create_subprocess_exec(
        sys.executable, "-m", module,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )
    out, _ = await proc.communicate()
    text = out.decode(errors="replace").strip()
    if proc.returncode != 0:
        raise RuntimeError(
            f"{module} exited {proc.returncode}:\n{text[-2000:]}"
        )
    if text:
        log.info("[%s] %s", module, text.splitlines()[-1])


async def run_retrain(*, trigger: str = "schedule") -> None:
    """Retrain both models, then hot-swap the in-memory singletons.

    Never raises — a failed retrain is logged and recorded; the previously
    loaded model stays live. Skips if a run is already in progress.
    """
    if _lock.locked():
        log.warning("retrain (%s) skipped — a run is already in progress", trigger)
        return

    async with _lock:
        started = datetime.now(timezone.utc)
        log.info("retrain started (%s)", trigger)
        try:
            # Train valuation first (the heavy one). Depreciation is cheap.
            await _run_trainer("training.train_valuation")
            await _run_trainer("training.train_depreciation")

            # Hot-swap: drop the cached singletons, then re-warm from the
            # freshly written artifacts so the first post-retrain request is
            # not slow and any load error surfaces here, not mid-request.
            ValuationModel._instance = None
            DepreciationModel._instance = None
            ValuationModel.load()
            DepreciationModel.load()

            _last_run.update(
                at=started.isoformat(), ok=True, detail="reloaded new models"
            )
            log.info("retrain complete (%s) — new models live", trigger)
        except Exception as exc:  # noqa: BLE001 — must not kill the scheduler
            _last_run.update(at=started.isoformat(), ok=False, detail=str(exc))
            log.exception("retrain failed (%s) — keeping current model", trigger)


def start_scheduler() -> AsyncIOScheduler | None:
    """Start the daily retrain cron, or return None if disabled.

    Returns the scheduler so the caller can shut it down on app exit.
    """
    cron = os.environ.get("ML_RETRAIN_CRON", _DEFAULT_CRON).strip()
    if cron.lower() in _DISABLED:
        log.info("daily retrain disabled (ML_RETRAIN_CRON=%r)", cron)
        return None

    try:
        trigger = CronTrigger.from_crontab(cron)
    except ValueError:
        log.error(
            "invalid ML_RETRAIN_CRON=%r — falling back to %r",
            cron, _DEFAULT_CRON,
        )
        trigger = CronTrigger.from_crontab(_DEFAULT_CRON)

    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(
        run_retrain,
        trigger=trigger,
        id="daily-retrain",
        # If the app was down over a scheduled tick, run once on startup
        # catch-up rather than skipping the day entirely.
        misfire_grace_time=3600,
        coalesce=True,
        max_instances=1,
    )
    scheduler.start()
    log.info("daily retrain scheduled (cron=%r, UTC)", cron)
    return scheduler
