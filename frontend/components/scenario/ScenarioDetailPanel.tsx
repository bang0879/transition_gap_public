import { useEffect, useState } from "react";
import { GlossaryText } from "@/components/shared/GlossaryText";
import { PackageDecisionCard } from "./PackageDecisionCard";

interface ScenarioImpact {
  metric: string;
  after: string;
  direction?: string;
}

interface FinancialImpact {
  item: string;
  amount: string;
  note?: string;
  rationale?: string;
  color_intent?: string;
}

interface ScenarioPackageItem {
  area: string;
  action: string;
  timeline: string;
}

interface ScenarioDetail {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  philosophy?: string;
  impact?: ScenarioImpact[];
  financial_impact?: FinancialImpact[];
  package?: ScenarioPackageItem[];
  warnings?: string[];
}

interface ScenarioDetailPanelProps {
  scenario: ScenarioDetail;
}

type PackageDecision = "도입" | "보류" | "대체 검토";

const OPERATING_IMAGE: Record<string, { label: string; body: string }> = {
  performance: {
    label: "Netflix식 고성과, 고책임 운영 이미지",
    body: "평가 신뢰를 전제로 성과 차등과 보상 메시지를 강하게 연결합니다.",
  },
  community: {
    label: "Google식 심리적 안전감, 협업 운영 이미지",
    body: "정기 1:1 면담, 온보딩, 팀 단위 보상을 통해 이탈과 불안을 먼저 낮춥니다.",
  },
  elite: {
    label: "초기 토스식 소수정예, 빠른 실행 이미지",
    body: "핵심 인재군에 보상과 권한을 집중하고, 내부 형평성 비용을 의식적으로 감수합니다.",
  },
};

const REVIEW_PERSPECTIVE: Record<string, string> = {
  performance: "성과 차등과 핵심 인재 보상 메시지를 선명하게 만들어야 할 때 검토할 방향입니다. 단, 평가 기준의 수용성이 먼저 확보되어야 실행 속도가 납니다.",
  community: "이탈, 온보딩, 리더-구성원 신뢰 회복이 우선일 때 검토할 방향입니다. 보상 차등보다 운영 안정성과 수용성을 먼저 회복하는 선택지입니다.",
  elite: "핵심 인재의 생산성과 의사결정 속도를 높이는 것이 가장 중요한 국면에서 검토할 방향입니다. 내부 형평성 메시지와 리스크 관리가 함께 필요합니다.",
};

function detailedGain(scenario: ScenarioDetail): string {
  const impacts = scenario.impact?.slice(0, 3) ?? [];
  if (impacts.length === 0) return scenario.description;
  return impacts
    .map((impact) => `${impact.metric} ${impact.after}`)
    .join(", ");
}

function detailedCost(scenario: ScenarioDetail): string {
  const financial = scenario.financial_impact?.[0];
  const warning = scenario.warnings?.[0];
  if (financial && warning) return `${financial.item} ${financial.amount}. ${warning}`;
  if (financial) return `${financial.item}: ${financial.amount}${financial.note ? ` (${financial.note})` : ""}`;
  return scenario.warnings?.[0] ?? "운영 리스크를 추가 검토해야 합니다.";
}

function financialTone(colorIntent?: string): string {
  if (colorIntent === "positive") return "text-teal-deep";
  if (colorIntent === "negative") return "text-coral";
  return "text-slate-800";
}

