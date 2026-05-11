"""
Transition Gap 디자인 토큰 + Plotly 커스텀 테마.

모든 차트는 이 모듈의 PLOTLY_TEMPLATE를 사용한다.
컬러 변경은 이 파일 한 곳에서만 수정한다.
"""

from __future__ import annotations

import plotly.graph_objects as go
import plotly.io as pio

COLORS = {
    "background": "#FFFFFF",
    "surface": "#F8F9FB",
    "border": "#E5E8EC",
    "primary": "#A8B5D1",
    "secondary": "#C8B5D1",
    "accent": "#F0C9B0",
    "warning": "#F4D8A0",
    "danger": "#E8B0B5",
    "success": "#B5D1B8",
    "text_primary": "#2C3E50",
    "text_secondary": "#6C7A89",
    "text_muted": "#A0AAB5",
}

CHART_COLORWAY = [
    COLORS["primary"],
    COLORS["accent"],
    COLORS["secondary"],
    COLORS["warning"],
    COLORS["success"],
    COLORS["danger"],
]

FONT_FAMILY = "Noto Sans KR, sans-serif"
FONT_SIZE_BASE = 14

PLOTLY_TEMPLATE = go.layout.Template(
    layout=go.Layout(
        font=dict(
            family=FONT_FAMILY,
            size=FONT_SIZE_BASE,
            color=COLORS["text_primary"],
        ),
        paper_bgcolor=COLORS["background"],
        plot_bgcolor=COLORS["background"],
        colorway=CHART_COLORWAY,
        xaxis=dict(
            showgrid=True,
            gridcolor=COLORS["border"],
            gridwidth=1,
            zeroline=False,
            linecolor=COLORS["border"],
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        yaxis=dict(
            showgrid=True,
            gridcolor=COLORS["border"],
            gridwidth=1,
            zeroline=False,
            linecolor=COLORS["border"],
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        margin=dict(l=60, r=40, t=60, b=60),
        hoverlabel=dict(
            bgcolor=COLORS["surface"],
            bordercolor=COLORS["border"],
            font=dict(family=FONT_FAMILY, size=13, color=COLORS["text_primary"]),
        ),
        title=dict(
            font=dict(size=18, color=COLORS["text_primary"]),
            x=0.02,
            xanchor="left",
        ),
        legend=dict(
            bgcolor=COLORS["background"],
            bordercolor=COLORS["border"],
            borderwidth=1,
            font=dict(color=COLORS["text_secondary"]),
        ),
    )
)

pio.templates["transition_gap"] = PLOTLY_TEMPLATE
pio.templates.default = "transition_gap"
