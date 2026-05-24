"use client";

import type { AreaAnalysisOut } from "@/lib/types/api";

interface RadarChartProps {
  areas: AreaAnalysisOut[];
}

const AREA_ORDER = ["retention", "recruitment", "compensation", "evaluation", "leadership"];
const AREA_LABELS = ["인력 안정성", "채용", "보상", "평가", "리더십"];
const R = 110;
const CX = 260;
const CY = 150;

function angleForIndex(i: number): number {
  return (Math.PI * 2 * i) / 5 - Math.PI / 2;
}

function pointAt(i: number, ratio: number): [number, number] {
  const angle = angleForIndex(i);
  return [CX + Math.cos(angle) * R * ratio, CY + Math.sin(angle) * R * ratio];
}

function polygon(ratios: number[]): string {
  return ratios.map((ratio, index) => pointAt(index, ratio).join(",")).join(" ");
}

export function RadarChart({ areas }: RadarChartProps) {
  const areaMap = Object.fromEntries(areas.map((area) => [area.area_id, area]));
  const scoreRatios = AREA_ORDER.map((id) => ((areaMap[id]?.score ?? 50) / 100));
  const benchmarkRatios = AREA_ORDER.map((id) => ((areaMap[id]?.benchmark ?? 70) / 100));
  const gridLevels = [1, 0.75, 0.5, 0.25];
  const gridStrokes = ["#e2e8f0", "#e2e8f0", "#eef2f7", "#f1f5f9"];

  return (
    <svg viewBox="0 0 520 300" className="h-auto w-full" role="img" aria-label="5영역 레이더 차트">
      <defs>
        <filter id="radar-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity=".08" />
        </filter>
      </defs>
      {gridLevels.map((level, index) => (
        <polygon key={level} points={polygon(Array(5).fill(level))} fill="none" stroke={gridStrokes[index]} />
      ))}
      {Array.from({ length: 5 }).map((_, index) => {
        const [x, y] = pointAt(index, 1.07);
        return <line key={index} x1={CX} y1={CY} x2={x} y2={y} stroke="#eef2f7" />;
      })}
      <polygon points={polygon(benchmarkRatios)} fill="rgba(203,213,225,.16)" stroke="#cbd5e1" strokeDasharray="5 4" strokeWidth="1.5" />
      <polygon points={polygon(scoreRatios)} fill="rgba(47,143,134,.16)" stroke="#2f8f86" strokeWidth="2.5" filter="url(#radar-shadow)" />
      {scoreRatios.map((ratio, index) => {
        const [x, y] = pointAt(index, ratio);
        return <circle key={index} cx={x} cy={y} r="4" fill="#2f8f86" />;
      })}
      {AREA_LABELS.map((label, index) => {
        const [x, y] = pointAt(index, 1.22);
        const anchor = index === 0 ? "middle" : x > CX ? "start" : "end";
        return (
          <text key={label} x={x} y={y} textAnchor={anchor} fill="#475569" fontSize="12" fontWeight="650">
            {label}
          </text>
        );
      })}
    </svg>
  );
}
