# 260605 안정성 기준 작업 백로그

목표:
- 기존 Next.js/FastAPI 시안의 안정성과 현재 완성도를 해치지 않는 범위에서 먼저 반영할 피드백을 추린다.
- 도메인 로직, 데이터 계약, 화면 흐름을 크게 바꾸는 항목은 별도 검토/설계로 분리한다.

분류 기준:
- `바로 반영`: 단일 컴포넌트/문구/표기/스타일 수정 중심. typecheck로 회귀 확인 가능.
- `주의해서 반영`: 여러 화면에 영향이 있거나 백엔드 문구/프론트 표시가 함께 바뀜. 테스트 추가 권장.
- `보류/설계 필요`: 제품 흐름, 추천 로직, 분석 기준, public-facing narrative가 바뀜. 먼저 화면 구조/정책 결정 필요.

---

## A. 바로 반영할 Task

### Task A1. 선택지 볼드 규칙 정리

상태: 바로 반영

대상:
- `frontend/components/forms/OptionGrid.tsx`
- 필요 시 `frontend/components/forms/SegmentedScale.tsx`

내용:
- 부연 설명 없는 string 선택지는 bold 제거 또는 medium 이하로 낮춤.
- 부연 설명 있는 object 선택지는 label bold 유지.
- 선택된 상태의 버튼 전체 bold도 완화.

완료 기준:
- 일반 선택지는 질문 텍스트보다 시각적으로 약하게 보임.
- 설명이 있는 선택지는 label/description 위계가 유지됨.
- `npm.cmd run typecheck` 통과.

리스크:
- 낮음. UI 시각 위계 수정.

---

### Task A2. 철학 프로필 충돌 박스 색상 무채색화

상태: 바로 반영

대상:
- `frontend/app/diagnose/philosophy/profile/page.tsx`
- `frontend/lib/utils/philosophyProfile.ts`는 문구 확인만

내용:
- 충돌 확인 영역의 파란/강한 색감을 slate/neutral 계열로 변경.
- 충돌 자체는 `↔`와 소량의 accent만 사용.

완료 기준:
- 충돌 섹션이 주황/파랑 계열과 과하게 겹치지 않음.
- 충돌 메시지는 여전히 눈에 들어옴.
- `npm.cmd run typecheck` 통과.

리스크:
- 낮음. 스타일 수정.

---

### Task A3. 평가 공정성 선택지 축소

상태: 바로 반영

대상:
- `frontend/app/diagnose/evaluation/page.tsx`

내용:
- 두 문항 공통 `fairnessAgreementOptions`를 6개에서 4개 또는 5개로 축소.
- 권장안:
  - `운영하지 않음` value 0
  - `아니다` value 2
  - `보통이다` value 5
  - `그렇다` value 8
  - `매우 그렇다` value 10
- 더 과감히 줄이면:
  - `운영하지 않음`, `아니다`, `보통이다`, `그렇다`

완료 기준:
- 카드 밀도가 줄어듦.
- backend가 number value를 받는 기존 계약 유지.
- `npm.cmd run typecheck` 통과.

리스크:
- 낮음~중간. 기존 응답 value와 달라질 수 있으나 numeric scale 구조는 유지됨.

---

### Task A4. 정합성 카드 철학 note를 해석 문장으로 교체

상태: 바로 반영

대상:
- `backend/app/core/alignment_map.py`
- `frontend/lib/utils/alignmentMapFallback.ts`

내용:
- `L0-1 보상 분배 철학에서 도출했습니다.` 같은 출처 설명 제거.
- 사용자가 이해할 해석 문장으로 교체.
- 예시:
  - 보상: `회사는 고성과자에게 차등을 크게 주는 방식보다, 안정적이고 납득 가능한 보상 질서를 더 중시합니다.`
  - 채용: `회사는 당장 검증된 외부 인재를 빠르게 데려오기보다, 회사 맥락에 맞는 사람을 키우는 방향을 중시합니다.`
  - 인력운영: `회사는 핵심 인재 예외 보상보다 전체 보상 원칙과 형평성을 우선합니다.`
  - 리더십: `회사는 성과 부진을 빠르게 직면하기보다, 관계와 심리적 안전을 먼저 지키는 리더십을 중시합니다.`

