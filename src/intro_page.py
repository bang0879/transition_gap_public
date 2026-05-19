"""
랜딩 페이지 — 앱 진입 시 첫 화면.
"""
from __future__ import annotations

import streamlit as st


def render_intro_page() -> None:
    """랜딩 페이지."""
    st.markdown("## 우리 회사에 맞는 '정답' 인사제도는 없습니다.")

    st.markdown(
        """
        실리콘밸리의 혁신적인 제도를 도입해도 조직 성과로 이어지지 않는 이유는,
        회사의 비전과 개별 인사제도(평가 · 보상 · 채용)가 서로 엇박자를
        내고 있기 때문입니다.

        본 진단은 파편화된 귀사의 인사 현황을 객관적으로 파악하고,
        모든 제도가 하나의 철학 아래 유기적으로 맞물려 돌아가도록
        **한 방향 정렬(Alignment)**의 기준점을 제시합니다.
        """
    )

    st.markdown("---")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("### 1. 진단")
        st.markdown(
            "**핵심 변수**로 귀사의 인사제도 현황을 진단합니다.\n\n"
            "- 조직 컨텍스트\n"
            "- 인력 안정성\n"
            "- 채용 파이프라인\n"
            "- 보상 구조\n"
            "- 평가 · 리더십 · 거버넌스"
        )

    with col2:
        st.markdown("### 2. 시뮬레이션")
        st.markdown(
            "**트레이드오프**를 시각화하고 가능한 시나리오를 비교합니다.\n\n"
            "- 보상과 동기부여\n"
            "- 조직 운영과 채용\n"
            "- 시나리오별 예상 임팩트\n"
            "- 재무 시뮬레이션"
        )

    with col3:
        st.markdown("### 3. 실행")
        st.markdown(
            "**단계적 도입 로드맵**과 선행 과제를 제시합니다.\n\n"
            "- 12개월 표준 로드맵\n"
            "- 취업규칙 초안\n"
            "- 노동법 리스크 점검\n"
            "- 데이터 인프라 구축 가이드"
        )

    st.markdown("---")

    st.markdown("### 이 도구의 차별점")
    st.markdown(
        "- **답을 강요하지 않습니다.** 트레이드오프와 예상 결과만 제시합니다.\n"
        "- **재무 임팩트를 함께 시뮬레이션합니다.** 인건비 변화 없는 컨설팅은 함정입니다.\n"
        "- **단계적 도입을 권고합니다.** 한 번에 다 바꾸지 않습니다.\n"
        "- **도메인 전문가의 검토를 거칩니다.** 자동화가 아닌 HITL 방식입니다."
    )

    st.markdown("---")

    st.info(
        "**진단 소요 시간**: 약 15~20분\n\n"
        "**다음 단계**: 입력하신 데이터를 바탕으로 전문가가 심층 분석하여 "
        "맞춤형 리포트를 영업일 기준 3~5일 내에 전달해 드립니다."
    )

    st.markdown("---")
    st.markdown("### 진단 대상")
    if "session_alias_input" not in st.session_state:
        st.session_state["session_alias_input"] = st.session_state.get("session_alias", "")

    session_alias = st.text_input(
        "회사명 또는 내부 식별명",
        placeholder="예: Company A, 7월 파일럿 고객사",
        key="session_alias_input",
        help="민감한 실명 대신 내부 식별명을 사용해도 됩니다.",
    )
    st.session_state["session_alias"] = session_alias.strip()
