type PhilosophyAnswer = "A" | "B" | null;

export interface PhilosophySummaryItem {
  id: "L0-1" | "L0-2" | "L0-3" | "L0-4";
  domain: string;
  label: string;
  note: string;
  answer: PhilosophyAnswer;
}

export interface PhilosophyConflict {
  id: string;
  title: string;
  detail: string;
  implication: string;
  domains: [PhilosophySummaryItem["id"], PhilosophySummaryItem["id"]];
  domain_labels: [string, string];
}

export interface PhilosophyProfile {
  isComplete: boolean;
  answeredCount: number;
  summaries: PhilosophySummaryItem[];
  conflicts: PhilosophyConflict[];
  consistent_interpretation: {
    title: string;
    body: string;
  };
}

const REQUIRED_IDS = ["L0-1", "L0-2", "L0-3", "L0-4"] as const;

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function answerFor(id: PhilosophySummaryItem["id"], value: unknown): PhilosophyAnswer {
  const text = asText(value);
  if (!text) return null;

  if (id === "L0-1") {
    if (
      text.includes("파격 차등보다는") ||
      text.includes("협업") ||
      text.includes("평균 보상") ||
      text.includes("팀 기여")
    ) {
      return "B";
    }
    if (text.includes("파격") || text.includes("상위 고성과자")) return "A";
  }
  if (id === "L0-2") {
    if (text.includes("성과 추적") || text.includes("솔직한 피드백")) return "A";
    if (text.includes("심리적 안전") || text.includes("1:1")) return "B";
  }
  if (id === "L0-3") {
    if (text.includes("외부") || text.includes("S급") || text.includes("즉시 전력")) return "A";
    if (text.includes("내부") || text.includes("육성") || text.includes("문화")) return "B";
  }
  if (id === "L0-4") {
    if (text.includes("원칙대로 내보낸다") || text.includes("형평성")) return "A";
    if (text.includes("파격적으로 잡는다") || text.includes("비즈니스 공백")) return "B";
  }

  return null;
}

function labelFor(id: PhilosophySummaryItem["id"], answer: PhilosophyAnswer): Pick<PhilosophySummaryItem, "domain" | "label" | "note"> {
  if (id === "L0-1") {
    return answer === "A"
      ? { domain: "보상", label: "파격 차등 보상", note: "성과 차이가 크면 보상 차이도 크게 가져가는 방향입니다." }
      : answer === "B"
        ? { domain: "보상", label: "협업 기반 안정 보상", note: "개인 차등보다 조직 전체의 수용성과 팀 기여를 중시합니다." }
        : { domain: "보상", label: "미입력", note: "보상 철학 선택이 필요합니다." };
  }
  if (id === "L0-2") {
    return answer === "A"
      ? { domain: "리더십", label: "성과 추적 / 단호한 피드백", note: "목표와 결과를 명확히 보고 저성과 이슈를 피하지 않는 방향입니다." }
      : answer === "B"
        ? { domain: "리더십", label: "관계 관리 / 심리적 안전", note: "리더가 구성원의 고충과 신뢰 기반을 먼저 챙기는 방향입니다." }
        : { domain: "리더십", label: "미입력", note: "리더십 철학 선택이 필요합니다." };
  }
  if (id === "L0-3") {
    return answer === "A"
      ? { domain: "채용", label: "외부 검증 인재 수혈", note: "성장 속도에 필요한 역량을 밖에서 빠르게 확보하는 방향입니다." }
      : answer === "B"
        ? { domain: "채용", label: "내부 육성 / 문화 적합성", note: "시간을 들여 회사 맥락을 아는 핵심 인재를 키우는 방향입니다." }
        : { domain: "채용", label: "미입력", note: "채용 철학 선택이 필요합니다." };
  }

  return answer === "A"
    ? { domain: "인력운영", label: "자연 교체 허용 / 원칙 유지", note: "한 사람에게 과도하게 의존하지 않는 조직 원칙을 중시합니다." }
    : answer === "B"
      ? { domain: "인력운영", label: "핵심 인재 반드시 보존", note: "핵심 역할 공백을 막기 위해 예외적 조치도 감수하는 방향입니다." }
      : { domain: "인력운영", label: "미입력", note: "핵심 인력 운영 철학 선택이 필요합니다." };
}

