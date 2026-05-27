"use client";

import { GlossaryText } from "@/components/shared/GlossaryText";

type PackageDecision = "도입" | "보류" | "대체 검토";

interface ScenarioPackageItem {
  area: string;
  action: string;
  timeline: string;
}

interface PackageDecisionCardProps {
  item: ScenarioPackageItem;
  decision: PackageDecision | undefined;
  onDecision: (decision: PackageDecision) => void;
}

const decisions: Array<{
  value: PackageDecision;
  badge: string;
  detail: string;
  activeClass: string;
}> = [
  {
    value: "도입",
    badge: "선택함",
    detail: "이번 로드맵에 포함합니다.",
    activeClass: "border-teal-line bg-teal-soft text-teal-deep",
  },
  {
    value: "보류",
    badge: "보류 중",
    detail: "보류 시 놓칠 수 있는 리스크를 확인해야 합니다.",
    activeClass: "border-coral/30 bg-coral-soft text-coral",
  },
  {
    value: "대체 검토",
    badge: "대체 검토",
    detail: "같은 목적을 더 낮은 부담의 제도로 대체할 수 있는지 봅니다.",
    activeClass: "border-amber/30 bg-amber-soft text-amber",
  },
];

function decisionMessage(item: ScenarioPackageItem, decision: PackageDecision | undefined): string {
  if (decision === "보류") {
    return `이 제도를 보류하면 초기 실행에서 ${item.area} 기준이 약해질 수 있습니다. 보류한다면 누가, 언제, 어떤 신호를 보고 다시 열지 정해야 합니다.`;
  }
  if (decision === "대체 검토") {
    return `대체 후보: 같은 목적의 경량 운영안, 작은 파일럿, 수동 리뷰를 먼저 검토할 수 있습니다.`;
  }
  if (decision === "도입") {
    return `${item.timeline} 안에 실행 범위와 책임자를 정해 이번 로드맵에 포함합니다.`;
  }
  return "도입, 보류, 대체 검토 중 하나를 선택하면 실행상 의미가 표시됩니다.";
}

export function PackageDecisionCard({ item, decision, onDecision }: PackageDecisionCardProps) {
  return (
    <article className="rounded-[10px] border border-slate-200 bg-white p-4">
      <div className="mb-3 grid gap-2 sm:grid-cols-[68px_1fr_60px]">
        <strong className="text-[12px] text-teal-deep">{item.area}</strong>
        <span className="text-[12px] leading-[1.55] text-slate-700">
          <GlossaryText text={item.action} />
        </span>
        <span className="text-[11px] text-slate-400 sm:text-right">{item.timeline}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {decisions.map((option) => {
          const active = decision === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onDecision(option.value)}
              className={`min-h-[82px] rounded-[9px] border p-3 text-left transition-colors ${
                active ? option.activeClass : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="block text-[12px] font-[760]">{option.value}</span>
              <span className="mt-1 inline-flex rounded-full border border-white/70 bg-white/70 px-2 py-0.5 text-[10px] font-[700]">
                {active ? option.badge : "선택"}
              </span>
              <span className="mt-2 block text-[11px] leading-[1.45]">{option.detail}</span>
            </button>
          );
        })}
      </div>
      <p className="m-0 mt-3 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-[1.55] text-slate-600">
        <GlossaryText text={decisionMessage(item, decision)} />
      </p>
    </article>
  );
}