완료 기준:
- 결과 요약 카드에서 L0 코드/문항 출처가 보이지 않음.
- 대표/Head of People이 선택 의미를 한 문장으로 이해 가능.
- backend core tests 통과.

리스크:
- 낮음~중간. 문구 품질이 중요하지만 로직 변경 없음.

---

### Task A5. 트레이드오프 설명 문장 정리

상태: 바로 반영

대상:
- `frontend/app/(analysis)/matrix/page.tsx`

내용:
- `얻는 것: ... 확인합니다`, `감수할 것: ... 봅니다`처럼 행동 지시형 문장을 제거.
- 실제 trade-off를 명사형/판단형으로 정리.
- 예:
  - 얻는 것: `선택한 방향은 인재 메시지, 보상 원칙, 의사결정 속도를 선명하게 만듭니다.`
  - 감수할 것: `반대로 인건비, 평가 갈등, 리더 운영 부담이 커질 수 있습니다.`

완료 기준:
- 카드 문장이 "무엇을 얻고 무엇을 감수하는지"로 읽힘.
- `npm.cmd run typecheck` 통과.

리스크:
- 낮음. 문구 수정.

---

### Task A6. 용어 미세 정리 1차

상태: 바로 반영

대상:
- `frontend/app/(analysis)/result/page.tsx`
- `frontend/components/detail/ScoreHero.tsx`
- `frontend/lib/utils/areaDisplay.ts`
- 기타 검색 결과

내용:
- `teal 영역` → `초록색 영역`.
- `상세로` → `상세 분석으로`.
- `재무영향과 단위`가 남아 있으면 `재무 영향`.
- `리더십·거버넌스` 사용자 노출을 `평가/리더십` 또는 `리더십 실행`으로 1차 치환.

완료 기준:
- 사용자 화면에서 어색한 용어가 줄어듦.
- `npm.cmd run typecheck` 통과.

리스크:
- 낮음~중간. backend area_name을 바꾸면 테스트/화면 영향이 있을 수 있으므로 1차는 frontend display name 중심.

---

### Task A7. 영역별 상세 숫자 표기 1차 통일

상태: 바로 반영

대상:
- `frontend/components/detail/BreakdownTable.tsx`
- `frontend/components/detail/AsIsToBePanel.tsx`
- 가능하면 `backend/app/core/analysis_engine.py`의 `_text`

내용:
- `4.0점` → `4점`
- list 표시 대괄호 제거는 유지
- 단위 없는 소수(`0.2`)가 사용자 화면에 보이면 `낮음/중간/높음` 또는 `%/점`으로 변환.

완료 기준:
- 상세 분석 주요 표/카드에서 raw 숫자/배열 표기가 보이지 않음.
- backend core tests + frontend typecheck 통과.

리스크:
- 낮음~중간. backend formatter를 건드릴 경우 회귀 테스트 필요.

---

### Task A8. 하단 CTA/버튼 문구 최종 정리

상태: 바로 반영

대상:
- `frontend/app/(analysis)/matrix/page.tsx`
- `frontend/app/(analysis)/scenarios/page.tsx`
- `frontend/app/(analysis)/roadmap/page.tsx`

내용:
- 이미 하단 버튼은 추가됨.
- 버튼/설명 문구를 현재 탭명과 맞춤.
- `매트릭스로` → `트레이드오프 분석으로` 등.

완료 기준:
- 이전/다음 버튼명이 좌측 navigation 또는 페이지 제목과 충돌하지 않음.
- `npm.cmd run typecheck` 통과.

리스크:
- 낮음. 문구 수정.

---

## B. 주의해서 반영할 Task

### Task B1. 결과 요약 카드 내부 구조 개선

상태: 주의해서 반영

대상:
- `frontend/components/visualization/AlignmentTensionMap.tsx`
- `backend/app/core/alignment_map.py`
- `frontend/lib/types/api.ts`

내용:
- 각 카드 안에서 `인사 철학`과 `현행 제도`를 분리된 미니 영역으로 보여줌.
- 정합 퍼센트 bar는 보조 정보로 내려서 시선 우선순위를 낮춤.
- `선택 근거`는 raw evidence가 아니라 해석 요약 중심.

완료 기준:
- 대표가 `내 철학이 뭐였지?`, `현행 제도는 뭔데?`를 카드 안에서 바로 이해.
- typecheck + backend core tests 통과.

