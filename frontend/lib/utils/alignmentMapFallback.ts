import type { AlignmentAxisOut, AlignmentMapOut, AlignmentMapVectorOut } from "@/lib/types/api";
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

function choicePosition(
  value: ResponseValue | undefined,
  optionA: number,
  optionB: number,
  aKeywords: string[],
  bKeywords: string[],
): number {
  const text = asText(value);
  if (text === "A" || aKeywords.some((keyword) => text.includes(keyword))) return optionA;
  if (text === "B" || bKeywords.some((keyword) => text.includes(keyword))) return optionB;
  return 0;
}

function tensionLevel(tension: number): AlignmentAxisOut["tension_level"] {
  if (tension >= 0.75) return "misaligned";
  if (tension >= 0.35) return "watch";
  return "aligned";
}

function sideLabel(position: number, leftLabel: string, rightLabel: string): string {
  if (position < -0.15) return leftLabel;
  if (position > 0.15) return rightLabel;
  return "혼합형";
}

function policyDirection(actualPosition: number): AlignmentAxisOut["policy_direction"] {
  return actualPosition < 0 ? "성과·시장 중심" : "안정·관계 중심";
}

function axisHeadline(
  domainName: string,
  philosophy: number,
  actual: number,
  leftLabel: string,
  rightLabel: string,
): string {
  const philosophyLabel = sideLabel(philosophy, leftLabel, rightLabel);
  const actualLabel = sideLabel(actual, leftLabel, rightLabel);
  return `${domainName}: 대표님의 철학은 ${philosophyLabel}, 현행 제도는 ${actualLabel}에 가깝습니다.`;
}

function alignmentPercent(tension: number): number {
  return Math.max(0, Math.min(100, Math.round((1 - tension / 2) * 100)));
}

function statusLabel(percent: number): AlignmentAxisOut["status_label"] {
  if (percent >= 80) return "일치";
  if (percent >= 50) return "주의";
  return "심각";
}

function riskForAxis(domainId: string, tension: number): string | null {
  if (tension < 0.75) return null;
  const risks: Record<string, string> = {
    compensation: "차등 보상 철학과 실제 균등 운영이 벌어지면 고성과자는 보상 신호를 믿기 어렵고, 내부 공정성 논쟁은 더 커질 수 있습니다.",
    evaluation: "엄격한 성과 철학과 느슨한 평가 운영이 벌어지면 고성과자는 불공정성을 느끼고 저성과자는 개선 압력을 받기 어렵습니다.",
    recruitment: "외부 영입 철학과 내부 양성 중심 운영이 벌어지면 성장 속도에 필요한 역량 확보가 늦어질 수 있습니다.",
    retention: "핵심 인재 예외 인정 철학과 획일적 안정 운영이 벌어지면 중요한 역할 공백 비용이 반복될 수 있습니다.",
    leadership: "성과 추적 철학과 관계 중심 리더십 운영이 벌어지면 의사결정 지연과 책임 회피가 리더십 신호로 굳어질 수 있습니다.",
  };
  return risks[domainId] ?? null;
}

