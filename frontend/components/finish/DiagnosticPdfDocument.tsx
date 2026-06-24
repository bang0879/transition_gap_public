"use client";

import {
  Circle,
  Document,
  Font,
  Line,
  Page,
  Polygon,
  Polyline,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { AlignmentAxisOut, AreaAnalysisOut, DiagnosisMode } from "@/lib/types/api";
import type { ResponseValue } from "@/lib/store/responses";
import type { ReportExportData } from "@/lib/utils/reportExport";

interface DiagnosticPdfDocumentProps {
  exportData: ReportExportData;
}

type SnapshotLevel = "낮음" | "주의" | "높음";

type SnapshotDomain = {
  id: string;
  label: string;
  philosophy: number;
  actual: number;
  gap: number;
  level: SnapshotLevel;
};

type SnapshotDataPoint = {
  label: string;
  value: string;
};

let fontsRegistered = false;

function registerPdfFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "Pretendard",
    fonts: [
      { src: "/fonts/pretendard-400.woff", fontWeight: 400 },
      { src: "/fonts/pretendard-700.woff", fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}

const colors = {
  teal: "#2d8b83",
  tealBorder: "#b8d9d5",
  tealWash: "#f4fbfa",
  philosophyColor: "#2d8b83",
  actualColor: "#6f7b8c",
  cautionBorder: "#ecd8ad",
  cautionWash: "#fffaf0",
  mintBorder: "#c9e6dc",
  mintWash: "#f3fbf7",
  grayBorder: "#dfe6ee",
  grayWash: "#fbfcfd",
  ink: "#172033",
  body: "#3c4658",
  muted: "#5a6475",
  label: "#7b8495",
  footer: "#8a94a6",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingHorizontal: 44,
    paddingBottom: 38,
    fontFamily: "Pretendard",
    color: colors.ink,
    backgroundColor: "#ffffff",
  },
  eyebrow: {
    fontSize: 8.5,
    fontWeight: 700,
    color: colors.teal,
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.24,
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 10.2,
    lineHeight: 1.65,
    color: colors.muted,
    marginBottom: 16,
  },
  heroStatement: {
    borderWidth: 1,
    borderColor: colors.tealBorder,
    borderRadius: 8,
    padding: 18,
    backgroundColor: colors.tealWash,
    marginTop: 12,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 8.8,
    fontWeight: 700,
    color: colors.teal,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.42,
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
    marginBottom: 14,
  },
  metaCard: {
    width: "31.6%",
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: colors.grayWash,
  },
  metaLabel: {
    fontSize: 7.8,
    fontWeight: 700,
    color: colors.label,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 9.2,
    fontWeight: 700,
    lineHeight: 1.35,
    color: colors.ink,
  },
  statementCard: {
    borderWidth: 1,
    borderColor: colors.tealBorder,
    borderRadius: 8,
    padding: 14,
    backgroundColor: colors.tealWash,
    marginBottom: 12,
  },
  contentCard: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 112,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.grayWash,
  },
  cautionCard: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 112,
    borderWidth: 1,
    borderColor: colors.cautionBorder,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.cautionWash,
  },
  noteCard: {
    borderWidth: 1,
    borderColor: colors.cautionBorder,
    borderRadius: 8,
    padding: 14,
    backgroundColor: colors.cautionWash,
    marginTop: 14,
  },
  decisionCard: {
    borderWidth: 1,
    borderColor: colors.mintBorder,
    borderRadius: 8,
    padding: 14,
    backgroundColor: colors.mintWash,
  },
  decisionStack: {
    marginTop: 12,
    gap: 10,
  },
  cardLabel: {
    fontSize: 8.2,
    fontWeight: 700,
    color: colors.label,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 10.8,
    fontWeight: 700,
    color: colors.ink,
    marginBottom: 6,
  },
  body: {
    fontSize: 9.7,
    lineHeight: 1.62,
    color: colors.body,
  },
  smallBody: {
    fontSize: 8.9,
    lineHeight: 1.58,
    color: "#4f5a6c",
  },
  divider: {
    height: 1,
    backgroundColor: "#e4e9ef",
    marginVertical: 12,
  },
  axisLine: {
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
    marginTop: 10,
  },
  axisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  snapshotLayout: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
  },
  radarPanel: {
    width: 232,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  radarSvg: {
    width: 206,
    height: 182,
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendSwatchPhilosophy: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.philosophyColor,
  },
  legendSwatchActual: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.actualColor,
  },
  snapshotSide: {
    flexGrow: 1,
    gap: 9,
  },
  gapRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 23,
    gap: 7,
  },
  gapLabel: {
    width: 55,
    fontSize: 8.2,
    fontWeight: 700,
    color: colors.ink,
  },
  gapRail: {
    width: 110,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#edf1f4",
  },
  gapFillLow: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tealBorder,
  },
  gapFillWatch: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cautionBorder,
  },
  gapFillHigh: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#b58a3a",
  },
  signalPillLow: {
    width: 34,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.tealWash,
    color: colors.teal,
    textAlign: "center",
    fontSize: 7.6,
    fontWeight: 700,
  },
  signalPillWatch: {
    width: 34,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.cautionWash,
    color: "#8a6118",
    textAlign: "center",
    fontSize: 7.6,
    fontWeight: 700,
  },
  signalPillHigh: {
    width: 34,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#f6e6c2",
    color: "#8a6118",
    textAlign: "center",
    fontSize: 7.6,
    fontWeight: 700,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  dataPointCard: {
    width: "31.6%",
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    padding: 9,
    backgroundColor: colors.grayWash,
  },
  polarityBox: {
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    padding: 13,
    marginTop: 12,
    backgroundColor: "#ffffff",
  },
  polarityLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  polarityEndpoint: {
    width: 112,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    borderRadius: 8,
    padding: 8,
    backgroundColor: colors.tealWash,
  },
  polarityConnector: {
    flexGrow: 1,
    height: 1,
    backgroundColor: "#e9edf2",
    marginHorizontal: 10,
  },
  matrixBox: {
    height: 218,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 14,
    position: "relative",
    marginTop: 8,
  },
  matrixQuadrantTopLeft: {
    position: "absolute",
    left: 14,
    top: 14,
    width: 244,
    height: 94,
    backgroundColor: colors.cautionWash,
  },
  matrixQuadrantBottomRight: {
    position: "absolute",
    right: 14,
    bottom: 28,
    width: 244,
    height: 94,
    backgroundColor: colors.mintWash,
  },
  matrixVertical: {
    position: "absolute",
    left: 258,
    top: 14,
    width: 1,
    height: 188,
    backgroundColor: "#e9edf2",
  },
  matrixHorizontal: {
    position: "absolute",
    left: 14,
    top: 108,
    width: 488,
    height: 1,
    backgroundColor: "#e9edf2",
  },
  matrixDot: {
    position: "absolute",
    width: 68,
    minHeight: 24,
    borderRadius: 7,
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderWidth: 1,
  },
  matrixAxisBottom: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  matrixAxisLeft: {
    position: "absolute",
    left: 14,
    top: 4,
    fontSize: 7.8,
    color: colors.label,
    fontWeight: 700,
  },
  optionTable: {
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  optionHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.tealWash,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  optionRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e9edf2",
  },
  optionRiskRow: {
    flexDirection: "row",
    backgroundColor: colors.cautionWash,
  },
  optionLabelCell: {
    width: 84,
    padding: 9,
    borderRightWidth: 1,
    borderRightColor: colors.grayBorder,
  },
  optionCell: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 62,
    padding: 9,
    borderRightWidth: 1,
    borderRightColor: "#e9edf2",
  },
  timeline: {
    borderLeftWidth: 2,
    borderLeftColor: colors.tealBorder,
    marginTop: 12,
    marginLeft: 8,
    paddingLeft: 14,
    gap: 10,
  },
  timelineItem: {
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.grayWash,
  },
  footer: {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.8,
    color: colors.footer,
  },
});

