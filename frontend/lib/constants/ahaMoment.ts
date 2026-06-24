import type { AlignmentAxisOut, AlignmentMapConflictOut } from "@/lib/types/api";

export type AhaTone = "teal" | "amber" | "coral" | "slate";

type AxisSide = "left" | "right" | "center";

interface ScenarioSet {
  current: string[];
  future: string[];
}

const DOMAIN_LABELS: Record<string, string> = {
  compensation: "보상",
  evaluation: "평가",
  recruitment: "채용",
  retention: "인력운영",
  leadership: "리더십",
};

const MIRROR_SENTENCES: Record<string, Partial<Record<`${AxisSide}_${AxisSide}`, string>>> = {
  compensation: {
    right_left:
      "입력한 철학은 안정적 보상 질서에 가깝지만, 현행 제도는 성과 차등 구조에 가깝습니다. 구성원은 '결국 성과급 회사'로 해석하고 있을 가능성이 있습니다.",
    left_right:
      "입력한 철학은 핵심 인재에게 파격적 보상을 주는 방향이지만, 현행 구조는 균등 배분에 가깝습니다. 고성과자는 '여기서는 잘해도 차이가 없다'고 느낄 수 있습니다.",
  },
  evaluation: {
    left_right:
      "입력한 철학은 평가를 통한 명확한 차별화를 원하지만, 현행 운영은 관대하고 유연한 평가에 가깝습니다. 고성과자는 '더 잘해도 달라지는 게 없다'고 느낄 수 있습니다.",
    right_left:
      "입력한 철학은 심리적 안전과 수용을 중시하지만, 현행 평가는 등급과 순위를 가르는 방향에 가깝습니다. 구성원은 '말로는 안전하다면서 평가는 칼같다'는 이중 메시지를 받을 수 있습니다.",
  },
  leadership: {
    right_left:
      "입력한 철학은 관계와 심리적 안전을 우선하지만, 현행 리더십 운영은 성과 부진을 빠르게 직면시키는 방향입니다. 팀장은 '부드럽게 하라면서 결과는 엄격히 묻는다'는 혼란을 느낄 수 있습니다.",
    left_right:
      "입력한 철학은 저성과를 빠르게 직면시키는 방향이지만, 현행 운영은 피드백을 회피하는 구조에 가깝습니다. 팀장은 불편한 대화를 미루고, 저성과자는 문제를 인식하지 못할 수 있습니다.",
  },
  recruitment: {
    right_left:
      "입력한 철학은 내부에서 키우는 방향이지만, 실제 운영은 외부 영입에 더 의존하고 있습니다. 내부 인재는 '여기서 올라갈 자리가 없다'고 판단할 수 있습니다.",
    left_right:
      "입력한 철학은 검증된 외부 인재를 빠르게 데려오는 방향이지만, 현행 구조는 내부 승진과 육성 중심에 가깝습니다. 성장에 필요한 전문 역량 확보가 늦어질 수 있습니다.",
  },
  retention: {
    left_right:
      "입력한 철학은 핵심 인재를 예외적으로라도 보존하는 방향이지만, 현행 운영은 원칙과 형평성을 더 우선하는 쪽에 가깝습니다. 중요한 역할 공백이 생겼을 때 실제로 어디까지 예외를 허용할지 기준이 필요합니다.",
    right_left:
      "입력한 철학은 원칙과 형평성을 우선하지만, 현행 운영은 핵심 인재에게 예외를 허용하는 쪽에 가깝습니다. 구성원은 '규칙이 사람마다 다르다'고 받아들일 수 있습니다.",
  },
};

