"""
HR 제도 옵션 비교 데이터.

5개 영역의 제도 옵션과 벤치마크를 정적 콘텐츠로 관리한다.
"""
from __future__ import annotations

COMPENSATION_OPTIONS = [
    {
        "name": "호봉제 기반",
        "feature": "근속 중심, 예측 가능",
        "fit": "안정 성장기, 이직률 낮을 때",
        "pro": "운영 단순",
        "con": "성과 동기 약함",
        "recommended": False,
    },
    {
        "name": "직무급 체계",
        "feature": "직무 가치 기반, 내부 형평",
        "fit": "직무 분화 뚜렷, 100인+",
        "pro": "형평성 높음",
        "con": "직무 평가 비용",
        "recommended": False,
    },
    {
        "name": "밴드형 급여",
        "feature": "직급별 범위, 성과로 밴드 내 이동",
        "fit": "성장기 스타트업, 유연성 필요",
        "pro": "유연 + 차등",
        "con": "밴드 설계 필요",
        "recommended": True,
    },
    {
        "name": "고성과급형",
        "feature": "기본급 낮고 인센티브 높음",
        "fit": "세일즈/성과 측정 명확",
        "pro": "강한 동기",
        "con": "불안정, 협업 저하",
        "recommended": False,
    },
]

EVALUATION_OPTIONS = [
    {
        "name": "MBO (목표 관리)",
        "cycle": "반기/연간",
        "feature": "목표 달성률 기반",
        "fit": "목표 명확한 조직, 안정 성장기",
        "pro": "정렬 명확, 운영 단순",
        "con": "경직적, 변화 대응 어려움",
        "recommended": False,
    },
    {
        "name": "OKR",
        "cycle": "분기",
        "feature": "도전적 목표 + 핵심 결과",
        "fit": "빠른 성장기, 제품 중심 조직",
        "pro": "유연, 도전 장려",
        "con": "평가 연동 설계 어려움",
        "recommended": True,
    },
    {
        "name": "상시 피드백 (No Rating)",
        "cycle": "수시",
        "feature": "등급 없이 코칭 중심",
        "fit": "리더십 역량 높은 조직, 50인 미만",
        "pro": "심리적 안전감",
        "con": "보상 연동 불가, 관리자 의존",
        "recommended": False,
    },
    {
        "name": "상대평가 (강제 분포)",
        "cycle": "반기/연간",
        "feature": "등급별 인원 비율 강제",
        "fit": "성과 차등 필요, 100인+",
        "pro": "명확한 차등",
        "con": "내부 경쟁 과열, 수용성 저하",
        "recommended": False,
    },
    {
        "name": "다면 평가 (360도)",
        "cycle": "반기",
        "feature": "상사/동료/부하 복합",
        "fit": "리더 평가, 협업 중시 조직",
        "pro": "다각적 관점",
        "con": "시간 비용 큼, 정치적 오용 가능",
        "recommended": False,
    },
]

RECRUITMENT_OPTIONS = [
    {
        "name": "리퍼럴 중심",
        "feature": "재직자 추천, 보상 인센티브",
        "fit": "조직 문화 강한 50인 이하",
        "pro": "컬처핏 높음, 비용 낮음",
        "con": "다양성 저하, 규모 한계",
        "recommended": False,
    },
    {
        "name": "채용 플랫폼 다각화",
        "feature": "원티드/사람인/로켓펀치 + 링크드인",
        "fit": "30–100인, 채용 볼륨 필요",
        "pro": "후보 풀 확대",
        "con": "스크리닝 비용 증가",
        "recommended": True,
    },
    {
        "name": "헤드헌터 활용",
        "feature": "C-Level/시니어 전문 서치",
        "fit": "핵심 포지션 긴급 충원",
        "pro": "속도, 전문성",
        "con": "비용 높음 (연봉 20–30%)",
        "recommended": False,
    },
    {
        "name": "채용 브랜딩 투자",
        "feature": "테크블로그, 채용 페이지, 컨퍼런스",
        "fit": "100인+, 중장기 파이프라인",
        "pro": "지원자 품질 향상",
        "con": "ROI 측정 어려움, 6개월+ 소요",
        "recommended": False,
    },
    {
        "name": "인턴/주니어 파이프라인",
        "feature": "대학 연계, 부트캠프 채용",
        "fit": "주니어 대량 채용 필요",
        "pro": "비용 효율, 조직 문화 학습",
        "con": "교육 투자 필요",
        "recommended": False,
    },
]

