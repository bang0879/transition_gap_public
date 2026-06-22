import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DiagnosticReportViewModel } from "@/lib/report/buildDiagnosticReportViewModel";
import {
  PdfBlindSpotGrid,
  PdfDecisionMemo,
  PdfStrategicOptions,
  PdfTensionChain,
  PdfTensionGauge,
} from "./ReportPdfCharts";
import { registerReportFonts } from "./registerReportFonts";

registerReportFonts();

const colors = {
  slate950: "#0f172a",
  slate650: "#475569",
  slate500: "#64748b",
  slate300: "#cbd5e1",
  slate100: "#f1f5f9",
  teal: "#4f8f84",
  tealDark: "#245f58",
  amber: "#bd9145",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingRight: 46,
    paddingBottom: 36,
    paddingLeft: 46,
    fontFamily: "Pretendard",
    color: colors.slate950,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.slate300,
    paddingBottom: 8,
    marginBottom: 28,
  },
  headerText: {
    fontSize: 7,
    color: colors.slate500,
    fontWeight: 700,
    letterSpacing: 0.8,
  },
  footer: {
    position: "absolute",
    left: 46,
    right: 46,
    bottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.slate300,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.slate500,
  },
  eyebrow: {
    fontSize: 8,
    color: colors.teal,
    fontWeight: 700,
    letterSpacing: 0.8,
  },
  h1: {
    marginTop: 48,
    fontSize: 33,
    lineHeight: 1.18,
    fontWeight: 700,
  },
  h2: {
    marginTop: 7,
    fontSize: 22,
    lineHeight: 1.25,
    fontWeight: 700,
  },
  lead: {
    marginTop: 10,
    fontSize: 9.5,
    lineHeight: 1.65,
    color: colors.slate650,
  },
  body: {
    fontSize: 9.2,
    lineHeight: 1.6,
    color: colors.slate650,
  },
  box: {
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    padding: 14,
  },
});

