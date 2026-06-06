"""
진단 모듈 — 변수 SSOT (Single Source of Truth).

26개 변수 정의 + 선택지 + 점수 매핑 + 매트릭스 가중치.
다른 모든 모듈(form, visibility_index, matrix)은 이 파일에서 import한다.

수정 시 주의:
- 변수 ID는 절대 바꾸지 말 것 (DB 저장과 직결)
- 선택지 순서 변경 시 점수 매핑도 함께 수정
- 가중치 합이 1.0이 되는지 검증
"""
from __future__ import annotations

from dataclasses import dataclass, field, replace
from enum import Enum
from typing import Optional


# ============================================================
# 데이터 구조 정의
# ============================================================

class InputType(str, Enum):
    """입력 위젯 타입."""
    SINGLE_SELECT = "single_select"      # 단일 선택 (radio/selectbox)
    MULTI_SELECT = "multi_select"        # 다중 선택 (multiselect)
    SLIDER_5 = "slider_5"                # 1~5 슬라이더
    SLIDER_10 = "slider_10"              # 1~10 슬라이더
    SLIDER_RATIO = "slider_ratio"        # 0~1 비율 슬라이더
    NUMBER = "number"                    # 숫자 입력
    PERCENT_SPLIT = "percent_split"      # 비율 분배 (보상 구조 2단계)


@dataclass(frozen=True)
class Variable:
    """진단 변수 정의."""
    id: str                              # "L1-1", "2-3-2" 등
    layer: str                           # "L0", "L1" 또는 "L2"
    sub_category: Optional[str]          # "2-1", "2-2" 등 (Layer 2만)
    label: str                           # 한국어 질문 텍스트
    input_type: InputType
    options: list[str] = field(default_factory=list)
    helper_text: str = ""                # 변수 아래 안내 문구
    is_quantitative: bool = False        # 가시성 지수 계산 대상
    unknown_option: Optional[str] = None # "모름 / 측정 안 함" 등 (있을 경우)
    max_select: Optional[int] = None     # multi_select 시 최대 개수
    short_label: str = ""                # 미입력 안내용 짧은 라벨
    tags: list[str] = field(default_factory=list)


# ============================================================
# Layer 0: CEO 철학 앵커링 (4개 변수)
# ============================================================

PHILOSOPHY_TO_INT = {"A": 1, "B": 5}

LAYER_0_VARIABLES: list[Variable] = [
    Variable(
        id="L0-1",
        layer="L0",
        sub_category="philosophy",
        label="회사가 크게 성장했을 때, 이상적인 보상 분배 방식은?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다",
            "뛰어난 소수보다, 탄탄한 팀워크와 협업을 유도하여 조직 전체의 평균 성과를 높인다",
        ],
        short_label="보상 철학",
        tags=["성과주의", "전반적 모티베이션"],
    ),
    Variable(
        id="L0-2",
        layer="L0",
        sub_category="philosophy",
        label="리더들의 업무 과중을 고려할 때, 팀장들에게 먼저 요구하는 것은?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "명확한 목표 대비 성과 추적과 저성과 영역에 대한 솔직한 피드백",
            "구성원과의 정기 1:1 대면 면담 (1on1)을 통한 고충 청취와 심리적 안전감 확보",
        ],
        short_label="리더십 철학",
        tags=["경쟁", "안정감"],
    ),
    Variable(
        id="L0-3",
        layer="L0",
        sub_category="philosophy",
        label="장기적 관점에서, 우리 조직을 이끌어갈 핵심 인재 그룹은 어떻게 구성되기를 원하십니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "외부에서 검증된 최고의 S급 인재를 높은 비용을 치르더라도 영입하여 즉시 전력으로 활용한다",
            "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다",
        ],
        short_label="채용 전략",
        tags=["외부 수혈(엘리트 지향)", "내부 육성(로열티 지향)"],
    ),
    Variable(
        id="L0-4",
        layer="L0",
        sub_category="philosophy",
        label="대체 불가능한 핵심 인재가 이탈하려 할 때, 내부 형평성을 크게 벗어나는 파격적인 보상을 요구한다면 어떻게 의사결정 하시겠습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "조직 전체의 형평성과 보상 원칙이 무너지는 것이 더 위험하므로, 타격이 있더라도 예외 없이 원칙대로 내보낸다.",
            "내부 불만이 다소 생기더라도 당장의 비즈니스 공백과 리스크를 막는 것이 우선이므로, 예외를 인정하고 파격적으로 잡는다.",
        ],
        helper_text="핵심인재 확보와 조직의 보상 원칙이 충돌할 때 어느 쪽을 더 우선하는지 확인합니다.",
        short_label="인력운영 철학",
        tags=["조직 안정/룰", "핵심 인재 보존/실용"],
    ),
]


