import { Text, View } from "@react-pdf/renderer";
import type {
  BlindSpot,
  DecisionMemo,
  PriorityTension,
  StrategicOption,
  TensionGaugeModel,
} from "@/lib/report/buildDiagnosticReportViewModel";

const colors = {
  slate950: "#0f172a",
  slate650: "#475569",
  slate500: "#64748b",
  slate300: "#cbd5e1",
  slate100: "#f1f5f9",
  teal: "#4f8f84",
  tealDark: "#245f58",
  amber: "#bd9145",
  amberBg: "#fff8e8",
  coral: "#b95f4e",
  coralBg: "#fff1ed",
};

function barColor(value: number): string {
  if (value >= 78) return colors.coral;
  if (value >= 62) return colors.amber;
  return colors.teal;
}

export function PdfTensionGauge({ gauge }: { gauge: TensionGaugeModel }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.slate300, borderRadius: 8, padding: 12, backgroundColor: colors.slate100 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 8, color: colors.slate500, fontWeight: 700 }}>{gauge.leftLabel}</Text>
        <Text style={{ fontSize: 8, color: colors.slate500, fontWeight: 700 }}>{gauge.rightLabel}</Text>
      </View>
      <View style={{ marginTop: 10, height: 7, borderRadius: 4, backgroundColor: "#dbe6e4", position: "relative" }}>
        <View style={{ height: 7, width: `${gauge.markerPercent}%`, borderRadius: 4, backgroundColor: "#d8b06b" }} />
      </View>
      <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
        <GaugeLabel title="철학" body={gauge.philosophyLabel} />
        <GaugeLabel title="간극" body={gauge.percentLabel} />
        <GaugeLabel title="실제 운영" body={gauge.actualLabel} />
      </View>
    </View>
  );
}

function GaugeLabel({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 7, color: colors.slate500, fontWeight: 700 }}>{title}</Text>
      <Text style={{ marginTop: 3, fontSize: 9, color: colors.slate950, lineHeight: 1.35 }}>{body}</Text>
    </View>
  );
}

export function PdfBlindSpotGrid({ blindSpots }: { blindSpots: BlindSpot[] }) {
  return (
    <View style={{ gap: 9 }}>
      {blindSpots.map((spot, index) => (
        <View key={spot.id} style={{ borderWidth: 1, borderColor: colors.slate300, borderRadius: 8, padding: 11 }}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: colors.slate950 }}>
            {String(index + 1).padStart(2, "0")}. {spot.headline}
          </Text>
          <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
            <BlindSpotColumn title="대표님의 의도" body={spot.intent} />
            <BlindSpotColumn title="조직의 해석" body={spot.organizationInterpretation} />
            <BlindSpotColumn title="조직 비용" body={spot.operatingCost} />
          </View>
        </View>
      ))}
    </View>
  );
}

function BlindSpotColumn({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 7, fontWeight: 700, color: colors.tealDark }}>{title}</Text>
      <Text style={{ marginTop: 4, fontSize: 8, lineHeight: 1.45, color: colors.slate650 }}>{body}</Text>
    </View>
  );
}

export function PdfTensionChain({ tension }: { tension: PriorityTension }) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ flex: 1, borderWidth: 1, borderColor: colors.slate300, borderRadius: 8, padding: 12, backgroundColor: colors.slate100 }}>
        {tension.chain.map((item, index) => (
          <View key={`${item.label}-${index}`} style={{ flexDirection: "row", gap: 8, marginBottom: index === tension.chain.length - 1 ? 0 : 10 }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.tealDark, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#ffffff", fontSize: 8, fontWeight: 700 }}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, color: colors.teal, fontWeight: 700 }}>{item.label}</Text>
              <Text style={{ marginTop: 2, fontSize: 10, color: colors.slate950, fontWeight: 700 }}>{item.domainName}</Text>
              <Text style={{ marginTop: 3, fontSize: 8.5, lineHeight: 1.45, color: colors.slate650 }}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{ width: 155, gap: 9 }}>
        <SmallList title="먼저 손댈 것" items={tension.handleNow} color={colors.tealDark} />
        <SmallList title="아직 보류할 것" items={tension.holdOff} color={colors.amber} />
      </View>
    </View>
  );
}

function SmallList({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.slate300, borderRadius: 8, padding: 10 }}>
      <Text style={{ fontSize: 8, fontWeight: 700, color }}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={{ marginTop: 5, fontSize: 7.8, lineHeight: 1.35, color: colors.slate650 }}>• {item}</Text>
      ))}
    </View>
  );
}

