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
  "2-1-4": [
    {
      label: "기준과 명단 있음",
      value: "명확한 기준과 명단이 있음",
      description: "누가 핵심 인재인지 기준과 관리 대상이 분명합니다.",
    },
    {
      label: "리더별 암묵지",
      value: "리더별로 암묵적으로 알고 있음",
      description: "대상은 떠올리지만 조직 차원의 기준은 아직 약합니다.",
    },
    {
      label: "별도 기준 없음",
      value: "별도 기준 없음",
      description: "핵심 인재를 이탈 후에야 인식할 가능성이 큽니다.",
    },
  ],
  "2-1-5": [
    {
      label: "백업 후보 있음",
      value: "후임/백업 후보가 정해져 있음",
      description: "핵심 포스트 공백 발생 시 대체 흐름이 준비되어 있습니다.",
    },
    {
      label: "일부만 있음",
      value: "일부 포지션만 있음",
      description: "중요 역할 중 일부는 공백 리스크가 남아 있습니다.",
    },
    {
      label: "거의 없음",
      value: "거의 없음",
      description: "핵심 인재 이탈이 곧바로 사업 공백으로 이어질 수 있습니다.",
    },
  ],
  "2-2-1": ["2개월 이내", "2~4개월", "4~6개월", "6개월 초과", "모름 / 채용 자체 없음"],
  "2-2-2": [
    {
      label: "1개 채널",
      value: "1개",
      description: "특정 채널이나 개인 네트워크에 크게 의존합니다.",
    },
    {
      label: "2~3개 채널",
      value: "2~3개",
      description: "기본 채널은 있으나 후보군 확장에는 제한이 있습니다.",
    },
    {
      label: "4개 이상",
      value: "4개 이상",
      description: "공고, 추천, 직접 탐색 등 후보 유입 경로가 분산되어 있습니다.",
    },
  ],
  "2-2-3": [
    {
      label: "거의 없음",
      value: "거의 없음",
      description: "오퍼 조건과 후보 기대가 대체로 맞습니다.",
    },
    {
      label: "가끔",
      value: "가끔",
      description: "보상, 역할, 의사결정 속도 중 일부가 약점일 수 있습니다.",
    },
    {
      label: "자주",
      value: "자주",
      description: "최종 후보를 확보해도 선택받지 못하는 구조적 신호입니다.",
    },
  ],
  "2-2-4": [
    {
      label: "자산 있음",
      value: "채용 페이지/컬처덱/인터뷰 자료가 있음",
      description: "후보자가 회사를 이해하고 선택할 근거가 준비되어 있습니다.",
    },
    {
      label: "일부 자료만 있음",
      value: "공고문 외 일부 자료만 있음",
      description: "기본 설명은 가능하지만 설득 메시지가 일관되기 어렵습니다.",
    },
    {
      label: "거의 없음",
      value: "거의 없음",
      description: "회사 매력과 역할 기대가 면접관 개인 설명에 의존합니다.",
    },
  ],
  "2-2-5": [
    {
      label: "정기 추적",
      value: "정기적으로 추적함",
      description: "입사 후 적응까지 채용 성과로 보고 있습니다.",
    },
    {
      label: "문제 시 확인",
      value: "문제 발생 시에만 확인함",
      description: "이슈가 드러난 뒤 사후적으로 확인하는 수준입니다.",
    },
    {
      label: "추적하지 않음",
      value: "추적하지 않음",
      description: "채용 성공 여부가 입사 확정에서 멈출 가능성이 큽니다.",
    },
  ],
};

function SectionLabel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="m-0 text-[13px] font-[720] text-slate-900">{title}</p>
      <p className="m-0 mt-1 text-[12px] leading-[1.55] text-slate-500">{body}</p>
    </div>
  );
}

