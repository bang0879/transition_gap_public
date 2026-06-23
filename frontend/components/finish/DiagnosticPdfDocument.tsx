"use client";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { AlignmentAxisOut, AreaAnalysisOut, DiagnosisMode } from "@/lib/types/api";
import type { ResponseValue } from "@/lib/store/responses";
import type { ReportExportData } from "@/lib/utils/reportExport";

interface DiagnosticPdfDocumentProps {
  exportData: ReportExportData;
}

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

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingHorizontal: 42,
    paddingBottom: 34,
    fontFamily: "Pretendard",
    color: "#162033",
    backgroundColor: "#ffffff",
  },
  eyebrow: {
    fontSize: 8.5,
    fontWeight: 700,
    color: "#2d8b83",
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: 700,
    lineHeight: 1.24,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.28,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 10.5,
    lineHeight: 1.62,
    color: "#5a6475",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#172033",
    marginBottom: 8,
  },
  body: {
    fontSize: 9.7,
    lineHeight: 1.62,
    color: "#3c4658",
  },
  smallBody: {
    fontSize: 8.9,
    lineHeight: 1.56,
    color: "#4f5a6c",
  },
  metaRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#d9e1e8",
    borderBottomWidth: 1,
    borderBottomColor: "#d9e1e8",
    paddingVertical: 11,
    marginTop: 12,
    marginBottom: 18,
  },
  metaItem: {
    flexGrow: 1,
    flexBasis: 0,
    paddingRight: 10,
  },
  metaLabel: {
    fontSize: 7.8,
    color: "#7b8495",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10.5,
    fontWeight: 700,
    color: "#172033",
  },
  mirrorBox: {
    borderWidth: 1,
    borderColor: "#b8d9d5",
    borderRadius: 8,
    padding: 17,
    backgroundColor: "#f4fbfa",
    marginBottom: 14,
  },
  mirrorLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#2d8b83",
    marginBottom: 8,
  },
  mirrorText: {
    fontSize: 15.5,
    fontWeight: 700,
    lineHeight: 1.42,
    color: "#172033",
  },
  grid2: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  grid3: {
    flexDirection: "row",
    gap: 9,
    marginTop: 10,
  },
  card: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 1,
    borderColor: "#dfe6ee",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fbfcfd",
  },
  tealCard: {
    borderColor: "#b8d9d5",
    backgroundColor: "#f4fbfa",
  },
  amberCard: {
    borderColor: "#ecd8ad",
    backgroundColor: "#fffaf0",
  },
  cardLabel: {
    fontSize: 8.2,
    fontWeight: 700,
    color: "#7b8495",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 10.8,
    fontWeight: 700,
    color: "#172033",
    marginBottom: 6,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#edf1f5",
    paddingVertical: 8,
  },
  listTitle: {
    fontSize: 10.2,
    fontWeight: 700,
    color: "#172033",
    marginBottom: 4,
  },
  barTrack: {
    width: 180,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#dfe6ee",
    marginTop: 6,
    marginBottom: 5,
  },
  barFill: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2d8b83",
  },
  coralFill: {
    backgroundColor: "#df705f",
  },
  slateFill: {
    backgroundColor: "#667085",
  },
  memoBox: {
    borderWidth: 1,
    borderColor: "#ecd8ad",
    borderRadius: 8,
    padding: 13,
    backgroundColor: "#fffaf0",
    marginTop: 12,
  },
  memoTitle: {
    fontSize: 10.8,
    fontWeight: 700,
    color: "#7c5a16",
    marginBottom: 7,
  },
  callout: {
    borderLeftWidth: 3,
    borderLeftColor: "#2d8b83",
    paddingLeft: 11,
    marginTop: 10,
    marginBottom: 10,
  },
  flowRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  flowBox: {
    flexGrow: 1,
    flexBasis: 0,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f2f5f8",
  },
  footer: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.8,
    color: "#8a94a6",
  },
});

const modeLabels: Record<DiagnosisMode, string> = {
  foundation: "Foundation",
  hybrid: "Hybrid",
  alignment: "Alignment",
};

