# 260526 Feedback Checklist

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[?]` Needs 강훈님 confirm
- `[defer]` Later pass

## 전반적

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 정합성을 실제로 어떻게 체크하는지 불명확하다. 보상·채용·평가·리더십 간 엇박자를 분석해야 한다. | `backend/app/core/alignment_engine.py`, `backend/app/api/diagnose.py`, `backend/app/schemas/analysis.py`, `frontend/app/(analysis)/result/page.tsx`, `frontend/lib/types/api.ts` | 정합성 지수를 `영역 평균 - 제도 간 충돌 페널티`로 재정의하고 충돌 목록을 API/화면에 노출 | `backend/core_tests/test_alignment_engine.py` 통과 |

## 랜딩페이지

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[defer]` | 아이콘 의미가 불명확하다. 디자인에서 별도 수정 예정. | `frontend/components/layout/BrandMark.tsx` | 이번 pass에서는 건드리지 않음 | 별도 디자인 지시 후 처리 |
| `[x]` | `진단 흐름 보기`가 아무것도 나오지 않는다. 전체 흐름도를 보여줘야 한다. | `frontend/components/landing/ProcessStrip.tsx`, `frontend/components/landing/LandingHero.tsx` | 7단계 진단 흐름으로 확장하고 버튼 스크롤 연결 유지 | 흐름 스트립 7단계 표시 |
| `[x]` | 미리보기 오른쪽 영역 `평가·리더십`, `대표 재량 중심`이 위쪽 정렬되어 있어 중간 정렬 필요 | `frontend/components/landing/PreviewAside.tsx` | preview row를 `items-center`, `min-h` 기반으로 조정 | 값 텍스트 수직 가운데 정렬 |

## 진단 입력: 인력·채용

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | "인력 안정성과 채용 파이프라인은 성장 속도와 총보상 구조의 압력을 함께 해석..." 문구가 어렵다. | `frontend/app/diagnose/workforce/page.tsx` | CEO가 이해하기 쉬운 운영 언어로 교체 | 새 설명 문구 반영 |

## 진단 입력: 총보상

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | `복리후생 및 직급/호칭 체계`를 상중하로 묻는 것은 기준이 불명확하다. | `frontend/app/diagnose/rewards/page.tsx`, `backend/app/content/schema.json`, `backend/app/core/variables.py`, `backend/app/core/analysis_engine.py` | `복리후생 수준`만 묻고 선택지를 `높은 편/비슷한 편/낮은 편/모르겠음`으로 변경 | `backend/core_tests/test_schema_wording.py` 통과 |
| `[x]` | `모르겠음` 선택지가 필요하다. | 동일 | `2-3-6` 선택지에 `모르겠음` 추가 | `backend/core_tests/test_schema_wording.py` 통과 |

## 진단 입력: 평가·리더십

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 평가 공정성 질문의 슬라이더 표기가 `낮음/높음`이라 부적절하다. | `frontend/app/diagnose/evaluation/page.tsx` | 5점 언어형 선택지(`전혀 아니다`~`매우 그렇다`)로 변경하되 값은 1/3/5/7/10 유지 | `NumericSlider` 제거, `SegmentedScale` 적용 |
| `[x]` | 리더 장기 방향 질문도 `낮음/중간/높음` 대신 동의형 선택지가 필요하다. | `frontend/app/diagnose/evaluation/page.tsx` | `아니다/보통이다/그렇다`로 라벨 교체 | 새 라벨 반영 |

## 진단 결과 요약

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | `대표` 대신 `회사` 워딩이 좋다. | `frontend/app/(analysis)/result/page.tsx` | 사용자-facing 문구에서 조직 주체로 변경 | 결과 요약 lead와 결정 카드 반영 |
| `[x]` | `기준점 대비 ##점 미달` 뱃지가 초록색이 아니라 경고 색이어야 한다. | `frontend/app/(analysis)/result/page.tsx` | gap badge를 coral tone으로 변경 | 가장 먼저 볼 영역 뱃지 class 변경 |
| `[x]` | 65%의 `추가 수집 권장` 뱃지 색이 데이터 신뢰도와 HR 가시성에서 불일치한다. | `frontend/app/(analysis)/result/page.tsx`, `frontend/components/result/MetricCard.tsx` | 동일 `visibilityVariant`로 amber 적용 | 50~69%에서 모두 amber |
| `[x]` | 진단이 안 된 영역 개수뿐 아니라 어떤 영역인지 보여줘야 한다. | `frontend/app/(analysis)/result/page.tsx` | `visibility.blind_spot_labels`를 요약에 표시 | 진단 약한 영역 목록 표시 |
| `[x]` | 레이더 차트의 틸트 선과 점을 연하게 해야 한다. | `frontend/components/visualization/RadarChart.tsx` | benchmark/current visual tone 완화 | chart stroke/fill 완화 |
| `[x]` | 기준점이 모두 75점 방사선처럼 보여 현실성이 떨어진다. | `backend/app/core/analysis_engine.py`, `frontend/app/(analysis)/result/page.tsx` | 조직 규모/철학/성장 기조 기반 동적 기준점 적용, 설명 문구 교체 | `backend/core_tests/test_dynamic_benchmarks.py` 통과 |
| `[x]` | `teal 영역` 대신 `초록색 영역`으로 표현한다. | `frontend/app/(analysis)/result/page.tsx` | 읽는 방법 문구 교체 | `teal 영역` 문구 제거 |
| `[x]` | Operating risk가 1~2개일 때 화면이 비어 보인다. | `frontend/app/(analysis)/result/page.tsx`, `frontend/components/result/InsightCard.tsx` | insights 개수에 맞춘 grid density | insights 수에 따라 grid column 변경 |
| `[x]` | 하단에도 `상세보기` 버튼이 필요하다. | `frontend/app/(analysis)/result/page.tsx` | bottom CTA section 추가 | 하단 상세 분석/리포트 저장 버튼 추가 |
| `[defer]` | 리포트 저장이 인쇄 화면이 아니라 예쁜 PDF 저장이면 좋겠다. | report/export module | 진단 내용 확정 후 별도 PDF 작업으로 분리 | 별도 PDF task에서 처리 |

