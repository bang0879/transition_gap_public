"""Diagnosis request schemas."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, model_validator


_INT_VARIABLES = {"2-3-1", "2-4-2", "2-4-3-ceo", "2-4-3-employee"}
_LIST_VARIABLES = {"L1-1", "2-2-2", "2-4-4"}
_REWARD_ARCHETYPE_MAP = {
    "기본급 위주의 안정형": "현금 안정형 (기본급 압도적 위주)",
    "인센티브 위주의 성과연동형": "단기 성과형 (기본급 + 높은 비중의 연간/분기 인센티브)",
    "스톡옵션 중심의 장기비전형": "장기 비전형 (기본급 + 스톡옵션/RSU 등 지분 보상 적극 활용)",
    "직군별로 섞여 있는 혼합형": "혼합형 (위 세 가지가 직급별/직군별로 다름)",
}
_EVAL_REWARD_MAP = {
    "차이가 거의 없거나, 그때그때 대표 재량으로 결정된다.": 1,
    "차등이 있긴 하지만, 공식적인 룰보다는 주관적 판단이 강하게 개입된다.": 2,
    "정해진 공식에 따라 기계적으로 연동되나, 최고-최하 등급 간 차이가 크지 않다.": 3,
    "정해진 공식에 따라 철저히 자동 결정되며, 최고-최하 등급 간 차등이 파격적이다.": 4,
}
_CORE_VALUE_MAP = {
    "그냥 홈페이지에 적혀 있는 좋은 말 수준이다.": "문서로만 존재함",
    "면접관이나 리더의 성향에 따라 들쭉날쭉하게 적용된다.": "일부 참고함",
    "실력이 아무리 뛰어나도 핵심가치에 어긋나면 무조건 탈락시킨다.": "명확한 기준으로 작동함",
}
_L0_CHOICE_MAP = {
    "상위 고성과자 10%에게 업계 최고 수준의 파격적 보상을 집중한다": "A",
    "개인의 파격 차등보다는, 협업과 팀 기여도 중심의 성과급 설계를 통해 조직 전체의 평균 보상 만족도를 높인다.": "B",
    "명확한 목표 대비 성과 추적과 저성과 영역에 대한 솔직한 피드백": "A",
    "구성원과의 정기 1:1 대면 면담 (1on1)을 통한 고충 청취와 심리적 안전감 확보": "B",
    "외부에서 검증된 최고의 S급 인재를 높은 비용을 치르더라도 영입하여 즉시 전력으로 활용한다": "A",
    "우리 회사의 비전에 깊이 공감하고 문화를 잘 아는 내부 주니어를 오랜 시간 공들여 핵심 인재로 육성한다": "B",
}


class DiagnoseRequest(BaseModel):
    """POST /api/diagnose request body."""

    responses: dict[str, Any]

    @model_validator(mode="after")
    def normalize_response_types(self) -> "DiagnoseRequest":
        """Normalize simple frontend type drift without rejecting the request."""
        for var_id in ("L0-1", "L0-2", "L0-3"):
            value = self.responses.get(var_id)
            if isinstance(value, str) and value in _L0_CHOICE_MAP:
                self.responses[var_id] = _L0_CHOICE_MAP[value]

        reward_archetype = self.responses.get("2-3-2")
        if isinstance(reward_archetype, str) and reward_archetype in _REWARD_ARCHETYPE_MAP:
            self.responses["2-3-2"] = _REWARD_ARCHETYPE_MAP[reward_archetype]

        eval_reward = self.responses.get("2-4-2")
        if isinstance(eval_reward, str) and eval_reward in _EVAL_REWARD_MAP:
            self.responses["2-4-2"] = _EVAL_REWARD_MAP[eval_reward]

        core_value = self.responses.get("2-5-6")
        if isinstance(core_value, str) and core_value in _CORE_VALUE_MAP:
            self.responses["2-5-6"] = _CORE_VALUE_MAP[core_value]

        for var_id in _INT_VARIABLES:
            val = self.responses.get(var_id)
            if isinstance(val, str):
                try:
                    self.responses[var_id] = int(val)
                except ValueError:
                    pass
            elif isinstance(val, float):
                self.responses[var_id] = int(val)

        for var_id in _LIST_VARIABLES:
            val = self.responses.get(var_id)
            if isinstance(val, str):
                self.responses[var_id] = [val]

        return self
