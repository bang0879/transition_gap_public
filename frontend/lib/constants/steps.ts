export interface DiagnoseStep {
  id: string;
  label: string;
  path: string;
  eyebrow: string;
  title: string;
  lead: string;
}

export const DIAGNOSE_STEPS: DiagnoseStep[] = [
  {
    id: "philosophy",
    label: "인사 철학",
    path: "/diagnose/philosophy",
    eyebrow: "01. HR Philosophy",
    title: "회사의 인사 철학을 먼저 확인합니다.",
    lead: "현행 제도가 아니라 회사가 지향하는 운영 방향을 기준점으로 설정합니다.",
  },
  {
    id: "context",
    label: "조직 컨텍스트",
    path: "/diagnose/context",
    eyebrow: "02. Organization Context",
    title: "조직의 크기, 성장 속도, 가장 아픈 문제를 먼저 정리합니다.",
    lead: "정확한 숫자가 없으면 가장 가까운 구간을 선택하세요.",
  },
  {
    id: "workforce",
    label: "인력 · 채용",
    path: "/diagnose/workforce",
    eyebrow: "03. Workforce & Pipeline",
    title: "사람이 들어오고 나가는 흐름에서 병목이 어디인지 확인합니다.",
    lead: "이직률과 채용 소요 기간은 추정치여도 충분합니다.",
  },
  {
    id: "rewards",
    label: "총보상",
    path: "/diagnose/rewards",
    eyebrow: "04. Total Rewards Architecture",
    title: "보상은 비용이면서 동시에 채용 메시지입니다.",
    lead: "현재 보상 구조가 어떤 인재를 끌어당기고, 어떤 인재를 밀어내는지 확인합니다. 정확한 숫자가 없으면 가장 가까운 구간을 선택해도 됩니다.",
  },
  {
    id: "evaluation",
    label: "평가 · 리더십",
    path: "/diagnose/evaluation",
    eyebrow: "05. Evaluation & Leadership",
    title: "평가가 보상과 맞물려 돌아가는지, 리더가 이를 실행할 수 있는지 확인합니다.",
    lead: "평가 운영 여부, 공정성 인식, 리더와 구성원 간의 정기 1:1 대면 면담 (1on1) 운영 현황을 묻습니다.",
  },
];

export const RESULT_STEPS = [
  { id: "result", label: "진단결과 요약", path: "/result" },
  { id: "detail", label: "영역별 상세", path: "/result/detail" },
  { id: "matrix", label: "트레이드오프 분석", path: "/matrix" },
  { id: "scenarios", label: "시나리오 비교", path: "/scenarios" },
  { id: "roadmap", label: "실행 로드맵", path: "/roadmap" },
  { id: "finish", label: "진단 마무리", path: "/finish" },
];