const SNAPSHOT_THRESHOLDS_BY_MODE: Record<DiagnosisMode, { watch: number; high: number }> = {
  foundation: { watch: 34, high: 52 },
  hybrid: { watch: 28, high: 44 },
  alignment: { watch: 22, high: 36 },
};

const DOMAIN_ORDER = [
  { id: "leadership", label: "리더십" },
  { id: "compensation", label: "보상" },
  { id: "evaluation", label: "평가" },
  { id: "retention", label: "인력 운영" },
  { id: "recruitment", label: "채용" },
];

const PLACEHOLDER_COMPANY_NAMES = new Set(["", "ㅁㄴㅇ", "테스트", "test", "Test", "우리 회사"]);

function normalizeCompanyName(value: string): string {
  const trimmed = value.trim();
  return PLACEHOLDER_COMPANY_NAMES.has(trimmed) ? "—" : trimmed;
}

function responseToText(value: ResponseValue | undefined, fallback = "미입력"): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return fallback;
  if (value === undefined || value === "") return fallback;
  return String(value);
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function axisPositionToPercent(value: number | undefined): number {
  return clamp(((value ?? 0) + 1) * 50);
}

function classifySnapshotSignal(gap: number, mode: DiagnosisMode): SnapshotLevel {
  const thresholds = SNAPSHOT_THRESHOLDS_BY_MODE[mode];
  if (gap >= thresholds.high) return "높음";
  if (gap >= thresholds.watch) return "주의";
  return "낮음";
}

function areaByDomain(areas: AreaAnalysisOut[], domainId: string): AreaAnalysisOut | undefined {
  const hintsByDomain: Record<string, string[]> = {
    leadership: ["리더", "leadership"],
    compensation: ["보상", "compensation"],
    evaluation: ["평가", "evaluation"],
    retention: ["인력", "유지", "retention"],
    recruitment: ["채용", "recruitment"],
  };
  const hints = hintsByDomain[domainId] ?? [];
  return areas.find((area) => hints.some((hint) => area.area_name.toLowerCase().includes(hint.toLowerCase())));
}

function snapshotDomains(axes: AlignmentAxisOut[], areas: AreaAnalysisOut[], mode: DiagnosisMode): SnapshotDomain[] {
  return DOMAIN_ORDER.map((domain) => {
    const axis = axes.find((item) => item.domain_id === domain.id);
    const philosophy = axisPositionToPercent(axis?.philosophy_position);
    const actual = axisPositionToPercent(axis?.actual_position);
    const gap = Math.abs(philosophy - actual);
    return {
      id: domain.id,
      label: domain.label,
      philosophy,
      actual,
      gap,
      level: classifySnapshotSignal(gap, mode),
    };
  });
}

