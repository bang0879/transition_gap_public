# Transition Gap — 화면별 제품 디자인 시안서 v0.1

**작성일**: 2026-05-20  
**상태**: 제안 시안. 최종 디자인 결정 아님.  
**전제**: Streamlit 제약 없이 Next.js + Tailwind + shadcn/ui 기준으로 설계한다.  
**목표**: 대표/Head of People이 "비개발자가 만든 진단 앱"이 아니라 "전문 컨설팅 방법론이 제품화된 프리미엄 워크스페이스"로 느끼게 만든다.

---

## 1. 디자인 포지셔닝

### 1-1. 한 줄 제품 경험

> "인사제도의 엇박자를 대표의 철학, 조직 현실, 재무 임팩트, 실행 순서로 정렬하는 Executive Decision Workspace."

Transition Gap은 셀프서브 SaaS가 아니다. CEO 미팅과 8주 deploy를 위한 **컨설팅 무기**다. 따라서 화면은 기능을 많이 보여주는 앱보다, 고급 진단 리포트와 워크샵 툴 사이에 있어야 한다.

### 1-2. 사용자가 느껴야 할 감각

- "내가 평가받는 느낌"이 아니라 "우리 조직의 operating system을 함께 해부하는 느낌"
- "AI가 자동 추천한다"가 아니라 "도메인 전문가의 프레임이 디지털화되어 있다"
- "예쁜 대시보드"가 아니라 "의사결정 전에 봐야 하는 경영진용 메모"
- "제도를 도입하라"가 아니라 "어느 트레이드오프를 감수할지 선택하라"

### 1-3. 피해야 할 인상

- AI 서비스 특유의 보라색 그라데이션, 빛나는 구체, 마법봉 아이콘
- HR SaaS 템플릿처럼 보이는 과도한 카드형 랜딩
- 직원 평가/감시 대시보드처럼 보이는 red/yellow/green 남발
- Workday/Lattice류 enterprise HRIS 느낌
- "정답", "추천", "자동 최적화" 같은 단정적 카피

---

## 2. 디자인 언어

### 2-1. Visual Direction: Executive Calm

기존 `design(kyle)/transition_gap_v6_slate_teal.html`의 슬레이트 + 틸 방향은 유지할 가치가 있다. 다만 v0.1 시안에서는 더 컨설팅 리포트다운 깊이를 주기 위해, 색을 조금 더 낮추고 따뜻한 보조색을 얹는다.

**핵심 톤**

- 배경: 따뜻한 화이트, 거의 종이 같은 느낌
- 텍스트: 진한 slate/ink, 숫자는 더 또렷하게
- 액센트: 차분한 teal/blue-green, 과하게 밝지 않게
- 경고: red 대신 muted amber/coral을 우선 사용
- 위험: 반드시 필요한 경우에만 soft red

### 2-2. Color Tokens

```ts
export const colors = {
  background: "hsl(45 33% 98%)",      // warm white
  foreground: "hsl(222 47% 11%)",     // ink
  surface: "hsl(0 0% 100%)",
  surfaceMuted: "hsl(210 40% 98%)",
  border: "hsl(214 32% 91%)",

  primary: "hsl(176 52% 36%)",        // executive teal
  primarySoft: "hsl(174 64% 94%)",
  primaryMuted: "hsl(177 35% 82%)",

  slate: "hsl(215 25% 27%)",
  slateMuted: "hsl(215 16% 47%)",
  slateSubtle: "hsl(215 20% 65%)",

  amber: "hsl(38 72% 58%)",
  amberSoft: "hsl(42 87% 94%)",
  coral: "hsl(15 70% 66%)",
  coralSoft: "hsl(18 82% 95%)",

  success: "hsl(158 48% 38%)",
  successSoft: "hsl(150 60% 94%)",
  risk: "hsl(0 62% 48%)",
  riskSoft: "hsl(0 70% 96%)",
};
```

**사용 원칙**

- Primary teal은 CTA, 현재 단계, 선택 상태, 핵심 벡터에만 사용한다.
- 차트는 slate 계열을 기본으로 하고, 중요한 변화량만 teal/coral로 표시한다.
- 전체 화면이 teal 하나로 읽히지 않도록 amber/coral/blue-gray를 보조적으로 섞는다.
- 경고는 빨간 화면을 만들지 않고, "주의 깊게 봐야 하는 경영 리스크"처럼 보이게 한다.

### 2-3. Typography

**권장**

- Korean UI: Pretendard 또는 Noto Sans KR
- English/number: Inter
- PDF/리포트 확장: Noto Sans CJK KR

**타입 스케일**

```ts
const typeScale = {
  display: "40px / 1.15 / 650",      // 첫 화면 핵심 문장
  pageTitle: "28px / 1.25 / 650",
  sectionTitle: "20px / 1.35 / 650",
  cardTitle: "15px / 1.45 / 600",
  body: "14px / 1.65 / 400",
  caption: "12px / 1.5 / 400",
  metric: "44px / 1.0 / 650",
  metricSmall: "30px / 1.0 / 650",
};
```

**금지**

- viewport 기반 font-size
- negative letter spacing
- 거대한 hero heading을 내부 카드/대시보드에 반복 사용

### 2-4. Shape & Spacing