## 영역별 상세

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 왼쪽 카드 그래프가 모두 초록색이다. 낮은 점수는 빨강/주황으로 차등화해야 한다. | `frontend/components/detail/AreaSidebar.tsx` | score tier별 bar color 적용 | 낮은 점수 coral, 중간 amber |
| `[x]` | 현재 응답을 그대로 나열하지 말고 해석이 필요하다. | `frontend/components/detail/AsIsToBePanel.tsx` | raw answer interpretation helper 추가 | `20% 초과`, `30% 초과` 응답에 의미 해석 표시 |
| `[x]` | `현재 ##` 대신 `현재 ##점`으로 표시한다. | `frontend/components/detail/AreaSidebar.tsx` | 점 suffix 추가 | 화면에서 `현재 52점` 표시 |
| `[x]` | `기준점 대비 48점 미달` 줄바꿈을 자연스럽게 한다. | `frontend/components/detail/ScoreHero.tsx` | `기준점 대비` / `48점 미달` block split | line break 확인 |
| `[x]` | As-Is/To-Be 뱃지를 분리한다. | `frontend/components/detail/AsIsToBePanel.tsx` | `현재 방식`, `개선 기준` 별도 label | 단일 `As-Is → To-Be` 제거 |
| `[x]` | 제작자용 설명 문구를 사용자용 인사이트 설명으로 바꾼다. | `frontend/components/detail/AsIsToBePanel.tsx` | 설명 교체 | 문구 검색 |
| `[x]` | 현재 방식도 수치가 아니라 의미를 해석해야 한다. | `frontend/components/detail/AsIsToBePanel.tsx` | displayValue 대신 interpretValue 적용 | raw value와 해석 함께 표시 |
| `[x]` | `전환 방향`보다 `개선 방향`이 낫다. | `frontend/components/detail/AsIsToBePanel.tsx` | label rename | `전환 방향` 검색 제거 |
| `[x]` | `첫 실행 질문`이 평서문이면 안 된다. 실제 질문으로 포지셔닝해야 한다. | `frontend/components/detail/AsIsToBePanel.tsx` | `먼저 던질 질문`으로 변경하고 문장 끝 `?` | 질문형 문구 확인 |
| `[x]` | 0.2 같은 앵커링 안 된 숫자 표기를 줄이거나 해석해야 한다. | `frontend/components/detail/AsIsToBePanel.tsx`, `frontend/components/detail/BreakdownTable.tsx` | 현재 방식 카드에서 raw value를 의미 해석으로 감싸고 영향도 label 단순화 | raw numeric만 단독 노출되는 영역 축소 |
| `[x]` | `정합성 훼손도`가 어렵다. | `frontend/components/detail/BreakdownTable.tsx` | `운영 충돌 위험`으로 변경 | 테이블 헤더 확인 |
| `[x]` | 전반적으로 `대표님`을 `회사`로 치환할 수 있는 부분은 변경한다. | frontend/backend content | user-facing copy 검색 교체 | 상세 패널 `대표` 표현 제거 |

