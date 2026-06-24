import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { InsightCard } from "@/lib/insights/selectCards";

interface InsightCardCompactProps {
  card: InsightCard;
  variant?: "compact" | "hero" | "closing";
}

const citationLabels: Record<string, string> = {
  samsung_global: "Samsung 40개국에서 본 패턴",
  mercer: "글로벌 보상 데이터에서 반복되는 패턴",
  shrm_2025: "SHRM 2025에서 확인되는 흐름",
  hr_analytics_tf: "HR Analytics 관점에서 보는 신호",
  global_pattern: "글로벌 데이터에서 반복되는 패턴",
};

const styles = StyleSheet.create({
  card: {
    minHeight: 74,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    marginTop: 8,
  },
  heroCard: {
    minHeight: 104,
    borderColor: "#99D7CF",
    backgroundColor: "#F3FBFA",
    marginTop: 4,
    marginBottom: 10,
  },
  closingCard: {
    minHeight: 92,
    borderColor: "#C9E6DC",
    backgroundColor: "#F3FBF7",
    marginTop: 10,
  },
  rail: {
    width: 4,
    backgroundColor: "#0F766E",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  content: {
    flexGrow: 1,
    flexBasis: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  eyebrow: {
    fontSize: 7.6,
    fontWeight: 700,
    color: "#64748B",
    marginBottom: 4,
  },
  title: {
    fontSize: 10,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 5,
  },
  body: {
    fontSize: 8.7,
    lineHeight: 1.55,
    color: "#334155",
  },
  prompt: {
    fontSize: 8.8,
    lineHeight: 1.5,
    color: "#0F172A",
    marginTop: 6,
    fontStyle: "italic",
  },
  citation: {
    fontSize: 7.4,
    lineHeight: 1.35,
    color: "#64748B",
    marginTop: 5,
  },
  closingPrompt: {
    fontSize: 15,
    lineHeight: 1.38,
    fontWeight: 700,
    color: "#0F172A",
    marginTop: 6,
  },
});

export function InsightCardCompact({ card, variant = "compact" }: InsightCardCompactProps) {
  const cardStyle = variant === "hero" ? [styles.card, styles.heroCard] : variant === "closing" ? [styles.card, styles.closingCard] : styles.card;
  const citation = card.citationSource ? citationLabels[card.citationSource] : null;

  return (
    <View style={cardStyle}>
      <View style={styles.rail} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>INSIGHT</Text>
        <Text style={styles.title}>▸ {card.title}</Text>
        {variant === "closing" ? (
          <Text style={styles.closingPrompt}>"{card.ceoPrompt}"</Text>
        ) : (
          <>
            <Text style={styles.body}>{card.compactInsight}</Text>
            {citation ? <Text style={styles.citation}>{citation}</Text> : null}
            <Text style={styles.prompt}>→ "{card.ceoPrompt}"</Text>
          </>
        )}
      </View>
    </View>
  );
}
