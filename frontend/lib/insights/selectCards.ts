import type { ResponseValue } from "../store/responses";

export type DiagnosisMode = "foundation" | "hybrid" | "alignment";

export type InsightDomain =
  | "compensation"
  | "evaluation"
  | "recruiting"
  | "retention"
  | "leadership"
  | "cross_domain";

export type InsightAxis = "mechanism" | "cascade" | "time" | "counter_intuitive" | "global";

export type CitationSource =
  | "samsung_global"
  | "mercer"
  | "shrm_2025"
  | "hr_analytics_tf"
  | "global_pattern";

export interface InsightAxisLike {
  domain_id: string;
  tension?: number;
  tension_level?: string;
  status_label?: string;
}

export interface InsightSignalLike {
  domain_id: string;
  severity?: string;
}

export interface InsightSelectionContext {
  responses: Record<string, ResponseValue>;
  mode: DiagnosisMode;
  axes?: InsightAxisLike[];
  foundationSignals?: InsightSignalLike[];
  alignmentSignals?: InsightSignalLike[];
}

export interface InsightCard {
  id: string;
  domain: InsightDomain;
  axis: InsightAxis;
  priority: number;
  trigger: {
    description: string;
    condition: (context: InsightSelectionContext) => boolean;
  };
  title: string;
  generalView: string;
  insight: string;
  compactInsight: string;
  ceoPrompt: string;
  citationSource?: CitationSource;
}

export interface InsightPlacement {
  page3Hero: InsightCard | null;
  page4Embedded: InsightCard[];
  page5SelectionTrap: InsightCard | null;
  page6Closing: InsightCard | null;
}

const DOMAIN_ALIASES: Record<string, string[]> = {
  compensation: ["compensation", "보상"],
  evaluation: ["evaluation", "평가"],
  recruiting: ["recruiting", "recruitment", "채용"],
  retention: ["retention", "인력", "유지", "리텐션"],
  leadership: ["leadership", "리더십"],
};

function textValue(responses: Record<string, ResponseValue>, key: string): string {
  const value = responses[key];
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return "";
}

function responseIncludes(context: InsightSelectionContext, key: string, needles: string[]): boolean {
  const text = textValue(context.responses, key);
  return needles.some((needle) => text.includes(needle));
}

function painIncludes(context: InsightSelectionContext, needles: string[]): boolean {
  return responseIncludes(context, "L1-1", needles);
}

function numericResponse(context: InsightSelectionContext, key: string): number | null {
  const value = context.responses[key];
  return typeof value === "number" ? value : null;
}

function headcountBand(context: InsightSelectionContext): { min: number; max: number } {
  const headcount = textValue(context.responses, "L1-2");
  if (headcount.includes("20인 이하")) return { min: 1, max: 20 };
  if (headcount.includes("20~50")) return { min: 20, max: 50 };
  if (headcount.includes("50~100")) return { min: 50, max: 100 };
  if (headcount.includes("100~500")) return { min: 100, max: 500 };
  if (headcount.includes("500")) return { min: 500, max: 9999 };
  return { min: 0, max: 0 };
}

function overlapsHeadcount(context: InsightSelectionContext, min: number, max: number): boolean {
  const band = headcountBand(context);
  return band.max >= min && band.min <= max;
}

function isHeadcountAtLeast(context: InsightSelectionContext, min: number): boolean {
  return headcountBand(context).max >= min;
}

function matchingDomainIds(domain: InsightDomain): string[] {
  return DOMAIN_ALIASES[domain] ?? [domain];
}

function hasDomainSignal(context: InsightSelectionContext, domain: InsightDomain): boolean {
  if (domain === "cross_domain") return false;
  const aliases = matchingDomainIds(domain);
  const signals = [...(context.foundationSignals ?? []), ...(context.alignmentSignals ?? [])];
  const fromSignals = signals.some((signal) => {
    const severity = signal.severity ?? "";
    return aliases.includes(signal.domain_id) && (severity === "high" || severity === "medium" || severity === "심각" || severity === "주의");
  });
  if (fromSignals) return true;

  return (context.axes ?? []).some((axis) => {
    const strongStatus = axis.tension_level === "misaligned" || axis.status_label === "심각" || (axis.tension ?? 0) >= 50;
    return aliases.includes(axis.domain_id) && strongStatus;
  });
}

