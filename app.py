"""
Transition Gap — 인사제도 진단/설계 도구
Streamlit 진입점
"""
from __future__ import annotations

import streamlit as st

from src.diagnosis.form_layer0 import get_layer0_missing, render_layer0
from src.diagnosis.form_layer1 import get_layer1_missing, render_layer1_form
from src.diagnosis.form_layer2 import (
    get_layer2_a_missing,
    get_layer2_b_missing,
    get_layer2_c_missing,
    render_layer2_a_form,
    render_layer2_b_form,
    render_layer2_c_form,
)
from src.diagnosis.variables import ALL_VARIABLES, get_question_number
from src.diagnosis.result_page import render_result_detail, render_result_summary
from src.database import init_db, load_latest_session_snapshot, save_session
from src.intro_page import render_intro_page
from src.simulation.simulation_page import render_simulation_page

STEP_ORDER = [
    "intro",
    "layer0",
    "layer1",
    "layer2_a",
    "layer2_b",
    "layer2_c",
    "result_summary",
    "result_detail",
    "simulation",
]
INPUT_STEPS = {"intro", "layer0", "layer1", "layer2_a", "layer2_b", "layer2_c"}
RESULT_STEPS = {"result_summary", "result_detail", "simulation"}
LEGACY_STEP_MAP = {
    "layer2": "layer2_a",
    "result": "result_summary",
}

if "current_step" not in st.session_state:
    st.session_state.current_step = "intro"
if "responses" not in st.session_state:
    st.session_state.responses = {}
if "session_id" not in st.session_state:
    st.session_state.session_id = None
if "session_alias" not in st.session_state:
    st.session_state.session_alias = ""
if "selected_scenario" not in st.session_state:
    st.session_state.selected_scenario = "performance"
if "_needs_scroll" not in st.session_state:
    st.session_state["_needs_scroll"] = False
if st.session_state.current_step in LEGACY_STEP_MAP:
    st.session_state.current_step = LEGACY_STEP_MAP[st.session_state.current_step]

