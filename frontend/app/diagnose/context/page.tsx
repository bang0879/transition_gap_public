"use client";

import { useRouter } from "next/navigation";
import { ContextPanel } from "@/components/forms/ContextPanel";
import { BottomNav } from "@/components/forms/BottomNav";
import { MultiOptionGrid } from "@/components/forms/MultiOptionGrid";
import { OptionGrid } from "@/components/forms/OptionGrid";
import { QuestionBlock } from "@/components/forms/QuestionBlock";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/shared/Button";
import { usePageTracking } from "@/lib/hooks/usePageTracking";
import { useResponsesStore } from "@/lib/store/responses";

const options = {
  "L0-1": [
    "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다",
    "개인의 파격 차등보다는, 협업과 팀 기여도 중심의 성과급 설계를 통해 조직 전체의 평균 보상 만족도를 높인다.",
  ],
  "L0-2": [
    "명확한 목표 대비 성과 추적과 저성과 영역에 대한 솔직한 피드백",
    "구성원과의 정기 1:1 대면 면담 (1on1)을 통한 고충 청취와 심리적 안전감 확보",
  ],
  "L0-3": [
    "외부에서 검증된 최고의 S급 인재를 높은 비용을 치르더라도 영입하여 즉시 전력으로 활용한다",
    "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다",
  ],
  "L1-1": [
    "무임승차자(저성과자) 방치로 인한 핵심 인재의 의욕 저하 및 이탈",
    "기존 멤버와 신규 합류 멤버(고연봉자) 간의 보상 역전 및 갈등",
    "평가 철학 부재로 인한 '나눠먹기식(N빵)' 등급 부여와 공정성 시비",
    "실무 에이스가 리더(팀장)가 된 후 발생하는 리더십 공백 및 팀 붕괴",
    "부서 간 이기주의(Silo) 심화 및 책임 떠넘기기",
    "창업자/C-레벨의 마이크로매니징 및 일관성 없는 인사 개입",
    "예측 불가능한 인건비 상승 및 보상 재원 부족",
    "체계적인 온보딩 부재로 인한 신규 입사자의 높은 조기 퇴사율",
  ],
  "L1-2": ["20인 이하", "20~50인", "50~100인", "100~500인", "500인 초과"],
  "L1-3": [
    "수평형 (CEO + 실무자, 별도 중간 관리자 없음)",
    "3단계 (CEO - 리더 - 실무자)",
    "4단계 (CEO - 임원/실장 - 팀장 - 실무자)",
    "5단계 이상 (사업부/본부 체계 도입)",
    "직군별 상이 (예: 개발은 수평, 사업은 위계)",
  ],
  "L1-4": [
    "공격적 확장 (30%+ 인원 증가)",
    "안정적 성장 (10~30% 증가)",
    "결원 보충 및 유지 (10% 미만)",
    "채용 동결 및 감축",
  ],
  "L1-5": [
    "B2B SaaS",
    "B2C 플랫폼",
    "핀테크 / 금융",
    "커머스 / 리테일",
    "콘텐츠 / 미디어",
    "데이터 / 자동화",
    "바이오 / 헬스케어",
    "하드웨어 / 제조",
    "기타",
  ],
};

export default function ContextPage() {
  const router = useRouter();
  const { responses, setResponse } = useResponsesStore();
  usePageTracking("/diagnose/context");

  return (
    <>
      <PageHeader
        eyebrow="01. 조직 컨텍스트"
        title="성장 상황과 인사제도 정합성을 파악합니다."
        lead="대표님의 경영 철학, 조직 규모, 성장 속도, 현재 페인포인트를 함께 보며 이후 진단의 기준점을 설정합니다."
        actions={
          <Button variant="primary" onClick={() => router.push("/diagnose/workforce")}>
            다음: 인력 · 채용
          </Button>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          <QuestionBlock title="회사가 크게 성장했을 때, 이상적인 보상 분배 방식은?" badge={{ label: "철학 입력", variant: "slate" }}>
            <OptionGrid options={options["L0-1"]} value={responses["L0-1"] as string | undefined} onChange={(value) => setResponse("L0-1", value)} columns={1} />
          </QuestionBlock>
          <QuestionBlock title="리더가 성과를 만드는 방식은 무엇에 가까워야 합니까?" badge={{ label: "철학 입력", variant: "slate" }}>
            <OptionGrid options={options["L0-2"]} value={responses["L0-2"] as string | undefined} onChange={(value) => setResponse("L0-2", value)} columns={1} />
          </QuestionBlock>
          <QuestionBlock title="장기적 관점에서, 우리 조직을 이끌어갈 핵심 인재 그룹은 어떻게 구성되기를 원하십니까?" badge={{ label: "철학 입력", variant: "slate" }}>
            <OptionGrid options={options["L0-3"]} value={responses["L0-3"] as string | undefined} onChange={(value) => setResponse("L0-3", value)} columns={1} />
          </QuestionBlock>
          <QuestionBlock title="현재 가장 시급한 HR 페인포인트는 무엇입니까? (최대 2개 선택)" badge={{ label: "핵심 페인", variant: "coral" }}>
            <MultiOptionGrid options={options["L1-1"]} value={responses["L1-1"] as string[] | undefined} onChange={(value) => setResponse("L1-1", value)} maxSelect={2} />
          </QuestionBlock>
          <QuestionBlock title="총 인원수는 어느 정도입니까?">
            <OptionGrid options={options["L1-2"]} value={responses["L1-2"] as string | undefined} onChange={(value) => setResponse("L1-2", value)} />
          </QuestionBlock>
          <QuestionBlock title="현재 조직의 의사결정 구조는 어떻습니까?">
            <OptionGrid options={options["L1-3"]} value={responses["L1-3"] as string | undefined} onChange={(value) => setResponse("L1-3", value)} columns={1} />
          </QuestionBlock>
          <QuestionBlock title="향후 12개월 채용 기조는?">
            <OptionGrid options={options["L1-4"]} value={responses["L1-4"] as string | undefined} onChange={(value) => setResponse("L1-4", value)} />
          </QuestionBlock>
          <QuestionBlock title="주력 산업 도메인은?">
            <OptionGrid options={options["L1-5"]} value={responses["L1-5"] as string | undefined} onChange={(value) => setResponse("L1-5", value)} columns={3} />
          </QuestionBlock>
        </div>
        <ContextPanel
          title="왜 먼저 묻나요?"
          description="같은 제도라도 회사의 규모와 성장 속도에 따라 맞을 수도, 엇박자를 만들 수도 있습니다. 이 화면의 답변은 이후 결과 해석의 기준점이 됩니다."
          stats={[
            { label: "입력 항목", value: "8개" },
            { label: "활용 위치", value: "기준점 설정" },
            { label: "다음 단계", value: "인력 · 채용" },
          ]}
        />
      </div>
      <BottomNav nextPath="/diagnose/workforce" nextLabel="다음: 인력 · 채용" />
    </>
  );
}