function responseToText(value: ResponseValue | undefined, fallback = "미입력"): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return fallback;
  if (value === undefined || value === "") return fallback;
  return String(value);
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

function barWidth(value: number, max = 100): number {
  const ratio = max <= 0 ? 0 : value / max;
  return Math.max(8, Math.min(180, Math.round(ratio * 180)));
}

function modeCopy(mode: DiagnosisMode | undefined): string {
  if (mode === "foundation") {
    return "아직 정교한 제도 설계보다 기준을 버틸 최소 운영 언어를 먼저 맞춰야 하는 구간입니다. 이 단계에서는 12개월짜리 큰 로드맵보다 30일 안에 공개적으로 설명 가능한 기준을 만드는 일이 더 중요합니다.";
  }
  if (mode === "hybrid") {
    return "일부 제도는 작동하지만, 민감한 순간에는 대표와 리더의 개별 판단이 더 강하게 작동하는 구간입니다. 지금 필요한 것은 제도를 늘리는 것이 아니라 유지할 유연성과 고정할 기준을 분리하는 일입니다.";
  }
  return "제도 자체보다 철학, 실제 운영, 리더 언어의 정합성을 맞추는 것이 핵심인 구간입니다. 조직은 이미 대표의 의도보다 반복되는 운영 경험을 기준으로 회사를 해석하고 있습니다.";
}

function headcountCopy(headcount: string): string {
  if (headcount.includes("20") || headcount.includes("30") || headcount.includes("40")) {
    return "40명 이하에서는 대표의 직접 설명과 개입으로 제도 공백을 버틸 수 있습니다. 다만 같은 방식이 반복되면 다음 성장 구간에서 기준 이전 비용이 커집니다.";
  }
  if (headcount.includes("51") || headcount.includes("100") || headcount.includes("80")) {
    return "50~100명 구간에서는 같은 판단이라도 팀과 리더에 따라 다르게 번역됩니다. 이때 유연성은 빠르게 일관성 부족으로 읽힐 수 있습니다.";
  }
  if (headcount.includes("101") || headcount.includes("150")) {
    return "100명 이상에서는 대표의 의도보다 운영 시스템의 반복 경험이 더 강한 메시지가 됩니다. 예외를 줄이는 기준 언어가 필요합니다.";
  }
  return "조직 규모가 커질수록 대표의 의도는 말보다 반복되는 운영 경험으로 해석됩니다.";
}

function blindSpotText(axis: AlignmentAxisOut | undefined, area: AreaAnalysisOut | undefined): string {
  if (axis) {
    return `${axis.domain_name} 영역에서 대표님의 의도는 '${axis.philosophy_label}'에 가깝지만, 구성원이 경험하는 실제 운영은 '${axis.actual_label}'로 읽힐 가능성이 큽니다. 지금의 유연성은 장점이지만, 민감한 순간에는 기준의 불투명성으로 번역될 수 있습니다.`;
  }
  if (area) {
    return `${area.area_name} 영역에서 대표님이 기대하는 수준과 현재 운영 경험 사이의 차이가 가장 먼저 보입니다. 제도를 추가하기 전에 어떤 판단 기준을 공개적으로 감당할 수 있는지 확인해야 합니다.`;
  }
  return "이번 진단에서는 제도 자체보다 대표의 의도와 구성원이 체감하는 운영 메시지 사이의 간격을 먼저 확인해야 합니다.";
}

function coverLine(axis: AlignmentAxisOut | undefined, area: AreaAnalysisOut | undefined): string {
  if (axis) return `지금의 운영은 ${axis.domain_name}에서 대표님의 의도와 다르게 읽히고 있습니다.`;
  if (area) return `지금의 운영은 ${area.area_name}에서 다음 성장 구간의 병목이 될 가능성이 큽니다.`;
  return "지금의 운영이, 우리가 되고자 하는 조직을 가로막고 있습니다.";
}

