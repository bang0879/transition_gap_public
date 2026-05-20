"""POST /api/events endpoint tests."""
from __future__ import annotations


def test_event_logging_success(client):
    payload = {
        "session_id": "test-session-001",
        "event_type": "page_view",
        "page": "/result/summary",
        "metadata": {"duration_ms": 12000},
        "timestamp": "2026-05-20T14:00:00Z",
    }

    response = client.post("/api/events", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] > 0
    assert data["status"] == "ok"


def test_event_logging_minimal(client):
    payload = {
        "session_id": "test-session-002",
        "event_type": "session_start",
        "timestamp": "2026-05-20T14:00:00Z",
    }

    response = client.post("/api/events", json=payload)

    assert response.status_code == 200


def test_event_logging_all_types(client):
    event_types = [
        "session_start",
        "page_view",
        "page_exit",
        "form_submit",
        "tab_click",
        "result_view",
        "cta_click",
    ]

    for event_type in event_types:
        payload = {
            "session_id": "test-session-003",
            "event_type": event_type,
            "page": "/test",
            "timestamp": "2026-05-20T14:00:00Z",
        }
        response = client.post("/api/events", json=payload)
        assert response.status_code == 200
