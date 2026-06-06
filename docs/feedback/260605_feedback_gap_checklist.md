# 260605 피드백 누락 감사 체크리스트

기준 문서:
- `260603 저녁 수정.md`
- `260603 수정.md`
- `260602.md`
- `260531.md`
- `260528 수정.md`
- `260527 수정.md`
- `260526 수정.md`
- `260523 수정.md`
- `260522 빌드 피드백.md`

현재 작업 대상:
- `frontend/` Next.js
- `backend/` FastAPI
- Streamlit은 대상 아님

상태 표기:
- `[미반영]` 아직 코드에 남아 있거나 구조적으로 해결되지 않음
- `[부분반영]` 일부는 고쳤지만 피드백 취지까지는 부족함
- `[반영됨]` 현재 코드 기준 해결됨
- `[확인필요]` 실행 화면/브라우저 확인 또는 의사결정 필요

---

## P0. 먼저 풀어야 하는 큰 구조 이슈

- [ ] `[미반영]` 결과 요약의 해석 흐름 재구성
  - 원 피드백: 대표가 `왜 이 정보가 이 순서로 나오는지`, `그래서 무엇을 봐야 하는지` 이해하기 어렵다.
  - 기대 흐름:
    1. 대표/회사의 인사철학과 현행 제도의 정합성 확인
    2. 정합성이 어긋나면 생기는 운영 리스크 설명
    3. 5개 영역의 전체 문제와 우선순위 시각화
    4. 상세 분석/트레이드오프/로드맵으로 이어지는 해석 순서 안내
  - 현재 근거: `frontend/app/(analysis)/result/page.tsx`에 정합성 맵, MemoBlock, 필요 기준 도움말, decision card, metric card가 병렬 배치되어 있으나 단계적 해석 내러티브가 약함.

- [ ] `[미반영]` "정합성 기준"과 "필요 기준/벤치마크 기준"의 관계 정리
  - 원 피드백: 결과 요약은 대표 철학과 현행 제도 정합성을 말하고, 상세 분석은 필요 기준과 현행 점수 차이를 말해 기준이 달라 보인다.
  - 해야 할 일: 결과 페이지를 분석 단계로 분리하거나, 동일 페이지 안에서 `1단계 철학 정렬`, `2단계 현행 제도 필요 기준 비교`, `3단계 트레이드오프`처럼 기준 차이를 명시.
  - 현재 근거: `AlignmentTensionMap`은 철학 대비 정합성, `RadarChart/GapBarList/ScoreHero`는 필요 기준 대비 점수 차이를 사용.

- [ ] `[미반영]` 대표 철학 자체가 충돌할 때의 처리 순서 정리
  - 원 피드백: 철학 자체가 어긋나 있다면 그 철학에 제도를 맞추면 안 되고, 먼저 철학을 정렬해야 한다.
  - 해야 할 일: 철학 프로필 화면에서 `철학 재정렬` 또는 `충돌을 인정하고 진행`의 명확한 흐름 제공.
  - 현재 근거: `frontend/app/diagnose/philosophy/profile/page.tsx`는 충돌 표시 후 다음 단계 이동은 가능하나 철학 정렬 기능은 없음.

- [ ] `[부분반영]` 제도 간 충돌 분석 강화
  - 원 피드백: 보상/채용/평가/리더십 등 제도끼리의 엇박자가 더 명확히 보여야 한다.
  - 현재 반영: `AlignmentTensionMap`에 `제도 간 충돌 경고`가 있음.
  - 남은 일: 단순 상위 3개 경고가 아니라 "어떤 제도 쌍이 왜 충돌하는지"를 더 구조적으로 보여주기.

---

## P1. 260603 저녁 수정 기준 미반영 항목

- [ ] `[미반영]` 선택지 볼드 규칙 수정
  - 원 피드백: 부연 설명 없는 선택지는 질문과 같은 볼드라 눈이 아프다. 부연 설명 있는 경우만 label 볼드 유지.
  - 현재 근거: `frontend/components/forms/OptionGrid.tsx`에서 모든 option label이 `font-[680]`.
  - 작업: string option은 normal/medium, object option label은 bold 유지.

- [ ] `[미반영]` 철학 프로필 충돌 확인 박스 색상 재조정
  - 원 피드백: 충돌 확인의 파란색 박스를 무채색 등으로 변경.
  - 확인 대상: `frontend/app/diagnose/philosophy/profile/page.tsx`, `frontend/lib/utils/philosophyProfile.ts`.

