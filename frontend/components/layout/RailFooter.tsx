"use client";

import { STEP_VARIABLES } from "@/lib/constants/variables";
import { useResponsesStore } from "@/lib/store/responses";

export function RailFooter() {
  const responses = useResponsesStore((state) => state.responses);
  const variables = Object.values(STEP_VARIABLES).flat();
  const answered = variables.filter((id) => responses[id] !== undefined).length;
  const progress = Math.round((answered / variables.length) * 100);

  return (
    <div className="mt-auto border-t border-slate-200 px-2 pb-0 pt-4">
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>입력 진행률</span>
        <strong className="text-slate-800">{progress}%</strong>
      </div>
      <div className="mt-[10px] h-[7px] overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-teal" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-[10px] text-[11px] text-slate-400">
        자동 저장됨 · 로컬 브라우저
      </div>
    </div>
  );
}