function intentText(axis: AlignmentAxisOut | undefined): string {
  if (!axis) return "대표님은 좋은 사람에게 더 나은 기회를 주고 싶어 하지만, 아직 그 판단 기준이 조직 안에서 같은 문장으로 공유되어 있지는 않습니다.";
  return `대표님은 ${axis.domain_name}에서 '${axis.philosophy_label}' 방향의 조직 운영을 의도하고 있습니다. 문제는 그 의도가 제도와 리더 행동으로 충분히 번역되지 않았다는 점입니다.`;
}

function interpretationText(axis: AlignmentAxisOut | undefined): string {
  if (!axis) return "구성원은 대표의 의도보다 실제로 반복되는 예외, 설명 방식, 리더별 판단 차이를 더 강한 신호로 받아들입니다.";
  return `조직은 현재 운영을 '${axis.actual_label}'에 가까운 메시지로 해석할 수 있습니다. 대표가 의도한 배려가 구성원에게는 기준의 불투명성으로 읽힐 여지가 있습니다.`;
}

function operatingCostText(axis: AlignmentAxisOut | undefined, area: AreaAnalysisOut | undefined): string {
  if (axis?.business_risk) return axis.business_risk;
  if (area) return `${area.area_name} 영역의 차이를 방치하면 제도 개선이 아니라 팀별 해석 차이, 리더별 적용 편차, 구성원의 방어적 반응으로 비용이 나타날 수 있습니다.`;
  return "기준이 명확하지 않은 상태에서 제도만 늘어나면, 구성원은 개선보다 통제 신호로 받아들일 가능성이 큽니다.";
}

function patternText(axis: AlignmentAxisOut | undefined, areas: AreaAnalysisOut[]): string {
  const names = topAreas(areas).map((area) => area.area_name).join(", ") || "핵심 영역";
  if (axis) {
    return `이 회사의 핵심 패턴은 '${axis.domain_name}' 한 영역의 문제가 아니라, 민감한 판단 순간에 명문화된 기준보다 개별 판단이 앞서는 구조입니다. 그래서 ${names}을 각각 따로 고치기보다, 어떤 기준을 공개적으로 말할 수 있는지부터 맞춰야 합니다.`;
  }
  return `이 회사의 핵심 패턴은 ${names}에서 동시에 나타납니다. 기준이 전혀 없는 것이 아니라, 중요한 순간에 기준이 일관된 언어로 설명되지 않는 것이 더 큰 비용입니다.`;
}

function riskyMoveText(axis: AlignmentAxisOut | undefined, area: AreaAnalysisOut | undefined): string {
  if (axis?.business_risk) return axis.business_risk;
  if (area) {
    return `지금 가장 위험한 선택은 ${area.area_name} 제도를 더 정교하게 만드는 것만으로 문제를 해결하려는 접근입니다. 결과를 받아들일 리더십 언어와 적용 기준이 없으면, 구성원은 제도를 신뢰하기보다 방어적으로 대응할 수 있습니다.`;
  }
  return "지금 가장 위험한 선택은 제도 양식을 먼저 늘리는 것입니다. 대표와 리더가 같은 언어로 설명할 수 없는 제도는 개선보다 해석 비용을 더 키울 수 있습니다.";
}