function strongAxisCount(context: InsightSelectionContext): number {
  return (context.axes ?? []).filter((axis) => axis.tension_level === "misaligned" || axis.status_label === "심각" || (axis.tension ?? 0) >= 50).length;
}

function domainTension(context: InsightSelectionContext, domain: InsightDomain): number {
  const aliases = matchingDomainIds(domain);
  return Math.max(0, ...(context.axes ?? []).filter((axis) => aliases.includes(axis.domain_id)).map((axis) => axis.tension ?? 0));
}

function allDomainsHaveSignals(context: InsightSelectionContext, domains: InsightDomain[]): boolean {
  return domains.every((domain) => hasDomainSignal(context, domain));
}

export const INSIGHT_CARDS: InsightCard[] = [
  {
    id: "comp_counteroffer",
    domain: "compensation",
    axis: "time",
    priority: 98,
    trigger: {
      description: "보상 운영이 개별 협상이나 보상 역전 페인으로 드러나는 경우",
      condition: (context) =>
        responseIncludes(context, "2-3-2", ["협상", "개별 결정"]) ||
        painIncludes(context, ["보상 역전", "인건비 상승", "보상 재원"]) ||
        (hasDomainSignal(context, "compensation") && responseIncludes(context, "2-3-4", ["25~50", "50% 초과"])),
    },
    title: "카운터오퍼의 시간 지연 효과",
    generalView: "이탈 방어 인상이 잦으니 보상 정책을 시스템화해야 한다고 봅니다.",
    insight: `카운터오퍼는 잡는 게 아니라 이별을 연장하는 거예요. 글로벌 보상 데이터에서 일관되게 보이는 패턴인데, 인상 후 잡힌 사람이 1년 안에 떠날 확률이 처음 떠나려던 사람보다 오히려 높아요. 더 비싸진 채로요.

그런데 진짜 비용은 그 사람이 머무르는 동안 발생합니다. 첫째, 같은 직급 후임 입사자가 더 적게 받게 되니까 6개월 뒤에 그 사람이 와서 같은 협상을 합니다. 둘째, 옆자리 동료가 '나도 떠난다고 해야 인상되는구나'를 학습합니다. 셋째, 잡힌 사람이 결국 떠날 때 후임 채용에서 또 협상 요구가 옵니다.

이게 한 번 시작되면 회사가 영구적 협상 모드에 들어갑니다. 보상 정책 문제가 아니라 인사 거버넌스가 거래 관계로 전환되는 신호입니다.`,
    compactInsight: "카운터오퍼는 이탈을 해결하기보다 이별을 늦추는 장치가 되기 쉽습니다. 더 큰 비용은 잡힌 사람 옆에서 다른 구성원이 같은 협상을 학습하는 데 있습니다. 보상 문제가 아니라 인사 거버넌스가 거래 관계로 바뀌는 신호일 수 있습니다.",
    ceoPrompt: "지난 1년 카운터오퍼로 잡은 분들이 지금도 몇 분 계신지, 그 시점별로 보시면 패턴이 보이실 거예요.",
    citationSource: "mercer",
  },
  {
    id: "comp_negotiation_policy",
    domain: "compensation",
    axis: "counter_intuitive",
    priority: 82,
    trigger: {
      description: "입사·협상 때마다 보상을 개별 결정하고 시장 위치나 내부 기준이 흐린 경우",
      condition: (context) =>
        responseIncludes(context, "2-3-2", ["협상", "개별 결정"]) &&
        responseIncludes(context, "2-3-5", ["모름", "중위", "하위"]),
    },
    title: "협상이 정책을 대체하는 임계점",
    generalView: "보상 밴드를 공개하면 된다고 봅니다.",
    insight: `한국 회사들이 보상 정책을 비공개로 두는 이유는 형평성 잡음을 막고 협상 여지를 남기기 위해서입니다. 그런데 두 목적은 정반대로 작동합니다.

협상 여지를 남기면 협상하는 사람과 협상 안 하는 사람의 보상이 달라집니다. 그게 누적되면 형평성 잡음은 더 커집니다. 비공개라서 안 보이는 것뿐이지, 직원들은 동료 간 대화와 외부 정보를 통해 결국 알게 됩니다.

흥미로운 건 글로벌 초기 기업 데이터에서 보상 밴드를 일찍 공개한 회사가 늦게 공개한 회사보다 협상 빈도가 낮아진다는 점입니다. 공개가 협상을 늘리는 게 아니라 의심을 줄입니다.`,
    compactInsight: "보상 기준을 숨기는 목적은 잡음을 줄이는 것이지만, 실제로는 협상하는 사람과 협상하지 않는 사람의 차이를 키울 수 있습니다. 직원들이 협상을 시작하는 동기는 욕심보다 '내가 적게 받는 것 같다'는 의심인 경우가 많습니다.",
    ceoPrompt: "공개해야 한다는 뜻은 아닙니다. 다만 비공개의 비용을 보셨으면 좋겠습니다.",
    citationSource: "global_pattern",
  },
  {
    id: "eval_1on1_frequency",
    domain: "evaluation",
    axis: "global",
    priority: 92,
    trigger: {
      description: "평가가 느슨하거나 1on1 운영이 약해 평가 대화 인프라가 부족한 경우",
      condition: (context) =>
        responseIncludes(context, "2-5-2", ["운영 안 함", "일부 운영"]) &&
        (responseIncludes(context, "2-4-1a", ["연 1회", "운영하지 않음"]) || (numericResponse(context, "2-4-3-employee") ?? 10) <= 5),
    },
    title: "평가는 시스템이 아니라 conversation의 빈도",
    generalView: "OKR이나 360 같은 평가 시스템을 도입해야 한다고 봅니다.",
    insight: `평가 시스템 도입을 시도했다가 정착 안 된 회사는 거의 같은 진단을 받습니다. 시스템이 약했다는 진단입니다. 그래서 더 좋은 시스템으로 갈아타려고 하지만 다음 시스템도 정착하지 않는 경우가 많습니다.

진짜 변수는 시스템이 아니라 매니저가 직원과 얼마나 자주, 얼마나 깊게 1on1을 하는가입니다. 매니저가 1on1에서 평가 대화를 미리 안 해두면, 연말 공식 평가는 직원에게 갑작스러운 통보처럼 도착합니다.

OKR을 다시 도입할지는 나중 문제입니다. 먼저 매니저들의 1on1 빈도를 봐야 합니다. 글로벌 선도 기업들도 평가 개편 초반에는 평가 양식보다 1on1 리듬을 먼저 잡습니다.`,
    compactInsight: "평가가 정착하지 않는 진짜 변수는 양식보다 1on1 빈도인 경우가 많습니다. 평가 대화를 미리 해두지 않으면 공식 평가는 갑작스러운 통보처럼 도착합니다. 어떤 평가 시스템을 쓰든 매니저 대화 인프라가 먼저입니다.",
    ceoPrompt: "OKR을 다시 도입하실지는 나중에 결정하시고, 매니저들이 팀원과 한 달에 몇 번 1on1 하는지 한번 세보시는 게 먼저예요.",
    citationSource: "hr_analytics_tf",
  },
  {
    id: "eval_ceo_escalation",
    domain: "evaluation",
    axis: "mechanism",
    priority: 97,
    trigger: {
      description: "평가 수용성이 낮고 CEO가 갈등 또는 최종 판단 병목으로 등장하는 경우",
      condition: (context) =>
        ((numericResponse(context, "2-4-3-employee") ?? 10) <= 3 && responseIncludes(context, "2-5-1", ["대표인 내가 직접"])) ||
        (responseIncludes(context, "2-5-5", ["CEO 최종"]) && hasDomainSignal(context, "evaluation")),
    },
    title: "이의제기가 CEO로 가는 것의 진짜 의미",
    generalView: "공식 이의제기 프로세스를 만들어야 한다고 봅니다.",
    insight: `프로세스를 만들면 이의가 그쪽으로 갈 것 같지만, 핵심 원인이 남아 있으면 계속 CEO에게 갑니다. 이의가 CEO로 가는 건 프로세스 부재 때문이 아니라 매니저가 자기 평가를 자기 입으로 옹호할 자신이 없기 때문일 수 있습니다.

매니저가 직원에게 등급을 준 이유를 자기 언어로 설명할 수 있으면, 직원은 동의하지 않아도 그 자리에서 마무리할 가능성이 높습니다. 설명을 못 받으니까 한 단계 위로 가고, 한국 스타트업에서 한 단계 위는 거의 CEO입니다.

이건 매니저에게 평가 권한이 실질적으로 위임되어 있지 않다는 신호일 수 있습니다. 평가 시스템을 다시 만드는 것보다 매니저가 자기 점수를 끝까지 설명할 수 있는 권한과 언어가 먼저입니다.`,
    compactInsight: "평가 이의가 CEO에게 가는 건 절차가 없어서만은 아닙니다. 매니저가 자기 평가를 자기 언어로 옹호할 수 없으면, 직원은 한 단계 위로 갑니다. 평가 프로세스보다 매니저에게 실제 평가 권한이 있는지가 먼저 보입니다.",
    ceoPrompt: "매니저들이 자기가 매긴 점수를 직원 앞에서 끝까지 옹호할 수 있을까요?",
  },
  {
    id: "rec_referral_halflife",
    domain: "recruiting",
    axis: "time",
    priority: 95,
    trigger: {
      description: "추천과 공개 채용을 병행하는 60-100명 전후 조직",
      condition: (context) =>
        overlapsHeadcount(context, 60, 100) &&
        responseIncludes(context, "2-2-2", ["2~3개", "4개 이상"]) &&
        !responseIncludes(context, "L1-4", ["채용 동결"]),
    },
    title: "추천 채용의 유효 반감기",
    generalView: "추천 채용 비중을 줄이고 공개 채용을 강화해야 한다고 봅니다.",
    insight: `추천 채용은 30명까지 가장 효율적인 채용 방식입니다. 비용도 낮고, 컬처핏도 높고, 조기이탈도 낮습니다. 그래서 한국 Series A는 대부분 추천 중심으로 갑니다.

문제는 반감기입니다. 추천이 잘 작동하는 이유는 직원들이 자기 네트워크에서 비슷한 사람을 데려오기 때문인데, 같은 이유로 회사가 보지 못하는 사각지대가 누적됩니다. 50명까지는 강점이지만, 70명 넘어가면서 추천 풀이 마르고 다음 단계에 필요한 다른 유형의 사람이 잘 들어오지 않습니다.

{companyName}는 지금 그 임계점에 가까울 수 있습니다. 100명, 150명을 보고 있다면 다음 6개월이 채용 채널을 재설계할 마지막 타이밍일 수 있습니다.`,
    compactInsight: "추천 채용은 초기에는 가장 효율적인 채널입니다. 다만 {currentHeadcount}명 전후부터 추천 풀이 마르고, 다음 단계에 필요한 다른 유형의 사람이 잘 들어오지 않는 반감기가 옵니다. {companyName}가 100명 이후를 보고 있다면 채널 목적을 다시 나눠야 합니다.",
    ceoPrompt: "이번 분기 신규 채용 중 추천 비율이 몇 퍼센트인지 보시면, 채널이 마르고 있는지가 보이실 거예요.",
    citationSource: "global_pattern",
  },
  {
    id: "rec_early_exit_measurement",
    domain: "recruiting",
    axis: "cascade",
    priority: 86,
    trigger: {
      description: "입사 후 적응이나 조기이탈을 추적하지 않는 경우",
      condition: (context) => responseIncludes(context, "2-2-5", ["추적하지 않음", "문제 발생 시에만"]),
    },
    title: "조기이탈 측정의 진짜 가치",
    generalView: "6개월 이탈률 KPI로 관리해야 한다고 봅니다.",
    insight: `KPI를 만들라는 뜻이 아닙니다. 측정 자체가 채용 의사결정을 바꿉니다.

누가 6개월 안에 나가면 매니저 머릿속에서는 '이 사람은 안 맞았다'로 정리되기 쉽습니다. 하지만 측정이 시작되면 채용 채널별 6개월 잔존율이 보입니다. 어떤 채널의 사람이 잘 남고 어떤 채널의 사람이 빨리 나가는지가 가시화됩니다.

그러면 채용 전략이 분화됩니다. 추천은 안정성 채널, 공개는 잠재력 채널, 헤드헌터는 시니어 전용 채널처럼 목적을 나눌 수 있습니다. 측정하지 않으면 이 분화가 일어나지 않습니다.`,
    compactInsight: "조기이탈 측정의 가치는 KPI가 아니라 채널별 학습입니다. 채용 채널별 6개월 잔존율이 보이면 추천, 공개, 헤드헌터의 목적을 다르게 설계할 수 있습니다. 측정하지 않으면 채용 실패가 구조적 학습으로 남지 않습니다.",
    ceoPrompt: "지난 2년간 6개월 안에 나간 분들의 채용 채널을 표로 한번 만들어보세요.",
    citationSource: "hr_analytics_tf",
  },
  {
    id: "retention_hidden_talent",
    domain: "retention",
    axis: "counter_intuitive",
    priority: 91,
    trigger: {
      description: "핵심 인재 기준이 리더별 암묵지이거나 명확한 명단이 없는 경우",
      condition: (context) =>
        responseIncludes(context, "2-1-4", ["암묵", "별도 기준 없음"]) ||
        (responseIncludes(context, "2-1-2", ["1명", "2~3명", "4명"]) && !responseIncludes(context, "2-1-4", ["명확한 기준"])),
    },
    title: "머릿속 핵심인재 리스트의 정확도",
    generalView: "Talent Review 회의를 정례화해야 한다고 봅니다.",
    insight: `CEO 머릿속의 핵심인재 리스트는 거의 다 맞습니다. 70-80%는요. 문제는 나머지 20-30%입니다.

머릿속 리스트는 눈에 띄는 사람으로 채워집니다. 회의에서 말 잘 하는 사람, CEO와 자주 마주치는 사람, 가시적 프로젝트에 있는 사람입니다. 그런데 회사를 떠받치는 사람 중에는 그 조건에 맞지 않는 사람이 항상 있습니다.

이 사람들이 빠질 때 회사는 알아차리는 데 6개월이 걸립니다. 빠지고 한참 지나서 그 사람이 처리하던 일이 곳곳에서 멈추기 시작하면 그때 비로소 알게 됩니다.`,
    compactInsight: "CEO 머릿속의 핵심인재 리스트는 대체로 맞지만, 사각지대가 남습니다. 조용히 어려운 일을 처리하는 사람은 리스트 밖에 있을 수 있고, 그 사람이 빠지면 회사는 몇 달 뒤에야 공백을 알아차립니다.",
    ceoPrompt: "이번 주 안에 부서장들한테 '우리 팀에서 보이지 않게 가장 많은 일을 하는 사람'을 한 명씩 적어달라고 해보세요.",
  },
  {
    id: "retention_exit_reason_30",
    domain: "retention",
    axis: "global",
    priority: 84,
    trigger: {
      description: "자발적 이직 또는 핵심 인재 이탈 신호가 있고 퇴직 원인 가시성이 낮은 경우",
      condition: (context) =>
        (responseIncludes(context, "2-1-1", ["10~20", "20% 초과"]) || responseIncludes(context, "2-1-2", ["2~3명", "4명"])) &&
        !responseIncludes(context, "2-1-4", ["명확한 기준"]),
    },
    title: "퇴직 사유의 30% 룰",
    generalView: "Exit Survey를 도입하고 패턴을 분석해야 한다고 봅니다.",
    insight: `매니저가 듣는 퇴직 사유는 진짜 사유의 일부라고 보셔야 합니다. 글로벌 데이터에서 일관되게 나오는 패턴입니다.

떠나는 사람은 매니저에게 진짜 이유를 말하기 어렵습니다. 그 이유의 절반은 매니저 자신이거나 매니저가 통제할 수 없는 회사 차원의 문제일 수 있기 때문입니다. 그래서 매니저가 듣는 건 커리어 다음 단계, 연봉, 가족 사정 같은 안전한 사유가 됩니다.

진짜 사유는 HR이나 외부 채널을 통해, 매니저를 거치지 않고 들어야 잡힙니다. 떠난 지 한 달쯤 지난 사람에게 비공식으로 물어보면 그제야 진짜 사유가 나오는 경우가 많습니다.`,
    compactInsight: "매니저가 듣는 퇴직 사유는 진짜 사유의 일부일 가능성이 큽니다. 떠나는 사람은 매니저 앞에서 매니저나 회사 구조 문제를 말하기 어렵습니다. 한 달 뒤 매니저를 거치지 않고 들을 때 다음 이탈을 막을 정보가 나옵니다.",
    ceoPrompt: "최근 떠난 분께 한 달쯤 뒤에 가볍게 차 한잔 청해보세요.",
    citationSource: "global_pattern",
  },
  {
    id: "leadership_delegation_burden",
    domain: "leadership",
    axis: "counter_intuitive",
    priority: 90,
    trigger: {
      description: "CEO 최종 승인이나 대표 개입이 반복되어 권한 위임이 병목인 경우",
      condition: (context) =>
        responseIncludes(context, "2-5-5", ["CEO 최종", "C-Level 결정"]) ||
        responseIncludes(context, "2-5-1", ["대표인 내가 직접"]) ||
        responseIncludes(context, "L1-3", ["수평형"]),
    },
    title: "권한 위임은 권한이 아니라 책임 분담의 명확화",
    generalView: "권한을 더 위임해야 한다고 봅니다.",
    insight: `권한 위임이 안 되는 이유를 CEO와 매니저는 정반대로 봅니다. CEO는 권한을 줬는데 매니저가 안 쓴다고 하고, 매니저는 권한은 받았지만 결과가 안 좋으면 책임이 다 자신에게 온다고 느낍니다.

진짜 변수는 권한 자체가 아니라 위임 후 결과에 대한 책임 분담입니다. 매니저가 결정한 일이 잘못됐을 때, 그게 매니저 책임인지 위임한 CEO의 책임인지 명확하지 않으면 매니저는 안전한 선택을 합니다.

글로벌에서 위임이 잘 되는 조직들은 위임할 때 결과가 안 좋아도 어떤 방식으로 옹호하고 학습할지를 함께 약속합니다. 한국 스타트업은 보통 그 약속 없이 권한만 줍니다.`,
    compactInsight: "위임의 병목은 권한 자체보다 결과가 나쁠 때의 책임 분담입니다. 매니저가 보호받지 못한다고 느끼면 결정을 하지 않거나 CEO에게 다시 확인합니다. 권한 리스트보다 실패했을 때의 대응 약속이 먼저입니다.",
    ceoPrompt: "매니저들이 결정한 일이 잘못됐을 때 대표님이 어떻게 반응하실지를 미리 약속하시는 게 먼저예요.",
    citationSource: "samsung_global",
  },
  {
    id: "leadership_founder_ic_track",
    domain: "leadership",
    axis: "time",
    priority: 83,
    trigger: {
      description: "50명 이상 조직에서 리더 역할 전환과 리더십 실행 편차가 동시에 보이는 경우",
      condition: (context) =>
        isHeadcountAtLeast(context, 50) &&
        responseIncludes(context, "L1-3", ["3단계", "4단계", "5단계"]) &&
        (responseIncludes(context, "2-5-1", ["갈등을 피", "대표인 내가 직접"]) || responseIncludes(context, "2-5-6", ["들쭉날쭉", "홈페이지"])),
    },
    title: "창업 멤버의 역할 전환",
    generalView: "리더십 교육을 강화해야 한다고 봅니다.",
    insight: `한국 스타트업에서 가장 다루기 어려운 인사 결정 중 하나가 창업 초기 멤버의 역할 전환입니다. 30명까지 잘 작동했던 멤버가 70명에서 매니저 역할을 어려워하는 경우가 자주 발생합니다.

외부 교육을 보내도 잘 바뀌지 않는 이유는 매니저 역할이 스킬보다 정체성 전환에 가깝기 때문입니다. 후임 매니저를 데려오면 창업 멤버는 자기 자리를 잃은 느낌을 받을 수 있습니다.

미리 설계하면 세 번째 길이 가능합니다. 매니저가 아닌 IC 시니어 트랙을 명시적으로 열어주는 것입니다. 매니저가 안 되는 게 강등이 아니라 다른 가치를 선택하는 것이라는 메시지가 필요합니다.`,
    compactInsight: "창업 멤버의 매니저 전환은 교육만으로 해결되기 어렵습니다. 매니저 역할은 스킬보다 정체성 전환에 가깝기 때문입니다. IC 시니어 트랙이 명시되어 있으면 역할 전환이 이탈로 이어질 가능성을 줄일 수 있습니다.",
    ceoPrompt: "창업 초기에 같이 시작한 분 중에 매니저 역할이 안 맞을 수도 있는 분이 있으신가요?",
    citationSource: "global_pattern",
  },
  {
    id: "cross_manager",
    domain: "cross_domain",
    axis: "cascade",
    priority: 100,
    trigger: {
      description: "보상·평가·리더십 세 도메인 모두 강한 신호가 잡히는 경우",
      condition: (context) => allDomainsHaveSignals(context, ["compensation", "evaluation", "leadership"]),
    },
    title: "세 도메인의 공통 변수는 매니저",
    generalView: "각 영역 시스템을 단계별로 도입해야 한다고 봅니다.",
    insight: `진단 결과의 빨간 선들이 가리키는 공통점이 있습니다. 보상 결정도, 평가 대화도, 갈등 중재도, 1on1도, 채용 의사결정도 다 매니저가 합니다. 한국 Series A에서 인사 시스템의 실질적 운영자는 HR이 아니라 매니저입니다.

그런데 한국 스타트업에서 매니저는 거의 정의가 없는 역할입니다. 좋은 실무자가 시간이 지나 자연스럽게 매니저가 되고, 매니저로서 무엇을 해야 하는지에 대한 명시적 합의가 없는 경우가 많습니다.

보상 시스템, 평가 시스템, 리텐션 시스템을 각각 개선해도 운영자 역할이 정의되지 않으면 효과가 제한적입니다. 운영체제 없이 앱만 까는 셈입니다. 반대로 매니저 역할 정의가 정착되면 각 도메인 시스템이 평범해도 회사가 잘 굴러갑니다.`,
    compactInsight: "진단 결과의 빨간 선들이 가리키는 공통점이 있습니다. 보상 결정도, 평가 대화도, 갈등 중재도 결국 매니저가 합니다. 시스템을 각각 고쳐도 운영자인 매니저 역할이 정의되지 않으면 효과가 제한적입니다.",
    ceoPrompt: "우리 회사에서 '매니저는 이런 역할이다'라는 한 문장 정의가 있으신가요?",
    citationSource: "global_pattern",
  },
  {
    id: "cross_intent_path",
    domain: "cross_domain",
    axis: "mechanism",
    priority: 99,
    trigger: {
      description: "Mirror Effect가 여러 도메인에서 동시에 발생하는 경우",
      condition: (context) => strongAxisCount(context) >= 4,
    },
    title: "의도의 전달 경로 = 회사의 운영체제",
    generalView: "커뮤니케이션을 강화해야 한다고 봅니다.",
    insight: `의도와 해석의 갭이 한 도메인에서만 나오면 그 도메인의 문제입니다. 그런데 여러 도메인에서 동시에 나오면, 도메인 문제가 아니라 회사 안에 의도를 전달하는 경로 자체가 약한 상태일 수 있습니다.

CEO가 보상 정책을 정해도, 평가 철학을 말해도, 리더십 방향을 제시해도, 직원에게 도달하기 전에 매니저를 거칩니다. 각 단계에서 의도가 조금씩 굴절되고, 자기 해석과 강조점이 섞입니다.

글로벌 선도 기업들은 CEO 메시지를 매니저 채널로만 보내지 않고 직접 채널로도 동시에 보냅니다. 매니저 채널과 직접 채널이 같은 메시지를 동시에 발신하면 변형이 줄어듭니다.`,
    compactInsight: "여러 도메인에서 의도와 해석의 갭이 동시에 나오면, 개별 제도보다 의도 전달 경로를 봐야 합니다. CEO 메시지가 매니저를 거치며 조금씩 변형되면 직원은 원본 의도와 다른 메시지를 받습니다.",
    ceoPrompt: "우리 회사에서 직원들이 대표님 의도를 가장 직접적으로 듣는 자리가 뭐가 있으세요?",
    citationSource: "samsung_global",
  },
];

