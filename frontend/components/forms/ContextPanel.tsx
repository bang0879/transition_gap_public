interface ContextPanelProps {
  title?: string;
  description: string;
  stats?: Array<{ label: string; value: string }>;
}

export function ContextPanel({
  title = "이 화면이 결과에 미치는 영향",
  description,
  stats,
}: ContextPanelProps) {
  return (
    <aside className="h-fit self-start rounded-card border border-slate-200 bg-white p-5 shadow-soft lg:sticky lg:top-6">
      <h3 className="mb-2 text-[13px] font-[680] text-slate-900">{title}</h3>
      <p className="mb-4 text-[12px] leading-[1.6] text-slate-500">{description}</p>
      {stats ? (
        <div className="grid gap-[10px]">
          {stats.map((stat) => {
            const progressMatch = stat.value.match(/^(\d+)\s*\/\s*(\d+)$/);
            const progressPct = progressMatch
              ? (Number.parseInt(progressMatch[1], 10) / Number.parseInt(progressMatch[2], 10)) * 100
              : null;

            return (
              <div key={stat.label}>
                <div className="flex justify-between gap-4 text-[12px]">
                  <span className="text-slate-500">{stat.label}</span>
                  <strong className="text-right text-slate-900">{stat.value}</strong>
                </div>
                {progressPct !== null ? (
                  <div className="mt-[5px] h-[3px] rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
}