# ============================================================
# Layer 1: 조직 컨텍스트 (5개 변수)
# ============================================================

PAIN_POINTS = [
    "무임승차자(저성과자) 방치로 인한 핵심 인재의 의욕 저하 및 이탈",
    "기존 멤버와 신규 합류 멤버(고연봉자) 간의 보상 역전 및 갈등",
    "평가 철학 부재로 인한 '나눠먹기식(N빵)' 등급 부여와 공정성 시비",
    "실무 에이스가 리더(팀장)가 된 후 발생하는 리더십 공백 및 팀 붕괴",
    "부서 간 이기주의(Silo) 심화 및 책임 떠넘기기",
    "창업자/C-레벨의 마이크로매니징 및 일관성 없는 인사 개입",
    "예측 불가능한 인건비 상승 및 보상 재원 부족",
    "체계적인 온보딩 부재로 인한 신규 입사자의 높은 조기 퇴사율",
]

LAYER_1_VARIABLES: list[Variable] = [
    Variable(
        id="L1-1",
        layer="L1",
        sub_category=None,
        label="현재 가장 시급한 HR 페인포인트는 무엇입니까? (최대 2개 선택)",
        input_type=InputType.MULTI_SELECT,
        options=PAIN_POINTS,
        max_select=2,
        helper_text="조직이 현재 직면하고 있는 가장 큰 문제 2가지를 선택해 주세요.",
    ),
    Variable(
        id="L1-2",
        layer="L1",
        sub_category=None,
        label="총 인원수는 어느 정도입니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "20인 이하",
            "20~50인",
            "50~100인",
            "100~500인",
            "500인 초과",
        ],
    ),
    Variable(
        id="L1-3",
        layer="L1",
        sub_category=None,
        label="현재 조직의 의사결정 구조는 어떻습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "수평형 (CEO + 실무자, 별도 중간 관리자 없음)",
            "3단계 (CEO - 리더 - 실무자)",
            "4단계 (CEO - 임원/실장 - 팀장 - 실무자)",
            "5단계 이상 (사업부/본부 체계 도입)",
            "직군별 상이 (예: 개발은 수평, 사업은 위계)",
        ],
        helper_text=(
            "조직의 실제 의사결정 흐름을 기준으로 선택해 주세요. "
            "공식 직급 체계가 아닌 실제 운영 방식입니다."
        ),
    ),
    Variable(
        id="L1-4",
        layer="L1",
        sub_category=None,
        label="향후 12개월 채용 기조는?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "공격적 확장 (30%+ 인원 증가)",
            "안정적 성장 (10~30% 증가)",
            "결원 보충 및 유지 (10% 미만)",
            "채용 동결 및 감축",
        ],
    ),
    Variable(
        id="L1-5",
        layer="L1",
        sub_category=None,
        label="주력 산업 도메인은?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "B2B SaaS",
            "B2C 플랫폼",
            "핀테크 / 금융",
            "커머스 / 리테일",
            "콘텐츠 / 미디어",
            "데이터 / 자동화",
            "바이오 / 헬스케어",
            "하드웨어 / 제조",
            "기타",
        ],
        helper_text=(
            "MVP 단계에서는 B2B SaaS와 B2C 플랫폼에 최적화되어 있으나, "
            "다른 산업도 참고용으로 활용 가능합니다."
        ),
    ),
]


