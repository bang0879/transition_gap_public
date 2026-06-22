# Transition Gap Diagnostic Report Design

Date: 2026-06-22
Status: Design approved for implementation planning
Scope: A4 portrait diagnostic report generation for the Next.js + FastAPI MVP

## 1. Report Job

The report is not a browser printout and not a copy of the result pages.

Its job is:

> To translate the diagnostic result into a shareable decision artifact that a CEO can confidently hand to co-founders, board members, and leadership team members.

The browser result page owns the first aha moment: where the company's philosophy and current people systems diverge.

The diagnostic report owns the second-layer interpretation:

- why the divergence likely exists
- what the CEO may be underestimating
- what decision cost is hidden behind the current operating pattern
- what would be risky to do too early
- what the next leadership discussion should decide

The report should also demonstrate Kyle's consultant credibility. It should feel like a tailored interpretation, not a SaaS-generated status summary.

## 2. Non-Negotiables

- Format is A4 portrait.
- The report is six pages for the first implementation.
- The sixth page is a CEO Decision Memo, not a generic roadmap.
- Copy is written in formal Korean using 존대.
- The report avoids raw scores, formulas, internal scoring logic, and developer explanations.
- The report avoids "recommendation" language. It uses 검토 방향, 판단 기준, 감수할 운영 비용, and 결정 질문.
- The report does not include browser UI, buttons, navigation, or screen-like chrome.
- The report does not imply a sales follow-up. Avoid language such as 재진단, 상담 신청, or 다시 점검받기.
- The report can mention "변화 신호 확인" or "다음 판단 기준" when describing follow-up observation.
- Matrix visuals are not copied directly from the web page. They are translated into document-native comparison or decision visuals.
- PDF generation uses the previously validated `@react-pdf/renderer` path with dynamic import on download action.

## 3. Tone And Interpretation Depth

The report must include interpretation, not merely result text.

Weak style:

> 보상과 평가 기준의 정합성이 낮습니다.

Target style:

> 대표님께서는 성과 기준을 강화하고 싶어 하시지만, 아직 조직은 성과 차이를 공개적으로 다루는 비용을 감당할 준비가 덜 되어 있습니다. 따라서 지금 차등 보상만 먼저 강화하면, 제도 개선이 아니라 내부 정치 문제로 읽힐 가능성이 큽니다.

The report should identify patterns across domains instead of explaining each domain in isolation.

Example:

> 이 회사의 핵심 패턴은 '기준 부재'보다 '기준 회피'에 가깝습니다. 기준이 전혀 없는 것은 아니지만, 민감한 순간에는 명문화된 기준보다 대표님과 리더의 개별 판단이 더 강하게 작동하고 있습니다. 이 때문에 제도를 추가해도 구성원이 실제로 경험하는 회사의 운영 방식은 크게 바뀌지 않을 수 있습니다.

Company stage must affect interpretation.

Example:

> 40명 이하에서는 리더의 구두 설명과 대표님의 직접 개입으로 제도 공백을 버틸 수 있습니다. 하지만 80명 이상에서는 같은 방식이 반복되면 '대표가 아는 사람 중심으로 운영된다'는 인식이 생길 수 있습니다.

The report should name risky premature moves.

Example:

> 지금 가장 위험한 선택은 평가 제도를 정교하게 만드는 것이 아닙니다. 평가 결과를 받아들일 리더십 언어와 보상 연결 기준이 없는 상태에서 평가 양식만 정교해지면, 구성원은 제도를 신뢰하기보다 방어적으로 대응할 가능성이 큽니다.

It should include uncomfortable but useful sentences, written in a consulting tone.

Example:

> 현재의 유연성은 장점입니다. 하지만 조직이 커질수록 유연성은 '일관성 부족'으로 번역됩니다. 대표님이 의도한 배려가 구성원에게는 기준의 불투명성으로 읽힐 수 있습니다.

## 4. Page Structure

### Page 1. Cover

Purpose:

Make the first page feel like a credible, shareable report rather than an exported web screen.

Layout:

- Small brand header: Transition Gap
- Large title: `[회사명] 인사제도 진단 보고서`
- Subtitle: `대표 / People 리더 의사결정용`
- One strong interpretation sentence
- Metadata row: 진단일, 진단 모드, 조직 규모, 작성 기준

Main copy pattern:

> 이 회사의 문제는 제도가 부족하다는 것보다, 민감한 판단을 아직 명시적 기준으로 다루지 못하고 있다는 점에 가깝습니다.

Visual density:

- Minimal.
- No chart needed.
- Use typography, spacing, and a restrained accent rule.

### Page 2. Executive Interpretation

Purpose:

Replace executive summary with first-layer consultant interpretation.

Layout:

- Left 60 percent: large interpretation narrative
- Right 40 percent: compact key-signal panel
- Bottom: small horizontal "철학 vs 실제 운영" tension gauge

Content sections:

- `이 회사의 핵심 패턴`
- `대표님이 의도한 방향`
- `조직이 실제로 경험하는 방식`
- `따라서 지금의 전환 과제`
- `대표님이 과소평가하기 쉬운 비용`

Graph:

- Tension gauge comparing philosophy intent and actual operating pattern.
- It should not show raw score.
- It can show labels such as `철학`, `실제 운영`, `간극`, `주의`, `심각`.

### Page 3. CEO Blind Spots

Purpose:

Give the CEO useful discomfort beyond the web result.

Layout:

- Three stacked blind-spot blocks.
- Each block has three mini-columns:
  - `대표님의 의도`
  - `조직의 해석`
  - `조직 비용`
- Use small risk markers, not loud alert styling.

Default blind spot themes:

1. 대표님이 보시는 유연성은 구성원에게 기준 불투명성으로 읽힐 수 있습니다.
2. 성과 책임을 말하지만, 책임을 감당할 리더 언어가 아직 약할 수 있습니다.
3. 제도를 추가하면 해결될 것 같지만, 실제 병목은 판단 기준일 수 있습니다.

Graph:

- Compact blind-spot matrix or three-column interpretation table.
- Keep it document-native and print-friendly.

### Page 4. Priority Tension

Purpose:

Show that the highest-priority issue is a connected operating tension, not an isolated domain defect.

Layout:

- Top: one strong synthesis sentence.
- Center: vertical tension-chain diagram.
- Bottom or side panels:
  - `먼저 손댈 것`
  - `아직 보류할 것`

Default chain pattern:

1. 성과 차이를 인정하고 싶습니다.
2. 평가 결과를 받아들이게 만드는 기준은 아직 약합니다.
3. 리더는 불편한 피드백을 감당할 준비가 다를 수 있습니다.
4. 보상 차등만 먼저 강화하면 형평성 논쟁으로 번질 수 있습니다.

Graph:

- Vertical chain diagram connecting domains such as 보상, 평가, 리더십, 운영 리스크.
- If the top conflict is not compensation-evaluation-leadership, generate a chain from the actual top conflict domains.

### Page 5. Strategic Options

Purpose:

Translate Matrix and scenario content into decision tradeoffs.

Layout:

- Three-column comparison.
- Each direction includes:
  - `얻는 것`
  - `감수할 것`
  - `대표님께 요구되는 변화`
  - `지금 위험한 실행`
- Add mini bar indicators for gain, burden, and leadership load.

Default directions:

- 성과 책임 강화형
- 공동체 안정 보완형
- 핵심 인재 집중형

Language rule:

Do not present these as recommended options. Present them as operating directions with different costs.

Graph:

- Comparison table with compact mini bars.
- Avoid full Matrix SVG reproduction.

### Page 6. CEO Decision Memo

Purpose:

End the report with an artifact the CEO can use in a leadership meeting.

Layout:

- Memo heading: `CEO Decision Memo`
- Section 1: `이번 회의에서 합의해야 할 것`
- Section 2: `아직 결정하지 않아도 되는 것`
- Section 3: `지금 하면 위험한 것`
- Section 4: `30일 안에 확인할 신호`
- Add a compact checklist or decision matrix to make the page feel complete.

Default decisions:

1. 성과 차이를 어디까지 공개적 기준으로 다룰 것인가
2. 평가 결과를 보상 및 승진 판단에 어느 수준까지 연결할 것인가
3. 리더 재량으로 남길 판단과 회사 기준으로 고정할 판단을 어디서 나눌 것인가

Do-not-decide-yet examples:

- 전사 보상 테이블의 전면 개편
- 복잡한 직급 및 직무 체계
- 모든 제도의 동시 개편

Risky premature moves:

- 평가 수용성 없이 차등 보상만 강화하는 것
- 리더 준비 없이 성과 책임만 밀어붙이는 것
- 예외 운영을 기준화하지 않은 채 핵심 인재 보상만 조용히 처리하는 것

30-day signals:

- 리더들이 같은 상황에서 비슷한 판단을 내리고 있는가
- 보상 예외의 이유가 설명 가능한가
- 평가 피드백이 보상 및 승진 논의와 충돌하지 않는가

## 5. Interpretation Model

The first implementation remains deterministic and rule-based. No LLM is introduced.

The report view model should combine these inputs:

- diagnosis mode: foundation, hybrid, alignment
- company name
- headcount bracket
- growth or hiring stance
- top alignment axis
- top two or three priority domains
- alignment conflicts
- visibility blind spots
- scenario or operating direction under review
- foundation and alignment signals

The report should generate higher-level interpretation fields rather than only passing through screen text.

Suggested view model fields:

- `headlineInterpretation`
- `corePattern`
- `ceoUnderestimatedCost`
- `stageInterpretation`
- `prematureMoveWarning`
- `blindSpots[]`
- `priorityTensionChain[]`
- `strategicOptions[]`
- `decisionMemo`
- `charts`

## 6. Visual Components

The report should use charts only where they sharpen interpretation or fill page density without becoming dashboard-like.

Required report-native visuals:

1. `TensionGauge`
   - Page 2
   - Shows philosophy intent vs actual operation distance.
   - Label-based, not raw-score-based.

2. `BlindSpotTable`
   - Page 3
   - Three blind spots with intent, organizational interpretation, and operating cost.

3. `TensionChain`
   - Page 4
   - Shows connected operating risk across domains.

4. `StrategicOptionTable`
   - Page 5
   - Three operating directions with mini indicators.

5. `DecisionMemoMatrix`
   - Page 6
   - Checklist or decision matrix for leadership discussion.

## 7. Implementation Slices

Implementation should be split into small slices.

Slice 1. Report ViewModel

- Add a report-specific builder separate from existing JSON export.
- Convert diagnosis and responses into interpretation-ready fields.
- Keep the builder deterministic and unit-tested.

Slice 2. A4 Preview Route

- Add a report preview route that renders the six A4 portrait pages in the browser for QA.
- This route is for design verification and should not replace the PDF.

Slice 3. PDF Document Components

- Build `@react-pdf/renderer` components for the six pages.
- Register Pretendard fonts.
- Keep PDF imports dynamic from the download button.

Slice 4. Report Visuals

- Implement report-native visuals in PDF-compatible primitives.
- Avoid direct reuse of complex SVG/web components unless they render reliably in PDF.

Slice 5. Result CTA

- Replace or supplement the current print action with a diagnostic report generation action.
- Preserve existing JSON export only if still needed for internal debugging.

Slice 6. Verification

- Run frontend typecheck.
- Generate a sample PDF.
- Extract text from the PDF to verify Korean text is real text.
- Render PDF pages to PNG using Poppler.
- Visually inspect A4 density and page breaks.
- If image viewer or browser screenshot tooling fails due to Windows sandbox ACL issues, record the failure and keep text/render verification.

## 8. Open Design Choices

The following are intentionally fixed for this implementation:

- The report is six pages.
- Page 6 is CEO Decision Memo.
- The report uses 존대.
- The report uses graph-assisted density on Pages 2 through 6.
- Matrix is summarized as strategic options, not reproduced as the web chart.
- No LLM is introduced.

Future iteration candidates:

- Mode-specific variants of the decision memo
- More nuanced company-stage interpretation
- A one-page board summary export
- Formal PDF file naming and archive flow