## 트레이드오프 분석

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | As-Is/To-Be 설명을 줄바꿈하고 회사 주체로 바꾼다. | `frontend/app/(analysis)/matrix/page.tsx` | lead copy 교체 | `대표님` 문구 제거 |
| `[x]` | `얻는 것=확인합니다`, `감수할 것=봅니다` 문법이 어색하다. | `frontend/app/(analysis)/matrix/page.tsx` | 명사형 설명으로 교체 | 얻는 것/감수할 것 설명 명사형 반영 |
| `[x]` | To-Be가 매트릭스 가운데 고정되는 것은 오류로 보인다. | `backend/app/schemas/responses.py`, `backend/app/core/trade_off.py`, `backend/app/api/diagnose.py`, `frontend/lib/types/api.ts` | L0 정규화와 Matrix B y값 산출, `b_quadrant_to_be` API 필드 추가 | `core_tests/test_to_be_coordinates.py` 통과, API 함수 직접 호출에서 `0.85/0.85/0.8/0.8` 확인 |
| `[x]` | 얻을 것과 감수할 것을 카드형 등으로 강조한다. | `frontend/components/matrix/SelectedScenarioCard.tsx` | gain/cost 카드 스타일 강화 | 선택 시나리오 카드 확인 |
| `[x]` | `먼저 움직이는 제도`를 `적용 필요 제도`로 변경한다. | `frontend/components/matrix/SelectedScenarioCard.tsx`, `frontend/components/matrix/ScenarioFitTable.tsx` | label 교체 | 검색 결과 제거 |
| `[x]` | 시나리오가 추천 순서인지, 추천하지 않는다면 컨설팅 설명을 어떻게 줄지 고민 필요 | scenario fit helper, `frontend/app/(analysis)/scenarios/page.tsx` | `추천` 대신 `우선 검토`, `비교 후보`, `검토 관점` 태그 도입 | 추천 강요 없이 우선순위 힌트 표시 |
| `[x]` | To-Be에 해당하는 시나리오들이 추천/검토되고 있는지 확인 필요 | `frontend/app/(analysis)/matrix/page.tsx` | To-Be 사분면 신호로 기본 검토 시나리오를 선택 | selected scenario가 To-Be 방향과 연결 |
| `[x]` | 다음 페이지 버튼이 맨 위에만 있다. | `frontend/app/(analysis)/matrix/page.tsx` | bottom nav 추가 | 하단에서 시나리오 비교 이동 |

## 시나리오 비교

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 제목 문구 줄바꿈 반영 | `frontend/app/(analysis)/scenarios/page.tsx` | `좋은 시나리오...` copy 유지/가독성 개선 | desktop line break 추가 |
| `[x]` | 선택한 시나리오 상세의 얻는 것/감수할 것이 작다. | `frontend/components/scenario/ScenarioDetailPanel.tsx` | 카드형 강조 | 상세 패널 gain/cost 카드화 |
| `[x]` | 상세 화면의 얻는 것/감수할 것 내용이 이전 화면과 중복된다. | `frontend/components/scenario/ScenarioDetailPanel.tsx` | 주요 impact/리스크를 묶은 상세 설명으로 분리 | 단일 요약 문장 반복 제거 |
| `[x]` | 핵심효과가 얻는 것/감수할 것과 겹쳐 잘 안 보인다. | `frontend/components/scenario/ScenarioDetailPanel.tsx` | summary/검토 관점, gain/cost, 핵심효과 layout 분리 | overlap 없음 |
| `[x]` | 주요 제도와 참고 운영 이미지가 표처럼 보여 선택지 느낌이 약하다. | `frontend/components/scenario/ScenarioDetailPanel.tsx` | 제도 카드 + 선택 segmented control 유지, 기본 선택 제거 | 도입/보류/대체 검토 명확 |
| `[x]` | `비교표에서 현재 강조 중인 선택지` 디자인이 어색하고 위치가 부적절하다. | `frontend/components/scenario/ScenarioComparisonTable.tsx` | banner 제거 | 불필요한 하단 정보 제거 |
| `[x]` | 다음 페이지 버튼이 맨 위에만 있다. | `frontend/app/(analysis)/scenarios/page.tsx` | bottom nav 추가 | 하단에서 로드맵 이동 |

## 실행 로드맵

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | `공동체 안정형을 실행 가능한 12개월 계획으로 번역합니다`가 직관적이지 않다. | `frontend/app/(analysis)/roadmap/page.tsx` | plain wording으로 변경 | 제목 확인 |
| `[x]` | 참고 운영 내용이 너무 얕다. | `frontend/components/roadmap/RoadmapTimeline.tsx` | scenario별 운영 이미지 구체화 | 참고 운영 섹션 상세화 |
| `[x]` | 스크롤이 너무 길다. 단계별 접었다 펴기 필요. | `frontend/components/roadmap/RoadmapTimeline.tsx` | accordion 도입, 1단계 기본 open | 단계 접기/펼치기 작동 |
| `[x]` | 리포트 초안 생성/이전 버튼이 맨 위에만 있다. | `frontend/app/(analysis)/roadmap/page.tsx` | bottom nav 추가 | 하단 버튼 확인 |
| `[defer]` | 리포트 초안 생성은 나중에 예쁘게 인쇄되게 한다. | report/export module | 별도 PDF/export 작업으로 분리 | 별도 task |