st.set_page_config(
    page_title="Transition Gap",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# DB 초기화 (앱 시작 시 1회)
init_db()


def _restore_session() -> None:
    """가장 최근 세션이 있으면 응답 데이터만 session_state에 복원한다."""
    if st.session_state.get("_skip_restore_once"):
        st.session_state["_skip_restore_once"] = False
        return

    if st.session_state.get("responses"):
        return

    latest_session = load_latest_session_snapshot()
    if latest_session is None:
        return

    st.session_state.session_id = latest_session["id"]
    st.session_state.responses = latest_session["responses"]


_restore_session()


def save_current_session(next_step: str) -> None:
    """현재 응답과 진행 단계를 SQLite에 저장한다."""
    responses = st.session_state.responses
    session_id = st.session_state.session_id
    st.session_state.session_id = save_session(
        responses=responses,
        current_step=next_step,
        session_id=session_id,
    )


def save_and_advance(next_step: str) -> None:
    """현재 응답을 저장하고 다음 단계로 이동한다."""
    st.session_state.session_id = save_session(
        responses=st.session_state.responses,
        current_step=next_step,
        session_id=st.session_state.session_id,
    )
    st.session_state.current_step = next_step
    st.session_state["_needs_scroll"] = True
    st.rerun()


def _is_all_input_complete() -> bool:
    """모든 입력 단계 완료 여부."""
    if get_layer0_missing():
        return False
    if get_layer1_missing():
        return False
    if get_layer2_a_missing():
        return False
    if get_layer2_b_missing():
        return False
    if get_layer2_c_missing():
        return False
    return True


def _reset_session() -> None:
    """현재 브라우저 세션만 초기화하고 새 진단 입력으로 돌아간다."""
    for key in (
        "cached_areas",
        "_responses_hash",
        "session_alias_input",
        "layer0_complete",
    ):
        st.session_state.pop(key, None)
    for variable in ALL_VARIABLES:
        input_key = f"input_{variable.id}"
        st.session_state.pop(input_key, None)
        st.session_state.pop(f"{input_key}_base", None)
        st.session_state.pop(f"{input_key}_performance", None)
        st.session_state.pop(f"{input_key}_equity", None)

    st.session_state.current_step = "intro"
    st.session_state.responses = {}
    st.session_state.session_id = None
    st.session_state.session_alias = ""
    st.session_state.selected_scenario = "performance"
    st.session_state["_skip_restore_once"] = True
    st.session_state["_needs_scroll"] = True
    st.rerun()


def _calc_progress(current_step: str) -> float:
    """현재 단계 기준 진행률을 0.0~1.0으로 반환한다."""
    if current_step not in STEP_ORDER:
        return 0.0
    if len(STEP_ORDER) <= 1:
        return 1.0
    return STEP_ORDER.index(current_step) / (len(STEP_ORDER) - 1)


# ============================================================
# 사이드바 — 진행 단계 표시
# ============================================================

def render_sidebar() -> str:
    """사이드바 진행 단계 표시. 현재 단계 반환."""
    with st.sidebar:
        st.markdown("### Transition Gap")
        st.caption("스타트업 인사제도 정합성 진단 도구")
        alias = st.session_state.get("session_alias") or "미지정"
        st.caption(f"진단 대상: {alias}")
        st.markdown("---")

        st.markdown("#### 진단 단계")
        steps = [
            ("intro", "0. 시작 안내"),
            ("layer0", "1. 대표님의 인사 철학"),
            ("layer1", "2. 조직 컨텍스트"),
            ("layer2_a", "3-A. 인력 · 채용 진단"),
            ("layer2_b", "3-B. 보상 진단"),
            ("layer2_c", "3-C. 평가 · 리더십 진단"),
            ("result_summary", "03. 진단 결과 요약"),
            ("result_detail", "03-2. 영역별 상세 분석"),
            ("simulation", "04. 트레이드오프 시뮬레이션"),
        ]

        current_step = st.session_state.current_step
        all_complete = _is_all_input_complete()
        progress = _calc_progress(current_step)
        st.progress(progress)
        st.caption(f"진행률 {round(progress * 100)}%")
        st.markdown("")

        for step_id, step_label in steps:
            is_current = step_id == current_step
            is_accessible = _is_step_accessible(step_id, all_complete)

            if is_current:
                st.markdown(f"**▶ {step_label}**")
            elif is_accessible:
                if st.button(
                    f"  {step_label}",
                    key=f"nav_{step_id}",
                    use_container_width=True,
                ):
                    save_and_advance(step_id)
            else:
                st.markdown(
                    f"<span style='color: #A0AAB5;'>  {step_label}</span> "
                    f"<span style='font-size: 11px; color: #C9844A;'>입력 필요</span>",
                    unsafe_allow_html=True,
                )

        st.markdown("---")
        if st.button("새 진단 시작", key="reset_session", use_container_width=True):
            _reset_session()

    return current_step


def _is_step_accessible(step_id: str, all_complete: bool) -> bool:
    """사이드바에서 해당 단계로 이동 가능한지 판정한다."""
    if step_id in RESULT_STEPS:
        return all_complete
    if step_id in {"intro", "layer0"}:
        return True
    if step_id in INPUT_STEPS:
        return not get_layer0_missing()
    return False


def render_step_navigation(
    prev_step: str | None,
    next_step: str | None,
    next_label: str,
    is_complete: bool,
    missing_vars: list | None = None,
) -> None:
    """단계 전환 버튼 표준 렌더링."""
    st.markdown("---")

    if not is_complete and missing_vars:
        q_numbers = sorted(get_question_number(variable.id) for variable in missing_vars)
        chips_html = " ".join(
            f'<span style="'
            f'display: inline-block; '
            f'padding: 2px 10px; '
            f'margin: 2px 4px 2px 0; '
            f'background-color: #FAF1E0; '
            f'border: 1px solid #F4D8A0; '
            f'border-radius: 12px; '
            f'font-size: 13px; '
            f'color: #2C3E50;'
            f'">Q{number}</span>'
            for number in q_numbers
        )
        st.markdown(
            f'<div style="margin-bottom: 12px;">'
            f'<span style="color: #C9844A; font-weight: 500;">'
            f'⚠ 미입력 {len(missing_vars)}개:'
            f'</span> {chips_html}'
            f'</div>',
            unsafe_allow_html=True,
        )

    col1, col2 = st.columns(2)
    with col1:
        if prev_step:
            if st.button(
                "← 이전",
                key=f"prev_btn_{prev_step}",
                use_container_width=True,
            ):
                save_and_advance(prev_step)

    with col2:
        if next_step:
            if st.button(
                next_label,
                disabled=not is_complete,
                key=f"next_btn_{next_step}",
                use_container_width=True,
                type="primary",
            ):
                save_and_advance(next_step)


# ============================================================
# 메인
# ============================================================

def main() -> None:
    if st.session_state.get("_needs_scroll", False):
        st.session_state["_needs_scroll"] = False

    current_step = render_sidebar()

    st.title("Transition Gap")
    st.caption("스타트업 인사제도 정합성 진단 도구")
    st.markdown("---")

    if current_step == "intro":
        render_intro_page()
        render_step_navigation(
            prev_step=None,
            next_step="layer0",
            next_label="진단 시작 →",
            is_complete=True,
        )

    elif current_step == "layer0":
        is_complete = render_layer0()
        missing = get_layer0_missing()
        render_step_navigation(
            prev_step="intro",
            next_step="layer1",
            next_label="다음 →",
            is_complete=is_complete,
            missing_vars=missing,
        )

    elif current_step == "layer1":
        is_complete = render_layer1_form()
        missing = get_layer1_missing()
        render_step_navigation(
            prev_step="layer0",
            next_step="layer2_a",
            next_label="다음 →",
            is_complete=is_complete,
            missing_vars=missing,
        )

    elif current_step == "layer2_a":
        is_complete = render_layer2_a_form()
        missing = get_layer2_a_missing()
        render_step_navigation(
            prev_step="layer1",
            next_step="layer2_b",
            next_label="다음 →",
            is_complete=is_complete,
            missing_vars=missing,
        )

    elif current_step == "layer2_b":
        is_complete = render_layer2_b_form()
        missing = get_layer2_b_missing()
        render_step_navigation(
            prev_step="layer2_a",
            next_step="layer2_c",
            next_label="다음 →",
            is_complete=is_complete,
            missing_vars=missing,
        )

    elif current_step == "layer2_c":
        is_complete = render_layer2_c_form()
        missing = get_layer2_c_missing()
        render_step_navigation(
            prev_step="layer2_b",
            next_step="result_summary",
            next_label="진단 결과 →",
            is_complete=is_complete,
            missing_vars=missing,
        )

    elif current_step == "result_summary":
        render_result_summary()
        render_step_navigation(
            prev_step="layer2_c",
            next_step="result_detail",
            next_label="영역별 상세 분석 →",
            is_complete=True,
        )

    elif current_step == "result_detail":
        render_result_detail()
        render_step_navigation(
            prev_step="result_summary",
            next_step="simulation",
            next_label="트레이드오프 시뮬레이션 →",
            is_complete=True,
        )

    elif current_step == "simulation":
        render_simulation_page()
        render_step_navigation(
            prev_step="result_detail",
            next_step=None,
            next_label="",
            is_complete=True,
        )

    else:
        st.info(f"단계 '{current_step}' 는 아직 구현되지 않았습니다.")


if __name__ == "__main__":
    main()
