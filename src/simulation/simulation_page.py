"""
시뮬레이션 페이지 - Stage 1 트레이드오프 매트릭스.

진단 응답을 바탕으로 조직의 현재 위치(As-Is)를
두 개의 2x2 매트릭스에서 시각화한다.
"""
from __future__ import annotations

import streamlit as st

from src.data.scenarios import SCENARIOS, SCENARIO_IDS
from src.diagnosis.roadmap_renderer import render_roadmap
from src.diagnosis.scenario_renderer import render_scenario_detail
from src.diagnosis.visibility_index import calculate_visibility_index
from src.simulation.matrix import render_matrix_a, render_matrix_b
from src.simulation.trade_off import MatrixCoordinates, calculate_coordinates


def render_simulation_page() -> None:
    """시뮬레이션 Stage 1 페이지를 렌더링한다."""
    responses = st.session_state.get("responses", {})

    if not responses:
        st.warning("진단 응답이 없습니다. Layer 1부터 시작해 주세요.")
        return

    st.markdown("## 트레이드오프 시뮬레이션")
    st.markdown(
        "인사제도의 모든 선택에는 반대급부가 있습니다. "
        "보상을 높이면 인건비가 올라가고, 평가를 정교하게 하면 운영 비용이 증가합니다. "
        "아래 매트릭스는 귀사의 현재 위치와 개선 방향 간의 트레이드오프를 보여줍니다."
    )

    st.info(
        "**풍선 효과(Balloon Effect)**: 한쪽 가치를 강하게 누르면 다른 쪽의 비용이 부풀어 오를 수 있습니다. "
        "예를 들어 성과급 중심 보상은 단기 성과를 자극하지만 협업 비용과 공정성 민감도를 높일 수 있습니다. "
        "이 단계에서는 정답을 고르는 것이 아니라, 현재 조직이 어떤 긴장 위에 서 있는지 확인합니다."
    )

    st.markdown("---")

    coords = calculate_coordinates(responses)
    visibility = calculate_visibility_index(responses)

    if visibility.score < 60:
        st.warning(
            "HR 데이터 가시성이 낮아 아래 시뮬레이션 결과의 정확도가 제한적입니다. "
            "시나리오별 수치는 참고용으로 활용하시고, 데이터 인프라 구축 후 재진단을 권고합니다."
        )

    _render_warnings(coords.pain_point_dispersion, visibility.score)
    selected_scenario = st.session_state.get("selected_scenario", "performance")
    _render_matrix_a(coords, visibility.score, selected_scenario)
    _render_matrix_b(coords, visibility.score, selected_scenario)
    _render_summary(coords.matrix_a_quadrant, coords.matrix_b_quadrant)
    render_scenario_detail(responses)
    _render_scenario_selection(responses)


def _render_warnings(pain_point_dispersion: float, visibility_score: float) -> None:
    """가시성 및 페인포인트 분산 경고를 표시한다."""
    if visibility_score < 40:
        st.warning(
            "데이터 가시성이 낮아 현재 위치의 신뢰도가 제한적입니다. "
            "사각지대를 먼저 채우면 이후 시뮬레이션의 해석력이 높아집니다."
        )

    if pain_point_dispersion >= 0.3:
        st.warning(
            f"페인포인트 분산도가 높습니다({pain_point_dispersion:.2f}). "
            "현재 위치가 매트릭스 중앙에 가까워 보여도 실제로는 서로 다른 문제가 동시에 당겨지는 상태일 수 있습니다."
        )


def _render_matrix_a(
    coords: MatrixCoordinates,
    visibility_score: float,
    selected_scenario: str,
) -> None:
    """매트릭스 A를 표시한다."""
    st.markdown("### 매트릭스 A: 누구를 위한 조직인가")
    st.caption("보상 구조와 동기부여 방식이 조직의 성격을 결정합니다.")

    fig_a = render_matrix_a(coords, visibility_score, selected_scenario)
    st.plotly_chart(fig_a, use_container_width=True, config={"displayModeBar": False})

    st.markdown(f"**현재 사분면**: {coords.matrix_a_quadrant}")
    st.markdown("---")


def _render_matrix_b(
    coords: MatrixCoordinates,
    visibility_score: float,
    selected_scenario: str,
) -> None:
    """매트릭스 B를 표시한다."""
    st.markdown("### 매트릭스 B: 어떻게 일하는 조직인가")
    st.caption("의사결정 방식과 채용 기준이 일하는 방식을 결정합니다.")

    fig_b = render_matrix_b(coords, visibility_score, selected_scenario)
    st.plotly_chart(fig_b, use_container_width=True, config={"displayModeBar": False})

    st.markdown(f"**현재 사분면**: {coords.matrix_b_quadrant}")
    st.markdown("---")


def _render_summary(matrix_a_quadrant: str, matrix_b_quadrant: str) -> None:
    """종합 위치 안내를 표시한다."""
    st.info(
        f"**귀사의 종합 위치**\n\n"
        f"- 매트릭스 A: **{matrix_a_quadrant}**\n"
        f"- 매트릭스 B: **{matrix_b_quadrant}**\n\n"
        "다음 단계에서는 이 현재 위치를 기준으로 선택 가능한 시나리오와 전환 비용을 비교합니다."
    )


def _render_scenario_selection(responses: dict) -> None:
    """실행 로드맵 기준이 될 시나리오를 선택한다."""
    st.markdown("---")
    st.markdown("### 실행 시나리오 선택")
    st.markdown(
        "위 3가지 시나리오를 비교하신 후, 귀사에 가장 적합한 방향을 선택해주세요. "
        "선택에 따라 실행 로드맵이 자동으로 생성됩니다."
    )

    if st.session_state.get("selected_scenario") not in SCENARIO_IDS:
        st.session_state["selected_scenario"] = "performance"

    selected = st.radio(
        "실행할 시나리오를 선택하세요.",
        options=SCENARIO_IDS,
        format_func=lambda scenario_id: (
            f"{SCENARIOS[scenario_id]['icon']} {SCENARIOS[scenario_id]['name']}"
        ),
        horizontal=True,
        key="selected_scenario",
        label_visibility="collapsed",
    )

    render_roadmap(selected, responses)
