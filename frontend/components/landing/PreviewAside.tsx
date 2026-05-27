const previewItems = [
  {
    label: "가장 먼저 볼 영역",
    value: "평가·리더십",
    desc: "보상 기준보다 평가 운영 기준을 먼저 정리해야 합니다.",
  },
  {
    label: "현재 방식",
    value: "개별 판단 중심",
    desc: "성과 판단 기준이 리더별로 다르게 전달되고 있습니다.",
  },
  {
    label: "개선 방향",
    value: "분기 목표 점검",
    desc: "짧은 주기의 목표 점검과 반기 공식 리뷰로 연결합니다.",
  },
  {
    label: "다음 의사결정",
    value: "트레이드오프 분석",
    desc: "성과 차등을 강화할지, 수용성을 먼저 회복할지 선택합니다.",
  },
];

export function PreviewAside() {
  return (
    <aside className="relative overflow-hidden rounded-[10px] border border-slate-200 bg-white p-4 shadow-soft">
      <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-teal" />
      <div className="mb-3 border-b border-slate-100 pb-3">
        <span className="text-[10px] font-[760] tracking-[0.08em] text-teal">
          결과 리포트 미리보기
        </span>
        <p className="m-0 mt-2 text-[12px] leading-[1.6] text-slate-500">
          단순 점수가 아니라, 회사가 다음 회의에서 결정해야 할 순서로 정리됩니다.
        </p>
      </div>
      {previewItems.map((item, index) => (
        <div
          key={item.label}
          className={`py-2 ${
            index < previewItems.length - 1 ? "border-b border-slate-100" : ""
          }`}
        >
          <div className="flex min-h-[38px] items-center justify-between gap-3">
            <span className="text-[11px] font-[680] text-slate-500">{item.label}</span>
            <strong className="text-right text-[13px] font-[760] text-slate-900">{item.value}</strong>
          </div>
          <p className="m-0 mt-1 text-[11px] leading-[1.55] text-slate-500">{item.desc}</p>
        </div>
      ))}
    </aside>
  );
}
