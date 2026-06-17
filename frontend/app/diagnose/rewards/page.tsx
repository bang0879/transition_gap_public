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
  "2-3-2": [
    {
      label: "입사·협상 때마다 개별 결정",
      value: "입사·협상 때마다 개별 결정",
      description: "역할/레벨별 기준보다 개별 협상과 대표 판단이 크게 작동합니다.",
    },
    "기본급 위주의 안정형",
    "인센티브 위주의 성과연동형",
    "스톡옵션 중심의 장기비전형",
    "직군별로 섞여 있는 혼합형",
  ],
  "2-3-3": ["20% 미만", "20~35%", "35~50%", "50% 초과", "모름 / 측정 안 함"],
  "2-3-4": ["10% 미만", "10~25%", "25~50%", "50% 초과", "모름 / 측정 안 함"],
  "2-3-5": ["하위", "중위", "상위", "모름 / 측정 안 함"],
  "2-3-6": ["동종업계보다 높은 편", "비슷한 편", "낮은 편", "모르겠음"],
};

export default function RewardsPage() {
  const router = useRouter();
  const { responses, setResponse } = useResponsesStore();
  const rewardsVisVars = ["2-3-2", "2-3-3", "2-3-4", "2-3-5"];
  const answeredCount = rewardsVisVars.filter((id) => id in responses).length;
  const blindSpotCount = rewardsVisVars.length - answeredCount;
  usePageTracking("/diagnose/rewards");

  return (
    <>
      <PageHeader
        eyebrow="04. 총보상"
        title="보상은 비용이면서 동시에 채용 메시지입니다."
        lead="현재 보상 구조가 어떤 인재를 끌어당기고, 어떤 인재를 밀어내는지 확인합니다. 정확한 숫자가 없으면 가장 가까운 구간을 선택해도 됩니다."
        actions={
          <>
            <Button onClick={() => router.push("/diagnose/workforce")}>이전</Button>
            <Button variant="primary" onClick={() => router.push("/diagnose/evaluation")}>
              다음: 평가 · 리더십
            </Button>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5">
          <QuestionBlock title="현재 우리 회사의 실제 보상 체계에 가장 가까운 모습은 무엇입니까?" help={QUESTION_HELP["2-3-2"]} badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-3-2"]} value={responses["2-3-2"] as string | undefined} onChange={(value) => setResponse("2-3-2", value)} mutedOption="직군별로 섞여 있는 혼합형" />
          </QuestionBlock>
          <QuestionBlock title="매출 대비 인건비 비중은?" help="정확한 수치가 없으면 가장 가까운 구간을 선택하세요." badge={{ label: "재무 임팩트", variant: "teal" }}>
            <OptionGrid options={options["2-3-3"]} value={responses["2-3-3"] as string | undefined} onChange={(value) => setResponse("2-3-3", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="지난 12개월 인건비 증가율은?" help="정확한 수치가 없으면 가장 가까운 구간을 선택하세요." badge={{ label: "재무 임팩트", variant: "teal" }}>
            <OptionGrid options={options["2-3-4"]} value={responses["2-3-4"] as string | undefined} onChange={(value) => setResponse("2-3-4", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="시장 대비 보상 위치는? (자가 진단)" badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-3-5"]} value={responses["2-3-5"] as string | undefined} onChange={(value) => setResponse("2-3-5", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="복리후생(휴가·간식·교육비 등)의 수준은 동종업계 대비 어떻습니까?" badge={{ label: "보상 보조", variant: "slate" }}>
            <OptionGrid options={options["2-3-6"]} value={responses["2-3-6"] as string | undefined} onChange={(value) => setResponse("2-3-6", value)} columns={2} mutedOption="모르겠음" />
          </QuestionBlock>
        </div>
        <ContextPanel
          description="보상 구조는 Matrix A의 X축과 시나리오별 재무 임팩트에 직접 반영됩니다."
          stats={[
            { label: "보상 가시성", value: `${answeredCount} / ${rewardsVisVars.length}` },
            { label: "진단이 안 된 영역", value: blindSpotCount === 0 ? "없음" : `${blindSpotCount}개 항목` },
            { label: "활용 위치", value: "Matrix A · 재무" },
          ]}
        />
      </div>
      <BottomNav prevPath="/diagnose/workforce" nextPath="/diagnose/evaluation" nextLabel="다음: 평가 · 리더십" />
    </>
  );
}
