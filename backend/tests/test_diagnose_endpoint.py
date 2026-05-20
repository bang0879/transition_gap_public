"""POST /api/diagnose endpoint tests."""
from __future__ import annotations


def test_diagnose_returns_200(client, full_responses):
    response = client.post("/api/diagnose", json={"responses": full_responses})

    assert response.status_code == 200
    data = response.json()

    assert len(data["areas"]) == 5
    for area in data["areas"]:
        assert "area_id" in area
        assert "score" in area
        assert "benchmark" in area
        assert "gap" in area
        assert "score_breakdown" in area
        for item in area["score_breakdown"]:
            assert "implication" in item
            assert item["implication"].startswith(("[리스크", "[강점]", "[참고]", "[결론]"))

    assert "visibility" in data
    assert data["visibility"]["score"] >= 0
    assert data["visibility"]["tier"] in ("low", "medium_low", "medium", "high")

    assert "matrix" in data
    for key in ("a_x_as_is", "a_y_as_is", "a_x_to_be", "a_y_to_be", "b_x_as_is", "b_y_as_is"):
        assert 0.0 <= data["matrix"][key] <= 1.0
    assert "a_quadrant_as_is" in data["matrix"]
    assert "a_quadrant_to_be" in data["matrix"]

    assert "insights" in data
    for insight in data["insights"]:
        assert "headline" in insight
        assert "detail" in insight
        assert "source" in insight


def test_diagnose_empty_responses(client):
    response = client.post("/api/diagnose", json={"responses": {}})

    assert response.status_code == 200
    data = response.json()
    assert len(data["areas"]) == 5


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