리스크:
- 중간. 결과 첫 화면의 핵심 UI라 시각 회귀 가능. screenshot 확인 필요.

---

### Task B2. 결과 요약 해석 순서 보조 UI 추가

상태: 주의해서 반영

대상:
- `frontend/app/(analysis)/result/page.tsx`
- 새 컴포넌트 후보: `frontend/components/result/ResultReadingFlow.tsx`

내용:
- 결과 요약 상단에 3~4단계 읽는 순서 표시.
- 예:
  1. 철학-제도 정합성
  2. 왜 위험한가
  3. 어느 영역부터 볼 것인가
  4. 상세/트레이드오프로 이동

완료 기준:
- 기존 card/memo/metric들이 병렬 나열처럼 보이지 않음.
- 페이지 스크롤 길이 증가를 최소화.

리스크:
- 중간. 잘못 넣으면 텍스트가 더 늘어나 혼란이 커질 수 있음.

---

### Task B3. Operating risk / 제도 간 충돌 경고 위치와 톤 재정리

상태: 주의해서 반영

대상:
- `frontend/components/visualization/AlignmentTensionMap.tsx`

내용:
- `제도 간 충돌 경고`를 뜬금없는 별도 정보가 아니라 `왜 정렬해야 하는가` 섹션으로 재배치.
- 경고색 반복을 줄이고 neutral card + 작은 severity signal 사용.

완료 기준:
- 정합성 괴리 → 운영 리스크가 자연스럽게 이어짐.
- 전체가 "다 위험"처럼 보이지 않음.

리스크:
- 중간. 결과 요약 핵심 시선 변경.

---

### Task B4. 매트릭스 축/라벨 겹침 완화 1차

상태: 주의해서 반영

대상:
- `frontend/components/visualization/MatrixSVG.tsx`

내용:
- y축 설명을 SVG 내부에서 밖으로 이동하거나 상하 별도 legend로 분리.
- quadrant label 위치를 더 바깥쪽으로 배치.
- marker label은 필요 시 SVG 내부 text 대신 외부 absolute layer/card로 이동.

완료 기준:
- As-Is/To-Be marker, arrow, quadrant label, axis label이 겹치지 않음.
- desktop + iPad 폭에서 확인.

리스크:
- 중간. SVG 레이아웃은 작은 변경에도 깨질 수 있음. 화면 검증 필수.

---

### Task B5. 시나리오 상세의 얻는 것/감수할 것 설명 강화

상태: 주의해서 반영

대상:
- `frontend/components/scenario/ScenarioDetailPanel.tsx`
- 필요 시 `backend/app/content/scenarios.json`

내용:
- 현재 metric concat 수준의 `detailedGain`, `detailedCost`를 시나리오별 설명 문장으로 강화.
- "왜 이 효과가 생기는지"를 1~2문장 추가.
- 기존 `rationale` 원문 노출은 피하고, 간단한 산정 가정/방향만 설명.

완료 기준:
- 선택한 시나리오 상세가 이전 카드와 중복되지 않음.
- 대표가 의사결정 기준으로 읽을 수 있음.

리스크:
- 중간. 콘텐츠 품질과 중복도가 핵심.

---

### Task B6. 로드맵 참고 운영 이미지 상세화

상태: 주의해서 반영

대상:
- `frontend/components/roadmap/RoadmapTimeline.tsx`
- `frontend/components/scenario/ScenarioDetailPanel.tsx`

내용:
- Google/Netflix/토스식 참고 이미지를 더 구체화.
- "그대로 따라 하라"가 아니라 "이런 운영 장치가 함께 있어야 한다"는 방식으로 설명.

완료 기준:
- `그래서 다른 회사는 어떻게 하는데요?` 질문에 최소한의 답이 됨.
- 특정 회사명 오용/과장 위험이 없음.

리스크:
- 중간. 레퍼런스 기업명은 신뢰와 오해 리스크가 있어 문구 신중 필요.

---

## C. 보류/설계 필요 Task

### Task C1. 철학 정렬 기능

상태: 보류/설계 필요

이유:
- 단순 UI가 아니라 "충돌된 철학을 수정하게 할 것인가", "충돌을 인정하고 진행하게 할 것인가", "어느 철학을 우선 기준으로 삼을 것인가"라는 제품 정책 결정이 필요.
- 잘못 넣으면 사용자가 정답을 강요받는 느낌을 받을 수 있음.