- 카드 radius: 8px 기본, 큰 panel도 10px 이하
- 버튼 radius: 8px
- page max-width: 1180px
- 좌측 navigation rail: 248px
- 콘텐츠 grid: 12 columns, gap 24px
- 화면 주요 band는 full-width 배경으로 나누되, 카드 안에 카드를 중첩하지 않는다.

---

## 3. 제품 정보 구조

### 3-1. Client Flow

```text
/intro
  → /diagnosis/philosophy
  → /diagnosis/context
  → /diagnosis/workforce
  → /diagnosis/rewards
  → /diagnosis/evaluation-leadership
  → /diagnosis/review
  → /result/summary
  → /result/detail
  → /simulation
  → /execution/roadmap
  → /report/preview
```

### 3-2. Expert/Admin Flow

```text
/admin/cases
  → /admin/cases/[caseId]/review
  → /admin/cases/[caseId]/report
```

MVP에서 client flow만 먼저 구현해도 되지만, 디자인 시안은 처음부터 admin flow를 염두에 둔다. Transition Gap의 정체성은 HITL이므로, "전문가 검토"가 UI에 보이지 않으면 단순 자동화처럼 느껴진다.

---

## 4. 공통 레이아웃

### 4-1. App Shell

**구조**

- Left rail: 단계, 진행률, 현재 case alias, 저장 상태
- Main content: 화면별 작업 영역
- Right context rail: 일부 화면에서만 노출. 설명이 아니라 "현재 입력이 결과에 미치는 영향"을 보여준다.

**Left Rail 구성**

```text
Transition Gap
스타트업 인사제도 정합성 진단

01 철학 앵커링
02 조직 컨텍스트
03 인력 · 채용
04 총보상
05 평가 · 리더십
06 검토
07 결과
08 시뮬레이션
09 실행 로드맵

진행률 42%
저장됨 14:32
```

**원칙**

- 미래 단계는 흐리게 표시하되, "잠김"처럼 위압적이지 않게 한다.
- 완료 단계는 check 아이콘 하나만 사용한다.
- 현재 단계는 filled background + left accent line으로 표시한다.

### 4-2. Page Header Pattern

모든 진단 화면 상단은 같은 구조를 쓴다.

```text
2-A. 인력 · 채용 진단
핵심 인력이 빠져나가는 속도와 다시 채우는 속도를 봅니다.
약 4분 · 6개 문항 · 모르면 "측정 안 함"을 선택해도 됩니다.
```

카피는 기능 설명이 아니라 판단 관점을 제공한다. "이 화면에서 무엇을 입력하라"보다 "무엇을 보기 위한 화면인가"를 말한다.

### 4-3. Question Pattern

**기본 레이아웃**

- 상단: 짧은 질문
- 하단: helper text
- 입력: Radio card / segmented control / slider / split input
- 우측: "이 항목이 쓰이는 곳" micro note

**예시**

```text
직전 12개월 전체 자발적 이직률은 어느 정도입니까?
정확한 수치가 없으면 가장 가까운 구간을 선택하세요. 모른다는 응답도 가시성 지수에 반영됩니다.

[10% 미만] [10~20%] [20% 초과] [측정 안 함]

이 항목은 HR 가시성 지수와 인력 안정성 갭 계산에 사용됩니다.
```

---

## 5. 화면별 시안

## Screen 01. Intro / Intake Desk

**Route**: `/intro`

### 목적

랜딩 페이지가 아니라 "진단 접수 데스크"처럼 보여야 한다. 브랜드 설명은 최소화하고, 대표가 지금부터 전문 진단 프로세스에 들어간다는 감각을 준다.

### 첫인상

넓은 여백, 왼쪽 상단의 작은 브랜드, 중앙의 선명한 한 문장, 하단의 프로세스 스트립. 마케팅 hero보다 컨설팅 리포트 표지에 가깝다.

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ Transition Gap                                   Confidential │
│                                                              │
│        인사제도의 엇박자를                                   │
│        실행 가능한 선택지로 바꿉니다                         │
│                                                              │
│        한국 스타트업의 채용 · 보상 · 평가 · 리더십 구조를     │
│        대표의 철학과 조직 현실 기준으로 정렬합니다.           │
│                                                              │
│        [진단 시작]                                           │
│                                                              │
│   01 진단 입력     02 전문가 검토     03 시뮬레이션     04 로드맵 │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `IntakeHero`
- `ProcessStrip`
- `ConfidentialityNote`
- `StartDiagnosisButton`

### 카피

Headline:

> 인사제도의 엇박자를 실행 가능한 선택지로 바꿉니다

Subcopy:

> 채용, 보상, 평가, 리더십이 서로 다른 방향으로 당기고 있을 때 조직은 성장할수록 더 느려집니다. Transition Gap은 대표의 철학과 현재 운영 상태 사이의 간극을 진단하고, 감수해야 할 트레이드오프를 시각화합니다.

CTA:

> 진단 시작

### 디자인 디테일

- Hero는 카드 안에 넣지 않는다.
- 우측에 추상 이미지 대신 아주 얇은 matrix line drawing 또는 실제 제품 UI ghost preview를 배치할 수 있다. 단, 첫 구현에서는 텍스트 중심이 더 고급스럽다.
- "AI" 단어는 노출하지 않는다.

---

## Screen 02. Case Setup

**Route**: `/diagnosis/setup`

### 목적

진단 대상의 별칭과 보안/비식별 원칙을 명확히 한다. 실제 회사명 대신 alias를 쓰는 것이 자연스럽게 느껴져야 한다.

### 레이아웃

