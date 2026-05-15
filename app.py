"""
Transition Gap — 인사제도 진단/설계 도구
Streamlit 진입점
"""
from __future__ import annotations

import streamlit as st
from streamlit_scroll_to_top import scroll_to_here

from src.diagnosis.form_layer1 import get_layer1_missing, render_layer1_form
from src.diagnosis.form_layer2 import (
    get_layer2_a_missing,
    get_layer2_b_missing,
    get_layer2_c_missing,
    render_layer2_a_form,
    render_layer2_b_form,
    render_layer2_c_form,
)
from src.diagnosis.variables import get_question_number
from src.diagnosis.result_page import render_diagnosis_result
from src.database import init_db, load_latest_session_snapshot, save_session
from src.simulation.simulation_page import render_simulation_page

STEP_ORDER = ["layer1", "layer2_a", "layer2_b", "layer2_c", "result", "simulation"]
LEGACY_STEP_MAP = {
    "intro": "layer1",
    "layer2": "layer2_a",
}

if "current_step" not in st.session_state:
    st.session_state.current_step = "layer1"
if "responses" not in st.session_state:
    st.session_state.responses = {}
if "session_id" not in st.session_state:
    st.session_state.session_id = None
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


# ============================================================
# 사이드바 — 진행 단계 표시
# ============================================================

def render_sidebar() -> str:
    """사이드바 진행 단계 표시. 현재 단계 반환."""
    with st.sidebar:
        st.markdown("### Transition Gap")
        st.caption("스타트업 인사제도 진단 도구")
        st.markdown("---")

        st.markdown("#### 진단 단계")
        steps = [
            ("layer1", "1. 조직 컨텍스트"),
            ("layer2_a", "2-A. 인력 · 채용 진단"),
            ("layer2_b", "2-B. 보상 진단"),
            ("layer2_c", "2-C. 평가 · 리더십 진단"),
            ("result", "3. 진단 결과"),
            ("simulation", "4. 트레이드오프 진단"),
        ]

        current_step = st.session_state.current_step
        current_idx = STEP_ORDER.index(current_step) if current_step in STEP_ORDER else 0

        for step_id, step_label in steps:
            step_idx = STEP_ORDER.index(step_id)

            if step_id == current_step:
                st.markdown(f"**▶ {step_label}**")
            elif step_idx < current_idx:
                if st.button(
                    f"  {step_label}",
                    key=f"nav_{step_id}",
                    use_container_width=True,
                ):
                    save_and_advance(step_id)
            else:
                st.markdown(
                    f"<span style='color: #A0AAB5;'>  {step_label}</span>",
                    unsafe_allow_html=True,
                )

    return current_step


def render_next_button(
    is_complete: bool,
    missing_vars: list,
    next_step: str,
    button_label: str,
    back_step: str | None = None,
    back_label: str | None = None,
) -> None:
    """다음 버튼과 미입력 항목 안내를 함께 렌더링한다."""
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

    col1, col2 = st.columns([1, 5])
    with col1:
        if back_step and back_label:
            if st.button(back_label, use_container_width=True):
                save_and_advance(back_step)
        if st.button(
            button_label,
            disabled=not is_complete,
            use_container_width=True,
            type="primary",
        ):
            save_and_advance(next_step)


# ============================================================
# 메인
# ============================================================

def main() -> None:
    if st.session_state.get("_needs_scroll", False):
        scroll_to_here(0)
        st.session_state["_needs_scroll"] = False

    current_step = render_sidebar()

    st.title("Transition Gap")
    st.caption("AI 시대 한국 스타트업 인사제도 진단/설계 도구")
    st.markdown("---")

    if current_step == "layer1":
        is_complete = render_layer1_form()
        missing = get_layer1_missing()
        render_next_button(
            is_complete=is_complete,
            missing_vars=missing,
            next_step="layer2_a",
            button_label="다음: 인력 · 채용 진단 →",
        )

    elif current_step == "layer2_a":
        is_complete = render_layer2_a_form()
        missing = get_layer2_a_missing()
        render_next_button(
            is_complete=is_complete,
            missing_vars=missing,
            next_step="layer2_b",
            button_label="다음: 보상 진단 →",
            back_step="layer1",
            back_label="← 이전",
        )

    elif current_step == "layer2_b":
        is_complete = render_layer2_b_form()
        missing = get_layer2_b_missing()
        render_next_button(
            is_complete=is_complete,
            missing_vars=missing,
            next_step="layer2_c",
            button_label="다음: 평가 · 리더십 진단 →",
            back_step="layer2_a",
            back_label="← 이전",
        )

    elif current_step == "layer2_c":
        is_complete = render_layer2_c_form()
        missing = get_layer2_c_missing()
        render_next_button(
            is_complete=is_complete,
            missing_vars=missing,
            next_step="result",
            button_label="진단 결과 보기 →",
            back_step="layer2_b",
            back_label="← 이전",
        )

    elif current_step == "result":
        render_diagnosis_result()

        st.markdown("---")
        col1, col2 = st.columns(2)
        with col1:
            if st.button(
                "← 인사제도 현황 진단으로 돌아가기",
                use_container_width=True,
            ):
                save_and_advance("layer2_c")
        with col2:
            if st.button(
                "트레이드오프 진단 보기 →",
                use_container_width=True,
                type="primary",
            ):
                save_and_advance("simulation")

    elif current_step == "simulation":
        render_simulation_page()

        st.markdown("---")
        col1, col2 = st.columns([1, 5])
        with col1:
            if st.button("← 진단 결과로 돌아가기", use_container_width=True):
                save_and_advance("result")
            st.button("시나리오 보기", disabled=True, use_container_width=True)

    else:
        st.info(f"단계 '{current_step}' 는 아직 구현되지 않았습니다.")


if __name__ == "__main__":
    main()
