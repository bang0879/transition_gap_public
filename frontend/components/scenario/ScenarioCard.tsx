"use client";

import { GlossaryText } from "@/components/shared/GlossaryText";

interface ScenarioCardProps {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  gain?: string;
  cost?: string;
  reference?: string;
  statusLabel?: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ScenarioCard({ id, name, subtitle, description, gain, cost, reference, statusLabel, selected, onSelect }: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`min-h-[190px] cursor-pointer rounded-[8px] border p-5 text-left transition-all duration-300 print:break-inside-avoid ${
        selected
          ? "border-teal-line bg-[#fbfefd] shadow-soft ring-2 ring-[#dcefeb]"
          : "border-slate-200 bg-white hover:border-[#cfe7e2]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-[760] tracking-[0.08em] text-slate-500">{subtitle}</span>
        <span className={`rounded-full border px-[8px] py-[3px] text-[11px] font-[680] ${
          selected ? "border-teal-line bg-teal-soft text-teal-deep" : "border-slate-200 bg-slate-50 text-slate-500"
        }`}>
          {statusLabel ?? (selected ? "검토 중" : "비교 후보")}
        </span>
      </div>
      <h3 className="m-0 mt-3 text-[18px] font-[720] text-slate-950">{name}</h3>
      <p className="m-0 mt-3 text-[12px] leading-[1.7] text-slate-600"><GlossaryText text={description} /></p>
      <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-[11px]">
        <div className="grid grid-cols-[76px_1fr] gap-2">
          <strong className="text-[#4c7974]">얻는 것</strong>
          <span className="leading-[1.55] text-slate-600"><GlossaryText text={gain ?? "핵심 효과를 상세에서 확인합니다."} /></span>
        </div>
        <div className="grid grid-cols-[76px_1fr] gap-2">
          <strong className="text-[#8a6259]">부담/주의점</strong>
          <span className="leading-[1.55] text-slate-600"><GlossaryText text={cost ?? "운영 리스크를 상세에서 확인합니다."} /></span>
        </div>
      </div>
      {reference ? (
        <div className="mt-3 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-[11px] leading-[1.5] text-slate-500">
          참고 운영 이미지: <span className="font-[680] text-slate-700"><GlossaryText text={reference} /></span>
        </div>
      ) : null}
    </button>
  );
}