export function ScenarioDetailPanel({ scenario }: ScenarioDetailPanelProps) {
  const mainFinancial = scenario.financial_impact?.slice(0, 3) ?? [];
  const mainImpacts = scenario.impact?.slice(0, 3) ?? [];
  const mainPackages = scenario.package?.slice(0, 4) ?? [];
  const operatingImage = OPERATING_IMAGE[scenario.id];
  const [decisions, setDecisions] = useState<Record<string, PackageDecision>>({});

  useEffect(() => {
    setDecisions({});
  }, [scenario.id]);

  const setPackageDecision = (key: string, decision: PackageDecision) => {
    setDecisions((current) => ({ ...current, [key]: decision }));
  };

  return (
    <section className="mb-4 rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">선택한 시나리오 상세</p>
          <h3 className="m-0 mt-2 text-[18px] font-[690] text-slate-900">{scenario.name}</h3>
          <p className="m-0 mt-2 max-w-[760px] text-[12px] leading-[1.7] text-slate-600">
            <GlossaryText text={scenario.philosophy ?? scenario.description} />
          </p>
        </div>
        <span className="w-fit rounded-full border border-teal-line bg-teal-soft px-[9px] py-[4px] text-[11px] font-[680] text-teal-deep">
          {scenario.subtitle}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 rounded-[10px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">선택한 시나리오 요약</p>
          <p className="m-0 mt-2 text-[13px] font-[690] leading-[1.5] text-slate-900">
            <GlossaryText text={scenario.description} />
          </p>
        </div>
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-amber">검토 관점</p>
          <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-700">
            <GlossaryText text={REVIEW_PERSPECTIVE[scenario.id] ?? scenario.description} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-[10px] border border-teal-line bg-teal-soft p-4">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">얻는 것</p>
          <p className="m-0 mt-2 text-[13px] font-[650] leading-[1.65] text-slate-800">
            <GlossaryText text={detailedGain(scenario)} />
          </p>
        </div>
        <div className="rounded-[10px] border border-[#f0d8cf] bg-[#fff7f4] p-4">
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-coral">감수할 것</p>
          <p className="m-0 mt-2 text-[13px] font-[650] leading-[1.65] text-slate-800">
            <GlossaryText text={detailedCost(scenario)} />
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_1fr]">
        <div>
          <p className="m-0 text-[12px] font-[680] text-slate-900">핵심 효과</p>
          <div className="mt-3 divide-y divide-slate-100">
            {mainImpacts.map((impact) => (
              <div key={`${impact.metric}-${impact.after}`} className="py-2 first:pt-0 last:pb-0">
                <p className="m-0 text-[12px] font-[650] text-slate-700">{impact.metric}</p>
                <p className="m-0 mt-1 text-[11px] leading-[1.55] text-slate-500">
                  <GlossaryText text={`현재 수준 대비 ${impact.after}`} />
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="m-0 text-[12px] font-[680] text-slate-900">재무 영향</p>
          <div className="mt-3 divide-y divide-slate-100">
            {mainFinancial.map((item) => (
              <div key={`${item.item}-${item.amount}`} className="py-2 first:pt-0 last:pb-0">
                <p className={`m-0 text-[12px] font-[650] ${financialTone(item.color_intent)}`}>{item.item}: {item.amount}</p>
                <p className="m-0 mt-1 text-[11px] leading-[1.55] text-slate-500">
                  <GlossaryText text={item.rationale ?? item.note ?? "현재 인건비 대비 연간 추정 기준입니다."} />
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="m-0 text-[12px] font-[680] text-slate-900">운영 리스크</p>
          <div className="mt-3 divide-y divide-slate-100">
            {(scenario.warnings ?? []).slice(0, 3).map((warning) => (
              <p key={warning} className="m-0 py-2 text-[11px] leading-[1.6] text-slate-600 first:pt-0 last:pb-0">
                <GlossaryText text={warning} />
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="m-0 text-[12px] font-[680] text-slate-900">주요 제도와 참고 예시</p>
            <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-600">
              {operatingImage ? (
                <>
                  <span className="font-[680] text-slate-800">
                    <GlossaryText text={operatingImage.label} />
                  </span>
                  <span className="mt-1 block">
                    <GlossaryText text={operatingImage.body} />
                  </span>
                </>
              ) : (
                "선택한 방향에 맞춰 도입할 제도와 순서를 단계적으로 조정합니다."
              )}
            </p>
          </div>
          <div>
            <p className="m-0 text-[12px] font-[680] text-slate-900">검토 관점</p>
            <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-600">
              <GlossaryText text={REVIEW_PERSPECTIVE[scenario.id] ?? scenario.description} />
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3">
          {mainPackages.map((item) => (
            <PackageDecisionCard
              key={`${item.area}-${item.action}`}
              item={item}
              decision={decisions[`${item.area}-${item.action}`]}
              onDecision={(decision) => setPackageDecision(`${item.area}-${item.action}`, decision)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
