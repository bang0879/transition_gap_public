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
    SLIDER_RATIO = "slider_ratio"        # 0~1 비율 슬라이더
    NUMBER = "number"                    # 숫자 입력
    PERCENT_SPLIT = "percent_split"      # 비율 분배 (보상 구조 2단계)


@dataclass(frozen=True)
class Variable:
    """진단 변수 정의."""
    id: str                              # "L1-1", "2-3-2" 등
    layer: str                           # "L1" 또는 "L2"
    sub_category: Optional[str]          # "2-1", "2-2" 등 (Layer 2만)
    label: str                           # 한국어 질문 텍스트
    input_type: InputType
    options: list[str] = field(default_factory=list)
    helper_text: str = ""                # 변수 아래 안내 문구
    is_quantitative: bool = False        # 가시성 지수 계산 대상
    unknown_option: Optional[str] = None # "모름 / 측정 안 함" 등 (있을 경우)
    max_select: Optional[int] = None     # multi_select 시 최대 개수
    short_label: str = ""                # 미입력 안내용 짧은 라벨


# ============================================================
# Layer 1: 조직 컨텍스트 (5개 변수)
# ============================================================

PAIN_POINTS = [
    "우수인재 채용 난항",
    "핵심인재의 잦은 이탈",
    "인건비 상승 부담",
    "평가의 공정성 불만",
    "팀 간 이기주의(Silo) 및 소통 단절",
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
        options=["20인 이하", "20~50인", "50~100인", "100인 초과"],
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
            "AI / 데이터",
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

    # --- 2-3. 총보상 갭 ---
    Variable(
        id="2-3-1",
        layer="L2",
        sub_category="2-3",
        label="보상 철학의 무게중심은? (1=비금전적 가치, 5=금전적 보상)",
        input_type=InputType.SLIDER_5,
        helper_text="우수인재를 무엇으로 설득하시나요? 비전·자율성·성장 vs 금전적 보상.",
    ),
    Variable(
        id="2-3-2",
        layer="L2",
        sub_category="2-3",
        label="금전 보상 구조의 아키타입은? (1단계 — 필수)",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "현금 안정형 (기본급 압도적 위주)",
            "단기 성과형 (기본급 + 높은 비중의 연간/분기 인센티브)",
            "장기 비전형 (기본급 + 스톡옵션/RSU 등 지분 보상 적극 활용)",
            "혼합형 (위 세 가지가 직급별/직군별로 다름)",
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
        label="복리후생(휴가·간식·교육비 등) 및 직급/호칭 체계의 수준은 동종업계 대비 어떻습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["상", "중", "하"],
    ),

    # --- 2-4. 평가 및 수용성 갭 ---
    Variable(
        id="2-4-1",
        layer="L2",
        sub_category="2-4",
        label="현재 평가 방식은?",
        input_type=InputType.SINGLE_SELECT,
        options=["없음", "비공식", "정기 운영"],
    ),
    Variable(
        id="2-4-2",
        layer="L2",
        sub_category="2-4",
        label="평가 결과와 보상의 연동 수준은? (1=완전 분리, 5=강력한 연동)",
        input_type=InputType.SLIDER_5,
    ),
    Variable(
        id="2-4-3-ceo",
        layer="L2",
        sub_category="2-4",
        label="대표님이 생각하는 우리 평가 제도의 공정성은? (5점 만점)",
        input_type=InputType.SLIDER_5,
    ),
    Variable(
        id="2-4-3-employee",
        layer="L2",
        sub_category="2-4",
        label="블라인드/잡플래닛에서 직원들은 몇 점을 줄 것이라 예상하십니까? (5점 만점)",
        input_type=InputType.SLIDER_5,
        helper_text="이 차이가 CEO 인식과 현장 인식의 갭을 보여줍니다.",
    ),
    Variable(
        id="2-4-4",
        layer="L2",
        sub_category="2-4",
        label="회사의 장기 비전과 목표에 대해 리더급 이상은 얼마나 공감하고 있습니까? (5점 만점)",
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
        # 조건부: 2-4-1 != "없음"일 때만 표시
    ),

    # --- 2-5. 리더십 및 거버넌스 갭 ---
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
        label="팀장급 리더들이 분기 1회 이상 정기 1on1을 운영합니까?",
        input_type=InputType.SINGLE_SELECT,
        options=["운영함", "일부 운영", "운영 안 함"],
    ),
    Variable(
        id="2-5-3",
        layer="L2",
        sub_category="2-5",
        label="리더들의 실제 1on1 운영 주기와 완료율 데이터를 기록·관리하고 있습니까?",
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
        label="우리 회사의 핵심가치는 채용과 평가의 명확한 '거절/감점' 기준으로 작동하고 있습니까?",
        input_type=InputType.SINGLE_SELECT,
        options=[
            "문서로만 존재함",
            "일부 참고함",
            "명확한 기준으로 작동함",
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
    "2-5": "리더십 및 거버넌스 갭",
}


# ============================================================
# 전체 변수 통합 + 조회 헬퍼
# ============================================================

SHORT_LABELS_BY_ID: dict[str, str] = {
    "L1-1": "가장 시급한 HR 페인포인트",
    "L1-2": "총 인원수",
    "L1-3": "조직 의사결정 구조",
    "L1-4": "향후 12개월 채용 기조",
    "L1-5": "주력 산업 도메인",
    "2-1-1": "직전 12개월 자발적 이직률",
    "2-1-2": "직전 12개월 핵심 인재 이탈",
    "2-1-3": "신규 입사자 1년 내 조기 퇴사 비율",
    "2-2-1": "핵심 포지션 평균 채용 소요 기간",
    "2-2-2": "주력 채용 채널 수",
    "2-2-3": "최종 면접 후 입사 거절 경험",
    "2-3-1": "보상 철학의 무게중심",
    "2-3-2": "금전 보상 구조 아키타입",
    "2-3-2-detail": "보상 비율 정량 (선택)",
    "2-3-3": "매출 대비 인건비 비중",
    "2-3-4": "지난 12개월 인건비 증가율",
    "2-3-5": "시장 대비 보상 위치",
    "2-3-6": "복리후생/타이틀 수준",
    "2-4-1": "현재 평가 방식",
    "2-4-2": "평가-보상 연동 수준",
    "2-4-3-ceo": "대표 인식 공정성",
    "2-4-3-employee": "직원 예상 공정성",
    "2-4-4": "리더급 비전 공감도",
    "2-4-5": "평가 운영 데이터 트래킹",
    "2-5-1": "리더의 부정적 피드백 역량",
    "2-5-2": "팀장급 정기 1on1 운영",
    "2-5-3": "1on1 운영 데이터 관리",
    "2-5-4": "실무진 채용 최종 승인자",
    "2-5-5": "신규 기능 배포 의사결정",
    "2-5-6": "핵심가치 작동 여부",
}

LAYER_1_VARIABLES = [
    replace(variable, short_label=SHORT_LABELS_BY_ID.get(variable.id, variable.short_label))
    for variable in LAYER_1_VARIABLES
]
LAYER_2_VARIABLES = [
    replace(variable, short_label=SHORT_LABELS_BY_ID.get(variable.id, variable.short_label))
    for variable in LAYER_2_VARIABLES
]

ALL_VARIABLES: list[Variable] = LAYER_1_VARIABLES + LAYER_2_VARIABLES

VARIABLES_BY_ID: dict[str, Variable] = {v.id: v for v in ALL_VARIABLES}


def get_variable(variable_id: str) -> Variable:
    """변수 ID로 정의 조회."""
    if variable_id not in VARIABLES_BY_ID:
        raise KeyError(f"Unknown variable ID: {variable_id}")
    return VARIABLES_BY_ID[variable_id]


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
        return responses.get("2-4-1") != "없음"
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
    if input_type in (InputType.SLIDER_5, InputType.SLIDER_RATIO, InputType.NUMBER):
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
    "팀 간 이기주의(Silo) 및 소통 단절": 0.85,
    "평가의 공정성 불만": 0.65,
    "우수인재 채용 난항": 0.5,
    "인건비 상승 부담": 0.5,
    "핵심인재의 잦은 이탈": 0.15,
}


