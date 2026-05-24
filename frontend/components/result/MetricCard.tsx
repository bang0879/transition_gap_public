import { Badge } from "@/components/shared/Badge";

type MetricVariant = "teal" | "amber" | "coral";

interface MetricCardProps {
  variant: MetricVariant;
  label: string;
  badgeText: string;
  value: string | number;
  unit: string;
  copy: string;
}

const bottomBar: Record<MetricVariant, string> = {
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
    <div className="relative min-h-[158px] overflow-hidden rounded-[10px] border border-slate-200 bg-white p-[18px] print:break-inside-avoid">
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] font-[620] text-slate-500">{label}</span>
        <Badge variant={variant}>{badgeText}</Badge>
      </div>
      <div className="mb-2 flex items-baseline gap-[5px]">
        <strong className="text-[44px] font-[680] leading-[0.95] text-slate-900">
          {value}
        </strong>
        <span className="text-[16px] font-[620] text-slate-400">{unit}</span>
      </div>
      <p className="m-0 max-w-none text-[12px] leading-[1.55] text-slate-500">
        {copy}
      </p>
      <div className={`absolute bottom-0 left-[18px] right-[18px] h-[3px] rounded-t-full ${bottomBar[variant]}`} />
    </div>
  );
}
