"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { logEvent } from "@/lib/api/events";
import { useSessionStore } from "@/lib/store/session";
import type { AlignmentMapOut, AlignmentMapVectorOut } from "@/lib/types/api";

interface AlignmentMapProps {
  map: AlignmentMapOut;
}

const DOMAIN_COLORS: Record<string, string> = {
  compensation: "#c96f5a",
  evaluation: "#c9822b",
  recruitment: "#2f8f86",
  retention: "#2f7d5f",
  leadership: "#334155",
};

const X0 = 54;
const X1 = 526;
const Y0 = 42;
const Y1 = 358;
const CX = 290;
const CY = 200;

function sx(value: number): number {
  return CX + Math.max(-1, Math.min(1, value)) * ((X1 - X0) / 2);
}

function sy(value: number): number {
  return CY - Math.max(-1, Math.min(1, value)) * ((Y1 - Y0) / 2);
}

function vectorEnd(vector: AlignmentMapVectorOut) {
  const length = Math.max(0.18, Math.min(0.9, vector.magnitude));
  return {
    x: sx(vector.x * length),
    y: sy(vector.y * length),
  };
}

function scoreVariant(score: number): "teal" | "amber" | "coral" {
  if (score >= 75) return "teal";
  if (score >= 55) return "amber";
  return "coral";
}

