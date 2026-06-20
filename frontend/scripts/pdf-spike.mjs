import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToFile,
} from "@react-pdf/renderer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(frontendRoot, "..");
const fontRoot = path.join(frontendRoot, "public", "fonts");
const outputDir = path.join(workspaceRoot, "tmp", "pdfs");
const outputPath = path.join(outputDir, "react-pdf-pretendard-spike.pdf");

fs.mkdirSync(outputDir, { recursive: true });

Font.register({
  family: "Pretendard",
  fonts: [
    {
      src: path.join(fontRoot, "pretendard-400.woff"),
      fontWeight: 400,
    },
    {
      src: path.join(fontRoot, "pretendard-700.woff"),
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingHorizontal: 48,
    paddingBottom: 44,
    fontFamily: "Pretendard",
    color: "#172033",
    backgroundColor: "#ffffff",
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: 700,
    color: "#2f8f86",
    letterSpacing: 1.1,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 1.65,
    color: "#526077",
    marginBottom: 28,
  },
  card: {
    border: "1 solid #dfe7ef",
    borderRadius: 10,
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#f8fbfb",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  body: {
    fontSize: 10.5,
    lineHeight: 1.7,
    color: "#3c4658",
  },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 28,
    fontSize: 8,
    color: "#8a94a6",
  },
});

function SpikeDocument() {
  return React.createElement(
    Document,
    { title: "Transition Gap PDF Spike" },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.eyebrow }, "TRANSITION GAP REPORT"),
      React.createElement(
        Text,
        { style: styles.title },
        "막내테스트 주식회사 인사제도 진단 보고서"
      ),
      React.createElement(
        Text,
        { style: styles.subtitle },
        "이 문서는 @react-pdf/renderer와 Pretendard 조합이 한국어 문장, 기업명, 진단 해석을 PDF로 안정적으로 렌더링하는지 확인하기 위한 스파이크입니다."
      ),
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.cardTitle }, "Executive Summary"),
        React.createElement(
          Text,
          { style: styles.body },
          "Foundation Gap으로 판별된 회사는 정합성 점수보다 먼저 운영 기준 부재를 확인해야 합니다. 보상 기준, 평가 루프, 리더 역할이 동시에 비어 있으면 6개월 안에 보상 형평성, 평가 수용성, 리더별 운영 편차가 커질 수 있습니다."
        )
      ),
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.cardTitle }, "다음 행동"),
        React.createElement(
          Text,
          { style: styles.body },
          "30일 안에는 역할별 보상 판단 기준을 정리하고, 60일 안에는 최소 평가 루프를 설계하며, 90일 안에는 리더별 1on1 운영 기준을 맞춥니다. 새 제도를 많이 도입하기보다 먼저 비어 있는 기준을 채우는 것이 중요합니다."
        )
      ),
      React.createElement(Text, { style: styles.footer }, "Transition Gap - PDF spike - 2026-06-20")
    )
  );
}

await renderToFile(React.createElement(SpikeDocument), outputPath);
console.log(outputPath);