function optionCards(mode: DiagnosisMode | undefined, areaName: string) {
  if (mode === "foundation") {
    return [
      { title: "최소 기준 명문화", body: `${areaName}에서 지금 바로 설명 가능한 판단 기준 3개만 정리합니다. 제도 설계보다 기준 언어를 먼저 만듭니다.` },
      { title: "리더 설명 언어 정렬", body: "대표가 직접 설명하던 내용을 리더가 같은 문장으로 말할 수 있는지 확인합니다. 이 단계가 없으면 제도는 현장에서 다르게 번역됩니다." },
      { title: "큰 제도 도입 보류", body: "평가·보상 체계를 한 번에 정교화하기보다, 30일 안에 반복될 판단 상황을 먼저 관찰합니다." },
    ];
  }
  if (mode === "hybrid") {
    return [
      { title: "유연성과 기준 분리", body: "계속 유연하게 둘 예외와 반드시 고정할 기준을 분리합니다. 모든 것을 규정화하지 않는 것이 핵심입니다." },
      { title: "평가·보상 연결 검토", body: "성과 차이를 다룰 리더십 언어가 준비된 영역부터 연결합니다. 연결 자체보다 수용 가능성이 먼저입니다." },
      { title: "운영 비용 제한", body: "새 제도를 늘리기보다 기존 회의, 1:1, 보상 설명에서 같은 기준이 반복되는지 확인합니다." },
    ];
  }
  return [
    { title: "판단 편차 축소", body: "리더별 판단 차이가 구성원 경험을 흔드는 영역을 먼저 줄입니다. 같은 사안에 같은 설명이 붙어야 합니다." },
    { title: "민감 기준 공개", body: "보상, 평가, 핵심 인재 판단처럼 불편한 기준을 어디까지 공개적으로 말할 수 있는지 정합니다." },
    { title: "확장 전 운영 지표", body: "제도 도입보다 리더 실행률, 설명 일관성, 구성원 수용 신호를 먼저 봅니다." },
  ];
}

function horizonItems(mode: DiagnosisMode | undefined) {
  if (mode === "foundation") {
    return [
      { title: "30일", body: "대표가 직접 판단하던 기준을 문장으로 적고, 리더 1~2명과 같은 언어로 설명 가능한지 확인합니다." },
      { title: "60일", body: "반복되는 판단 상황에 최소 기준을 적용해 보고, 예외가 생기는 이유를 기록합니다." },
      { title: "90일", body: "제도 도입 여부보다 리더가 기준을 독립적으로 설명할 수 있는지를 확인합니다." },
    ];
  }
  if (mode === "hybrid") {
    return [
      { title: "0~2개월", body: "유지할 유연성과 고정할 기준을 나누고, 리더별로 다르게 말하는 영역을 찾습니다." },
      { title: "3~4개월", body: "한 영역에서만 평가·보상·리더 설명의 연결을 작게 실험합니다." },
      { title: "5~6개월", body: "구성원의 수용 신호와 운영 부담을 보고 확대 여부를 결정합니다." },
    ];
  }
  return [
    { title: "이번 분기", body: "가장 큰 해석 간격을 만드는 기준을 공개 언어로 정리합니다." },
    { title: "다음 반기", body: "리더별 판단 편차와 구성원 수용 신호를 추적합니다." },
    { title: "12개월", body: "조직 확장 전에 제도, 리더 행동, 보상 메시지의 정합성을 다시 맞춥니다." },
  ];
}

function AreaSignal({ area, index }: { area: AreaAnalysisOut; index: number }) {
  const fillStyle = index === 0 ? styles.coralFill : index === 1 ? styles.slateFill : styles.barFill;
  return (
    <View style={styles.listItem}>
      <Text style={styles.listTitle}>{area.area_name}</Text>
      <Text style={styles.smallBody}>{area.status_text}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, fillStyle, { width: barWidth(Math.max(0, area.gap), 40) }]} />
      </View>
      <Text style={styles.smallBody}>{area.recommendation}</Text>
    </View>
  );
}

function Footer({ page }: { page: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>대표용 진단 보고서</Text>
      <Text>{page}</Text>
    </View>
  );
}

