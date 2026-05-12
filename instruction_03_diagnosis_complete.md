# 작업 지시서 #03 — Layer 2 폼 + 가시성 지수 + 진단 결과 페이지

**작업 대상**: Codex 데스크탑 앱
**예상 소요**: 3\~4시간
**전제**: #02 완료 (variables.py SSOT, Layer 1 폼, SQLite 골격 작동)

\---

## 작업 목표

진단 모듈 100% 완성. 이 세션 끝나면:

1. Layer 2 폼 작동 (21개 변수, 5개 sub-category, 조건부 표시 포함)
2. 가시성 지수 자동 계산 + 결과 표시
3. 진단 결과 페이지 렌더링 (가시성 지수 시각화 포함)
4. SQLite 저장 통합 (Layer 1 + 2 응답 모두 저장)
5. 사이드바 진행 단계 자동 업데이트

\---

## 핵심 원칙

### 원칙 1. SSOT 재활용

모든 변수는 `variables.py`에서 import. 폼 코드에 변수 정의 하드코딩 금지.

### 원칙 2. 조건부 표시

* **2-4-5**: 2-4-1 = "없음"이면 표시 안 함, 가시성 지수 분모 제외
* **2-5-3**: 2-5-2 = "운영 안 함"이면 표시 안 함, 가시성 지수 분모 제외
* **2-3-2 정량 (2-3-2-detail)**: 항상 선택 입력, 미입력 시 가시성 0.5점

### 원칙 3. UX

* 5개 sub-category를 `st.expander`로 묶음 (한 화면에 다 노출 X)
* 각 expander 기본 펼침 상태
* 진행 표시: *"전환 갭 진단 (3/5 sub-category 입력 중)"*

\---

## 작업 단계

### Step 1. `src/diagnosis/visibility\_index.py` (45분)

가시성 지수 계산 모듈. 진단 결과 페이지의 시그니처 IP.

