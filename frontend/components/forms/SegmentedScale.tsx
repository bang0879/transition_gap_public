"use client";

interface SegmentedScaleOption {
  label: string;
  description: string;
  value: number;
}

interface SegmentedScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
  options: SegmentedScaleOption[];
}

export function SegmentedScale({ value, onChange, options }: SegmentedScaleProps) {
  const gridClass = options.length >= 5 ? "md:grid-cols-3" : "md:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 gap-2 ${gridClass}`}>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-[92px] rounded-[10px] border p-3 text-left transition-colors ${
              selected
                ? "border-teal-line bg-teal-soft text-slate-900 shadow-[inset_0_0_0_1px_rgba(47,143,134,0.18)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className={`text-[13px] font-[720] ${selected ? "text-teal-deep" : "text-slate-900"}`}>
              {option.label}
            </span>
            <span className="mt-2 block text-[12px] leading-[1.55] text-slate-500">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