# ============================================================
# Layer 2: 전환 갭 (21개 변수, 5개 sub-category)
# ============================================================

UNKNOWN = "모름 / 측정 안 함"

LAYER_2_VARIABLES: list[Variable] = [
    # --- 2-1. 인력 안정성 갭 ---
    Variable(
        id="2-1-1",
        layer="L2",
        sub_category="2-1",
        label="직전 12개월 전체 자발적 이직률은 어느 정도입니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["10% 미만", "10~20%", "20% 초과", UNKNOWN],
        is_quantitative=True,
        unknown_option=UNKNOWN,
    ),
    Variable(
        id="2-1-2",
        layer="L2",
        sub_category="2-1",
        label="직전 12개월 핵심 인재 이탈 경험은?",
        input_type=InputType.SINGLE_SELECT,
        options=["없음", "1명", "2~3명", "4명 이상", UNKNOWN],
        helper_text=(
            "여기서 핵심 인재란, '내일 당장 퇴사할 경우 진행 중인 핵심 프로젝트가 "
            "최소 1개월 이상 지연되는 인력(대체 불가능성)' 또는 '조직의 다음 스테이지를 "
            "이끌 차세대 리더'를 의미합니다."
        ),
        is_quantitative=True,
        unknown_option=UNKNOWN,
    ),
    Variable(
        id="2-1-3",
        layer="L2",
        sub_category="2-1",
        label="신규 입사자 1년 내 조기 퇴사 비율은?",
        input_type=InputType.SINGLE_SELECT,
        options=["10% 미만", "10~30%", "30% 초과", UNKNOWN],
        is_quantitative=True,
        unknown_option=UNKNOWN,
    ),
    Variable(
        id="2-1-4",
        layer="L2",
        sub_category="2-1",
        label="핵심 인재를 식별하는 기준과 명단이 있습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["명확한 기준과 명단이 있음", "리더별로 암묵적으로 알고 있음", "별도 기준 없음"],
        helper_text="핵심 인재를 감으로만 알고 있는지, 실제로 관리 가능한 기준이 있는지 확인합니다.",
        is_quantitative=True,
    ),
    Variable(
        id="2-1-5",
        layer="L2",
        sub_category="2-1",
        label="핵심 포스트가 갑자기 비었을 때 대체 계획이 있습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["후임/백업 후보가 정해져 있음", "일부 포지션만 있음", "거의 없음"],
        helper_text="핵심 인재 이탈이 실제 사업 공백으로 이어지는지를 판단합니다.",
    ),

    # --- 2-2. 채용 파이프라인 갭 ---
    Variable(
        id="2-2-1",
        layer="L2",
        sub_category="2-2",
        label="핵심 포지션 평균 채용 소요 기간은? (체감)",
        input_type=InputType.SINGLE_SELECT,
        options=["2개월 이내", "2~4개월", "4~6개월", "6개월 초과", "모름 / 채용 자체 없음"],
        is_quantitative=True,
        unknown_option="모름 / 채용 자체 없음",
    ),
    Variable(
        id="2-2-2",
        layer="L2",
        sub_category="2-2",
        label="현재 활용 중인 주요 채용 채널은 몇 가지입니까? (예: 사람인, 원티드, 리퍼럴, 헤드헌터 등)",
        input_type=InputType.SINGLE_SELECT,
        options=["1개", "2~3개", "4개 이상"],
    ),
    Variable(
        id="2-2-3",
        layer="L2",
        sub_category="2-2",
        label="최종 면접 통과 후 합격 통보를 받은 지원자가 입사를 거절한 경험이 있습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["거의 없음", "가끔", "자주"],
    ),
    Variable(
        id="2-2-4",
        layer="L2",
        sub_category="2-2",
        label="후보자에게 회사를 설명하는 채용 브랜딩 자산이 있습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["채용 페이지/컬처덱/인터뷰 자료가 있음", "공고문 외 일부 자료만 있음", "거의 없음"],
        helper_text="후보자가 회사를 선택해야 할 이유가 채용 과정에서 일관되게 전달되는지 확인합니다.",
    ),
    Variable(
        id="2-2-5",
        layer="L2",
        sub_category="2-2",
        label="수습/온보딩 전환율 또는 입사 후 3개월 적응 상태를 추적합니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["정기적으로 추적함", "문제 발생 시에만 확인함", "추적하지 않음"],
        helper_text="채용 성공을 입사 확정이 아니라 초기 적응까지 보고 있는지 확인합니다.",
        is_quantitative=True,
    ),

    # --- 2-3. 총보상 갭 ---
    Variable(
        id="2-3-1",
        layer="L2",
        sub_category="2-3",
        label="보상 철학의 무게중심은 어디에 있습니까?",
        input_type=InputType.SLIDER_5,
        helper_text="우수 인재를 무엇으로 설득하시나요?",
    ),
    Variable(
        id="2-3-2",
        layer="L2",
        sub_category="2-3",
        label="현재 우리 회사의 실제 보상 체계에 가장 가까운 모습은 무엇입니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "기본급 위주의 안정형",
            "인센티브 위주의 성과연동형",
            "스톡옵션 중심의 장기비전형",
            "직군별로 섞여 있는 혼합형",
        ],
        is_quantitative=True,  # 0.5점/1점 가능
    ),
    Variable(
        id="2-3-2-detail",
        layer="L2",
        sub_category="2-3",
        label="혹시 정확한 비율을 알고 계신다면 (2단계 — 선택 입력)",
        input_type=InputType.PERCENT_SPLIT,
        helper_text="기본급 / 성과급 / 지분보상 비중. 합계 100% 안 맞아도 진행 가능.",
    ),
    Variable(
        id="2-3-3",
        layer="L2",
        sub_category="2-3",
        label="매출 대비 인건비 비중은?",
        input_type=InputType.SINGLE_SELECT,
        options=["20% 미만", "20~35%", "35~50%", "50% 초과", UNKNOWN],
        is_quantitative=True,
        unknown_option=UNKNOWN,
    ),
    Variable(
        id="2-3-4",
        layer="L2",
        sub_category="2-3",
        label="지난 12개월 인건비 증가율은?",
        input_type=InputType.SINGLE_SELECT,
        options=["10% 미만", "10~25%", "25~50%", "50% 초과", UNKNOWN],
        is_quantitative=True,
        unknown_option=UNKNOWN,
    ),
    Variable(
        id="2-3-5",
        layer="L2",
        sub_category="2-3",
        label="시장 대비 보상 위치는? (자가 진단)",
        input_type=InputType.SINGLE_SELECT,
        options=["하위", "중위", "상위", UNKNOWN],
        is_quantitative=True,
        unknown_option=UNKNOWN,
    ),
    Variable(
        id="2-3-6",
        layer="L2",
        sub_category="2-3",
        label="복리후생(휴가·간식·교육비 등)의 수준은 동종업계 대비 어떻습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["동종업계보다 높은 편", "비슷한 편", "낮은 편", "모르겠음"],
    ),

    # --- 2-4. 평가 및 수용성 갭 ---
    Variable(
        id="2-4-1a",
        layer="L2",
        sub_category="2-4",
        label="평가 주기는 어떻게 운영하십니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["연 1회", "반기 1회", "분기 1회 / 상시", "운영하지 않음"],
        short_label="평가 주기",
    ),
    Variable(
        id="2-4-1b",
        layer="L2",
        sub_category="2-4",
        label="평가의 주체는 누구입니까? (다면평가 여부)",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "하향식 (팀장 → 팀원 단방향)",
            "동료 평가 일부 포함",
            "360도 다면평가 (상사·동료·부하 포함)",
            "운영하지 않음",
        ],
        short_label="평가 주체",
    ),
    Variable(
        id="2-4-1c",
        layer="L2",
        sub_category="2-4",
        label="평가 지표의 성격은?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "KPI / MBO 등 정량·실적 중심",
            "OKR 등 도전 목표 중심",
            "역량 · 컬처핏 중심",
            "혼합형 (지표를 섞어서 운영)",
            "운영하지 않음",
        ],
        short_label="평가 지표 성격",
    ),
    Variable(
        id="2-4-1d",
        layer="L2",
        sub_category="2-4",
        label="평가 결과의 피드백과 수용성 관리는?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "일방적 결과 통보",
            "정기 1:1 대면 면담 (1on1)을 통한 결과 공유 (이의제기 프로세스 없음)",
            "정기 1:1 대면 면담 (1on1) + 명확한 이의제기 프로세스 존재",
            "운영하지 않음",
        ],
        short_label="피드백 및 수용성 관리",
    ),
    Variable(
        id="2-4-2",
        layer="L2",
        sub_category="2-4",
        label="평가 결과가 실제 보상(연봉/인센티브) 차등으로 이어지는 수준과 방식은 어떠합니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "차이가 거의 없거나, 그때그때 대표 재량으로 결정된다.",
            "차등이 있긴 하지만, 공식적인 룰보다는 주관적 판단이 강하게 개입된다.",
            "정해진 공식에 따라 기계적으로 연동되나, 최고-최하 등급 간 차이가 크지 않다.",
            "정해진 공식에 따라 철저히 자동 결정되며, 최고-최하 등급 간 차등이 파격적이다.",
        ],
    ),
    Variable(
        id="2-4-3-ceo",
        layer="L2",
        sub_category="2-4",
        label="우리 회사의 평가 제도가 공정하게 운영되고 있다고 생각하십니까?",
        input_type=InputType.SLIDER_10,
        helper_text="0은 공식 평가 제도를 운영하지 않아 공정성을 판단하기 어려운 상태를 뜻합니다.",
    ),
    Variable(
        id="2-4-3-employee",
        layer="L2",
        sub_category="2-4",
        label="직원들도 현재 평가 제도를 공정하다고 느낄 것이라 생각하십니까?",
        input_type=InputType.SLIDER_10,
        helper_text="0은 공식 평가 제도를 운영하지 않아 공정성을 판단하기 어려운 상태를 뜻합니다. 이 차이가 회사 인식과 현장 인식의 갭을 보여줍니다.",
    ),
    Variable(
        id="2-4-4",
        layer="L2",
        sub_category="2-4",
        label="리더들이 실무적인 의사결정(채용, 평가, 리소스 배분 등)을 내릴 때, 회사의 장기 비전을 명확한 판단 근거로 삼고 있습니까?",
        input_type=InputType.SLIDER_5,
    ),
    Variable(
        id="2-4-5",
        layer="L2",
        sub_category="2-4",
        label=(
            "평가 결과의 등급별 인원 분포, 또는 평가-연봉 인상률 차등 폭을 "
            "수치로 파악하고 있습니까?"
        ),
        input_type=InputType.SINGLE_SELECT,
        options=["알고 있음", UNKNOWN],
        is_quantitative=True,
        unknown_option=UNKNOWN,
        # 조건부: 2-4-1a != "운영하지 않음"일 때만 표시
    ),

    # --- 2-5. 리더십 갭 ---
    Variable(
        id="2-5-1",
        layer="L2",
        sub_category="2-5",
        label="우리 회사의 팀장급 리더들은 성과가 부진한 팀원에게 단호하게 피드백을 주고 개선을 요구할 수 있습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "대부분 객관적으로 잘 수행함",
            "갈등을 피하거나 온정주의가 있음",
            "대표인 내가 직접 나서야 해결됨",
        ],
    ),
    Variable(
        id="2-5-2",
        layer="L2",
        sub_category="2-5",
        label="팀장급 리더들이 분기 1회 이상 리더와 구성원 간의 정기 1:1 대면 면담 (1on1)을 운영합니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["운영함", "일부 운영", "운영 안 함"],
    ),
    Variable(
        id="2-5-3",
        layer="L2",
        sub_category="2-5",
        label="리더들의 실제 정기 1:1 대면 면담 (1on1) 운영 주기와 완료율 데이터를 기록·관리하고 있습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["기록·관리함", "기록·관리 안 함"],
        is_quantitative=True,
        unknown_option="기록·관리 안 함",
        # 조건부: 2-5-2 != "운영 안 함"일 때만 표시
    ),
    Variable(
        id="2-5-4",
        layer="L2",
        sub_category="2-5",
        label="실무진(주니어/미들급) 채용 시 최종 오퍼 승인 결정은 누가 합니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "실무 팀장 전결",
            "C-Level 전결",
            "CEO가 모든 인원 최종 면접 및 승인",
        ],
    ),
    Variable(
        id="2-5-5",
        layer="L2",
        sub_category="2-5",
        label="주력 서비스의 새 기능 배포(Minor Release) 의사결정은?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "실무팀 자율",
            "팀장 / PM 결정",
            "C-Level 결정",
            "CEO 최종 승인 필요",
        ],
    ),
    Variable(
        id="2-5-6",
        layer="L2",
        sub_category="2-5",
        label="우리 회사의 핵심가치는 채용이나 평가에서 직원을 '탈락'시키는 절대적인 기준으로 작동합니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "그냥 홈페이지에 적혀 있는 좋은 말 수준이다.",
            "면접관이나 리더의 성향에 따라 들쭉날쭉하게 적용된다.",
            "실력이 아무리 뛰어나도 핵심가치에 어긋나면 무조건 탈락시킨다.",
        ],
    ),
]


