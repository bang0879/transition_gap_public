# AGENTS.md — Transition Gap 프로젝트 컨텍스트

이 파일은 Codex / Codex 모든 세션에서 자동으로 로드되는 프로젝트 베이스 컨텍스트다. 매 세션마다 이 파일을 먼저 읽고 작업을 시작한다.

---

## 0. 프로젝트 정체성

**Product 작업명**: Transition Gap (정식 명칭 v0.2에서 확정)

**한 줄 정의**: 한국 스타트업 인사제도 진단 → 트레이드오프 시뮬레이션 → 단계적 실행 로드맵을 생성하는 HITL(Human-in-the-Loop) MVP 도구.

**MVP 사용 목적**: 7~8월에 1~2개 스타트업에 8주 deploy → 첫 case study 자산화 → 4가지 커리어 옵션(People Analytics IC/Manager, HR 컨설팅 Senior Consultant, HR Tech 스타트업 Co-founder, Independent Operator)의 시그널 자산.

**개발자**: 강훈 (단독 빌더). KAIST GBA MBA 재학 중. 삼성물산 상사부문 HR 11년 (보상 5년 / 채용 3년 / 글로벌 HR 3년). vibe coding 친화적. Python/SQL 기본기 보유.

**핵심 thesis**: "AI는 인간의 도구가 아니라, 인간이 AI의 도구가 되어간다. 도메인 시니어가 AI를 무장시키는 것이 차별화 전략." Product는 이 thesis의 살아있는 증명이어야 함.

---

## 1. 핵심 사용자

**Primary**: 한국 스타트업 대표 또는 Head of People
- 직원 30~150명 (시리즈 A~B)
- 산업: B2B SaaS / B2C 플랫폼 (MVP 고정)
- 인사 인프라가 막 깨지기 시작한 회사
- AX/AI 도입에 우호적

**Secondary**: 한국 중견기업 CHRO

**입력 주체**: CEO 또는 Head of People 단독 입력 (서베이 없음)

---

## 2. 절대 금지 사항 (Product 정체성 보호)

이것들이 깨지면 product 정체성이 무너진다. 어떤 코딩 결정도 이 원칙들을 위반해서는 안 된다.

- ❌ 단순 ChatGPT wrapper 금지 (도메인 지식 없이 LLM만 호출하는 도구)
- ❌ "이 시나리오로 가십시오" 같은 정답 강요 금지
- ❌ 한 번에 다 바꾸라는 권고 금지 (단계적 로드맵 필수)
- ❌ 진단 없이 제도부터 추천 금지 (현실 변수 무시)
- ❌ 인건비 임팩트 없는 제도 추천 금지
- ❌ 평가/감시 도구로 보이는 UI 금지
- ❌ 글로벌 솔루션 흉내 금지 (Workday, Lattice 따라가지 않음)

---

## 3. Tech Stack (확정)

```
OS:            Windows
Python:        3.12.x (uv로 가상환경 격리)
웹 프레임워크:   Streamlit 1.32+
LLM API:       Google Gemini (gemini-1.5-flash 또는 gemini-2.5-flash-lite)
데이터 저장:    SQLite (sqlite3 모듈, ORM 없음)
시각화:        Plotly + 커스텀 테마 (화이트 + 파스텔)
PDF 생성:      ReportLab (한글 폰트: Noto Sans CJK KR)
패키지 관리:    uv
Git:           사용 (GitHub repo는 비공개로 시작)
IDE:           Cursor (Codex 데스크탑 앱 + Codex 데스크탑 앱 병용)
프로젝트 위치:  C:\Users\<강훈>\Desktop\transition-gap
```

### 파이썬 환경 격리

life-assistant가 Python 3.14를 사용 중이므로, 이 프로젝트는 **반드시 uv로 가상환경 격리**한다. 시스템 Python에 직접 패키지 설치 금지.

```bash
# 프로젝트 루트에서
uv venv --python 3.12
.venv\Scripts\activate
uv pip install -r requirements.txt
```

---

## 4. 디자인 시스템

**컬러 톤**: 화이트 베이스 + 파스텔 액센트. 컨설팅 리포트 스타일이되 부드러움.

