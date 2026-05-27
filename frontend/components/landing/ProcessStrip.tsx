const processSteps = [
  {
    num: "01",
    title: "철학·컨텍스트",
    desc: "회사의 인재 철학, 규모, 성장 속도, 현재 페인포인트를 먼저 확인합니다.",
  },
  {
    num: "02",
    title: "제도 현황 진단",
    desc: "인력·채용, 보상, 평가, 리더십 운영 상태를 영역별로 입력합니다.",
  },
  {
    num: "03",
    title: "진단결과 확인",
    desc: "인사제도 정합성 지수와 먼저 봐야 할 운영 충돌을 확인합니다.",
  },
  {
    num: "04",
    title: "벤치마크 확인",
    desc: "회사 맥락을 반영한 기준점과 중요한 시사점을 비교합니다.",
  },
  {
    num: "05",
    title: "트레이드오프",
    desc: "가능한 운영 방향과 얻는 것, 감수할 것을 함께 비교합니다.",
  },
  {
    num: "06",
    title: "시나리오 결정",
    desc: "우선 검토할 방향을 선택하고 필요한 제도와 실행 순서를 조정합니다.",
  },
  {
    num: "07",
    title: "실행 로드맵",
    desc: "선택한 방향을 12개월 실행 순서와 검증 기준으로 정리합니다.",
  },
];

export function ProcessStrip() {
  return (
    <div
      id="diagnosis-flow"
      className="mt-[72px] scroll-mt-8 overflow-x-auto rounded-card border border-slate-200"
    >
      <div className="grid min-w-[1120px] grid-cols-7">
        {processSteps.map((step, index) => (
          <div
            key={step.num}
            className={`bg-white p-5 ${index < processSteps.length - 1 ? "border-r border-slate-200" : ""}`}
          >
            <span className="text-[13px] font-[760] tracking-[0.08em] text-teal">
              {step.num}
            </span>
            <strong className="mt-2 block text-[14px] font-[680] text-slate-900">
              {step.title}
            </strong>
            <p className="mt-2 text-[12px] leading-[1.6] text-slate-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
