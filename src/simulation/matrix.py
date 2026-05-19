"""
매트릭스 A·B Plotly 시각화.

현재 상태를 흐린 원으로 표시하고, 가시성 지수와 페인포인트 분산도를
마커 크기·투명도·색상에 반영한다.
"""
from __future__ import annotations

from typing import Any

import plotly.graph_objects as go

from src.simulation.trade_off import MatrixCoordinates
from src.theme import COLORS

MATRIX_A_QUADRANTS = {
    "Q1": {"x": 0.75, "y": 0.75, "label": "Q1<br>단기 성과형<br>용병조직"},
    "Q2": {"x": 0.25, "y": 0.25, "label": "Q2<br>장기 비전형<br>공동체 조직"},
    "Q3": {"x": 0.75, "y": 0.25, "label": "Q3<br>평균의 함정형"},
    "Q4": {"x": 0.25, "y": 0.75, "label": "Q4<br>소수정예 중심형"},
}

MATRIX_B_QUADRANTS = {
    "Q1": {"x": 0.25, "y": 0.25, "label": "Q1<br>개인플레이어<br>중심형"},
    "Q2": {"x": 0.25, "y": 0.75, "label": "Q2<br>가족형 자율 조직"},
    "Q3": {"x": 0.75, "y": 0.25, "label": "Q3<br>에이전시형<br>분업/기능 조직"},
    "Q4": {"x": 0.75, "y": 0.75, "label": "Q4<br>대기업 공채<br>시스템형"},
}

MATRIX_A_TO_BE_TARGETS = {
    "performance": {"x": 0.78, "y": 0.78, "label": "성과주의 가속형"},
    "community": {"x": 0.28, "y": 0.28, "label": "공동체 안정형"},
    "elite": {"x": 0.28, "y": 0.78, "label": "소수정예 집중형"},
}

MATRIX_B_TO_BE_TARGETS = {
    "performance": {"x": 0.62, "y": 0.45, "label": "성과주의 가속형"},
    "community": {"x": 0.28, "y": 0.78, "label": "공동체 안정형"},
    "elite": {"x": 0.38, "y": 0.32, "label": "소수정예 집중형"},
}

QUADRANT_BACKGROUNDS = (
    {"x0": 0.5, "x1": 1.0, "y0": 0.5, "y1": 1.0, "color": "rgba(20, 184, 166, 0.06)"},
    {"x0": 0.0, "x1": 0.5, "y0": 0.5, "y1": 1.0, "color": "rgba(249, 115, 22, 0.06)"},
    {"x0": 0.5, "x1": 1.0, "y0": 0.0, "y1": 0.5, "color": "rgba(249, 115, 22, 0.06)"},
    {"x0": 0.0, "x1": 0.5, "y0": 0.0, "y1": 0.5, "color": "rgba(239, 68, 68, 0.05)"},
)


def render_matrix_a(
    coords: MatrixCoordinates,
    visibility_score: float,
    selected_scenario_id: str = "performance",
    to_be_target: dict[str, Any] | None = None,
) -> go.Figure:
    """매트릭스 A를 시각화한다."""
    fig = _create_base_matrix(
        x_axis_left="지분 / 비전 중심",
        x_axis_right="현금 / 인센티브 중심",
        y_axis_bottom="팀 시너지 중심",
        y_axis_top="개인 압도적 성과 중심",
        quadrants=MATRIX_A_QUADRANTS,
        title="매트릭스 A: 보상과 동기부여 (Motivation Mix)",
    )
    _add_as_is_marker(
        fig,
        x=coords.matrix_a_x,
        y=coords.matrix_a_y,
        visibility_score=visibility_score,
        dispersion=coords.pain_point_dispersion,
    )
    _add_to_be_vector(
        fig,
        as_is_x=coords.matrix_a_x,
        as_is_y=coords.matrix_a_y,
        target=to_be_target or _target_for_scenario(selected_scenario_id, MATRIX_A_TO_BE_TARGETS),
    )
    return fig


def render_matrix_b(
    coords: MatrixCoordinates,
    visibility_score: float,
    selected_scenario_id: str = "performance",
    to_be_target: dict[str, Any] | None = None,
) -> go.Figure:
    """매트릭스 B를 시각화한다."""
    fig = _create_base_matrix(
        x_axis_left="자율과 속도",
        x_axis_right="통제와 절차",
        y_axis_bottom="즉시 전력 (스킬)",
        y_axis_top="조직 적합성 (컬처핏)",
        quadrants=MATRIX_B_QUADRANTS,
        title="매트릭스 B: 조직 운영과 채용 (Operating System)",
    )
    _add_as_is_marker(
        fig,
        x=coords.matrix_b_x,
        y=coords.matrix_b_y,
        visibility_score=visibility_score,
        dispersion=0.0,
    )
    _add_to_be_vector(
        fig,
        as_is_x=coords.matrix_b_x,
        as_is_y=coords.matrix_b_y,
        target=to_be_target or _target_for_scenario(selected_scenario_id, MATRIX_B_TO_BE_TARGETS),
    )
    return fig