**색상 팔레트 (잠정)**:
```python
COLORS = {
    "background": "#FFFFFF",
    "surface":    "#F8F9FB",
    "primary":    "#A8B5D1",  # 파스텔 네이비
    "secondary":  "#C8B5D1",  # 파스텔 라벤더
    "accent":     "#F0C9B0",  # 파스텔 코랄
    "warning":    "#F4D8A0",  # 파스텔 머스타드
    "text_primary":   "#2C3E50",
    "text_secondary": "#6C7A89",
    "border":     "#E5E8EC",
}
```

(v0.2에서 강훈님 브랜드 아이덴티티 작업 후 조정)

**폰트**:
- 본문: Noto Sans KR (웹), Noto Sans CJK KR (PDF)
- 영문/숫자: Inter 또는 시스템 sans-serif

**Plotly 테마**: 프로젝트 시작 시 `theme.py` 파일에 커스텀 template 정의. 모든 차트는 이 template 사용.

**Streamlit 테마**: `.streamlit/config.toml`에 위 컬러 반영.

---

## 5. 디렉터리 구조

```
transition-gap/
├── AGENTS.md                    # 이 파일
├── README.md
├── requirements.txt
├── pyproject.toml               # uv 사용
├── .gitignore
├── .env                         # GEMINI_API_KEY 등 (Git 제외)
├── .env.example                 # 템플릿
├── .streamlit/
│   └── config.toml              # Streamlit 테마
├── app.py                       # Streamlit 진입점
├── src/
│   ├── __init__.py
│   ├── diagnosis/               # Layer 1 진단 모듈
│   │   ├── __init__.py
│   │   ├── variables.py         # 26개 변수 정의 (SSOT)
│   │   ├── form_layer1.py       # Layer 1 UI
│   │   ├── form_layer2.py       # Layer 2 UI (sub-category별)
│   │   └── visibility_index.py  # 가시성 지수 계산 로직
│   ├── simulation/              # 시뮬레이션 모듈 (5월 19일~)
│   │   ├── __init__.py
│   │   ├── matrix.py            # 매트릭스 A·B 시각화
│   │   ├── scenarios.py         # 시나리오 4개 정의
│   │   └── trade_off.py         # As-Is 자동 배치 로직
│   ├── execution/               # 실행 모듈 (6월 1주차)
│   │   ├── __init__.py
│   │   └── policy_draft.py
│   ├── report/                  # PDF 리포트 생성
│   │   ├── __init__.py
│   │   ├── templates.py
│   │   └── generator.py
│   ├── llm/                     # Gemini API wrapper
│   │   ├── __init__.py
│   │   ├── client.py
│   │   └── prompts.py           # 프롬프트 저장소
│   ├── theme.py                 # Plotly + 디자인 토큰
│   ├── database.py              # SQLite 헬퍼
│   └── utils.py
├── data/
│   ├── transition_gap.db        # SQLite (Git 제외)
│   └── benchmarks/              # 보상 벤치마크 raw data
├── tests/
│   └── test_visibility_index.py
└── docs/
    ├── spec_v0.1.md             # 진단 모듈 spec
    └── decisions.md             # 의사결정 로그
```

---

## 6. 진단 모듈 명세 (Layer 1 + Layer 2)

상세 변수 정의는 `src/diagnosis/variables.py`에 Single Source of Truth (SSOT)로 작성한다. 다른 모든 파일은 여기서 import해서 사용. 이 파일이 바뀌면 진단 폼이 자동 업데이트되는 구조.

### Layer 1 — 조직 컨텍스트 (5개 변수)

| ID | 변수 | 선택지 |
|---|---|---|
| L1-1 | 페인포인트 (다중 선택 최대 2개) | 우수인재 채용 난항 / 핵심인재의 잦은 이탈 / 인건비 상승 부담 / 평가의 공정성 불만 / 팀 간 이기주의(Silo) 및 소통 단절 |
| L1-2 | 총 인원수 | 20인 이하 / 20~50인 / 50~100인 / 100인 초과 |
| L1-3 | 조직 계층 | 3단계 (CEO–리더–실무자) / 4단계 이상 |
| L1-4 | 향후 12개월 채용 기조 | 공격적 확장(30%+) / 결원 보충 및 유지 / 채용 동결 및 감축 |
| L1-5 | 산업 도메인 | B2B SaaS / B2C 플랫폼 |