```python
"""
HR 데이터 가시성 지수 (Visibility Index) — 시그니처 IP.

계산 로직:
- 기본 8개 항목 (항상 분모)
- 조건부 2개 항목 (해당 제도 운영 중일 때만 분모)
- 점수: 측정 = 1, 모름 = 0
- 2-3-2: 아키타입만 = 0.5, 아키타입 + 정량 = 1.0
"""
from \_\_future\_\_ import annotations

from dataclasses import dataclass

from src.diagnosis.variables import (
    UNKNOWN,
    VISIBILITY\_BASE\_ITEMS,
    VISIBILITY\_CONDITIONAL\_ITEMS,
    get\_variable,
    is\_unknown\_response,
)


@dataclass
class VisibilityResult:
    """가시성 지수 계산 결과."""
    score: float                    # 0\~100
    numerator: float                # 측정 중 점수 합
    denominator: int                # 8 / 9 / 10
    blind\_spots: list\[str]          # 미측정 항목 ID 리스트
    blind\_spot\_labels: list\[str]    # 사용자 표시용 라벨

    @property
    def tier(self) -> str:
        """진단 분기 tier."""
        if self.score < 40:
            return "low"          # 정량 시뮬레이션 보류
        elif self.score < 60:
            return "medium\_low"   # 데이터 회복 1단계 권고
        elif self.score < 70:
            return "medium"       # 시뮬레이션 신뢰도 중간
        else:
            return "high"         # 시뮬레이션 신뢰도 높음

    @property
    def tier\_message(self) -> str:
        """tier별 안내 메시지."""
        messages = {
            "low": (
                "⚠ 데이터 가시성이 매우 낮습니다. 정량 시뮬레이션은 보류하고, "
                "정성 권고와 데이터 인프라 구축을 우선합니다."
            ),
            "medium\_low": (
                "데이터 가시성이 부족합니다. 본격 진단에 앞서 데이터 가시성 회복을 "
                "1단계 권고로 제시합니다."
            ),
            "medium": (
                "데이터 가시성이 중간 수준입니다. 시뮬레이션 결과의 신뢰구간을 "
                "보수적으로 적용합니다."
            ),
            "high": (
                "데이터 가시성이 양호합니다. 시뮬레이션 결과를 높은 신뢰도로 "
                "활용할 수 있습니다."
            ),
        }
        return messages\[self.tier]


def calculate\_visibility\_index(responses: dict) -> VisibilityResult:
    """
    가시성 지수 계산.

    Args:
        responses: 진단 응답 딕셔너리.

    Returns:
        VisibilityResult.
    """
    # 분모 결정
    all\_items = list(VISIBILITY\_BASE\_ITEMS)

    for item\_id, condition in VISIBILITY\_CONDITIONAL\_ITEMS.items():
        depends\_on = condition\["depends\_on"]
        excluded\_value = condition\["excluded\_value"]
        if responses.get(depends\_on) != excluded\_value:
            all\_items.append(item\_id)

    denominator = len(all\_items)

    # 점수 계산
    numerator = 0.0
    blind\_spots = \[]
    blind\_spot\_labels = \[]

    for item\_id in all\_items:
        score = \_score\_item(item\_id, responses)
        numerator += score
        if score < 1.0:
            blind\_spots.append(item\_id)
            blind\_spot\_labels.append(\_get\_short\_label(item\_id))

    visibility\_score = (numerator / denominator) \* 100 if denominator > 0 else 0.0

    return VisibilityResult(
        score=round(visibility\_score, 1),
        numerator=numerator,
        denominator=denominator,
        blind\_spots=blind\_spots,
        blind\_spot\_labels=blind\_spot\_labels,
    )


def \_score\_item(item\_id: str, responses: dict) -> float:
    """개별 항목 점수 (0.0, 0.5, 1.0)."""
    response = responses.get(item\_id)
    if response is None:
        return 0.0

    # 2-3-2: 아키타입 + 정량 분리 처리
    if item\_id == "2-3-2":
        archetype = responses.get("2-3-2")
        if archetype is None:
            return 0.0

        # 정량 입력 확인 (2-3-2-detail)
        detail = responses.get("2-3-2-detail")
        if detail and isinstance(detail, dict):
            has\_quantitative = any(v > 0 for v in detail.values())
            return 1.0 if has\_quantitative else 0.5
        return 0.5

    # 일반 항목: 모름이면 0, 아니면 1
    return 0.0 if is\_unknown\_response(item\_id, response) else 1.0


def \_get\_short\_label(item\_id: str) -> str:
    """가시성 리포트용 짧은 라벨."""
    labels = {
        "2-1-1": "자발적 이직률",
        "2-1-2": "핵심 인재 이탈",
        "2-1-3": "신규 입사자 조기 퇴사율",
        "2-2-1": "채용 소요 기간",
        "2-3-2": "보상 구조 정량 비율",
        "2-3-3": "매출 대비 인건비 비중",
        "2-3-4": "인건비 증가율",
        "2-3-5": "시장 대비 보상 위치",
        "2-4-5": "평가 운영 데이터",
        "2-5-3": "1on1 운영 데이터",
    }
    return labels.get(item\_id, item\_id)
```

**검증**:

```powershell
python -c "
from src.diagnosis.visibility\_index import calculate\_visibility\_index
test\_responses = {
    '2-1-1': '10% 미만',
    '2-1-2': '없음',
    '2-1-3': '모름 / 측정 안 함',
    '2-2-1': '2\~4개월',
    '2-3-2': '단기 성과형 (기본급 + 높은 비중의 연간/분기 인센티브)',
    '2-3-3': '20\~35%',
    '2-3-4': '모름 / 측정 안 함',
    '2-3-5': '중위',
    '2-4-1': '정기 운영',
    '2-4-5': '알고 있음',
    '2-5-2': '일부 운영',
    '2-5-3': '기록·관리 안 함',
}
result = calculate\_visibility\_index(test\_responses)
print(f'Score: {result.score}%')
print(f'Denominator: {result.denominator}')
print(f'Blind spots: {result.blind\_spot\_labels}')
print(f'Tier: {result.tier}')
"
```

기대 출력:

```
Score: 65.0%
Denominator: 10
Blind spots: \['신규 입사자 조기 퇴사율', '보상 구조 정량 비율', '인건비 증가율', '1on1 운영 데이터']
Tier: medium
```

\---

### Step 2. `src/diagnosis/form\_layer2.py` (90분)

