from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("ML_SERVICE_TOKEN", "internal-test-secret")
    # No lifespan: these auth tests must not load models or start retraining.
    return TestClient(main.app)


@pytest.mark.parametrize("path,method", [
    ("/admin/retrain", "GET"), ("/admin/retrain", "POST"),
    ("/data/track", "POST"), ("/predict/valuation", "POST"),
    ("/predict/depreciation", "POST"), ("/docs", "GET"), ("/openapi.json", "GET"),
])
@pytest.mark.parametrize("authorization", [None, "Bearer wrong-token", "Basic internal-test-secret"])
def test_public_requests_denied(client, path, method, authorization, monkeypatch):
    retrain = Mock()
    write = Mock()
    monkeypatch.setattr(main, "run_retrain", retrain)
    monkeypatch.setattr(main, "_save_seen_queries", write)
    headers = {} if authorization is None else {"Authorization": authorization}
    response = client.request(method, path, headers=headers, json={})
    assert response.status_code == 401
    retrain.assert_not_called()
    write.assert_not_called()


def test_missing_configuration_fails_closed(client, monkeypatch):
    monkeypatch.delenv("ML_SERVICE_TOKEN")
    assert client.get("/admin/retrain").status_code == 503
    assert client.get("/health").status_code == 200


def test_authorized_retraining(client, monkeypatch):
    retrain = Mock()
    monkeypatch.setattr(main, "run_retrain", retrain)
    response = client.post("/admin/retrain", headers={"Authorization": "Bearer internal-test-secret"})
    assert response.status_code == 202
    retrain.assert_called_once_with(trigger="manual")


def test_authorized_tracking(client, monkeypatch):
    write = Mock()
    monkeypatch.setattr(main, "_load_seen_queries", lambda: [])
    monkeypatch.setattr(main, "_save_seen_queries", write)
    response = client.post("/data/track", headers={"Authorization": "Bearer internal-test-secret"}, json={"model_name": "Pilot Laptop", "asset_type": "laptop"})
    assert response.status_code == 202
    write.assert_called_once()


def test_health_needs_no_token(client):
    assert client.get("/health").status_code == 200