**가중치 규칙**: L1-2가 "50인 이상" + L1-3이 "4단계 이상" → '제도화 시급성' 가중치 ×1.5

### Layer 2 — 전환 갭 (21개 변수)

상세 정의는 `docs/spec_v0.1.md` 참조. 5개 sub-category:
- 2-1 인력 안정성 갭 (3개 변수)
- 2-2 채용 파이프라인 갭 (3개 변수)
- 2-3 총보상 갭 (6개 변수, 2-3-2는 2단계 구조)
- 2-4 평가 및 수용성 갭 (5개 변수)
- 2-5 리더십 및 거버넌스 갭 (6개 변수)

---

## 7. 가시성 지수 (Visibility Index) — 시그니처 IP

진단 리포트 첫 페이지를 차지하는 지표. *"빠진 데이터가 그 자체로 데이터가 되는"* 구조.

### 계산 로직

```python
def calculate_visibility_index(responses: dict) -> dict:
    """
    가시성 지수 계산.

    반환:
        {
            "score": float,         # 0~100
            "numerator": float,     # 측정 중 항목 점수 합
            "denominator": int,     # 분모 (8/9/10)
            "blind_spots": list,    # 미측정 항목명 리스트
        }
    """
    # 기본 8개 항목 (항상 분모 포함)
    base_items = [
        "2-1-1",  # 자발적 이직률
        "2-1-2",  # 핵심 인재 이탈 인원
        "2-1-3",  # 신규입사자 조기 퇴사율
        "2-2-1",  # 채용 소요 기간
        "2-3-2",  # 보상 구조 (0.5점/1점 가능)
        "2-3-3",  # 매출 대비 인건비 비중
        "2-3-4",  # 인건비 증가율
        "2-3-5",  # 시장 대비 보상 위치
    ]

    # 조건부 추가 항목
    conditional_items = []
    if responses.get("2-4-1") != "없음":
        conditional_items.append("2-4-5")  # 평가 운영 데이터
    if responses.get("2-5-2") != "운영 안 함":
        conditional_items.append("2-5-3")  # 1on1 운영 데이터

    all_items = base_items + conditional_items
    denominator = len(all_items)

    numerator = 0
    blind_spots = []

    for item_id in all_items:
        score = score_item(item_id, responses)  # 0, 0.5, 또는 1
        numerator += score
        if score < 1:
            blind_spots.append(item_id)

    visibility_score = (numerator / denominator) * 100

    return {
        "score": visibility_score,
        "numerator": numerator,
        "denominator": denominator,
        "blind_spots": blind_spots,
    }
```

### 진단 분기

- 가시성 < 60% → "데이터 가시성 회복" 1단계 권고. 정량 시뮬레이션 보류.
- 가시성 ≥ 60% → 정합성 본 진단 진입.

### 시뮬레이션 신뢰구간 연동

- 70%+: "신뢰도 높음"
- 40~70%: "신뢰도 중간"
- <40%: "정량 시뮬레이션 보류, 정성 권고만"

---

## 8. HITL 워크플로우 — 8주 Deploy 구조

```
Week 1     가시성 진단 + Layer 1 입력 (자동)
Week 2-3   사각지대 채우기 (강훈님 + 클라이언트 협업, 수동)
Week 4-5   Layer 2 본 진단 + 시뮬레이션 (자동 + 강훈님 검토)
Week 6-7   트레이드오프 워크샵 + 로드맵 (수동, 강훈님 진행)
Week 8     정책 draft (자동 + 강훈님 검토)
```

**원칙**: MVP는 *클라이언트가 보는 인터페이스* + *강훈님 백엔드 작업* 두 layer로 작동.
- 클라이언트가 보는 것: Streamlit 진단 폼, PDF 리포트
- 강훈님이 하는 것: 시뮬레이션 결과 검토/보강, 트레이드오프 워크샵 진행, 정책 draft 검토

---

## 9. 코딩 컨벤션