export function PdfStrategicOptions({ options }: { options: StrategicOption[] }) {
  return (
    <View style={{ flexDirection: "row", gap: 9 }}>
      {options.map((option) => (
        <View key={option.id} style={{ flex: 1, borderWidth: 1, borderColor: colors.slate300, borderRadius: 8, padding: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: colors.slate950 }}>{option.title}</Text>
          <View style={{ marginTop: 9, gap: 5 }}>
            <MetricBar label="얻는 것" value={option.indicators.gain} />
            <MetricBar label="부담" value={option.indicators.burden} />
            <MetricBar label="리더 부담" value={option.indicators.leadershipLoad} />
          </View>
          <OptionLine title="얻는 것" body={option.gain} color={colors.tealDark} />
          <OptionLine title="감수할 것" body={option.burden} color={colors.amber} />
          <OptionLine title="대표님께 요구되는 변화" body={option.requiredChange} color={colors.slate500} />
          <OptionLine title="지금 위험한 실행" body={option.riskyMove} color={colors.coral} />
        </View>
      ))}
    </View>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 7, color: colors.slate500 }}>{label}</Text>
        <Text style={{ fontSize: 7, color: colors.slate500 }}>{value}</Text>
      </View>
      <View style={{ marginTop: 2, height: 4, borderRadius: 2, backgroundColor: colors.slate100 }}>
        <View style={{ width: `${value}%`, height: 4, borderRadius: 2, backgroundColor: barColor(value) }} />
      </View>
    </View>
  );
}

function OptionLine({ title, body, color }: { title: string; body: string; color: string }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 7.5, fontWeight: 700, color }}>{title}</Text>
      <Text style={{ marginTop: 2, fontSize: 8, lineHeight: 1.35, color: colors.slate650 }}>{body}</Text>
    </View>
  );
}

export function PdfDecisionMemo({ memo }: { memo: DecisionMemo }) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <View style={{ flex: 1, gap: 9 }}>
        <View style={{ flexDirection: "row", gap: 9 }}>
          <MemoList title="이번 회의에서 합의해야 할 것" items={memo.decisions} color={colors.tealDark} />
          <MemoList title="아직 결정하지 않아도 되는 것" items={memo.defer} color={colors.slate500} />
        </View>
        <View style={{ flexDirection: "row", gap: 9 }}>
          <MemoList title="지금 하면 위험한 것" items={memo.riskyMoves} color={colors.coral} />
          <MemoList title="30일 안에 확인할 신호" items={memo.signals30Days} color={colors.amber} />
        </View>
      </View>
      <View style={{ width: 150, borderWidth: 1, borderColor: colors.slate300, borderRadius: 8, padding: 10, backgroundColor: colors.slate100 }}>
        <Text style={{ fontSize: 9, fontWeight: 700, color: colors.slate950 }}>회의 체크리스트</Text>
        {memo.checklist.map((item) => (
          <Text key={item.label} style={{ marginTop: 8, fontSize: 8, lineHeight: 1.4, color: colors.slate650 }}>□ {item.label}</Text>
        ))}
      </View>
    </View>
  );
}

function MemoList({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: colors.slate300, borderRadius: 8, padding: 10 }}>
      <Text style={{ fontSize: 8.5, fontWeight: 700, color }}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={{ marginTop: 5, fontSize: 7.8, lineHeight: 1.35, color: colors.slate650 }}>• {item}</Text>
      ))}
    </View>
  );
}
