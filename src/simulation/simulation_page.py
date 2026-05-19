"""
시뮬레이션 페이지 - Stage 1 트레이드오프 매트릭스.

진단 응답을 바탕으로 조직의 현재 위치를
두 개의 2x2 매트릭스에서 시각화한다.
"""
from __future__ import annotations

import streamlit as st

from src.data.scenarios import SCENARIOS, SCENARIO_IDS
from src.diagnosis.roadmap_renderer import render_roadmap
from src.diagnosis.scenario_renderer import render_scenario_detail
from src.diagnosis.visibility_index import calculate_visibility_index
from src.simulation.matrix import render_matrix_a, render_matrix_b
from src.simulation.trade_off import MatrixCoordinates, calc_to_be_coordinates, calculate_coordinates


def render_simulation_page() -> None:
    """시뮬레이션 Stage 1 페이지를 렌더링한다."""
    responses = st.session_state.get("responses", {})

    if not responses:
        st.warning("진단 응답이 없습니다. Layer 1부터 시작해 주세요.")
        return

    st.markdown("### 트레이드오프 시뮬레이션")
    st.markdown(
        '<div style="border-left:4px solid #14B8A6;padding:12px 16px;background:#F0FDFA;'
        'border-radius:0 8px 8px 0;margin-bottom:16px;">'
        '<p style="font-size:15px;font-weight:600;color:#0F172A;margin:0 0 4px 0;">'
        '"완벽한 인사제도는 없습니다"</p>'
        '<p style="font-size:13px;color:#475569;margin:0;line-height:1.6;">'
        '보상을 높이면 인건비가 올라가고, 평가를 정교하게 하면 운영 비용이 증가합니다. '
        '성과 차등을 강화하면 동기 부여는 올라가지만 조직의 심리적 안전감은 떨어집니다. '
        '인사제도의 모든 선택에는 반대급부가 있으며, 핵심은 '
        '<strong>우리 조직에 맞는 균형점</strong>을 찾는 것입니다.'
        '</p>'
        '</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        "아래 매트릭스는 귀사의 현재 위치(●)와 "
        "대표님이 선택한 철학 기반 목표 방향(◆) 간의 트레이드오프를 보여줍니다."
    )

    st.markdown("---")

    coords = calculate_coordinates(responses)
    to_be = calc_to_be_coordinates(responses)
    visibility = calculate_visibility_index(responses)

    if visibility.score < 60:
        st.warning(
            "⚠️ HR 데이터 가시성이 낮아 아래 시뮬레이션 결과의 정확도가 제한적입니다. "
            "시나리오별 수치는 참고용으로 활용하시고, 데이터 인프라 구축 후 재진단을 권고합니다."
        )

    _render_warnings(coords.pain_point_dispersion, visibility.score)
    selected_scenario = st.session_state.get("selected_scenario", "performance")
    _render_matrix_a(coords, visibility.score, selected_scenario, to_be["matrix_a"], responses)
    _render_matrix_b(coords, visibility.score, selected_scenario, to_be["matrix_b"], responses)
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
    to_be_target: dict[str, float],
    responses: dict,
) -> None:
    """매트릭스 A를 표시한다."""
    st.markdown("### 매트릭스 A: 누구를 위한 조직인가")
    st.caption("보상 구조와 동기부여 방식이 조직의 성격을 결정합니다.")

    fig_a = render_matrix_a(
        coords,
        visibility_score,
        selected_scenario,
        to_be_target={**to_be_target, "label": "대표 철학 기반 목표"},
    )
    st.plotly_chart(fig_a, use_container_width=True, config={"displayModeBar": False})
    _render_matrix_legend()

    st.markdown(f"**현재 사분면**: {coords.matrix_a_quadrant}")
    _render_philosophy_gap_narrative(responses)
    st.markdown("---")


