import { LANDING_PREVIEW_CARDS } from "@/lib/constants/landingPreview";

const statusClass = {
  일치: "bg-slate-300",
  주의: "bg-amber",
  심각: "bg-coral",
} as const;

export function MiniAlignmentPreview() {
  const visibleItems = LANDING_PREVIEW_CARDS.slice(0, 3);

  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50/70 p-2" aria-label="정합성 카드 미리보기">
      <div className="grid gap-1">
        {visibleItems.map((item) => (
          <div key={item.id} className="grid grid-cols-[52px_minmax(0,1fr)_42px] items-center gap-2 rounded-[6px] bg-white px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${statusClass[item.status]}`} />
              <strong className="text-[11px] font-[760] text-slate-800">{item.label}</strong>
            </div>
            <span className="truncate text-[10px] leading-[1.3] text-slate-500">
              {item.philosophy} ↔ {item.actual}
            </span>
            <span className="text-right text-[10px] font-[760] text-slate-500">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
