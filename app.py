"""
Transition Gap — 인사제도 진단/설계 도구
Streamlit 진입점
"""
from __future__ import annotations

import streamlit as st
from streamlit_scroll_to_top import scroll_to_here

from src.diagnosis.form_layer1 import render_layer1_form
from src.diagnosis.form_layer2 import render_layer2_form
from src.diagnosis.result_page import render_diagnosis_result
from src.database import init_db, save_session
from src.intro_page import render_intro_page
from src.simulation.simulation_page import render_simulation_page

if "current_step" not in st.session_state:
    st.session_state.current_step = "intro"
if "responses" not in st.session_state:
    st.session_state.responses = {}
if "session_id" not in st.session_state:
    st.session_state.session_id = None
if "_needs_scroll" not in st.session_state:
    st.session_state["_needs_scroll"] = False

st.set_page_config(
    page_title="Transition Gap",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# DB 초기화 (앱 시작 시 1회)
init_db()


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
            ("intro", "0. 시작 안내"),
            ("layer1", "1. 조직 컨텍스트"),
            ("layer2", "2. 인사제도 현황 진단"),
            ("result", "3. 진단 결과"),
            ("simulation", "4. 트레이드오프 진단"),
            ("report", "5. 리포트"),
        ]
        for step_id, step_label in steps:
            if step_id == st.session_state.current_step:
                st.markdown(f"**▶ {step_label}**")
            else:
                st.markdown(f"  {step_label}")

    return st.session_state.current_step


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

    if current_step == "intro":
        render_intro_page()

        st.markdown("---")
        col1, col2 = st.columns([1, 5])
        with col1:
            if st.button(
                "진단 시작 →",
                use_container_width=True,
                type="primary",
            ):
                save_and_advance("layer1")

    elif current_step == "layer1":
        is_complete = render_layer1_form()

        st.markdown("---")
        col1, col2 = st.columns([1, 5])
        with col1:
            if st.button(
                "다음: Layer 2 →",
                disabled=not is_complete,
                use_container_width=True,
                type="primary",
            ):
                save_and_advance("layer2")

    elif current_step == "layer2":
        is_complete = render_layer2_form()

        st.markdown("---")
        col1, col2 = st.columns([1, 5])
        with col1:
            if st.button("← Layer 1로 돌아가기", use_container_width=True):
                save_and_advance("layer1")
            if st.button(
                "진단 결과 보기 →",
                disabled=not is_complete,
                use_container_width=True,
                type="primary",
            ):
                save_and_advance("result")

    elif current_step == "result":
        render_diagnosis_result()

        st.markdown("---")
        col1, col2 = st.columns([1, 5])
        with col1:
            if st.button("← Layer 2로 돌아가기", use_container_width=True):
                save_and_advance("layer2")
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