```text
┌ Left rail ┐ ┌──────────────────────────────────────────────┐
│ 단계      │ │ 진단 대상 설정                               │
│           │ │ 민감한 회사명 대신 내부 식별명을 사용할 수 있습니다. │
│           │ │                                              │
│           │ │ [회사명 또는 내부 식별명                  ]   │
│           │ │ [산업 도메인 ▼] [인원 규모 ▼]                 │
│           │ │                                              │
│           │ │ Data handling                                │
│           │ │ - 원시 보상 데이터는 입력하지 않습니다          │
│           │ │ - 결과는 전문가 검토 후 리포트화됩니다          │
│           │ │                                              │
│           │ │                                  [계속]       │
└───────────┘ └──────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `CaseAliasField`
- `IndustrySelect`
- `EmployeeSizeSelect`
- `DataHandlingPanel`

### 상호작용

- alias 미입력 시 `Company A` 자동 제안 가능
- "실제 회사명을 넣어도 되나요?" tooltip 제공

---

## Screen 03. CEO Philosophy Anchoring

**Route**: `/diagnosis/philosophy`

### 목적

To-Be는 시스템이 추천하는 값이 아니라 대표의 철학에서 나온다는 것을 보여준다. 이 화면은 Transition Gap의 프리미엄 인상을 만드는 핵심 시작점이다.

### 레이아웃

```text
┌ Left rail ┐ ┌────────────────────────────────────────────────────┐
│           │ │ 01. 철학 앵커링                                    │
│           │ │ 제도 설계 전에, 대표님이 감수할 트레이드오프를 먼저 봅니다. │
│           │ │                                                    │
│           │ │ 보상 철학                                          │
│           │ │ ┌────────────────────┐  ───────  ┌────────────────────┐ │
│           │ │ │ 탁월한 개인에게 집중 │          │ 팀 전체의 평균 성과 상승 │ │
│           │ │ └────────────────────┘          └────────────────────┘ │
│           │ │                                                    │
│           │ │ 리더십 철학                                        │
│           │ │ [명확한 목표와 피드백]  vs  [안전감과 정기 1on1]      │
│           │ │                                                    │
│           │ │ 인재 전략                                          │
│           │ │ [외부 최고 인재 수혈]  vs  [내부 육성]               │
│           │ │                                                    │
│           │ │                                [이전] [다음: 조직 컨텍스트] │
└───────────┘ └────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `TradeoffChoice`
- `PhilosophyCard`
- `PhilosophySummaryRail`

### 디자인 디테일

- A/B 선택은 라디오 버튼처럼 보이면 가벼워진다. 두 개의 editorial card로 보이게 한다.
- 선택 상태는 두꺼운 teal border가 아니라 얇은 border + 상단 hairline + 작은 check 아이콘.
- 우측 context rail에는 실시간으로 "현재 선택은 To-Be 매트릭스를 Q4 방향으로 이동시킵니다" 같은 메모를 표시한다.

### 카피 톤

좋음:

> 이 선택은 정답이 아니라 설계 방향입니다.

피함:

> AI가 대표님의 성향을 분석합니다.

---

## Screen 04. Organization Context

**Route**: `/diagnosis/context`

### 목적

조직의 외형 조건과 현재 pain point를 받는다. CEO가 "우리 회사 상황을 정확히 짚고 들어간다"는 느낌을 받아야 한다.

### 레이아웃

