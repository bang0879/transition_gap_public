"use client";

interface SplitBarProps {
  leftLabel: string;
  rightLabel: string;
  value: number | undefined;
  onChange: (value: number) => void;
}

export function SplitBar({ leftLabel, rightLabel, value, onChange }: SplitBarProps) {
  const current = value ?? 50;

  return (
    <div>
      <div className="mb-[10px] flex justify-between text-[12px] text-slate-500">
        <span>{leftLabel}</span>
        <strong className="text-slate-900">{current}%</strong>
        <span>{rightLabel}</span>
      </div>
      <input
        aria-label={`${leftLabel} 비율`}
        type="range"
        min={0}
        max={100}
        step={5}
        value={current}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-teal"
      />
    </div>
  );
}