def _render_matrix_b(
    coords: MatrixCoordinates,
    visibility_score: float,
    selected_scenario: str,
    to_be_target: dict[str, float],
    responses: dict,
) -> None:
    """매트릭스 B를 표시한다."""
    st.markdown("### 매트릭스 B: 어떻게 일하는 조직인가")
    st.caption("의사결정 방식과 채용 기준이 일하는 방식을 결정합니다.")

    fig_b = render_matrix_b(
        coords,
        visibility_score,
        selected_scenario,
        to_be_target={**to_be_target, "label": "대표 철학 기반 목표"},
    )
    st.plotly_chart(fig_b, use_container_width=True, config={"displayModeBar": False})
    _render_matrix_legend()

    st.markdown(f"**현재 사분면**: {coords.matrix_b_quadrant}")
    _render_talent_philosophy_caption(responses)
    st.markdown("---")


def _render_summary(matrix_a_quadrant: str, matrix_b_quadrant: str) -> None:
    """종합 위치 안내를 표시한다."""
    st.info(
        f"**귀사의 종합 위치**\n\n"
        f"- 매트릭스 A: **{matrix_a_quadrant}**\n"
        f"- 매트릭스 B: **{matrix_b_quadrant}**\n\n"
        "다음 단계에서는 이 현재 위치를 기준으로 선택 가능한 시나리오와 전환 비용을 비교합니다."
    )


def _render_matrix_legend() -> None:
    """현재 상태와 목표 점의 의미를 설명한다."""
    st.markdown(
        '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;'
        'margin:8px 0;font-size:12px;color:#64748B;">'
        '<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;'
        'background:#94A3B8;margin-right:4px;"></span>현재 상태 — 귀사의 설문 응답 기반</span>'
        '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;'
        'background:#14B8A6;margin-right:4px;transform:rotate(45deg);"></span>'
        '목표 — 대표님 철학 기반 방향</span>'
        '</div>',
        unsafe_allow_html=True,
    )


def _render_philosophy_gap_narrative(responses: dict) -> None:
    """매트릭스 A 아래에 철학과 현재 제도 간 차이를 설명한다."""
    q1_text = (
        "소수 퍼포머 파격 보상"
        if responses.get("L0-1") == "A"
        else "조직 전체 균등 분배"
    )
    q2_text = (
        "성과 추적과 솔직한 피드백"
        if responses.get("L0-2") == "A"
        else "구성원 고충 청취와 심리적 안전감"
    )

    st.markdown(
        f'<div style="padding:16px;border-radius:10px;background:#F8FAFC;'
        f'border-left:4px solid #14B8A6;margin:12px 0;">'
        f'<p style="font-size:14px;font-weight:700;color:#0F172A;margin:0 0 8px;">'
        f'대표님의 철학과 현실의 차이</p>'
        f'<p style="font-size:13px;color:#475569;line-height:1.7;margin:0;">'
        f'대표님은 보상에서 <strong>"{q1_text}"</strong>을, '
        f'리더십에서 <strong>"{q2_text}"</strong>을 우선하겠다고 선택하셨습니다(◆ 목표). '
        f'그러나 현재 귀사의 실제 제도를 분석해 보니 ● 현재 위치는 다른 지점에 있습니다. '
        f'대표님의 머릿속 철학과 현장의 제도가 아직 같은 방향으로 정렬되지 않은 상태입니다.</p>'
        f'</div>',
        unsafe_allow_html=True,
    )


def _render_talent_philosophy_caption(responses: dict) -> None:
    """매트릭스 B 아래에 인재 전략 철학을 짧게 설명한다."""
    q3_text = (
        "외부에서 검증된 S급 인재 수혈"
        if responses.get("L0-3") == "A"
        else "내부 주니어의 장기 육성"
    )
    st.caption(
        f"매트릭스 B의 목표 X축은 대표님이 선택한 인재 전략, "
        f"즉 '{q3_text}' 방향을 반영합니다. Y축은 v0.2에서 별도 철학 문항을 추가하기 전까지 중앙값으로 둡니다."
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
        format_func=lambda scenario_id: SCENARIOS[scenario_id]["name"],
        horizontal=True,
        key="selected_scenario",
        label_visibility="collapsed",
    )

    render_roadmap(selected, responses)