```text
┌ Left rail ┐ ┌──────────────────────────────────────────────┐
│           │ │ 02. 조직 컨텍스트                            │
│           │ │ 조직 규모와 성장 압력은 제도화 시급성을 바꿉니다. │
│           │ │                                              │
│           │ │ 가장 시급한 HR 페인포인트                     │
│           │ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│           │ │ │ 핵심인재 이탈 │ │ 인건비 부담 │ │ 평가 불만   │ │
│           │ │ └────────────┘ └────────────┘ └────────────┘ │
│           │ │ 최대 2개 선택                                 │
│           │ │                                              │
│           │ │ [총 인원수] [조직 계층] [12개월 채용 기조] [산업] │
│           │ │                                              │
│           │ │ 우측: 제도화 시급성 Preview                    │
└───────────┘ └──────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `PainPointPicker`
- `ContextSelectGrid`
- `InstitutionalUrgencyPreview`

### 디자인 디테일

- pain point는 카드형 선택. 각 카드에는 lucide icon 하나만 사용한다.
- "최대 2개" 제약은 선택 시 counter로 표시한다.
- 50인 이상 + 4단계 이상이면 우측 preview에 "제도화 시급성 가중치 적용"을 조용히 표시한다.

---

## Screen 05. Workforce & Recruitment Diagnosis

**Route**: `/diagnosis/workforce`

### 목적

인력이 빠져나가는 속도와 다시 채우는 속도를 함께 본다. "리텐션 문제"와 "채용 파이프라인 문제"를 분리하지 않고 운영 리스크로 연결한다.

### 레이아웃

```text
┌ Left rail ┐ ┌──────────────────────────────┐ ┌────────────────────┐
│           │ │ 03. 인력 · 채용 진단          │ │ HR Visibility       │
│           │ │                              │ │ 측정 중 3/4         │
│           │ │ 자발적 이직률                │ │ Blind spot          │
│           │ │ [10% 미만] [10~20%] [...]    │ │ - 핵심인재 이탈 수   │
│           │ │                              │ │                    │
│           │ │ 핵심 인재 이탈 경험           │ │ 이 화면이 쓰이는 곳  │
│           │ │ [없음] [1명] [2~3명] [...]   │ │ - 가시성 지수       │
│           │ │                              │ │ - 인력 안정성 갭    │
│           │ │ 채용 소요 기간                │ │ - 시나리오 warning  │
│           │ │ [2개월 내] [2~4개월] [...]   │ │                    │
│           │ │                              │ │                    │
└───────────┘ └──────────────────────────────┘ └────────────────────┘
```

### 주요 컴포넌트

- `QuestionStack`
- `RadioCardGroup`
- `VisibilityMiniPanel`
- `DataUseNote`

### 디자인 디테일

- 오른쪽 panel은 설명 텍스트가 아니라 live 계산 preview.
- "모름 / 측정 안 함" 선택지는 부끄러운 선택처럼 보이면 안 된다. 별도 muted button으로 배치하고 "이 응답도 진단에 반영됩니다"를 붙인다.

---

## Screen 06. Rewards Architecture

**Route**: `/diagnosis/rewards`

### 목적

보상 철학, 보상 구조, 인건비 압력, 시장 대비 위치를 한 번에 연결한다. 이 화면은 가장 컨설팅다운 인상을 줘야 한다.

### 레이아웃

```text
┌ Left rail ┐ ┌──────────────────────────────────────────────┐
│           │ │ 04. 총보상 구조                              │
│           │ │ 보상은 비용이 아니라 어떤 인재를 끌어당길지 정하는 신호입니다. │
│           │ │                                              │
│           │ │ 보상 철학 스펙트럼                            │
│           │ │ 안정적 기본급 ───────────── 성과/지분 upside   │
│           │ │                                              │
│           │ │ 보상 아키타입                                │
│           │ │ [현금 안정형] [단기 성과형] [장기 비전형] [혼합형] │
│           │ │                                              │
│           │ │ 보상 구성 비율                                │
│           │ │ 기본급 80% | 성과급 10% | 지분 10%             │
│           │ │ ━━━━━━━━━━━━━━━━━                             │
│           │ │                                              │
│           │ │ 인건비 압력                                   │
│           │ │ [매출 대비 인건비] [인건비 증가율] [시장 위치]  │
└───────────┘ └──────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `SpectrumSlider`
- `RewardArchetypeSelector`
- `CompensationSplitBar`
- `LaborCostPressureGrid`
- `BenchmarkReferenceDrawer`

### 디자인 디테일

- 보상 split은 단순 input 3개보다 horizontal stacked bar로 보여준다.
- 아키타입 선택 시 하단에 "이 구조가 끌어당기는 인재"를 한 줄로 보여준다.
- 인건비 관련 질문은 재무 냄새가 나야 한다. 숫자/비율 UI를 더 단단하게 만든다.

### 카피

> 보상은 비용 항목이면서 동시에 채용 메시지입니다. 어떤 구조를 택하느냐에 따라 끌어당기는 인재의 유형이 달라집니다.

---

## Screen 07. Evaluation, Leadership & Governance

**Route**: `/diagnosis/evaluation-leadership`

### 목적

평가 수용성, 리더십 운영 역량, 의사결정 거버넌스를 묶어 "제도를 운영할 체력"을 본다.

### 레이아웃

```text
┌ Left rail ┐ ┌────────────────────────────────────────────────────┐
│           │ │ 05. 평가 · 리더십 · 거버넌스                       │
│           │ │ 제도는 설계보다 운영에서 무너집니다.                 │
│           │ │                                                    │
│           │ │ ┌ Evaluation ─────────────────────┐ ┌ Leadership ──────┐ │
│           │ │ │ 평가 주기                        │ │ 피드백 역량        │ │
│           │ │ │ 평가 주체                        │ │ 1on1 운영          │ │
│           │ │ │ 평가 지표 성격                    │ │ 채용 승인권        │ │
│           │ │ │ CEO 공정성 인식 8/10              │ │ 배포 의사결정      │ │
│           │ │ │ 직원 예상 공정성 5/10             │ │ 핵심가치 작동      │ │
│           │ │ │ Gap 3점                           │ │                   │ │
│           │ │ └─────────────────────────────────┘ └──────────────────┘ │
└───────────┘ └────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `EvaluationOperatingModel`
- `FairnessGapMeter`
- `LeadershipGovernanceGrid`
- `OneOnOneTrackingToggle`

### 디자인 디테일

- CEO vs 직원 공정성 인식은 이 화면의 핵심 시각 요소다. 두 숫자를 같은 축 위에 놓고 gap을 표시한다.
- 이 화면에서 강한 경고색을 쓰지 않는다. "갭이 크다"는 비난이 아니라 워크샵 논점으로 보여야 한다.

---

## Screen 08. Diagnosis Review

**Route**: `/diagnosis/review`

### 목적

결과를 바로 보여주기 전에 입력 완성도, blind spot, 전문가 검토 흐름을 정리한다. 프리미엄 컨설팅 서비스 감각을 만드는 완충 화면이다.

### 레이아웃

```text
┌ Left rail ┐ ┌──────────────────────────────────────────────┐
│           │ │ 제출 전 검토                                  │
│           │ │ 입력하신 내용은 자동 계산 후 전문가 검토를 거쳐 해석됩니다. │
│           │ │                                              │
│           │ │ Completeness                                 │
│           │ │ 철학 3/3 · 조직 5/5 · 인력/채용 6/6 · 보상 5/6 │
│           │ │                                              │
│           │ │ Blind spots                                  │
│           │ │ - 시장 대비 보상 위치                         │
│           │ │ - 평가 운영 데이터                            │
│           │ │                                              │
│           │ │ [이전으로 돌아가기]              [진단 결과 생성] │
└───────────┘ └──────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `CompletenessSummary`
- `BlindSpotList`
- `ExpertReviewNotice`
- `GenerateResultButton`

