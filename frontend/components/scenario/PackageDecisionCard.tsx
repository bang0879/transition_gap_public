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
    return `보류 리스크: ${holdRisk(item)} 보류한다면 누가, 언제, 어떤 신호를 보고 다시 열지 정해야 합니다.`;
  }
  if (decision === "대체 검토") {
    return `대체 방향: ${alternativeDirection(item)}`;
  }
  if (decision === "도입") {
    return `도입 선택: ${item.timeline} 안에 실행 범위, 책임자, 첫 점검일을 정해 이번 로드맵에 포함합니다.`;
  }
  return "도입, 보류, 대체 검토 중 하나를 선택하면 실행상 의미가 표시됩니다.";
}

function holdRisk(item: ScenarioPackageItem): string {
  if (item.area.includes("보상")) return "보상 기준 정리가 늦어져 핵심 인재 설득력과 오퍼 경쟁력이 약해질 수 있습니다.";
  if (item.area.includes("평가")) return "평가 기준이 늦게 잡히면 보상 차등과 피드백의 납득 가능성이 떨어질 수 있습니다.";
  if (item.area.includes("채용")) return "채용 메시지와 후보자 설득 기준이 약해져 좋은 후보를 놓칠 수 있습니다.";
  if (item.area.includes("인력")) return "이탈, 온보딩, 핵심 인재 리스크를 늦게 발견할 수 있습니다.";
  if (item.area.includes("리더십")) return "리더별 운영 품질 차이와 의사결정 병목이 계속 남을 수 있습니다.";
  return `${item.area} 운영 기준이 뒤로 밀려 실행 일관성이 약해질 수 있습니다.`;
}

function alternativeDirection(item: ScenarioPackageItem): string {
  if (item.area.includes("보상")) return "전사 도입 대신 핵심 직무 1~2개에만 보상 밴드와 예외 승인 기준을 파일럿으로 둡니다.";
  if (item.area.includes("평가")) return "정식 평가 제도 전에 목표 합의표, 리더 캘리브레이션 회의, 결과 설명 템플릿부터 운영합니다.";
  if (item.area.includes("채용")) return "새 제도 도입보다 후보자 메시지, 면접관 스크립트, 오퍼 거절 사유 기록부터 정리합니다.";
  if (item.area.includes("인력")) return "전사 리텐션 제도 대신 핵심 인재 명단, Stay Interview, 30/60/90 온보딩 체크만 먼저 운영합니다.";
  if (item.area.includes("리더십")) return "대규모 교육 대신 리더 2~3명 파일럿, 1on1 기록 양식, 전결 기준표부터 시작합니다.";
  return "같은 목적을 더 낮은 부담의 체크리스트, 파일럿, 수동 리뷰로 먼저 검토합니다.";
}

function messageTone(decision: PackageDecision | undefined): string {
  if (decision === "도입") return "border-teal-line bg-teal-soft text-teal-deep";
  if (decision === "보류") return "border-coral/25 bg-coral-soft text-coral";
  if (decision === "대체 검토") return "border-amber/30 bg-amber-soft text-amber";
  return "border-slate-200 bg-slate-50 text-slate-600";
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
      <div className={`mt-3 rounded-[8px] border px-3 py-2 text-[11px] leading-[1.55] ${messageTone(decision)}`}>
        <p className="m-0 font-[760]">{decision ? `선택 결과 · ${decision}` : "선택 대기"}</p>
        <p className="m-0 mt-1 text-slate-700">
          <GlossaryText text={decisionMessage(item, decision)} />
        </p>
      </div>
    </article>
  );
}