- [ ] `[미반영]` 철학 정렬 기능 추가
  - 원 피드백: "철학 정렬하는 기능 넣기로 하지 않았나?"
  - 작업: 충돌된 쌍에서 어느 철학을 우선할지 선택/수정하는 CTA 또는 재선택 flow.

- [ ] `[미반영]` 평가 공정성 문항 선택지 수 축소
  - 원 피드백: 두 공정성 질문 선택지를 줄이기로 했는데 아직 6개.
  - 현재 근거: `frontend/app/diagnose/evaluation/page.tsx`의 `fairnessAgreementOptions`가 6개.
  - 작업 후보: `운영하지 않음` + 3~4단계로 재구성.

- [ ] `[미반영]` 정합성 카드의 철학 설명 교체
  - 원 피드백: `L0-1 보상 분배 철학에서 도출했습니다.` 대신 대표가 이해할 해석 문장 필요.
  - 현재 근거: `backend/app/core/alignment_map.py`에 보상/채용/인력운영/리더십 note가 여전히 `L0-x ...에서 도출했습니다.`
  - 예: `핵심 고성과자에 대한 차별적 배분보다 균등하고 안정적인 보상을 추구합니다.`

- [ ] `[부분반영]` 영역별 상세 분석 현재 응답 표기 통일
  - 현재 반영: `BreakdownTable.displayValue`, `AsIsToBePanel.normalizeAnswerValue`에서 대괄호/따옴표/소수점 일부 정리.
  - 남은 일: 모든 `status_text`, `score_breakdown.value`, 상세 패널에서 `1.0`, `2`, `4.0점`, `0.2` 같은 숫자 표기 기준 일괄 통일.

- [ ] `[미반영]` 트레이드오프 매트릭스 화살표/텍스트 겹침 재수정
  - 원 피드백: 화살표와 텍스트 겹침, `팀 시너지 / 개인 압도적 성과` 정렬 이상.
  - 현재 근거: `MatrixSVG`는 label offset만 조정하며 축 설명은 여전히 SVG 내부 좌표에 표시.
  - 작업: 축 설명을 매트릭스 밖 legend 영역으로 분리하거나, SVG 여백/label avoidance를 재설계.

---

## P1. 랜딩 페이지

- [x] `[반영됨]` 결과 리포트 미리보기 과대/스크롤 문제 완화
  - 현재 근거: `LandingHero` right column 축소, `MiniAlignmentPreview`, `PreviewAside` compact화.

- [x] `[반영됨]` 랜딩 하단 로드맵 노출 롤백 및 진단 흐름 팝업화
  - 현재 근거: `DiagnosisFlowModal`, `ProcessStrip` 존재.

- [ ] `[부분반영]` 랜딩 미리보기 Aha/코어 결과물 임팩트
  - 현재 반영: 정합성 카드 미리보기 도입.
  - 남은 일: 결과물 기대감이 충분한지 화면 확인 필요. 260528/260522 피드백은 "와 이 정도 결과물이 나온다고?" 수준을 요구.

- [ ] `[확인필요]` 랜딩 아이콘/앱 이름
  - 원 피드백: Transition Gap 이름/아이콘은 추후 변경 예정. Align HR, HR Sync 등 후보 필요.
  - 현재 근거: `BrandMark`, `LandingHero`는 여전히 Transition Gap.

- [ ] `[부분반영]` 랜딩 메인 카피 강조
  - 원 피드백: 핵심 문장 `하나의 일관된 경영 철학...정렬` 강조 필요.
  - 확인 대상: `frontend/components/landing/LandingHero.tsx`.

---

## P1. 진단 입력 화면

- [x] `[반영됨]` 오른쪽 설명 박스 sticky
  - 현재 근거: `ContextPanel`이 `xl:sticky xl:top-9`.

- [x] `[반영됨]` 인력/채용 문항 수 보강
  - 현재 근거: `2-1-4`, `2-1-5`, `2-2-4`, `2-2-5` 추가.

- [ ] `[부분반영]` 평가/리더십 선택지 과밀
  - 현재 반영: 일부 문항은 label+description 구조.
  - 남은 일: 공정성 2문항 6개 선택지 축소.

