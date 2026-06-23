import type { StageGuidanceOut } from "@/lib/types/api";

interface StageGuidancePanelProps {
  guidance?: StageGuidanceOut | null;
}

interface GuidanceListProps {
  title: string;
  items: string[];
}

function GuidanceList({ title, items }: GuidanceListProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-slate-400">{title}</p>
      <ul className="m-0 mt-2 grid gap-1.5 p-0">
        {items.map((item) => (
          <li key={item} className="list-none text-[12px] leading-[1.6] text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StageGuidancePanel({ guidance }: StageGuidancePanelProps) {
  if (!guidance) return null;

  return (
    <section className="mb-4 rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">단계별 판단</p>
          <h3 className="m-0 mt-2 text-[16px] font-[700] leading-[1.4] text-slate-950">현재 선택을 먼저 인정하고, 다음 조건을 봅니다.</h3>
          <div className="mt-4 grid gap-3">
            <div>
              <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-slate-400">현재 선택</p>
              <p className="m-0 mt-2 text-[13px] leading-[1.7] text-slate-700">{guidance.current_choice}</p>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-slate-400">유효한 조건</p>
              <p className="m-0 mt-2 text-[13px] leading-[1.7] text-slate-700">{guidance.valid_until}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <GuidanceList title="이 단계에서 미뤄도 되는 것" items={guidance.defer_now} />
          <div className="border-t border-slate-100 pt-3">
            <GuidanceList title="먼저 할 일" items={guidance.do_now} />
          </div>
          <div className="border-t border-slate-100 pt-3">
            <GuidanceList title="혼자 가능한 시작" items={guidance.self_serve_actions} />
          </div>
          <div className="border-t border-slate-100 pt-3">
            <GuidanceList title="외부 도움은 나중에" items={guidance.needs_help_later} />
          </div>
        </div>
      </div>
    </section>
  );
}