먼저 결정할 것:
- 철학 충돌 시 `재선택 유도` vs `우선순위 선택` vs `충돌 인정 후 진행`.
- 충돌이 있는 경우 결과 요약에서 어떤 기준으로 비교할지.

---

### Task C2. 결과 요약 전체 재구성

상태: 보류/설계 필요

이유:
- 현재 결과 요약은 여러 피드백이 모인 핵심 화면.
- 단순 순서 변경으로 끝나지 않고, `정합성`, `필요 기준`, `가시성`, `우선순위`, `다음 화면`의 정보 계층을 재설계해야 함.

먼저 결정할 것:
- 결과 요약의 1차 질문은 무엇인가?
  - `우리 회사 철학과 제도는 맞는가?`
  - `어느 영역부터 고칠 것인가?`
  - `데이터 신뢰도는 충분한가?`
- 필요 기준/Radar를 결과 요약에 계속 둘지, 상세 분석으로 내릴지.

---

### Task C3. 정합성 기준과 필요 기준의 분석 단계 분리

상태: 보류/설계 필요

이유:
- 프론트 문구만 바꾸면 해결되지 않음.
- backend에서 `alignment_map`과 `areas.benchmark/gap`이 다른 기준을 쓰는 것이 자연스럽게 설명되어야 함.

먼저 결정할 것:
- `철학 정합성`과 `운영 필요 기준`을 별도 단계로 명명할지.
- 상세 분석에서 정합성 용어를 줄이고 "운영 기준 차이"로 통일할지.

---

### Task C4. 시나리오 선택과 To-Be 좌표 연동

상태: 보류/설계 필요

이유:
- 현재 To-Be는 대표 철학 기반이고, 시나리오는 가능한 운영 패키지임.
- 시나리오 선택으로 To-Be 좌표를 움직이면 "철학 기준"과 "선택 시나리오" 기준이 섞일 수 있음.

먼저 결정할 것:
- To-Be는 고정 철학 지점인가, 선택한 시나리오의 목표 지점인가?
- matrix page에서 시나리오 선택을 유지할지, 시나리오 선택은 다음 화면으로 넘길지.

---

### Task C5. public-facing PDF 저장 기능

상태: 보류/설계 필요

이유:
- `window.print()`를 대체하려면 인쇄 CSS, PDF layout, 한글 폰트, 페이지 분할까지 별도 품질 작업 필요.
- 지금 진단 내용/흐름 픽스가 우선.

먼저 결정할 것:
- 브라우저 print CSS 고도화 vs backend PDF 생성.
- MVP에서 필요한 출력 품질 수준.

---

### Task C6. 앱 이름/브랜드 아이콘 변경

상태: 보류/설계 필요

이유:
- 브랜드 네이밍/아이콘은 전체 UI, README, repo description, 랜딩 copy에 영향.

먼저 결정할 것:
- Transition Gap 유지 여부.
- 후보명: Align HR, HR Sync 등 네이밍 방향.

---

## 추천 실행 순서

### Sprint 1. Low-risk polish

1. Task A1 선택지 볼드 규칙
2. Task A2 철학 프로필 충돌 박스 색상
3. Task A3 평가 공정성 선택지 축소
4. Task A4 정합성 카드 철학 note 해석 문장
5. Task A5 트레이드오프 설명 문장
6. Task A6 용어 미세 정리
7. Task A7 상세 숫자 표기 1차 통일
8. Task A8 하단 CTA/버튼 문구 정리

### Sprint 2. Controlled UI restructuring

1. Task B1 정합성 카드 내부 구조 개선
2. Task B2 결과 요약 읽는 순서 보조 UI
3. Task B3 operating risk 위치/톤 재정리
4. Task B4 매트릭스 축/라벨 겹침 완화

### Sprint 3. Content depth

1. Task B5 시나리오 얻는 것/감수할 것 설명 강화
2. Task B6 로드맵 참고 운영 이미지 상세화
3. 전반 워딩/용어 consistency pass

### 별도 설계 미팅 후

1. Task C1 철학 정렬 기능
2. Task C2 결과 요약 전체 재구성
3. Task C3 분석 단계 분리
4. Task C4 시나리오-To-Be 좌표 연동
5. Task C5 PDF 저장
6. Task C6 브랜드/아이콘
