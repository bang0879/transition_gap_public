# 260527 Feedback Checklist

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[?]` Needs 강훈님 confirm
- `[defer]` Later pass

## 랜딩페이지

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 결과 리포트 미리보기가 너무 커져 스크롤이 생김 | `frontend/components/landing/PreviewAside.tsx` | 높이, padding, row spacing 축소 | typecheck 통과 |
| `[x]` | 하단 로드맵/흐름 스트립 롤백 필요 | `frontend/app/page.tsx` | landing 하단 `ProcessStrip` 제거 | 하단 긴 흐름 섹션 제거 |
| `[x]` | `진단 흐름 보기`는 팝업/모달로 보여줘야 함 | `frontend/components/landing/LandingHero.tsx`, `DiagnosisFlowModal.tsx` | 버튼 클릭 시 modal open | typecheck 통과 |
| `[x]` | 평가 공정성 질문에 `운영하지 않음` 추가 | `frontend/app/diagnose/evaluation/page.tsx`, backend schema/core | 0점 option 추가 및 분석 처리 | schema/dynamic benchmark tests 통과 |

## 진단결과 요약

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | `평가 정교도` 워딩이 이상함 | `backend/app/core/analysis_engine.py`, `backend/app/content/scenarios.json` | `평가 제도`로 변경 | 검색 결과 제거 |
| `[x]` | `목표 운영 기준점`이 무엇인지 사전 설명 필요 | `frontend/app/(analysis)/result/page.tsx` | 기준점 설명 memo/card 추가 | typecheck 통과 |

## 영역별 상세

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 점수 슬라이더 색이 비슷하고 주황색이 탁함 | `frontend/components/detail/AreaSidebar.tsx` | 점수 절대값 + 순위 기반 tone 적용, 기존 palette 사용 | typecheck 통과 |
| `[x]` | 현재 방식 점수 표기가 2점/5점, 4.0점 등 불일치 | `frontend/components/detail/AsIsToBePanel.tsx` | numeric display normalize | raw decimal 검색 통과 |
| `[x]` | 개선방향과 먼저 던질 질문이 거의 같음 | `frontend/components/detail/AsIsToBePanel.tsx` | 질문을 회의 의사결정 질문으로 재작성 | typecheck 통과 |

## 트레이드오프 분석

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | `리더십 운영 비용`이 불명확함 | `frontend/app/(analysis)/matrix/page.tsx` | `조직의 운영 부담`으로 변경 | 문구 검색 |
| `[x]` | To-Be/As-Is와 사분면 설명 겹침 | `frontend/components/visualization/MatrixSVG.tsx` | label placement helper 추가 | typecheck 통과 |
| `[x]` | 세로축 설명이 잘 안 읽히고 가로축 정렬이 어긋남 | `MatrixSVG.tsx` | axis label/arrow 재배치 | typecheck 통과 |
| `[x]` | 매트릭스 화살표 원복 필요 | `MatrixSVG.tsx` | marker center offset을 둔 As-Is → To-Be arrow | typecheck 통과 |
| `[x]` | 사분면에 `000기업식` 예시 추가 | `frontend/app/(analysis)/matrix/page.tsx` | 운영 이미지 예시로 작게 노출 | 보조 문구 추가 |

## 시나리오 비교

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 핵심효과/재무영향/운영리스크 영역에서 운영 리스크가 깨짐 | `ScenarioDetailPanel.tsx` | 상세 상단은 2열, 하단은 3열로 정리 | typecheck 통과 |
| `[x]` | `재무영향과 단위` → `재무 영향` | `ScenarioDetailPanel.tsx` | label rename | 검색 결과 제거 |
| `[x]` | 참고 운영 이미지의 `·` 기호가 어색함 | `ScenarioDetailPanel.tsx` | 줄바꿈 구조로 변경 | 기호 제거 |
| `[x]` | 제도별 선택 의미가 약함 | `ScenarioDetailPanel.tsx`, `PackageDecisionCard.tsx` | 큰 카드형 선택지와 선택 뱃지 | 선택 상태 명확 |
| `[x]` | 보류/대체검토 선택 시 실제 내용 변화 필요 | `PackageDecisionCard.tsx` | 보류 리스크/대체 후보 안내 표시 | 버튼별 설명 변경 |
| `[x]` | 마지막 비교 기준은 표 대신 카드형, 위치는 상세 전이 나음 | `ScenarioComparisonCards.tsx`, `scenarios/page.tsx` | 비교 카드만 상세 전 배치하고 표 제거 | 컨펌 반영 완료 |

## 실행 로드맵

| 상태 | 피드백 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 참고 운영 이미지/실행원칙 좌우 크기 다름 | `RoadmapTimeline.tsx` | `lg:grid-cols-2`로 균등화 | typecheck 통과 |
| `[x]` | `펼치기/접기` 색을 무채색으로 | `RoadmapTimeline.tsx` | slate button style | teal 과다 감소 |
| `[x]` | 한 번 펼친 항목은 접기 전까지 유지 | `RoadmapTimeline.tsx` | single index → multi open state | 다중 open 가능 |
| `[x]` | OKR, RSU, 9-Box Grid 등 설명 필요 | `TermTooltip.tsx`, `hrGlossary.ts`, `GlossaryText.tsx` | 핵심 용어 tooltip | 컨펌 범위 반영 |
| `[x]` | 전반적 언어가 현학적/문학적임 | roadmap + product-wide copy | CEO-friendly terms로 sweep | 검색/테스트 확인 |
| `[x]` | `1. 0~1개월...` 단독 번호가 어색함 | `roadmap/page.tsx` | 3개 주의사항 카드로 변경 | 1개 번호 단독 제거 |

## 추가 제안

| 상태 | 제안 | 처리 파일 | 처리 방식 | 검증 |
|---|---|---|---|---|
| `[x]` | 제품 전반의 전문 용어 설명 체계 필요 | `TermTooltip.tsx`, `hrGlossary.ts`, `GlossaryText.tsx` | roadmap/시나리오/진단 문구에 tooltip 적용 | hover 설명 표시 |
| `[ ]` | 기준점/벤치마크 설명을 한 번만이 아니라 반복 가능한 도움말로 제공 | `result/page.tsx`, shared tooltip/help | 기준점 badge/help 추가 | 대표가 근거 이해 가능 |
| `[ ]` | 시나리오 제도 선택 결과를 로드맵에 이어받는 구조는 v0.2 후보 | store/API | 이번 pass에서는 화면 내 상태만 반영, v0.2에서 persistence 검토 | 별도 결정 |