const SCENARIOS: Record<string, ScenarioSet> = {
  compensation: {
    current: [
      "연봉 협상 시즌에 핵심 인재만 목소리를 높이고, 조용한 실무자는 불만을 삼키다가 갑자기 퇴사할 수 있습니다.",
      "카운터 오퍼를 받고 나서야 이직 의사를 알게 되고, 급하게 연봉을 올려주는 일이 반복될 수 있습니다.",
    ],
    future: [
      "급하게 올려준 연봉이 옆 팀에 알려지면서 '왜 나가겠다고 해야 연봉이 오르냐'는 학습 효과가 생길 수 있습니다.",
      "핵심 인재 2~3명이 동시에 이탈하면서 프로젝트 일정이 3~6개월 밀릴 수 있습니다.",
    ],
  },
  evaluation: {
    current: [
      "고성과자가 '내가 더 잘해도 평가에 반영이 안 된다'며 동기 저하를 느낄 수 있습니다.",
      "팀장이 평가 시즌을 부담스러워하며 모든 팀원에게 비슷한 등급을 줄 수 있습니다.",
    ],
    future: [
      "승진 기준이 불명확해지면서 '누구는 되고 누구는 안 되는' 정치적 의사결정이 늘어날 수 있습니다.",
      "고성과자가 이탈하고, 중간 성과자가 '여기서는 적당히 하는 게 최선'이라는 문화를 만들 수 있습니다.",
    ],
  },
  leadership: {
    current: [
      "팀장이 불편한 피드백을 피하고 문제를 대표에게만 에스컬레이션할 수 있습니다.",
      "성과 부진 팀원에 대한 대응이 팀장마다 완전히 달라질 수 있습니다.",
    ],
    future: [
      "중간 관리자 2~3명이 번아웃으로 이탈하면서 대표가 직접 실무까지 내려가야 할 수 있습니다.",
      "신규 팀장을 외부에서 데려와도 기존 팀원이 '또 새 사람이 와서 바꾸려 한다'며 저항할 수 있습니다.",
    ],
  },
  recruitment: {
    current: [
      "내부에서 승진을 기대하던 인재가 외부 영입 소식에 '내 자리가 없다'고 판단할 수 있습니다.",
      "외부 영입 인재가 기존 문화와 충돌하면서 온보딩 기간이 예상보다 2~3배 길어질 수 있습니다.",
    ],
    future: [
      "외부 영입 인재의 연봉이 내부 인재보다 높아지면서 보상 형평성 문제로 번질 수 있습니다.",
      "좋은 사람이 안 온다 → 급하게 뽑는다 → 미스매치가 반복되는 채용 악순환이 생길 수 있습니다.",
    ],
  },
  retention: {
    current: [
      "'왜 그 사람만 특별 대우를 받느냐'는 불만이 비공식적으로 돌 수 있습니다.",
      "핵심 인재 기준이 불명확해 누가 핵심인지에 대한 합의가 리더마다 달라질 수 있습니다.",
    ],
    future: [
      "예외가 관례가 되면서 원래 규칙을 지키는 사람이 손해 보는 구조가 생길 수 있습니다.",
      "조직 안에 보이지 않는 계층이 생기고, 비핵심 인력의 몰입도가 빠르게 떨어질 수 있습니다.",
    ],
  },
};

const ENTANGLEMENT_MESSAGES: Array<{ domains: string[]; title: string; body: string }> = [
  {
    domains: ["compensation", "evaluation"],
    title: "보상과 평가는 같이 봐야 합니다.",
    body: "보상 기준을 바꾸려면 평가 기준도 같이 바뀌어야 합니다. 보상만 균등으로 바꾸고 평가는 차등을 유지하면, 구성원은 '평가는 왜 하는 건지'를 묻기 시작합니다.",
  },
  {
    domains: ["compensation", "retention"],
    title: "보상 철학과 핵심 인재 예외 기준을 같이 봐야 합니다.",
    body: "핵심 인재에게 예외를 인정하는 방향은 차등 보상 철학과 맞으면 강력한 메시지가 될 수 있습니다. 다만 안정 보상·형평성 메시지와 함께 쓰이면 구성원은 어떤 기준이 우선인지 혼란을 느낄 수 있습니다.",
  },
  {
    domains: ["evaluation", "leadership"],
    title: "평가를 강화하면 리더십 부담도 같이 커집니다.",
    body: "평가를 엄격하게 바꾸면 리더에게 불편한 대화를 할 역량이 필요합니다. 리더십 준비 없이 평가만 강화하면, 평가 시즌마다 팀장이 무너질 수 있습니다.",
  },
  {
    domains: ["recruitment", "retention"],
    title: "외부 영입은 내부 형평성과 바로 연결됩니다.",
    body: "외부 영입을 늘리면서 내부 형평성을 유지하려면 직급과 역할 기준이 먼저 정비되어야 합니다. 기준 없이 영입하면 '같은 일을 하는데 연봉이 다른' 상황이 반복됩니다.",
  },
];