function snapshotDataPoints(responses: Record<string, ResponseValue>): SnapshotDataPoint[] {
  return [
    { label: "조직 규모", value: responseToText(responses["L1-2"]) },
    { label: "채용 계획", value: responseToText(responses["L1-4"]) },
    { label: "1on1 운영", value: responseToText(responses["2-5-2"]) },
    { label: "평가 주기", value: responseToText(responses["2-4-1a"]) },
    { label: "핵심가치 작동", value: responseToText(responses["2-5-6"]) },
    { label: "보상 구조", value: responseToText(responses["2-3-2"]) },
  ].filter((item) => item.value !== "미입력").slice(0, 6);
}

function levelStyle(level: SnapshotLevel) {
  if (level === "높음") return styles.signalPillHigh;
  if (level === "주의") return styles.signalPillWatch;
  return styles.signalPillLow;
}

function gapFillStyle(level: SnapshotLevel) {
  if (level === "높음") return styles.gapFillHigh;
  if (level === "주의") return styles.gapFillWatch;
  return styles.gapFillLow;
}

function topAreas(areas: AreaAnalysisOut[], limit = 3): AreaAnalysisOut[] {
  return [...areas]
    .sort((a, b) => b.gap - a.gap || a.priority - b.priority)
    .slice(0, limit);
}

function sortedAxes(axes: AlignmentAxisOut[]): AlignmentAxisOut[] {
  return [...axes].sort((a, b) => b.tension - a.tension);
}

function topAxis(axes: AlignmentAxisOut[]): AlignmentAxisOut | undefined {
  return sortedAxes(axes)[0];
}

function modeLabel(mode: DiagnosisMode | undefined): string {
  if (mode === "foundation") return "기준 수립 구간";
  if (mode === "hybrid") return "유연성과 기준 분리 구간";
  return "의도와 경험 정렬 구간";
}

function modeNoun(mode: DiagnosisMode | undefined): string {
  if (mode === "foundation") return "기준을 먼저 세워야 하는 구간";
  if (mode === "hybrid") return "유연성과 기준을 분리해야 하는 구간";
  return "대표 의도와 현장 경험을 맞춰야 하는 구간";
}

function headcountMeaning(headcount: string): string {
  if (headcount.includes("20") || headcount.includes("30") || headcount.includes("40")) {
    return "아직은 대표의 직접 설명으로 버틸 수 있지만, 다음 성장 구간에서는 같은 설명이 리더를 통해 반복되어야 합니다.";
  }
  if (headcount.includes("51") || headcount.includes("100") || headcount.includes("80")) {
    return "이 규모에서는 같은 판단도 팀과 리더에 따라 다르게 전달됩니다. 유연성은 빠르게 일관성 부족으로 읽힐 수 있습니다.";
  }
  if (headcount.includes("101") || headcount.includes("150")) {
    return "이제 대표의 의도보다 반복되는 운영 경험이 더 강한 메시지가 됩니다. 예외를 줄이는 기준 언어가 필요합니다.";
  }
  return "조직이 커질수록 대표의 의도는 말보다 반복되는 운영 경험으로 해석됩니다.";
}

function mirrorSentence(): string {
  return "대표님이 의도하신 운영과 조직이 받아들이는 운영이 지금 다르게 작동하고 있습니다.";
}

function intentText(axis: AlignmentAxisOut | undefined): string {
  if (!axis) {
    return "대표님은 좋은 사람에게 더 나은 기회를 주고 싶어 합니다. 다만 그 기준이 아직 조직 안에서 같은 문장으로 반복되지는 않습니다.";
  }
  return `대표님은 ${axis.domain_name}에서 좋은 사람을 오래 붙잡고, 조직이 흔들리지 않게 운영하고 싶어 합니다. 그러나 그 의도가 리더의 설명과 반복 행동으로 충분히 번역되지 않았습니다.`;
}

function interpretationText(axis: AlignmentAxisOut | undefined): string {
  if (!axis) {
    return "구성원은 대표의 의도보다 실제로 반복되는 예외, 설명 방식, 리더별 판단 차이를 더 강한 신호로 받아들입니다.";
  }
  return `조직은 ${axis.domain_name}에서 실제 반복되는 예외와 리더별 설명 차이를 먼저 봅니다. 그래서 의도는 배려였더라도, 경험은 상황마다 달라지는 기준으로 남을 수 있습니다.`;
}

function resultText(axis: AlignmentAxisOut | undefined, areaName: string): string {
  if (axis?.business_risk) return axis.business_risk;
  return `${areaName}에서 기준을 말로 설명하지 못하면, 제도 개선은 내부 정치나 예외 처리로 받아들여질 가능성이 큽니다. 리더는 결정을 미루고, 구성원은 결과보다 배경을 의심하게 됩니다.`;
}

