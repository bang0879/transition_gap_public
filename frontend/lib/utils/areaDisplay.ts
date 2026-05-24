export function areaDisplayName(areaId: string, fallback: string): string {
  if (areaId === "leadership") return "평가·리더십";
  return fallback;
}

export function gapLabel(gap: number): string {
  if (gap >= 10) return `기준점 대비 ${gap}점 미달`;
  if (gap > 0) return `기준점 차이 ${gap}점`;
  return "기준점 충족";
}
