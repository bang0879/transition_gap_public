import { Badge } from "@/components/shared/Badge";
import type { AreaAnalysisOut } from "@/lib/types/api";

interface ScoreHeroProps {
  area: AreaAnalysisOut;
}

export function ScoreHero({ area }: ScoreHeroProps) {
  return (
    <section className="mb-4 grid grid-cols-1 gap-4 rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid lg:grid-cols-[180px_1fr_160px]">
      <div>
        <p className="m-0 text-[11px] font-[760] uppercase tracking-[0.08em] text-slate-400">
          영역 점수
        </p>
        <div className="mt-3 flex items-baseline gap-1">
          <strong className="text-[52px] font-[680] leading-none text-slate-900">{area.score}</strong>
          <span className="text-[15px] font-[650] text-slate-400">/100</span>
        </div>
      </div>
      <div>
        <h3 className="m-0 text-[18px] font-[690] text-slate-900">{area.area_name}</h3>
        <p className="mt-2 text-[12px] leading-[1.7] text-slate-600">{area.status_text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {area.tags.map((tag) => (
            <Badge key={tag} variant="slate">{tag}</Badge>
          ))}
        </div>
      </div>
      <div className="rounded-[10px] bg-slate-50 p-4">
        <p className="m-0 text-[11px] font-[680] text-slate-500">벤치마크 갭</p>
        <strong className="mt-2 block text-[20px] font-[680] text-coral">{area.gap}점 미달</strong>
        <p className="m-0 mt-1 text-[11px] leading-[1.5] text-slate-500">난이도: {area.difficulty}</p>
      </div>
    </section>
  );
}