function patternText(axis: AlignmentAxisOut | undefined, areas: AreaAnalysisOut[]): string {
  const names = topAreas(areas).map((area) => area.area_name).join(", ") || "핵심 영역";
  if (axis) {
    return `이 회사의 핵심 패턴은 ${axis.domain_name} 하나의 문제가 아니라, 민감한 판단 순간에 공개된 기준보다 개별 판단이 앞서는 구조입니다. 그래서 ${names}을 따로 고치기보다 먼저 어떤 기준을 공개적으로 말할 수 있는지 정해야 합니다.`;
  }
  return `이 회사의 핵심 패턴은 ${names}에서 동시에 나타납니다. 기준이 없는 것이 아니라, 중요한 순간에 기준이 같은 언어로 설명되지 않는 것이 더 큰 문제입니다.`;
}

function tensionSentence(area: AreaAnalysisOut | undefined, axis: AlignmentAxisOut | undefined): string {
  const name = area?.area_name ?? axis?.domain_name ?? "핵심 영역";
  if (name.includes("보상")) {
    return "보상 문제가 아니라, 성과 차이를 공개적으로 다루는 언어가 아직 약합니다.";
  }
  if (name.includes("평가")) {
    return "평가 양식 문제가 아니라, 평가 결과를 설명하고 받아들이는 리더십 언어가 아직 약합니다.";
  }
  if (name.includes("리더")) {
    return "리더십 문제가 아니라, 대표가 직접 판단하던 기준이 리더에게 이전되지 않은 상태입니다.";
  }
  if (name.includes("채용")) {
    return "채용 속도 문제가 아니라, 어떤 사람을 왜 뽑는지에 대한 기준이 충분히 반복되지 않은 상태입니다.";
  }
  if (name.includes("인력") || name.includes("유지") || name.includes("이탈")) {
    return "사람이 떠나는 문제만이 아니라, 핵심 역할이 비었을 때 회사가 어디까지 흔들리는지에 대한 대비가 약합니다.";
  }
  return `${name}에서 먼저 흔들리는 것은 제도 자체보다, 같은 판단을 같은 문장으로 설명하는 힘입니다.`;
}

function dangerText(areaName: string): string {
  return `지금 가장 위험한 선택은 ${areaName} 제도를 더 정교하게 만드는 것만으로 문제를 해결하려는 접근입니다. 결과를 받아들일 리더십 언어와 적용 기준이 없으면 구성원은 제도를 신뢰하기보다 방어적으로 대응할 수 있습니다.`;
}

