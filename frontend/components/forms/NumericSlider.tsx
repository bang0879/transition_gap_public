"use client";

interface NumericSliderProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export function NumericSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  leftLabel = "낮음",
  rightLabel = "높음",
}: NumericSliderProps) {
  const current = value ?? Math.ceil((min + max) / 2);
  const percent = ((current - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-[620] text-slate-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative h-[28px] flex-1">
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
            aria-label="숫자 선택"
            type="range"
            min={min}
            max={max}
            step={1}
            value={current}
            onChange={(event) => onChange(Number(event.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
        </div>
        <span className="min-w-8 rounded-full border border-slate-200 bg-white px-2 py-[3px] text-center text-[12px] font-[680] text-slate-900">
          {current}
        </span>
      </div>
    </div>
  );
}
