"""
Transition Gap — 인사제도 진단/설계 도구
Streamlit 진입점
"""
from __future__ import annotations

import streamlit as st

from src.diagnosis.form_layer1 import render_layer1_form
from src.database import init_db

st.set_page_config(
    page_title="Transition Gap",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# DB 초기화 (앱 시작 시 1회)
init_db()


# ============================================================
# 사이드바 — 진행 단계 표시
# ============================================================

def render_sidebar() -> str:
    """사이드바 진행 단계 표시. 현재 단계 반환."""
    with st.sidebar:
        st.markdown("### Transition Gap")
        st.caption("AI 시대 한국 스타트업 인사제도 진단/설계 도구")
        st.markdown("---")

        if "current_step" not in st.session_state:
            st.session_state.current_step = "layer1"

        st.markdown("#### 진단 단계")
        steps = [
            ("layer1", "1. 조직 컨텍스트"),
            ("layer2", "2. 전환 갭 진단"),
            ("result", "3. 진단 결과"),
            ("simulation", "4. 시뮬레이션"),
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
    current_step = render_sidebar()

    st.title("Transition Gap")
    st.caption("AI 시대 한국 스타트업 인사제도 진단/설계 도구")
    st.markdown("---")

    if current_step == "layer1":
        is_complete = render_layer1_form()

        col1, col2, col3 = st.columns([1, 1, 1])
        with col3:
            if st.button(
                "다음 단계 (Layer 2)",
                disabled=not is_complete,
                use_container_width=True,
                type="primary",
            ):
                st.session_state.current_step = "layer2"
                st.rerun()

    elif current_step == "layer2":
        st.markdown("## Layer 2. 전환 갭 진단")
        st.info("Layer 2 빌드는 다음 작업 지시서(#03)에서 진행됩니다.")

        if st.button("← Layer 1로 돌아가기"):
            st.session_state.current_step = "layer1"
            st.rerun()

    else:
        st.info(f"단계 '{current_step}' 는 아직 구현되지 않았습니다.")


if __name__ == "__main__":
    main()