function buildConsistentInterpretation(answers: Record<PhilosophySummaryItem["id"], PhilosophyAnswer>) {
  const rewardLeadershipDirection =
    answers["L0-1"] === "A" && answers["L0-2"] === "A"
      ? "성과 기준을 명확히 세우고, 보상 차이도 비교적 크게 인정하는 성과주의형"
      : answers["L0-1"] === "B" && answers["L0-2"] === "B"
        ? "협업과 심리적 안전을 우선하면서, 보상도 수용성 있게 운영하려는 공동체형"
        : null;

  const hiringRetentionDirection =
    answers["L0-3"] === "A" && answers["L0-4"] === "A"
      ? "외부 검증 인재를 빠르게 받아들이고, 특정 개인 의존도는 낮추려는 유연한 교체형"
      : answers["L0-3"] === "B" && answers["L0-4"] === "B"
        ? "내부에서 핵심 인재를 키우고, 중요한 사람은 오래 붙잡으려는 내부 축적형"
        : null;

  if (rewardLeadershipDirection && hiringRetentionDirection) {
    return {
      title: "대표님의 철학은 큰 방향에서 일관되어 있습니다.",
      body: `${rewardLeadershipDirection}에 가깝고, 채용·인력운영은 ${hiringRetentionDirection}에 가깝습니다. 이제 다음 단계에서는 현행 제도가 이 방향을 실제로 받쳐주고 있는지 확인합니다.`,
    };
  }

  return {
    title: "대표님의 철학은 아직 한 문장으로 요약하기 어렵습니다.",
    body: "일부 항목이 비어 있거나 서로 다른 방향을 함께 담고 있습니다. 네 가지 기준을 모두 선택하면 보상·리더십과 채용·인력운영의 방향을 함께 해석합니다.",
  };
}

export function buildPhilosophyProfile(responses: Record<string, unknown>): PhilosophyProfile {
  const answers = {
    "L0-1": answerFor("L0-1", responses["L0-1"]),
    "L0-2": answerFor("L0-2", responses["L0-2"]),
    "L0-3": answerFor("L0-3", responses["L0-3"]),
    "L0-4": answerFor("L0-4", responses["L0-4"]),
  };

  const summaries = REQUIRED_IDS.map((id) => ({
    id,
    answer: answers[id],
    ...labelFor(id, answers[id]),
  }));

  const conflicts: PhilosophyConflict[] = [];

  if (answers["L0-1"] === "A" && answers["L0-2"] === "B") {
    conflicts.push({
      id: "differentiated_reward_relationship_leadership",
      title: "차등 보상 ↔ 심리적 안전",
      detail: "보상에서는 파격적 차등을 원하지만, 리더십에서는 관계 관리와 심리적 안전을 우선했습니다.",
      implication: "차등 보상을 실행하려면 리더가 성과 차이를 명확히 말할 수 있어야 합니다. 이 두 방향은 실행 단계에서 충돌할 수 있습니다.",
      domains: ["L0-1", "L0-2"],
      domain_labels: ["보상", "리더십"],
    });
  }

  if (answers["L0-1"] === "B" && answers["L0-2"] === "A") {
    conflicts.push({
      id: "stable_reward_strict_tracking",
      title: "안정 보상 ↔ 엄격한 성과 추적",
      detail: "보상은 협업과 평균 만족도를 중시하지만, 리더십은 성과 추적과 저성과 피드백을 강하게 요구합니다.",
      implication: "성과를 엄격히 추적해놓고 보상 차이를 작게 가져가면 구성원은 평가의 목적을 이해하기 어렵습니다.",
      domains: ["L0-1", "L0-2"],
      domain_labels: ["보상", "리더십"],
    });
  }

  if (answers["L0-3"] === "A" && answers["L0-4"] === "B") {
    conflicts.push({
      id: "external_hiring_core_retention",
      title: "외부 수혈 ↔ 핵심 인재 보존",
      detail: "채용 철학은 외부 검증 인재를 빠르게 데려오는 쪽인데, 인력운영 철학은 기존 핵심 인재를 예외적으로라도 붙잡는 쪽입니다.",
      implication: "외부 영입과 예외 보존을 동시에 강하게 밀면 기존 멤버와 신규 핵심 인재 사이의 형평성 논란이 커질 수 있습니다.",
      domains: ["L0-3", "L0-4"],
      domain_labels: ["채용", "인력운영"],
    });
  }

  if (answers["L0-3"] === "B" && answers["L0-4"] === "A") {
    conflicts.push({
      id: "internal_development_natural_turnover",
      title: "내부 육성 ↔ 자연 교체 허용",
      detail: "채용 철학은 내부 인재를 오래 키우는 쪽인데, 인력운영 철학은 핵심 인재 이탈도 원칙대로 받아들이는 쪽입니다.",
      implication: "오래 키운 인재를 쉽게 보내는 구조라면 육성 투자 회수와 후임 계획을 훨씬 더 촘촘히 설계해야 합니다.",
      domains: ["L0-3", "L0-4"],
      domain_labels: ["채용", "인력운영"],
    });
  }

  return {
    isComplete: REQUIRED_IDS.every((id) => answers[id] !== null),
    answeredCount: REQUIRED_IDS.filter((id) => answers[id] !== null).length,
    summaries,
    conflicts,
    consistent_interpretation: buildConsistentInterpretation(answers),
  };
}