```python
"""
Layer 2 입력 폼 — 전환 갭 (21개 변수, 5개 sub-category).

조건부 표시 처리:
- 2-4-5: 2-4-1 != "없음"일 때만
- 2-5-3: 2-5-2 != "운영 안 함"일 때만
"""
from \_\_future\_\_ import annotations

import streamlit as st

from src.diagnosis.variables import (
    SUB\_CATEGORY\_LABELS,
    InputType,
    Variable,
    get\_variables\_by\_sub\_category,
)


def render\_layer2\_form() -> bool:
    """
    Layer 2 폼 렌더링.

    Returns:
        모든 필수 입력 완료 시 True.
    """
    st.markdown("## Layer 2. 전환 갭 진단")
    st.caption("조직의 인사제도 정합성 — 약 25\~35분 소요")

    responses = st.session\_state.responses

    # 5개 sub-category 순차 렌더링
    sub\_categories = \["2-1", "2-2", "2-3", "2-4", "2-5"]
    completed\_count = 0

    for sub\_cat in sub\_categories:
        is\_complete = \_render\_sub\_category(sub\_cat, responses)
        if is\_complete:
            completed\_count += 1

    # 진행 상황 표시
    st.markdown("---")
    st.markdown(f"\*\*진행 상황\*\*: {completed\_count} / 5 sub-category 완료")

    is\_all\_complete = completed\_count == 5

    if not is\_all\_complete:
        st.info("모든 sub-category를 완료하면 진단 결과를 확인할 수 있습니다.")

    return is\_all\_complete


def \_render\_sub\_category(sub\_cat: str, responses: dict) -> bool:
    """단일 sub-category 렌더링. 완료 여부 반환."""
    label = SUB\_CATEGORY\_LABELS\[sub\_cat]
    variables = get\_variables\_by\_sub\_category(sub\_cat)

    with st.expander(f"\*\*{sub\_cat}. {label}\*\*", expanded=True):
        for var in variables:
            # 조건부 표시 검사
            if not \_should\_render(var, responses):
                continue

            \_render\_variable(var, responses)

    return \_is\_sub\_category\_complete(sub\_cat, responses)


def \_should\_render(var: Variable, responses: dict) -> bool:
    """변수의 조건부 표시 여부 판정."""
    if var.id == "2-4-5":
        return responses.get("2-4-1") != "없음"
    if var.id == "2-5-3":
        return responses.get("2-5-2") != "운영 안 함"
    return True


def \_render\_variable(var: Variable, responses: dict) -> None:
    """개별 변수 렌더링."""
    st.markdown(f"\*\*{var.label}\*\*")
    if var.helper\_text:
        st.caption(var.helper\_text)

    key = f"input\_{var.id}"

    if var.input\_type == InputType.SINGLE\_SELECT:
        current = responses.get(var.id)
        index = var.options.index(current) if current in var.options else 0
        value = st.radio(
            label=var.label,
            options=var.options,
            index=index if current else None,
            key=key,
            label\_visibility="collapsed",
        )
        responses\[var.id] = value



current = responses.get(var.id)

if current in var.options:

&#x20;   index = var.options.index(current)

else:

&#x20;   index = None

value = st.radio(

&#x20;   label=var.label,

&#x20;   options=var.options,

&#x20;   index=index,

&#x20;   key=key,

&#x20;   label\_visibility="collapsed",

)

responses\[var.id] = value

    elif var.input\_type == InputType.SLIDER\_5:
        current = responses.get(var.id, 3)
        value = st.slider(
            label=var.label,
            min\_value=1,
            max\_value=5,
            value=current,
            key=key,
            label\_visibility="collapsed",
        )
        responses\[var.id] = value

    elif var.input\_type == InputType.PERCENT\_SPLIT:
        # 2-3-2-detail 전용
        st.caption("선택 입력 — 합계 100% 안 맞아도 진행 가능")
        col1, col2, col3 = st.columns(3)
        current = responses.get(var.id, {"base": 0, "performance": 0, "equity": 0})

        with col1:
            base = st.number\_input(
                "기본급 (%)", min\_value=0, max\_value=100, value=current.get("base", 0),
                key=f"{key}\_base",
            )
        with col2:
            performance = st.number\_input(
                "성과급 (%)", min\_value=0, max\_value=100, value=current.get("performance", 0),
                key=f"{key}\_performance",
            )
        with col3:
            equity = st.number\_input(
                "지분보상 (%)", min\_value=0, max\_value=100, value=current.get("equity", 0),
                key=f"{key}\_equity",
            )

        responses\[var.id] = {
            "base": base,
            "performance": performance,
            "equity": equity,
        }

        total = base + performance + equity
        if total > 0:
            st.caption(f"입력 합계: {total}%")

    st.markdown("")  # 여백


def \_is\_sub\_category\_complete(sub\_cat: str, responses: dict) -> bool:
    """sub-category 완료 여부 검증."""
    variables = get\_variables\_by\_sub\_category(sub\_cat)

    for var in variables:
        # 조건부 미표시 변수는 검증에서 제외
        if not \_should\_render(var, responses):
            continue

        # 선택 입력 변수 (2-3-2-detail)는 검증 제외
        if var.input\_type == InputType.PERCENT\_SPLIT:
            continue

        value = responses.get(var.id)
        if value is None or value == "":
            return False

    return True
```

