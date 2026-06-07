"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/forms/BottomNav";
import { ContextPanel } from "@/components/forms/ContextPanel";
import { OptionGrid } from "@/components/forms/OptionGrid";
import { QuestionBlock } from "@/components/forms/QuestionBlock";
import { SegmentedScale } from "@/components/forms/SegmentedScale";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/shared/Button";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import { useResponsesStore } from "@/lib/store/responses";
import { QUESTION_HELP } from "@/lib/constants/questionHelp";

const options = {
  "2-4-1a": ["연 1회", "반기 1회", "분기 1회 / 상시", "운영하지 않음"],
  "2-4-2": [
    {
      label: "차등 거의 없음",
      value: "차이가 거의 없거나, 그때그때 대표 재량으로 결정된다.",
      description: "성과 차이가 보상 차이로 거의 이어지지 않습니다.",
    },
    {
      label: "주관 판단 중심",
      value: "차등이 있긴 하지만, 공식적인 룰보다는 주관적 판단이 강하게 개입된다.",
      description: "차등은 있으나 기준보다 대표/리더 판단이 큽니다.",
    },
    {
      label: "공식 연동, 차등 작음",
      value: "정해진 공식에 따라 기계적으로 연동되나, 최고-최하 등급 간 차이가 크지 않다.",
      description: "기준은 있으나 보상 신호는 약합니다.",
    },
    {
      label: "공식 연동, 차등 큼",
      value: "정해진 공식에 따라 철저히 자동 결정되며, 최고-최하 등급 간 차등이 파격적이다.",
      description: "평가 등급이 보상 차이로 강하게 이어집니다.",
    },
  ],
  "2-4-5": ["알고 있음", "모름 / 측정 안 함"],
  "2-5-1": [
    {
      label: "리더가 직접 수행",
      value: "대부분 객관적으로 잘 수행함",
      description: "성과 부진을 리더가 기준에 따라 설명하고 개선을 요구합니다.",
    },
    {
      label: "갈등 회피 경향",
      value: "갈등을 피하거나 온정주의가 있음",
      description: "어려운 피드백이 늦어지거나 완곡하게 전달됩니다.",
    },
    {
      label: "대표 개입 필요",
      value: "대표인 내가 직접 나서야 해결됨",
      description: "성과 문제를 리더 선에서 끝내기 어렵습니다.",
    },
  ],
  "2-5-2": ["운영함", "일부 운영", "운영 안 함"],
  "2-5-3": ["기록·관리함", "기록·관리 안 함"],
  "2-5-4": ["실무 팀장 전결", "C-Level 전결", "CEO가 모든 인원 최종 면접 및 승인"],
  "2-5-5": ["실무팀 자율", "팀장 / PM 결정", "C-Level 결정", "CEO 최종 승인 필요"],
  "2-5-6": [
    {
      label: "선언 수준",
      value: "그냥 홈페이지에 적혀 있는 좋은 말 수준이다.",
      description: "채용/평가 기준으로는 거의 쓰이지 않습니다.",
    },
    {
      label: "리더별 편차 큼",
      value: "면접관이나 리더의 성향에 따라 들쭉날쭉하게 적용된다.",
      description: "기준은 있으나 적용 방식이 사람마다 다릅니다.",
    },
    {
      label: "탈락 기준으로 작동",
      value: "실력이 아무리 뛰어나도 핵심가치에 어긋나면 무조건 탈락시킨다.",
      description: "채용과 평가에서 명확한 배제 기준입니다.",
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

const visionDecisionOptions = [
  {
    label: "아니다",
    value: 1,
    description: "리더마다 판단 기준이 다르고, 대표의 개입 후에야 방향이 맞춰집니다.",
  },
  {
    label: "보통이다",
    value: 3,
    description: "방향은 공유되어 있지만 채용·평가·자원 배분 기준으로는 아직 흔들립니다.",
  },
  {
    label: "그렇다",
    value: 5,
    description: "장기 방향이 리더의 채용·평가·자원 배분 판단 기준으로 작동합니다.",
  },
];

const fairnessAgreementOptions = [
  {
    label: "아니다",
    value: 2,
    description: "공정하다고 보기 어렵고, 불만이 표면화될 가능성이 큽니다.",
  },
  {
    label: "보통이다",
    value: 5,
    description: "큰 불만은 없지만 기준과 설명 방식이 더 명확해야 합니다.",
  },
  {
    label: "그렇다",
    value: 8,
    description: "대체로 공정하게 받아들여질 만한 운영 기준이 있습니다.",
  },
  {
    label: "매우 그렇다",
    value: 10,
    description: "기준, 근거, 설명 방식이 일관되게 작동하고 있습니다.",
  },
  {
    label: "운영하지 않음",
    value: 0,
    description: "공식 평가 제도가 없거나, 공정성을 판단할 운영 기준이 아직 없습니다.",
  },
];

export default function EvaluationPage() {
  const router = useRouter();
  const { responses, setResponse } = useResponsesStore();
  usePageTracking("/diagnose/evaluation");

  return (
    <>
      <PageHeader
        eyebrow="05. 평가 · 리더십"
        title="평가가 보상과 맞물려 돌아가는지, 리더가 이를 실행할 수 있는지 확인합니다."
        lead="평가 운영 여부, 공정성 인식, 리더와 구성원 간의 정기 1:1 대면 면담 (1on1) 운영 현황을 묻습니다."
        actions={
          <>
            <Button onClick={() => router.push("/diagnose/rewards")}>이전</Button>
            <Button variant="primary" onClick={() => router.push("/result")}>
              다음: 진단 결과
            </Button>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5">
          <SectionLabel
            title="평가 운영"
            body="평가 제도가 실제 보상과 연결되는 방식, 그리고 구성원이 납득할 수 있는 근거가 있는지 확인합니다."
          />
          <QuestionBlock title="평가 주기는 어떻게 운영하십니까?">
            <OptionGrid options={options["2-4-1a"]} value={responses["2-4-1a"] as string | undefined} onChange={(value) => setResponse("2-4-1a", value)} />
          </QuestionBlock>
          <QuestionBlock title="평가 결과가 실제 보상(연봉/인센티브) 차등으로 이어지는 수준과 방식은 어떠합니까?">
            <OptionGrid options={options["2-4-2"]} value={responses["2-4-2"] as string | undefined} onChange={(value) => setResponse("2-4-2", value)} columns={1} />
          </QuestionBlock>
          <QuestionBlock title="우리 회사의 평가 제도가 공정하게 운영되고 있다고 생각하십니까?" help={QUESTION_HELP["2-4-3-ceo"]}>
            <SegmentedScale
              options={fairnessAgreementOptions}
              value={responses["2-4-3-ceo"] as number | undefined}
              onChange={(value) => setResponse("2-4-3-ceo", value)}
            />
          </QuestionBlock>
          <QuestionBlock title="직원들도 현재 평가 제도를 공정하다고 느낄 것이라 생각하십니까?" help={QUESTION_HELP["2-4-3-employee"]}>
            <SegmentedScale
              options={fairnessAgreementOptions}
              value={responses["2-4-3-employee"] as number | undefined}
              onChange={(value) => setResponse("2-4-3-employee", value)}
            />
          </QuestionBlock>
          <QuestionBlock
            title="리더들이 채용·평가·자원 배분을 결정할 때, 회사의 장기 방향을 기준으로 삼고 있습니까?"
            help="정교한 수치보다 실제 의사결정 장면에서 기준이 작동하는지를 봅니다."
          >
            <SegmentedScale
              options={visionDecisionOptions}
              value={responses["2-4-4"] as number | undefined}
              onChange={(value) => setResponse("2-4-4", value)}
            />
          </QuestionBlock>
          <QuestionBlock title="평가 결과의 등급별 인원 분포, 또는 평가-연봉 인상률 차등 폭을 수치로 파악하고 있습니까?" badge={{ label: "가시성 항목", variant: "teal" }}>
            <OptionGrid options={options["2-4-5"]} value={responses["2-4-5"] as string | undefined} onChange={(value) => setResponse("2-4-5", value)} mutedOption="모름 / 측정 안 함" />
          </QuestionBlock>
          <SectionLabel
            title="리더십 실행"
            body="리더가 평가와 피드백을 실제 행동으로 옮길 수 있는지, 대표 병목이 생기고 있는지 확인합니다."
          />
          <QuestionBlock title="우리 회사의 팀장급 리더들은 성과가 부진한 팀원에게 단호하게 피드백을 주고 개선을 요구할 수 있습니까?" help={QUESTION_HELP["2-5-1"]}>
            <OptionGrid options={options["2-5-1"]} value={responses["2-5-1"] as string | undefined} onChange={(value) => setResponse("2-5-1", value)} columns={1} />
          </QuestionBlock>
          <QuestionBlock title="팀장급 리더들이 분기 1회 이상 리더와 구성원 간의 정기 1:1 대면 면담 (1on1)을 운영합니까?">
            <OptionGrid options={options["2-5-2"]} value={responses["2-5-2"] as string | undefined} onChange={(value) => setResponse("2-5-2", value)} columns={3} />
          </QuestionBlock>
          <QuestionBlock title="리더들의 실제 정기 1:1 대면 면담 (1on1) 운영 주기와 완료율 데이터를 기록·관리하고 있습니까?">
            <OptionGrid options={options["2-5-3"]} value={responses["2-5-3"] as string | undefined} onChange={(value) => setResponse("2-5-3", value)} />
          </QuestionBlock>
          <QuestionBlock title="실무진(주니어/미들급) 채용 시 최종 오퍼 승인 결정은 누가 합니까?" help={QUESTION_HELP["2-5-4"]}>
            <OptionGrid options={options["2-5-4"]} value={responses["2-5-4"] as string | undefined} onChange={(value) => setResponse("2-5-4", value)} columns={1} />
          </QuestionBlock>
          <QuestionBlock title="주력 서비스의 새 기능 배포(Minor Release) 의사결정은?">
            <OptionGrid options={options["2-5-5"]} value={responses["2-5-5"] as string | undefined} onChange={(value) => setResponse("2-5-5", value)} />
          </QuestionBlock>
          <QuestionBlock title="우리 회사의 핵심가치는 채용이나 평가에서 직원을 '탈락'시키는 절대적인 기준으로 작동합니까?">
            <OptionGrid options={options["2-5-6"]} value={responses["2-5-6"] as string | undefined} onChange={(value) => setResponse("2-5-6", value)} columns={1} />
          </QuestionBlock>
        </div>
        <ContextPanel
          description="평가와 리더십 운영은 보상 제도의 수용성과 실행 가능성을 가르는 마지막 필터입니다."
          stats={[
            { label: "평가 데이터", value: "조건부 가시성" },
            { label: "리더십 데이터", value: "정기 1:1 면담 연동" },
            { label: "다음 단계", value: "결과 셸" },
          ]}
        />
      </div>
      <BottomNav prevPath="/diagnose/rewards" nextPath="/result" nextLabel="진단 결과 보기" />
    </>
  );
}
