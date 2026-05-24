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
  warning?: string;
  reference?: string;
}

export function SelectedScenarioCard({ name, philosophy, packageItems, gain, cost, warning, reference }: SelectedScenarioCardProps) {
  return (
    <aside className="rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">현재 검토 중인 운영 방향</p>
      <h3 className="m-0 mt-2 text-[18px] font-[690] text-slate-900">{name}</h3>
      <p className="mt-2 text-[12px] leading-[1.65] text-slate-600">{philosophy}</p>
      {reference ? (
        <div className="mt-3 rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-[1.55] text-slate-600">
          참고 운영 이미지: <span className="font-[680] text-slate-800">{reference}</span>
        </div>
      ) : null}

      <div className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
        <div className="grid grid-cols-[72px_1fr] gap-3 py-3 text-[12px]">
          <strong className="text-teal-deep">얻는 것</strong>
          <span className="leading-[1.55] text-slate-700">{gain ?? "선택 방향의 핵심 효과를 확인합니다."}</span>
        </div>
        <div className="grid grid-cols-[72px_1fr] gap-3 py-3 text-[12px]">
          <strong className="text-coral">감수할 것</strong>
          <span className="leading-[1.55] text-slate-700">{cost ?? warning ?? "운영 리스크와 비용을 함께 검토해야 합니다."}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">먼저 움직이는 제도</p>
        {packageItems.slice(0, 5).map((item) => (
          <div key={`${item.area}-${item.action}`} className="grid grid-cols-[54px_1fr_56px] gap-3 border-t border-slate-100 pt-3 text-[11px] first:border-t-0 first:pt-0">
            <strong className="text-teal-deep">{item.area}</strong>
            <span className="leading-[1.55] text-slate-600">{item.action}</span>
            <span className="text-right text-slate-400">{item.timeline}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
