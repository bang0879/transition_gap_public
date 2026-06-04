"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/forms/BottomNav";
import { ContextPanel } from "@/components/forms/ContextPanel";
import { OptionGrid } from "@/components/forms/OptionGrid";
import { QuestionBlock } from "@/components/forms/QuestionBlock";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/shared/Button";
import { PHILOSOPHY_QUESTIONS } from "@/lib/constants/philosophy";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import { useResponsesStore } from "@/lib/store/responses";
import { buildPhilosophyProfile } from "@/lib/utils/philosophyProfile";

export default function PhilosophyPage() {
  const router = useRouter();
  const { responses, setResponse } = useResponsesStore();
  const profile = buildPhilosophyProfile(responses);
  usePageTracking("/diagnose/philosophy");

  return (
    <>
      <PageHeader
        eyebrow="01. 인사 철학 확인"
        title="회사의 인사 철학 확인"
        lead="현행 운영 중인 제도의 모습이 아니라, 회사를 어떤 방향으로 운영하고 싶은지 '지향하는 인사 철학'을 확인하는 단계입니다."
        actions={
          <Button variant="primary" disabled={!profile.isComplete} onClick={() => router.push("/diagnose/philosophy/profile")}>
            다음: 철학 프로필 확인
          </Button>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          {PHILOSOPHY_QUESTIONS.map((question) => (
            <QuestionBlock key={question.id} title={question.title} badge={{ label: "철학 기준", variant: "slate" }}>
              <OptionGrid
                options={[...question.options]}
                value={responses[question.id] as string | undefined}
                onChange={(value) => setResponse(question.id, value)}
                columns={1}
              />
            </QuestionBlock>
          ))}
        </div>
        <ContextPanel
          title="결과 화면의 기준점"
          description="이 화면에서 선택한 인사 철학은 향후 진단 결과에서 현행 제도와의 정합성 차이를 분석하고, 핵심 개선 과제를 도출하는 기준점으로 사용됩니다. 다음 화면에서 철학 간 충돌 여부를 먼저 확인합니다."
          stats={[
            { label: "입력 진행", value: `${profile.answeredCount}/4` },
            { label: "다음 단계", value: "철학 프로필" },
          ]}
        />
      </div>
      <BottomNav nextPath="/diagnose/philosophy/profile" nextLabel="다음: 철학 프로필 확인" nextDisabled={!profile.isComplete} />
    </>
  );
}
