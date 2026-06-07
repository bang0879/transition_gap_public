# AGENTS.md — Transition Gap 현재 작업 기준

이 파일은 Codex 세션에서 먼저 읽는 프로젝트 기준 문서다. 과거 Streamlit 기준 문서는
`docs/legacy/AGENTS_streamlit_legacy_260607.md`에 보존한다.

---

## 0. 프로젝트 정체성

**Product 작업명**: Transition Gap

**한 줄 정의**: 한국 스타트업의 인사 철학, 현행 제도, 실행 부담 사이의 정합성 차이를 진단하고, 대표/Head of People이 단계적 실행 방향을 판단하도록 돕는 HITL MVP 도구.

**핵심 사용자**:
- Primary: 한국 스타트업 대표 또는 Head of People
- 조직 규모: 대략 30~150명, Series A~B 전후
- 입력 주체: 대표 또는 Head of People 단독 입력

**제품 원칙**:
- 정답 추천 도구가 아니라 의사결정 보조 도구다.
- 진단 없이 제도부터 추천하지 않는다.
- 한 번에 다 바꾸라는 권고를 하지 않는다.
- 인건비, 평가 수용성, 리더 운영 부담 등 실행 비용을 함께 보여준다.
- 평가/감시 도구처럼 보이는 UI를 피한다.
- 글로벌 HR SaaS를 흉내 내지 않고 한국 스타트업 대표가 바로 이해할 언어를 쓴다.

---

## 1. 현재 확정 스택

현재 시안은 **Streamlit이 아니라 Next.js + FastAPI** 기준이다.

```text
Frontend: frontend/ — Next.js 15, React 19, TypeScript, Tailwind, Zustand, TanStack Query
Backend:  backend/  — FastAPI, Python 3.12, Pydantic, SQLite event logging
State:    frontend localStorage persist
Charts:   custom SVG/React components
PDF:      정식 생성 없음. 현재는 window.print() 기반 브라우저 인쇄/PDF 저장만 사용
LLM:      현재 MVP에서는 사용하지 않음. 규칙 기반 분석 유지
```

Streamlit 관련 파일과 기록이 일부 남아 있어도, 현재 작업은 `frontend/`와 `backend/` 기준으로 판단한다.

---

## 2. 현재 디렉터리 기준

```text
transition-gap/
├── frontend/                  # Next.js 클라이언트
│   ├── app/
│   ├── components/
│   └── lib/
├── backend/                   # FastAPI 백엔드
│   ├── app/
│   ├── core_tests/
│   └── tests/
├── docs/
│   ├── decisions.md
│   ├── feedback/
│   └── legacy/
├── instruction(kyle)/         # 사용자 지시서 모음
└── AGENTS.md
```

---

## 3. 현재 제품 흐름

1. 랜딩
2. `/diagnose/philosophy` — 회사의 인사 철학 입력
3. `/diagnose/philosophy/profile` — 철학 충돌 가능성 확인
4. `/diagnose/context` — 조직 컨텍스트
5. `/diagnose/workforce` — 인력운영/채용
6. `/diagnose/rewards` — 총보상
7. `/diagnose/evaluation` — 평가/리더십
8. `/result` — 진단결과 요약
9. `/result/detail` — 상세 분석
10. `/matrix` — Matrix A/B와 시나리오 연결 힌트
11. `/scenarios` — 시나리오 비교와 제도별 도입/보류/대체 검토
12. `/roadmap` — 고정 구조의 12개월 실행 로드맵

---

## 4. 확정된 보류/구현 기준

### 철학 정렬/수정 flow
- 충돌을 보여주되 재선택을 유도하지 않는다.
- 철학 프로필에서 충돌을 인지한 뒤 그대로 진행한다.
- 결과 페이지 STEP 01에서 철학 충돌 가능성을 상기시키는 정도로 충분하다.

### PDF/리포트 구조
- 현재는 `window.print()` 유지.
- 정식 PDF 생성, 한글 폰트, 페이지 분할, CEO용 1장 요약 구조는 다음 단계에서 설계한다.
- 지금 단계에서 PDF 라이브러리나 백엔드 PDF 생성 로직을 새로 넣지 않는다.

### Matrix와 시나리오
- 매트릭스에서 "검토 중" 시나리오를 고르고 `/scenarios?scenario=...`로 넘기는 현재 흐름을 유지한다.
- 매트릭스를 보기 전용 차트로 분리하지 않는다.
- URL query parameter 기반 상태 전달을 유지한다.

### 시나리오 선택 깊이
- 제도별 `도입/보류/대체 검토` 선택은 시나리오 화면 안에서만 반영한다.
- 선택 결과를 로드맵 순서나 PDF에 자동 연결하지 않는다.

### 로드맵
- 현재 고정 구조 유지.
- 시나리오 선택에 따라 로드맵 순서를 자동 재계산하지 않는다.

### 데이터 저장/반복 진단
- 현재는 Zustand persist(localStorage)와 SQLite 이벤트 로깅을 유지한다.
- 고객사별 workspace, Postgres, 반복 진단 정식 이력 관리는 유료 고객 3곳 이상 확보 후 별도 스코프다.
- SQLite 이벤트 로깅은 화면별 이탈 분석용이며 고객 데이터 저장소로 확대하지 않는다.

### LLM/Gemini
- 현재 MVP에서는 LLM을 연결하지 않는다.
- 진단 결과는 규칙 기반 분석과 정적 콘텐츠로 재현성 있게 유지한다.

### 브랜드
- 제품명은 당분간 Transition Gap 유지.
- 브랜드, 아이콘, 정식 이름은 기능 확정과 PDF 구조 확정 이후 일괄 결정한다.

---

## 5. 시각 QA 기준

우선 viewport:
- Desktop: 1440px
- iPad Pro: 1024px
- iPad Air: 820px

확인 대상:
- 매트릭스 도형/화살표/사분면 설명 겹침
- 결과 요약 흐름
- 랜딩 미리보기

Mobile 390px은 현재 스코프가 아니다.

---

## 6. 개발/검증 명령

Frontend:

```powershell
cd frontend
npm.cmd run typecheck
```

Backend:

```powershell
backend\.venv\Scripts\python.exe -m compileall backend\app backend\core_tests backend\tests
```

가능하면 로컬 화면 확인:

```text
http://localhost:3000/result
http://localhost:3000/result/detail
http://localhost:3000/matrix
http://localhost:3000/scenarios
http://localhost:3000/roadmap
```

브라우저 스크린샷 도구가 Windows sandbox 오류로 실패할 수 있다. 실패하면 그 사실을 명확히 기록하고, 최소한 typecheck와 backend compile 검증은 수행한다.

---

## 7. 작업 시 주의

- 사용자 지시서와 이 문서가 충돌하면 최신 사용자 지시서를 우선한다.
- `frontend/`와 `backend/` 기준으로만 작업한다.
- Streamlit 방향으로 되돌아가지 않는다.
- 사용자 미확정 항목을 임의로 크게 구현하지 않는다.
- 제품 언어는 대표/Head of People이 바로 이해할 수 있는 한국어를 우선한다.
- 내부 계산식, raw score, 개발자용 설명은 대표 화면에 노출하지 않는다.
- 기존 git status의 무관 변경은 건드리지 않는다.

---

**Last Updated**: 2026-06-07
**Current Phase**: 기능 확정 및 구현
