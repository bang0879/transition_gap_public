"""To-Be coordinate tests that do not require FastAPI TestClient."""
from __future__ import annotations

from app.core.trade_off import calc_to_be_coordinates
from app.schemas.responses import DiagnoseRequest


def test_frontend_philosophy_text_maps_to_non_center_to_be_coordinates():
    request = DiagnoseRequest(
        responses={
            "L0-1": "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다",
            "L0-2": "명확한 목표 대비 성과 추적과 저성과 영역에 대한 솔직한 피드백",
            "L0-3": "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다",
        }
    )

    result = calc_to_be_coordinates(request.responses)

    assert result["matrix_a"] == {"x": 0.85, "y": 0.85}
    assert result["matrix_b"] == {"x": 0.80, "y": 0.80}
