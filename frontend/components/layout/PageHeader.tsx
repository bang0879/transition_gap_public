import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, lead, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex w-full max-w-full flex-col gap-5 overflow-hidden lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div className="min-w-0 w-full max-w-[calc(100vw-48px)] sm:max-w-[760px]">
        <div className="mb-3 text-[11px] font-[760] uppercase tracking-[0.08em] text-teal">
          {eyebrow}
        </div>
        <h2
          className="m-0 text-[28px] font-[680] leading-[1.25] text-slate-900"
          style={{ overflowWrap: "anywhere", wordBreak: "keep-all" }}
        >
          {title}
        </h2>
        <p
          className="mt-3 max-w-[700px] text-[14px] leading-[1.75] text-slate-500"
          style={{ overflowWrap: "anywhere", wordBreak: "keep-all" }}
        >
          {lead}
        </p>
      </div>
      {actions ? <div className="flex w-full flex-wrap gap-[10px] print:hidden sm:w-auto lg:shrink-0">{actions}</div> : null}
    </header>
  );
}
