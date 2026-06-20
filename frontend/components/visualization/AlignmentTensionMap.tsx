"use client";

import { useEffect, useMemo } from "react";
import { Badge } from "@/components/shared/Badge";
import { logEvent } from "@/lib/api/events";
import {
  alignmentPercent,
  displayAhaDomainName,
  getEntanglementMessage,
  getMirrorSentence,
  scoreTone,
  statusLabel,
  topGapAxis,
} from "@/lib/constants/ahaMoment";
import { useSessionStore } from "@/lib/store/session";
import type { AlignmentAxisOut, AlignmentMapConflictOut, AlignmentMapOut } from "@/lib/types/api";

interface AlignmentTensionMapProps {
  map: AlignmentMapOut;
  showSectionHeader?: boolean;
  showConflicts?: boolean;
  showTopGapSummary?: boolean;
  showOverallScore?: boolean;
  showDirectionSummary?: boolean;
  compactCards?: boolean;
}

type Tone = "teal" | "amber" | "coral" | "slate";
type DirectionGroup = "성과주의" | "공동체";

const STATUS_META: Record<
  AlignmentAxisOut["status_label"],
  { variant: Tone; label: string; bar: string; text: string }
> = {
  일치: {
    variant: "teal",
    label: "일치",
    bar: "bg-teal",
    text: "text-teal-deep",
  },
  주의: {
    variant: "amber",
    label: "주의",
    bar: "bg-amber",
    text: "text-amber",
  },
  심각: {
    variant: "coral",
    label: "심각",
    bar: "bg-coral",
    text: "text-coral",
  },
};

function cleanText(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.includes("�") || /[占챙챠챘챗]/.test(value)) return null;
  return value;
}

function topGapAxes(axes: AlignmentAxisOut[]): AlignmentAxisOut[] {
  return [...axes].sort((a, b) => alignmentPercent(a) - alignmentPercent(b)).slice(0, 3);
}

function conflictFallback(axis: AlignmentAxisOut): AlignmentMapConflictOut {
  return {
    id: `${axis.domain_id}_alignment_gap`,
    title: `${displayAhaDomainName(axis)} 제도의 정합성 괴리가 큽니다.`,
    detail:
      axis.business_risk ??
      `${displayAhaDomainName(axis)}에서 회사의 인사 철학과 실제 운영 방식이 서로 다른 신호를 보내고 있습니다.`,
    domains: [axis.domain_id],
    severity: axis.tension_level,
  };
}

function conflictsForDisplay(map: AlignmentMapOut, axes: AlignmentAxisOut[]): AlignmentMapConflictOut[] {
  const cleanConflicts = map.conflicts
    .map((conflict) => ({
      ...conflict,
      title: cleanText(conflict.title),
      detail: cleanText(conflict.detail),
    }))
    .filter((conflict): conflict is AlignmentMapConflictOut => Boolean(conflict.title && conflict.detail))
    .slice(0, 3);

  if (cleanConflicts.length > 0) return cleanConflicts;
  return topGapAxes(axes)
    .filter((axis) => statusLabel(axis) !== "일치")
    .map(conflictFallback)
    .slice(0, 3);
}

function conflictTone(conflict: AlignmentMapConflictOut, axes: AlignmentAxisOut[]): Tone {
  if (conflict.severity === "misaligned" || conflict.severity === "high") return "coral";
  if (conflict.severity === "watch" || conflict.severity === "medium") return "amber";

  const relatedAxes = axes.filter((axis) => conflict.domains.includes(axis.domain_id));
  const lowestPercent = relatedAxes.length > 0 ? Math.min(...relatedAxes.map(alignmentPercent)) : 100;
  if (lowestPercent < 50) return "coral";
  if (lowestPercent < 80) return "amber";
  return "slate";
}

function directionGroup(value: string): DirectionGroup {
  return value.includes("성과") || value.includes("시장") ? "성과주의" : "공동체";
}