- [ ] `[부분반영]` "대표" 워딩을 "회사"로 전반 치환
  - 현재 근거: 여러 화면/백엔드 문구에 `대표`, `대표님`이 남아 있음.
  - 주의: CEO 단독 입력 맥락에서는 남길 수 있으나, 결과 리포트 독자는 Head of People일 수도 있어 기준 필요.

- [ ] `[부분반영]` 조직 컨텍스트/인력채용/총보상 안내 문구 쉬운 워딩화
  - 확인 대상:
    - `frontend/app/diagnose/context/page.tsx`
    - `frontend/app/diagnose/workforce/page.tsx`
    - `frontend/app/diagnose/rewards/page.tsx`

- [x] `[반영됨]` 복리후생 질문에서 직급/호칭 제거 및 모르겠음 추가
  - 현재 근거: `test_schema_wording.py`에 `2-3-6` regression test 존재.

---

## P1. 진단결과 요약

- [ ] `[미반영]` 정합성 카드 내부 정보 구조 개선
  - 원 피드백: 인사철학/현행제도가 텍스트로 섞여 있고 정합 슬라이더/바에 눈이 먼저 감.
  - 작업: 카드 안에 `인사철학 해석`과 `현행 제도 해석`을 분리된 미니 카드/행으로 재구성.

- [ ] `[미반영]` 정합성 카드 철학 note 해석 강화
  - 현재 근거: `backend/app/core/alignment_map.py`의 `philosophy_note`가 아직 L0 출처 설명.

- [ ] `[부분반영]` 색상 과다/심각도 색감
  - 현재 반영: 랜딩/결과 일부 색감 절제.
  - 남은 일: `AlignmentTensionMap`의 coral/amber가 계속 강하게 반복되어 전체가 심각하게 보인다는 피드백 재확인.

- [ ] `[부분반영]` 현행 인사제도 방향 요약의 초록/볼드 톤 조정
  - 현재 근거: `AlignmentTensionMap.directionSummary` 영역에 `font-[700]`과 teal label 사용.

- [ ] `[미반영]` operating risk/제도 간 충돌 경고의 자연스러운 위치 재배치
  - 원 피드백: 갑자기 operating risk가 뜬금없고 사족처럼 느껴짐.
  - 작업: 정합성 괴리 직후 "왜 고쳐야 하는가" 단계로 위치/제목 재구성.

- [x] `[반영됨]` Aha Moment 워딩 제거
  - 현재 검색 기준 주요 코드에서 `Aha Moment` 없음.

- [x] `[반영됨]` 정합성 텐션 → 정합성 괴리, 텐션 포인트 → 핵심 엇박자 요인
  - 현재 근거: `AlignmentTensionMap` 사용 문구.

- [x] `[반영됨]` 거리 숫자값 제거
  - 현재 정합성 카드에는 distance 숫자 대신 정합 percent 사용.

- [x] `[반영됨]` `인재`/`인력` 도메인 라벨 혼선 완화
  - 현재 근거: `displayDomainName`, backend domain_name에서 `채용`, `인력운영`.

- [ ] `[부분반영]` HR 가시성 뱃지 색상 일관성
  - 원 피드백: 같은 65%인데 데이터 신뢰도와 HR 가시성 색이 달랐음.
  - 현재 근거: `result/page.tsx`에서 `visibilityVariant`를 공유하므로 개선된 것으로 보이나 실제 화면 확인 필요.

- [x] `[반영됨]` 진단 안 된 영역명 표시
  - 현재 근거: `visibility.blind_spot_labels.join(", ")`.

- [ ] `[부분반영]` 레이더/Radar 기준점 신뢰도
  - 원 피드백: 모든 영역 기준점이 75점 오각형이면 임의로 보임.
  - 확인 대상: backend benchmark 로직과 `RadarChart`.
  - 현재 검색 근거: `RadarChart` 자체는 `area.benchmark`를 쓰는지 확인 필요. 백엔드 benchmark가 충분히 회사 규모/철학별로 달라지는지도 확인 필요.

- [ ] `[부분반영]` 읽는 방법 문구
  - 원 피드백: `teal 영역` 대신 `초록색 영역`.
  - 확인 대상: `result/page.tsx`; 이전 검색에서 현재는 `초록색 영역`으로 일부 반영됨.

