"""Access-code verification and API protection tests."""
from __future__ import annotations


def test_access_verify_rejects_invalid_code(client):
    response = client.post("/api/access/verify", json={"code": "wrong-code"})

    assert response.status_code == 401


def test_access_verify_returns_bearer_token_for_valid_code(client):
    response = client.post("/api/access/verify", json={"code": "P@ssword12"})

    assert response.status_code == 200
    data = response.json()
    assert data["token"]
    assert data["token_type"] == "bearer"
    assert data["expires_at"]


def test_protected_content_rejects_missing_token(client):
    response = client.get("/api/schema")

    assert response.status_code == 401


def test_protected_content_accepts_verified_token(client):
    verify_response = client.post("/api/access/verify", json={"code": "P@ssword12"})
    token = verify_response.json()["token"]

    response = client.get("/api/schema", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert "layers" in response.json()
