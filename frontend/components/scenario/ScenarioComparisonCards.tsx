"use client";

interface ScenarioImpact {
  metric: string;
  after: string;
}

interface ScenarioFinancial {
  item: string;
  amount: string;
  note?: string;
}

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  impact?: ScenarioImpact[];
  financial_impact?: ScenarioFinancial[];
  warnings?: string[];
}

interface ScenarioComparisonCardsProps {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function impactText(scenario: Scenario): string {
  const impact = scenario.impact?.[0];
  if (!impact) return "핵심 효과 추가 확인";
  return `${impact.metric}: 현재 수준 대비 ${impact.after}`;
}

function financialText(scenario: Scenario): string {
  const financial = scenario.financial_impact?.[0];
  if (!financial) return "재무 영향 추가 확인";
  return `${financial.item}: ${financial.amount}${financial.note ? ` (${financial.note})` : ""}`;
}

export function ScenarioComparisonCards({ scenarios, selectedId, onSelect }: ScenarioComparisonCardsProps) {
  return (
    <section className="mb-4 grid gap-3 lg:grid-cols-3">
      {scenarios.map((scenario) => {
        const selected = selectedId === scenario.id;

        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            className={`rounded-[10px] border p-4 text-left transition-all ${
              selected
                ? "border-teal-line bg-teal-soft shadow-[inset_0_0_0_1px_rgba(47,143,134,0.18)]"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">{scenario.subtitle}</p>
                <h3 className="m-0 mt-2 text-[16px] font-[700] text-slate-900">{scenario.name}</h3>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[10px] font-[760] ${
                selected ? "border-teal-line bg-white text-teal-deep" : "border-slate-200 bg-slate-50 text-slate-500"
              }`}>
                {selected ? "선택함" : "비교"}
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              <p className="m-0 rounded-[8px] border border-teal-line bg-white/70 px-3 py-2 text-[12px] leading-[1.55] text-slate-700">
                <span className="font-[700] text-teal-deep">얻는 것</span>: {impactText(scenario)}
              </p>
              <p className="m-0 rounded-[8px] border border-[#f0d8cf] bg-white/70 px-3 py-2 text-[12px] leading-[1.55] text-slate-700">
                <span className="font-[700] text-coral">감수할 것</span>: {financialText(scenario)}
              </p>
              <p className="m-0 rounded-[8px] border border-amber/25 bg-white/70 px-3 py-2 text-[12px] leading-[1.55] text-slate-600">
                {scenario.warnings?.[0] ?? "운영 리스크를 상세에서 확인합니다."}
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
}
