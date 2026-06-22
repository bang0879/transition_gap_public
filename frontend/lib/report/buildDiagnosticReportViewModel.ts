import type {
  AlignmentAxisOut,
  AlignmentMapConflictOut,
  AreaAnalysisOut,
  DiagnoseResponse,
  DiagnosisMode,
} from "@/lib/types/api";
import type { ResponseValue } from "@/lib/store/responses";
import { alignmentPercent, displayAhaDomainName, statusLabel } from "@/lib/constants/ahaMoment";

export type ReportTone = "teal" | "amber" | "coral" | "slate";

export interface ReportPageMeta {
  pageNumber: number;
  title: string;
}

export interface ReportCover {
  companyName: string;
  title: string;
  subtitle: string;
  headline: string;
  completedDateLabel: string;
  diagnosisModeLabel: string;
  headcountLabel: string;
  basisLabel: string;
}

export interface ReportKeySignal {
  label: string;
  body: string;
  tone: ReportTone;
}

export interface TensionGaugeModel {
  leftLabel: string;
  rightLabel: string;
  philosophyLabel: string;
  actualLabel: string;
  statusLabel: string;
  percentLabel: string;
  markerPercent: number;
}

export interface ExecutiveInterpretation {
  title: string;
  headline: string;
  corePattern: string;
  ceoIntent: string;
  organizationExperience: string;
  transitionTask: string;
  underestimatedCost: string;
  stageInterpretation: string;
  keySignals: ReportKeySignal[];
  tensionGauge: TensionGaugeModel;
}

export interface BlindSpot {
  id: string;
  headline: string;
  intent: string;
  organizationInterpretation: string;
  operatingCost: string;
  warningLevel: ReportTone;
}

export interface TensionChainItem {
  label: string;
  body: string;
  domainName?: string;
}

export interface PriorityTension {
  title: string;
  headline: string;
  connectedDomains: string[];
  chain: TensionChainItem[];
  handleNow: string[];
  holdOff: string[];
}

export interface StrategicOptionIndicator {
  gain: number;
  burden: number;
  leadershipLoad: number;
}

export interface StrategicOption {
  id: string;
  title: string;
  gain: string;
  burden: string;
  requiredChange: string;
  riskyMove: string;
  indicators: StrategicOptionIndicator;
}

export interface DecisionMemo {
  title: string;
  decisions: string[];
  defer: string[];
  riskyMoves: string[];
  signals30Days: string[];
  checklist: Array<{ label: string; priority: "high" | "medium" | "low" }>;
}

export interface DiagnosticReportViewModel {
  pages: ReportPageMeta[];
  cover: ReportCover;
  executive: ExecutiveInterpretation;
  blindSpots: BlindSpot[];
  priorityTension: PriorityTension;
  strategicOptions: StrategicOption[];
  decisionMemo: DecisionMemo;
}

export interface BuildDiagnosticReportViewModelInput {
  companyName: string;
  completedAt: Date;
  diagnosis: DiagnoseResponse;
  responses: Record<string, ResponseValue>;
}

const DEFAULT_COMPANY_NAME = "우리 회사";

const MODE_LABELS: Record<DiagnosisMode, string> = {
  foundation: "Foundation: 운영 기준 정리 우선",
  hybrid: "Hybrid: 기준 부재와 기준 충돌이 공존",
  alignment: "Alignment: 제도 간 정렬 우선",
};

