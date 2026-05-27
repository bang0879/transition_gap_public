import type { ScoreBreakdownItem } from "@/lib/types/api";

interface AsIsToBePanelProps {
  breakdown: ScoreBreakdownItem[];
}

const TO_BE_BY_FACTOR: Record<string, string> = {
  "평가-보상 연동": "성과 등급 기준과 보상 차등 원칙을 문서화해 개인 재량으로 보이지 않게 운영",
  "평가 공정성 평균": "평가 기준, 캘리브레이션, 결과 설명 방식을 한 사이클 안에서 함께 정비",
  "공정성 인식 차이": "리더와 구성원이 같은 기준표를 보고 판단하도록 평가 근거와 이의제기 절차 공개",
  "평가 운영 여부": "분기 체크인과 반기 공식 리뷰를 분리해 정기 운영화",
  "시장 보상 수준": "핵심 직무부터 시장 기준을 확인하고 보상 밴드와 예외 승인 기준을 설정",
  "인건비 비중": "인건비 증가율과 성과 기여도를 함께 보는 보상 재원 운영 기준 수립",
  "보상 구조": "기본급, 성과급, 장기보상의 역할을 나눠 채용 메시지와 리텐션 메시지를 정렬",
  "채용 소요 기간": "핵심 포지션별 목표 리드타임과 병목 구간을 주 단위로 추적",
  "채용 채널 수": "리퍼럴, 직접 소싱, 채용 플랫폼을 역할별로 나눠 후보자 풀을 분산",
  "오퍼 거절 빈도": "거절 사유를 보상, 직무 매력, 프로세스 속도로 분류해 다음 오퍼에 반영",
  "자발적 이직률": "퇴직 사유와 잔류 요인을 분리해 핵심 인재군부터 리텐션 액션 정의",
  "핵심 인재 이탈 심각도": "대체 불가능 인력의 보상, 성장, 역할 리스크를 별도 관리",
  "신규 입사자 조기 퇴사율": "30/60/90일 온보딩 체크포인트와 리더 피드백 루프 운영",
  "리더 피드백 역량": "리더가 어려운 피드백을 회피하지 않도록 대화 기준과 코칭 루틴 마련",
  "1on1 운영": "격주 또는 월 1회 정기 1:1 면담을 운영하고 완료율과 이슈 유형을 기록",
  "의사결정 구조": "최종 승인 영역과 리더 전결 영역을 구분해 의사결정 병목을 줄임",
  "핵심가치 작동성": "핵심가치를 채용 질문, 평가 행동지표, 보상 설명 문장으로 연결",
};

const FIRST_ACTION_BY_FACTOR: Record<string, string> = {
  "평가-보상 연동": "보상 차등의 기준을 공개할 때, 구성원이 납득해야 할 최소 근거는 무엇인가요?",
  "평가 공정성 평균": "평가 결과를 설명할 때 리더가 반드시 보여줘야 할 근거는 무엇인가요?",
  "공정성 인식 차이": "경영진과 직원의 공정성 인식 차이를 줄이려면 어떤 기준을 먼저 공개해야 하나요?",
  "평가 운영 여부": "정식 평가를 바로 만들기 전, 다음 분기부터 반복할 최소 점검 절차는 무엇인가요?",
  "시장 보상 수준": "핵심 직무 중 어느 역할부터 시장 기준을 확인하고 예외 기준을 둘 것인가요?",
  "인건비 비중": "매출 성장보다 인건비가 빨리 늘 때, 어느 비용부터 멈추거나 재배분할 것인가요?",
  "보상 구조": "기본급, 성과급, 장기보상이 각각 어떤 사람을 붙잡기 위한 장치인가요?",
  "채용 소요 기간": "채용이 늦어지는 단계가 후보자 발굴, 면접, 오퍼 중 어디인가요?",
  "채용 채널 수": "지금 가장 의존하는 채널이 막히면 다음 후보자 풀은 어디서 만들 수 있나요?",
  "오퍼 거절 빈도": "후보자가 거절하는 이유가 돈, 역할, 속도, 회사 매력 중 무엇인가요?",
  "자발적 이직률": "최근 퇴사자는 무엇 때문에 나갔고, 남은 핵심 인재는 무엇 때문에 남아 있나요?",
  "핵심 인재 이탈 심각도": "대체가 어려운 핵심 인재 3명에게 지금 가장 큰 이탈 이유는 무엇인가요?",
  "신규 입사자 조기 퇴사율": "입사 후 30일 안에 기대 역할이 어긋나는 지점은 어디인가요?",
  "리더 피드백 역량": "리더가 회피하면 안 되는 피드백 상황을 어디까지 명확히 정할 것인가요?",
  "1on1 운영": "1on1에서 반드시 남겨야 할 이슈 유형과 후속 조치는 무엇인가요?",
  "의사결정 구조": "어떤 의사결정은 리더에게 넘기고, 어떤 의사결정만 경영진이 잡아야 하나요?",
  "핵심가치 작동성": "핵심가치에 맞지 않는 행동을 채용·평가에서 실제로 걸러낼 수 있나요?",
};

function toBeFor(item: ScoreBreakdownItem): string {
  return TO_BE_BY_FACTOR[item.factor] ?? "현재 응답의 리스크를 줄이는 운영 기준을 명문화하고 다음 진단에서 추적";
}

function firstActionFor(item: ScoreBreakdownItem): string {
  return FIRST_ACTION_BY_FACTOR[item.factor] ?? "다음 회의에서 현재 방식의 예외 기준과 책임자를 먼저 정할까요?";
}

