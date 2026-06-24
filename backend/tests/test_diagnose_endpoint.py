"""POST /api/diagnose endpoint tests."""
from __future__ import annotations


def test_diagnose_returns_200(client, full_responses, auth_headers):
    response = client.post("/api/diagnose", json={"responses": full_responses}, headers=auth_headers)

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

    assert data["diagnosis_mode"] in ("foundation", "alignment", "hybrid")
    assert isinstance(data["foundation_signals"], list)
    assert isinstance(data["alignment_signals"], list)
    for signal in [*data["foundation_signals"], *data["alignment_signals"]]:
        assert {"id", "domain_id", "domain_name", "title", "detail", "severity"} <= set(signal)


def test_diagnose_empty_responses(client, auth_headers):
    response = client.post("/api/diagnose", json={"responses": {}}, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data["areas"]) == 5


def test_diagnose_response_uses_ceo_facing_issue_titles(client, auth_headers):
    response = client.post(
        "/api/diagnose",
        headers=auth_headers,
        json={
            "responses": {
                "2-5-1": "대부분 객관적으로 잘 수행함",
                "2-5-2": "운영 안 함",
                "2-5-4": "리더/담당자 1차 승인 후 CEO 확인",
                "2-5-5": "리더 권한 내 결정",
                "2-5-6": "명확한 기준으로 작동함",
            }
        },
    )

    assert response.status_code == 200
    leadership = next(area for area in response.json()["areas"] if area["area_id"] == "leadership")
    issue_titles = [issue["title"] for issue in leadership["issues"]]

    assert "1on1 정기 운영 미정착" in issue_titles
    assert "1on1 부재/형식화" not in issue_titles

def test_diagnose_normalizes_frontend_philosophy_text_to_to_be_coordinates(client, full_responses, auth_headers):
    full_responses["L0-1"] = "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다"
    full_responses["L0-2"] = "명확한 목표 대비 성과 추적과 저성과 영역에 대한 솔직한 피드백"
    full_responses["L0-3"] = "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다"

    response = client.post("/api/diagnose", json={"responses": full_responses}, headers=auth_headers)

    assert response.status_code == 200
    matrix = response.json()["matrix"]
    assert matrix["a_x_to_be"] == 0.85
    assert matrix["a_y_to_be"] == 0.85
    assert matrix["b_x_to_be"] == 0.8
    assert matrix["b_y_to_be"] == 0.8
    assert matrix["b_quadrant_to_be"] == "Q4: 대기업 공채 시스템형"


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