### 디자인 디테일

- "결과 생성"은 black/ink button으로 무게감 있게.
- 로딩 상태는 spinner보다 "진단 기준점 정렬 중 / 가시성 지수 계산 중 / 매트릭스 좌표 산출 중"의 3-step progress로 보여준다.

---

## Screen 09. Result Summary

**Route**: `/result/summary`

### 목적

첫 10초 안에 세 가지를 전달한다.

1. 우리 회사는 지금 얼마나 보이는가
2. 가장 큰 gap은 어디인가
3. 다음 논의는 어떤 trade-off인가

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ Company A · Executive Diagnostic Memo                         │
│ "귀사는 보상 구조보다 평가 수용성과 리더십 운영 체력이 먼저입니다." │
│                                                              │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│ │ HR 가시성 71% │ │ 정합성 62/100 │ │ 우선 갭 3개  │              │
│ └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                              │
│ ┌──────────────────────┐ ┌──────────────────────┐            │
│ │ 5영역 Radar           │ │ 영역별 Gap Bar        │            │
│ └──────────────────────┘ └──────────────────────┘            │
│                                                              │
│ 핵심 인사이트                                                 │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 측정하지 않는 것은 관리할 수 없습니다.                    │ │
│ │ 보상 관련 핵심 지표 2개가 비어 있어 정량 시뮬레이션 신뢰도가... │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `ExecutiveMemoHeader`
- `MetricScoreCard`
- `VisibilityIndexCard`
- `ConsistencyIndexCard`
- `RadarChart`
- `GapBarChart`
- `CrossDomainInsightList`

### 디자인 디테일

- 결과 화면은 대시보드가 아니라 "memo"다. 최상단에 한 문장 diagnosis가 있어야 한다.
- 큰 숫자는 3개까지만.
- 가시성 지수가 signature IP이므로 왼쪽 첫 카드에 둔다.
- 차트는 얇은 grid, muted axis, hover detail.

### 카피

Header label:

> Executive Diagnostic Memo

Memo sentence:

> 현재 가장 큰 문제는 제도 하나의 부재가 아니라, 보상·평가·리더십 운영 기준이 서로 다른 방향으로 작동하는 것입니다.

---

## Screen 10. Result Detail

**Route**: `/result/detail`

### 목적

요약에서 드러난 갭의 근거를 보여준다. CEO가 "왜 이 결론이 나왔는지" 납득해야 한다.

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ 영역별 상세 분석                                              │
│ [보상] [평가] [채용] [인력 안정성] [리더십]                   │
│                                                              │
│ 보상 경쟁력                                                   │
│ Score 45 / Benchmark 70 / Gap 25                              │
│                                                              │
│ ┌ Score Breakdown ─────────────────────────────────────────┐ │
│ │ 시장 대비 보상 위치     하위      -15   [리스크] ...       │ │
│ │ 인건비 증가율           50%+      -10   [리스크] ...       │ │
│ │ 보상 구조               혼합형    +5    [참고] ...         │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ 설계 기준점                                                   │
│ 따라 하라는 뜻이 아니라, 이 방향을 가능하게 하는 최소 장치입니다. │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `AreaTabs`
- `AreaScoreHeader`
- `ScoreBreakdownTable`
- `RiskBadge`
- `BenchmarkReference`
- `BlindSpotActionPlan`

### 디자인 디테일

- table은 dense하지만 답답하지 않게. CEO는 표를 잘 읽는다.
- `[리스크]`, `[강점]`, `[참고]`는 badge로 파싱한다.
- 벤치마크는 "대표 기업"을 보여주되 모방 유도처럼 보이지 않게 disclaimer를 항상 붙인다.

---

## Screen 11. Trade-off Simulation Overview

**Route**: `/simulation`

### 목적

Transition Gap의 두 번째 signature IP. "어느 방향으로 가야 하는가"가 아니라 "어느 모순을 감수할 것인가"를 시각화한다.

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ 트레이드오프 시뮬레이션                                      │
│ 두 가치를 동시에 극대화하려 할수록 관리 비용이 증가합니다.     │
│                                                              │
│ ┌ Matrix A: Motivation Mix ───────┐ ┌ Matrix B: Operating System ┐ │
│ │ 팀 시너지 ↑                      │ │ 조직 적합성 ↑                │ │
│ │ Q2        |        Q1            │ │ Q2        |        Q4        │ │
│ │           |   ◇ To-Be            │ │      ● As-Is                │ │
│ │      ● As-Is                     │ │           |   ◇ To-Be        │ │
│ │ Q3        |        Q4            │ │ Q1        |        Q3        │ │
│ │ 개인 성과 ↓                      │ │ 즉시 전력 ↓                  │ │
│ └─────────────────────────────────┘ └────────────────────────────┘ │
│                                                              │
│ [성과주의 가속형] [공동체 안정형] [소수정예 집중형]             │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `MatrixPanel`
- `MatrixLegend`
- `ScenarioDirectionTabs`
- `TradeoffQuote`
- `ConfidenceBadge`

