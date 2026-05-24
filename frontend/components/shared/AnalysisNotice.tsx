interface AnalysisNoticeProps {
  eyebrow: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}

export function AnalysisNotice({ eyebrow, title, body, children }: AnalysisNoticeProps) {
  return (
    <section className="flex min-h-[520px] items-center justify-center">
      <div className="w-full max-w-[620px] rounded-[10px] border border-slate-200 bg-white p-7 text-center print:break-inside-avoid">
        <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">{eyebrow}</p>
        <h2 className="m-0 mt-3 text-[24px] font-[680] leading-[1.3] text-slate-900">{title}</h2>
        <p className="mx-auto mt-3 max-w-[500px] text-[13px] leading-[1.75] text-slate-500">{body}</p>
        {children ? <div className="mt-5 flex flex-wrap justify-center gap-2 print:hidden">{children}</div> : null}
      </div>
    </section>
  );
}
