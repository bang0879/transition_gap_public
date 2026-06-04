"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/forms/BottomNav";
import { ContextPanel } from "@/components/forms/ContextPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnalysisNotice } from "@/components/shared/AnalysisNotice";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import { useResponsesStore } from "@/lib/store/responses";
import { buildPhilosophyProfile, type PhilosophySummaryItem } from "@/lib/utils/philosophyProfile";

function conflictForSummary(
  itemId: PhilosophySummaryItem["id"],
  conflicts: ReturnType<typeof buildPhilosophyProfile>["conflicts"],
) {
  return conflicts.find((conflict) => conflict.domains.includes(itemId));
}

function conflictPairText(conflict: ReturnType<typeof buildPhilosophyProfile>["conflicts"][number]) {
  return `${conflict.domain_labels[0]} ↔ ${conflict.domain_labels[1]} 방향이 서로 부딪힙니다.`;
}

export default function PhilosophyProfilePage() {
  const router = useRouter();
  const responses = useResponsesStore((state) => state.responses);
  const profile = buildPhilosophyProfile(responses);
  usePageTracking("/diagnose/philosophy/profile");

  if (!profile.isComplete) {
    return (
      <AnalysisNotice
        eyebrow="철학 입력 필요"
        title="대표님의 인사 철학 4개 항목을 먼저 선택해 주세요."
        body={`현재 ${profile.answeredCount}/4개 항목이 입력되었습니다. 네 가지 기준을 모두 선택하면 철학 간 충돌 여부를 바로 확인할 수 있습니다.`}
      >
        <Button variant="primary" onClick={() => router.push("/diagnose/philosophy")}>
          철학 입력으로 돌아가기
        </Button>
      </AnalysisNotice>
    );
  }

  const hasConflicts = profile.conflicts.length > 0;
  const summaryPairs = [
    ["L0-1", "L0-2"],
    ["L0-3", "L0-4"],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow="01-1. 철학 프로필 피드백"
        title="대표님의 인사 철학이 한 방향을 보고 있는지 먼저 확인합니다."
        lead="이 화면은 답을 고치게 만드는 설문 검사가 아닙니다. 선택한 철학 사이에서 실행 단계에 부딪힐 수 있는 지점을 미리 확인하고, 그 인식 위에서 현행 제도 진단으로 넘어갑니다."
        actions={
          <>
            <Button onClick={() => router.push("/diagnose/philosophy")}>철학 다시 보기</Button>
            <Button variant="primary" onClick={() => router.push("/diagnose/context")}>
              다음: 조직 컨텍스트
            </Button>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="m-0 text-[11px] font-[760] tracking-[0.08em] text-teal">철학 선택 요약</p>
                <h2 className="m-0 mt-2 text-[20px] font-[680] leading-[1.35] text-slate-900">
                  4개 기준이 결과 화면의 정합성 기준점이 됩니다.
                </h2>
              </div>
              <Badge variant={hasConflicts ? "amber" : "teal"}>
                {hasConflicts ? `${profile.conflicts.length}개 충돌 감지` : "일관된 방향"}
              </Badge>
            </div>

            <div className="grid gap-3">
              {summaryPairs.map(([leftId, rightId]) => {
                const leftItem = profile.summaries.find((item) => item.id === leftId);
                const rightItem = profile.summaries.find((item) => item.id === rightId);
                const pairConflict = profile.conflicts.find(
                  (conflict) => conflict.domains.includes(leftId) && conflict.domains.includes(rightId),
                );

                if (!leftItem || !rightItem) return null;

                const renderSummaryCard = (item: PhilosophySummaryItem) => {
                  const conflict = conflictForSummary(item.id, profile.conflicts);
                  const cardTone = conflict
                    ? "border-coral/35 bg-[#fff7f5] shadow-[inset_0_0_0_1px_rgba(201,111,90,0.10)]"
                    : "border-slate-200 bg-slate-50/60";

                  return (
                    <article key={item.id} className={`relative rounded-[10px] border p-4 ${cardTone}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className={`m-0 text-[11px] font-[760] tracking-[0.08em] ${conflict ? "text-coral" : "text-slate-400"}`}>
                          {item.domain}
                        </p>
                        {conflict ? <Badge variant="coral">충돌쌍</Badge> : <Badge variant="teal">정렬</Badge>}
                      </div>
                      <h3 className="m-0 mt-2 text-[16px] font-[700] leading-[1.35] text-slate-900">{item.label}</h3>
                      <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-500">{item.note}</p>
                    </article>
                  );
                };

                return (
                  <div key={`${leftId}-${rightId}`} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_112px_minmax(0,1fr)] md:items-stretch">
                    {renderSummaryCard(leftItem)}
                    {pairConflict ? (
                      <div className="flex items-center justify-center">
                        <div className="flex w-full items-center justify-center md:relative">
                          <span className="hidden h-px flex-1 border-t border-dashed border-coral md:block" />
                          <span className="inline-flex max-w-full items-center justify-center rounded-full border border-coral/25 bg-white px-3 py-1.5 text-center text-[11px] font-[760] leading-[1.3] text-coral shadow-soft">
                            {pairConflict.domain_labels[0]} ↔ {pairConflict.domain_labels[1]}
                          </span>
                          <span className="hidden h-px flex-1 border-t border-dashed border-coral md:block" />
                        </div>
                      </div>
                    ) : (
                      <div className="hidden items-center justify-center md:flex">
                        <span className="h-px w-full border-t border-dashed border-teal-line" />
                      </div>
                    )}
                    {pairConflict ? (
                      <p className="m-0 rounded-[8px] border border-coral/20 bg-white px-3 py-2 text-center text-[11px] font-[650] leading-[1.55] text-coral md:hidden">
                        {conflictPairText(pairConflict)}
                      </p>
                    ) : null}
                    {renderSummaryCard(rightItem)}
                  </div>
                );
              })}
            </div>
          </section>

          <section
            className={`rounded-[10px] border p-5 shadow-soft ${
              hasConflicts ? "border-slate-200 bg-blue-soft" : "border-teal-line bg-teal-soft"
            }`}
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={`m-0 text-[11px] font-[760] tracking-[0.08em] ${hasConflicts ? "text-slate-500" : "text-teal-deep"}`}>
                  철학 간 충돌 확인
                </p>
                <h2 className="m-0 mt-2 text-[20px] font-[680] leading-[1.35] text-slate-900">
                  {hasConflicts ? "실행 단계에서 부딪힐 수 있는 지점이 있습니다." : "대표님의 철학은 일관된 방향을 가리키고 있습니다."}
                </h2>
              </div>
              <Badge variant={hasConflicts ? "slate" : "teal"}>{hasConflicts ? "해석 필요" : "일치"}</Badge>
            </div>

            {hasConflicts ? (
              <div className="grid gap-3">
                {profile.conflicts.map((conflict) => (
                  <article key={conflict.id} className="rounded-[10px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="coral">{conflict.domain_labels[0]} ↔ {conflict.domain_labels[1]}</Badge>
                      <span className="text-[11px] font-[700] text-slate-500">철학 방향 충돌</span>
                    </div>
                    <h3 className="m-0 text-[15px] font-[720] leading-[1.4] text-slate-900">{conflict.title}</h3>
                    <p className="m-0 mt-2 text-[13px] leading-[1.7] text-slate-600">{conflict.detail}</p>
                    <p className="m-0 mt-2 rounded-[8px] bg-slate-50 px-3 py-2 text-[12px] font-[650] leading-[1.65] text-slate-700">
                      {conflict.implication}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[10px] border border-teal-line bg-white p-4">
                <h3 className="m-0 text-[15px] font-[720] leading-[1.4] text-slate-900">
                  {profile.consistent_interpretation.title}
                </h3>
                <p className="m-0 mt-2 text-[13px] leading-[1.75] text-teal-deep">
                  {profile.consistent_interpretation.body}
                </p>
              </div>
            )}
          </section>
        </div>

        <ContextPanel
          title="다음 진단에서 볼 것"
          description="철학은 바꿀 대상이 아니라 비교 기준입니다. 다음 화면부터는 현재 조직 컨텍스트와 제도 운영이 이 기준과 얼마나 같은 방향인지 확인합니다."
          stats={[
            { label: "철학 기준", value: "4/4" },
            { label: "충돌 여부", value: hasConflicts ? `${profile.conflicts.length}개` : "없음" },
            { label: "다음 단계", value: "조직 컨텍스트" },
          ]}
        />
      </div>

      <BottomNav
        prevPath="/diagnose/philosophy"
        prevLabel="이전: 인사 철학"
        nextPath="/diagnose/context"
        nextLabel="다음: 조직 컨텍스트"
      />
    </>
  );
}
