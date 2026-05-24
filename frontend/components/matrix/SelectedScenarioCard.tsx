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
}

export function SelectedScenarioCard({ name, philosophy, packageItems, gain, cost, warning }: SelectedScenarioCardProps) {
  return (
    <aside className="rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">선택한 시나리오</p>
      <h3 className="m-0 mt-2 text-[18px] font-[690] text-slate-900">{name}</h3>
      <p className="mt-2 text-[12px] leading-[1.65] text-slate-600">{philosophy}</p>

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