### 일반
- 변수명/함수명: 영문 snake_case
- 클래스명: PascalCase
- 사용자에게 보이는 텍스트: 한국어
- 코드 주석: 한국어 OK, 가능하면 한·영 혼용
- 타입 힌트 필수 (Python 3.12 syntax 활용)
- Docstring: Google style

### Streamlit
- 페이지는 `st.set_page_config(layout="wide")` 기본
- 진단 폼은 sub-category별로 `st.expander` 활용
- 모든 입력 위젯은 `key` 명시 (state 관리)
- 한 화면에 너무 많은 변수 노출 금지 (CEO 인지 부하)

### LLM 호출
- 모든 Gemini API 호출은 `src/llm/client.py`를 통과
- 프롬프트는 `src/llm/prompts.py`에 저장 (SSOT)
- Think in English, output in Korean 패턴 사용 (토큰 절약)
- 시스템 프롬프트에 product 정체성 명시

### 데이터 처리
- 모든 진단 응답은 SQLite에 저장 (세션 ID 단위)
- 민감 데이터(보상 raw data 등)는 암호화 고려 (v0.2)
- raw data 외부 전송 금지 (강훈님 노트북 로컬 처리만)

---

## 10. 보안 원칙

- API 키는 `.env` 파일. 절대 코드에 하드코딩 금지.
- `.env`는 `.gitignore`에 포함.
- 클라이언트 회사명, 직원 정보 등은 별칭(`Company A` 등)으로 저장.
- SQLite 파일은 `.gitignore`에 포함.
- v0.2에서 본격 보안 설계 (현재는 강훈님 로컬에서만 작동).

---

## 11. 작업 우선순위 (5월 11일 ~ 6월 14일)

### Week 1 (5월 12~18일) — 진단 모듈 빌드
- [ ] 환경 세팅 (uv, Streamlit, Plotly, Gemini API 연결)
- [ ] 디렉터리 구조 생성
- [ ] `theme.py` 디자인 토큰 정의
- [ ] `variables.py` SSOT 작성 (26개 변수)
- [ ] Layer 1 폼 빌드
- [ ] Layer 2 폼 빌드 (5개 sub-category)
- [ ] 가시성 지수 계산 + 첫 페이지 시각화

### Week 2 (5월 19~25일) — 시뮬레이션 모듈 빌드
- [ ] 매트릭스 A·B Plotly 시각화
- [ ] As-Is 자동 배치 로직 (spec α에서 결정)
- [ ] To-Be 입력 UI (드래그 or 사분면 클릭)
- [ ] 시나리오 4개 LLM 프롬프트 작성
- [ ] 시나리오별 결과 표시

### Week 3 (5월 26~31일) — 실행 모듈 + 통합
- [ ] PDF 리포트 템플릿
- [ ] 진단 → 시뮬레이션 → 실행 흐름 통합
- [ ] End-to-end 가상 테스트
- [ ] 버그 수정

### Week 4-5 (6월 1~14일) — 다듬기 + 콜드메일 준비
- [ ] UX 다듬기
- [ ] 데모 데이터 준비 (가상 회사 2~3개)
- [ ] 콜드메일 hook용 스크린샷
- [ ] 6월 15~19일은 학업 (BLACKOUT)

---

## 12. 의사결정 로그

`docs/decisions.md` 파일에 모든 주요 의사결정 기록. 형식:

```
## YYYY-MM-DD: [결정 제목]
- 컨텍스트:
- 옵션:
- 결정:
- 근거:
```

이 파일이 강훈님 case study 작성 시 1차 자료가 된다.

---

## 13. 작업 시 따라야 할 흐름

Codex/Codex 세션에서 작업할 때:

1. **이 AGENTS.md를 먼저 읽는다.**
2. 작업 지시서 (강훈님이 채팅으로 받은 것) 읽는다.
3. 작업 범위가 명확하지 않으면 묻는다. 추측해서 진행하지 않는다.
4. 한 번에 하나의 작업 단위만 처리. 연쇄 작업 금지.
5. 작업 완료 후 검증 기준 충족 확인.
6. 변경 사항을 `docs/decisions.md`에 짧게 기록 (큰 결정만).

---

**Last Updated**: 2026-05-11
**Spec Version**: v0.1
