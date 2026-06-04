import { LANDING_PREVIEW_SUMMARY } from "@/lib/constants/landingPreview";
import { MiniAlignmentPreview } from "./MiniAlignmentPreview";

const previewItems = [
  {
    label: "엇박자 신호",
    value: "보상 ↔ 리더십",
  },
  {
    label: "먼저 볼 영역",
    value: "평가 · 리더십",
  },
];

export function PreviewAside() {
  return (
    <aside className="relative overflow-hidden rounded-[10px] border border-slate-200 bg-white/82 p-3 shadow-soft">
      <div className="mb-2 border-b border-slate-100 pb-2">
        <span className="text-[10px] font-[760] tracking-[0.08em] text-slate-400">
          결과 리포트 미리보기
        </span>
        <h3 className="m-0 mt-1.5 text-[14px] font-[720] leading-[1.35] text-slate-900">
          {LANDING_PREVIEW_SUMMARY.headline}
        </h3>
      </div>
      <div className="mb-2">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="text-[10px] font-[760] tracking-[0.08em] text-slate-400">
            정합성 카드 미리보기
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-[760] text-slate-500">
            정합 {LANDING_PREVIEW_SUMMARY.score}% · {LANDING_PREVIEW_SUMMARY.level}
          </span>
        </div>
        <MiniAlignmentPreview />
      </div>
      {previewItems.map((item, index) => (
        <div
          key={item.label}
          className={`py-1.5 ${
            index < previewItems.length - 1 ? "border-b border-slate-100" : ""
          }`}
        >
          <div className="flex min-h-[24px] items-center justify-between gap-3">
            <span className="text-[11px] font-[680] text-slate-500">{item.label}</span>
            <strong className="text-right text-[13px] font-[760] text-slate-900">{item.value}</strong>
          </div>
        </div>
      ))}
      <p className="m-0 mt-1 border-t border-slate-100 pt-2 text-[11px] leading-[1.5] text-slate-500">
        {LANDING_PREVIEW_SUMMARY.conflict}
      </p>
    </aside>
  );
}
