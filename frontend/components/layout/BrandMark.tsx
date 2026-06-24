interface BrandMarkProps {
  subtitle?: string;
  supportText?: string;
}

export function BrandMark({
  subtitle = "인사 운영을 프리즘으로 진단",
  supportText = "철학·제도·충돌을 투명하게 확인",
}: BrandMarkProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mt-0.5 shrink-0"
      >
        <rect x="0.5" y="0.5" width="33" height="33" rx="7.5" fill="var(--surface-warm)" stroke="var(--slate-300)" />
        <path d="M7 21.7 16.9 7.5l10 12.2-7.1 7-8.7-1.4L7 21.7Z" fill="var(--slate-50)" stroke="var(--slate-500)" strokeWidth="0.85" strokeLinejoin="round" />
        <path d="M7 21.7 16.9 7.5l-1.3 18.1-4.5-.3L7 21.7Z" fill="white" opacity="0.78" />
        <path d="M16.9 7.5 26.9 19.7l-7.1 7-4.2-1.1 1.3-18.1Z" fill="var(--teal-soft)" opacity="0.88" />
        <path d="M11.1 25.3 15.6 25.6l4.2 1.1-8.7-1.4Z" fill="var(--slate-300)" opacity="0.7" />
        <path d="M13.1 23.6 16.7 14.3l5.1 7.5-5.8 4-2.9-2.2Z" fill="var(--teal)" opacity="0.3" />
        <path d="M15.6 25.6 16.7 14.3l2.9 7.7-4 3.6Z" fill="var(--slate-700)" opacity="0.48" />
        <path d="M16.9 7.5 15.6 25.6M7 21.7 15.6 25.6l4.2 1.1M15.6 25.6l11.3-5.9" stroke="var(--slate-400)" strokeOpacity="0.62" strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="min-w-0">
        <div
          className="whitespace-nowrap text-[15px] font-[720] leading-[1.1] text-slate-900"
          style={{ fontFamily: "Pretendard, Inter, Noto Sans KR, sans-serif" }}
        >
          HR Prism
        </div>
        <div className="mt-1 max-w-[160px] truncate text-[10.5px] font-[640] leading-[1.25] text-slate-700">
          {subtitle}
        </div>
        {supportText ? (
          <div className="mt-0.5 max-w-[160px] truncate text-[9.5px] font-[400] leading-[1.25] text-slate-400">
            {supportText}
          </div>
        ) : null}
      </div>
    </div>
  );
}