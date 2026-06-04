export interface LandingPreviewCard {
  id: string;
  label: string;
  philosophy: string;
  actual: string;
  percent: number;
  status: "일치" | "주의" | "심각";
}

export const LANDING_PREVIEW_CARDS: LandingPreviewCard[] = [
  { id: "compensation", label: "보상", philosophy: "성과 차등", actual: "균등/안정", percent: 42, status: "심각" },
  { id: "evaluation", label: "평가", philosophy: "엄격한 기준", actual: "관대/유연", percent: 58, status: "주의" },
  { id: "recruitment", label: "채용", philosophy: "외부 수혈", actual: "속도 보완", percent: 82, status: "일치" },
  { id: "retention", label: "인력운영", philosophy: "핵심 인재 보존", actual: "원칙 중심", percent: 61, status: "주의" },
  { id: "leadership", label: "리더십", philosophy: "성과 추적", actual: "관계 관리", percent: 48, status: "심각" },
];

export const LANDING_PREVIEW_SUMMARY = {
  score: 52,
  level: "정렬 필요",
  headline: "보상과 리더십의 방향이 어긋납니다.",
  body: "결과 페이지에서는 5개 제도 카드로 인사 철학과 현행 제도의 방향 차이를 바로 확인합니다.",
  conflict: "미리보기는 실제 리포트의 일부만 축약해 보여줍니다.",
};
