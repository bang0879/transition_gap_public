"""Stage guidance API contract tests."""
from __future__ import annotations


def test_diagnose_area_includes_stage_guidance(client, full_responses):
    full_responses.update(
        {
            "L1-2": "20~50인",
            "2-4-1a": "운영하지 않음",
            "2-4-3-ceo": 0,
            "2-4-3-employee": 0,
        }
    )

    response = client.post("/api/diagnose", json={"responses": full_responses})

    assert response.status_code == 200
    evaluation = next(area for area in response.json()["areas"] if area["area_id"] == "evaluation")
    guidance = evaluation["stage_guidance"]

    assert guidance["current_choice"]
    assert "합리적 선택" in guidance["current_choice"]
    assert "50인" in guidance["valid_until"]
    assert isinstance(guidance["defer_now"], list)
    assert isinstance(guidance["do_now"], list)
    assert isinstance(guidance["self_serve_actions"], list)
    assert isinstance(guidance["needs_help_later"], list)
