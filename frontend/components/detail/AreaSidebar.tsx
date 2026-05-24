"use client";

import type { AreaAnalysisOut } from "@/lib/types/api";

interface AreaSidebarProps {
  areas: AreaAnalysisOut[];
  activeId: string;
  onSelect: (areaId: string) => void;
}

export function AreaSidebar({ areas, activeId, onSelect }: AreaSidebarProps) {
  return (
    <aside className="grid h-fit gap-[10px]">
      {areas.map((area) => {
        const active = area.area_id === activeId;
        return (
          <button
            key={area.area_id}
            type="button"
            onClick={() => onSelect(area.area_id)}
            className={`rounded-[10px] border p-4 text-left transition-all print:break-inside-avoid ${
              active
                ? "border-teal-line bg-teal-soft shadow-soft"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="mb-[10px] flex items-start justify-between gap-3">
              <strong className="text-[13px] font-[680] text-slate-900">{area.area_name}</strong>
              <span className="text-[12px] font-[700] text-teal-deep">{area.score}</span>
            </div>
            <div className="h-[6px] overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-teal" style={{ width: `${Math.max(8, area.score)}%` }} />
            </div>
            <div className="mt-[10px] flex justify-between text-[11px] text-slate-500">
              <span>벤치마크 대비 {area.gap}점 미달</span>
              <span>Priority {area.priority}</span>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
