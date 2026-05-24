interface ScenarioImpact {
  metric: string;
  after: string;
}

interface Scenario {
  id: string;
  name: string;
  impact?: ScenarioImpact[];
  financial_impact?: Array<{ item: string; amount: string; unit?: string; note?: string; rationale?: string }>;
  warnings?: string[];
}

interface ScenarioComparisonTableProps {
  scenarios: Scenario[];
  selectedId: string;
}

function financialText(scenario: Scenario): string {
  const item = scenario.financial_impact?.[0];
  if (!item) return "-";

  return `${item.item}: ${item.amount}${item.unit ? ` ${item.unit}` : ""}`;
}

function impactText(scenario: Scenario, index: number): string {
  const impact = scenario.impact?.[index];
  if (!impact) return "-";
  return `${impact.metric}: 현재 수준 대비 ${impact.after}`;
}

export function ScenarioComparisonTable({ scenarios, selectedId }: ScenarioComparisonTableProps) {
  const selected = scenarios.find((scenario) => scenario.id === selectedId) ?? scenarios[0];
  const criteria = ["핵심 효과", "재무 영향", "운영 리스크"];

  return (
    <div className="overflow-x-auto rounded-[10px] border border-slate-200 bg-white print:break-inside-avoid">
      {selected ? (
        <div className="border-b border-slate-100 bg-teal-soft px-4 py-3">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">현재 선택 기준</p>
          <p className="m-0 mt-1 text-[13px] font-[680] text-slate-900">{selected.name}</p>
          <p className="m-0 mt-1 text-[12px] leading-[1.55] text-slate-600">
            {impactText(selected, 0)} · {financialText(selected)}
          </p>
        </div>
      ) : null}
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-slate-50">
            <tr className="text-[11px] font-[760] tracking-[0.04em] text-slate-500">
            <th className="w-[150px] px-4 py-3">선택 기준</th>
            {scenarios.map((scenario) => (
              <th key={scenario.id} className={`px-4 py-3 ${selectedId === scenario.id ? "text-teal-deep" : ""}`}>{scenario.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map((criterion, rowIndex) => (
            <tr key={criterion} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3 text-[12px] font-[680] text-slate-800">{criterion}</td>
              {scenarios.map((scenario) => (
                <td key={scenario.id} className={`px-4 py-3 text-[12px] leading-[1.6] ${selectedId === scenario.id ? "bg-teal-soft text-slate-800" : "text-slate-600"}`}>
                  {rowIndex === 0
                    ? impactText(scenario, 0)
                    : rowIndex === 1
                      ? financialText(scenario)
                      : scenario.warnings?.[0] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
