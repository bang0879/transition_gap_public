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
  guidance?: {
    lead: string;
    principles: string[];
    closing: string;
  };
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
      ? { domain: "인력운영", label: "핵심 인재 반드시 보존", note: "핵심 역할 공백을 막기 위해 예외적 조치도 검토하는 방향입니다." }
      : { domain: "인력운영", label: "미입력", note: "핵심 인력 운영 철학 선택이 필요합니다." };
}

function buildConsistentInterpretation(answers: Record<PhilosophySummaryItem["id"], PhilosophyAnswer>) {
  const rewardLeadershipDirection =
    answers["L0-1"] === "A" && answers["L0-2"] === "A"
      ? "성과 기준을 명확히 세우고, 보상 차이도 비교적 크게 인정하는 성과주의형"
      : answers["L0-1"] === "B" && answers["L0-2"] === "B"
        ? "협업과 심리적 안전을 우선하면서, 보상도 수용성 있게 운영하려는 공동체형"
        : null;

  const sourcingStrategy =
    answers["L0-3"] === "A"
      ? "외부 검증 인재를 빠르게 받아들이는 채용 전략"
      : answers["L0-3"] === "B"
        ? "내부에서 시간을 들여 핵심 인재를 키우는 채용 전략"
        : null;

  const exceptionPolicy =
    answers["L0-4"] === "A"
      ? "형평성과 원칙을 더 우선하는 인력운영"
      : answers["L0-4"] === "B"
        ? "비즈니스 공백 방지를 위해 예외 조치도 열어두는 인력운영"
        : null;

  if (rewardLeadershipDirection && sourcingStrategy && exceptionPolicy) {
    return {
      title: "회사의 인사 철학은 큰 방향에서 일관되어 있습니다.",
      body: `회사의 보상·리더십 철학은 ${rewardLeadershipDirection}에 가깝습니다. 채용은 ${sourcingStrategy}, 인력운영은 ${exceptionPolicy}을 선택하셨습니다. 이제 다음 단계에서는 현행 제도가 이 방향을 실제로 받쳐주고 있는지 확인합니다.`,
    };
  }

  return {
    title: "회사의 인사 철학은 아직 한 문장으로 요약하기 어렵습니다.",
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
      title: "파격 차등 보상 ↔ 성과 차이를 말하지 않는 리더십",
      detail:
        "보상에서는 높은 성과 차이를 보상에 강하게 반영하려는 방향을 선택했지만, 리더십에서는 관계 관리와 심리적 안전을 우선했습니다.",
      implication:
        "두 방향은 반드시 모순되는 것은 아닙니다. 다만 리더가 갈등을 피하거나 낮은 평가의 이유를 구체적으로 말하지 못하면, 차등 보상은 성과관리 장치가 아니라 불공정·낙인·관계 훼손으로 받아들여질 수 있습니다.",
      guidance: {
        lead: "심리적 안전은 차등을 없애는 것이 아니라, 차등의 이유를 안전하게 말할 수 있게 만드는 조건입니다.",
        principles: [
          "무엇을 기준으로 차등하는지 평가 기준과 보상 기준을 먼저 명확히 합니다.",
          "리더가 성과 차이를 구체적 행동과 결과 중심으로 설명할 수 있어야 합니다.",
          "낮은 보상을 받은 구성원에게도 개선 방향과 다음 기회가 제시되어야 합니다.",
        ],
        closing:
          "따라서 차등 보상을 하지 말자는 의미가 아니라, 차등을 감당할 수 있는 리더십 체계와 성과 대화 방식을 먼저 갖추자는 의미입니다.",
      },
      domains: ["L0-1", "L0-2"],
      domain_labels: ["보상", "리더십"],
    });
  }

  if (answers["L0-1"] === "B" && answers["L0-2"] === "A") {
    conflicts.push({
      id: "stable_reward_strict_tracking",
      title: "안정 보상 ↔ 성과 추적 결과 활용 불일치",
      detail:
        "보상은 협업과 평균 만족도를 중시하는 안정형 방향을 선택했지만, 리더십에서는 성과 추적과 저성과 피드백을 강하게 요구하고 있습니다.",
      implication:
        "두 방향은 반드시 충돌하는 것은 아닙니다. 다만 성과를 엄격하게 측정해놓고 보상·승진·역할·육성·저성과 관리 어디에도 충분히 연결하지 않으면, 구성원은 '왜 이렇게까지 평가하는가?'라는 의문을 가질 수 있습니다.",
      guidance: {
        lead: "성과를 엄격히 본다면, 그 결과가 보상이든 성장기회든 역할이든 반드시 어떤 의사결정으로 연결되어야 합니다.",
        principles: [
          "보상 차이를 크게 두지 않을 것이라면 성과 추적 결과를 승진, 역할 기회, 육성, 배치, 저성과 개선과 연결합니다.",
          "성과 추적을 핵심 인재 선별과 성과주의 강화에 쓰려는 것이라면 보상에서도 어느 정도의 차등 신호가 필요합니다.",
          "측정의 강도와 결과 활용 방식이 맞지 않으면 성과관리는 동기부여가 아니라 관리 부담이나 감시로 인식될 수 있습니다.",
        ],
        closing:
          "핵심은 성과를 덜 보자는 것이 아니라, 성과를 왜 보는지와 그 결과를 어디에 쓸 것인지를 명확히 하는 것입니다.",
      },
      domains: ["L0-1", "L0-2"],
      domain_labels: ["보상", "리더십"],
    });
  }

  if (answers["L0-1"] === "B" && answers["L0-4"] === "B") {
    conflicts.push({
      id: "stable_reward_with_exception_retention",
      title: "안정 보상 ↔ 핵심 인재 예외 보존",
      detail: "보상 철학은 협업과 평균 만족도를 중시하지만, 핵심 인재 이탈 상황에서는 형평성 예외를 인정하겠다고 답하셨습니다.",
      implication:
        "문제는 예외보상 자체가 아니라, 예외보상이 구성원에게 어떤 신호로 해석되는가입니다. 안정/협업 메시지를 강조하는 조직에서는 특정 개인의 퇴사 언급 때문에 보상이 올라간 것처럼 보이지 않게 기준을 먼저 세워야 합니다.",
      guidance: {
        lead: "예외보상은 금지할 대상이 아니라 통제된 예외로 설계할 대상입니다.",
        principles: [
          "개인의 퇴사 위협이 아니라 직무 중요도, 대체 난이도, 성과 영향, 시장가치 같은 사전 기준으로 판단합니다.",
          "기본급을 무리하게 올리기보다 한시적 리텐션 보너스, 프로젝트 인센티브, 장기 성과보상, 성장기회처럼 조직 전체 보상질서를 덜 흔드는 방식부터 검토합니다.",
          "예외보상을 한 경우에도 역할 재설계, 승계자 육성, 업무 의존도 분산까지 함께 실행해 같은 리스크가 반복되지 않게 합니다.",
        ],
        closing:
          "핵심은 '떠나겠다고 한 사람에게 주는 돈'이 아니라 '조직 리스크를 줄이기 위한 사전 기준 기반의 리텐션 장치'로 설계하는 것입니다.",
      },
      domains: ["L0-1", "L0-4"],
      domain_labels: ["보상", "인력운영"],
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
