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
    paddingTop: 48,
    paddingHorizontal: 44,
    paddingBottom: 40,
    fontFamily: "Pretendard",
    color: "#162033",
    backgroundColor: "#ffffff",
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: 700,
    color: "#2d8b83",
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 1.65,
    color: "#5a6475",
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#d9e1e8",
    borderBottomWidth: 1,
    borderBottomColor: "#d9e1e8",
    paddingVertical: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexGrow: 1,
    flexBasis: 0,
    paddingRight: 12,
  },
  metaLabel: {
    fontSize: 8,
    color: "#7b8495",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#162033",
  },
  mirrorBox: {
    borderWidth: 1,
    borderColor: "#b8d9d5",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#f4fbfa",
    marginBottom: 16,
  },
  mirrorTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#2d8b83",
    marginBottom: 8,
  },
  mirrorText: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.45,
    color: "#172033",
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#172033",
    marginBottom: 8,
  },
  body: {
    fontSize: 10.2,
    lineHeight: 1.65,
    color: "#3c4658",
  },
  cardRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  card: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 1,
    borderColor: "#dfe6ee",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    backgroundColor: "#fbfcfd",
  },
  lastCard: {
    marginRight: 0,
  },
  cardLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    color: "#7b8495",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 9.6,
    lineHeight: 1.55,
    color: "#2c3648",
  },
  axisTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dfe6ee",
    marginTop: 8,
    marginBottom: 8,
  },
  axisFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2d8b83",
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#edf1f5",
    paddingVertical: 9,
  },
  listTitle: {
    fontSize: 10.4,
    fontWeight: 700,
    color: "#172033",
    marginBottom: 4,
  },
  listText: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: "#4f5a6c",
  },
  memoBox: {
    borderWidth: 1,
    borderColor: "#ecd8ad",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fffaf0",
    marginTop: 14,
  },
  memoTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#7c5a16",
    marginBottom: 7,
  },
  footer: {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
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

function topAreas(areas: AreaAnalysisOut[]): AreaAnalysisOut[] {
  return [...areas]
    .sort((a, b) => b.gap - a.gap || a.priority - b.priority)
    .slice(0, 3);
}

function topAxis(axes: AlignmentAxisOut[]): AlignmentAxisOut | undefined {
  return [...axes].sort((a, b) => b.tension - a.tension)[0];
}

function modeCopy(mode: DiagnosisMode | undefined): string {
  if (mode === "foundation") {
    return "아직 정교한 제도 설계보다 기준을 버틸 최소 운영 언어를 먼저 맞춰야 하는 구간입니다.";
  }
  if (mode === "hybrid") {
    return "일부 제도는 작동하지만, 민감한 순간에는 대표와 리더의 개별 판단이 더 강하게 작동하는 구간입니다.";
  }
  return "제도 자체보다 철학, 실제 운영, 리더 언어의 정합성을 맞추는 것이 핵심인 구간입니다.";
}

function headcountCopy(headcount: string): string {
  if (headcount.includes("20") || headcount.includes("30") || headcount.includes("40")) {
    return "40명 이하에서는 대표의 직접 설명으로 공백을 버틸 수 있지만, 같은 방식이 반복되면 다음 성장 구간에서 기준 이전 비용이 커집니다.";
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

function riskyMoveText(axis: AlignmentAxisOut | undefined, area: AreaAnalysisOut | undefined): string {
  if (axis?.business_risk) return axis.business_risk;
  if (area) {
    return `지금 가장 위험한 선택은 ${area.area_name} 제도를 더 정교하게 만드는 것만으로 문제를 해결하려는 접근입니다. 결과를 받아들일 리더십 언어와 적용 기준이 없으면, 구성원은 제도를 신뢰하기보다 방어적으로 대응할 수 있습니다.`;
  }
  return "지금 가장 위험한 선택은 제도 양식을 먼저 늘리는 것입니다. 대표와 리더가 같은 언어로 설명할 수 없는 제도는 개선보다 해석 비용을 더 키울 수 있습니다.";
}

function patternText(axis: AlignmentAxisOut | undefined, areas: AreaAnalysisOut[]): string {
  const names = topAreas(areas).map((area) => area.area_name).join(", ") || "핵심 영역";
  if (axis) {
    return `이 회사의 핵심 패턴은 '${axis.domain_name}' 한 영역의 문제가 아니라, 민감한 판단 순간에 명문화된 기준보다 개별 판단이 앞서는 구조입니다. 그래서 ${names}을 각각 따로 고치기보다, 어떤 기준을 공개적으로 말할 수 있는지부터 맞춰야 합니다.`;
  }
  return `이 회사의 핵심 패턴은 ${names}에서 동시에 나타납니다. 기준이 전혀 없는 것이 아니라, 중요한 순간에 기준이 일관된 언어로 설명되지 않는 것이 더 큰 비용입니다.`;
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
  const priorityAreas = topAreas(areas);
  const axis = topAxis(diagnosis.alignment_map?.axes ?? []);
  const primaryArea = priorityAreas[0];
  const headcount = responseToText(responses["L1-2"]);
  const companyName = exportData.companyName || "우리 회사";
  const alignmentLevel = diagnosis.alignment_map?.alignment_level ?? "정합성 확인 필요";

  return (
    <Document title={`${companyName} 진단 보고서`} author={exportData.brand}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>DIAGNOSTIC REPORT</Text>
        <Text style={styles.title}>{companyName} 인사제도 진단 보고서</Text>
        <Text style={styles.subtitle}>
          이 문서는 웹 결과 화면을 그대로 옮긴 자료가 아니라, 대표님이 리더십과 논의할 때 바로 사용할 수 있도록 핵심 해석과 의사결정 메모를 정리한 보고서입니다.
        </Text>
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
          <View style={[styles.metaItem, styles.lastCard]}>
            <Text style={styles.metaLabel}>정합성 상태</Text>
            <Text style={styles.metaValue}>{alignmentLevel}</Text>
          </View>
        </View>
        <View style={styles.mirrorBox}>
          <Text style={styles.mirrorTitle}>대표의 맹점</Text>
          <Text style={styles.mirrorText}>{blindSpotText(axis, primaryArea)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>진단 모드 해석</Text>
          <Text style={styles.body}>{modeCopy(mode)}</Text>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>조직 구간별 의미</Text>
            <Text style={styles.cardText}>{headcountCopy(headcount)}</Text>
          </View>
          <View style={[styles.card, styles.lastCard]}>
            <Text style={styles.cardLabel}>핵심 패턴</Text>
            <Text style={styles.cardText}>{patternText(axis, areas)}</Text>
          </View>
        </View>
        <View style={styles.memoBox}>
          <Text style={styles.memoTitle}>Decision Memo</Text>
          <Text style={styles.body}>{riskyMoveText(axis, primaryArea)}</Text>
        </View>
        <Footer page="1 / 2" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OPERATING SIGNALS</Text>
        <Text style={styles.title}>무엇을 먼저 확인해야 하는가</Text>
        <Text style={styles.subtitle}>
          아래 항목은 추천 순위가 아니라 대표님이 이번 분기 안에 리더들과 맞춰야 할 검토 방향입니다. 제도 도입 여부보다 먼저, 같은 기준을 같은 언어로 설명할 수 있는지를 확인합니다.
        </Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>우선 확인 영역</Text>
          {priorityAreas.map((area) => (
            <View key={area.area_id} style={styles.listItem}>
              <Text style={styles.listTitle}>{area.area_name}</Text>
              <Text style={styles.listText}>{area.status_text}</Text>
              <Text style={styles.listText}>{area.recommendation}</Text>
            </View>
          ))}
          {priorityAreas.length === 0 ? (
            <View style={styles.listItem}>
              <Text style={styles.listTitle}>추가 확인 필요</Text>
              <Text style={styles.listText}>아직 우선 영역을 특정할 만큼의 결과가 충분하지 않습니다.</Text>
            </View>
          ) : null}
        </View>
        {axis ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>가장 큰 해석 간격</Text>
            <Text style={styles.body}>{axis.headline}</Text>
            <View style={styles.axisTrack}>
              <View style={[styles.axisFill, { width: `${Math.max(8, Math.min(100, axis.alignment_percent))}%` }]} />
            </View>
            <Text style={styles.body}>
              대표님의 의도: {axis.philosophy_label} / 조직의 실제 해석: {axis.actual_label}
            </Text>
          </View>
        ) : null}
        <View style={styles.memoBox}>
          <Text style={styles.memoTitle}>이번 회의에서 결정할 질문</Text>
          <Text style={styles.body}>
            지금 바로 새 제도를 설계할지보다, 먼저 어떤 판단 기준을 공개적으로 말할 수 있는지 정해야 합니다. 기준을 말할 수 없는 영역은 이번 분기에는 정교화보다 관찰과 언어 정렬을 우선합니다.
          </Text>
        </View>
        <Footer page="2 / 2" />
      </Page>
    </Document>
  );
}