function axis(
  domain_id: string,
  domain_name: string,
  left_label: string,
  right_label: string,
  philosophyPosition: number,
  actualPosition: number,
  evidence: string[],
): AlignmentAxisOut {
  const philosophy_position = Number(clamp(philosophyPosition).toFixed(3));
  const actual_position = Number(clamp(actualPosition).toFixed(3));
  const tension = Number(Math.abs(actual_position - philosophy_position).toFixed(3));
  const percent = alignmentPercent(tension);
  return {
    domain_id,
    domain_name,
    left_label,
    right_label,
    philosophy_label: sideLabel(philosophy_position, left_label, right_label),
    philosophy_note: "입력한 인사 철학 기준으로 임시 계산했습니다.",
    actual_label: sideLabel(actual_position, left_label, right_label),
    policy_direction: policyDirection(actual_position),
    alignment_percent: percent,
    status_label: statusLabel(percent),
    philosophy_position,
    actual_position,
    tension,
    tension_level: tensionLevel(tension),
    headline: axisHeadline(domain_name, philosophy_position, actual_position, left_label, right_label),
    evidence,
    business_risk: riskForAxis(domain_id, tension),
  };
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
    asText(responses["2-2-1"]).includes("4~6") || asText(responses["2-2-4"]) === "거의 없음" ? -0.1 : 0.25,
    [`채용 기조: ${asText(responses["L1-4"])}`, `채용 브랜딩: ${asText(responses["2-2-4"])}`],
  );
  const retention = vector(
    "retention",
    "인력운영",
    -0.2,
    asText(responses["2-1-1"]) === "모름 / 측정 안 함" || asText(responses["2-1-4"]) === "별도 기준 없음" ? -0.2 : 0.25,
    [`핵심 인재 기준: ${asText(responses["2-1-4"])}`, `핵심 포스트 대체 계획: ${asText(responses["2-1-5"])}`],
  );
  const leadership = vector(
    "leadership",
    "리더십",
    asText(responses["2-5-5"]) === "CEO 최종 승인 필요" ? 0.2 : -0.25,
    asText(responses["2-5-6"]) === "명확한 기준으로 작동함" ? 0.55 : 0.02,
    [`의사결정 구조: ${asText(responses["2-5-5"])}`, `핵심가치 작동: ${asText(responses["2-5-6"])}`],
  );
  const vectors = [compensation, evaluation, recruitment, retention, leadership];
  const axes = buildFallbackAlignmentAxes(responses);
  const centroid_x = vectors.reduce((sum, item) => sum + item.x, 0) / vectors.length;
  const centroid_y = vectors.reduce((sum, item) => sum + item.y, 0) / vectors.length;
  const dispersion = vectors.reduce((sum, item) => sum + Math.hypot(item.x - centroid_x, item.y - centroid_y), 0) / vectors.length;
  const alignment_score = Math.max(0, Math.min(100, Math.round(100 - dispersion * 70)));
  const topGap = [...areas].sort((a, b) => b.gap - a.gap)[0];

  return {
    alignment_score,
    alignment_level: alignment_score >= 75 ? "대체로 정합" : alignment_score >= 55 ? "정렬 필요" : "괴리 큼",
    dispersion: Number(dispersion.toFixed(3)),
    centroid_x: Number(centroid_x.toFixed(3)),
    centroid_y: Number(centroid_y.toFixed(3)),
    headline: "현재 응답 기준으로 제도 방향을 임시 계산했습니다.",
    summary: "백엔드 응답이 지연될 때도 입력값 기준으로 보상, 평가, 채용, 인력운영, 리더십의 방향을 먼저 보여줍니다.",
    vectors,
    axes,
    conflicts: [
      {
        id: "fallback_top_gap",
        title: `${topGap?.area_name ?? "핵심 영역"}부터 방향을 확인해야 합니다.`,
        detail: "이 카드는 임시 계산 결과입니다. 백엔드 서버를 다시 연결하면 더 정교한 괴리 사인을 표시합니다.",
        domains: [topGap?.area_id ?? "compensation"],
        severity: "medium",
      },
    ],
  };
}