# ============================================================
# Sub-category 한국어 라벨
# ============================================================

SUB_CATEGORY_LABELS: dict[str, str] = {
    "2-1": "인력 안정성 갭",
    "2-2": "채용 파이프라인 갭",
    "2-3": "총보상 (Total Rewards) 갭",
    "2-4": "평가 및 수용성 갭",
    "2-5": "리더십 갭",
}


# ============================================================
# 전체 변수 통합 + 조회 헬퍼
# ============================================================

SHORT_LABELS_BY_ID: dict[str, str] = {
    "L0-1": "보상 철학",
    "L0-2": "리더십 철학",
    "L0-3": "채용 전략",
    "L0-4": "인력운영 철학",
    "L1-1": "가장 시급한 HR 페인포인트",
    "L1-2": "총 인원수",
    "L1-3": "조직 의사결정 구조",
    "L1-4": "향후 12개월 채용 기조",
    "L1-5": "주력 산업 도메인",
    "2-1-1": "직전 12개월 자발적 이직률",
    "2-1-2": "직전 12개월 핵심 인재 이탈",
    "2-1-3": "신규 입사자 1년 내 조기 퇴사 비율",
    "2-1-4": "핵심 인재 식별 기준",
    "2-1-5": "핵심 포스트 대체 계획",
    "2-2-1": "핵심 포지션 평균 채용 소요 기간",
    "2-2-2": "주력 채용 채널 수",
    "2-2-3": "최종 면접 후 입사 거절 경험",
    "2-2-4": "채용 브랜딩 자산",
    "2-2-5": "온보딩 적응 추적",
    "2-3-1": "보상 철학의 무게중심",
    "2-3-2": "금전 보상 구조 유형",
    "2-3-2-detail": "보상 비율 정량 (선택)",
    "2-3-3": "매출 대비 인건비 비중",
    "2-3-4": "지난 12개월 인건비 증가율",
    "2-3-5": "시장 대비 보상 위치",
    "2-3-6": "복리후생 수준",
    "2-4-1a": "평가 주기",
    "2-4-1b": "평가 주체",
    "2-4-1c": "평가 지표 성격",
    "2-4-1d": "피드백 및 수용성 관리",
    "2-4-2": "평가-보상 연동 수준",
    "2-4-3-ceo": "대표 인식 공정성",
    "2-4-3-employee": "직원 예상 공정성",
    "2-4-4": "리더급 비전 공감도",
    "2-4-5": "평가 운영 데이터 트래킹",
    "2-5-1": "리더의 부정적 피드백 역량",
    "2-5-2": "팀장급 정기 1:1 면담 운영",
    "2-5-3": "정기 1:1 면담 데이터 관리",
    "2-5-4": "실무진 채용 최종 승인자",
    "2-5-5": "신규 기능 배포 의사결정",
    "2-5-6": "핵심가치 작동 여부",
}