### 디자인 디테일

- As-Is는 muted filled circle.
- To-Be는 diamond.
- 이동 벡터는 thin teal line.
- 가시성 낮을 때는 점/화살표의 opacity를 낮추고 confidence badge를 붙인다.
- 사분면 배경색은 아주 옅게만. 컬러풀한 보드게임처럼 보이면 안 된다.

### 카피

> 한쪽을 누르면 다른 쪽이 튀어나옵니다. 좋은 제도 설계는 모든 가치를 동시에 얻는 것이 아니라, 지금 조직 체력에서 감당 가능한 편향성을 선택하는 일입니다.

---

## Screen 12. Scenario Comparison

**Route**: `/simulation/scenarios`

### 목적

3개 시나리오를 같은 기준으로 비교한다. 선택은 사용자가 한다.

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ 시나리오 비교                                                 │
│                                                              │
│ ┌ 성과주의 가속형 ┐ ┌ 공동체 안정형 ┐ ┌ 소수정예 집중형 ┐       │
│ │ 철학             │ │ 철학            │ │ 철학             │       │
│ │ 도입 제도         │ │ 도입 제도        │ │ 도입 제도         │       │
│ │ 예상 임팩트       │ │ 예상 임팩트      │ │ 예상 임팩트       │       │
│ │ 재무 임팩트       │ │ 재무 임팩트      │ │ 재무 임팩트       │       │
│ │ 필수 선행 조건    │ │ 필수 선행 조건   │ │ 필수 선행 조건    │       │
│ │ 주요 경고         │ │ 주요 경고        │ │ 주요 경고         │       │
│ └──────────────────┘ └─────────────────┘ └──────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `ScenarioComparisonGrid`
- `FinancialImpactCard`
- `ScenarioWarningList`
- `PrerequisiteList`
- `ScenarioFitBadge`

### 디자인 디테일

- 세 시나리오는 "추천 순위"처럼 보이면 안 된다. 같은 높이, 같은 무게로 배치한다.
- 적합도는 신호등 대신 `Natural fit`, `Requires design`, `High friction`, `Not advised`처럼 전문적인 label로 표현한다.
- 재무 임팩트는 반드시 숫자와 rationale을 함께 보여준다.

---

## Screen 13. Scenario Detail & Adjustment

**Route**: `/simulation/scenarios/[scenarioId]`

### 목적

선택한 시나리오의 제도 패키지를 조정한다. 단, 뼈대 제도를 빼면 "시나리오 붕괴"가 명확히 보여야 한다.

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ 성과주의 가속형                                               │
│ 탁월한 기여에 탁월한 보상을 집중하는 전략입니다.               │
│                                                              │
│ 도입 제도 패키지                    우측: 변경 영향             │
│ ☑ OKR + 반기 상대평가               - 평가 갈등 리스크 상승     │
│ ☑ 분기 성과급 20~30%                - 인건비 +15~25%            │
│ ☑ Top 20% 리텐션 패키지             - 핵심인재 이탈률 -30~50%   │
│ ☑ 리더 피드백 코칭                  - 선행 과제 6주             │
│                                                              │
│ 도입 기간: [6개월] [12개월] [24개월]                           │
│                                                              │
│ [로드맵 생성]                                                 │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `PackageToggleList`
- `SkeletonPolicyWarning`
- `TimelineSegmentedControl`
- `ImpactDeltaPanel`

### 디자인 디테일

- checkbox는 shadcn Checkbox를 쓰되 리스트 전체가 선택 가능한 row로 보이게 한다.
- 뼈대 제도 해제 시 붉은 alert가 아니라 "시나리오 명칭 변경" banner로 보여준다.
- 6개월 선택 시 "초고속 도입: 조직 저항 리스크 높음" badge.

---

## Screen 14. Execution Roadmap

**Route**: `/execution/roadmap`

### 목적

"무엇을 선택했는가"를 "어떤 순서로 실행할 것인가"로 바꾼다. Transition Gap의 금지 사항인 "한 번에 다 바꾸기"를 UI가 방지해야 한다.

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ 12개월 실행 로드맵                                            │
│ 선택 시나리오: 공동체 안정형                                  │
│                                                              │
│ 0-1개월   선행 과제                                           │
│           HR 데이터 트래킹 인프라 구축                         │
│           리더 1on1 운영 기준 합의                             │
│                                                              │
│ 2-3개월   제도 설계 + 설명회                                  │
│           평가 기준 문서화, 보상 밴드 초안                     │
│                                                              │
│ 4-6개월   파일럿                                              │
│           1개 조직 대상 운영, 수용성 피드백                    │
│                                                              │
│ 7-9개월   전사 본 운영                                        │
│                                                              │
│ 10-12개월 보상 연동 + 회고                                    │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `RoadmapTimeline`
- `PrerequisiteTaskCard`
- `RiskGate`
- `OwnerColumn`
- `EvidenceRequiredList`

### 디자인 디테일

- timeline은 세로형이 더 컨설팅 문서답다.
- 각 단계에는 "산출물"과 "검증 기준"을 붙인다.
- 0-1개월 선행 과제는 가시성 지수와 진단 변수에 따라 자동으로 강조한다.

---

## Screen 15. Report Preview

**Route**: `/report/preview`

### 목적

