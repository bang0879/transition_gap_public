import type { DiagnosticReportViewModel } from "@/lib/report/buildDiagnosticReportViewModel";
import {
  BlindSpotGrid,
  DecisionMemoChecklist,
  StrategicOptionsGrid,
  TensionChain,
  TensionGauge,
} from "./ReportCharts";

function ReportPage({
  pageNumber,
  title,
  children,
}: {
  pageNumber: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[1122px] w-[794px] flex-col bg-white px-[56px] py-[48px] text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.14)] print:min-h-screen print:w-full print:shadow-none">
      <header className="flex items-center justify-between border-b border-slate-200 pb-3 text-[10px] font-[760] tracking-[0.08em] text-slate-400">
        <span>TRANSITION GAP DIAGNOSTIC REPORT</span>
        <span>{String(pageNumber).padStart(2, "0")} / 06</span>
      </header>
      <main className="flex flex-1 flex-col pt-8">{children}</main>
      <footer className="mt-auto border-t border-slate-200 pt-3 text-[10px] text-slate-400">
        {title}
      </footer>
    </section>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div>
      <p className="m-0 text-[10px] font-[800] tracking-[0.12em] text-[#4f8f84]">{eyebrow}</p>
      <h2 className="m-0 mt-2 text-[27px] font-[760] leading-[1.25] tracking-normal text-slate-950">{title}</h2>
      {body ? <p className="m-0 mt-3 text-[12px] leading-[1.7] text-slate-600">{body}</p> : null}
    </div>
  );
}

export function ReportPreview({ report }: { report: DiagnosticReportViewModel }) {
  return (
    <div className="min-h-screen bg-[#eef2f1] py-8 print:bg-white print:py-0">
      <div className="mx-auto flex max-w-[960px] flex-col gap-8 print:max-w-none print:gap-0">
        <ReportPage pageNumber={1} title="Cover">
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <p className="m-0 text-[12px] font-[800] tracking-[0.16em] text-[#4f8f84]">TRANSITION GAP</p>
              <h1 className="m-0 mt-16 max-w-[560px] text-[44px] font-[780] leading-[1.16] tracking-normal text-slate-950">
                {report.cover.title}
              </h1>
              <p className="m-0 mt-4 text-[17px] font-[650] text-slate-500">{report.cover.subtitle}</p>
            </div>
            <div>
              <p className="m-0 max-w-[620px] border-l-[4px] border-[#4f8f84] pl-5 text-[24px] font-[720] leading-[1.45] text-slate-900">
                {report.cover.headline}
              </p>
              <div className="mt-12 grid grid-cols-4 gap-3 border-t border-slate-200 pt-5">
                <Meta label="진단일" value={report.cover.completedDateLabel} />
                <Meta label="진단 모드" value={report.cover.diagnosisModeLabel} />
                <Meta label="조직 규모" value={report.cover.headcountLabel} />
                <Meta label="작성 기준" value={report.cover.basisLabel} />
              </div>
            </div>
          </div>
        </ReportPage>

        <ReportPage pageNumber={2} title="Executive Interpretation">
          <SectionTitle
            eyebrow="EXECUTIVE INTERPRETATION"
            title="진단 결과보다 먼저, 이 회사의 운영 패턴을 읽습니다."
            body={report.executive.headline}
          />
          <div className="mt-8 grid grid-cols-[1fr_230px] gap-5">
            <article className="rounded-[10px] border border-slate-200 bg-white p-5">
              <h3 className="m-0 text-[17px] font-[760] leading-[1.45] text-slate-950">이 회사의 핵심 패턴</h3>
              <p className="m-0 mt-3 text-[13px] leading-[1.85] text-slate-650">{report.executive.corePattern}</p>
              <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                <InterpretationLine label="대표님이 의도한 방향" body={report.executive.ceoIntent} />
                <InterpretationLine label="조직이 실제로 경험하는 방식" body={report.executive.organizationExperience} />
                <InterpretationLine label="따라서 지금의 전환 과제" body={report.executive.transitionTask} />
              </div>
            </article>
            <aside className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
              <p className="m-0 text-[11px] font-[800] tracking-[0.08em] text-slate-400">KEY SIGNALS</p>
              <div className="mt-3 space-y-3">
                {report.executive.keySignals.map((signal) => (
                  <div key={signal.label} className="rounded-[8px] bg-white p-3">
                    <p className="m-0 text-[11px] font-[760] text-slate-950">{signal.label}</p>
                    <p className="m-0 mt-1 text-[10px] leading-[1.55] text-slate-600">{signal.body}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
          <div className="mt-5">
            <TensionGauge gauge={report.executive.tensionGauge} />
          </div>
          <div className="mt-5 rounded-[8px] border border-[#e5d3a6] bg-[#fffaf0] p-4">
            <p className="m-0 text-[12px] font-[760] text-[#7b5d1f]">대표님이 과소평가하기 쉬운 비용</p>
            <p className="m-0 mt-2 text-[12px] leading-[1.75] text-slate-650">{report.executive.underestimatedCost}</p>
            <p className="m-0 mt-3 text-[11px] leading-[1.65] text-slate-500">{report.executive.stageInterpretation}</p>
          </div>
        </ReportPage>

        <ReportPage pageNumber={3} title="CEO Blind Spots">
          <SectionTitle
            eyebrow="CEO BLIND SPOTS"
            title="대표님이 불편하지만 유용하게 보셔야 할 지점입니다."
            body="아래 내용은 점수 해석이 아니라, 현행 운영이 구성원에게 다르게 읽힐 수 있는 지점을 정리한 것입니다."
          />
          <div className="mt-8">
            <BlindSpotGrid blindSpots={report.blindSpots} />
          </div>
        </ReportPage>

        <ReportPage pageNumber={4} title="Priority Tension">
          <SectionTitle
            eyebrow="PRIORITY TENSION"
            title={report.priorityTension.headline}
            body="우선순위 영역은 따로 떼어 고칠수록 실제 문제가 흐려질 수 있습니다. 함께 묶인 운영 부담을 먼저 보셔야 합니다."
          />
          <div className="mt-8">
            <TensionChain tension={report.priorityTension} />
          </div>
        </ReportPage>

        <ReportPage pageNumber={5} title="Strategic Options">
          <SectionTitle
            eyebrow="STRATEGIC OPTIONS"
            title="아래 방향은 추천 순위가 아니라, 감수할 운영 비용의 비교입니다."
            body="방향을 고르는 순간 대표님께 요구되는 태도와 리더 운영 부담도 함께 달라집니다."
          />
          <div className="mt-8">
            <StrategicOptionsGrid options={report.strategicOptions} />
          </div>
        </ReportPage>

        <ReportPage pageNumber={6} title="CEO Decision Memo">
          <SectionTitle
            eyebrow="CEO DECISION MEMO"
            title="이번 회의에서 합의할 것과 아직 미룰 것을 나눕니다."
            body="이 페이지는 실행 로드맵이 아니라, 대표님이 리더십 회의에서 바로 사용할 의사결정 메모입니다."
          />
          <div className="mt-8">
            <DecisionMemoChecklist memo={report.decisionMemo} />
          </div>
        </ReportPage>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="m-0 text-[10px] font-[800] tracking-[0.08em] text-slate-400">{label}</p>
      <p className="m-0 mt-2 text-[12px] font-[680] leading-[1.45] text-slate-800">{value}</p>
    </div>
  );
}

function InterpretationLine({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="m-0 text-[11px] font-[760] text-[#4f8f84]">{label}</p>
      <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-650">{body}</p>
    </div>
  );
}
