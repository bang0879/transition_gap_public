"use client";

interface SpectrumSliderProps {
  leftLabel: string;
  rightLabel: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function SpectrumSlider({
  leftLabel,
  rightLabel,
  value,
  onChange,
  min = 1,
  max = 5,
}: SpectrumSliderProps) {
  const current = value ?? Math.ceil((min + max) / 2);
  const percent = ((current - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-[620] text-slate-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative h-[28px]">
        <div
          className="absolute left-0 right-0 top-[12px] h-[4px] rounded-full bg-slate-100"
        />
        <div
          className="absolute left-0 top-[12px] h-[4px] rounded-full bg-teal-line"
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute top-[7px] h-[14px] w-[14px] rounded-full border-2 border-white bg-teal shadow-[0_2px_8px_rgba(15,23,42,0.12)]"
          style={{ left: `calc(${percent}% - 7px)` }}
        />
        <input
          aria-label={`${leftLabel}에서 ${rightLabel} 사이 선택`}
          type="range"
          min={min}
          max={max}
          step={1}
          value={current}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
