const STEPS = [
  {
    step: "01",
    title: "철학-제도 정합성",
    body: "회사의 인사철학과 현재 제도가 같은 방향을 보고 있는지 먼저 확인합니다.",
  },
  {
    step: "02",
    title: "운영 리스크와 전체 조감",
    body: "정합성이 어긋날 때 생길 문제와, 영역별 필요 기준 차이를 함께 봅니다.",
  },
  {
    step: "03",
    title: "다음 행동",
    body: "상세 분석, 트레이드오프, 로드맵으로 이어질 우선순위를 정합니다.",
  },
];

export function ResultReadingFlow() {
  return (
    <section className="mb-6 border-y border-slate-200 bg-white/80 py-3 print:hidden">
      <div className="grid gap-0 lg:grid-cols-3 lg:divide-x lg:divide-slate-200">
        {STEPS.map((item) => (
          <div key={item.step} className="flex gap-3 px-3 py-2 lg:px-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-[800] text-slate-500">
              {item.step}
            </span>
            <div>
              <p className="m-0 text-[12px] font-[720] text-slate-900">{item.title}</p>
              <p className="m-0 mt-0.5 text-[11px] leading-[1.55] text-slate-500">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