# ============================================================
# 가시성 지수 — 정량 항목 정의
# ============================================================

# 항상 분모에 포함되는 8개
VISIBILITY_BASE_ITEMS: list[str] = [
    "2-1-1",
    "2-1-2",
    "2-1-3",
    "2-2-1",
    "2-3-2",   # 0.5점/1점 가능
    "2-3-3",
    "2-3-4",
    "2-3-5",
]

# 조건부 항목 (해당 제도 운영 중일 때만 분모 포함)
VISIBILITY_CONDITIONAL_ITEMS: dict[str, dict] = {
    "2-4-5": {
        "depends_on": "2-4-1",
        "excluded_value": "없음",  # 2-4-1이 "없음"이면 분모에서 제외
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


def _validate_widget_keys() -> None:
    """Validate Streamlit widget keys at module load."""
    keys = []
    for variable in ALL_VARIABLES:
        keys.append(f"input_{variable.id}")
        if variable.input_type == InputType.PERCENT_SPLIT:
            keys.extend(
                [
                    f"input_{variable.id}_base",
                    f"input_{variable.id}_performance",
                    f"input_{variable.id}_equity",
                ]
            )

    duplicates = [key for key in keys if keys.count(key) > 1]
    if duplicates:
        raise ValueError(f"Duplicate widget keys: {set(duplicates)}")


_validate()
_validate_widget_keys()
