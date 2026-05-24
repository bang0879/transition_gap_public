import type { AreaAnalysisOut } from "@/lib/types/api";

interface GapBarListProps {
  areas: AreaAnalysisOut[];
}

const AREA_NAMES: Record<string, string> = {
  compensation: "보상",
  evaluation: "평가",
  recruitment: "채용",
  leadership: "리더십",
  retention: "인력 안정성",
};

function barColor(gap: number): string {
  if (gap >= 20) return "bg-coral";
  if (gap >= 10) return "bg-amber";
  return "bg-teal";
}

export function GapBarList({ areas }: GapBarListProps) {
  const sorted = [...areas].sort((a, b) => b.gap - a.gap);
  const maxGap = Math.max(...sorted.map((area) => area.gap), 1);

  return (
    <div className="grid gap-[14px] p-[18px]">
      {sorted.map((area) => (
        <div key={area.area_id} className="grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-[96px_1fr] sm:items-center xl:grid-cols-[92px_1fr_150px]">
          <div className="font-[620] text-slate-700">{AREA_NAMES[area.area_id] ?? area.area_name}</div>
          <div className="relative h-[9px] rounded-full bg-slate-100">
            <div
              className={`absolute bottom-0 left-0 top-0 rounded-full ${barColor(area.gap)}`}
              style={{ width: `${(area.gap / maxGap) * 100}%` }}
            />
          </div>
          <div className="font-[650] text-coral sm:col-start-2 xl:col-start-auto xl:text-right">
            벤치마크 대비 {area.gap}점 미달
          </div>
        </div>
      ))}
    </div>
  );
}
