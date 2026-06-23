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
    paddingTop: 44,
    paddingHorizontal: 44,
    paddingBottom: 38,
    fontFamily: "Pretendard",
    color: "#172033",
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
    color: "#5a6475",
    marginBottom: 16,
  },
  heroStatement: {
    borderWidth: 1,
    borderColor: "#b8d9d5",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#f4fbfa",
    marginTop: 12,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 8.8,
    fontWeight: 700,
    color: "#2d8b83",
    marginBottom: 8,
  },
  heroText: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.42,
    color: "#172033",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  statementCard: {
    borderWidth: 1,
    borderColor: "#b8d9d5",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#f4fbfa",
    marginBottom: 12,
  },
  contentCard: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 1,
    borderColor: "#dfe6ee",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fbfcfd",
  },
  cautionCard: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 1,
    borderColor: "#ecd8ad",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fffaf0",
  },
  noteCard: {
    borderWidth: 1,
    borderColor: "#ecd8ad",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fffaf0",
    marginTop: 14,
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
  body: {
    fontSize: 9.7,
    lineHeight: 1.62,
    color: "#3c4658",
  },
  smallBody: {
    fontSize: 8.9,
    lineHeight: 1.58,
    color: "#4f5a6c",
  },
  sectionTitle: {
    fontSize: 12.3,
    fontWeight: 700,
    color: "#172033",
    marginTop: 12,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e4e9ef",
    marginVertical: 12,
  },
  axisLine: {
    borderWidth: 1,
    borderColor: "#dfe6ee",
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
  footer: {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.8,
    color: "#8a94a6",
  },
});

const PLACEHOLDER_COMPANY_NAMES = new Set(["", "ㅁㄴㅇ", "테스트", "test", "Test", "우리 회사"]);

function normalizeCompanyName(value: string): string {
  const trimmed = value.trim();
  return PLACEHOLDER_COMPANY_NAMES.has(trimmed) ? "진단 보고서" : trimmed;
}

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
  return `대표님은 ${axis.domain_name}에서 ${axis.philosophy_label}에 가까운 운영을 의도하고 있습니다. 그러나 그 의도가 리더의 설명과 반복 행동으로 충분히 번역되지 않았습니다.`;
}