function displayValue(value: string): string {
  return value
    .replace(/^\[|\]$/g, "")
    .replace(/['"]/g, "")
    .replace(/,\s*/g, " · ");
}

function normalizeAnswerValue(value: string): string {
  const cleaned = displayValue(value);
  const numeric = Number(cleaned);

  if (!Number.isNaN(numeric)) {
    if (numeric <= 10) return `${Math.round(numeric)}점`;
    return `${Math.round(numeric)}%`;
  }

  return cleaned
    .replace(/(\d+)\.0점/g, "$1점")
    .replace(/(\d+)\.0%/g, "$1%");
}

function interpretValue(item: ScoreBreakdownItem): string {
  const value = normalizeAnswerValue(item.value);
  const factor = item.factor;

  if (factor.includes("이직률")) {
    return `${value}: 핵심 인력 유지와 리더십 신뢰를 먼저 확인해야 하는 신호`;
  }
  if (factor.includes("핵심 인재 이탈")) {
    return `${value}: 대체 난이도와 역할 공백을 별도 관리해야 하는 신호`;
  }
  if (factor.includes("조기")) {
    return `${value}: 온보딩, 역할 기대치, 채용 메시지가 맞물려 있는지 점검해야 하는 신호`;
  }
  if (factor.includes("채용 소요")) {
    return `${value}: 후보자 경험과 의사결정 속도에 병목이 있을 가능성`;
  }
  if (factor.includes("채용 채널")) {
    return `${value}: 특정 채널 의존도가 높아 후보자 풀이 좁아질 가능성`;
  }
  if (factor.includes("오퍼 거절")) {
    return `${value}: 보상, 역할 매력도, 프로세스 속도 중 하나가 약해진 신호`;
  }
  if (factor.includes("인건비")) {
    return `${value}: 성장률과 비용 구조를 함께 봐야 하는 재무 압력 신호`;
  }
  if (factor.includes("시장 보상")) {
    return `${value}: 핵심 직무별 보상 포지션을 다시 정해야 하는 신호`;
  }
  if (factor.includes("보상 구조")) {
    return `${value}: 채용 메시지와 리텐션 메시지가 흔들릴 수 있는 신호`;
  }
  if (factor.includes("공정성")) {
    return `${value}: 평가 기준과 결과 설명 방식의 신뢰를 점검해야 하는 신호`;
  }
  if (factor.includes("평가")) {
    return `${value}: 성과 기준, 피드백, 보상 연결이 흐려질 수 있는 신호`;
  }
  if (factor.includes("피드백")) {
    return `${value}: 리더별 관리 품질 차이가 커질 수 있는 신호`;
  }
  if (factor.includes("1on1")) {
    return `${value}: 리더십 운영이 개인 역량에 의존할 가능성`;
  }
  if (factor.includes("의사결정")) {
    return `${value}: 승인 병목과 책임 경계가 흐려질 수 있는 신호`;
  }
  if (factor.includes("핵심가치")) {
    return `${value}: 채용, 평가, 보상이 같은 행동 기준을 공유하지 못할 가능성`;
  }

  return `${value}: 현재 운영 기준을 더 명확히 정의해야 하는 신호`;
}

function priorityLabel(impact: number, index: number): string {
  if (impact <= -10) return "우선 전환";
  if (impact < 0) return "보완 필요";
  return index === 0 ? "확인 필요" : "유지";
}

export function AsIsToBePanel({ breakdown }: AsIsToBePanelProps) {
  const rows = [...breakdown]
    .filter((item) => item.factor !== "기본 점수" && item.factor !== "최종 점수")
    .sort((a, b) => a.impact - b.impact)
    .slice(0, 4);

  if (rows.length === 0) return null;

  return (
    <section className="mb-4 rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="m-0 text-[15px] font-[690] text-slate-900">현재 방식과 바꿀 운영 기준</h3>
          <p className="m-0 mt-[5px] text-[12px] leading-[1.65] text-slate-500">
            진단에서 낮게 나온 항목을 다음 회의에서 다룰 운영 기준과 질문으로 번역했습니다.
          </p>
        </div>
        <div className="flex w-fit flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-[10px] py-[5px] text-[11px] font-[680] text-slate-500">
            현재 방식
          </span>
          <span className="rounded-full border border-amber-soft bg-amber-soft px-[10px] py-[5px] text-[11px] font-[680] text-amber">
            개선 기준
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {rows.map((item, index) => (
          <article key={`${item.factor}-${item.value}`} className="rounded-[10px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="inline-flex h-[24px] min-w-[52px] items-center justify-center rounded-[7px] border border-white bg-white px-2 text-[11px] font-[760] text-slate-500">
                  {index + 1}순위
                </span>
                <strong className="text-[13px] font-[690] text-slate-900">{item.factor}</strong>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-[9px] py-[4px] text-[11px] font-[650] text-slate-500">
                {priorityLabel(item.impact, index)}
              </span>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_28px_1.08fr_1fr] lg:items-stretch">
              <div className="rounded-[9px] border border-slate-200 bg-white p-3">
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-slate-400">현재 방식</p>
                <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-700">{interpretValue(item)}</p>
              </div>
              <div className="hidden h-7 w-7 self-center items-center justify-center rounded-full border border-teal-line bg-white text-[12px] font-[760] text-teal-deep lg:flex">
                →
              </div>
              <div className="rounded-[9px] border border-teal-line bg-white p-3">
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-teal">개선 방향</p>
                <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-700">{toBeFor(item)}</p>
              </div>
              <div className="rounded-[9px] border border-[#e8dcc7] bg-[#fffdf8] p-3">
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-amber">먼저 던질 질문</p>
                <p className="m-0 mt-2 text-[12px] leading-[1.65] text-slate-700">{firstActionFor(item)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
