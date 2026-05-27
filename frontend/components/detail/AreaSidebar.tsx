"use client";

import type { AreaAnalysisOut } from "@/lib/types/api";
import { areaDisplayName, gapLabel } from "@/lib/utils/areaDisplay";

interface AreaSidebarProps {
  areas: AreaAnalysisOut[];
  activeId: string;
  onSelect: (areaId: string) => void;
}

function scoreTone(score: number, index: number): string {
  if (score < 50 || index === 0) return "bg-coral";
  if (score < 70 || index === 1) return "bg-amber";
  if (score < 80) return "bg-teal";
  return "bg-green";
}

function activeTone(score: number, index: number): string {
  if (score < 50 || index === 0) return "border-coral/30 bg-coral-soft";
  if (score < 70 || index === 1) return "border-amber/30 bg-amber-soft";
  return "border-teal-line bg-teal-soft";
}

export function AreaSidebar({ areas, activeId, onSelect }: AreaSidebarProps) {
  return (
    <aside className="grid h-fit gap-[10px]">
      {areas.map((area, index) => {
        const active = area.area_id === activeId;
        const name = areaDisplayName(area.area_id, area.area_name);
        return (
          <button
            key={area.area_id}
            type="button"
            onClick={() => onSelect(area.area_id)}
            className={`rounded-[10px] border p-4 text-left transition-all print:break-inside-avoid ${
              active
                ? `${activeTone(area.score, index)} shadow-soft`
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="mb-[10px] flex items-start justify-between gap-3">
              <div>
                <span className="mb-1 inline-flex rounded-[7px] border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-[760] text-slate-500">
                  {index + 1}순위
                </span>
                <strong className="block text-[13px] font-[680] text-slate-900">{name}</strong>
              </div>
              <span className="shrink-0 text-[12px] font-[700] text-teal-deep">현재 {area.score}점</span>
            </div>
            <div className="h-[6px] overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${scoreTone(area.score, index)}`} style={{ width: `${Math.max(8, area.score)}%` }} />
            </div>
            <div className="mt-[10px] flex justify-between gap-2 text-[11px] text-slate-500">
              <span>{gapLabel(area.gap)}</span>
              <span>{area.difficulty}</span>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
