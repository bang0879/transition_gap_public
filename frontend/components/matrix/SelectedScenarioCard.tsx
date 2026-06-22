import { GlossaryText } from "@/components/shared/GlossaryText";

interface ScenarioPackageItem {
  area: string;
  action: string;
  timeline: string;
}

interface SelectedScenarioCardProps {
  name: string;
  philosophy: string;
  packageItems: ScenarioPackageItem[];
  gain?: string;
  cost?: string;
  talentRisk?: string;
  reference?: string;
  matrixReason?: string;
  scenarioRole?: string;
}

export function SelectedScenarioCard({ name, philosophy, packageItems, gain, cost, talentRisk, reference, matrixReason, scenarioRole }: SelectedScenarioCardProps) {
  return (
    <aside className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft print:break-inside-avoid">
      <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">현재 검토 중인 운영 방향</p>
      <h3 className="m-0 mt-2 text-[18px] font-[720] text-slate-950">{name}</h3>
      <p className="mt-2 text-[12px] leading-[1.65] text-slate-600"><GlossaryText text={philosophy} /></p>
      {reference ? (
        <div className="mt-3 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-[1.55] text-slate-600">
          참고 이미지: <span className="font-[680] text-slate-800"><GlossaryText text={reference} /></span>
        </div>
      ) : null}
      {matrixReason ? (
        <div className="mt-3 rounded-[8px] border border-[#d9ebe7] bg-[#fbfefd] px-3 py-2 text-[11px] leading-[1.55] text-slate-600">
          <span className="font-[760] text-[#4c7974]">{scenarioRole ?? "집중 축"}: </span>
          <GlossaryText text={matrixReason} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[8px] border border-[#d9ebe7] bg-white p-3 text-[12px]">
          <strong className="block text-[11px] font-[760] tracking-[0.08em] text-[#4c7974]">얻는 것</strong>
          <span className="mt-2 block leading-[1.55] text-slate-700"><GlossaryText text={gain ?? "선택 방향의 핵심 효과"} /></span>
        </div>
        <div className="rounded-[8px] border border-[#eadfda] bg-white p-3 text-[12px]">
          <strong className="block text-[11px] font-[760] tracking-[0.08em] text-[#8a6259]">감당할 것</strong>
          <span className="mt-2 block leading-[1.55] text-slate-700"><GlossaryText text={cost ?? "운영 리스크와 비용"} /></span>
        </div>
      </div>

      {talentRisk ? (
        <div className="mt-3 rounded-[8px] border border-[#eadfca] bg-white px-3 py-2 text-[11px] leading-[1.55] text-slate-600">
          <span className="font-[760] text-[#8a6b3b]">핵심 인재 리스크: </span>
          <GlossaryText text={talentRisk} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">먼저 검토할 제도</p>
        {packageItems.slice(0, 5).map((item) => (
          <div key={`${item.area}-${item.action}`} className="grid grid-cols-[54px_1fr_56px] gap-3 border-t border-slate-100 pt-3 text-[11px] first:border-t-0 first:pt-0">
            <strong className="text-slate-700">{item.area}</strong>
            <span className="leading-[1.55] text-slate-600"><GlossaryText text={item.action} /></span>
            <span className="text-right text-slate-400">{item.timeline}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}