import type { InsightCard } from "./selectCards";

export interface InsightInterpolationContext {
  companyName?: string | null;
  currentHeadcount?: number | string | null;
  targetHeadcount?: number | string | null;
  recentExitCount?: number | string | null;
  exitRole?: string | null;
}

const DEFAULT_VALUES: Required<Record<keyof InsightInterpolationContext, string>> = {
  companyName: "이 회사",
  currentHeadcount: "현재 규모",
  targetHeadcount: "다음 성장 구간",
  recentExitCount: "최근",
  exitRole: "핵심 역할",
};

function normalizedValue(value: string | number | null | undefined, fallback: string): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function interpolateText(text: string, context: InsightInterpolationContext): string {
  return text.replace(/\{(companyName|currentHeadcount|targetHeadcount|recentExitCount|exitRole)\}/g, (_, key: keyof InsightInterpolationContext) =>
    normalizedValue(context[key], DEFAULT_VALUES[key]),
  );
}

export function interpolateCard(card: InsightCard, context: InsightInterpolationContext): InsightCard {
  return {
    ...card,
    title: interpolateText(card.title, context),
    generalView: interpolateText(card.generalView, context),
    insight: interpolateText(card.insight, context),
    compactInsight: interpolateText(card.compactInsight, context),
    ceoPrompt: interpolateText(card.ceoPrompt, context),
  };
}
