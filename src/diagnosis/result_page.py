"""
진단 결과 페이지와 HR 데이터 가시성 지수 시각화.

진단 리포트의 첫 화면에 배치할 시그니처 지표를 Streamlit에서 렌더링한다.
"""
from __future__ import annotations

from typing import Final

import plotly.graph_objects as go
import streamlit as st

from src.diagnosis.visibility_index import VisibilityResult, calculate_visibility_index
from src.theme import COLORS, FONT_FAMILY

TIER_COLORS: Final[dict[str, str]] = {
    "low": COLORS["danger"],
    "medium_low": COLORS["warning"],
    "medium": COLORS["accent"],
    "high": COLORS["success"],
}


def render_diagnosis_result() -> None:
    """진단 결과 페이지를 렌더링한다."""
    responses = st.session_state.get("responses", {})

    if not responses:
        st.warning("진단 응답이 없습니다. Layer 1부터 시작해 주세요.")
        return

    result = calculate_visibility_index(responses)

    st.markdown("## 진단 결과")
    st.caption("입력하신 데이터를 바탕으로 1차 진단 결과를 보여드립니다.")
    st.markdown("---")

    st.markdown("### HR 데이터 가시성")
    col1, col2 = st.columns([1, 2])

    with col1:
        _render_visibility_gauge(result)

    with col2:
        _render_visibility_details(result)

    st.markdown("---")
    st.markdown(
        """
        > **제도 정렬의 첫 단계는 사각지대를 데이터로 비추는 것입니다.**
        >
        > 제도를 더하는 것보다 먼저, 지금 무엇을 보고 있고 무엇을 보지 못하는지
        > 확인해야 실행 가능한 로드맵을 만들 수 있습니다.
        """
    )

    st.info(
        "**입력이 완료되었습니다.**\n\n"
        "입력하신 데이터를 바탕으로 다음 단계에서 전환 갭의 우선순위와 "
        "시뮬레이션 가능 범위를 검토합니다."
    )


def build_visibility_gauge(result: VisibilityResult) -> go.Figure:
    """가시성 지수 게이지 Figure를 생성한다."""
    color = TIER_COLORS.get(result.tier, COLORS["primary"])

    fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=result.score,
            number={
                "suffix": "%",
                "font": {"size": 48, "color": COLORS["text_primary"]},
            },
            title={
                "text": "Visibility Index",
                "font": {"size": 16, "color": COLORS["text_secondary"]},
            },
            gauge={
                "axis": {
                    "range": [0, 100],
                    "tickwidth": 1,
                    "tickcolor": COLORS["text_secondary"],
                },
                "bar": {"color": color, "thickness": 0.7},
                "bgcolor": COLORS["surface"],
                "borderwidth": 0,
                "steps": [
                    {"range": [0, 40], "color": "#FAEAEC"},
                    {"range": [40, 60], "color": "#FAF1E0"},
                    {"range": [60, 70], "color": "#FAE8D9"},
                    {"range": [70, 100], "color": "#E5F0E6"},
                ],
            },
        )
    )
    fig.update_layout(
        height=300,
        margin=dict(l=20, r=20, t=40, b=20),
        paper_bgcolor=COLORS["background"],
        font=dict(family=FONT_FAMILY, color=COLORS["text_primary"]),
    )
    return fig


def _render_visibility_gauge(result: VisibilityResult) -> None:
    """가시성 지수 게이지를 렌더링한다."""
    st.plotly_chart(
        build_visibility_gauge(result),
        width="stretch",
        config={"displayModeBar": False},
    )


def _render_visibility_details(result: VisibilityResult) -> None:
    """가시성 지수 상세 정보를 렌더링한다."""
    st.metric(
        label="HR 데이터 가시성",
        value=f"{result.score:.1f}%",
        delta=f"{_format_number(result.numerator)} / {result.denominator}개 핵심 지표 측정 중",
        delta_color="off",
    )
    st.markdown(
        f"**측정 중**: {_format_number(result.numerator)} / {result.denominator}개 핵심 지표"
    )

    if result.tier in ("low", "medium_low"):
        st.warning(result.tier_message)
    elif result.tier == "medium":
        st.info(result.tier_message)
    else:
        st.success(result.tier_message)

    if result.blind_spot_labels:
        st.markdown("**사각지대 (미측정 영역)**")
        for label in result.blind_spot_labels:
            st.markdown(f"- {label}")
    else:
        st.markdown("**모든 핵심 지표가 측정되고 있습니다.**")


def _format_number(value: float) -> str:
    """정수로 떨어지는 float는 정수처럼 표시한다."""
    return str(int(value)) if value.is_integer() else f"{value:.1f}"