- [x] `[반영됨]` 하단 상세 분석 CTA 추가
  - 현재 근거: `result/page.tsx` 하단 next section 존재.

- [ ] `[확인필요]` 리포트 저장/PDF 출력 개선
  - 현재 근거: `window.print()` 사용. 아직 "예쁜 PDF 바로 저장"은 미반영.

---

## P1. 영역별 상세 분석

- [x] `[반영됨]` 대괄호 원문 노출 완화
  - 현재 근거: `BreakdownTable.displayValue`, `AsIsToBePanel.displayValue`, backend `_text` list join.

- [x] `[반영됨]` `우선 전환/보완 필요/유지` 뱃지 색상 분기
  - 현재 근거: `AsIsToBePanel.priorityBadgeClass`.

- [x] `[반영됨]` 기본 점수/최종 점수 노출 제거
  - 현재 근거: `INTERNAL_FACTORS`, breakdown filter.

- [x] `[반영됨]` IMPACT 수치 대신 위험/주의/안정 뱃지
  - 현재 근거: `BreakdownTable.ImpactBadge`.

- [ ] `[부분반영]` 현재 응답 해석 강화
  - 현재 반영: `AsIsToBePanel.interpretValue`가 일부 요인별 해석 제공.
  - 남은 일: `ScoreHero.status_text`는 여전히 backend 문장에 raw response가 많고, 도메인별 "충격/리스크" 해석이 더 필요.

- [ ] `[부분반영]` 숫자 단위/스케일 통일
  - 현재 반영: 패널 일부 normalize.
  - 남은 일: backend `score_breakdown.value`, `status_text`, `RiskBadge` 전체에서 `0.2`, `1.0`, `4.0점` 등 재점검.

- [ ] `[부분반영]` 왼쪽 영역 카드 색상 차등화
  - 확인 대상: `AreaSidebar`.
  - 이전 작업에서 일부 score tone이 있었으나 실제 낮은 점수별 색감이 충분한지 확인 필요.

- [ ] `[부분반영]` "전환 방향" 워딩 → "개선 방향"
  - 현재 근거: `AsIsToBePanel`은 "개선 방향"으로 변경됨.
  - 남은 일: 다른 화면/문서에 전환 방향 표현 남아 있는지 검색 필요.

- [ ] `[부분반영]` "첫 실행 질문"을 진짜 질문으로
  - 현재 근거: `FIRST_ACTION_BY_FACTOR` 대부분 질문형으로 개선됨.
  - 남은 일: fallback 문구 `다음 회의에서 현재 방식의 예외 기준과 책임자를 먼저 정할까요?`와 전체 퀄리티 재검토.

- [ ] `[부분반영]` 리더십·거버넌스 워딩 변경
  - 현재 근거: backend `analysis_engine.py`, `variables.py`에 `리더십·거버넌스` 남아 있음.
  - 작업: 사용자 노출 영역은 `평가/리더십` 또는 `리더십 실행`으로 통일.

- [ ] `[확인필요]` 20인 이하 가이드 조건부 렌더링
  - 현재 근거: `BenchmarkRow`는 `SMALL_ORG_OPTIONS` 정확 매칭 사용.
  - 확인: 해당 가이드가 필요한 화면/문구에 모두 적용됐는지.

- [x] `[반영됨]` 하단 다음 화면 CTA 추가
  - 현재 근거: `result/detail/page.tsx` 하단 next section 존재.

---

## P1. 트레이드오프 분석 / 매트릭스

- [ ] `[부분반영]` "리더십 운영 비용" 워딩 개선
  - 현재 반영: `제도 변경에 따른 조직의 운영 부담`으로 변경됨.
  - 남은 일: 전체 트레이드오프 설명에서 "확인합니다/봅니다" 같은 설명형 문장을 실제 얻는 것/감수할 것으로 재작성.

- [ ] `[미반영]` 매트릭스 label/arrow overlap 완전 해결
  - 현재 근거: `MatrixSVG`는 label offset만 있고 축/사분면/마커 겹침 방지 로직은 제한적.
  - 작업: 매트릭스 밖 legend, axis label 외부 배치, collision-aware label position 또는 cards below matrix.

- [ ] `[부분반영]` 사분면 기업 예시 강화
  - 현재 반영: Google/Netflix/토스/대기업 등 예시 있음.
  - 남은 일: "Google식 공동체 기반 협업 조직", "삼성 공채 시스템형"처럼 더 명확한 설명 문구.

