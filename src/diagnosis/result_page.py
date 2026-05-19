"""
진단 결과 페이지와 HR 데이터 가시성 지수 시각화.

진단 리포트의 첫 화면에 배치할 시그니처 지표를 Streamlit에서 렌더링한다.
"""
from __future__ import annotations

import html
import json
import re
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
PRIORITY_LABELS: Final[dict[int, tuple[str, str]]] = {
    1: ("가장 먼저 개선", "#C8465A"),
    2: ("두 번째로 개선", "#C9844A"),
    3: ("세 번째로 개선", "#4F9A86"),
    4: ("네 번째로 개선", "#4F9A86"),
    5: ("다섯 번째로 개선", "#4F9A86"),
}
SEVERITY_BADGES: Final[dict[str, tuple[str, str]]] = {
    "high": ("즉시 대응", "#C8465A"),
    "medium": ("주의 필요", "#C9844A"),
    "low": ("참고", "#4F9A86"),
}
COLLECTION_TIPS: Final[dict[str, str]] = {
    "자발적 이직률": "HRIS가 없어도 엑셀에 입사일과 퇴사일만 기록하면 산출 가능합니다. 올해 퇴사자 수를 평균 재직자 수로 나눠 추적해 보세요.",
    "핵심 인재 이탈": "핵심 인재 3-5명의 이름을 먼저 정하고, 그중 올해 퇴사한 사람이 있는지만 확인해도 출발점이 됩니다.",
    "신규 입사자 조기 퇴사율": "올해 입사자 명단에서 1년 내 퇴사한 사람 수를 세면 됩니다. 온보딩 품질을 보는 가장 빠른 지표입니다.",
    "채용 소요 기간": "공고 게시일과 입사일의 차이를 최근 3건만 계산해도 평균 채용 리드타임이 나옵니다.",
    "보상 구조 정량 비율": "기본급, 성과급, 지분보상의 대략적 비율만 적어도 됩니다. 정밀한 숫자보다 구조 파악이 먼저입니다.",
    "매출 대비 인건비 비중": "월 급여 총액에 12를 곱한 뒤 연매출로 나누면 됩니다. 대략적 수치로도 충분합니다.",
    "인건비 증가율": "작년 월평균 인건비와 올해 월평균 인건비를 비교해 증가율을 계산해 보세요.",
    "시장 대비 보상 위치": "최근 채용 제안 과정에서 후보자가 받은 타사 오퍼 또는 리크루터 피드백을 기준으로 상·중·하를 먼저 잡아도 됩니다.",
    "평가 운영 데이터": "평가 등급별 인원 분포와 연봉 인상률 차등 폭을 엑셀 한 장으로 남기는 것부터 시작하면 됩니다.",
    "1on1 운영 데이터": "팀장별 1on1 실시 여부와 월별 완료 횟수만 체크해도 리더십 운영 리듬을 볼 수 있습니다.",
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
    alias = st.session_state.get("session_alias") or "미지정"

    st.markdown(f"### {alias} 진단 결과 요약")
    st.markdown(
        "30여 개 문항에 대한 귀사의 응답을 분석했습니다. "
        "5개 영역(보상·평가·채용·인력·리더십)의 현황을 종합하여 "
        "전체 정합성과 개선 우선순위를 보여드립니다."
    )
    _render_summary_actions()
    st.markdown("---")

    if result.score < 60:
        st.error(
            "⚠️ **데이터 가시성 경고** — 현재 귀사의 HR 데이터 가시성이 "
            f"{result.score:.1f}%로 낮아, 본 진단 결과는 추정치에 기반하고 있습니다. "
            "모든 제도 개선에 앞서 **데이터 측정 인프라 구축이 '0순위' 과제**입니다. "
            "'모름' 응답이 많을수록 진단의 정확도가 떨어집니다."
        )

    _render_visibility_section(result)
    _render_alignment_score(areas)
    _render_radar_chart(areas)
    _render_key_insights(areas, responses)

    st.markdown("---")
    st.markdown("### 어디를 먼저 개선해야 하는가")
    st.markdown(
        "아래 점수는 귀사의 설문 응답을 기반으로 자동 산출된 것이며, "
        "100점 만점입니다. 목표는 현재 방향으로 가기 위해 필요한 최소 제도 기준점입니다."
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

    st.markdown("### 영역별 상세 분석")
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
    responses_hash = hash(json.dumps(responses, sort_keys=True, ensure_ascii=False, default=str))
    if (
        "cached_areas" not in st.session_state
        or st.session_state.get("_responses_hash") != responses_hash
    ):
        st.session_state["cached_areas"] = analyze_all_areas(responses)
        st.session_state["_responses_hash"] = responses_hash
    return st.session_state["cached_areas"]


def _render_visibility_section(result: VisibilityResult) -> None:
    """HR 데이터 가시성과 사각지대 액션 플랜을 먼저 렌더링한다."""
    st.markdown("### HR 데이터 가시성")
    st.markdown(
        "먼저 무엇을 보고 있고, 무엇을 아직 못 보고 있는지 확인합니다. "
        "빠진 데이터는 결함이 아니라 다음 액션을 정하는 단서입니다."
    )

    col1, col2 = st.columns([1, 1.2])
    with col1:
        _render_visibility_bar(result)
    with col2:
        _render_visibility_details(result)


def _render_alignment_score(areas: list[AreaAnalysis]) -> None:
    """인사제도 정합성 지수와 점수 맥락을 렌더링한다."""
    consistency_score = round(sum(area.score for area in areas) / len(areas)) if areas else 0
    weakest_area = min(areas, key=lambda area: area.score) if areas else None

    st.markdown("---")
    st.markdown("### 인사제도 정합성 지수")
    col1, col2 = st.columns([1, 2])
    with col1:
        st.metric(
            label="정합성 지수",
            value=f"{consistency_score}점",
            delta=f"5개 영역 평균 · {_get_grade_label(consistency_score)}",
            delta_color="off",
        )
    with col2:
        if weakest_area:
            st.markdown(
                f'<div style="padding:14px 16px;border-radius:10px;background:#F8FAFC;'
                f'border-left:4px solid #14B8A6;">'
                f'<p style="font-size:13px;color:#475569;line-height:1.7;margin:0;">'
                f'이 점수는 보상, 평가, 채용, 인력 안정성, 리더십 제도가 서로 같은 방향으로 '
                f'맞물려 있는지를 보여줍니다. 현재 가장 큰 병목은 '
                f'<strong>{html.escape(weakest_area.area_name)}</strong> 영역입니다.</p>'
                f'</div>',
                unsafe_allow_html=True,
            )


def _render_radar_chart(areas: list[AreaAnalysis]) -> None:
    """영역별 현재 위치를 레이더 차트로 렌더링한다."""
    st.markdown("---")
    st.markdown("### 영역별 현재 위치")
    _render_area_radar(areas)


def _render_key_insights(areas: list[AreaAnalysis], responses: dict) -> None:
    """핵심 인사이트를 1줄 핵심과 상세 설명으로 나눠 렌더링한다."""
    cross_insights = get_cross_domain_insights(areas, responses)
    if not cross_insights:
        return

    st.markdown("---")
    st.markdown("### 핵심 인사이트")

    for insight in cross_insights:
        sentences = _format_display_text(insight).split(". ")
        headline = sentences[0]
        if not headline.endswith("."):
            headline = f"{headline}."
        detail = ". ".join(sentences[1:]) if len(sentences) > 1 else ""

        st.markdown(
            f'<div style="padding:16px;border-radius:10px;background:#FFF7ED;'
            f'border-left:4px solid #F97316;margin-bottom:12px;">'
            f'<p style="font-size:15px;font-weight:700;color:#0F172A;margin:0 0 6px;">'
            f'{html.escape(headline)}</p>'
            f'<p style="font-size:13px;color:#64748B;line-height:1.6;margin:0;">'
            f'{html.escape(detail)}</p>'
            f'</div>',
            unsafe_allow_html=True,
        )


def _render_summary_actions() -> None:
    """진단 요약 상단의 시각 액션 버튼을 렌더링한다."""
    # TODO: PDF 리포트 생성 모듈 연결 후 실제 다운로드 버튼으로 전환한다.
    st.markdown(
        """
        <div style="display:flex;justify-content:flex-end;margin-top:8px;">
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;
            border-radius:8px;border:1px solid #E5E8EC;background:#FFFFFF;
            color:#2C3E50;font-size:12px;font-weight:600;">
            ↓ PDF 저장
          </span>
        </div>
        """,
        unsafe_allow_html=True,
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

    _render_blind_spots(result.blind_spot_labels)


def _render_blind_spots(blind_spot_items: list[str]) -> None:
    """사각지대 항목과 데이터 수집 방법을 렌더링한다."""
    if not blind_spot_items:
        st.markdown("**모든 핵심 지표가 측정되고 있습니다.**")
        return

    st.markdown("**사각지대 - 측정되지 않는 영역**")
    st.markdown(
        '<p style="font-size:13px;color:#64748B;margin-bottom:8px;line-height:1.6;">'
        '초기 스타트업이 완벽한 대시보드를 가질 수는 없습니다. '
        '하지만 아래 항목들은 엑셀이나 수기로라도 추적을 시작해야 '
        '제도를 설계할 수 있습니다.</p>',
        unsafe_allow_html=True,
    )

    for item in blind_spot_items:
        tip = COLLECTION_TIPS.get(item, "담당자에게 문의하여 수기로라도 기록을 시작하세요.")
        st.markdown(
            f'<div style="padding:10px 14px;border-radius:8px;background:#FFF7ED;'
            f'border-left:3px solid #F97316;margin-bottom:6px;">'
            f'<p style="font-size:13px;font-weight:700;color:#1E293B;margin:0 0 4px;">'
            f'{html.escape(item)}</p>'
            f'<p style="font-size:12px;color:#64748B;line-height:1.5;margin:0;">'
            f'{html.escape(tip)}</p>'
            f'</div>',
            unsafe_allow_html=True,
        )


def _get_visibility_color(visibility: float) -> tuple[str, str, str]:
    """가시성 수준별 색상과 라벨을 반환한다."""
    if visibility >= 80:
        return "#0D9488", "#F0FDFA", "높음"
    if visibility >= 60:
        return "#14B8A6", "#F0FDFA", "보통"
    if visibility >= 40:
        return "#F59E0B", "#FFFBEB", "주의"
    return "#E11D48", "#FFF1F2", "위험"


def _render_visibility_bar(result: VisibilityResult) -> None:
    """HR 데이터 가시성 4단계 색상 바를 렌더링한다."""
    score = max(0.0, min(100.0, result.score))
    color, bg_color, label = _get_visibility_color(score)
    st.markdown(
        f"""
        <div style="padding:16px;border-radius:10px;background:{bg_color};
          border:1px solid {color}33;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:13px;font-weight:600;color:#1E293B;">HR 데이터 가시성</span>
            <span style="display:inline-block;padding:2px 10px;border-radius:999px;
              font-size:11px;font-weight:700;background:{color}22;color:{color};">{label}</span>
          </div>
          <div style="height:8px;border-radius:999px;background:#E2E8F0;overflow:hidden;">
            <div style="width:{score}%;height:100%;border-radius:999px;background:{color};"></div>
          </div>
          <p style="font-size:24px;font-weight:700;color:{color};margin:8px 0 0;">
            {score:.1f}%
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;
            font-size:11px;color:#94A3B8;">
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;
              background:#0D9488;margin-right:4px;"></span>80%↑ 높음</span>
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;
              background:#14B8A6;margin-right:4px;"></span>60–79% 보통</span>
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;
              background:#F59E0B;margin-right:4px;"></span>40–59% 주의</span>
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;
              background:#E11D48;margin-right:4px;"></span>40%↓ 위험</span>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


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
        _render_visibility_bar(result)
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
        st.markdown("### 핵심 인사이트")
        for insight in cross_insights:
            st.info(_format_display_text(insight))
        st.markdown("---")

    st.markdown("### 어디를 먼저 개선해야 하는가")
    st.caption("5개 영역의 현재 수준과 목표 수준의 차이를 비교합니다.")
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
    """영역별 목표 대비 차이를 Plotly 수평 바 차트로 렌더링한다."""
    y_positions = list(range(len(areas)))
    area_names = [area.area_name for area in areas]
    current_scores = [area.score for area in areas]
    improvement_values = [max(area.gap, 0) for area in areas]

    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            y=y_positions,
            x=current_scores,
            orientation="h",
            name="현재",
            marker_color="#94A3B8",
            text=[f"{score}점" for score in current_scores],
            textposition="inside",
            textfont=dict(color="white", size=12),
            customdata=area_names,
            hovertemplate="%{customdata}<br>현재 %{x}점<extra></extra>",
        )
    )
    fig.add_trace(
        go.Bar(
            y=y_positions,
            x=improvement_values,
            orientation="h",
            name="개선 필요량",
            marker_color="#F87171",
            text=[_format_gap(area.gap) for area in areas],
            textposition="inside",
            textfont=dict(color="white", size=12),
            customdata=area_names,
            hovertemplate="%{customdata}<br>개선 필요량 %{text}<extra></extra>",
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
                priority_label, priority_color = PRIORITY_LABELS.get(
                    area.priority,
                    ("후속 개선", "#4F9A86"),
                )
                st.markdown(
                    f'<span style="display:inline-block;padding:2px 8px;border-radius:999px;'
                    f'font-size:11px;background:{priority_color};color:white;margin-right:4px;">'
                    f'{priority_label}</span>',
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
        f'목표: {area.benchmark}점 (Archetype 기준점)</span>'
        f'</div>'
        f'</div>',
        unsafe_allow_html=True,
    )

    with st.expander("이 점수는 어떻게 산출되었나요?"):
        _render_score_breakdown(area)

    st.markdown("**1. 현황 진단**")
    st.markdown(_format_status_html(area.status_text), unsafe_allow_html=True)
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
    st.success(_format_display_text(area.recommendation))


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

        item_value = html.escape(_format_display_text(item["value"]))
        note = (
            f'<span style="font-size:11px;color:#A0AAB5;margin-left:8px;">'
            f'{html.escape(_format_display_text(item["note"]))}</span>'
            if item.get("note")
            else ""
        )
        st.markdown(
            f'<div style="display:flex;justify-content:space-between;align-items:center;'
            f'gap:12px;padding:6px 0;border-bottom:1px solid #F1F5F9;">'
            f'<div>'
            f'<span style="font-size:13px;color:#1E293B;">{html.escape(_format_display_text(item["factor"]))}</span>'
            f'<span style="font-size:12px;color:#94A3B8;margin-left:8px;">'
            f'({item_value})</span>{note}'
            f'</div>'
            f'<span style="font-size:13px;font-weight:600;color:{impact_color};white-space:nowrap;">'
            f'{impact_text}</span>'
            f'</div>',
            unsafe_allow_html=True,
        )

    base_score = next(
        (item["impact"] for item in area.score_breakdown if item["factor"] == "기본 점수"),
        50,
    )
    st.caption(f"기본 {base_score}점에서 귀사 응답에 따라 가감하여 최종 {area.score}점이 산출되었습니다.")


def _format_display_text(text: str) -> str:
    """사용자 노출 텍스트의 표기만 정리한다."""
    return (
        str(text)
        .replace("~", "–")
        .replace("As-Is", "현재 상태")
        .replace("To-Be", "목표")
        .replace("갭", "차이")
    )


def _format_status_html(status_text: str) -> str:
    """현황 진단 문구에 키워드 강조를 적용한 HTML을 반환한다."""
    danger_keywords = (
        "위험",
        "심각",
        "하위",
        "부재",
        "없음",
        "비정기",
        "회피함",
        "어려워함",
        "운영 안 함",
        "불신",
        "낮아",
        "높은",
        "즉시 대응",
        "사각지대",
        "4개월 초과",
        "20% 이상",
        "30% 이상",
        "문서로만 존재함",
        "모름",
    )
    positive_keywords = (
        "양호",
        "상위",
        "관리 가능한",
        "정기 운영",
        "강한 연동",
        "완전 연동",
        "능숙하게 전달함",
        "10% 미만",
        "존재",
        "일관",
        "안정",
    )

    formatted = html.escape(_format_display_text(status_text))
    for keyword in danger_keywords:
        formatted = formatted.replace(
            keyword,
            f'<strong style="color:#C8465A;">{keyword}</strong>',
        )
    for keyword in positive_keywords:
        formatted = formatted.replace(
            keyword,
            f'<strong style="color:#14B8A6;">{keyword}</strong>',
        )
    formatted = re.sub(
        r"(\d+(?:\.\d+)?점(?:/\d+점)?|\d+(?:\.\d+)?%)",
        r'<strong style="font-weight:700;">\1</strong>',
        formatted,
    )
    return f'<p style="line-height:1.75;margin-top:0;">{formatted}</p>'


def _render_tags(tags: list[str]) -> None:
    """현황 태그를 pill 형태로 렌더링한다."""
    if not tags:
        return

    tag_html = " ".join(
        f'<span style="display:inline-block;padding:3px 10px;border-radius:999px;'
        f'font-size:12px;background:#F1F5F9;color:#475569;margin:2px 4px 2px 0;">'
        f'{html.escape(_format_display_text(tag))}</span>'
        for tag in tags
    )
    st.markdown(tag_html, unsafe_allow_html=True)


def _render_issue_card(title: str, description: str, severity: str) -> None:
    """주요 이슈 카드를 렌더링한다."""
    badge_label, color = SEVERITY_BADGES.get(
        severity,
        ("참고", COLORS["text_secondary"]),
    )
    safe_title = html.escape(_format_display_text(title))
    safe_description = html.escape(_format_display_text(description))
    st.markdown(
        f'<div style="padding:12px;border-radius:8px;background:#F8F9FB;'
        f'border:1px solid #E5E8EC;margin-bottom:8px;">'
        f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
        f'<span style="display:inline-block;padding:2px 8px;border-radius:999px;'
        f'font-size:11px;font-weight:700;background:{color};color:white;">'
        f'{badge_label}</span>'
        f'<p style="font-size:14px;font-weight:600;color:#2C3E50;margin:0;">'
        f'{safe_title}</p>'
        f'</div>'
        f'<p style="font-size:13px;color:#6C7A89;line-height:1.6;margin:0;">'
        f'{safe_description}</p>'
        f'</div>',
        unsafe_allow_html=True,
    )


def _render_option_table(area: AreaAnalysis) -> None:
    """제도 옵션 비교 테이블을 렌더링한다."""
    options = OPTIONS_MAP.get(area.area_id, [])
    if not options:
        return

    st.markdown("**3. 제도 옵션 비교**")

    include_cycle = any("cycle" in option for option in options)
    rows = []
    for option in options:
        name = option["name"]
        if option.get("recommended"):
            name = f"추천: {name}"
        row = {
            "옵션": _format_display_text(name),
            "특징": _format_display_text(option["feature"]),
            "적합 조건": _format_display_text(option["fit"]),
            "장점": _format_display_text(option["pro"]),
            "단점": _format_display_text(option["con"]),
        }
        if include_cycle:
            row = {
                "옵션": _format_display_text(name),
                "주기": _format_display_text(option.get("cycle", "—")),
                **{key: value for key, value in row.items() if key != "옵션"},
            }
        rows.append(row)

    headers = list(rows[0].keys()) if rows else []
    header_html = "".join(
        f'<th style="text-align:left;padding:8px;border-bottom:2px solid #E2E8F0;'
        f'font-size:11px;color:#64748B;">{html.escape(header)}</th>'
        for header in headers
    )
    rows_html = ""
    for row in rows:
        cells = "".join(
            f'<td style="vertical-align:top;padding:8px;border-bottom:1px solid #F1F5F9;'
            f'font-size:12px;color:#334155;line-height:1.5;">'
            f'{html.escape(str(row[header]))}</td>'
            for header in headers
        )
        rows_html += f"<tr>{cells}</tr>"

    st.markdown(
        f"""
        <table style="width:100%;border-collapse:collapse;margin:8px 0 4px 0;">
          <thead><tr>{header_html}</tr></thead>
          <tbody>{rows_html}</tbody>
        </table>
        """,
        unsafe_allow_html=True,
    )
    st.caption("추천 표시는 현재 응답 조건에서 우선 검토할 수 있는 옵션입니다.")


def _render_benchmark(area: AreaAnalysis) -> None:
    """벤치마크 데이터를 렌더링한다."""
    benchmark = BENCHMARKS.get(area.area_id)
    if not benchmark:
        return

    st.markdown("**4. Archetype 기준점**")
    st.caption(benchmark["title"])
    if benchmark.get("intro"):
        st.markdown(
            f'<p style="font-size:13px;color:#64748B;line-height:1.6;margin-bottom:12px;">'
            f'{html.escape(_format_display_text(benchmark["intro"]))}</p>',
            unsafe_allow_html=True,
        )

    rows_html = []
    for item in benchmark["items"]:
        rows_html.append(
            "<tr>"
            f"<td>{html.escape(_format_display_text(item['label']))}</td>"
            f"<td><strong>{html.escape(_format_display_text(item['value']))}</strong>"
            f"<br><span>{html.escape(_format_display_text(item['note']))}</span></td>"
            f"<td>{html.escape(_format_display_text(item.get('archetype', '공통')))}</td>"
            "</tr>"
        )

    st.markdown(
        f"""
        <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px;">
          <thead>
            <tr style="background:#F8F9FB;color:#2C3E50;">
              <th style="text-align:left;padding:8px;border:1px solid #E5E8EC;">항목</th>
              <th style="text-align:left;padding:8px;border:1px solid #E5E8EC;">기준점</th>
              <th style="text-align:left;padding:8px;border:1px solid #E5E8EC;">성격</th>
            </tr>
          </thead>
          <tbody>
            {"".join(rows_html)}
          </tbody>
        </table>
        """,
        unsafe_allow_html=True,
    )
    if benchmark.get("archetype_companies"):
        st.caption(f"참고 기업: {_format_display_text(benchmark['archetype_companies'])}")
    if benchmark.get("disclaimer"):
        st.markdown(f"*{_format_display_text(benchmark['disclaimer'])}*")


def _severity_label(gap: int) -> str:
    """목표 대비 차이 크기별 상태 라벨."""
    if gap >= 20:
        return "[위험]"
    if gap >= 10:
        return "[주의]"
    return "[양호]"


def _get_grade_label(score: int) -> str:
    """점수를 정성 등급으로 변환한다."""
    if score >= 80:
        return "🟢 양호"
    if score >= 60:
        return "🟡 보통"
    if score >= 40:
        return "🟠 주의"
    return "🔴 개선 필요"


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
    """목표 대비 차이를 부호 있는 문자열로 표시한다."""
    return f"+{gap}" if gap >= 0 else str(gap)


def _format_number(value: float) -> str:
    """정수로 떨어지는 float는 정수처럼 표시한다."""
    return str(int(value)) if value.is_integer() else f"{value:.1f}"