export function AlignmentMap({ map }: AlignmentMapProps) {
  const sessionId = useSessionStore((state) => state.sessionId);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const visibleVectors = map.vectors.length > 0 ? map.vectors : [];
  const activeVector = useMemo(
    () => visibleVectors.find((vector) => vector.domain_id === activeDomain) ?? visibleVectors[0],
    [activeDomain, visibleVectors],
  );

  useEffect(() => {
    if (!sessionId) return;
    logEvent({
      session_id: sessionId,
      event_type: "alignment_map_view",
      page: "/result",
      metadata: {
        alignment_score: map.alignment_score,
        alignment_level: map.alignment_level,
        dispersion: map.dispersion,
      },
      timestamp: new Date().toISOString(),
    });
  }, [map.alignment_level, map.alignment_score, map.dispersion, sessionId]);

  const handleConflictClick = (conflictId: string) => {
    if (!sessionId) return;
    logEvent({
      session_id: sessionId,
      event_type: "alignment_conflict_click",
      page: "/result",
      metadata: { conflict_id: conflictId },
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <section className="mb-[18px] w-full max-w-[calc(100vw-32px)] overflow-hidden rounded-[10px] border border-slate-200 bg-white p-4 print:break-inside-avoid sm:max-w-full">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">정합성 괴리 맵</p>
          <h2 className="m-0 mt-2 text-[20px] font-[720] leading-[1.35] text-slate-900">
            {map.headline}
          </h2>
          <p className="m-0 mt-2 max-w-[820px] text-[12px] leading-[1.7] text-slate-600">
            {map.summary}
          </p>
        </div>
        <div className="min-w-[132px] rounded-[10px] border border-slate-200 bg-slate-50 p-3 text-right">
          <p className="m-0 text-[11px] font-[760] text-slate-400">방향 일치도</p>
          <p className="m-0 mt-1 text-[34px] font-[720] leading-none text-slate-900">
            {map.alignment_score}
          </p>
          <Badge variant={scoreVariant(map.alignment_score)}>{map.alignment_level}</Badge>
        </div>
      </div>

      <div className="mb-4 grid gap-2 rounded-[10px] border border-teal-line bg-teal-soft p-3 md:grid-cols-[1fr_auto] md:items-center">
        <p className="m-0 text-[13px] font-[700] leading-[1.55] text-teal-deep">
          읽는 법: 화살표가 한곳으로 모이면 정합, 서로 다른 방향으로 흩어지면 엇박자입니다.
        </p>
        <p className="m-0 text-[11px] font-[700] text-slate-500">
          보상 · 평가 · 채용 · 인력운영 · 리더십
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <svg
          viewBox="0 0 580 410"
          className="h-auto w-full rounded-[10px] border border-slate-200 bg-[#fffdf8]"
          role="img"
          aria-label="정합성 맵"
        >
          <defs>
            <marker
              id="alignment-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
            </marker>
            <style>{`.alignment-label{paint-order:stroke;stroke:#fffdf8;stroke-width:4px;stroke-linejoin:round;}`}</style>
          </defs>
          <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="10" fill="#ffffff" stroke="#e2e8f0" />
          <rect x={X0} y={Y0} width={(X1 - X0) / 2} height={(Y1 - Y0) / 2} fill="#e7f6f3" opacity=".35" />
          <rect x={CX} y={Y0} width={(X1 - X0) / 2} height={(Y1 - Y0) / 2} fill="#fff0ec" opacity=".35" />
          <rect x={X0} y={CY} width={(X1 - X0) / 2} height={(Y1 - Y0) / 2} fill="#fff4df" opacity=".3" />
          <rect x={CX} y={CY} width={(X1 - X0) / 2} height={(Y1 - Y0) / 2} fill="#f8fafc" opacity=".8" />
          <line x1={X0} y1={CY} x2={X1} y2={CY} stroke="#cbd5e1" />
          <line x1={CX} y1={Y0} x2={CX} y2={Y1} stroke="#cbd5e1" />
          <text x={X0} y={CY - 10} fontSize="11" fontWeight="700" fill="#64748b">
            공동체·장기 신뢰
          </text>
          <text x={X1} y={CY - 10} textAnchor="end" fontSize="11" fontWeight="700" fill="#64748b">
            성과·시장 경쟁
          </text>
          <text x={CX + 10} y={Y0 + 18} fontSize="11" fontWeight="700" fill="#64748b">
            제도·데이터 기반
          </text>
          <text x={CX + 10} y={Y1 - 12} fontSize="11" fontWeight="700" fill="#64748b">
            관계·자율 운영
          </text>
          <circle cx={sx(map.centroid_x)} cy={sy(map.centroid_y)} r="8" fill="#111827" opacity=".16" />
          <text x={sx(map.centroid_x) + 12} y={sy(map.centroid_y) + 4} fontSize="10" fontWeight="700" fill="#64748b">
            평균 방향
          </text>
          {visibleVectors.map((vector) => {
            const end = vectorEnd(vector);
            const color = DOMAIN_COLORS[vector.domain_id] ?? "#334155";
            return (
              <g
                key={vector.domain_id}
                onMouseEnter={() => setActiveDomain(vector.domain_id)}
                onFocus={() => setActiveDomain(vector.domain_id)}
              >
                <line
                  x1={CX}
                  y1={CY}
                  x2={end.x}
                  y2={end.y}
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  markerEnd="url(#alignment-arrow)"
                  opacity={activeDomain && activeDomain !== vector.domain_id ? 0.36 : 0.95}
                />
                <circle cx={end.x} cy={end.y} r="6" fill={color} />
                <text
                  x={end.x}
                  y={end.y - 12}
                  textAnchor="middle"
                  className="alignment-label"
                  fontSize="11"
                  fontWeight="760"
                  fill={color}
                >
                  {vector.domain_name}
                </text>
              </g>
            );
          })}
        </svg>

        <aside className="grid gap-3">
          <div className="rounded-[10px] border border-slate-200 bg-white p-3">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">영역별 방향</p>
            <div className="mt-2 grid gap-1.5">
              {visibleVectors.map((vector) => (
                <button
                  key={vector.domain_id}
                  type="button"
                  onClick={() => setActiveDomain(vector.domain_id)}
                  className="grid grid-cols-[58px_minmax(0,1fr)] items-center gap-2 rounded-[8px] border border-slate-100 bg-slate-50 px-2.5 py-2 text-left"
                >
                  <span className="text-[12px] font-[760]" style={{ color: DOMAIN_COLORS[vector.domain_id] ?? "#334155" }}>
                    {vector.domain_name}
                  </span>
                  <span className="truncate text-[12px] font-[650] text-slate-600">
                    → {vector.direction_label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {activeVector ? (
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">선택 영역</p>
              <h3 className="m-0 mt-2 text-[15px] font-[720] text-slate-900">
                {activeVector.domain_name} · {activeVector.direction_label}
              </h3>
              <ul className="m-0 mt-2 grid gap-1.5 p-0 text-[12px] leading-[1.55] text-slate-600">
                {activeVector.evidence.map((item) => (
                  <li key={item} className="list-none">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {map.conflicts.slice(0, 2).map((conflict) => (
            <button
              key={conflict.id}
              type="button"
              onClick={() => handleConflictClick(conflict.id)}
              className="rounded-[10px] border border-amber/25 bg-[#fffaf0] p-3 text-left"
            >
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-amber">엇박자 포인트</p>
              <h3 className="m-0 mt-2 text-[14px] font-[700] leading-[1.45] text-slate-900">
                {conflict.title}
              </h3>
              <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-600">
                {conflict.detail}
              </p>
            </button>
          ))}
        </aside>
      </div>
    </section>
  );
}