function interpretationText(axis: AlignmentAxisOut | undefined): string {
  if (!axis) {
    return "구성원은 대표의 의도보다 실제로 반복되는 예외, 설명 방식, 리더별 판단 차이를 더 강한 신호로 받아들입니다.";
  }
  return `조직은 같은 장면을 ${axis.actual_label}에 가까운 메시지로 받아들일 수 있습니다. 대표가 의도한 배려가 구성원에게는 기준의 불투명성으로 읽힐 여지가 있습니다.`;
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

function dangerText(axis: AlignmentAxisOut | undefined, areaName: string): string {
  if (axis?.business_risk) return axis.business_risk;
  return `지금 가장 위험한 선택은 ${areaName} 제도를 더 정교하게 만드는 것만으로 문제를 해결하려는 접근입니다. 결과를 받아들일 리더십 언어와 적용 기준이 없으면 구성원은 제도를 신뢰하기보다 방어적으로 대응할 수 있습니다.`;
}

function reviewDirections(mode: DiagnosisMode | undefined, areaName: string) {
  if (mode === "foundation") {
    return [
      { title: "기준을 세 문장으로 줄이기", body: `${areaName}에서 대표가 실제로 쓰는 판단 기준을 세 문장으로 적습니다. 아직 큰 제도보다 설명 가능한 기준이 먼저입니다.` },
      { title: "리더가 같은 말로 설명하기", body: "대표가 직접 설명하던 내용을 리더가 같은 문장으로 말할 수 있는지 확인합니다. 여기서 막히면 제도는 현장에서 다르게 번역됩니다." },
      { title: "큰 제도는 잠시 보류하기", body: "평가와 보상을 한 번에 정교화하기보다, 반복되는 판단 장면에서 어떤 예외가 생기는지 먼저 봅니다." },
    ];
  }
  if (mode === "hybrid") {
    return [
      { title: "유연하게 둘 것과 고정할 것 나누기", body: "모든 것을 규정화하지 않습니다. 계속 유연하게 둘 예외와 반드시 고정할 기준을 분리합니다." },
      { title: "성과 차이를 말할 준비부터 보기", body: "성과 차이를 보상이나 평가와 연결하기 전, 리더가 그 차이를 납득 가능한 언어로 설명할 수 있는지 확인합니다." },
      { title: "새 제도보다 반복 설명 줄이기", body: "회의, 1:1, 보상 설명에서 같은 기준이 반복되는지 먼저 봅니다. 반복되지 않으면 제도만 늘어납니다." },
    ];
  }
  return [
    { title: "리더별 판단 차이 줄이기", body: "같은 사안에 다른 설명이 붙는 영역을 먼저 줄입니다. 구성원은 제도보다 리더의 말이 달라지는 지점을 더 강하게 기억합니다." },
    { title: "불편한 기준을 어디까지 말할지 정하기", body: "보상, 평가, 핵심 역할 판단처럼 불편한 기준을 어디까지 공개적으로 말할 수 있는지 합의합니다." },
    { title: "확장 전에 수용 신호 보기", body: "제도 도입보다 구성원이 설명을 받아들이는지, 리더가 같은 기준을 반복하는지 먼저 봅니다." },
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

  return (
    <Document title={`${companyName} 진단 해석 메모`} author={exportData.brand}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>DIAGNOSTIC INTERPRETATION MEMO</Text>
        <Text style={styles.title}>{companyName}</Text>
        <Text style={styles.subtitle}>대표가 리더십 미팅에 들고 가는 진단 해석 메모</Text>
        <View style={styles.heroStatement}>
          <Text style={styles.heroLabel}>대표가 먼저 봐야 할 문장</Text>
          <Text style={styles.heroText}>{mirrorSentence()}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.contentCard}>
            <Text style={styles.cardLabel}>이 문서의 역할</Text>
            <Text style={styles.body}>이 문서는 진단 결과지가 아닙니다. 대표님이 공동창업자, 이사회, 리더에게 보여주며 다음 회의의 판단 기준을 맞추기 위한 해석 메모입니다.</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.cardLabel}>현재 읽어야 할 구간</Text>
            <Text style={styles.cardTitle}>{modeNoun(mode)}</Text>
            <Text style={styles.body}>{headcountMeaning(headcount)}</Text>
          </View>
        </View>
        <Footer page="1 / 5" decision="이 페이지에서 다룰 결정: 우리가 어떤 문장으로 문제를 볼 것인가" />
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
        <Footer page="2 / 5" decision="이 페이지에서 다룰 결정: 대표 의도와 조직 해석의 차이를 인정할 것인가" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>TENSION</Text>
        <Text style={styles.pageTitle}>어디가 가장 먼저 흔들리는가</Text>
        <Text style={styles.subtitle}>이 페이지는 영역별 점검표가 아닙니다. 리더십 미팅에서 먼저 다뤄야 할 긴장 지점을 해석 언어로 정리합니다.</Text>
        <View style={styles.statementCard}>
          <Text style={styles.cardLabel}>가장 먼저 흔들리는 지점</Text>
          <Text style={styles.heroText}>{tensionSentence(primaryArea, axis)}</Text>
        </View>
        <View style={styles.row}>
          {priorityAreas.slice(0, 3).map((area) => (
            <View key={area.area_id} style={styles.contentCard}>
              <Text style={styles.cardLabel}>{area.area_name}</Text>
              <Text style={styles.body}>{tensionSentence(area, axis)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.axisLine}>
          <Text style={styles.cardLabel}>대표 의도 ─ 조직 해석</Text>
          <Text style={styles.body}>대표가 말한 방향과 조직이 실제로 경험한 방향 사이에 간격이 있습니다. 지금 필요한 것은 새 양식이 아니라, 같은 판단을 같은 문장으로 설명하는 힘입니다.</Text>
          <View style={styles.axisLabels}>
            <Text style={styles.smallBody}>대표가 의도한 기준</Text>
            <Text style={styles.smallBody}>조직이 받아들이는 메시지</Text>
          </View>
        </View>
        <Footer page="3 / 5" decision="이 페이지에서 다룰 결정: 먼저 흔들리는 영역을 어디로 볼 것인가" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OPTIONS</Text>
        <Text style={styles.pageTitle}>추천이 아니라 검토 방향입니다</Text>
        <Text style={styles.subtitle}>아래 세 가지는 순위가 아닙니다. 지금 회사의 리더십 수용성, 설명 부담, 공개 가능한 기준 수준을 놓고 선택할 수 있는 검토 방향입니다.</Text>
        <View style={styles.row}>
          {directions.map((item) => (
            <View key={item.title} style={styles.contentCard}>
              <Text style={styles.cardLabel}>검토 방향</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <View style={styles.statementCard}>
            <Text style={styles.cardLabel}>대표에게 요구되는 변화</Text>
            <Text style={styles.body}>대표님이 혼자 알고 있던 판단 기준을 리더가 반복해서 설명할 수 있는 문장으로 내려야 합니다. 제도보다 먼저 대표의 판단 언어가 조직 언어로 바뀌어야 합니다.</Text>
          </View>
          <View style={styles.cautionCard}>
            <Text style={styles.cardLabel}>지금 하면 위험한 실행</Text>
            <Text style={styles.body}>{dangerText(axis, primaryAreaName)}</Text>
          </View>
        </View>
        <Footer page="4 / 5" decision="이 페이지에서 다룰 결정: 무엇을 고치고 무엇을 보류할 것인가" />
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
        <View style={styles.noteCard}>
          <Text style={styles.cardLabel}>이번 회의에서 던질 질문</Text>
          <Text style={styles.heroText}>기준을 말할 수 있는 영역과 아직 말할 수 없는 영역을 어디서 나눌 것인가?</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.body}>대표가 불편하게 읽어야 하는 지점은 제도 미비가 아니라 기준을 공개적으로 다루는 부담입니다. 이 부담을 감당할 언어가 생길 때, 제도 개선은 내부 정치가 아니라 운영 수준 향상으로 읽힙니다.</Text>
        <Footer page="5 / 5" decision="이 페이지에서 다룰 결정: 이번 회의의 합의문을 무엇으로 남길 것인가" />
      </Page>
    </Document>
  );
}