- [ ] `[부분반영]` To-Be 좌표가 철학 극단을 명확히 보여주는지 검증
  - 현재 근거: backend `trade_off.py`는 L0 선택에 따라 좌표 계산. 테스트도 일부 존재.
  - 남은 일: 사용자가 본 "가운데 고정" 케이스 재현 테스트와 시각적 보정 필요.

- [ ] `[부분반영]` 시나리오 선택과 매트릭스 To-Be 이동 연결
  - 현재 반영: matrix page에서 시나리오 선택은 `SelectedScenarioCard`에 반영.
  - 남은 일: 시나리오 선택 시 매트릭스 To-Be 위치 자체가 움직이거나, 선택 시나리오가 To-Be 이동 방법임을 더 명확히 연결.

- [x] `[반영됨]` 하단 시나리오 비교 CTA 추가
  - 현재 근거: `matrix/page.tsx` 하단 next section 존재.

---

## P1. 시나리오 비교

- [x] `[반영됨]` 좋은 시나리오 문구 반영
  - 현재 근거: `scenarios/page.tsx` title.

- [x] `[반영됨]` 시나리오 카드 선택 시 상세 내용 변경
  - 현재 근거: URL param `scenario`, `ScenarioDetailPanel`.

- [x] `[반영됨]` 제도별 도입/보류/대체 검토 선택 카드화
  - 현재 근거: `PackageDecisionCard`.

- [x] `[반영됨]` 보류/대체 검토 선택 시 메시지 변화
  - 현재 근거: `decisionMessage`.

- [ ] `[부분반영]` 얻는 것/감수할 것 상세성
  - 현재 반영: 카드형 강조.
  - 남은 일: `detailedGain`, `detailedCost`가 여전히 metric concat 수준. 중복 워딩 줄이고 왜 그런 효과/비용이 생기는지 더 설명 필요.

- [ ] `[부분반영]` 핵심효과/재무영향/운영리스크 디자인
  - 현재 반영: 표 깨짐은 줄었으나 여전히 3열 텍스트 리스트.
  - 원 피드백: 카드형/시각화로 더 잘 보이게.

- [ ] `[부분반영]` 재무 수치 방어 장치
  - 현재 반영: `item.note ?? "현재 입력값 기준의 추정 범위입니다."`
  - 남은 일: 수치 산식/가정 tooltip 또는 expandable rationale 필요. 단 `rationale` 원문 직접 노출은 조심.

- [ ] `[부분반영]` 주요 제도와 참고 운영 이미지
  - 현재 반영: operating image label/body 제공.
  - 남은 일: 기업별 실제 참고 예시가 짧고 추상적. 대표가 참고할 정도의 구체성 부족.

- [ ] `[부분반영]` 비교 기준 카드 위치/역할
  - 현재 근거: `ScenarioComparisonCards`는 상단 카드형 비교로 개선.
  - 확인: "비교표에서 현재 강조 중인 선택지"류 오래된 표는 제거됐는지 화면 확인.

- [x] `[반영됨]` 하단 실행 로드맵 CTA 추가
  - 현재 근거: `scenarios/page.tsx` 하단 next section.

---

## P1. 실행 로드맵

- [x] `[반영됨]` 단계명 개선
  - 현재 근거: `선행과제 / 파일럿 도입 / 세부 제도 도입 / 제도 안정화 / 성과 검증 또는 확산`.

- [x] `[반영됨]` 접기/펼치기 persistent 동작
  - 현재 근거: `openPhases` Set으로 접을 때까지 유지.

- [x] `[반영됨]` 1번만 있는 주의사항 개선
  - 현재 근거: `RoadmapCautionCards` 3개.

- [x] `[반영됨]` 하단 버튼 추가
  - 현재 근거: `roadmap/page.tsx` 하단 next section.

- [ ] `[부분반영]` 로드맵 참고 운영 이미지 상세성
  - 현재 반영: Google/Netflix/토스식 설명이 길어짐.
  - 남은 일: "그래서 다른 회사는 어떻게 했는데요?"에 답할 만큼 구체적 사례/제도 구조 부족.

