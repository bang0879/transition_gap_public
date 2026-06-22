from app.core.trade_off import MatrixCoordinates


def matrix_a_label_for(x: float, y: float) -> str:
    return MatrixCoordinates(
        matrix_a_x=x,
        matrix_a_y=y,
        matrix_b_x=0.5,
        matrix_b_y=0.5,
        pain_point_dispersion=0.0,
    ).matrix_a_quadrant


def test_matrix_a_quadrants_match_visual_layout() -> None:
    assert matrix_a_label_for(0.75, 0.75) == "Q1: 단기 성과 집중형"
    assert matrix_a_label_for(0.25, 0.75) == "Q2: 장기 비전형 공동체"
    assert matrix_a_label_for(0.25, 0.25) == "Q3: 평균 기준형"
    assert matrix_a_label_for(0.75, 0.25) == "Q4: 소수정예 중심형"