export default function WorkforcePage() {
  const router = useRouter();
  const { responses, setResponse } = useResponsesStore();
  usePageTracking("/diagnose/workforce");

  return (
    <>
      <PageHeader
        eyebrow="03. 인력운영 · 채용"
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5">
          <SectionLabel
            title="인력운영 안정성"
            body="사람이 나가는 속도와 핵심 역할 공백이 현재 조직 운영에 얼마나 부담을 주는지 확인합니다."
          />
          <QuestionBlock title="직전 12개월 전체 자발적 이직률은 어느 정도입니까?" badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-1-1"]} value={responses["2-1-1"] as string | undefined} onChange={(value) => setResponse("2-1-1", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="직전 12개월 핵심 인재 이탈 경험은?" help={QUESTION_HELP["2-1-2"]} badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-1-2"]} value={responses["2-1-2"] as string | undefined} onChange={(value) => setResponse("2-1-2", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="신규 입사자 1년 내 조기 퇴사 비율은?" help={QUESTION_HELP["2-1-3"]} badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-1-3"]} value={responses["2-1-3"] as string | undefined} onChange={(value) => setResponse("2-1-3", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <QuestionBlock title="핵심 인재를 식별하는 기준과 명단이 있습니까?" help={QUESTION_HELP["2-1-4"]} badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-1-4"]} value={responses["2-1-4"] as string | undefined} onChange={(value) => setResponse("2-1-4", value)} columns={3} />
          </QuestionBlock>
          <QuestionBlock title="핵심 포스트가 갑자기 비었을 때 대체 계획이 있습니까?" help={QUESTION_HELP["2-1-5"]}>
            <OptionGrid options={options["2-1-5"]} value={responses["2-1-5"] as string | undefined} onChange={(value) => setResponse("2-1-5", value)} columns={3} />
          </QuestionBlock>
          <SectionLabel
            title="채용 파이프라인"
            body="필요한 사람을 제때 찾고, 최종 후보에게 선택받을 수 있는 채용 운영 기반을 확인합니다."
          />
          <QuestionBlock title="핵심 포지션 평균 채용 소요 기간은 어느 정도입니까?" help={QUESTION_HELP["2-2-1"]} badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-2-1"]} value={responses["2-2-1"] as string | undefined} onChange={(value) => setResponse("2-2-1", value)} mutedOption="모름 / 채용 자체 없음" />
          </QuestionBlock>
          <QuestionBlock title="현재 활용 중인 주요 채용 채널은 몇 가지입니까? (예: 사람인, 원티드, 리퍼럴, 헤드헌터 등)">
            <OptionGrid options={options["2-2-2"]} value={responses["2-2-2"] as string | undefined} onChange={(value) => setResponse("2-2-2", value)} columns={3} />
          </QuestionBlock>
          <QuestionBlock title="최종 면접 통과 후 합격 통보를 받은 지원자가 입사를 거절한 경험이 있습니까?" help={QUESTION_HELP["2-2-3"]}>
            <OptionGrid options={options["2-2-3"]} value={responses["2-2-3"] as string | undefined} onChange={(value) => setResponse("2-2-3", value)} columns={3} />
          </QuestionBlock>
          <QuestionBlock title="후보자에게 회사를 설명하는 채용 브랜딩 자산이 있습니까?" help={QUESTION_HELP["2-2-4"]}>
            <OptionGrid options={options["2-2-4"]} value={responses["2-2-4"] as string | undefined} onChange={(value) => setResponse("2-2-4", value)} columns={3} />
          </QuestionBlock>
          <QuestionBlock title="수습/온보딩 전환율 또는 입사 후 3개월 적응 상태를 추적합니까?" help={QUESTION_HELP["2-2-5"]} badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-2-5"]} value={responses["2-2-5"] as string | undefined} onChange={(value) => setResponse("2-2-5", value)} columns={3} />
          </QuestionBlock>
        </div>
        <ContextPanel
          description="사람이 얼마나 자주 나가고, 필요한 사람을 얼마나 빨리 데려오는지 보면 지금 성장 속도를 조직이 감당하고 있는지 확인할 수 있습니다."
          stats={[
            { label: "가시성 항목", value: "6개" },
            { label: "활용 위치", value: "인력운영 · 채용 갭" },
            { label: "주의", value: "미측정도 데이터" },
          ]}
        />
      </div>
      <BottomNav prevPath="/diagnose/context" nextPath="/diagnose/rewards" nextLabel="다음: 총보상" />
    </>
  );
}
