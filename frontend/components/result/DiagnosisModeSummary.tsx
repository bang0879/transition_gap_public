import { Badge } from "@/components/shared/Badge";
import type { DiagnosisMode, DiagnosisSignalOut } from "@/lib/types/api";

interface DiagnosisModeSummaryProps {
  mode: DiagnosisMode;
  companyName?: string | null;
  headcount?: string;
  foundationSignals: DiagnosisSignalOut[];
  alignmentSignals: DiagnosisSignalOut[];
}

const MODE_COPY: Record<
  Exclude<DiagnosisMode, "alignment">,
  {
    label: string;
    badge: string;
    title: string;
    body: string;
    risk: string;
    variant: "amber" | "coral";
  }
> = {
  foundation: {
    label: "Foundation Gap",
    badge: "운영 기준 먼저",
    title: "운영 기준이 아직 만들어지지 않은 것이 더 큰 리스크입니다.",
    body: "지금은 제도 간 정합성을 비교하기보다, 보상 기준·평가 루프·리더 운영 중 비어 있는 기준을 먼저 확인해야 합니다.",
    risk: "이 상태로 다음 성장 구간을 넘기면 보상 형평성, 평가 수용성, 리더별 운영 편차가 6~12개월 안에 동시에 커질 수 있습니다.",
    variant: "coral",
  },
  hybrid: {
    label: "Hybrid Gap",
    badge: "기준 부재 + 정합성 충돌",
    title: "없는 기준과 어긋난 기준이 동시에 있습니다.",
    body: "일부 영역은 기준 자체가 비어 있고, 일부 제도는 이미 서로 다른 메시지를 보내고 있습니다. 먼저 순서를 나눠야 합니다.",
    risk: "새 제도를 한꺼번에 늘리면 보상, 평가, 리더 운영이 서로 다른 속도로 움직이며 현장 혼선이 더 커질 수 있습니다.",
    variant: "amber",
  },
};

function signalTone(signal: DiagnosisSignalOut): "amber" | "coral" | "slate" {
  if (signal.severity === "high") return "coral";
  if (signal.severity === "medium") return "amber";
  return "slate";
}

function signalDomains(signals: DiagnosisSignalOut[]): string {
  const domains = Array.from(new Set(signals.map((signal) => signal.domain_name))).filter(Boolean);
  if (domains.length === 0) return "핵심 운영";
  return domains.slice(0, 3).join(", ");
}

export function DiagnosisModeSummary({
  mode,
  companyName,
  headcount,
  foundationSignals,
  alignmentSignals,
}: DiagnosisModeSummaryProps) {
  if (mode === "alignment") return null;

  const copy = MODE_COPY[mode];
  const subject = companyName || "우리 회사";
  const headcountText = headcount ? `${headcount} 규모에서` : "현재 규모에서";
  const topFoundationSignals = foundationSignals.slice(0, 3);
  const topAlignmentSignals = alignmentSignals.slice(0, 2);

  return (
    <section className="mb-4 rounded-[12px] border border-coral/25 bg-[#fff7f4] p-5 shadow-soft print:break-inside-avoid">
      <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-stretch">
        <div className="rounded-[10px] border border-coral/20 bg-white px-4 py-3">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-coral">진단 핵심 요약</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={copy.variant}>{copy.label}</Badge>
            <Badge variant="slate">{copy.badge}</Badge>
          </div>
          <p className="m-0 mt-4 text-[13px] font-[700] leading-[1.55] text-slate-800">
            {subject}은(는) {headcountText} {signalDomains(foundationSignals)} 기준을 먼저 봐야 합니다.
          </p>
          <div className="mt-3 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="m-0 text-[11px] font-[760] text-slate-400">확인된 기준 부재</p>
            <strong className="mt-1 block text-[28px] font-[760] leading-none text-slate-900">
              {foundationSignals.length}
              <span className="ml-1 text-[14px] font-[700] text-slate-500">개</span>
            </strong>
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">대표가 먼저 볼 결론</p>
            <h2 className="m-0 mt-1 text-[20px] font-[760] leading-[1.35] text-slate-900">{copy.title}</h2>
            <p className="m-0 mt-2 text-[13px] leading-[1.7] text-slate-600">{copy.body}</p>
          </div>

          <p className="m-0 rounded-[9px] border border-coral/20 bg-white px-3 py-2 text-[12px] leading-[1.65] text-slate-700">
            <span className="font-[760] text-coral">이 상태가 유지되면: </span>
            {copy.risk}
          </p>

          {topFoundationSignals.length > 0 ? (
            <div className="grid gap-2 lg:grid-cols-3">
              {topFoundationSignals.map((signal) => (
                <article key={signal.id} className="rounded-[8px] border border-slate-200 bg-white px-3 py-2">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={signalTone(signal)}>{signal.domain_name}</Badge>
                  </div>
                  <h3 className="m-0 text-[12px] font-[720] leading-[1.45] text-slate-900">{signal.title}</h3>
                  <p className="m-0 mt-1 text-[11px] leading-[1.55] text-slate-500">{signal.detail}</p>
                </article>
              ))}
            </div>
          ) : null}

          {mode === "hybrid" && topAlignmentSignals.length > 0 ? (
            <p className="m-0 rounded-[8px] border border-amber/25 bg-white px-3 py-2 text-[12px] leading-[1.6] text-slate-600">
              <span className="font-[760] text-amber">같이 봐야 할 엇박자: </span>
              {topAlignmentSignals.map((signal) => signal.title).join(" / ")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
