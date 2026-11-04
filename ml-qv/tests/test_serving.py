import hashlib
import importlib.util
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
import main

def test_serving_blocks_training_and_tracking(monkeypatch):
    monkeypatch.setenv('ML_SERVING_ONLY','true')
    monkeypatch.setenv('ML_RETRAIN_CRON','off')
    monkeypatch.setenv('ML_SERVICE_TOKEN','test-service-token')
    with TestClient(main.app) as client:
        for path in ['/admin/retrain','/data/track']:
            assert client.post(path,headers={'Authorization':'Bearer test-service-token'},json={}).status_code == 405

def test_artifact_integrity_fails_before_model_loading(tmp_path,monkeypatch):
    for name in ['valuation.joblib','depreciation.joblib']:
        (tmp_path/name).write_bytes(b'invalid')
    (tmp_path/'manifest.json').write_text(json.dumps({'sha256':{}}))
    monkeypatch.setenv('ML_MODEL_DIR',str(tmp_path))
    spec=importlib.util.spec_from_file_location('failed_serving',Path(__file__).parents[1]/'serving.py')
    with pytest.raises(RuntimeError,match='integrity'):
        spec.loader.exec_module(importlib.util.module_from_spec(spec))
