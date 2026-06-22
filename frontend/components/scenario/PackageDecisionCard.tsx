"use client";

import { GlossaryText } from "@/components/shared/GlossaryText";

type PackageDecision = "도입" | "보류" | "대체 검토";

interface ScenarioPackageItem {
  area: string;
  action: string;
  timeline: string;
  benefit?: string;
  tradeoff?: string;
  reference_example?: string;
}

interface PackageDecisionCardProps {
  item: ScenarioPackageItem;
  decision: PackageDecision | undefined;
  onDecision: (decision: PackageDecision) => void;
}

const decisions: Array<{
  value: PackageDecision;
  helper: string;
}> = [
  {
    value: "도입",
    helper: "이번 실행 범위에 포함",
  },
  {
    value: "보류",
    helper: "조건이 갖춰질 때까지 대기",
  },
  {
    value: "대체 검토",
    helper: "더 낮은 부담의 방법 탐색",
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
    const tradeoff = item.tradeoff ? ` 단, ${item.tradeoff}` : "";
    return `도입 선택: ${item.timeline} 안에 실행 범위, 책임자, 첫 점검일을 정해 이번 로드맵에 포함합니다.${tradeoff}`;
  }
  return "도입, 보류, 대체 검토 중 하나를 선택하면 실행상 의미가 표시됩니다.";
}

function holdRisk(item: ScenarioPackageItem): string {
  if (item.benefit) return `${item.benefit} 이 효과를 당장은 얻기 어렵습니다.`;
  if (item.area.includes("보상")) return "보상 기준 정리가 늦어져 핵심 인재 설득력과 오퍼 경쟁력이 약해질 수 있습니다.";
  if (item.area.includes("평가")) return "평가 기준이 늦게 잡히면 보상 차등과 피드백의 납득 가능성이 떨어질 수 있습니다.";
  if (item.area.includes("채용")) return "채용 메시지와 후보자 설득 기준이 약해져 좋은 후보를 놓칠 수 있습니다.";
  if (item.area.includes("인력")) return "이탈, 온보딩, 핵심 인재 리스크를 늦게 발견할 수 있습니다.";
  if (item.area.includes("리더십")) return "리더별 운영 품질 차이와 의사결정 병목이 계속 남을 수 있습니다.";
  return `${item.area} 운영 기준이 뒤로 밀려 실행 일관성이 약해질 수 있습니다.`;
}

function alternativeDirection(item: ScenarioPackageItem): string {
  if (item.tradeoff) return `${item.tradeoff} 이 부담을 낮추는 파일럿이나 수동 리뷰부터 검토합니다.`;
  if (item.area.includes("보상")) return "전사 도입 대신 핵심 직무 1~2개에만 보상 밴드와 예외 승인 기준을 파일럿으로 둡니다.";
  if (item.area.includes("평가")) return "정식 평가 제도 전에 목표 합의표, 리더 캘리브레이션 회의, 결과 설명 템플릿부터 운영합니다.";
  if (item.area.includes("채용")) return "새 제도 도입보다 후보자 메시지, 면접관 스크립트, 오퍼 거절 사유 기록부터 정리합니다.";
  if (item.area.includes("인력")) return "전사 리텐션 제도 대신 핵심 인재 명단, Stay Interview, 30/60/90 온보딩 체크만 먼저 운영합니다.";
  if (item.area.includes("리더십")) return "대규모 교육 대신 리더 2~3명 파일럿, 1on1 기록 양식, 전결 기준표부터 시작합니다.";
  return "같은 목적을 더 낮은 부담의 체크리스트, 파일럿, 수동 리뷰로 먼저 검토합니다.";
}

function messageTone(decision: PackageDecision | undefined): string {
  if (decision === "도입") return "border-[#d9ebe7] bg-white text-slate-700";
  if (decision === "보류") return "border-[#eadfda] bg-white text-slate-700";
  if (decision === "대체 검토") return "border-[#eadfca] bg-white text-slate-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function radioTone(active: boolean): string {
  return active ? "border-[#4c7974] bg-[#4c7974]" : "border-slate-300 bg-white";
}

export function PackageDecisionCard({ item, decision, onDecision }: PackageDecisionCardProps) {
  return (
    <article className={`rounded-[8px] border bg-white p-4 transition-colors ${decision ? "border-[#b8ded9] shadow-[0_0_0_3px_rgba(47,143,134,0.08)]" : "border-slate-200"}`}>
      <div className="grid gap-2 sm:grid-cols-[72px_1fr_62px]">
        <strong className="text-[12px] text-slate-800">{item.area}</strong>
        <span className="text-[12px] leading-[1.55] text-slate-700">
          <GlossaryText text={item.action} />
        </span>
        <span className="text-[11px] text-slate-400 sm:text-right">{item.timeline}</span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p className="m-0 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-[11px] leading-[1.55] text-slate-600">
          <span className="font-[760] text-[#4c7974]">좋은 점: </span>
          <GlossaryText text={item.benefit ?? "이 제도의 기대 효과를 검토합니다."} />
        </p>
        <p className="m-0 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-[11px] leading-[1.55] text-slate-600">
          <span className="font-[760] text-[#8a6259]">감당할 점: </span>
          <GlossaryText text={item.tradeoff ?? "운영 부담과 부작용을 함께 확인합니다."} />
        </p>
      </div>

      {item.reference_example ? (
        <p className="m-0 mt-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-[1.55] text-slate-500">
          참고 예시: <span className="font-[680] text-slate-700"><GlossaryText text={item.reference_example} /></span>
        </p>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {decisions.map((option) => {
          const active = decision === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onDecision(option.value)}
              className={`flex min-h-[54px] items-start gap-2 rounded-[8px] border bg-white p-2.5 text-left transition-colors ${
                active ? "border-[#b8ded9] text-slate-900 shadow-[0_0_0_2px_rgba(47,143,134,0.06)]" : "border-slate-200 text-slate-600 hover:border-[#cfe7e2]"
              }`}
            >
              <span className={`mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${radioTone(active)}`}>
                {active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
              </span>
              <span>
                <span className="block text-[12px] font-[760]">{option.value}</span>
                <span className="mt-0.5 block text-[10.5px] leading-[1.35] text-slate-500">{option.helper}</span>
              </span>
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