LAYER_0_VARIABLES = [
    replace(variable, short_label=SHORT_LABELS_BY_ID.get(variable.id, variable.short_label))
    for variable in LAYER_0_VARIABLES
]
LAYER_1_VARIABLES = [
    replace(variable, short_label=SHORT_LABELS_BY_ID.get(variable.id, variable.short_label))
    for variable in LAYER_1_VARIABLES
]
LAYER_2_VARIABLES = [
    replace(variable, short_label=SHORT_LABELS_BY_ID.get(variable.id, variable.short_label))
    for variable in LAYER_2_VARIABLES
]

ALL_VARIABLES: list[Variable] = LAYER_0_VARIABLES + LAYER_1_VARIABLES + LAYER_2_VARIABLES

VARIABLES_BY_ID: dict[str, Variable] = {v.id: v for v in ALL_VARIABLES}


def get_variable(variable_id: str) -> Variable:
    """변수 ID로 정의 조회."""
    if variable_id not in VARIABLES_BY_ID:
        raise KeyError(f"Unknown variable ID: {variable_id}")
    return VARIABLES_BY_ID[variable_id]


def get_variables_by_layer(layer: str) -> list[Variable]:
    """Layer ID로 변수 목록 반환."""
    return [v for v in ALL_VARIABLES if v.layer == layer]