\---

### Step 3. `src/diagnosis/result\_page.py` (60분)

가시성 지수 시각화 + 진단 결과 페이지.

```python
"""
진단 결과 페이지 — 가시성 지수 시각화.

리포트 첫 페이지의 시그니처 시각화.
"""
from \_\_future\_\_ import annotations

import plotly.graph\_objects as go
import streamlit as st

from src.diagnosis.visibility\_index import VisibilityResult, calculate\_visibility\_index
from src.theme import COLORS


def render\_diagnosis\_result() -> None:
    """진단 결과 페이지 렌더링."""
    responses = st.session\_state.get("responses", {})

    if not responses:
        st.warning("진단 응답이 없습니다. Layer 1부터 시작해 주세요.")
        return

    # 가시성 지수 계산
    result = calculate\_visibility\_index(responses)

    st.markdown("## 진단 결과")
    st.caption("입력하신 데이터를 바탕으로 분석한 1차 진단입니다.")
    st.markdown("---")

    # ============================================================
    # 첫 번째 섹션: 가시성 지수
    # ============================================================
    st.markdown("### HR 데이터 가시성")

    col1, col2 = st.columns(\[1, 2])

    with col1:
        \_render\_visibility\_gauge(result)

    with col2:
        \_render\_visibility\_details(result)

    st.markdown("---")

    # ============================================================
    # 두 번째 섹션: 시그니처 메시지
    # ============================================================
    st.markdown(
        """
        > \*\*AI 시대 조직 재설계의 첫 단계는 사각지대를 데이터로 비추는 것입니다.\*\*
        >
        > 누더기 위에 AI를 얹으면 조직 생산성은 오르지 않습니다.
        > 인사제도 정합성 회복이 먼저입니다.
        """
    )

    st.markdown("---")

    # ============================================================
    # 다음 안내 — 클라이언트 흐름의 종료점
    # ============================================================
    st.info(
        "\*\*입력을 완료해 주셔서 감사합니다.\*\*\\n\\n"
        "입력하신 데이터를 바탕으로 전문가가 심층 분석하여 "
        "맞춤형 리포트를 N일 내에 전달해 드립니다."
    )


def \_render\_visibility\_gauge(result: VisibilityResult) -> None:
    """가시성 지수 게이지 시각화."""
    # 색상: tier 기반
    color\_map = {
        "low": COLORS\["danger"],       # 파스텔 핑크
        "medium\_low": COLORS\["warning"],  # 머스타드
        "medium": COLORS\["accent"],    # 코랄
        "high": COLORS\["success"],     # 민트
    }
    color = color\_map\[result.tier]

    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=result.score,
        number={"suffix": "%", "font": {"size": 48, "color": COLORS\["text\_primary"]}},
        gauge={
            "axis": {"range": \[0, 100], "tickwidth": 1, "tickcolor": COLORS\["text\_secondary"]},
            "bar": {"color": color, "thickness": 0.7},
            "bgcolor": COLORS\["surface"],
            "borderwidth": 0,
            "steps": \[
                {"range": \[0, 40], "color": "#FAEAEC"},
                {"range": \[40, 60], "color": "#FAF1E0"},
                {"range": \[60, 70], "color": "#FAE8D9"},
                {"range": \[70, 100], "color": "#E5F0E6"},
            ],
        },
    ))

    fig.update\_layout(
        height=300,
        margin=dict(l=20, r=20, t=40, b=20),
    )

    st.plotly\_chart(fig, use\_container\_width=True)


def \_render\_visibility\_details(result: VisibilityResult) -> None:
    """가시성 지수 상세 정보."""
    st.markdown(f"\*\*측정 중\*\*: {int(result.numerator \* 10) / 10} / {result.denominator}개 핵심 지표")

    # tier 메시지
    if result.tier in ("low", "medium\_low"):
        st.warning(result.tier\_message)
    elif result.tier == "medium":
        st.info(result.tier\_message)
    else:
        st.success(result.tier\_message)

    # 사각지대 목록
    if result.blind\_spot\_labels:
        st.markdown("\*\*사각지대 (미측정 영역)\*\*:")
        for label in result.blind\_spot\_labels:
            st.markdown(f"- {label}")
    else:
        st.markdown("\*\*모든 핵심 지표가 측정되고 있습니다.\*\* 🎯")
```

