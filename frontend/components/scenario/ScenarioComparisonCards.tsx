"use client";

import { GlossaryText } from "@/components/shared/GlossaryText";

interface ScenarioImpact {
  metric: string;
  after: string;
}

interface ScenarioFinancial {
  item: string;
  amount: string;
  note?: string;
}

interface TradeoffSummary {
  gain: string;
  burden: string;
  talent_risk: string;
  decision_question: string;
}

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  impact?: ScenarioImpact[];
  financial_impact?: ScenarioFinancial[];
  tradeoff_summary?: TradeoffSummary;
  warnings?: string[];
}

interface ScenarioComparisonCardsProps {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function gainText(scenario: Scenario): string {
  if (scenario.tradeoff_summary?.gain) return scenario.tradeoff_summary.gain;
  const impact = scenario.impact?.[0];
  if (!impact) return "핵심 효과 추가 확인";
  return `${impact.metric}: 현재 수준 대비 ${impact.after}`;
}

function burdenText(scenario: Scenario): string {
  if (scenario.tradeoff_summary?.burden) return scenario.tradeoff_summary.burden;
  const warning = scenario.warnings?.[0];
  const financial = scenario.financial_impact?.[0];
  if (warning) return warning;
  if (!financial) return "운영 부담 추가 확인";
  return `${financial.item}: ${financial.amount}${financial.note ? ` (${financial.note})` : ""}`;
}

function talentRiskText(scenario: Scenario): string {
  if (scenario.tradeoff_summary?.talent_risk) return scenario.tradeoff_summary.talent_risk;
  return scenario.warnings?.[0] ?? "핵심 인재와 조직 수용성 리스크를 상세에서 확인합니다.";
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
            className={`rounded-[8px] border p-4 text-left transition-all ${
              selected
                ? "border-[#b8ded9] bg-white shadow-[0_0_0_3px_rgba(47,143,134,0.08),0_10px_24px_rgba(15,23,42,0.05)]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`m-0 text-[11px] font-[760] tracking-[0.08em] ${selected ? "text-[#4c7974]" : "text-slate-500"}`}>{scenario.subtitle}</p>
                <h3 className="m-0 mt-2 text-[16px] font-[720] text-slate-950">{scenario.name}</h3>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[10px] font-[760] ${
                selected ? "border-[#cfe7e2] bg-[#fbfefd] text-[#4c7974]" : "border-slate-200 bg-white text-slate-500"
              }`}>
                {selected ? "선택함" : "비교"}
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              <p className="m-0 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-[12px] leading-[1.55] text-slate-700">
                <span className="font-[700] text-[#4c7974]">얻는 것</span>: <GlossaryText text={gainText(scenario)} />
              </p>
              <p className="m-0 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-[12px] leading-[1.55] text-slate-700">
                <span className="font-[700] text-[#8a6259]">감당할 것</span>: <GlossaryText text={burdenText(scenario)} />
              </p>
              <p className="m-0 rounded-[8px] border border-[#eadfca] bg-white px-3 py-2 text-[12px] leading-[1.55] text-slate-700">
                <span className="font-[700] text-[#8a6b3b]">핵심 인재 리스크</span>: <GlossaryText text={talentRiskText(scenario)} />
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
}