def _create_base_matrix(
    x_axis_left: str,
    x_axis_right: str,
    y_axis_bottom: str,
    y_axis_top: str,
    quadrants: dict[str, dict[str, Any]],
    title: str,
) -> go.Figure:
    """2x2 매트릭스 기본 골격을 생성한다."""
    fig = go.Figure()

    _add_quadrant_backgrounds(fig)

    for quadrant in quadrants.values():
        fig.add_annotation(
            x=quadrant["x"],
            y=quadrant["y"],
            text=quadrant["label"],
            showarrow=False,
            font=dict(size=12, color=COLORS["text_secondary"]),
            align="center",
            opacity=0.78,
        )

    fig.add_shape(
        type="line",
        x0=0.5,
        x1=0.5,
        y0=0,
        y1=1,
        line=dict(color=COLORS["border"], width=2, dash="dot"),
        layer="above",
    )
    fig.add_shape(
        type="line",
        x0=0,
        x1=1,
        y0=0.5,
        y1=0.5,
        line=dict(color=COLORS["border"], width=2, dash="dot"),
        layer="above",
    )
    _add_axis_arrows(fig)

    fig.update_layout(
        title=dict(text=title, font=dict(size=16)),
        xaxis=dict(
            range=[-0.05, 1.05],
            showgrid=False,
            showticklabels=False,
            zeroline=False,
            title=dict(
                text=f"<b>{x_axis_left}</b>  ←    |    →  <b>{x_axis_right}</b>",
                font=dict(size=14, color=COLORS["text_primary"]),
            ),
        ),
        yaxis=dict(
            range=[-0.05, 1.05],
            showgrid=False,
            showticklabels=False,
            zeroline=False,
            title=dict(
                text=f"<b>{y_axis_bottom}</b>  ↓    |    ↑  <b>{y_axis_top}</b>",
                font=dict(size=14, color=COLORS["text_primary"]),
            ),
            scaleanchor="x",
            scaleratio=1,
        ),
        height=500,
        showlegend=False,
        plot_bgcolor=COLORS["surface"],
        paper_bgcolor=COLORS["background"],
        margin=dict(l=70, r=40, t=70, b=70),
    )

    return fig


def _add_quadrant_backgrounds(fig: go.Figure) -> None:
    """사분면별 배경색을 추가한다."""
    for background in QUADRANT_BACKGROUNDS:
        fig.add_shape(
            type="rect",
            x0=background["x0"],
            x1=background["x1"],
            y0=background["y0"],
            y1=background["y1"],
            fillcolor=background["color"],
            line_width=0,
            layer="below",
        )


def _add_axis_arrows(fig: go.Figure) -> None:
    """축 끝점 방향성을 표시한다."""
    fig.add_annotation(
        x=1.03,
        y=-0.035,
        text="→",
        xref="x",
        yref="y",
        showarrow=False,
        font=dict(size=18, color="#94A3B8"),
        xanchor="center",
        yanchor="middle",
    )
    fig.add_annotation(
        x=-0.035,
        y=1.03,
        text="↑",
        xref="x",
        yref="y",
        showarrow=False,
        font=dict(size=18, color="#94A3B8"),
        xanchor="center",
        yanchor="middle",
    )


def _add_as_is_marker(
    fig: go.Figure,
    x: float,
    y: float,
    visibility_score: float,
    dispersion: float,
) -> None:
    """현재 위치를 흐린 원으로 추가한다."""
    marker_size = max(40.0, 80.0 - (visibility_score * 0.6))
    marker_opacity = 0.3 + (_clamp(visibility_score, 0.0, 100.0) / 100.0) * 0.5
    marker_color = COLORS["accent"] if dispersion >= 0.3 else COLORS["primary"]

    fig.add_trace(
        go.Scatter(
            x=[_clamp(x)],
            y=[_clamp(y)],
            mode="markers",
            marker=dict(
                size=marker_size,
                color=marker_color,
                opacity=marker_opacity,
                line=dict(width=2, color=COLORS["text_primary"]),
            ),
            hovertemplate=(
                "<b>현재 위치</b><br>"
                f"X: {_clamp(x):.2f}<br>"
                f"Y: {_clamp(y):.2f}<br>"
                f"가시성 지수: {visibility_score:.1f}%<br>"
                "<extra></extra>"
            ),
            name="현재 위치",
        )
    )


def _add_to_be_vector(
    fig: go.Figure,
    as_is_x: float,
    as_is_y: float,
    target: dict[str, Any],
) -> None:
    """현재 위치에서 선택 시나리오의 목표 기준점으로 향하는 벡터를 추가한다."""
    target_x = _clamp(float(target["x"]))
    target_y = _clamp(float(target["y"]))
    current_x = _clamp(as_is_x)
    current_y = _clamp(as_is_y)

    fig.add_annotation(
        x=target_x,
        y=target_y,
        ax=current_x,
        ay=current_y,
        xref="x",
        yref="y",
        axref="x",
        ayref="y",
        showarrow=True,
        arrowhead=3,
        arrowsize=1.4,
        arrowwidth=2,
        arrowcolor="#14B8A6",
        text="",
    )
    fig.add_trace(
        go.Scatter(
            x=[target_x],
            y=[target_y],
            mode="markers+text",
            marker=dict(
                size=16,
                color="#14B8A6",
                symbol="diamond",
                line=dict(width=2, color=COLORS["background"]),
            ),
            text=["목표"],
            textposition="top center",
            textfont=dict(size=11, color="#14B8A6"),
            hovertemplate=(
                f"<b>목표 기준점</b><br>{target['label']}<br>"
                f"X: {target_x:.2f}<br>"
                f"Y: {target_y:.2f}<br>"
                "<extra></extra>"
            ),
            name="목표 기준점",
        )
    )


def _target_for_scenario(
    selected_scenario_id: str,
    targets: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    """선택 시나리오에 맞는 목표 기준점을 반환한다."""
    return targets.get(selected_scenario_id, targets["performance"])


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """값을 [lo, hi] 범위로 제한한다."""
    return max(lo, min(hi, value))