\---

### Step 4. `app.py` 통합 업데이트 (30분)

기존 `app.py`를 다음과 같이 업데이트. Layer 2 + 결과 페이지 라우팅 추가.

```python
"""
Transition Gap — Streamlit 진입점
"""
import streamlit as st

from src.database import init\_db, save\_session
from src.diagnosis.form\_layer1 import render\_layer1\_form
from src.diagnosis.form\_layer2 import render\_layer2\_form
from src.diagnosis.result\_page import render\_diagnosis\_result

st.set\_page\_config(
    page\_title="Transition Gap",
    page\_icon="🧭",
    layout="wide",
    initial\_sidebar\_state="expanded",
)

init\_db()


# ============================================================
# 사이드바
# ============================================================

def render\_sidebar() -> str:
    with st.sidebar:
        st.markdown("### Transition Gap")
        st.caption("AI 시대 한국 스타트업 인사제도 진단/설계 도구")
        st.markdown("---")

        if "current\_step" not in st.session\_state:
            st.session\_state.current\_step = "layer1"
        if "session\_id" not in st.session\_state:
            st.session\_state.session\_id = None

        st.markdown("#### 진단 단계")
        steps = \[
            ("layer1", "1. 조직 컨텍스트"),
            ("layer2", "2. 전환 갭 진단"),
            ("result", "3. 진단 결과"),
        ]
        for step\_id, step\_label in steps:
            if step\_id == st.session\_state.current\_step:
                st.markdown(f"\*\*▶ {step\_label}\*\*")
            else:
                st.markdown(f"  {step\_label}")

    return st.session\_state.current\_step


# ============================================================
# 단계 이동 헬퍼
# ============================================================

def save\_and\_advance(next\_step: str) -> None:
    """현재 응답을 DB에 저장하고 다음 단계로 이동."""
    session\_id = save\_session(
        responses=st.session\_state.responses,
        current\_step=next\_step,
        session\_id=st.session\_state.session\_id,
    )
    st.session\_state.session\_id = session\_id
    st.session\_state.current\_step = next\_step
    st.rerun()


# ============================================================
# 메인
# ============================================================

def main() -> None:
    current\_step = render\_sidebar()

    st.title("Transition Gap")
    st.caption("AI 시대 한국 스타트업 인사제도 진단/설계 도구")
    st.markdown("---")

    if current\_step == "layer1":
        is\_complete = render\_layer1\_form()

        col1, col2, col3 = st.columns(\[1, 1, 1])
        with col3:
            if st.button(
                "다음: Layer 2 →",
                disabled=not is\_complete,
                use\_container\_width=True,
                type="primary",
            ):
                save\_and\_advance("layer2")

    elif current\_step == "layer2":
        is\_complete = render\_layer2\_form()

        col1, col2, col3 = st.columns(\[1, 1, 1])
        with col1:
            if st.button("← Layer 1로", use\_container\_width=True):
                save\_and\_advance("layer1")
        with col3:
            if st.button(
                "진단 결과 보기 →",
                disabled=not is\_complete,
                use\_container\_width=True,
                type="primary",
            ):
                save\_and\_advance("result")

    elif current\_step == "result":
        render\_diagnosis\_result()

        col1, col2, col3 = st.columns(\[1, 1, 1])
        with col1:
            if st.button("← Layer 2로 돌아가기", use\_container\_width=True):
                save\_and\_advance("layer2")


if \_\_name\_\_ == "\_\_main\_\_":
    main()
```

