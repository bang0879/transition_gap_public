"use client";

import { GlossaryText } from "@/components/shared/GlossaryText";

interface MultiOptionGridProps {
  options: string[];
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  maxSelect?: number;
}

export function MultiOptionGrid({
  options,
  value = [],
  onChange,
  maxSelect,
}: MultiOptionGridProps) {
  const selected = value || [];

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }

    if (maxSelect && selected.length >= maxSelect) {
      return;
    }

    onChange([...selected, option]);
  };

  return (
    <div className="grid grid-cols-1 gap-[8px]">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-[10px] border p-3 text-left text-[13px] leading-[1.45] transition-all ${
              isSelected
                ? "border-teal-line bg-[#fbfdfd] font-[650] text-slate-900 shadow-[inset_0_0_0_1px_rgba(47,143,134,0.16)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <GlossaryText text={option} />
          </button>
        );
      })}
    </div>
  );
}