export function buildFallbackAlignmentAxes(responses: Record<string, ResponseValue>): AlignmentAxisOut[] {
  const rewardStructure = asText(responses["2-3-2"]);
  const evalLink = asNumber(responses["2-4-2"], 3);
  const evalCycle = asText(responses["2-4-1a"]);
  const evalData = asText(responses["2-4-5"]);
  const hiringPlan = asText(responses["L1-4"]);
  const hiringDuration = asText(responses["2-2-1"]);
  const hiringBranding = asText(responses["2-2-4"]);
  const onboarding = asText(responses["2-2-5"]);
  const market = asText(responses["2-3-5"]);
  const turnover = asText(responses["2-1-1"]);
  const coreLoss = asText(responses["2-1-2"]);
  const talentCriteria = asText(responses["2-1-4"]);
  const succession = asText(responses["2-1-5"]);
  const feedback = asText(responses["2-5-1"]);
  const oneOnOne = asText(responses["2-5-2"]);
  const coreValues = asText(responses["2-5-6"]);

  const compensationPhilosophy = choicePosition(
    responses["L0-1"],
    -0.75,
    0.75,
    ["파격", "상위 고성과자"],
    ["협업", "평균 보상", "팀 기여"],
  );
  let compensationActual = -((asNumber(responses["2-3-1"], 3) - 3) / 2);
  if (rewardStructure.includes("성과") || rewardStructure.includes("인센티브")) compensationActual -= 0.25;
  if (rewardStructure.includes("안정") || rewardStructure.includes("기본급")) compensationActual += 0.2;
  if (evalLink >= 4) compensationActual -= 0.15;
  if (evalLink <= 2) compensationActual += 0.15;

  const evaluationPhilosophy = (
    choicePosition(responses["L0-1"], -0.75, 0.45, ["파격", "상위 고성과자"], ["협업", "평균 보상", "팀 기여"]) +
    choicePosition(responses["L0-2"], -0.65, 0.55, ["성과 추적", "솔직한 피드백", "저성과"], ["1:1", "코칭", "심리적 안전"])
  ) / 2;
  let evaluationActual = -((evalLink - 3) / 2);
  if (evalCycle === "운영하지 않음" || evalCycle === "미입력") evaluationActual += 0.45;
  if (evalData === "모름 / 측정 안 함" || evalData === "미입력") evaluationActual += 0.3;
  if (evalCycle.includes("분기") || evalCycle.includes("상시")) evaluationActual -= 0.15;

  const recruitmentPhilosophy = choicePosition(
    responses["L0-3"],
    -0.75,
    0.75,
    ["외부", "S급", "즉시 전력"],
    ["내부", "주니어", "육성"],
  );
  let recruitmentActual = 0.15;
  if (hiringPlan.startsWith("공격적")) recruitmentActual -= 0.4;
  if (hiringDuration.includes("2개월")) recruitmentActual -= 0.15;
  if (hiringDuration.includes("4~6") || hiringDuration.includes("6개월 초과")) recruitmentActual += 0.2;
  if (hiringBranding === "채용 페이지/컬처덱/인터뷰 자료가 있음") recruitmentActual -= 0.1;
  if (hiringBranding === "거의 없음") recruitmentActual += 0.12;
  if (onboarding === "정기적으로 추적함") recruitmentActual += 0.08;
  if (onboarding === "추적하지 않음") recruitmentActual -= 0.08;
  if (market === "상위") recruitmentActual -= 0.15;
  if (market === "하위") recruitmentActual += 0.15;

  const retentionPhilosophy = choicePosition(
    responses["L0-4"],
    -0.75,
    0.75,
    ["형평성", "보상 원칙", "원칙대로 내보낸다"],
    ["비즈니스 공백", "예외를 인정", "파격적으로 잡는다"],
  );
  let retentionActual = 0.35;
  if (coreLoss === "2~3명" || coreLoss === "4명 이상") retentionActual -= 0.45;
  if (turnover === "20% 초과" || turnover === "20% 이상") retentionActual -= 0.25;
  if (turnover === "모름 / 측정 안 함") retentionActual -= 0.15;
  if (talentCriteria === "명확한 기준과 명단이 있음") retentionActual -= 0.08;
  if (talentCriteria === "별도 기준 없음") retentionActual += 0.12;
  if (succession === "후임/백업 후보가 정해져 있음") retentionActual += 0.12;
  if (succession === "거의 없음") retentionActual -= 0.12;

  const leadershipPhilosophy = choicePosition(
    responses["L0-2"],
    -0.75,
    0.75,
    ["성과 추적", "솔직한 피드백", "저성과"],
    ["1:1", "코칭", "심리적 안전"],
  );
  let leadershipActual = 0.1;
  if (feedback.includes("객관적으로") || coreValues === "명확한 기준으로 작동함") leadershipActual -= 0.35;
  if (oneOnOne === "운영함") leadershipActual += 0.25;
  if (feedback.includes("대표의 느낌")) leadershipActual -= 0.2;
  if (coreValues === "문서로만 존재함") leadershipActual += 0.15;

  return [
    axis("compensation", "보상", "차등·파격", "균등·안정", compensationPhilosophy, compensationActual, [
      `보상 철학: ${asText(responses["L0-1"])}`,
      `보상 구조: ${rewardStructure}`,
      `평가-보상 연동: ${evalLink}점`,
    ]),
    axis("evaluation", "평가", "엄격·정량", "코칭·관계", evaluationPhilosophy, evaluationActual, [
      `성과/피드백 철학: ${asText(responses["L0-2"])}`,
      `평가 주기: ${evalCycle}`,
      `평가 운영 데이터: ${evalData}`,
    ]),
    axis("recruitment", "채용", "외부 영입·속도", "내부 육성·적응", recruitmentPhilosophy, recruitmentActual, [
      `채용 철학: ${asText(responses["L0-3"])}`,
      `채용 기조: ${hiringPlan}`,
      `채용 브랜딩: ${hiringBranding}`,
    ]),
    axis("retention", "인력운영", "조직 안정·원칙", "핵심 인재 예외·사업 공백", retentionPhilosophy, retentionActual, [
      `핵심 인력 철학: ${asText(responses["L0-4"])}`,
      `핵심 인재 기준: ${talentCriteria}`,
      `핵심 포스트 대체 계획: ${succession}`,
    ]),
    axis("leadership", "리더십", "성과 추적·직면", "관계 관리·안전", leadershipPhilosophy, leadershipActual, [
      `리더십 철학: ${asText(responses["L0-2"])}`,
      `리더 피드백: ${feedback}`,
      `핵심가치 작동: ${coreValues}`,
    ]),
  ];
}