\---

### Step 5. 통합 테스트 (30분)

```powershell
streamlit run app.py
```

전체 흐름 검증:

1. Layer 1 입력 → 다음 버튼 활성화 → 클릭 → Layer 2 진입
2. Layer 2 — 5개 sub-category expander 모두 표시
3. 2-4-1 = "없음" 선택 시 → 2-4-5 안 보임
4. 2-5-2 = "운영 안 함" 선택 시 → 2-5-3 안 보임
5. 2-3-2-detail 선택 입력 (생략 가능)
6. 모든 sub-category 완료 → 진단 결과 보기 버튼 활성화
7. 진단 결과 페이지 — 가시성 지수 게이지 + 사각지대 목록 표시
8. 사이드바 진행 단계 동적 업데이트
9. Layer 1 ↔ Layer 2 이동 시 입력값 유지

**SQLite 검증**:

```powershell
python -c "
import sqlite3
conn = sqlite3.connect('data/transition\_gap.db')
rows = conn.execute('SELECT id, current\_step, length(responses) FROM sessions').fetchall()
print(rows)
"
```

세션 데이터가 저장되어 있어야 함.

\---

### Step 6. 의사결정 로그 업데이트 + Git 커밋 (15분)

`docs/decisions.md`에 추가:

```markdown
## 2026-05-XX: Layer 2 + 가시성 지수 빌드 완료

- 21개 변수 5개 sub-category 작동
- 조건부 표시 (2-4-5, 2-5-3) 정상
- 가시성 지수 동적 분모 (8/9/10) 정상
- 진단 결과 페이지 게이지 시각화 완성
```

```powershell
git add .
git commit -m "Diagnosis module complete: Layer 2 + Visibility Index + Result page"
```

\---

## 검증 체크리스트

* \[ ] `python -m src.diagnosis.visibility\_index` 또는 위 Step 1 검증 코드 실행 시 기대 출력 일치
* \[ ] Streamlit Layer 2 폼 — 5개 expander 모두 표시
* \[ ] 2-4-1 "없음" 선택 시 2-4-5 자동 숨김
* \[ ] 2-5-2 "운영 안 함" 선택 시 2-5-3 자동 숨김
* \[ ] 2-3-2-detail은 선택 입력으로 작동 (미입력 시 진행 가능)
* \[ ] 모든 sub-category 완료 시 진단 결과 버튼 활성화
* \[ ] 진단 결과 페이지 가시성 게이지 정상 렌더링 (화이트 + 파스텔)
* \[ ] 사각지대 목록 자동 생성
* \[ ] tier에 따라 안내 메시지 색상 변경 (warning/info/success)
* \[ ] Layer 1 ↔ Layer 2 ↔ Result 이동 시 데이터 유지
* \[ ] SQLite에 세션 저장 확인
* \[ ] Git 새 커밋 존재

\---

## 막혔을 때

* 조건부 표시가 안 먹힘 → `st.rerun()` 호출 필요 (값 변경 시)
* Plotly 게이지 색상 이상 → `src/theme.py`의 COLORS 임포트 확인
* multi\_select 페인포인트 응답이 빈 리스트일 때 진행됨 → `\_validate\_layer1` 검토
* 2-3-2-detail이 None일 때 점수 계산 오류 → `\_score\_item` 검토

\---

## 다음 작업 지시서

이 세션 완료 후 **#04 — 시뮬레이션 모듈 빌드 (매트릭스 A·B + As-Is 자동 배치)** 들어간다. As-Is 매핑 로직은 spec\_v0.1.md §3-2 참조.

