interface BrandMarkProps {
  subtitle?: string;
}

export function BrandMark({ subtitle = "인사제도 정합성 진단" }: BrandMarkProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="0.5" y="0.5" width="27" height="27" rx="6.5" fill="white" stroke="var(--slate-300)" />
        <path d="M8 9.5h6.5c3 0 5.5 2.4 5.5 5.4v3.6" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M20 9.5h-6.5c-3 0-5.5 2.4-5.5 5.4v3.6"
          stroke="var(--teal-deep)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M10.5 7 8 9.5l2.5 2.5M17.5 7 20 9.5 17.5 12"
          stroke="var(--teal-deep)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="14" r="2" fill="var(--amber-soft)" stroke="var(--amber)" strokeWidth="1.2" />
      </svg>
      <div className="min-w-0">
        <div className="whitespace-nowrap text-[14px] font-[650] text-slate-900">
          Transition Gap
        </div>
        <div className="whitespace-nowrap text-[11px] text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}
