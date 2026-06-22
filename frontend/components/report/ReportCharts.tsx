import type {
  BlindSpot,
  DecisionMemo,
  PriorityTension,
  ReportTone,
  StrategicOption,
  TensionGaugeModel,
} from "@/lib/report/buildDiagnosticReportViewModel";

function toneClass(tone: string): string {
  if (tone === "coral") return "border-[#e6b6a8] bg-[#fff7f4] text-[#8a4b3d]";
  if (tone === "amber") return "border-[#e5d3a6] bg-[#fffaf0] text-[#7b5d1f]";
  if (tone === "teal") return "border-[#b8d8d2] bg-[#f1fbf8] text-[#245f58]";
  return "border-slate-200 bg-slate-50 text-slate-650";
}

function barToneClass(value: number): string {
  if (value >= 78) return "bg-[#b95f4e]";
  if (value >= 62) return "bg-[#bd9145]";
  return "bg-[#4f8f84]";
}

export function TensionGauge({ gauge }: { gauge: TensionGaugeModel }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between text-[10px] font-[720] text-slate-500">
        <span>{gauge.leftLabel}</span>
        <span>{gauge.rightLabel}</span>
      </div>
      <div className="relative mt-3 h-2 rounded-full bg-gradient-to-r from-[#dfe8e6] via-[#e6d8b8] to-[#d9afa6]">
        <span
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#23423f] shadow-sm"
          style={{ left: `calc(${gauge.markerPercent}% - 8px)` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] leading-[1.45]">
        <div>
          <p className="m-0 font-[760] text-slate-400">철학</p>
          <p className="m-0 mt-1 text-slate-800">{gauge.philosophyLabel}</p>
        </div>
        <div className="text-center">
          <p className="m-0 font-[760] text-slate-400">간극</p>
          <p className="m-0 mt-1 text-slate-800">{gauge.percentLabel}</p>
        </div>
        <div className="text-right">
          <p className="m-0 font-[760] text-slate-400">실제 운영</p>
          <p className="m-0 mt-1 text-slate-800">{gauge.actualLabel}</p>
        </div>
      </div>
    </div>
  );
}

