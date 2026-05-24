import { Badge } from "@/components/shared/Badge";
import type { AreaAnalysisOut } from "@/lib/types/api";
import { areaDisplayName, gapLabel } from "@/lib/utils/areaDisplay";

interface ScoreHeroProps {
  area: AreaAnalysisOut;
  rank: number;
}

export function ScoreHero({ area, rank }: ScoreHeroProps) {
  const name = areaDisplayName(area.area_id, area.area_name);

  return (
    <section className="mb-4 grid grid-cols-1 gap-4 rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid lg:grid-cols-[180px_1fr_190px]">
      <div>
        <p className="m-0 text-[11px] font-[760] uppercase tracking-[0.08em] text-slate-400">
          현재 정합성
        </p>
        <div className="mt-3 flex items-baseline gap-1">
          <strong className="text-[52px] font-[680] leading-none text-slate-900">{area.score}</strong>
          <span className="text-[15px] font-[650] text-slate-400">/100</span>
        </div>
      </div>
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="amber">{rank}순위 논의 영역</Badge>
          <Badge variant="slate">{gapLabel(area.gap)}</Badge>
        </div>
        <h3 className="m-0 text-[18px] font-[690] text-slate-900">{name}</h3>
        <p className="mt-2 text-[12px] leading-[1.7] text-slate-600">{area.status_text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {area.tags.map((tag) => (
            <Badge key={tag} variant="slate">{tag}</Badge>
          ))}
        </div>
      </div>
      <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
        <p className="m-0 text-[11px] font-[680] text-slate-500">기준점 차이</p>
        <strong className="mt-2 block text-[18px] font-[680] leading-[1.35] text-coral">{gapLabel(area.gap)}</strong>
        <p className="m-0 mt-2 text-[11px] leading-[1.55] text-slate-500">실행 난이도: {area.difficulty}</p>
      </div>
    </section>
  );
}
