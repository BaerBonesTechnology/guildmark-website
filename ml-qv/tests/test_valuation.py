"""Smoke tests for the valuation model — run without a trained artifact."""
from __future__ import annotations

import os
from unittest.mock import patch

from models.valuation import ValuationFeatures, ValuationModel


def test_rule_based_fallback_returns_positive_value(tmp_path):
    # Force ML_MODEL_DIR to an empty dir so .load() picks the fallback.
    with patch.dict(os.environ, {"ML_MODEL_DIR": str(tmp_path)}):
        ValuationModel._instance = None
        model = ValuationModel.load()
        fmv, confidence = model.predict(ValuationFeatures(
            asset_type="laptop",
            condition_grade="B",
            age_months=24,
            cpu_score=180.0,
            ram_gb=16,
            storage_gb=512,
            original_price=1800.0,
        ))
        assert fmv > 0
        assert 0 <= confidence <= 1


def test_condition_a_more_valuable_than_c(tmp_path):
    with patch.dict(os.environ, {"ML_MODEL_DIR": str(tmp_path)}):
        ValuationModel._instance = None
        model = ValuationModel.load()
        common = dict(
            asset_type="laptop",
            age_months=18,
            cpu_score=150.0,
            ram_gb=16,
            storage_gb=512,
            original_price=1500.0,
        )
        fmv_a, _ = model.predict(ValuationFeatures(condition_grade="A", **common))
        fmv_c, _ = model.predict(ValuationFeatures(condition_grade="C", **common))
        assert fmv_a > fmv_c