결과를 웹에서 끝내지 않고 PDF 리포트와 워크샵으로 연결한다. 프리미엄 서비스의 종결 화면이다.

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ 리포트 미리보기                                               │
│ 전문가 검토 후 최종본으로 정리됩니다.                          │
│                                                              │
│ ┌ Page 1 Preview ──────────────────────────────────────────┐ │
│ │ Transition Gap Diagnostic Report                         │ │
│ │ Company A                                                │ │
│ │ HR Visibility 71% · Consistency 62                       │ │
│ │ Executive Memo                                           │ │
│ │ Matrix Snapshot                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ 포함 항목                                                     │
│ ✓ 진단 요약  ✓ 영역별 상세  ✓ 시뮬레이션  ✓ 12개월 로드맵       │
│                                                              │
│ [PDF 초안 생성] [전문가 검토 요청]                            │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `ReportPagePreview`
- `ReportContentsChecklist`
- `ExpertReviewCTA`

### 디자인 디테일

- PDF preview는 실제 종이 비율(A4)로 보여준다.
- "다운로드"보다 "초안 생성"이 더 적합하다. 최종 리포트는 HITL 검토 후 발송된다는 인상을 유지한다.

---

## Screen 16. Admin Case Review

**Route**: `/admin/cases/[caseId]/review`

### 목적

강훈님이 LLM/Rule 결과를 검토하고 리포트 문구를 보강하는 내부 작업대다. 클라이언트용 화면보다 dense해도 된다.

### 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ Company A Review Workspace                                   │
│ Status: Draft · Visibility 71% · Generated 2026-05-20         │
│                                                              │
│ Left: Evidence                                                │
│ - Raw responses                                               │
│ - Score breakdown                                             │
│ - Blind spots                                                 │
│                                                              │
│ Center: Generated interpretation                              │
│ [Executive memo editable]                                     │
│ [Insights editable]                                           │
│ [Warnings editable]                                           │
│                                                              │
│ Right: Release checklist                                      │
│ □ 노동법 주의 문구 확인                                       │
│ □ 재무 임팩트 수동 검토                                       │
│ □ 회사명 익명화 확인                                          │
│ □ PDF 메타데이터 클린업                                       │
└──────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `CaseReviewShell`
- `ResponseEvidenceTable`
- `EditableMemoBlock`
- `ReleaseChecklist`
- `ReportGenerateButton`

### 디자인 디테일

- 내부 도구는 Notion/Linear처럼 효율적인 작업대 톤.
- 결과를 "AI output"이라고 부르지 않고 "Generated draft" 또는 "초안"으로 부른다.

---

## 6. Next.js 구현 전략

### 6-1. App Router 구조

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── intro/page.tsx
│   ├── diagnosis/
│   │   ├── layout.tsx
│   │   ├── setup/page.tsx
│   │   ├── philosophy/page.tsx
│   │   ├── context/page.tsx
│   │   ├── workforce/page.tsx
│   │   ├── rewards/page.tsx
│   │   ├── evaluation-leadership/page.tsx
│   │   └── review/page.tsx
│   ├── result/
│   │   ├── summary/page.tsx
│   │   └── detail/page.tsx
│   ├── simulation/
│   │   ├── page.tsx
│   │   └── scenarios/[scenarioId]/page.tsx
│   ├── execution/roadmap/page.tsx
│   ├── report/preview/page.tsx
│   └── admin/cases/[caseId]/review/page.tsx
```

### 6-2. shadcn/ui 사용 컴포넌트

**필수**

- Button
- Card
- Badge
- Tabs
- RadioGroup
- Checkbox
- Slider
- ToggleGroup
- Progress
- Tooltip
- Table
- Separator
- ScrollArea
- Sheet
- Dialog
- Alert
- Command

**사용 원칙**

- shadcn 기본 스타일을 그대로 쓰지 않는다. 디자인 토큰과 variant를 입혀 Transition Gap 전용 component로 감싼다.
- 예: `Button` 직접 사용 대신 `PrimaryAction`, `SecondaryAction`, `QuietAction`.
- Card 남발 금지. 반복 item, metric block, modal, framed tool에만 card 사용.

### 6-3. 컴포넌트 경계

```text
components/
├── shell/
│   ├── AppShell.tsx
│   ├── ProgressRail.tsx
│   └── PageHeader.tsx
├── diagnosis/
│   ├── TradeoffChoice.tsx
│   ├── PainPointPicker.tsx
│   ├── QuestionBlock.tsx
│   ├── RadioCardGroup.tsx
│   ├── SpectrumSlider.tsx
│   ├── CompensationSplitBar.tsx
│   └── VisibilityMiniPanel.tsx
├── result/
│   ├── ExecutiveMemoHeader.tsx
│   ├── MetricScoreCard.tsx
│   ├── VisibilityIndexCard.tsx
│   ├── RadarChart.tsx
│   ├── GapBarChart.tsx
│   ├── AreaTabs.tsx
│   ├── ScoreBreakdownTable.tsx
│   └── RiskBadge.tsx
├── simulation/
│   ├── MatrixPanel.tsx
│   ├── ScenarioComparisonGrid.tsx
│   ├── ScenarioDetail.tsx
│   ├── PackageToggleList.tsx
│   └── ImpactDeltaPanel.tsx
├── execution/
│   ├── RoadmapTimeline.tsx
│   ├── PrerequisiteTaskCard.tsx
│   └── RiskGate.tsx
└── report/
    ├── ReportPagePreview.tsx
    └── ReportContentsChecklist.tsx