function reviewDirections(mode: DiagnosisMode | undefined, areaName: string) {
  if (mode === "foundation") {
    return [
      { title: "기준을 한 문장으로 줄이기", gain: `${areaName}에서 대표가 실제로 따르는 판단 기준을 한 문장으로 적습니다.`, burden: "새 제도보다 먼저 리더가 같은 문장으로 설명하는 연습이 필요합니다.", change: "대표가 직접 설명하던 기준을 반복 가능한 표현으로 바꿔야 합니다.", risk: "양식부터 만들면 기준이 비어 있는 상태가 더 선명하게 드러납니다." },
      { title: "리더 설명 언어 맞추기", gain: "같은 상황에서 리더가 다른 설명을 붙이는 일을 줄입니다.", burden: "리더에게 불편한 피드백과 예외 설명을 요구하게 됩니다.", change: "대표가 최종 판단자가 아니라 기준의 소유자가 되어야 합니다.", risk: "리더 준비 없이 책임만 넘기면 현장은 더 조심스럽게 움직입니다." },
      { title: "새 제도 보류하기", gain: "제도를 늘리기 전 반복되는 판단 장면을 먼저 봅니다.", burden: "당장 바뀐 것처럼 보이는 산출물은 줄어듭니다.", change: "대표가 속도보다 수용 가능성을 먼저 보아야 합니다.", risk: "보류 없이 동시에 바꾸면 실행 부담이 한 번에 커집니다." },
    ];
  }
  if (mode === "hybrid") {
    return [
      { title: "유연함과 고정 기준 나누기", gain: "계속 유연하게 둘 예외와 반드시 고정할 기준을 분리합니다.", burden: "모든 것을 규정하지 않는 대신, 핵심 기준은 더 선명해야 합니다.", change: "대표가 예외를 허용할 조건까지 함께 말해야 합니다.", risk: "구분 없이 제도만 늘리면 유연함과 기준이 동시에 약해집니다." },
      { title: "성과 차이 설명 준비하기", gain: "성과 차이를 보상이나 평가와 연결하기 전에 설명 가능성을 확인합니다.", burden: "리더가 불편한 차이를 말로 다뤄야 합니다.", change: "대표가 결과보다 설명 방식을 먼저 점검해야 합니다.", risk: "수용 언어 없이 결과를 연결하면 신뢰보다 방어가 먼저 나옵니다." },
      { title: "반복 설명 줄이기", gain: "회의, 1:1, 보상 설명에서 같은 기준이 반복되는지 확인합니다.", burden: "리더별 해석 차이를 드러내야 합니다.", change: "대표가 개별 판단보다 공통 문장을 우선해야 합니다.", risk: "반복 설명이 없으면 좋은 제도도 사람마다 다르게 실행됩니다." },
    ];
  }
  return [
    { title: "리더별 판단 차이 줄이기", gain: "같은 사안에 같은 설명이 붙도록 기준 문장을 맞춥니다.", burden: "리더의 재량과 회사의 공통 기준 사이에 선을 그어야 합니다.", change: "대표가 기준의 예외를 더 적게 허용해야 합니다.", risk: "리더별 차이가 남아 있으면 새 제도는 또 다른 해석 차이를 만듭니다." },
    { title: "불편한 기준 공개하기", gain: "보상, 평가, 핵심 역할 판단처럼 불편한 기준을 어디까지 말할지 합의합니다.", burden: "모두가 좋아하는 문장이 아니라 감당 가능한 문장이 필요합니다.", change: "대표가 좋은 의도보다 적용 가능한 기준을 먼저 말해야 합니다.", risk: "불편한 기준을 피하면 결정은 다시 대표에게 몰립니다." },
    { title: "수용 신호 먼저 보기", gain: "제도 도입보다 구성원이 설명을 받아들이는지 먼저 봅니다.", burden: "짧은 기간에는 변화가 덜 화려해 보일 수 있습니다.", change: "대표가 속도보다 반복 가능성을 우선해야 합니다.", risk: "수용 신호 없이 확장하면 현장에서는 통제 강화로 읽힐 수 있습니다." },
  ];
}
function decisionItems(mode: DiagnosisMode | undefined, areaName: string) {
  if (mode === "foundation") {
    return [
      { title: "이번 회의에서 합의", body: `${areaName}에서 대표만 알고 있던 판단 기준을 리더와 공유할 수 있는 문장으로 바꿉니다.` },
      { title: "이번 분기에는 보류", body: "평가·보상 체계 전체를 새로 설계하는 일은 보류합니다. 설명 가능한 기준 없이 양식부터 늘리지 않습니다." },
      { title: "다음 점검 신호", body: "리더가 대표 없이 같은 기준을 설명할 수 있는지, 예외가 생길 때 기준으로 돌아오는지 봅니다." },
    ];
  }
  if (mode === "hybrid") {
    return [
      { title: "이번 회의에서 합의", body: "유연하게 둘 영역과 반드시 고정할 기준을 분리합니다. 모두 규정화하지 않는 대신, 중요한 기준은 반복합니다." },
      { title: "이번 분기에는 보류", body: "수용 언어가 없는 평가·보상 연결은 보류합니다. 결과보다 설명 방식이 먼저입니다." },
      { title: "다음 점검 신호", body: "리더별 설명 차이, 구성원의 방어적 반응, 예외가 다시 대표에게 몰리는지를 봅니다." },
    ];
  }
  return [
    { title: "이번 회의에서 합의", body: `${areaName}에서 같은 사안에 같은 설명이 붙도록 기준 문장을 정합니다.` },
    { title: "이번 분기에는 보류", body: "제도 추가보다 리더 실행과 설명 일관성이 먼저입니다. 새 양식은 마지막에 붙입니다." },
    { title: "다음 점검 신호", body: "구성원이 결과를 방어적으로 받아들이는지, 리더가 어려운 판단을 회피하는지, 같은 예외가 반복되는지 봅니다." },
  ];
}

function radarPoints(domains: SnapshotDomain[], key: "philosophy" | "actual"): string {
  const centerX = 103;
  const centerY = 88;
  const radius = 70;
  return domains.map((domain, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / domains.length;
    const distance = (domain[key] / 100) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    return x.toFixed(1) + "," + y.toFixed(1);
  }).join(" ");
}

