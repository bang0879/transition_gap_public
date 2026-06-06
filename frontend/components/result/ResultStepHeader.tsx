interface ResultStepHeaderProps {
  step: string;
  title: string;
  body: string;
}

export function ResultStepHeader({ step, title, body }: ResultStepHeaderProps) {
  return (
    <div className="mb-3 mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 first:mt-0 first:border-t-0 first:pt-0 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="m-0 text-[11px] font-[780] tracking-[0.08em] text-teal">{step}</p>
        <h2 className="m-0 mt-1 text-[18px] font-[720] leading-[1.4] text-slate-900">{title}</h2>
      </div>
      <p className="m-0 max-w-[720px] text-[12px] leading-[1.7] text-slate-600">{body}</p>
    </div>
  );
}