```

### 6-4. 디자인 시안 100% 구현 전략

1. **Token first**
   - 색상, radius, shadow, spacing, typography를 `globals.css` CSS variables로 고정한다.
   - Tailwind arbitrary value 남발 금지.

2. **Primitive wrapping**
   - shadcn/ui를 바로 화면에서 호출하지 않고 Transition Gap 전용 wrapper를 만든다.
   - 예: `MetricScoreCard`, `QuestionBlock`, `TradeoffChoice`.

3. **Visual component = design block**
   - 페이지 단위가 아니라 시안의 시각 단위로 컴포넌트를 쪼갠다.
   - "결과 요약 카드", "가시성 지수 카드", "매트릭스 패널"이 각각 독립 컴포넌트여야 한다.

4. **Data contract locked**
   - FastAPI Pydantic schema와 TypeScript type을 맞춘다.
   - API 응답을 화면 안에서 임의 가공하지 않고 `lib/normalizers`에서 정규화한다.

5. **Chart isolation**
   - Recharts/D3 차트는 전용 wrapper에서만 사용한다.
   - 차트 색상/폰트/축/grid는 모두 token에서 읽는다.

6. **Screenshot QA**
   - Desktop 1440px, tablet 1024px, mobile 390px 기준 screenshot 검수.
   - 버튼 텍스트 overflow, 차트 label overlap, rail collapse를 반드시 확인한다.

7. **No AI residue**
   - "AI 분석", "자동 추천", "마법처럼" 류 표현 금지.
   - 생성 결과는 "초안", "진단 메모", "전문가 검토 대상"으로 부른다.

---

## 7. Interaction & Motion

### 7-1. Motion 원칙

- 화면 전환: 120-180ms fade/slide 정도
- 선택 상태: instant feedback
- 차트 등장: stagger 금지. 리포트 도구처럼 즉시 안정적으로 보여야 한다.
- skeleton loading은 가능하지만 flashy shimmer 금지.

### 7-2. 상태 표현

- 저장됨: "저장됨 14:32" 텍스트
- 계산 중: 3단계 progress copy
- 오류: 기술 에러가 아니라 "진단 결과 생성 중 문제가 생겼습니다. 입력은 저장되어 있습니다."처럼 안심시키는 톤

---

## 8. Responsive Strategy

### Desktop

- 기본 타겟. CEO 미팅/워크샵에서는 노트북 또는 대형 화면이 기준.
- Left rail 고정, content 1180px 내.

### Tablet

- Left rail은 compact rail로 축소.
- Right context panel은 main content 아래로 이동.

### Mobile

- 진단 입력은 가능해야 하지만 결과/시뮬레이션은 읽기 위주.
- Matrix는 두 개를 세로 스택하고 사분면 label을 줄인다.
- Report preview는 한 페이지씩 swipe.

---

## 9. Copy System

### 9-1. 좋은 카피

- "이 선택은 정답이 아니라 설계 방향입니다."
- "모른다는 응답도 중요한 데이터입니다."
- "이 화면은 제도 운영 체력을 보기 위한 단계입니다."
- "시나리오는 선택지가 아니라 감수할 비용의 묶음입니다."
- "아래 기준점은 따라 하라는 뜻이 아닙니다."

### 9-2. 피해야 할 카피

- "AI가 최적의 인사제도를 추천합니다."
- "귀사의 문제점은 다음과 같습니다."
- "이 시나리오를 선택하세요."
- "자동으로 완벽한 로드맵을 생성합니다."
- "직원 성과를 정밀 감시합니다."

---

## 10. 우선순위

### Phase 1: 시안 구현의 핵심 화면

1. `/intro`
2. `/diagnosis/philosophy`
3. `/diagnosis/context`
4. `/diagnosis/workforce`
5. `/diagnosis/rewards`
6. `/diagnosis/evaluation-leadership`
7. `/result/summary`
8. `/simulation`

### Phase 2: 리포트/실행 완성도

1. `/result/detail`
2. `/simulation/scenarios`
3. `/simulation/scenarios/[scenarioId]`
4. `/execution/roadmap`
5. `/report/preview`

### Phase 3: HITL 운영

1. `/admin/cases`
2. `/admin/cases/[caseId]/review`
3. PDF 최종 생성/검토 플로우

---

## 11. 최종 디자인 판단 기준

아래 질문에 모두 "예"라고 답할 수 있어야 한다.

- 이 화면은 대표가 미팅 자리에서 열어도 부끄럽지 않은가?
- AI SaaS 템플릿처럼 보이지 않는가?
- 평가/감시 도구처럼 보이지 않는가?
- CEO가 자신의 철학과 결과를 연결해 이해할 수 있는가?
- 인건비/재무 임팩트가 화면 안에서 빠지지 않는가?
- 한 번에 다 바꾸라는 인상을 주지 않는가?
- 가시성 지수와 트레이드오프 매트릭스가 signature IP처럼 보이는가?
- Next.js 컴포넌트로 1:1 구현 가능한 시각 단위로 쪼개져 있는가?

---

## 12. 한 문장 결론

Transition Gap의 디자인은 "멋진 HR SaaS"가 아니라 **대표가 조직 운영 체계를 다시 설계하기 전에 펼쳐보는 조용하고 날카로운 컨설팅 워크스페이스**여야 한다.