def get_variables_by_sub_category(sub_category: str) -> list[Variable]:
    """Sub-category에 속한 변수 목록 반환."""
    return [v for v in LAYER_2_VARIABLES if v.sub_category == sub_category]


def get_missing_required_fields(responses: dict, layer: str) -> list[Variable]:
    """
    특정 layer에서 응답이 누락된 필수 변수 목록을 반환한다.

    PERCENT_SPLIT은 선택 입력이므로 검증에서 제외하고, 조건부 변수는
    표시 조건을 만족할 때만 필수 항목으로 본다.
    """
    target_variables = [variable for variable in ALL_VARIABLES if variable.layer == layer]
    missing: list[Variable] = []

    for variable in target_variables:
        if variable.input_type == InputType.PERCENT_SPLIT:
            continue
        if not _should_validate(variable, responses):
            continue

        value = responses.get(variable.id)
        if _is_empty(value, variable.input_type):
            missing.append(variable)

    return missing


def _should_validate(variable: Variable, responses: dict) -> bool:
    """조건부 변수가 검증 대상인지 판정한다."""
    if variable.id == "2-4-5":
        return responses.get("2-4-1a") != "운영하지 않음"
    if variable.id == "2-5-3":
        return responses.get("2-5-2") != "운영 안 함"
    return True


