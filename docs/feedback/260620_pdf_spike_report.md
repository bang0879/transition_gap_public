# PDF 기술 스파이크 결과 보고

작성일: 2026-06-20
대상: Transition Gap Report MVP
결론: `@react-pdf/renderer + Pretendard` 조합은 MVP PDF 다운로드 기술로 사용 가능하다. 단, PDF 모듈은 페이지 로드시 import하지 않고 다운로드 버튼 클릭 시점에만 동적 import해야 한다.

---

## 1. 검증 목표

이번 스파이크의 목적은 다음 게이트를 반나절 안에 판정하는 것이다.

- 한글 회사명과 진단 해석 문장이 PDF에서 깨지지 않는가
- PDF 텍스트가 이미지가 아니라 실제 텍스트로 들어가는가
- Next.js production build가 통과하는가
- 번들/정적 자산 크기가 MVP 배포에 감당 가능한가
- 실패 시 `HTML + Playwright PDF`로 전환해야 하는가

---

## 2. 사용 조합

- PDF: `@react-pdf/renderer@4.5.1`
- Font: `@fontsource/pretendard@5.2.5`
- 실제 PDF 등록 폰트:
  - `frontend/public/fonts/pretendard-400.woff`
  - `frontend/public/fonts/pretendard-700.woff`

원본 `pretendard` 패키지는 unpacked 약 98MB로 MVP에는 과하다. `@fontsource/pretendard`는 unpacked 약 17MB이며, 필요한 WOFF 파일만 `public/fonts`로 복사해 사용할 수 있다. `@fontsource/pretendard`의 파일명은 `latin`으로 표기되지만, `fontkit` 확인 결과 실제 한글 코드포인트를 포함한다.

---

## 3. 생성 검증

Node 스파이크 스크립트:

```text
frontend/scripts/pdf-spike.mjs
```

생성 파일:

```text
tmp/pdfs/react-pdf-pretendard-spike.pdf
```

결과:

- PDF 생성 성공
- 파일 크기: 23,988 bytes
- 페이지: A4 1페이지
- PDF producer: react-pdf
- PDF version: 1.3

---

## 4. 한글 텍스트 검증

`pdfplumber`로 텍스트 추출을 확인했다.

추출 성공 문장 예:

```text
막내테스트 주식회사 인사제도 진단 보고서
Foundation Gap으로 판별된 회사는 정합성 점수보다 먼저 운영 기준 부재를 확인해야 합니다.
보상 기준, 평가 루프, 리더 역할이 동시에 비어 있으면 6개월 안에 보상 형평성, 평가 수용성, 리더별 운영 편차가 커질 수 있습니다.
```

판정:

- 한글 텍스트 추출 성공
- 기업명, 진단 모드, 해석 문장 모두 실제 텍스트로 들어감
- 화면 캡처 PDF가 아니라 텍스트 기반 PDF로 구현 가능

---

## 5. 렌더링 검증

Poppler `pdftoppm`으로 PNG 렌더링을 생성했다.

렌더링 파일:

```text
tmp/pdfs/react-pdf-pretendard-spike-1.png
```

렌더링 결과:

- PNG 생성 성공
- 크기: 120,775 bytes
- 이미지 치수: 1191 x 1684
- 색상 모드: RGB

제한:

- Codex 이미지 뷰어가 Windows sandbox ACL 오류로 PNG 시각 검수를 열지 못했다.
- 기계 검증 기준으로는 PDF 생성, 텍스트 추출, PNG 렌더링이 모두 성공했다.
- 본 구현 단계에서는 브라우저 또는 로컬 이미지 뷰어로 최종 PDF 시각 검수를 다시 수행해야 한다.

---

## 6. Next.js 빌드 검증

초기 실패:

`PDFDownloadLink`를 App Router 페이지에서 직접 렌더링하면 production build의 prerender 단계에서 실패했다.

오류 요지:

```text
PDFDownloadLink is a web specific API.
You're either using this component on Node, or your bundler is not loading react-pdf from the appropriate web build.
```

원인:

- `PDFDownloadLink`는 web-only API다.
- App Router의 static prerender 과정에서 직접 평가되면 Node 환경에서 깨진다.

해결 패턴:

- `PDFDownloadLink`를 페이지에서 직접 쓰지 않는다.
- 다운로드 버튼 클릭 시점에 `@react-pdf/renderer`와 PDF Document 모듈을 동적 import한다.
- 예: `const [{ pdf }, { ReportPdfDocument }] = await Promise.all([import("@react-pdf/renderer"), import("./ReportPdfDocument")])`

검증 결과:

- 클릭 시 동적 import 패턴으로 `npm.cmd run build` 통과
- `/pdf-spike` 임시 라우트 기준 First Load JS: 104 kB
- PDF 관련 대형 청크는 초기 로드에 포함하지 않고 클릭 시점 로딩으로 분리 가능

---

## 7. 번들/자산 리스크

확인된 크기:

- `frontend/public/fonts` Pretendard WOFF 2개 합계: 2,244,680 bytes
- `@react-pdf` 관련 빌드 청크:
  - 약 649 KB
  - 약 357 KB
  - 약 1.6 KB

판정:

- PDF 기능을 `/report` 초기 로드에 직접 포함하면 부담이 크다.
- 버튼 클릭 시 동적 import하면 보고서 화면 기본 로딩에는 큰 영향을 주지 않는다.
- 폰트 2개 약 2.25MB는 MVP에서 감당 가능하지만, 추후 페이지 수와 굵기 수를 늘릴 때 주의해야 한다.

---

## 8. 구현 권장안

Report MVP에서는 다음 구조를 사용한다.

```text
frontend/app/(analysis)/report/page.tsx
frontend/lib/report/buildReportViewModel.ts
frontend/components/report/ReportPageView.tsx
frontend/components/report/ReportDownloadButton.tsx
frontend/components/report/pdf/ReportPdfDocument.tsx
frontend/components/report/pdf/registerReportFonts.ts
frontend/public/fonts/pretendard-400.woff
frontend/public/fonts/pretendard-700.woff
```

구현 원칙:

- `/result`와 `/report`는 분리한다.
- 화면용 보고서와 PDF는 같은 `ReportViewModel`을 사용한다.
- PDF 모듈은 `ReportDownloadButton` 클릭 시점에만 import한다.
- PDF는 3~4페이지 MVP로 제한한다.
- 표지, Executive Summary, 영역별 요약, 다음 행동만 포함한다.
- 운영 리스크는 영역별 요약에 병합한다.
- 핵심 진단 해석은 Executive Summary에 녹인다.

---

## 9. 전환 판단

`HTML + Playwright PDF`로 즉시 전환할 필요는 없다.

이유:

- 한글 텍스트 PDF 생성 성공
- 텍스트 추출 성공
- PNG 렌더링 생성 성공
- Next production build 성공
- 클릭 시 동적 import로 번들 리스크 통제 가능

단, 다음 조건이 생기면 대안을 재검토한다.

- 최종 3~4페이지에서 한글 줄바꿈이나 페이지 분할 품질이 크게 무너지는 경우
- 표/차트 레이아웃이 react-pdf에서 지나치게 제약되는 경우
- Vercel 실제 배포에서 PDF 청크 로딩 또는 폰트 fetch가 실패하는 경우

---

## 10. 다음 단계

다음 작업은 개발 구현이 아니라 Kyle의 문장/구조 입력을 기다린다.

필요 입력:

- Foundation / Hybrid / Alignment 모드별 표지 메시지
- 1페이지 Executive Summary 구조
- `/result`에서 `/report`와 PDF 다운로드로 이어지는 CTA 순서

위 입력이 들어오면 바로 3~4페이지 Report MVP 구현으로 넘어간다.
