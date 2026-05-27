import { HR_GLOSSARY, HrGlossaryTerm } from "@/lib/constants/hrGlossary";
import { TermTooltip } from "./TermTooltip";

const TERMS = Object.keys(HR_GLOSSARY).sort((a, b) => b.length - a.length) as HrGlossaryTerm[];
const TERM_PATTERN = new RegExp(`(${TERMS.map(escapeRegExp).join("|")})`, "g");

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function GlossaryText({ text }: { text: string }) {
  return (
    <>
      {text.split(TERM_PATTERN).map((part, index) => {
        if (isGlossaryTerm(part)) {
          return <TermTooltip key={`${part}-${index}`} term={part} />;
        }

        return part;
      })}
    </>
  );
}

function isGlossaryTerm(value: string): value is HrGlossaryTerm {
  return Object.prototype.hasOwnProperty.call(HR_GLOSSARY, value);
}
