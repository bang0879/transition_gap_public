import { Badge } from "@/components/shared/Badge";
import type { DiagnosisMode, DiagnosisSignalOut } from "@/lib/types/api";

type Tone = "teal" | "amber" | "coral" | "slate";

interface ExecutiveSummaryPanelProps {
  mode: DiagnosisMode;
  companyName?: string | null;
  headcount?: string;
  alignmentScore: number;
  alignmentLevel: string;
  scoreTone: Tone;
  focusTitle: string;
  focusMeta: string;
  insight: string;
  risk?: string | null;
  topGapAreaName: string;
  topGapText: string;
  topicCount: number;
  visibilityScore: number;
  visibilityLabel: string;
  visibilityTone: Tone;
  foundationSignals: DiagnosisSignalOut[];
  alignmentSignals: DiagnosisSignalOut[];
}

const MODE_LABEL: Record<DiagnosisMode, string> = {
  alignment: "정합성 판단",
  foundation: "운영 기준 우선",
  hybrid: "선택 조건 + 정합성 신호",
};

function hasFinalConsonant(value: string): boolean {
  const last = value.trim().charCodeAt(value.trim().length - 1);
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
}

function topicParticle(value: string): "은" | "는" {
  return hasFinalConsonant(value) ? "은" : "는";
}

function signalDomains(signals: DiagnosisSignalOut[]): string {
  const domains = Array.from(new Set(signals.map((signal) => signal.domain_name))).filter(Boolean);
  if (domains.length === 0) return "핵심 운영";
  return domains.slice(0, 3).join(", ");
}

function modeSubtext(
  mode: DiagnosisMode,
  headcount: string | undefined,
  foundationSignals: DiagnosisSignalOut[],
  alignmentSignals: DiagnosisSignalOut[],
): string {
  if (mode === "foundation") {
    const headcountText = headcount ? `${headcount} 규모에서` : "현재 규모에서";
    return `${headcountText} ${signalDomains(foundationSignals)}의 현재 선택이 언제까지 유효한지 확인합니다.`;
  }

  if (mode === "hybrid") {
    const foundationText = foundationSignals.length > 0 ? `${foundationSignals.length}개 기준 부재` : "기준 부재";
    const alignmentText = alignmentSignals.length > 0 ? `${alignmentSignals.length}개 정합성 신호` : "정합성 신호";
    return `${foundationText}와 ${alignmentText}를 분리해 유지할 선택과 정할 기준을 나눕니다.`;
  }

  return "제도를 더 추가하기보다, 현재 선택이 구성원에게 어떤 메시지로 읽히는지 확인합니다.";
}

export function ExecutiveSummaryPanel({
  mode,
  companyName,
  headcount,
  alignmentScore,
  alignmentLevel,
  scoreTone,
  focusTitle,
  focusMeta,
  insight,
  risk,
  topGapAreaName,
  topGapText,
  topicCount,
  visibilityScore,
  visibilityLabel,
  visibilityTone,
  foundationSignals,
  alignmentSignals,
}: ExecutiveSummaryPanelProps) {
  const subject = companyName || "우리 회사";
  const facts = [
    {
      label: "먼저 볼 영역",
      value: topGapAreaName,
      body: topGapText,
    },
    {
      label: "논의 범위",
      value: topicCount > 0 ? `${topicCount}개 영역` : "추가 확인",
      body: "현재 선택과 다음 기준 사이의 차이가 큰 순서입니다.",
    },
    {
      label: "데이터 가시성",
      value: `${Math.round(visibilityScore)}%`,
      body: visibilityLabel,
      tone: visibilityTone,
    },
  ];

  return (
    <section className="mb-6 overflow-hidden rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-[780] tracking-[0.08em] text-slate-500">경영진용 요약</span>
            <Badge variant="slate">{MODE_LABEL[mode]}</Badge>
          </div>
          <h2 className="m-0 mt-3 max-w-[780px] text-[24px] font-[720] leading-[1.32] text-slate-950">
            {focusTitle}
          </h2>
          <p className="m-0 mt-3 max-w-[760px] text-[14px] leading-[1.75] text-slate-600">
            <strong className="font-[720] text-slate-900">{subject}</strong>{topicParticle(subject)} {modeSubtext(mode, headcount, foundationSignals, alignmentSignals)}
          </p>
          <p className="m-0 mt-4 max-w-[800px] text-[13px] font-[620] leading-[1.75] text-slate-800">
            {insight}
          </p>
          {risk ? (
            <div className="mt-5 border-l border-slate-300 pl-4">
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">이 선택을 유지한다면</p>
              <p className="m-0 mt-1 text-[13px] leading-[1.7] text-slate-600">{risk}</p>
            </div>
          ) : null}
        </div>

        <aside className="border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">정합성 지수</p>
          <div className="mt-4 flex items-end gap-2">
            <strong className="text-[52px] font-[760] leading-[0.9] text-slate-950">{Math.round(alignmentScore)}</strong>
            <span className="pb-1 text-[17px] font-[700] text-slate-500">%</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant={scoreTone}>{alignmentLevel}</Badge>
            <span className="text-[12px] font-[680] text-slate-500">{focusMeta}</span>
          </div>
        </aside>
      </div>

      <div className="grid border-t border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
        {facts.map((fact) => (
          <div key={fact.label} className="border-b border-slate-200 px-5 py-4 last:border-b-0 sm:border-b-0">
            <div className="flex items-center gap-2">
              {"tone" in fact ? (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    fact.tone === "coral" ? "bg-coral" : fact.tone === "amber" ? "bg-amber" : fact.tone === "teal" ? "bg-teal" : "bg-slate-300"
                  }`}
                  aria-hidden="true"
                />
              ) : null}
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">{fact.label}</p>
            </div>
            <strong className="mt-2 block text-[15px] font-[720] leading-[1.4] text-slate-900">{fact.value}</strong>
            <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-500">{fact.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