export function BlindSpotGrid({ blindSpots }: { blindSpots: BlindSpot[] }) {
  return (
    <div className="space-y-3">
      {blindSpots.map((spot, index) => (
        <section key={spot.id} className={`rounded-[8px] border px-4 py-3 ${toneClass(spot.warningLevel)}`}>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-[800]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="m-0 text-[13px] font-[760] leading-[1.45] text-slate-950">{spot.headline}</h3>
              <div className="mt-3 grid grid-cols-3 gap-3 text-[10px] leading-[1.55] text-slate-650">
                <div>
                  <p className="m-0 font-[760] text-slate-400">대표님의 의도</p>
                  <p className="m-0 mt-1">{spot.intent}</p>
                </div>
                <div>
                  <p className="m-0 font-[760] text-slate-400">조직의 해석</p>
                  <p className="m-0 mt-1">{spot.organizationInterpretation}</p>
                </div>
                <div>
                  <p className="m-0 font-[760] text-slate-400">조직 비용</p>
                  <p className="m-0 mt-1">{spot.operatingCost}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export function TensionChain({ tension }: { tension: PriorityTension }) {
  return (
    <div className="grid grid-cols-[1fr_220px] gap-5">
      <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="space-y-3">
          {tension.chain.map((item, index) => (
            <div key={`${item.label}-${index}`} className="relative flex gap-3">
              {index < tension.chain.length - 1 ? (
                <span className="absolute left-[13px] top-7 h-[calc(100%+4px)] w-px bg-slate-250" />
              ) : null}
              <span className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#23423f] text-[10px] font-[800] text-white">
                {index + 1}
              </span>
              <div className="pb-1">
                <p className="m-0 text-[11px] font-[760] text-[#4f8f84]">{item.label}</p>
                <p className="m-0 mt-1 text-[13px] font-[690] leading-[1.45] text-slate-950">{item.domainName}</p>
                <p className="m-0 mt-1 text-[11px] leading-[1.6] text-slate-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-[8px] border border-[#b8d8d2] bg-[#f1fbf8] p-3">
          <p className="m-0 text-[11px] font-[760] text-[#245f58]">먼저 손댈 것</p>
          <ul className="m-0 mt-2 space-y-1.5 p-0 text-[10px] leading-[1.55] text-slate-650">
            {tension.handleNow.map((item) => (
              <li key={item} className="list-none">• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[8px] border border-[#e5d3a6] bg-[#fffaf0] p-3">
          <p className="m-0 text-[11px] font-[760] text-[#7b5d1f]">아직 보류할 것</p>
          <ul className="m-0 mt-2 space-y-1.5 p-0 text-[10px] leading-[1.55] text-slate-650">
            {tension.holdOff.map((item) => (
              <li key={item} className="list-none">• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[9px] font-[720] text-slate-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${barToneClass(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function StrategicOptionsGrid({ options }: { options: StrategicOption[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => (
        <article key={option.id} className="rounded-[8px] border border-slate-200 bg-white p-3">
          <h3 className="m-0 text-[14px] font-[760] leading-[1.35] text-slate-950">{option.title}</h3>
          <div className="mt-3 space-y-2">
            <MetricBar label="얻는 것" value={option.indicators.gain} />
            <MetricBar label="부담" value={option.indicators.burden} />
            <MetricBar label="리더 부담" value={option.indicators.leadershipLoad} />
          </div>
          <dl className="mt-3 space-y-2 text-[9.5px] leading-[1.5]">
            <div>
              <dt className="font-[760] text-[#245f58]">얻는 것</dt>
              <dd className="m-0 mt-0.5 text-slate-650">{option.gain}</dd>
            </div>
            <div>
              <dt className="font-[760] text-[#7b5d1f]">감수할 것</dt>
              <dd className="m-0 mt-0.5 text-slate-650">{option.burden}</dd>
            </div>
            <div>
              <dt className="font-[760] text-slate-500">대표님께 요구되는 변화</dt>
              <dd className="m-0 mt-0.5 text-slate-650">{option.requiredChange}</dd>
            </div>
            <div>
              <dt className="font-[760] text-[#8a4b3d]">지금 위험한 실행</dt>
              <dd className="m-0 mt-0.5 text-slate-650">{option.riskyMove}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

export function DecisionMemoChecklist({ memo }: { memo: DecisionMemo }) {
  return (
    <div className="grid grid-cols-[1fr_240px] gap-4">
      <div className="grid grid-cols-2 gap-3">
        <MemoList title="이번 회의에서 합의해야 할 것" items={memo.decisions} tone="teal" />
        <MemoList title="아직 결정하지 않아도 되는 것" items={memo.defer} tone="slate" />
        <MemoList title="지금 하면 위험한 것" items={memo.riskyMoves} tone="coral" />
        <MemoList title="30일 안에 확인할 신호" items={memo.signals30Days} tone="amber" />
      </div>
      <aside className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
        <p className="m-0 text-[11px] font-[760] text-slate-500">회의 체크리스트</p>
        <div className="mt-3 space-y-2">
          {memo.checklist.map((item) => (
            <div key={item.label} className="flex gap-2 rounded-[7px] bg-white p-2 text-[10px] leading-[1.45] text-slate-650">
              <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.priority === "high" ? "bg-[#b95f4e]" : item.priority === "medium" ? "bg-[#bd9145]" : "bg-[#4f8f84]"}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function MemoList({ title, items, tone }: { title: string; items: string[]; tone: ReportTone }) {
  return (
    <section className={`rounded-[8px] border p-3 ${toneClass(tone)}`}>
      <p className="m-0 text-[11px] font-[760] text-slate-800">{title}</p>
      <ul className="m-0 mt-2 space-y-1.5 p-0 text-[10px] leading-[1.55] text-slate-650">
        {items.map((item) => (
          <li key={item} className="list-none">• {item}</li>
        ))}
      </ul>
    </section>
  );
}
