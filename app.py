"""
Transition Gap - 인사제도 진단/설계 도구.

Streamlit 진입점.
"""

import streamlit as st

st.set_page_config(
    page_title="Transition Gap",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.title("Transition Gap")
st.caption("AI 시대 한국 스타트업 인사제도 진단/설계 도구")

st.markdown("---")

st.markdown(
    """
    ### 진단 모듈 (Week 1 빌드 예정)
    - Layer 1: 조직 컨텍스트
    - Layer 2: 전환 갭 (5개 sub-category, 21개 변수)
    - 가시성 지수 자동 계산
    """
)

st.info("환경 세팅 완료. 다음 작업 지시서에서 진단 폼 빌드를 시작합니다.")