export function DiagnosticPdfDocument({ exportData }: DiagnosticPdfDocumentProps) {
  registerPdfFonts();
  const { diagnosis, responses } = exportData;
  const mode = diagnosis.diagnosis_mode ?? "alignment";
  const areas = diagnosis.areas ?? [];
  const priorityAreas = topAreas(areas, 4);
  const axes = sortedAxes(diagnosis.alignment_map?.axes ?? []);
  const axis = topAxis(axes);
  const primaryArea = priorityAreas[0];
  const headcount = responseToText(responses["L1-2"]);
  const companyName = exportData.companyName || "우리 회사";
  const alignmentLevel = diagnosis.alignment_map?.alignment_level ?? "정합성 확인 필요";
  const alignmentScore = diagnosis.alignment_map?.alignment_score ?? diagnosis.alignment?.score ?? 0;
  const primaryAreaName = primaryArea?.area_name ?? axis?.domain_name ?? "핵심 영역";
  const options = optionCards(mode, primaryAreaName);
  const horizons = horizonItems(mode);

  return (
    <Document title={`${companyName} 진단 보고서`} author={exportData.brand}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>DIAGNOSTIC REPORT</Text>
        <Text style={styles.title}>{companyName} 인사제도 진단 보고서</Text>
        <Text style={styles.subtitle}>
          이 문서는 웹 결과 화면을 그대로 옮긴 자료가 아니라, 대표님이 리더십과 논의할 때 바로 사용할 수 있도록 핵심 해석과 의사결정 메모를 정리한 보고서입니다.
        </Text>
        <View style={styles.mirrorBox}>
          <Text style={styles.mirrorLabel}>대표가 먼저 봐야 할 문장</Text>
          <Text style={styles.mirrorText}>{coverLine(axis, primaryArea)}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>진단 구간</Text>
            <Text style={styles.metaValue}>{modeLabels[mode]}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>조직 규모</Text>
            <Text style={styles.metaValue}>{headcount}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>보고서 생성일</Text>
            <Text style={styles.metaValue}>{exportData.completedDateLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>정합성 상태</Text>
            <Text style={styles.metaValue}>{alignmentLevel}</Text>
          </View>
        </View>
        <View style={styles.grid2}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>이 보고서의 역할</Text>
            <Text style={styles.body}>대표님이 공동창업자, 이사회, 리더에게 건넬 수 있는 공유용 판단 문서입니다. 목표는 정답 추천이 아니라 다음 의사결정의 기준을 선명하게 만드는 것입니다.</Text>
          </View>
          <View style={[styles.card, styles.tealCard]}>
            <Text style={styles.cardLabel}>진단 모드 해석</Text>
            <Text style={styles.body}>{modeCopy(mode)}</Text>
          </View>
        </View>
        <Footer page="1 / 6" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>EXECUTIVE SUMMARY</Text>
        <Text style={styles.pageTitle}>핵심 결론과 먼저 볼 영역</Text>
        <Text style={styles.subtitle}>점수보다 중요한 것은 어떤 운영 메시지가 구성원에게 반복되고 있는지입니다. 이 페이지는 대표님이 첫 회의에서 바로 꺼낼 결론만 압축합니다.</Text>
        <View style={styles.grid3}>
          <View style={[styles.card, styles.tealCard]}>
            <Text style={styles.cardLabel}>핵심 결론</Text>
            <Text style={styles.body}>{blindSpotText(axis, primaryArea)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>가장 먼저 볼 영역</Text>
            <Text style={styles.cardTitle}>{primaryAreaName}</Text>
            <Text style={styles.smallBody}>{primaryArea?.status_text ?? "가장 큰 해석 간격을 만드는 영역부터 확인합니다."}</Text>
          </View>
          <View style={[styles.card, styles.amberCard]}>
            <Text style={styles.cardLabel}>지금 위험한 실행</Text>
            <Text style={styles.smallBody}>{riskyMoveText(axis, primaryArea)}</Text>
          </View>
        </View>
        <View style={styles.memoBox}>
          <Text style={styles.memoTitle}>이번 회의의 결정 질문</Text>
          <Text style={styles.body}>지금 바로 새 제도를 설계할지보다, 먼저 어떤 판단 기준을 공개적으로 말할 수 있는지 정해야 합니다. 기준을 말할 수 없는 영역은 이번 분기에는 정교화보다 관찰과 언어 정렬을 우선합니다.</Text>
        </View>
        <View style={styles.callout}>
          <Text style={styles.sectionTitle}>조직 구간별 의미</Text>
          <Text style={styles.body}>{headcountCopy(headcount)}</Text>
        </View>
        <Text style={styles.sectionTitle}>정합성 신호</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: barWidth(alignmentScore) }]} />
        </View>
        <Text style={styles.smallBody}>정합성 상태: {alignmentLevel}. 이 수치는 내부 점수 공개가 아니라, 운영 메시지의 일관성을 판단하기 위한 내부 기준입니다.</Text>
        <Footer page="2 / 6" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>CEO BLIND SPOT</Text>
        <Text style={styles.pageTitle}>대표님의 의도와 조직의 실제 해석</Text>
        <Text style={styles.subtitle}>대표가 의도한 배려와 조직이 체감한 기준은 다를 수 있습니다. 이 차이가 반복되면 제도 문제가 아니라 신뢰와 정치의 문제로 번역됩니다.</Text>
        <View style={styles.grid3}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>대표님의 의도</Text>
            <Text style={styles.body}>{intentText(axis)}</Text>
          </View>
          <View style={[styles.card, styles.tealCard]}>
            <Text style={styles.cardLabel}>조직의 실제 해석</Text>
            <Text style={styles.body}>{interpretationText(axis)}</Text>
          </View>
          <View style={[styles.card, styles.amberCard]}>
            <Text style={styles.cardLabel}>운영 비용</Text>
            <Text style={styles.body}>{operatingCostText(axis, primaryArea)}</Text>
          </View>
        </View>
        <View style={styles.memoBox}>
          <Text style={styles.memoTitle}>불편하지만 필요한 해석</Text>
          <Text style={styles.body}>현재의 유연성은 장점이지만, 조직이 커질수록 유연성은 일관성 부족으로 번역됩니다. 대표가 의도한 배려가 구성원에게는 기준의 불투명성으로 읽힐 수 있습니다.</Text>
        </View>
        <View style={styles.callout}>
          <Text style={styles.sectionTitle}>핵심 패턴</Text>
          <Text style={styles.body}>{patternText(axis, areas)}</Text>
        </View>
        {axis ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>가장 큰 해석 간격</Text>
            <Text style={styles.cardTitle}>{axis.domain_name}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, styles.coralFill, { width: barWidth(100 - axis.alignment_percent) }]} />
            </View>
            <Text style={styles.smallBody}>대표님의 의도: {axis.philosophy_label} / 조직의 실제 해석: {axis.actual_label}</Text>
          </View>
        ) : null}
        <Footer page="3 / 6" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OPERATING SIGNALS</Text>
        <Text style={styles.pageTitle}>영역별 운영 신호</Text>
        <Text style={styles.subtitle}>아래 영역은 추천 순위가 아니라, 대표님이 리더들과 같은 기준으로 설명할 수 있는지 확인해야 할 검토 지점입니다.</Text>
        <View>
          {priorityAreas.length > 0 ? priorityAreas.map((area, index) => <AreaSignal key={area.area_id} area={area} index={index} />) : (
            <View style={styles.listItem}>
              <Text style={styles.listTitle}>추가 확인 필요</Text>
              <Text style={styles.smallBody}>아직 우선 영역을 특정할 만큼의 결과가 충분하지 않습니다.</Text>
            </View>
          )}
        </View>
        <View style={styles.flowRow}>
          <View style={styles.flowBox}>
            <Text style={styles.cardLabel}>신뢰 하락</Text>
            <Text style={styles.smallBody}>기준이 상황마다 다르게 설명되면 구성원은 제도보다 관계와 정치적 신호를 먼저 읽습니다.</Text>
          </View>
          <View style={styles.flowBox}>
            <Text style={styles.cardLabel}>속도 저하</Text>
            <Text style={styles.smallBody}>리더가 판단을 설명하지 못하면 의사결정은 대표에게 다시 몰리고 실행 속도가 느려집니다.</Text>
          </View>
          <View style={styles.flowBox}>
            <Text style={styles.cardLabel}>수용성 약화</Text>
            <Text style={styles.smallBody}>평가나 보상 결과가 나와도 기준을 신뢰하지 못하면 방어적 대응이 커집니다.</Text>
          </View>
        </View>
        <Footer page="4 / 6" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>REVIEW DIRECTIONS</Text>
        <Text style={styles.pageTitle}>추천이 아니라 검토 방향입니다</Text>
        <Text style={styles.subtitle}>아래 세 가지는 순위가 아닙니다. 지금 회사의 리더십 수용성, 운영 부담, 공개 가능한 기준 수준을 놓고 선택할 수 있는 검토 방향입니다.</Text>
        <View style={styles.grid3}>
          {options.map((option) => (
            <View key={option.title} style={styles.card}>
              <Text style={styles.cardLabel}>검토 방향</Text>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.body}>{option.body}</Text>
            </View>
          ))}
        </View>
        <View style={styles.grid2}>
          <View style={[styles.card, styles.tealCard]}>
            <Text style={styles.cardLabel}>대표에게 요구되는 변화</Text>
            <Text style={styles.body}>대표님이 혼자 알고 있던 판단 기준을 리더가 반복해서 설명할 수 있는 문장으로 내려야 합니다. 제도보다 먼저 대표의 판단 언어가 조직 언어로 바뀌어야 합니다.</Text>
          </View>
          <View style={[styles.card, styles.amberCard]}>
            <Text style={styles.cardLabel}>지금 하면 위험한 선택</Text>
            <Text style={styles.body}>{riskyMoveText(axis, primaryArea)}</Text>
          </View>
        </View>
        <View style={styles.memoBox}>
          <Text style={styles.memoTitle}>선택 기준</Text>
          <Text style={styles.body}>좋아 보이는 제도보다, 지금 조직이 감당할 수 있는 설명 비용이 낮은 선택을 우선합니다. 구성원이 결과를 받아들일 수 있는 언어가 없으면 제도 정교화는 오히려 방어적 반응을 키울 수 있습니다.</Text>
        </View>
        <Footer page="5 / 6" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>DECISION MEMO</Text>
        <Text style={styles.pageTitle}>다음 리더십 회의에서 남길 결정</Text>
        <Text style={styles.subtitle}>보고서의 목적은 더 많은 과제를 만드는 것이 아니라, 이번 회의에서 보류할 것과 정렬할 것을 분리하는 것입니다.</Text>
        <View style={styles.grid3}>
          {horizons.map((item) => (
            <View key={item.title} style={styles.card}>
              <Text style={styles.cardLabel}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          ))}
        </View>
        <View style={styles.memoBox}>
          <Text style={styles.memoTitle}>이번 회의에서 합의할 문장</Text>
          <Text style={styles.body}>우리는 모든 제도를 한 번에 고치지 않습니다. 먼저 {primaryAreaName}에서 공개적으로 설명 가능한 기준을 정하고, 리더가 같은 언어로 반복할 수 있는지 확인합니다.</Text>
        </View>
        <View style={styles.flowRow}>
          <View style={styles.flowBox}>
            <Text style={styles.cardLabel}>정렬</Text>
            <Text style={styles.smallBody}>대표와 리더가 같은 문장으로 설명할 수 있는 기준</Text>
          </View>
          <View style={styles.flowBox}>
            <Text style={styles.cardLabel}>보류</Text>
            <Text style={styles.smallBody}>수용 언어가 준비되지 않아 지금 정교화하면 비용이 커질 제도</Text>
          </View>
          <View style={styles.flowBox}>
            <Text style={styles.cardLabel}>모니터링</Text>
            <Text style={styles.smallBody}>구성원 반응, 리더 실행률, 예외 발생 이유</Text>
          </View>
        </View>
        <View style={styles.callout}>
          <Text style={styles.sectionTitle}>마지막 메모</Text>
          <Text style={styles.body}>대표가 불편하게 읽어야 하는 지점은 제도 미비가 아니라 기준을 공개적으로 다루는 비용입니다. 이 비용을 감당할 언어가 생길 때, 제도 개선은 내부 정치가 아니라 운영 수준 향상으로 읽힙니다.</Text>
        </View>
        <Footer page="6 / 6" />
      </Page>
    </Document>
  );
}