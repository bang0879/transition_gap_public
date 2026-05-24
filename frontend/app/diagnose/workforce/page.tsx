"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/forms/BottomNav";
import { ContextPanel } from "@/components/forms/ContextPanel";
import { OptionGrid } from "@/components/forms/OptionGrid";
import { QuestionBlock } from "@/components/forms/QuestionBlock";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/shared/Button";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import { useResponsesStore } from "@/lib/store/responses";
import { QUESTION_HELP } from "@/lib/constants/questionHelp";

const options = {
  "2-1-1": ["10% 미만", "10~20%", "20% 초과", "모름 / 측정 안 함"],
  "2-1-2": ["없음", "1명", "2~3명", "4명 이상", "모름 / 측정 안 함"],
  "2-1-3": ["10% 미만", "10~30%", "30% 초과", "모름 / 측정 안 함"],
  "2-2-1": ["2개월 이내", "2~4개월", "4~6개월", "6개월 초과", "모름 / 채용 자체 없음"],
  "2-2-2": ["1개", "2~3개", "4개 이상"],
  "2-2-3": ["거의 없음", "가끔", "자주"],
};

export default function WorkforcePage() {
  const router = useRouter();
  const { responses, setResponse } = useResponsesStore();
  usePageTracking("/diagnose/workforce");

  return (
    <>
      <PageHeader
        eyebrow="02. 인력 · 채용"
        title="사람이 들어오고 나가는 흐름에서 병목이 어디인지 확인합니다."
        lead="이직률과 채용 소요 기간은 추정치여도 충분합니다. 모르는 항목은 그 자체로 가시성 진단에 반영됩니다."
        actions={
          <>
            <Button onClick={() => router.push("/diagnose/context")}>이전</Button>
            <Button variant="primary" onClick={() => router.push("/diagnose/rewards")}>
              다음: 총보상
            </Button>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          <QuestionBlock title="직전 12개월 전체 자발적 이직률은 어느 정도입니까?" badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-1-1"]} value={responses["2-1-1"] as string | undefined} onChange={(value) => setResponse("2-1-1", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="직전 12개월 핵심 인재 이탈 경험은?" help={QUESTION_HELP["2-1-2"]} badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-1-2"]} value={responses["2-1-2"] as string | undefined} onChange={(value) => setResponse("2-1-2", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="신규 입사자 1년 내 조기 퇴사 비율은?" help={QUESTION_HELP["2-1-3"]} badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-1-3"]} value={responses["2-1-3"] as string | undefined} onChange={(value) => setResponse("2-1-3", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="핵심 포지션 평균 채용 소요 기간은? (체감)" badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-2-1"]} value={responses["2-2-1"] as string | undefined} onChange={(value) => setResponse("2-2-1", value)} mutedOption="모름 / 채용 자체 없음" />
          </QuestionBlock>
          <QuestionBlock title="현재 활용 중인 주요 채용 채널은 몇 가지입니까? (예: 사람인, 원티드, 리퍼럴, 헤드헌터 등)">
            <OptionGrid options={options["2-2-2"]} value={responses["2-2-2"] as string | undefined} onChange={(value) => setResponse("2-2-2", value)} columns={3} />
          </QuestionBlock>
          <QuestionBlock title="최종 면접 통과 후 합격 통보를 받은 지원자가 입사를 거절한 경험이 있습니까?" help={QUESTION_HELP["2-2-3"]}>
            <OptionGrid options={options["2-2-3"]} value={responses["2-2-3"] as string | undefined} onChange={(value) => setResponse("2-2-3", value)} columns={3} />
          </QuestionBlock>
        </div>
        <ContextPanel
          description="인력 안정성과 채용 파이프라인은 성장 속도와 총보상 구조의 압력을 함께 해석하는 기준입니다."
          stats={[
            { label: "가시성 항목", value: "4개" },
            { label: "활용 위치", value: "인력 · 채용 갭" },
            { label: "주의", value: "미측정도 데이터" },
          ]}
        />
      </div>
      <BottomNav prevPath="/diagnose/context" nextPath="/diagnose/rewards" nextLabel="다음: 총보상" />
    </>
  );
}