- [ ] `[부분반영]` 약어/제도 tooltip
  - 현재 반영: `GlossaryText` 사용.
  - 남은 일: glossary 사전이 OKR, 9-Box, RSU, 스톡옵션, 캘리브레이션 등 충분한지 확인.

- [ ] `[부분반영]` 펼치기/접기 버튼 색감
  - 현재 근거: 무채색에 가까운 slate 버튼으로 보임. 화면 확인 필요.

- [ ] `[확인필요]` 리포트 초안 생성/PDF
  - 현재 근거: `window.print()` 및 "PDF 디자인은 별도 작업" 문구. 아직 실제 PDF 저장 아님.

---

## P2. 전반 워딩/톤

- [ ] `[부분반영]` "대표님/대표" → "회사" 기준 정리
  - 원 피드백: 대표가 입력하지 않을 수도 있으니 전반적으로 "회사" 사용.
  - 남은 대표 문구 예:
    - `AlignmentTensionMap`: 대표님의 인사 철학
    - `philosophyProfile`: 대표님의 철학
    - backend analysis: 대표-직원 공정성 인식
  - 결정 필요: 철학 입력 화면은 대표 유지, 결과 리포트는 회사 중심으로 바꿀지.

- [ ] `[부분반영]` 현학적/문학적 워딩 정리
  - 원 피드백: 제도 묶음 연결, 운영 리듬 고정 등 대표가 바로 이해하기 어려운 말 제거.
  - 확인 대상: roadmap, scenario, result, backend recommendations 전체.

- [ ] `[부분반영]` 용어 통일
  - `벤치마크`, `필요 기준`, `목표 기준점`, `운영 기준점`, `정합성`, `전사 정렬 점수`가 혼재.
  - 작업: 용어 사전/페이지별 용어 사용 규칙 정의.

- [ ] `[부분반영]` 글씨 크기/표 중심 피로도
  - 여러 화면에서 표/작은 글씨 중심이라는 피드백 반복.
  - 우선 확인 화면: result summary, detail, scenario detail, roadmap.

---

## P2. 기술/검증

- [ ] `[확인필요]` iPad 반응형
  - 일부 layout은 `xl` sticky/grid로 개선됨.
  - 실제 iPad viewport screenshot 확인 필요.

- [ ] `[확인필요]` Browser/Playwright 시각 검증
  - 이전 세션에서 Browser/node_repl이 불안정했음.
  - 가능하면 local route screenshot으로 matrix overlap, result flow, landing preview 확인.

- [ ] `[확인필요]` full backend endpoint tests
  - 이전에는 `httpx` 미설치로 전체 endpoint tests가 중단됨.
  - core tests/typecheck는 통과 이력 있음.

---

## 이미 반영됐다고 보고 중복 작업하지 않을 항목

- [x] `/diagnose/philosophy` 별도 첫 단계
- [x] 철학 프로필 피드백 중간 화면
- [x] L0-4 핵심 인력/형평성 딜레마 문항
- [x] 랜딩 CTA 및 fallback 경로 `/diagnose/philosophy`
- [x] 결과 요약 최상단 정합성 카드형 분석
- [x] Aha Moment 문구 제거
- [x] 정합성 텐션/텐션 포인트 워딩 제거
- [x] 거리 숫자값 제거
- [x] `[일치/주의/심각]`, 정합도 퍼센트 표현
- [x] `인재` 도메인 라벨을 `채용`, `인력`을 `인력운영`으로 보정
- [x] 랜딩 미리보기 compact화
- [x] 응답값 대괄호 원문 노출 1차 수정
- [x] 시나리오 제도 선택 카드화
- [x] 로드맵 접기/펼치기
- [x] 배포 env 문서화

---

## 권장 작업 순서

1. `P0` 결과 요약 정보 흐름/기준 관계 재설계
2. 260603 저녁 수정의 명시 미반영 6개 처리
   - 선택지 bold 규칙
   - 철학 충돌 박스 색
   - 철학 정렬 flow
   - 평가 공정성 선택지 축소
   - 철학 note 해석화
   - matrix overlap
3. 결과 요약 카드/operating risk/필요 기준 설명 재배치
4. 트레이드오프 매트릭스 시각 구조 재작업
5. 시나리오 비교/로드맵 상세성 보강
6. 전 화면 워딩 통일과 `대표`/`회사` 기준 정리
7. iPad/desktop screenshot 검증