function scoreCard(card: InsightCard, context: InsightSelectionContext): number {
  return card.priority + domainTension(context, card.domain) / 10;
}

function pickBestByDomain(cards: InsightCard[], context: InsightSelectionContext): InsightCard[] {
  const bestByDomain = new Map<InsightDomain, InsightCard>();
  for (const card of cards) {
    if (card.domain === "cross_domain") continue;
    const current = bestByDomain.get(card.domain);
    if (!current || scoreCard(card, context) > scoreCard(current, context)) {
      bestByDomain.set(card.domain, card);
    }
  }
  return [...bestByDomain.values()].sort((a, b) => scoreCard(b, context) - scoreCard(a, context));
}

export function selectInsightCards(context: InsightSelectionContext): InsightCard[] {
  const triggered = INSIGHT_CARDS.filter((card) => card.trigger.condition(context));
  const crossDomain = triggered
    .filter((card) => card.domain === "cross_domain")
    .sort((a, b) => scoreCard(b, context) - scoreCard(a, context));
  const domainCards = pickBestByDomain(triggered, context);
  const selected: InsightCard[] = [];

  if (crossDomain[0]) selected.push(crossDomain[0]);
  if (crossDomain[1]) selected.push(crossDomain[1]);

  for (const card of domainCards) {
    if (selected.length >= 6) break;
    selected.push(card);
  }

  return selected.slice(0, 6);
}