function responseText(responses: Record<string, ResponseValue>, id: string, fallback = "미입력"): string {
  const value = responses[id];
  if (value === undefined || value === null || value === "") return fallback;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return fallback;
  return String(value);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function modeLabel(mode: DiagnosisMode | undefined): string {
  return MODE_LABELS[mode ?? "alignment"];
}

function priorityAreas(areas: AreaAnalysisOut[]): AreaAnalysisOut[] {
  return [...areas].sort((a, b) => b.gap - a.gap || a.priority - b.priority);
}

function primaryAxis(diagnosis: DiagnoseResponse): AlignmentAxisOut | null {
  const axes = diagnosis.alignment_map?.axes ?? [];
  if (axes.length === 0) return null;
  return [...axes].sort((a, b) => alignmentPercent(a) - alignmentPercent(b))[0] ?? null;
}

function primaryConflict(diagnosis: DiagnoseResponse): AlignmentMapConflictOut | null {
  const conflicts = diagnosis.alignment_map?.conflicts ?? [];
  return conflicts.find((conflict) => conflict.severity === "high") ?? conflicts[0] ?? null;
}

function toneForAxis(axis: AlignmentAxisOut | null): ReportTone {
  if (!axis) return "slate";
  const label = statusLabel(axis);
  if (label === "심각") return "coral";
  if (label === "주의") return "amber";
  return "teal";
}

function stageInterpretation(headcount: string): string {
  if (headcount.includes("30") || headcount.includes("50") || headcount.includes("1~")) {
    return "40명 이하에서는 리더의 구두 설명과 대표님의 직접 개입으로 제도 공백을 버틸 수 있습니다. 하지만 같은 방식이 반복되면 성장 이후에는 기준이 아니라 관계로 운영되는 회사처럼 읽힐 수 있습니다.";
  }
  if (headcount.includes("51") || headcount.includes("100") || headcount.includes("150")) {
    return "50~100명 구간에서는 대표님의 직접 조정만으로 운영 일관성을 유지하기 어렵습니다. 이 시점부터 유연성은 장점이면서 동시에 구성원에게 기준 불투명성으로 번역될 수 있습니다.";
  }
  if (headcount.includes("500") || headcount.includes("초과") || headcount.includes("151")) {
    return "100명 이후에는 같은 예외 판단도 더 빨리 조직 전체의 신호가 됩니다. 기준을 문장으로 고정하지 않으면 구성원은 제도보다 내부 정보와 협상력을 더 중요하게 보게 됩니다.";
  }
  return "조직 규모가 커질수록 대표님의 직접 설명으로 메우던 제도 공백은 운영 리스크로 바뀝니다. 지금 필요한 것은 더 많은 제도보다 반복 가능한 판단 기준입니다.";
}

function corePattern(mode: DiagnosisMode | undefined): string {
  if (mode === "foundation") {
    return "이 회사의 핵심 패턴은 아직 기준을 충분히 세우지 못한 상태에 가깝습니다. 다만 기준이 비어 있는 영역을 제도 이름으로 급하게 채우면, 실제 운영에서는 다시 대표님과 리더의 개별 판단에 기대게 될 가능성이 큽니다.";
  }
  if (mode === "hybrid") {
    return "이 회사의 핵심 패턴은 '기준 부재'보다 '기준 회피'에 가깝습니다. 기준이 전혀 없는 것은 아니지만, 민감한 순간에는 명문화된 기준보다 대표님과 리더의 개별 판단이 더 강하게 작동하고 있습니다.";
  }
  return "이 회사는 제도 자체가 없는 상태라기보다, 철학과 실제 운영 사이의 간극을 더 명확하게 다루어야 하는 상태입니다. 제도를 추가하기보다 이미 있는 기준이 어떤 메시지로 읽히는지 먼저 정렬해야 합니다.";
}

function headlineInterpretation(mode: DiagnosisMode | undefined, axis: AlignmentAxisOut | null): string {
  if (mode === "foundation") {
    return "이 회사의 문제는 좋은 제도가 부족하다는 것보다, 반복되는 판단을 아직 운영 기준으로 고정하지 못했다는 점에 가깝습니다.";
  }
  if (axis) {
    return `${displayAhaDomainName(axis)}에서 드러난 간극은 단일 제도 문제가 아니라, 대표님이 의도한 철학과 구성원이 실제로 경험하는 운영 방식의 차이입니다.`;
  }
  return "이 회사의 문제는 제도가 부족하다는 것보다, 민감한 판단을 아직 명시적 기준으로 다루지 못하고 있다는 점에 가깝습니다.";
}

function ceoIntent(axis: AlignmentAxisOut | null): string {
  if (!axis) return "대표님께서는 회사가 더 일관된 기준으로 운영되기를 원하고 계십니다.";
  return `대표님께서는 ${displayAhaDomainName(axis)} 영역에서 ${axis.philosophy_label}에 가까운 방향을 원하고 계십니다.`;
}

function organizationExperience(axis: AlignmentAxisOut | null): string {
  if (!axis) {
    return "하지만 구성원은 중요한 순간마다 기준보다 사람의 판단이 더 크게 작동한다고 느낄 수 있습니다.";
  }
  return `하지만 구성원은 실제 운영을 ${axis.actual_label}에 더 가깝게 경험할 수 있습니다. 이 차이가 반복되면 회사가 말하는 기준과 실제 판단 기준이 다르다고 받아들일 수 있습니다.`;
}

function transitionTask(mode: DiagnosisMode | undefined, axis: AlignmentAxisOut | null): string {
  if (mode === "foundation") {
    return "따라서 지금의 전환 과제는 새 제도 도입이 아니라, 보상·평가·리더 운영에서 반복되는 예외 판단을 문장으로 정리하는 것입니다.";
  }
  const focus = axis ? displayAhaDomainName(axis) : "핵심 영역";
  return `따라서 지금의 전환 과제는 ${focus} 제도를 더 정교하게 만드는 것이 아니라, 어떤 판단을 회사 기준으로 고정하고 어떤 판단을 리더 재량으로 남길지 정하는 것입니다.`;
}

function underestimatedCost(axis: AlignmentAxisOut | null): string {
  const focus = axis ? displayAhaDomainName(axis) : "인사제도";
  return `대표님이 과소평가하기 쉬운 비용은 ${focus} 자체의 설계 난이도보다, 민감한 차이를 공개적 기준으로 다루는 조직적 부담입니다. 이 부담을 건너뛰면 제도 개선이 내부 정치 문제로 읽힐 가능성이 큽니다.`;
}

function keySignals(areas: AreaAnalysisOut[], axis: AlignmentAxisOut | null): ReportKeySignal[] {
  const topAreas = priorityAreas(areas).slice(0, 3);
  if (topAreas.length === 0) {
    return [
      {
        label: "핵심 신호",
        body: axis?.headline ?? "입력값을 기준으로 추가 해석이 필요합니다.",
        tone: toneForAxis(axis),
      },
    ];
  }
  return topAreas.map((area, index) => ({
    label: `${index + 1}. ${area.area_name}`,
    body: area.gap >= 10
      ? `${area.area_name}은 필요한 운영 기준과 현재 제도 사이의 차이가 먼저 논의되어야 하는 영역입니다.`
      : `${area.area_name}은 현재 기준을 유지하되, 다른 영역과의 연결성을 확인해야 합니다.`,
    tone: area.gap >= 15 ? "coral" : area.gap >= 10 ? "amber" : "teal",
  }));
}

function tensionGauge(axis: AlignmentAxisOut | null): TensionGaugeModel {
  if (!axis) {
    return {
      leftLabel: "철학",
      rightLabel: "실제 운영",
      philosophyLabel: "입력 철학",
      actualLabel: "현행 운영",
      statusLabel: "추가 확인",
      percentLabel: "간극 확인",
      markerPercent: 50,
    };
  }
  const percent = alignmentPercent(axis);
  return {
    leftLabel: axis.left_label,
    rightLabel: axis.right_label,
    philosophyLabel: axis.philosophy_label,
    actualLabel: axis.actual_label,
    statusLabel: statusLabel(axis),
    percentLabel: percent >= 80 ? "간극 낮음" : percent >= 50 ? "주의 필요" : "간극 큼",
    markerPercent: Math.max(8, Math.min(92, 100 - percent)),
  };
}

function blindSpots(mode: DiagnosisMode | undefined, axis: AlignmentAxisOut | null): BlindSpot[] {
  const focus = axis ? displayAhaDomainName(axis) : "핵심 영역";
  return [
    {
      id: "flexibility-opacity",
      headline: "대표님이 보시는 유연성은 구성원에게 기준 불투명성으로 읽힐 수 있습니다.",
      intent: "상황에 맞게 합리적으로 조정하고, 좋은 사람을 놓치지 않으려는 의도입니다.",
      organizationInterpretation: "구성원은 말을 잘하거나 가까운 사람이 예외를 얻는다고 느낄 수 있습니다.",
      operatingCost: "보상·평가 논의가 제도 문제가 아니라 신뢰 문제로 번질 수 있습니다.",
      warningLevel: "amber",
    },
    {
      id: "performance-language",
      headline: "성과 책임을 말하지만, 책임을 감당할 리더 언어가 아직 약할 수 있습니다.",
      intent: `${focus}에서 더 명확한 기준과 책임을 만들고 싶어 하십니다.`,
      organizationInterpretation: "기준은 강해지는데 피드백과 설득은 리더마다 다르다고 느낄 수 있습니다.",
      operatingCost: "평가 수용성보다 방어적 대응이 먼저 커질 수 있습니다.",
      warningLevel: mode === "foundation" ? "amber" : "coral",
    },
    {
      id: "system-before-standard",
      headline: "제도를 추가하면 해결될 것 같지만, 실제 병목은 판단 기준일 수 있습니다.",
      intent: "체계를 만들면 운영이 안정될 것이라고 기대하실 수 있습니다.",
      organizationInterpretation: "새 양식은 생겼지만 중요한 결정은 여전히 사람마다 다르다고 느낄 수 있습니다.",
      operatingCost: "제도는 늘어나는데 신뢰는 늘지 않는 상태가 될 수 있습니다.",
      warningLevel: "slate",
    },
  ];
}

function connectedDomains(conflict: AlignmentMapConflictOut | null, axis: AlignmentAxisOut | null): string[] {
  const domains = conflict?.domains ?? (axis ? [axis.domain_id] : []);
  if (domains.length === 0) return ["보상", "평가", "리더십"];
  return domains.map((domain) => displayAhaDomainName(domain));
}

function priorityTension(
  areas: AreaAnalysisOut[],
  conflict: AlignmentMapConflictOut | null,
  axis: AlignmentAxisOut | null,
): PriorityTension {
  const domains = connectedDomains(conflict, axis);
  const focus = axis ? displayAhaDomainName(axis) : priorityAreas(areas)[0]?.area_name ?? "핵심 영역";
  const headline = domains.length >= 2
    ? `${focus} 문제처럼 보이지만, 실제로는 ${domains.join("·")}이 함께 묶인 운영 문제입니다.`
    : `${focus} 문제처럼 보이지만, 실제로는 기준을 공개적으로 다루는 운영 문제입니다.`;
  return {
    title: "Priority Tension",
    headline,
    connectedDomains: domains,
    chain: [
      {
        label: "의도",
        body: `${axis?.philosophy_label ?? "성과와 책임"}에 가까운 기준을 만들고 싶습니다.`,
        domainName: focus,
      },
      {
        label: "현행 경험",
        body: `${axis?.actual_label ?? "관계 조정"}에 가까운 운영이 구성원 경험으로 남아 있을 수 있습니다.`,
        domainName: focus,
      },
      {
        label: "리더 부담",
        body: "리더는 불편한 피드백과 예외 설명을 감당할 준비가 서로 다를 수 있습니다.",
        domainName: "리더십",
      },
      {
        label: "운영 리스크",
        body: "보상 차등이나 평가 강화만 먼저 진행하면 형평성 논쟁으로 번질 수 있습니다.",
        domainName: "운영 리스크",
      },
    ],
    handleNow: [
      "성과 차이를 만드는 기준 문장을 먼저 정리합니다.",
      "평가 결과를 보상에 연결하는 수준을 합의합니다.",
      "리더가 구성원에게 설명해야 할 최소 언어를 정합니다.",
    ],
    holdOff: [
      "전사 보상 체계 전면 개편",
      "평가 양식만 정교하게 만드는 작업",
      "모든 리더에게 동일한 고강도 성과관리를 요구하는 것",
    ],
  };
}

function strategicOptions(mode: DiagnosisMode | undefined): StrategicOption[] {
  const foundationPenalty = mode === "foundation" ? 1 : 0;
  return [
    {
      id: "performance",
      title: "성과 책임 강화형",
      gain: "고성과자에게 더 분명한 신호를 줄 수 있습니다.",
      burden: "평가 수용성 논쟁과 리더의 피드백 부담이 커집니다.",
      requiredChange: "대표님께서는 예외 조정보다 기준 반복을 우선하셔야 합니다.",
      riskyMove: "평가 신뢰 없이 차등 보상만 먼저 강화하는 것입니다.",
      indicators: { gain: 86, burden: 74 + foundationPenalty * 8, leadershipLoad: 82 + foundationPenalty * 8 },
    },
    {
      id: "community",
      title: "공동체 안정 보완형",
      gain: "구성원 수용성과 심리적 안정감을 유지할 수 있습니다.",
      burden: "핵심 인재에게 주는 성장·보상 메시지가 약해질 수 있습니다.",
      requiredChange: "대표님께서는 성과 메시지를 늦추는 대신 기준 정리부터 하셔야 합니다.",
      riskyMove: "좋은 분위기를 유지한다는 이유로 민감한 기준 결정을 계속 미루는 것입니다.",
      indicators: { gain: 68, burden: 52, leadershipLoad: 48 },
    },
    {
      id: "elite",
      title: "핵심 인재 집중형",
      gain: "성장 병목 인재를 유지하고 중요한 역할 공백을 줄일 수 있습니다.",
      burden: "내부 형평성 논쟁과 예외 기준화 부담이 커집니다.",
      requiredChange: "대표님께서는 예외를 특혜가 아니라 기준 있는 선택으로 설명하셔야 합니다.",
      riskyMove: "핵심 인재 예외를 조용히 처리하는 것입니다.",
      indicators: { gain: 78, burden: 80, leadershipLoad: 72 },
    },
  ];
}

function decisionMemo(axis: AlignmentAxisOut | null): DecisionMemo {
  const focus = axis ? displayAhaDomainName(axis) : "핵심 영역";
  return {
    title: "CEO Decision Memo",
    decisions: [
      "성과 차이를 어디까지 공개적 기준으로 다룰 것인가",
      "평가 결과를 보상 및 승진 판단에 어느 수준까지 연결할 것인가",
      "리더 재량으로 남길 판단과 회사 기준으로 고정할 판단을 어디서 나눌 것인가",
    ],
    defer: [
      "전사 보상 테이블의 전면 개편",
      "복잡한 직급 및 직무 체계",
      "모든 제도의 동시 개편",
    ],
    riskyMoves: [
      "평가 수용성 없이 차등 보상만 강화하는 것",
      "리더 준비 없이 성과 책임만 밀어붙이는 것",
      "예외 운영을 기준화하지 않은 채 핵심 인재 보상만 조용히 처리하는 것",
    ],
    signals30Days: [
      "리더들이 같은 상황에서 비슷한 판단을 내리고 있는가",
      "보상 예외의 이유가 설명 가능한가",
      "평가 피드백이 보상 및 승진 논의와 충돌하지 않는가",
    ],
    checklist: [
      { label: `${focus} 기준 문장을 한 문장으로 설명할 수 있는가`, priority: "high" },
      { label: "리더가 같은 사례에 같은 판단을 내릴 수 있는가", priority: "high" },
      { label: "아직 제도화하지 않을 항목이 명확한가", priority: "medium" },
    ],
  };
}

export function buildDiagnosticReportViewModel(input: BuildDiagnosticReportViewModelInput): DiagnosticReportViewModel {
  const companyName = input.companyName.trim() || DEFAULT_COMPANY_NAME;
  const mode = input.diagnosis.diagnosis_mode ?? "alignment";
  const axis = primaryAxis(input.diagnosis);
  const conflict = primaryConflict(input.diagnosis);
  const headcountLabel = responseText(input.responses, "L1-2", "조직 규모 미입력");
  const areas = input.diagnosis.areas;

  return {
    pages: [
      { pageNumber: 1, title: "Cover" },
      { pageNumber: 2, title: "Executive Interpretation" },
      { pageNumber: 3, title: "CEO Blind Spots" },
      { pageNumber: 4, title: "Priority Tension" },
      { pageNumber: 5, title: "Strategic Options" },
      { pageNumber: 6, title: "CEO Decision Memo" },
    ],
    cover: {
      companyName,
      title: `${companyName} 인사제도 진단 보고서`,
      subtitle: "대표 / People 리더 의사결정용",
      headline: headlineInterpretation(mode, axis),
      completedDateLabel: formatDate(input.completedAt),
      diagnosisModeLabel: modeLabel(mode),
      headcountLabel,
      basisLabel: "입력된 조직 컨텍스트와 현행 제도 응답 기준",
    },
    executive: {
      title: "Executive Interpretation",
      headline: headlineInterpretation(mode, axis),
      corePattern: corePattern(mode),
      ceoIntent: ceoIntent(axis),
      organizationExperience: organizationExperience(axis),
      transitionTask: transitionTask(mode, axis),
      underestimatedCost: underestimatedCost(axis),
      stageInterpretation: stageInterpretation(headcountLabel),
      keySignals: keySignals(areas, axis),
      tensionGauge: tensionGauge(axis),
    },
    blindSpots: blindSpots(mode, axis),
    priorityTension: priorityTension(areas, conflict, axis),
    strategicOptions: strategicOptions(mode),
    decisionMemo: decisionMemo(axis),
  };
}
