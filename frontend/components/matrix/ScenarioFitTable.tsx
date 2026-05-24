"use client";

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  warnings?: string[];
  package?: Array<{ area: string; action: string; timeline: string }>;
}

interface ScenarioFitTableProps {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ScenarioFitTable({ scenarios, selectedId, onSelect }: ScenarioFitTableProps) {
  return (
    <div className="grid gap-3 print:break-inside-avoid">
      {scenarios.map((scenario) => {
        const selected = selectedId === scenario.id;
        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            className={`rounded-[10px] border p-4 text-left transition-all duration-300 ${
              selected
                ? "border-teal-line bg-teal-soft shadow-[inset_0_0_0_1px_rgba(47,143,134,0.22)]"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[13px] font-[680] text-slate-900">{scenario.name}</p>
                <p className="m-0 mt-1 text-[11px] text-slate-500">{scenario.subtitle}</p>
              </div>
              <span className={`mt-1 rounded-full border px-[8px] py-[3px] text-[11px] font-[680] ${
                selected ? "border-teal-line bg-white text-teal-deep" : "border-slate-200 bg-slate-50 text-slate-400"
              }`}>
                {selected ? "선택됨" : "선택"}
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-teal">얻는 것</p>
                <p className="m-0 mt-1 text-[12px] leading-[1.55] text-slate-600">{scenario.description}</p>
              </div>
              <div>
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-coral">감수할 것</p>
                <p className="m-0 mt-1 text-[12px] leading-[1.55] text-slate-500">{scenario.warnings?.[0] ?? "추가 검토 필요"}</p>
              </div>
            </div>
            {scenario.package?.[0] ? (
              <p className="m-0 mt-3 border-t border-slate-100 pt-3 text-[11px] leading-[1.55] text-slate-500">
                먼저 설계할 제도: <span className="font-[680] text-slate-700">{scenario.package[0].action}</span>
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
