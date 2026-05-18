"""
진단 결과 페이지와 HR 데이터 가시성 지수 시각화.

진단 리포트의 첫 화면에 배치할 시그니처 지표를 Streamlit에서 렌더링한다.
"""
from __future__ import annotations

import json
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
    """이전 라우팅 호환용: 진단 결과 요약 페이지를 렌더링한다."""
    render_result_summary()


def render_result_summary() -> None:
    """진단 결과 요약 페이지를 렌더링한다."""
    responses = st.session_state.get("responses", {})

    if not responses:
        st.warning("진단 응답이 없습니다. Layer 1부터 시작해 주세요.")
        return

    result = calculate_visibility_index(responses)
    areas = _get_cached_areas(responses)
    cross_insights = get_cross_domain_insights(areas, responses)

    st.markdown("## 진단 결과 요약")
    st.markdown(
        "30여 개 문항에 대한 귀사의 응답을 분석했습니다. "
        "5개 영역(보상·평가·채용·인력·리더십)의 현황을 종합하여 "
        "전체 정합성과 개선 우선순위를 보여드립니다."
    )
    st.markdown("---")

    if result.score < 60:
        st.error(
            "데이터 가시성 경고 — 현재 귀사의 HR 데이터 가시성이 "
            f"{result.score:.1f}%로 낮아, 본 진단 결과는 추정치에 기반하고 있습니다. "
            "모든 제도 개선에 앞서 데이터 측정 인프라 구축이 0순위 과제입니다."
        )

    _render_summary_dashboard(result, areas)

    if cross_insights:
        st.markdown("---")
        st.markdown("### 핵심 인사이트")
        for insight in cross_insights:
            st.info(insight)

    st.markdown("---")
    st.markdown("### 어디를 먼저 개선해야 하는가")
    st.markdown(
        "아래 점수는 귀사의 설문 응답을 기반으로 자동 산출된 것이며, "
        "100점 만점입니다. 목표는 동종업계 스타트업 벤치마크 기준입니다."
    )
    _render_gap_table(areas)

    st.markdown("---")
    st.info("각 영역의 현황·이슈·제도 옵션·벤치마크 상세는 다음 페이지(영역별 상세 분석)에서 확인하세요.")


def render_result_detail() -> None:
    """영역별 상세 분석 페이지를 렌더링한다."""
    responses = st.session_state.get("responses", {})

    if not responses:
        st.warning("진단 응답이 없습니다. Layer 1부터 시작해 주세요.")
        return

    areas = _get_cached_areas(responses)

    st.markdown("## 영역별 상세 분석")
    st.markdown(
        "각 영역의 현황을 진단하고, 주요 이슈와 개선 옵션을 제시합니다. "
        "점수 산출 근거도 함께 확인하실 수 있습니다."
    )
    st.markdown("---")

    tab_labels = [f"{_get_grade_label(area.score)} {area.area_name}" for area in areas]
    tabs = st.tabs(tab_labels)
    for tab, area in zip(tabs, areas):
        with tab:
            _render_area_detail(area)


def _get_cached_areas(responses: dict) -> list[AreaAnalysis]:
    """응답이 바뀌지 않았으면 영역 분석 결과를 session_state 캐시에서 재사용한다."""
    responses_hash = json.dumps(responses, sort_keys=True, ensure_ascii=False, default=str)
    if (
        "cached_areas" not in st.session_state
        or st.session_state.get("_responses_hash") != responses_hash
    ):
        st.session_state["cached_areas"] = analyze_all_areas(responses)
        st.session_state["_responses_hash"] = responses_hash
    return st.session_state["cached_areas"]


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


def _render_summary_dashboard(result: VisibilityResult, areas: list[AreaAnalysis]) -> None:
    """정합성 지수와 가시성 지수를 요약 카드와 차트로 표시한다."""
    consistency_score = round(sum(area.score for area in areas) / len(areas)) if areas else 0

    st.markdown("### 핵심 지수")
    col1, col2 = st.columns(2)
    with col1:
        st.metric(
            label="정합성 지수",
            value=f"{consistency_score}점",
            delta=f"5개 영역 평균 · {_get_grade_label(consistency_score)}",
            delta_color="off",
        )
        st.caption("귀사의 인사제도 구성요소들이 서로 얼마나 일관되게 작동하는지를 나타냅니다.")
    with col2:
        st.metric(
            label="HR 데이터 가시성 지수",
            value=f"{result.score:.1f}%",
            delta=f"{_format_number(result.numerator)} / {result.denominator}개 핵심 지표 측정 중",
            delta_color="off",
        )
        st.caption("인력 현황을 데이터로 파악하고 있는 정도를 나타냅니다. 측정하지 않는 것은 관리할 수 없습니다.")

    st.markdown("")
    col1, col2 = st.columns([1, 1.4])
    with col1:
        _render_visibility_gauge(result)
    with col2:
        _render_area_radar(areas)

    _render_visibility_details(result)