def _is_empty(value, input_type: InputType) -> bool:
    """값이 미입력 상태인지 판정한다."""
    if value is None:
        return True
    if input_type == InputType.MULTI_SELECT:
        return not isinstance(value, list) or len(value) == 0
    if input_type == InputType.SINGLE_SELECT:
        return value == ""
    if input_type in (
        InputType.SLIDER_5,
        InputType.SLIDER_10,
        InputType.SLIDER_RATIO,
        InputType.NUMBER,
    ):
        return value is None
    return False


def get_question_number(variable_id: str) -> int:
    """변수의 전체 순서 번호."""
    for i, var in enumerate(QUESTION_VARIABLES, start=1):
        if var.id == variable_id:
            return i
    return 0


QUESTION_VARIABLES: list[Variable] = [
    v for v in ALL_VARIABLES if v.input_type != InputType.PERCENT_SPLIT
]

TOTAL_QUESTIONS = len(QUESTION_VARIABLES)


# ============================================================
# 페인포인트 → 매트릭스 A Y축 점수 매핑 (As-Is 계산용)
# ============================================================

PAIN_POINT_Y_VALUES: dict[str, float] = {
    "무임승차자(저성과자) 방치로 인한 핵심 인재의 의욕 저하 및 이탈": 0.15,
    "기존 멤버와 신규 합류 멤버(고연봉자) 간의 보상 역전 및 갈등": 0.65,
    "평가 철학 부재로 인한 '나눠먹기식(N빵)' 등급 부여와 공정성 시비": 0.25,
    "실무 에이스가 리더(팀장)가 된 후 발생하는 리더십 공백 및 팀 붕괴": 0.5,
    "부서 간 이기주의(Silo) 심화 및 책임 떠넘기기": 0.85,
    "창업자/C-레벨의 마이크로매니징 및 일관성 없는 인사 개입": 0.5,
    "예측 불가능한 인건비 상승 및 보상 재원 부족": 0.5,
    "체계적인 온보딩 부재로 인한 신규 입사자의 높은 조기 퇴사율": 0.5,
}


