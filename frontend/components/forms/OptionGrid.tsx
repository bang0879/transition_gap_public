"use client";

import { GlossaryText } from "@/components/shared/GlossaryText";

type OptionItem =
  | string
  | {
      value: string;
      label: string;
      description?: string;
    };

interface OptionGridProps {
  options: OptionItem[];
  value: string | undefined;
  onChange: (value: string) => void;
  mutedOption?: string;
  columns?: 1 | 2 | 3 | 4;
}

const columnClass: Record<NonNullable<OptionGridProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
};

export function OptionGrid({
  options,
  value,
  onChange,
  mutedOption,
  columns = 2,
}: OptionGridProps) {
  return (
    <div className={`grid gap-[8px] ${columnClass[columns]}`}>
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        const optionDescription = typeof option === "string" ? null : option.description;
        const selected = value === optionValue;
        const muted = mutedOption === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`min-h-16 rounded-[10px] border p-3 text-left text-[13px] leading-[1.45] transition-all ${
              selected
                ? "border-teal-line bg-white font-[650] text-slate-900 shadow-[inset_0_0_0_1px_rgba(47,143,134,0.16)]"
                : muted
                  ? "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="block text-[13px] font-[680] leading-[1.35]">
              <GlossaryText text={optionLabel} />
            </span>
            {optionDescription ? (
              <span className="mt-1.5 block text-[11px] font-[520] leading-[1.45] text-slate-500">
                <GlossaryText text={optionDescription} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
