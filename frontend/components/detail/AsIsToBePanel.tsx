import type { ScoreBreakdownItem } from "@/lib/types/api";

interface AsIsToBePanelProps {
  breakdown: ScoreBreakdownItem[];
}

const TO_BE_BY_FACTOR: Record<string, string> = {
  "평가-보상 연동": "성과 등급 기준과 보상 차등 원칙을 문서화해 대표 재량으로 보이지 않게 운영",
  "평가 공정성 평균": "평가 기준, 캘리브레이션, 결과 설명 방식을 한 사이클 안에서 함께 정비",
  "공정성 인식 차이": "대표와 구성원이 같은 기준표를 보고 판단하도록 평가 근거와 이의제기 절차 공개",
  "평가 운영 여부": "분기 체크인과 반기 공식 리뷰를 분리해 운영 리듬을 고정",
  "시장 보상 수준": "핵심 직무부터 시장 기준선을 정하고 보상 밴드와 예외 승인 기준을 설정",
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
  "의사결정 구조": "대표 승인 영역과 리더 전결 영역을 구분해 의사결정 병목을 줄임",
  "핵심가치 작동성": "핵심가치를 채용 질문, 평가 행동지표, 보상 설명 문장으로 연결",
};

function toBeFor(item: ScoreBreakdownItem): string {
  return TO_BE_BY_FACTOR[item.factor] ?? "현재 응답의 리스크를 줄이는 운영 기준을 명문화하고 다음 진단에서 추적";
}

function priorityLabel(impact: number): string {
  if (impact <= -10) return "우선 전환";
  if (impact < 0) return "보완 필요";
  return "유지";
}

export function AsIsToBePanel({ breakdown }: AsIsToBePanelProps) {
  const rows = [...breakdown]
    .filter((item) => item.factor !== "기본 점수" && item.factor !== "최종 점수")
    .sort((a, b) => a.impact - b.impact)
    .slice(0, 4);

  if (rows.length === 0) return null;

  return (
    <section className="mb-4 rounded-[10px] border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="m-0 text-[14px] font-[680] text-slate-900">현재 방식과 전환 방향</h3>
          <p className="m-0 mt-[5px] text-[12px] leading-[1.65] text-slate-500">
            점수의 원인을 대표가 바로 판단할 수 있도록, 현재 응답을 다음 운영 기준으로 번역했습니다.
          </p>
        </div>
        <span className="w-fit rounded-full border border-amber-soft bg-amber-soft px-[9px] py-[4px] text-[11px] font-[680] text-amber">
          As-Is → To-Be
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map((item) => (
          <div key={`${item.factor}-${item.value}`} className="py-4 first:pt-0 last:pb-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <strong className="text-[13px] font-[680] text-slate-900">{item.factor}</strong>
              <span className="rounded-full border border-slate-200 bg-white px-[8px] py-[3px] text-[11px] font-[650] text-slate-500">
                {priorityLabel(item.impact)}
              </span>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_24px_1.1fr] lg:items-start">
              <div>
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-slate-400">현재 방식</p>
                <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-700">{item.value}</p>
              </div>
              <div className="hidden h-6 w-6 items-center justify-center rounded-full border border-teal-line bg-white text-[12px] font-[760] text-teal-deep lg:flex">
                →
              </div>
              <div>
                <p className="m-0 text-[10px] font-[760] tracking-[0.08em] text-teal">전환 방향</p>
                <p className="m-0 mt-1 text-[12px] leading-[1.65] text-slate-700">{toBeFor(item)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
