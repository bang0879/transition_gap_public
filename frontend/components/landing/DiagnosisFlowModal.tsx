"use client";

const steps = [
  ["01", "인사 철학 확인", "회사가 지향하는 운영 방향을 결과 화면의 기준점으로 사용합니다."],
  ["02", "조직 컨텍스트", "회사 규모, 성장 속도, 현재 페인포인트를 확인합니다."],
  ["03", "제도 현황 진단", "인력 · 채용, 보상, 평가, 리더십 운영 상태를 입력합니다."],
  ["04", "진단결과 요약", "제도 운영 점수와 먼저 볼 영역을 확인합니다."],
  ["05", "상세 분석", "점수가 낮은 이유와 현재 운영 방식을 해석합니다."],
  ["06", "트레이드오프", "얻는 것과 부담/주의점을 비교합니다."],
  ["07", "시나리오 비교", "도입할 제도와 실행 순서를 선택하고 조정합니다."],
  ["08", "실행 로드맵", "12개월 실행 순서와 검증 기준으로 정리합니다."],
];

interface DiagnosisFlowModalProps {
  open: boolean;
  onClose: () => void;
}

export function DiagnosisFlowModal({ open, onClose }: DiagnosisFlowModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 px-4">
      <section className="max-h-[86vh] w-full max-w-[760px] overflow-y-auto rounded-[12px] bg-white p-5 shadow-card">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">진단 흐름</p>
            <h3 className="m-0 mt-2 text-[20px] font-[700] text-slate-900">입력부터 실행 로드맵까지</h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-[12px] text-slate-500 hover:border-slate-300"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {steps.map(([num, title, desc]) => (
            <article key={num} className="rounded-[9px] border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[11px] font-[760] text-teal">{num}</span>
              <strong className="ml-2 text-[13px] text-slate-900">{title}</strong>
              <p className="m-0 mt-2 text-[12px] leading-[1.55] text-slate-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
