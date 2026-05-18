"""
진단 결과 페이지와 HR 데이터 가시성 지수 시각화.

진단 리포트의 첫 화면에 배치할 시그니처 지표를 Streamlit에서 렌더링한다.
"""
from __future__ import annotations

from typing import Final

import plotly.graph_objects as go
import streamlit as st

from src.data.hr_options import BENCHMARKS, OPTIONS_MAP
from src.diagnosis.analysis_engine import AreaAnalysis, analyze_all_areas, get_cross_domain_insights
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

    _render_area_analysis(responses)


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


def _render_area_analysis(responses: dict) -> None:
    """5개 영역 상세 분석을 렌더링한다."""
    areas = analyze_all_areas(responses)
    cross_insights = get_cross_domain_insights(areas, responses)

    st.markdown("---")

    if cross_insights:
        st.markdown("### Expert Insight")
        for insight in cross_insights:
            st.info(insight)
        st.markdown("---")

    st.markdown("### 어디를 먼저 개선해야 하는가")
    st.caption("5개 영역의 현재 수준과 목표 수준의 갭을 비교합니다.")
    _render_gap_table(areas)

    st.markdown("---")
    st.markdown("### 영역별 상세 분석")

    for area in areas:
        severity_label = _severity_label(area.gap)
        with st.expander(
            f"{severity_label} {area.area_name} — {area.score}점 ({_format_gap(area.gap)})",
            expanded=area.priority in (1, 2),
        ):
            _render_area_detail(area)


def _render_gap_table(areas: list[AreaAnalysis]) -> None:
    """영역별 갭 비교를 Plotly 수평 바 차트로 렌더링한다."""
    y_positions = list(range(len(areas)))
    area_names = [area.area_name for area in areas]
    as_is_scores = [area.score for area in areas]
    gap_values = [max(area.gap, 0) for area in areas]

    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            y=y_positions,
            x=as_is_scores,
            orientation="h",
            name="현재 (As-Is)",
            marker_color="#94A3B8",
            text=[f"{score}점" for score in as_is_scores],
            textposition="inside",
            textfont=dict(color="white", size=12),
            customdata=area_names,
            hovertemplate="%{customdata}<br>현재 %{x}점<extra></extra>",
        )
    )
    fig.add_trace(
        go.Bar(
            y=y_positions,
            x=gap_values,
            orientation="h",
            name="갭 (Gap)",
            marker_color="#F87171",
            text=[_format_gap(area.gap) for area in areas],
            textposition="inside",
            textfont=dict(color="white", size=12),
            customdata=area_names,
            hovertemplate="%{customdata}<br>개선 갭 %{text}<extra></extra>",
        )
    )

    for position, area in zip(y_positions, areas):
        fig.add_trace(
            go.Scatter(
                x=[area.benchmark, area.benchmark],
                y=[position - 0.32, position + 0.32],
                mode="lines",
                line=dict(color="#4F9A86", width=2, dash="dot"),
                showlegend=False,
                hoverinfo="skip",
            )
        )
        fig.add_annotation(
            x=area.benchmark,
            y=position,
            text=f"목표 {area.benchmark}",
            showarrow=False,
            xanchor="left",
            xshift=6,
            font=dict(size=10, color="#4F9A86"),
        )

    fig.update_layout(
        barmode="stack",
        height=300,
        margin=dict(l=10, r=70, t=10, b=20),
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, x=0),
        xaxis=dict(range=[0, 100], title="점수", showgrid=True, gridcolor="#F1F5F9"),
        yaxis=dict(
            tickmode="array",
            tickvals=y_positions,
            ticktext=area_names,
            autorange="reversed",
        ),
        plot_bgcolor=COLORS["background"],
        paper_bgcolor=COLORS["background"],
        font=dict(family=FONT_FAMILY, size=12, color=COLORS["text_primary"]),
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    cols = st.columns(len(areas))
    for col, area in zip(cols, areas):
        with col:
            st.markdown(f"**{area.area_name}**")
            if area.priority > 0:
                priority_color = "#C8465A" if area.priority <= 2 else "#C9844A"
                st.markdown(
                    f'<span style="display:inline-block;padding:2px 8px;border-radius:999px;'
                    f'font-size:11px;background:{priority_color};color:white;margin-right:4px;">'
                    f'P{area.priority}</span>',
                    unsafe_allow_html=True,
                )
            difficulty_color = {
                "높음": "#C8465A",
                "중간": "#C9844A",
                "낮음": "#4F9A86",
            }.get(area.difficulty, COLORS["text_secondary"])
            st.markdown(
                f'<span style="display:inline-block;padding:2px 8px;border-radius:999px;'
                f'font-size:11px;background:#F8F9FB;color:{difficulty_color};'
                f'border:1px solid {difficulty_color};">난이도: {area.difficulty}</span>',
                unsafe_allow_html=True,
            )