function policyGroups(axes: AlignmentAxisOut[]): Record<DirectionGroup, AlignmentAxisOut[]> {
  return axes.reduce(
    (groups, axis) => {
      groups[directionGroup(axis.policy_direction)].push(axis);
      return groups;
    },
    { 성과주의: [], 공동체: [] } as Record<DirectionGroup, AlignmentAxisOut[]>,
  );
}

function directionSummary(axes: AlignmentAxisOut[]): string {
  const groups = policyGroups(axes);
  const performanceCount = groups.성과주의.length;
  const communityCount = groups.공동체.length;

  if (performanceCount === axes.length) {
    return "현재 제도는 전반적으로 성과주의 방향을 가리킵니다. 차등 보상, 명확한 평가, 빠른 의사결정 메시지를 일관되게 관리할 필요가 있습니다.";
  }
  if (communityCount === axes.length) {
    return "현재 제도는 전반적으로 공동체 방향을 가리킵니다. 신뢰, 안정성, 내부 축적의 메시지가 실제 운영에서도 유지되는지 확인하는 것이 중요합니다.";
  }

  const majority = performanceCount >= communityCount ? "성과주의" : "공동체";
  const minority = majority === "성과주의" ? "공동체" : "성과주의";
  const minorityAxes = groups[minority].map((axis) => displayAhaDomainName(axis)).join(", ");
  return `현재 제도는 ${majority} 방향이 우세하지만, ${minorityAxes}은 ${minority} 방향으로 작동합니다. 이 영역들이 현장에서 다른 인사 메시지로 읽힐 수 있습니다.`;
}

function axisEvidence(axis: AlignmentAxisOut): string[] {
  const summary = [`철학 방향: ${axis.philosophy_label}`, `현행 제도: ${axis.actual_label}`];
  const cleanEvidence = axis.evidence
    .filter((item) => cleanText(item))
    .filter((item) => item.length <= 42)
    .slice(0, 1);
  return [...summary, ...cleanEvidence].slice(0, 2);
}

function actualSummary(axis: AlignmentAxisOut): string {
  if (axis.business_risk && axis.tension_level === "misaligned") {
    return axis.business_risk;
  }
  return `현재 제도는 ${axis.actual_label} 방향으로 작동하는 신호를 보입니다.`;
}

function decisionQuestion(axis: AlignmentAxisOut): string {
  const domain = displayAhaDomainName(axis);
  if (domain === "보상") return "보상 메시지가 실제로 붙잡고 싶은 인재와 맞습니까?";
  if (domain === "평가") return "평가 기준이 보상과 피드백을 설명할 만큼 선명합니까?";
  if (domain === "채용") return "채용 메시지가 회사가 원하는 인재상과 같은 방향입니까?";
  if (domain === "인력운영") return "핵심 인재를 지키는 기준과 예외 원칙이 분명합니까?";
  if (domain === "리더십") return "리더의 의사결정 방식이 회사가 원하는 문화와 맞습니까?";
  return `${domain}에서 철학과 실제 운영 기준이 같은 방향인지 확인해야 합니다.`;
}

