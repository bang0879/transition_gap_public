interface MemoBlockProps {
  icon?: string;
  title: string;
  body: string;
}

export function MemoBlock({ icon = "!", title, body }: MemoBlockProps) {
  return (
    <div
      className="mb-[22px] grid w-full max-w-[calc(100vw-48px)] grid-cols-[24px_minmax(0,1fr)] items-start gap-[14px] overflow-hidden rounded-[10px] border border-[#e8dcc7] p-[18px] print:break-inside-avoid sm:max-w-full"
      style={{ background: "linear-gradient(180deg, #fffaf0, #fffdf8)" }}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-amber-soft text-[13px] font-[800] text-amber">
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="m-0 mb-[5px] text-[14px] font-[680] leading-[1.45] text-slate-900"
          style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}
        >
          {title}
        </p>
        <p
          className="m-0 text-[12px] leading-[1.7] text-slate-600"
          style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