def _render_area_detail(area: AreaAnalysis) -> None:
    """한 영역의 5단 상세 분석을 렌더링한다."""
    st.markdown("**1. 현황 진단**")
    st.markdown(area.status_text)
    _render_tags(area.tags)

    st.markdown("")
    st.markdown("**2. 주요 이슈**")
    if area.issues:
        for issue in area.issues:
            _render_issue_card(issue.title, issue.description, issue.severity)
    else:
        st.caption("현재 응답 기준으로 즉시 대응이 필요한 주요 이슈는 감지되지 않았습니다.")

    _render_option_table(area)
    _render_benchmark(area)

    st.markdown("")
    st.markdown("**5. 추천 방향**")
    st.success(area.recommendation)


def _render_tags(tags: list[str]) -> None:
    """현황 태그를 pill 형태로 렌더링한다."""
    if not tags:
        return

    tag_html = " ".join(
        f'<span style="display:inline-block;padding:3px 10px;border-radius:999px;'
        f'font-size:12px;background:#F1F5F9;color:#475569;margin:2px 4px 2px 0;">'
        f'{tag}</span>'
        for tag in tags
    )
    st.markdown(tag_html, unsafe_allow_html=True)


def _render_issue_card(title: str, description: str, severity: str) -> None:
    """주요 이슈 카드를 렌더링한다."""
    color = {
        "high": "#C8465A",
        "medium": "#C9844A",
        "low": "#4F9A86",
    }.get(severity, COLORS["text_secondary"])
    st.markdown(
        f'<div style="padding:12px;border-radius:8px;background:#F8F9FB;'
        f'border:1px solid #E5E8EC;margin-bottom:8px;">'
        f'<p style="font-size:14px;font-weight:600;color:#2C3E50;margin:0 0 4px 0;">'
        f'<span style="color:{color};">●</span> {title}</p>'
        f'<p style="font-size:13px;color:#6C7A89;line-height:1.6;margin:0;">'
        f'{description}</p>'
        f'</div>',
        unsafe_allow_html=True,
    )


def _render_option_table(area: AreaAnalysis) -> None:
    """제도 옵션 비교 테이블을 렌더링한다."""
    options = OPTIONS_MAP.get(area.area_id, [])
    if not options:
        return

    st.markdown("**3. 제도 옵션 비교**")
    import pandas as pd

    include_cycle = any("cycle" in option for option in options)
    rows = []
    for option in options:
        name = option["name"]
        if option.get("recommended"):
            name = f"추천: {name}"
        row = {
            "옵션": name,
            "특징": option["feature"],
            "적합 조건": option["fit"],
            "장점": option["pro"],
            "단점": option["con"],
        }
        if include_cycle:
            row = {
                "옵션": name,
                "주기": option.get("cycle", "—"),
                **{key: value for key, value in row.items() if key != "옵션"},
            }
        rows.append(row)

    st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    st.caption("추천 표시는 현재 응답 조건에서 우선 검토할 수 있는 옵션입니다.")


def _render_benchmark(area: AreaAnalysis) -> None:
    """벤치마크 데이터를 렌더링한다."""
    benchmark = BENCHMARKS.get(area.area_id)
    if not benchmark:
        return

    st.markdown("**4. 벤치마크**")
    st.caption(benchmark["title"])
    for item in benchmark["items"]:
        col1, col2 = st.columns([1, 1.4])
        with col1:
            st.markdown(f"**{item['label']}**")
        with col2:
            st.markdown(item["value"])
            st.caption(item["note"])
    if benchmark.get("disclaimer"):
        st.markdown(f"*{benchmark['disclaimer']}*")


def _severity_label(gap: int) -> str:
    """갭 크기별 상태 라벨."""
    if gap >= 20:
        return "[위험]"
    if gap >= 10:
        return "[주의]"
    return "[양호]"


def _format_gap(gap: int) -> str:
    """갭을 부호 있는 문자열로 표시한다."""
    return f"+{gap}" if gap >= 0 else str(gap)


def _format_number(value: float) -> str:
    """정수로 떨어지는 float는 정수처럼 표시한다."""
    return str(int(value)) if value.is_integer() else f"{value:.1f}"