# ============================================================
# 가시성 지수 — 정량 항목 정의
# ============================================================

# 항상 분모에 포함되는 8개
VISIBILITY_BASE_ITEMS: list[str] = [
    "2-1-1",
    "2-1-2",
    "2-1-3",
    "2-1-4",
    "2-2-1",
    "2-2-5",
    "2-3-2",   # 0.5점/1점 가능
    "2-3-3",
    "2-3-4",
    "2-3-5",
]

# 조건부 항목 (해당 제도 운영 중일 때만 분모 포함)
VISIBILITY_CONDITIONAL_ITEMS: dict[str, dict] = {
    "2-4-5": {
        "depends_on": "2-4-1a",
        "excluded_value": "운영하지 않음",  # 2-4-1a가 "운영하지 않음"이면 분모에서 제외
    },
    "2-5-3": {
        "depends_on": "2-5-2",
        "excluded_value": "운영 안 함",
    },
}


def is_unknown_response(variable_id: str, response: str) -> bool:
    """응답이 '모름' 계열인지 판정."""
    variable = get_variable(variable_id)
    if variable.unknown_option is None:
        return False
    return response == variable.unknown_option


# ============================================================
# 검증 — 모듈 로드 시 자동 실행
# ============================================================

def _validate() -> None:
    """변수 정의 일관성 검증."""
    # 변수 ID 중복 검사
    ids = [v.id for v in ALL_VARIABLES]
    if len(ids) != len(set(ids)):
        duplicates = [x for x in ids if ids.count(x) > 1]
        raise ValueError(f"Duplicate variable IDs: {set(duplicates)}")

    # 페인포인트 매핑 일치 검사
    for pp in PAIN_POINTS:
        if pp not in PAIN_POINT_Y_VALUES:
            raise ValueError(f"PAIN_POINT_Y_VALUES에 '{pp}' 누락")

    missing_short_labels = [variable.id for variable in ALL_VARIABLES if not variable.short_label]
    if missing_short_labels:
        raise ValueError(f"Missing short_label: {missing_short_labels}")


_validate()
