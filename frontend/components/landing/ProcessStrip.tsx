const processSteps = [
  {
    num: "01",
    title: "진단 입력",
    desc: "조직 컨텍스트와 제도 운영 상태를 대표 단독 입력으로 정리합니다.",
  },
  {
    num: "02",
    title: "정렬 상태 요약",
    desc: "기준점 대비 차이와 제도 간 엇박자를 대표 의사결정 순서로 정리합니다.",
  },
  {
    num: "03",
    title: "트레이드오프 분석",
    desc: "무엇을 얻고 어떤 비용을 감수할지 운영 방향의 선택지를 비교합니다.",
  },
  {
    num: "04",
    title: "실행 로드맵",
    desc: "한 번에 바꾸지 않고 12개월 단계별 실행 순서로 전환합니다.",
  },
];

export function ProcessStrip() {
  return (
    <div id="diagnosis-flow" className="mt-[72px] scroll-mt-8 grid grid-cols-1 overflow-hidden rounded-card border border-slate-200 md:grid-cols-4">
      {processSteps.map((step, index) => (
        <div
          key={step.num}
          className={`bg-white p-6 ${index < processSteps.length - 1 ? "border-b border-slate-200 md:border-b-0 md:border-r" : ""}`}
        >
          <span className="text-[13px] font-[760] tracking-[0.08em] text-teal">
            {step.num}
          </span>
          <strong className="mt-2 block text-[15px] font-[680] text-slate-900">
            {step.title}
          </strong>
          <p className="mt-2 text-[13px] leading-[1.6] text-slate-500">{step.desc}</p>
        </div>
      ))}
    </div>
  );
}