RETENTION_OPTIONS = [
    {
        "name": "핵심인재 리텐션 패키지",
        "feature": "Top 10–20% 별도 보상/성장 트랙",
        "fit": "핵심 인재 이탈 경험 있을 때",
        "pro": "타겟팅 효과 높음",
        "con": "형평성 논란 가능",
        "recommended": True,
    },
    {
        "name": "체계적 온보딩 프로그램",
        "feature": "30/60/90일 체크포인트",
        "fit": "조기 퇴사율 20%+",
        "pro": "조기 이탈 방지",
        "con": "설계/운영 리소스",
        "recommended": False,
    },
    {
        "name": "Stay Interview",
        "feature": "재직자 대상 정기 면담",
        "fit": "이직 사유 파악 필요",
        "pro": "선제적 리스크 감지",
        "con": "관리자 시간 투자",
        "recommended": False,
    },
    {
        "name": "퇴직 인터뷰 체계화",
        "feature": "퇴직자 면담 + 데이터 축적",
        "fit": "이직 패턴 분석 필요",
        "pro": "근본 원인 파악",
        "con": "사후적, 즉시 효과 없음",
        "recommended": False,
    },
    {
        "name": "경력 성장 경로 설계",
        "feature": "직급/역할 로드맵 명시",
        "fit": "성장 기회 부족이 이직 사유",
        "pro": "장기 리텐션",
        "con": "설계 복잡, 소규모 조직 한계",
        "recommended": False,
    },
]

LEADERSHIP_OPTIONS = [
    {
        "name": "리더십 코칭 프로그램",
        "feature": "외부 코치 또는 내부 교육",
        "fit": "피드백 역량 부족 시",
        "pro": "행동 변화 직접 유도",
        "con": "비용, 6개월+ 소요",
        "recommended": False,
    },
    {
        "name": "1on1 제도화",
        "feature": "격주/월 1회 의무화 + 가이드",
        "fit": "1on1 미운영 조직",
        "pro": "소통 채널 확보, 이슈 조기 감지",
        "con": "관리자 시간 투자, 형식화 위험",
        "recommended": True,
    },
    {
        "name": "전결권 위임 체계",
        "feature": "직급별 의사결정 범위 명문화",
        "fit": "CEO 병목 심한 50인+",
        "pro": "의사결정 속도 향상",
        "con": "CEO 통제력 감소 불안",
        "recommended": False,
    },
    {
        "name": "핵심가치 행동 지표화",
        "feature": "가치별 관찰 가능 행동 정의",
        "fit": "핵심가치 형해화 시",
        "pro": "채용/평가 기준 명확",
        "con": "설계 시간, 합의 과정 필요",
        "recommended": False,
    },
    {
        "name": "OKR 캐스케이딩",
        "feature": "전사 → 팀 → 개인 목표 정렬",
        "fit": "비전 공감 부족, 사일로 심할 때",
        "pro": "방향 정렬, 투명성",
        "con": "도입 초기 혼란",
        "recommended": False,
    },
]