export function ReportPdfDocument({ report }: { report: DiagnosticReportViewModel }) {
  return (
    <Document title={report.cover.title} author="Transition Gap">
      <ReportPdfPage pageNumber={1} title="Cover">
        <Text style={styles.eyebrow}>TRANSITION GAP</Text>
        <Text style={styles.h1}>{report.cover.title}</Text>
        <Text style={{ marginTop: 12, fontSize: 12, color: colors.slate500, fontWeight: 700 }}>{report.cover.subtitle}</Text>
        <View style={{ marginTop: 86, borderLeftWidth: 4, borderLeftColor: colors.teal, paddingLeft: 16 }}>
          <Text style={{ fontSize: 20, lineHeight: 1.42, fontWeight: 700 }}>{report.cover.headline}</Text>
        </View>
        <View style={{ marginTop: 60, flexDirection: "row", gap: 10, borderTopWidth: 1, borderTopColor: colors.slate300, paddingTop: 16 }}>
          <Meta label="진단일" value={report.cover.completedDateLabel} />
          <Meta label="진단 모드" value={report.cover.diagnosisModeLabel} />
          <Meta label="조직 규모" value={report.cover.headcountLabel} />
          <Meta label="작성 기준" value={report.cover.basisLabel} />
        </View>
      </ReportPdfPage>

      <ReportPdfPage pageNumber={2} title="Executive Interpretation">
        <SectionTitle
          eyebrow="EXECUTIVE INTERPRETATION"
          title="진단 결과보다 먼저, 이 회사의 운영 패턴을 읽습니다."
          body={report.executive.headline}
        />
        <View style={{ marginTop: 24, flexDirection: "row", gap: 12 }}>
          <View style={[styles.box, { flex: 1 }]}>
            <Text style={{ fontSize: 13, fontWeight: 700 }}>이 회사의 핵심 패턴</Text>
            <Text style={[styles.body, { marginTop: 9 }]}>{report.executive.corePattern}</Text>
            <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: colors.slate300, paddingTop: 12, gap: 8 }}>
              <InterpretationLine label="대표님이 의도한 방향" body={report.executive.ceoIntent} />
              <InterpretationLine label="조직이 실제로 경험하는 방식" body={report.executive.organizationExperience} />
              <InterpretationLine label="따라서 지금의 전환 과제" body={report.executive.transitionTask} />
            </View>
          </View>
          <View style={[styles.box, { width: 160, backgroundColor: colors.slate100 }]}>
            <Text style={{ fontSize: 8, color: colors.slate500, fontWeight: 700 }}>KEY SIGNALS</Text>
            {report.executive.keySignals.map((signal) => (
              <View key={signal.label} style={{ marginTop: 9, backgroundColor: "#ffffff", borderRadius: 6, padding: 8 }}>
                <Text style={{ fontSize: 8.5, fontWeight: 700 }}>{signal.label}</Text>
                <Text style={{ marginTop: 3, fontSize: 7.6, lineHeight: 1.35, color: colors.slate650 }}>{signal.body}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ marginTop: 14 }}>
          <PdfTensionGauge gauge={report.executive.tensionGauge} />
        </View>
        <View style={{ marginTop: 14, borderWidth: 1, borderColor: "#e5d3a6", borderRadius: 8, backgroundColor: "#fff8e8", padding: 12 }}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: colors.amber }}>대표님이 과소평가하기 쉬운 비용</Text>
          <Text style={[styles.body, { marginTop: 6 }]}>{report.executive.underestimatedCost}</Text>
          <Text style={{ marginTop: 8, fontSize: 8.2, lineHeight: 1.45, color: colors.slate500 }}>{report.executive.stageInterpretation}</Text>
        </View>
      </ReportPdfPage>

      <ReportPdfPage pageNumber={3} title="CEO Blind Spots">
        <SectionTitle
          eyebrow="CEO BLIND SPOTS"
          title="대표님이 불편하지만 유용하게 보셔야 할 지점입니다."
          body="아래 내용은 점수 해석이 아니라, 현행 운영이 구성원에게 다르게 읽힐 수 있는 지점을 정리한 것입니다."
        />
        <View style={{ marginTop: 24 }}>
          <PdfBlindSpotGrid blindSpots={report.blindSpots} />
        </View>
      </ReportPdfPage>

      <ReportPdfPage pageNumber={4} title="Priority Tension">
        <SectionTitle
          eyebrow="PRIORITY TENSION"
          title={report.priorityTension.headline}
          body="우선순위 영역은 따로 떼어 고칠수록 실제 문제가 흐려질 수 있습니다. 함께 묶인 운영 부담을 먼저 보셔야 합니다."
        />
        <View style={{ marginTop: 24 }}>
          <PdfTensionChain tension={report.priorityTension} />
        </View>
      </ReportPdfPage>

      <ReportPdfPage pageNumber={5} title="Strategic Options">
        <SectionTitle
          eyebrow="STRATEGIC OPTIONS"
          title="아래 방향은 추천 순위가 아니라, 감수할 운영 비용의 비교입니다."
          body="방향을 고르는 순간 대표님께 요구되는 태도와 리더 운영 부담도 함께 달라집니다."
        />
        <View style={{ marginTop: 24 }}>
          <PdfStrategicOptions options={report.strategicOptions} />
        </View>
      </ReportPdfPage>

      <ReportPdfPage pageNumber={6} title="CEO Decision Memo">
        <SectionTitle
          eyebrow="CEO DECISION MEMO"
          title="이번 회의에서 합의할 것과 아직 미룰 것을 나눕니다."
          body="이 페이지는 실행 로드맵이 아니라, 대표님이 리더십 회의에서 바로 사용할 의사결정 메모입니다."
        />
        <View style={{ marginTop: 24 }}>
          <PdfDecisionMemo memo={report.decisionMemo} />
        </View>
      </ReportPdfPage>
    </Document>
  );
}

function ReportPdfPage({
  pageNumber,
  title,
  children,
}: {
  pageNumber: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <Text style={styles.headerText}>TRANSITION GAP DIAGNOSTIC REPORT</Text>
        <Text style={styles.headerText}>{String(pageNumber).padStart(2, "0")} / 06</Text>
      </View>
      {children}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{title}</Text>
      </View>
    </Page>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.h2}>{title}</Text>
      <Text style={styles.lead}>{body}</Text>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 7, color: colors.slate500, fontWeight: 700 }}>{label}</Text>
      <Text style={{ marginTop: 5, fontSize: 8.5, lineHeight: 1.35, color: colors.slate950 }}>{value}</Text>
    </View>
  );
}

function InterpretationLine({ label, body }: { label: string; body: string }) {
  return (
    <View>
      <Text style={{ fontSize: 8, color: colors.teal, fontWeight: 700 }}>{label}</Text>
      <Text style={{ marginTop: 3, fontSize: 8.5, lineHeight: 1.45, color: colors.slate650 }}>{body}</Text>
    </View>
  );
}
