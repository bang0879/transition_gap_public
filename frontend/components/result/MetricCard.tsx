type MetricVariant = "teal" | "amber" | "coral";

interface MetricCardProps {
  variant: MetricVariant;
  label: string;
  badgeText: string;
  value: string | number;
  unit: string;
  copy: string;
}

const statusDot: Record<MetricVariant, string> = {
  teal: "bg-teal",
  amber: "bg-amber",
  coral: "bg-coral",
};

export function MetricCard({
  variant,
  label,
  badgeText,
  value,
  unit,
  copy,
}: MetricCardProps) {
  return (
    <div className="relative min-h-[158px] overflow-hidden rounded-[8px] border border-slate-200 bg-white p-[18px] print:break-inside-avoid">
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] font-[680] text-slate-500">{label}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-[680] leading-none text-slate-600">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[variant]}`} aria-hidden="true" />
          {badgeText}
        </span>
      </div>
      <div className="mb-2 flex items-baseline gap-[5px]">
        <strong className="text-[44px] font-[720] leading-[0.95] text-slate-950">
          {value}
        </strong>
        <span className="text-[16px] font-[620] text-slate-400">{unit}</span>
      </div>
      <p className="m-0 max-w-none text-[12px] leading-[1.55] text-slate-500">
        {copy}
      </p>
    </div>
  );
}