function SnapshotRadar({ domains }: { domains: SnapshotDomain[] }) {
  const centerX = 103;
  const centerY = 88;
  const radius = 70;
  const gridPoints = [0.33, 0.66, 1].map((ratio) => (
    DOMAIN_ORDER.map((_, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / DOMAIN_ORDER.length;
      const x = centerX + Math.cos(angle) * radius * ratio;
      const y = centerY + Math.sin(angle) * radius * ratio;
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ")
  ));

  return (
    <View style={styles.radarPanel}>
      <Text style={styles.cardLabel}>영역별 상태 레이더</Text>
      <Svg style={styles.radarSvg} viewBox="0 0 206 182">
        {gridPoints.map((points) => (
          <Polygon key={points} points={points} fill="none" stroke="#e9edf2" strokeWidth={1} />
        ))}
        {DOMAIN_ORDER.map((_, index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / DOMAIN_ORDER.length;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return <Line key={index} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#e9edf2" strokeWidth={1} />;
        })}
        <Polygon points={radarPoints(domains, "philosophy")} fill={colors.philosophyColor} fillOpacity={0.14} stroke={colors.philosophyColor} strokeWidth={2} />
        <Polyline points={radarPoints(domains, "actual")} fill="none" stroke={colors.actualColor} strokeWidth={2} />
        {domains.map((domain, index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / domains.length;
          const x = centerX + Math.cos(angle) * (domain.actual / 100) * radius;
          const y = centerY + Math.sin(angle) * (domain.actual / 100) * radius;
          return <Circle key={domain.id} cx={x} cy={y} r={3} fill={colors.actualColor} />;
        })}
      </Svg>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={styles.legendSwatchPhilosophy} />
          <Text style={styles.smallBody}>대표 의도</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendSwatchActual} />
          <Text style={styles.smallBody}>조직 경험</Text>
        </View>
      </View>
    </View>
  );
}

function IntentGapRows({ domains }: { domains: SnapshotDomain[] }) {
  return (
    <View style={styles.noteCard}>
      <Text style={styles.cardLabel}>의도-해석 갭 다이어그램</Text>
      {domains.map((domain) => (
        <View key={domain.id} style={styles.gapRow}>
          <Text style={styles.gapLabel}>{domain.label}</Text>
          <View style={styles.gapRail}>
            <View style={[gapFillStyle(domain.level), { width: Math.max(8, domain.gap * 1.1) }]} />
          </View>
          <Text style={levelStyle(domain.level)}>{domain.level}</Text>
        </View>
      ))}
    </View>
  );
}

function SnapshotDataCards({ items }: { items: SnapshotDataPoint[] }) {
  return (
    <View style={styles.dataGrid}>
      {items.map((item) => (
        <View key={item.label} style={styles.dataPointCard}>
          <Text style={styles.cardLabel}>{item.label}</Text>
          <Text style={styles.smallBody}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

function PolarityDiagram({ axis }: { axis: AlignmentAxisOut | undefined }) {
  return (
    <View style={styles.polarityBox}>
      <Text style={styles.cardLabel}>양극 다이어그램</Text>
      <Text style={styles.body}>Page 2에서 본 두 선은 여기서 같은 의미로 다시 등장합니다. 틸은 대표 의도, 회색은 조직이 실제로 경험하는 운영입니다.</Text>
      <View style={styles.polarityLine}>
        <View style={styles.polarityEndpoint}>
          <Text style={styles.cardLabel}>대표 의도</Text>
          <Text style={styles.smallBody}>{axis ? axis.domain_name + "에서 지키고 싶은 기준" : "좋은 의도와 배려"}</Text>
        </View>
        <View style={styles.polarityConnector} />
        <View style={[styles.polarityEndpoint, { borderColor: colors.grayBorder, backgroundColor: colors.grayWash }]}>
          <Text style={styles.cardLabel}>조직 경험</Text>
          <Text style={styles.smallBody}>{axis ? axis.domain_name + "에서 반복되는 실제 해석" : "반복되는 예외와 설명 차이"}</Text>
        </View>
      </View>
    </View>
  );
}

function TensionMatrix({ axes, areas, mode }: { axes: AlignmentAxisOut[]; areas: AreaAnalysisOut[]; mode: DiagnosisMode }) {
  const domains = snapshotDomains(axes, areas, mode);
  const ranked = [...domains].sort((a, b) => b.gap - a.gap).slice(0, 5);
  return (
    <View>
      <Text style={styles.cardLabel}>기준 명문화 정도 × 리더 수용성</Text>
      <View style={styles.matrixBox}>
        <View style={styles.matrixQuadrantTopLeft} />
        <View style={styles.matrixQuadrantBottomRight} />
        <View style={styles.matrixVertical} />
        <View style={styles.matrixHorizontal} />
        <Text style={styles.matrixAxisLeft}>리더 수용성 높음</Text>
        {ranked.map((domain, index) => {
          const explicitness = clamp(100 - domain.gap * 1.25);
          const adoption = mode === "foundation" ? clamp(domain.actual * 0.7) : clamp(domain.actual);
          const left = 26 + explicitness * 4.1;
          const top = 166 - adoption * 1.42;
          const dotStyle = domain.level === "높음"
            ? { borderColor: colors.cautionBorder, backgroundColor: colors.cautionWash }
            : domain.level === "주의"
              ? { borderColor: colors.cautionBorder, backgroundColor: "#fffdf6" }
              : { borderColor: colors.mintBorder, backgroundColor: colors.mintWash };
          return (
            <View key={domain.id} style={[styles.matrixDot, dotStyle, { left, top: top + index * 2 }]}>
              <Text style={styles.smallBody}>{domain.label}</Text>
            </View>
          );
        })}
        <View style={styles.matrixAxisBottom}>
          <Text style={styles.smallBody}>기준 명문화 낮음</Text>
          <Text style={styles.smallBody}>기준 명문화 높음</Text>
        </View>
      </View>
    </View>
  );
}
function OptionComparisonTable({ directions }: { directions: ReturnType<typeof reviewDirections> }) {
  const rows = [
    { label: "얻는 것", key: "gain" as const, risk: false },
    { label: "감수할 것", key: "burden" as const, risk: false },
    { label: "대표 변화", key: "change" as const, risk: false },
    { label: "위험 실행", key: "risk" as const, risk: true },
  ];
  return (
    <View style={styles.optionTable}>
      <View style={styles.optionHeaderRow}>
        <View style={styles.optionLabelCell}>
          <Text style={styles.cardLabel}>구분</Text>
        </View>
        {directions.map((direction) => (
          <View key={direction.title} style={styles.optionCell}>
            <Text style={styles.cardTitle}>{direction.title}</Text>
          </View>
        ))}
      </View>
      {rows.map((row) => (
        <View key={row.label} style={row.risk ? styles.optionRiskRow : styles.optionRow}>
          <View style={styles.optionLabelCell}>
            <Text style={styles.cardLabel}>{row.label}</Text>
          </View>
          {directions.map((direction) => (
            <View key={direction.title + row.label} style={styles.optionCell}>
              <Text style={styles.smallBody}>{direction[row.key]}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function DecisionTimeline() {
  const items = [
    { title: "0-30일", body: "한 영역에서 먼저 기준 문장을 정하고, 리더가 같은 문장으로 설명하는지 확인합니다." },
    { title: "31-90일", body: "반복되는 예외와 리더별 설명 차이를 모아, 보류할 제도와 고정할 기준을 분리합니다." },
    { title: "3-6개월", body: "수용 신호가 확인된 영역부터 제도 양식을 붙입니다. 합의 없이 한 번에 확장하지 않습니다." },
  ];
  return (
    <View style={styles.timeline}>
      {items.map((item) => (
        <View key={item.title} style={styles.timelineItem}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.smallBody}>{item.body}</Text>
        </View>
      ))}
    </View>
  );
}
function Footer({ page, decision }: { page: string; decision: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{decision}</Text>
      <Text>{page}</Text>
    </View>
  );
}

export function DiagnosticPdfDocument({ exportData }: DiagnosticPdfDocumentProps) {
  registerPdfFonts();
  const { diagnosis, responses } = exportData;
  const mode = diagnosis.diagnosis_mode ?? "alignment";
  const areas = diagnosis.areas ?? [];
  const priorityAreas = topAreas(areas, 3);
  const axes = sortedAxes(diagnosis.alignment_map?.axes ?? []);
  const axis = topAxis(axes);
  const primaryArea = priorityAreas[0];
  const primaryAreaName = primaryArea?.area_name ?? axis?.domain_name ?? "핵심 영역";
  const headcount = responseToText(responses["L1-2"]);
  const companyName = normalizeCompanyName(exportData.companyName);
  const directions = reviewDirections(mode, primaryAreaName);
  const decisions = decisionItems(mode, primaryAreaName);
  const snapshot = snapshotDomains(axes, areas, mode);
  const dataPoints = snapshotDataPoints(responses);
  const metadata = [
    { label: "회사명", value: companyName },
    { label: "진단 모드", value: modeLabel(mode) },
    { label: "조직 규모", value: headcount },
    { label: "진단일", value: exportData.completedDateLabel },
    { label: "진단자", value: "Kanghoon Kim" },
  ];

  return (
    <Document title={`${companyName} 진단 보고서`} author={exportData.brand}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>DIAGNOSTIC REPORT</Text>
        <Text style={styles.title}>진단 보고서</Text>
        <Text style={styles.subtitle}>먼저 혼자 읽으시고, 다음 리더십 회의에서 함께 보시는 문서입니다.</Text>
        <View style={styles.metadataGrid}>
          {metadata.map((item) => (
            <View key={item.label} style={styles.metaCard}>
              <Text style={styles.metaLabel}>{item.label}</Text>
              <Text style={styles.metaValue}>{item.value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.heroStatement}>
          <Text style={styles.heroLabel}>대표가 먼저 봐야 할 문장</Text>
          <Text style={styles.heroText}>{mirrorSentence()}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.contentCard}>
            <Text style={styles.cardLabel}>이 문서의 역할</Text>
            <Text style={styles.body}>이 문서는 웹 결과 화면을 그대로 옮긴 출력물이 아닙니다. 대표님이 먼저 해석을 정리하고, 공동창업자·이사회·리더와 다음 회의의 판단 기준을 맞추기 위한 진단 보고서입니다.</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.cardLabel}>현재 읽어야 할 구간</Text>
            <Text style={styles.cardTitle}>{modeNoun(mode)}</Text>
            <Text style={styles.body}>{headcountMeaning(headcount)}</Text>
          </View>
        </View>
        <Footer page="1 / 6" decision="이 페이지에서 다룰 결정: 우리가 어떤 문장으로 문제를 볼 것인가" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>DIAGNOSIS SNAPSHOT</Text>
        <Text style={styles.pageTitle}>진단 응답이 먼저 보여주는 장면</Text>
        <Text style={styles.subtitle}>해석으로 들어가기 전에, 대표가 말한 운영 강도와 조직이 실제로 받는 운영 강도를 같은 좌표 위에 올립니다.</Text>
        <View style={styles.snapshotLayout}>
          <SnapshotRadar domains={snapshot} />
          <View style={styles.snapshotSide}>
            <View style={styles.heroStatement}>
              <Text style={styles.heroLabel}>이번 보고서의 출발점</Text>
              <Text style={styles.heroText}>{modeNoun(mode)}</Text>
            </View>
            <IntentGapRows domains={snapshot} />
          </View>
        </View>
        <SnapshotDataCards items={dataPoints} />
        <View style={styles.noteCard}>
          <Text style={styles.cardLabel}>임계값 해석 원칙</Text>
          <Text style={styles.body}>Foundation 단계에서는 낮은 운영 강도 자체보다 기준 부재를 먼저 봅니다. Alignment 단계에서는 작은 차이도 리더별 실행 차이로 커질 수 있어 더 민감하게 표시합니다.</Text>
        </View>
        <Footer page="2 / 6" decision="이 페이지에서 다룰 결정: 어떤 응답 데이터에서 해석을 시작할 것인가" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>PATTERN</Text>
        <Text style={styles.pageTitle}>대표님의 의도와 조직의 실제 해석</Text>
        <Text style={styles.subtitle}>대표가 의도한 배려와 조직이 체감한 기준은 다를 수 있습니다. 이 차이가 반복되면 제도 문제가 아니라 신뢰와 설명의 문제로 번역됩니다.</Text>
        <View style={styles.row}>
          <View style={styles.contentCard}>
            <Text style={styles.cardLabel}>대표님의 의도</Text>
            <Text style={styles.body}>{intentText(axis)}</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.cardLabel}>조직의 실제 해석</Text>
            <Text style={styles.body}>{interpretationText(axis)}</Text>
          </View>
          <View style={styles.cautionCard}>
            <Text style={styles.cardLabel}>지속되면 나타나는 결과</Text>
            <Text style={styles.body}>{resultText(axis, primaryAreaName)}</Text>
          </View>
        </View>
        <View style={styles.noteCard}>
          <Text style={styles.cardLabel}>불편하지만 필요한 해석</Text>
          <Text style={styles.body}>현재의 유연성은 장점이지만, 조직이 커질수록 유연성은 일관성 부족으로 번역됩니다. 대표가 의도한 배려가 구성원에게는 기준의 불투명성으로 읽힐 수 있습니다.</Text>
        </View>
        <View style={styles.statementCard}>
          <Text style={styles.cardLabel}>핵심 패턴</Text>
          <Text style={styles.body}>{patternText(axis, areas)}</Text>
        </View>
        <Footer page="3 / 6" decision="이 페이지에서 다룰 결정: 대표 의도와 조직 해석의 차이를 인정할 것인가" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>TENSION</Text>
        <Text style={styles.pageTitle}>어디가 가장 먼저 흔들리는가</Text>
        <Text style={styles.subtitle}>이 페이지는 영역별 점검표가 아닙니다. 리더십 미팅에서 먼저 다뤄야 할 긴장 지점을 해석 언어로 정리합니다.</Text>
        <View style={styles.statementCard}>
          <Text style={styles.cardLabel}>가장 먼저 흔들리는 지점</Text>
          <Text style={styles.heroText}>{tensionSentence(primaryArea, axis)}</Text>
        </View>
        <TensionMatrix axes={axes} areas={areas} mode={mode} />
        <View style={styles.row}>
          {priorityAreas.slice(1, 3).map((area) => (
            <View key={area.area_id} style={styles.contentCard}>
              <Text style={styles.cardLabel}>{area.area_name}</Text>
              <Text style={styles.body}>{tensionSentence(area, axis)}</Text>
            </View>
          ))}
        </View>
        <Footer page="4 / 6" decision="이 페이지에서 다룰 결정: 먼저 흔들리는 영역을 어디로 볼 것인가" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OPTIONS</Text>
        <Text style={styles.pageTitle}>검토 방향 비교입니다</Text>
        <Text style={styles.subtitle}>아래 세 가지는 순위가 아닙니다. 지금 회사의 리더십 수용성, 설명 부담, 공개 가능한 기준 수준을 놓고 선택할 수 있는 검토 방향입니다.</Text>
        <OptionComparisonTable directions={directions} />
        <View style={styles.decisionStack}>
          <View style={styles.decisionCard}>
            <Text style={styles.cardLabel}>대표에게 요구되는 변화</Text>
            <Text style={styles.body}>대표님이 혼자 알고 있던 판단 기준을 리더가 반복해서 설명할 수 있는 문장으로 내려야 합니다. 제도보다 먼저 대표의 판단 언어가 조직 언어로 바뀌어야 합니다.</Text>
          </View>
          <View style={styles.cautionCard}>
            <Text style={styles.cardLabel}>지금 하면 위험한 실행</Text>
            <Text style={styles.body}>{dangerText(primaryAreaName)}</Text>
          </View>
        </View>
        <Footer page="5 / 6" decision="이 페이지에서 다룰 결정: 무엇을 고치고 무엇을 보류할 것인가" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>DECISION MEMO</Text>
        <Text style={styles.pageTitle}>다음 리더십 회의에서 남길 결정</Text>
        <Text style={styles.subtitle}>보고서의 목적은 더 많은 과제를 만드는 것이 아니라, 이번 회의에서 합의할 것과 보류할 것을 분리하는 것입니다.</Text>
        <View style={styles.row}>
          {decisions.map((item) => (
            <View key={item.title} style={styles.contentCard}>
              <Text style={styles.cardLabel}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          ))}
        </View>
        <DecisionTimeline />
        <View style={styles.decisionStack}>
          <View style={styles.decisionCard}>
            <Text style={styles.cardLabel}>이번 회의에서 하나만 남길 질문</Text>
            <Text style={styles.heroText}>기준을 말할 수 있는 영역과 아직 말할 수 없는 영역을 어디서 나눌 것인가?</Text>
          </View>
        </View>
        <Footer page="6 / 6" decision="이 페이지에서 다룰 결정: 이번 회의의 합의문을 무엇으로 남길 것인가" />
      </Page>
    </Document>
  );
}