export function AlignmentTensionMap({
  map,
  showSectionHeader = true,
  showConflicts = true,
  showTopGapSummary = true,
  showOverallScore = true,
  showDirectionSummary = true,
  compactCards = false,
}: AlignmentTensionMapProps) {
  const sessionId = useSessionStore((state) => state.sessionId);
  const axes = map.axes ?? [];
  const lowestAxis = useMemo(() => topGapAxis(axes), [axes]);
  const misalignedCount = axes.filter((axis) => statusLabel(axis) === "심각").length;
  const conflicts = useMemo(() => conflictsForDisplay(map, axes), [map, axes]);
  const groups = useMemo(() => policyGroups(axes), [axes]);

  useEffect(() => {
    if (!sessionId) return;
    logEvent({
      session_id: sessionId,
      event_type: "alignment_card_map_view",
      page: "/result",
      metadata: {
        alignment_score: map.alignment_score,
        alignment_level: map.alignment_level,
        lowest_alignment_domain: lowestAxis?.domain_id,
        lowest_alignment_percent: lowestAxis ? alignmentPercent(lowestAxis) : null,
        misaligned_count: misalignedCount,
      },
      timestamp: new Date().toISOString(),
    });
  }, [lowestAxis, map.alignment_level, map.alignment_score, misalignedCount, sessionId]);

  if (axes.length === 0) {
    return null;
  }

  return (
    <section className="mb-[18px] w-full max-w-[calc(100vw-32px)] overflow-hidden rounded-[8px] border border-slate-200 bg-white p-4 print:break-inside-avoid sm:max-w-full">
      {showSectionHeader || showOverallScore ? (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          {showSectionHeader ? (
            <div>
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">
                정합성 괴리 분석
              </p>
              <h2 className="m-0 mt-2 text-[20px] font-[720] leading-[1.35] text-slate-950">
                회사의 인사 철학과 실제 제도가 같은 방향을 보고 있는지 확인합니다.
              </h2>
              <p className="m-0 mt-2 max-w-[860px] text-[12px] leading-[1.7] text-slate-600">
                인사 철학과 실제 운영 제도 사이의 거리가 <strong className="font-[760] text-slate-800">정합성 괴리</strong>입니다.
                괴리가 클수록 구성원은 같은 제도를 서로 다른 메시지로 받아들이고, 실행 리스크가 커질 수 있습니다.
              </p>
            </div>
          ) : null}
          {showOverallScore ? (
          <div className="min-w-[142px] rounded-[8px] border border-slate-200 bg-slate-50 p-3 text-right">
            <p className="m-0 text-[11px] font-[760] text-slate-400">전체 정합도</p>
            <p className="m-0 mt-1 text-[34px] font-[720] leading-none text-slate-950">
              {map.alignment_score}%
            </p>
            <Badge variant={scoreTone(map.alignment_score)}>{cleanText(map.alignment_level) ?? "정합성 확인"}</Badge>
          </div>
          ) : null}
        </div>
      ) : null}

      {showTopGapSummary && lowestAxis ? (
        <div className="mb-4 grid gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">가장 큰 엇박자</p>
            <p className="m-0 mt-2 text-[17px] font-[760] leading-[1.45] text-slate-950">
              {displayAhaDomainName(lowestAxis)} 정합 {alignmentPercent(lowestAxis)}%
            </p>
            <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-600">
              회사가 말하는 방향은 <strong className="font-[760] text-slate-800">{lowestAxis.philosophy_label}</strong>,
              실제 제도는 <strong className="font-[760] text-slate-800">{lowestAxis.actual_label}</strong>에 가깝습니다.
            </p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white px-3 py-2">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-400">대표가 먼저 물어야 할 질문</p>
            <p className="m-0 mt-2 text-[14px] font-[700] leading-[1.55] text-slate-950">
              {decisionQuestion(lowestAxis)}
            </p>
            <p className="m-0 mt-1 text-[12px] leading-[1.6] text-slate-500">
              이 질문에 답하지 않으면 제도 개선이 채용, 평가, 보상 중 한쪽만 바꾸는 일반론으로 흐를 수 있습니다.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-5">
        {axes.map((axis) => {
          const percent = alignmentPercent(axis);
          const status = statusLabel(axis);
          const meta = STATUS_META[status];
          const evidence = axisEvidence(axis);
          const mirror = getMirrorSentence(axis);

          return (
            <article
              key={axis.domain_id}
              className={`flex flex-col rounded-[8px] border border-slate-200 bg-white p-3 ${compactCards ? "min-h-[178px]" : "min-h-[226px]"}`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="m-0 text-[15px] font-[760] leading-[1.35] text-slate-900">
                  {displayAhaDomainName(axis)}
                </h3>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>

              <div className="grid gap-2 text-[12px] leading-[1.55]">
                <div>
                  <p className="m-0 text-[11px] font-[760] text-slate-400">인사 철학</p>
                  <p className="m-0 mt-0.5 font-[700] text-slate-800">{axis.philosophy_label}</p>
                  {!compactCards && axis.philosophy_note ? (
                    <p className="m-0 mt-0.5 text-[11px] leading-[1.45] text-slate-500">{axis.philosophy_note}</p>
                  ) : null}
                  {!compactCards && mirror ? (
                    <p className="m-0 mt-2 rounded-[7px] border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-[650] leading-[1.5] text-slate-700">
                      {mirror}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="m-0 text-[11px] font-[760] text-slate-400">현행 제도</p>
                  <p className="m-0 mt-0.5 font-[700] text-slate-800">{axis.actual_label}</p>
                  <p className={`m-0 mt-0.5 text-[11px] leading-[1.45] text-slate-500 ${compactCards ? "line-clamp-2" : "line-clamp-3"}`}>{actualSummary(axis)}</p>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={`text-[12px] font-[760] ${meta.text}`}>
                    [{meta.label}] 정합 {percent}%
                  </span>
                  <span className="text-[11px] font-[700] text-slate-400">{axis.policy_direction}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${percent}%` }} />
                </div>
                {!compactCards && evidence.length > 0 ? (
                  <ul className="m-0 mt-3 grid gap-1 p-0 text-[11px] leading-[1.45] text-slate-500">
                    {evidence.map((item) => (
                      <li key={item} className="list-none">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {showDirectionSummary || showConflicts ? (
      <div className={`mt-4 grid gap-3 ${showConflicts ? "xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" : ""}`}>
        {showDirectionSummary ? (
        <section className="rounded-[8px] border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">
                현행 인사제도 방향 요약
              </p>
              <p className="m-0 mt-2 text-[13px] font-[700] leading-[1.65] text-slate-800">
                {directionSummary(axes)}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(["성과주의", "공동체"] as const).map((direction) => (
              <div key={direction} className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
                <p className="m-0 text-[11px] font-[760] text-slate-400">{direction} 방향</p>
                <p className="m-0 mt-1 text-[13px] font-[700] leading-[1.45] text-slate-800">
                  {groups[direction].length > 0
                    ? `${groups[direction].map((axis) => displayAhaDomainName(axis)).join(", ")} (${groups[direction].length}개)`
                    : "해당 영역 없음"}
                </p>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {showConflicts ? (
        <section className="rounded-[8px] border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-slate-500">
              제도 간 충돌 경고
            </p>
            <Badge variant="slate">핵심 엇박자 요인</Badge>
          </div>
          <div className="grid gap-2">
            {conflicts.length > 0 ? (
              conflicts.map((conflict) => {
                const tone = conflictTone(conflict, axes);
                const relatedDomains = conflict.domains
                  .map((domainId) => axes.find((axis) => axis.domain_id === domainId))
                  .filter((axis): axis is AlignmentAxisOut => Boolean(axis))
                  .map((axis) => displayAhaDomainName(axis));
                const entanglement = getEntanglementMessage(conflict);

                return (
                  <article key={conflict.id} className="rounded-[8px] border border-slate-200 bg-white p-3">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          tone === "coral" ? "bg-coral" : tone === "amber" ? "bg-amber" : "bg-slate-300"
                        }`}
                        aria-hidden="true"
                      />
                      {relatedDomains.length > 0 ? <Badge variant={tone}>{relatedDomains.join(" ↔ ")}</Badge> : null}
                      <h3 className="m-0 text-[13px] font-[720] leading-[1.45] text-slate-900">
                        {entanglement?.title ?? conflict.title}
                      </h3>
                    </div>
                    <p className="m-0 text-[12px] leading-[1.65] text-slate-600">
                      {entanglement?.body ?? conflict.detail}
                    </p>
                  </article>
                );
              })
            ) : (
              <p className="m-0 rounded-[8px] border border-slate-200 bg-white p-3 text-[12px] leading-[1.65] text-slate-600">
                현재 입력 기준으로는 심각한 제도 간 충돌이 두드러지지 않습니다. 다만 정합도가 낮은 영역은 실제 운영 기준을 다시 맞추는 것이 좋습니다.
              </p>
            )}
          </div>
        </section>
        ) : null}
      </div>
      ) : null}
    </section>
  );
}