export function displayAhaDomainName(axisOrId: AlignmentAxisOut | string): string {
  const id = typeof axisOrId === "string" ? axisOrId : axisOrId.domain_id;
  if (DOMAIN_LABELS[id]) return DOMAIN_LABELS[id];
  if (typeof axisOrId !== "string") {
    if (axisOrId.domain_name === "인재") return "채용";
    if (axisOrId.domain_name === "인력") return "인력운영";
    return axisOrId.domain_name;
  }
  return id;
}

export function alignmentPercent(axis: AlignmentAxisOut): number {
  if (typeof axis.alignment_percent === "number") {
    return Math.max(0, Math.min(100, Math.round(axis.alignment_percent)));
  }
  return Math.max(0, Math.min(100, Math.round((1 - axis.tension / 2) * 100)));
}

export function statusLabel(axis: AlignmentAxisOut): AlignmentAxisOut["status_label"] {
  if (axis.status_label) return axis.status_label;
  const percent = alignmentPercent(axis);
  if (percent >= 80) return "일치";
  if (percent >= 50) return "주의";
  return "심각";
}

export function scoreTone(score: number): AhaTone {
  if (score >= 80) return "teal";
  if (score >= 55) return "amber";
  return "coral";
}

export function axisSide(position: number): AxisSide {
  if (position < -0.15) return "left";
  if (position > 0.15) return "right";
  return "center";
}

export function getMirrorSentence(axis: AlignmentAxisOut): string | null {
  if (statusLabel(axis) === "일치") return null;
  const key = `${axisSide(axis.philosophy_position)}_${axisSide(axis.actual_position)}` as const;
  const mapped = MIRROR_SENTENCES[axis.domain_id]?.[key];
  if (mapped) return mapped;
  if (key.includes("center")) return null;
  return `입력한 철학은 ${axis.philosophy_label}에 가깝지만, 현행 제도는 ${axis.actual_label}에 가깝습니다. 구성원은 회사가 말하는 기준과 실제 운영 기준을 다르게 받아들일 수 있습니다.`;
}

export function getScenarioLines(axis: AlignmentAxisOut, maxItems = 3): string[] {
  if (statusLabel(axis) === "일치") return [];
  const set = SCENARIOS[axis.domain_id];
  if (!set) return [];
  return [...set.current.slice(0, 2), ...set.future.slice(0, 1)].slice(0, maxItems);
}

export function getPrimaryScenario(axis: AlignmentAxisOut): string | null {
  return getScenarioLines(axis, 1)[0] ?? null;
}

export function topGapAxis(axes: AlignmentAxisOut[]): AlignmentAxisOut | null {
  if (axes.length === 0) return null;
  return [...axes].sort((a, b) => alignmentPercent(a) - alignmentPercent(b))[0] ?? null;
}

export function getEntanglementMessage(conflict: AlignmentMapConflictOut): { title: string; body: string } | null {
  const domainSet = new Set(conflict.domains);
  return (
    ENTANGLEMENT_MESSAGES.find((message) => message.domains.every((domain) => domainSet.has(domain))) ?? null
  );
}
