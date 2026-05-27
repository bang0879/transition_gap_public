import { Badge } from "@/components/shared/Badge";
import { GlossaryText } from "@/components/shared/GlossaryText";

interface QuestionBlockProps {
  title: string;
  help?: string;
  badge?: {
    label: string;
    variant?: "teal" | "amber" | "coral" | "slate";
  };
  children: React.ReactNode;
}

export function QuestionBlock({ title, help, badge, children }: QuestionBlockProps) {
  return (
    <article className="rounded-[10px] border border-slate-200 bg-white p-[18px] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
      <div className="mb-[14px] flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[14px] font-[680] leading-[1.45] text-slate-900">
            <GlossaryText text={title} />
          </p>
          {help ? (
            <p className="mt-[6px] text-[12px] leading-[1.55] text-slate-500">
              <GlossaryText text={help} />
            </p>
          ) : null}
        </div>
        {badge ? (
          <div className="flex-shrink-0">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        ) : null}
      </div>
      {children}
    </article>
  );
}
