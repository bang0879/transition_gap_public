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

function gapText(gap: number): string {
  if (gap >= 10) return `기준점 대비 ${gap}점 미달`;
  if (gap > 0) return `기준점 차이 ${gap}점`;
  return "기준점 충족";
}

function gapTone(gap: number): string {
  if (gap >= 20) return "text-coral";
  if (gap >= 10) return "text-amber";
  return "text-teal-deep";
}

export function GapBarList({ areas }: GapBarListProps) {
  const sorted = [...areas].sort((a, b) => b.gap - a.gap);
  const maxGap = Math.max(...sorted.map((area) => Math.max(area.gap, 0)), 1);

  return (
    <div className="grid gap-[14px] p-[18px]">
      {sorted.map((area, index) => (
        <div
          key={area.area_id}
          className="grid grid-cols-[48px_minmax(84px,108px)_1fr] items-center gap-2 text-[12px] xl:grid-cols-[48px_92px_1fr_142px]"
        >
          <div className="inline-flex h-[24px] w-[42px] items-center justify-center rounded-[7px] border border-slate-200 bg-slate-50 text-[11px] font-[760] text-slate-500">
            {index + 1}순위
          </div>
          <div className="font-[620] text-slate-700">{AREA_NAMES[area.area_id] ?? area.area_name}</div>
          <div className="relative h-[9px] rounded-full bg-slate-100">
            <div
              className={`absolute bottom-0 left-0 top-0 rounded-full ${barColor(area.gap)}`}
              style={{ width: `${(Math.max(area.gap, 0) / maxGap) * 100}%` }}
            />
          </div>
          <div className={`col-span-3 font-[650] xl:col-span-1 xl:text-right ${gapTone(area.gap)}`}>
            {gapText(area.gap)}
          </div>
        </div>
      ))}
    </div>
  );
}