export function placeInsightCards(cards: InsightCard[]): InsightPlacement {
  if (cards.length < 2) {
    return { page3Hero: null, page4Embedded: [], page5SelectionTrap: null, page6Closing: null };
  }

  const crossCards = cards.filter((card) => card.domain === "cross_domain");
  const domainCards = cards.filter((card) => card.domain !== "cross_domain");

  if (cards.length < 4) {
    return {
      page3Hero: null,
      page4Embedded: domainCards.length > 0 ? domainCards.slice(0, 3) : cards.slice(0, 3),
      page5SelectionTrap: null,
      page6Closing: null,
    };
  }

  const page3Hero = crossCards[0] ?? cards[0] ?? null;
  const page6Closing = crossCards.find((card) => card.id !== page3Hero?.id) ?? null;
  const usedIds = new Set([page3Hero?.id, page6Closing?.id].filter(Boolean));
  const page4Embedded = domainCards.filter((card) => !usedIds.has(card.id)).slice(0, 3);
  page4Embedded.forEach((card) => usedIds.add(card.id));
  const page5SelectionTrap =
    domainCards.find((card) => !usedIds.has(card.id) && card.axis === "counter_intuitive") ??
    domainCards.find((card) => !usedIds.has(card.id)) ??
    null;

  return { page3Hero, page4Embedded, page5SelectionTrap, page6Closing };
}