BENCHMARKS = {
    "compensation": {
        "title": "50–100인 B2B SaaS 기준",
        "items": [
            {
                "label": "평균 성과급 비율",
                "value": "기본급 대비 15–25%",
                "note": "귀사 현재: 응답 기반 해석",
                "companies": "토스, 당근, 카카오",
            },
            {
                "label": "시장 보상 수준",
                "value": "중위 50–75%ile",
                "note": "귀사 현재: 응답 기반 해석",
                "companies": "리멤버, 채널톡",
            },
            {
                "label": "인건비 / 매출 비중",
                "value": "25–35%",
                "note": "귀사 현재: 응답 기반 해석",
                "companies": "업계 평균",
            },
            {
                "label": "보상 구조 트렌드",
                "value": "밴드형 + 분기 성과급",
                "note": "성장기 스타트업에서 주로 검토",
                "companies": "토스, 쏘카, 버킷플레이스",
            },
        ],
        "disclaimer": "20인 이하 초기 조직의 경우, 위 기준에서 보수적으로 10–15% 하향 조정한 수치를 목표로 삼으십시오.",
    },
    "evaluation": {
        "title": "50–100인 B2B SaaS 기준",
        "items": [
            {
                "label": "평가 주기",
                "value": "분기 OKR + 반기 공식 리뷰",
                "note": "연 1회는 소수",
                "companies": "토스(OKR), 당근(분기 리뷰)",
            },
            {
                "label": "평가-보상 연동",
                "value": "중간–강한 연동 (60%)",
                "note": "완전 분리는 10% 미만",
                "companies": "카카오, 네이버",
            },
            {
                "label": "대표-직원 공정성 차이",
                "value": "1점 이내 (10점 척도)",
                "note": "2점 = 주의, 3점+ = 즉시 대응",
                "companies": "",
            },
            {
                "label": "평가 운영 데이터 보유율",
                "value": "55%",
                "note": "나머지는 수기 또는 미보유",
                "companies": "",
            },
        ],
        "disclaimer": "20인 이하 초기 조직의 경우, 평가-보상 연동 비율 45–50%, 데이터 보유율 40% 수준을 목표로 삼으십시오.",
    },
    "recruitment": {
        "title": "50–100인 B2B SaaS 기준",
        "items": [
            {
                "label": "핵심 포지션 채용 소요",
                "value": "2–3개월",
                "note": "4개월 초과 시 경쟁력 저하",
                "companies": "업계 평균",
            },
            {
                "label": "활용 채널 수",
                "value": "3–4개",
                "note": "리퍼럴 + 플랫폼 2개 + α",
                "companies": "원티드, 링크드인, 로켓펀치",
            },
            {
                "label": "오퍼 수락률",
                "value": "75–85%",
                "note": "70% 미만이면 경쟁력 문제",
                "companies": "",
            },
            {
                "label": "채용 비용 / 인당",
                "value": "300–500만 원",
                "note": "헤드헌터 사용 시 1,000만+",
                "companies": "",
            },
        ],
        "disclaimer": "20인 이하 초기 조직의 경우, 오퍼 수락률 65–75%, 채용 소요 3–4개월도 정상 범위입니다.",
    },
    "retention": {
        "title": "50–100인 B2B SaaS 기준",
        "items": [
            {
                "label": "자발적 이직률",
                "value": "12–18% / 연",
                "note": "20% 초과 시 위험",
                "companies": "업계 평균",
            },
            {
                "label": "핵심 인재 이탈률",
                "value": "5% 이하",
                "note": "10% 초과 시 조직 역량 훼손",
                "companies": "",
            },
            {
                "label": "신규 입사자 1년 내 퇴사",
                "value": "15–20%",
                "note": "30% 초과 시 온보딩 실패",
                "companies": "",
            },
            {
                "label": "퇴직 인터뷰 실시율",
                "value": "40%",
                "note": "체계적 실시는 소수",
                "companies": "당근, 토스",
            },
        ],
        "disclaimer": "20인 이하 초기 조직의 경우, 자발적 이직률 20–25%도 비정상은 아니며 핵심 인재 1명 이탈의 충격이 큽니다.",
    },
    "leadership": {
        "title": "50–100인 B2B SaaS 기준",
        "items": [
            {
                "label": "정기 1on1 운영률",
                "value": "60–70%",
                "note": "격주 이상이 표준",
                "companies": "토스, 카카오, 쿠팡",
            },
            {
                "label": "리더십 교육 투자",
                "value": "연 1–2회 외부 교육",
                "note": "체계적 코칭은 소수",
                "companies": "",
            },
            {
                "label": "CEO 직접 면접 비율",
                "value": "시니어/C-Level만",
                "note": "전원 면접은 30인 이하에서만 적합",
                "companies": "",
            },
            {
                "label": "핵심가치 행동 기준 보유",
                "value": "35%",
                "note": "대부분 선언적 수준",
                "companies": "당근",
            },
        ],
        "disclaimer": "20인 이하 초기 조직에서는 CEO 직접 면접/승인이 적합할 수 있습니다. 위임 체계는 30–50인 구간에서 설계를 시작하십시오.",
    },
}

OPTIONS_MAP = {
    "compensation": COMPENSATION_OPTIONS,
    "evaluation": EVALUATION_OPTIONS,
    "recruitment": RECRUITMENT_OPTIONS,
    "retention": RETENTION_OPTIONS,
    "leadership": LEADERSHIP_OPTIONS,
}