def _render_area_radar(areas: list[AreaAnalysis]) -> None:
    """5개 영역 점수를 레이더 차트로 표시한다."""
    if not areas:
        return

    labels = [area.area_name for area in areas]
    scores = [area.score for area in areas]
    benchmarks = [area.benchmark for area in areas]

    fig = go.Figure()
    fig.add_trace(
        go.Scatterpolar(
            r=scores + [scores[0]],
            theta=labels + [labels[0]],
            fill="toself",
            name="현재",
            line=dict(color="#94A3B8"),
            fillcolor="rgba(148, 163, 184, 0.18)",
        )
    )
    fig.add_trace(
        go.Scatterpolar(
            r=benchmarks + [benchmarks[0]],
            theta=labels + [labels[0]],
            fill="toself",
            name="목표",
            line=dict(color="#4F9A86", dash="dot"),
            fillcolor="rgba(79, 154, 134, 0.08)",
        )
    )
    fig.update_layout(
        height=300,
        margin=dict(l=40, r=40, t=30, b=20),
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 100], tickfont=dict(size=10)),
            bgcolor=COLORS["background"],
        ),
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, x=0),
        paper_bgcolor=COLORS["background"],
        font=dict(family=FONT_FAMILY, size=12, color=COLORS["text_primary"]),
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})


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
    grade = _get_grade_label(area.score)
    grade_color = _get_grade_color(area.score)
    st.markdown(
        f'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
        f'<div style="font-size:28px;font-weight:700;color:{grade_color};">'
        f'{area.score}<span style="font-size:14px;color:#94A3B8;">/100</span></div>'
        f'<div>'
        f'<span style="display:inline-block;padding:4px 12px;border-radius:999px;'
        f'font-size:13px;font-weight:600;background:{grade_color}20;color:{grade_color};">'
        f'{grade}</span>'
        f'<span style="font-size:12px;color:#94A3B8;margin-left:8px;">'
        f'목표: {area.benchmark}점 (동종업계 벤치마크)</span>'
        f'</div>'
        f'</div>',
        unsafe_allow_html=True,
    )

    with st.expander("이 점수는 어떻게 산출되었나요?"):
        _render_score_breakdown(area)

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


def _render_score_breakdown(area: AreaAnalysis) -> None:
    """점수 산출 근거를 항목별로 표시한다."""
    if not area.score_breakdown:
        st.caption("산출 근거 데이터가 없습니다.")
        return

    for item in area.score_breakdown:
        if item["factor"] in ("기본 점수", "최종 점수"):
            continue

        impact = item["impact"]
        if impact > 0:
            impact_text = f"+{impact}점"
            impact_color = "#14B8A6"
        elif impact < 0:
            impact_text = f"{impact}점"
            impact_color = "#E11D48"
        else:
            impact_text = "±0점"
            impact_color = "#94A3B8"

        note = f'<span style="font-size:11px;color:#A0AAB5;margin-left:8px;">{item["note"]}</span>' if item.get("note") else ""
        st.markdown(
            f'<div style="display:flex;justify-content:space-between;align-items:center;'
            f'gap:12px;padding:6px 0;border-bottom:1px solid #F1F5F9;">'
            f'<div>'
            f'<span style="font-size:13px;color:#1E293B;">{item["factor"]}</span>'
            f'<span style="font-size:12px;color:#94A3B8;margin-left:8px;">'
            f'({item["value"]})</span>{note}'
            f'</div>'
            f'<span style="font-size:13px;font-weight:600;color:{impact_color};white-space:nowrap;">'
            f'{impact_text}</span>'
            f'</div>',
            unsafe_allow_html=True,
        )

    st.caption(f"기본 점수에서 귀사 응답에 따라 가감하여 최종 {area.score}점이 산출되었습니다.")


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


def _get_grade_label(score: int) -> str:
    """점수를 정성 등급으로 변환한다."""
    if score >= 80:
        return "양호"
    if score >= 60:
        return "보통"
    if score >= 40:
        return "주의"
    return "개선 필요"


def _get_grade_color(score: int) -> str:
    """정성 등급별 색상을 반환한다."""
    if score >= 80:
        return "#14B8A6"
    if score >= 60:
        return "#F59E0B"
    if score >= 40:
        return "#F97316"
    return "#E11D48"


def _format_gap(gap: int) -> str:
    """갭을 부호 있는 문자열로 표시한다."""
    return f"+{gap}" if gap >= 0 else str(gap)


def _format_number(value: float) -> str:
    """정수로 떨어지는 float는 정수처럼 표시한다."""
    return str(int(value)) if value.is_integer() else f"{value:.1f}"
