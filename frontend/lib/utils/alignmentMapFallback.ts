import type { AlignmentMapOut, AlignmentMapVectorOut } from "@/lib/types/api";
import type { AreaAnalysisOut } from "@/lib/types/api";
import type { ResponseValue } from "@/lib/store/responses";

function asNumber(value: ResponseValue | undefined, fallback: number): number {
  return typeof value === "number" ? value : fallback;
}

function asText(value: ResponseValue | undefined, fallback = "미입력"): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return fallback;
  return value === undefined || value === "" ? fallback : String(value);
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function directionLabel(x: number, y: number): string {
  if (Math.abs(x) < 0.18 && Math.abs(y) < 0.18) return "방향 약함";
  const horizontal = x >= 0.18 ? "성과·시장" : x <= -0.18 ? "공동체·장기 신뢰" : "중립";
  const vertical = y >= 0.18 ? "제도·데이터" : y <= -0.18 ? "관계·자율" : "중립";
  if (horizontal === "중립") return vertical;
  if (vertical === "중립") return horizontal;
  return `${horizontal} / ${vertical}`;
}

function vector(
  domain_id: string,
  domain_name: string,
  x: number,
  y: number,
  evidence: string[],
): AlignmentMapVectorOut {
  const clampedX = clamp(x);
  const clampedY = clamp(y);
  return {
    domain_id,
    domain_name,
    x: clampedX,
    y: clampedY,
    magnitude: Math.min(1, 0.55 + Math.abs(clampedX) * 0.25 + Math.abs(clampedY) * 0.2),
    direction_label: directionLabel(clampedX, clampedY),
    evidence,
  };
}

export function buildFallbackAlignmentMap(
  responses: Record<string, ResponseValue>,
  areas: AreaAnalysisOut[],
): AlignmentMapOut {
  const compensation = vector(
    "compensation",
    "보상",
    (asNumber(responses["2-3-1"], 3) - 3) / 2 + (asText(responses["2-3-2"]).includes("성과") ? 0.25 : 0),
    asText(responses["2-3-2"]).includes("성과") ? 0.55 : 0.12,
    [`보상 철학 ${asNumber(responses["2-3-1"], 3)}점`, `보상 구조: ${asText(responses["2-3-2"])}`],
  );
  const evaluation = vector(
    "evaluation",
    "평가",
    (asNumber(responses["2-4-2"], 3) - 3) / 2,
    asText(responses["2-4-5"]) === "모름 / 측정 안 함" ? 0.05 : 0.45,
    [`평가 주기: ${asText(responses["2-4-1a"])}`, `평가-보상 연동 ${asNumber(responses["2-4-2"], 3)}점`],
  );
  const recruitment = vector(
    "recruitment",
    "채용",
    asText(responses["L1-4"]).startsWith("공격적") ? 0.35 : -0.1,
    asText(responses["2-2-1"]).includes("4~6") ? -0.1 : 0.25,
    [`채용 기조: ${asText(responses["L1-4"])}`, `채용 소요 기간: ${asText(responses["2-2-1"])}`],
  );
  const retention = vector(
    "retention",
    "인력",
    -0.2,
    asText(responses["2-1-1"]) === "모름 / 측정 안 함" ? -0.2 : 0.25,
    [`자발적 이직률: ${asText(responses["2-1-1"])}`, `핵심 인재 이탈: ${asText(responses["2-1-2"])}`],
  );
  const leadership = vector(
    "leadership",
    "리더십",
    asText(responses["2-5-5"]) === "CEO 최종 승인 필요" ? 0.2 : -0.25,
    asText(responses["2-5-6"]) === "명확한 기준으로 작동함" ? 0.55 : 0.02,
    [`의사결정 구조: ${asText(responses["2-5-5"])}`, `핵심가치: ${asText(responses["2-5-6"])}`],
  );
  const vectors = [compensation, evaluation, recruitment, retention, leadership];
  const centroid_x = vectors.reduce((sum, item) => sum + item.x, 0) / vectors.length;
  const centroid_y = vectors.reduce((sum, item) => sum + item.y, 0) / vectors.length;
  const dispersion = vectors.reduce((sum, item) => sum + Math.hypot(item.x - centroid_x, item.y - centroid_y), 0) / vectors.length;
  const alignment_score = Math.max(0, Math.min(100, Math.round(100 - dispersion * 70)));
  const topGap = [...areas].sort((a, b) => b.gap - a.gap)[0];

  return {
    alignment_score,
    alignment_level: alignment_score >= 75 ? "대체로 정합" : alignment_score >= 55 ? "정렬 필요" : "엇박자 큼",
    dispersion: Number(dispersion.toFixed(3)),
    centroid_x: Number(centroid_x.toFixed(3)),
    centroid_y: Number(centroid_y.toFixed(3)),
    headline: "현재 응답 기준으로 제도 방향을 임시 계산했습니다.",
    summary: "백엔드 정합성 맵 응답이 아직 도착하지 않은 경우에도 입력값을 기준으로 보상, 평가, 채용, 인력, 리더십의 방향을 먼저 보여줍니다.",
    vectors,
    conflicts: [
      {
        id: "fallback_top_gap",
        title: `${topGap?.area_name ?? "핵심 영역"}부터 방향을 확인해야 합니다.`,
        detail: "이 카드는 임시 계산 결과입니다. 백엔드 서버를 재시작하면 더 정교한 엇박자 포인트가 표시됩니다.",
        domains: [topGap?.area_id ?? "compensation"],
        severity: "medium",
      },
    ],
  };
}
