# 작업 지시서 #01 — 환경 세팅 및 프로젝트 초기화

**작업 대상**: Codex 데스크탑 앱 (또는 Claude Code)
**예상 소요**: 1.5~2시간
**전제**: `C:\Users\bang0\OneDrive\바탕 화면` 폴더 생성 완료, CLAUDE.md 저장 완료

---

## 작업 목표

5월 12일 ~ 5월 18일 Week 1 빌드의 토대 마련. 이 세션이 끝나면 다음 상태가 되어야 한다:

1. uv로 Python 3.12 가상환경 격리 완료
2. Streamlit 'Hello World' 화면이 화이트 + 파스텔 톤으로 실행
3. 디렉터리 구조 전체 생성
4. Git 초기화 + 첫 커밋
5. Gemini API 연결 테스트 통과
6. Plotly 커스텀 테마 1차 정의

---

## 작업 단계

### Step 1. 환경 세팅 (30분)

#### 1-1. uv 설치 확인

PowerShell에서:
```powershell
uv --version
```

설치 안 되어 있으면:
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### 1-2. 가상환경 생성

프로젝트 폴더에서:
```powershell
cd C:\Users\<강훈>\Desktop\transition-gap
uv venv --python 3.12
.venv\Scripts\activate
```

활성화 확인: 프롬프트 앞에 `(.venv)` 표시.

#### 1-3. `pyproject.toml` 생성

루트에 `pyproject.toml` 파일 생성:

```toml
[project]
name = "transition-gap"
version = "0.1.0"
description = "AI 시대 한국 스타트업 인사제도 진단/설계 도구"
requires-python = ">=3.12,<3.13"
dependencies = [
    "streamlit>=1.32.0",
    "plotly>=5.18.0",
    "google-generativeai>=0.5.0",
    "reportlab>=4.0.0",
    "python-dotenv>=1.0.0",
    "pandas>=2.1.0",
    "numpy>=1.26.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "black>=24.0.0",
    "ruff>=0.3.0",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.black]
line-length = 100
target-version = ["py312"]
```

#### 1-4. 패키지 설치

```powershell
uv pip install -e ".[dev]"
```

설치 확인:
```powershell
streamlit --version
python -c "import plotly; print(plotly.__version__)"
python -c "import google.generativeai; print('ok')"
python -c "import reportlab; print(reportlab.__version__)"
```

모두 정상 출력되어야 한다.

---

### Step 2. 디렉터리 구조 생성 (15분)

CLAUDE.md의 §5에 정의된 구조 그대로 생성. PowerShell:

```powershell
# src 모듈
mkdir src
mkdir src\diagnosis
mkdir src\simulation
mkdir src\execution
mkdir src\report
mkdir src\llm

# 데이터/문서/테스트
mkdir data
mkdir data\benchmarks
mkdir tests
mkdir docs

# Streamlit 설정
mkdir .streamlit
```

각 `src/*/` 디렉터리에 빈 `__init__.py` 생성:
```powershell
New-Item src\__init__.py
New-Item src\diagnosis\__init__.py
New-Item src\simulation\__init__.py
New-Item src\execution\__init__.py
New-Item src\report\__init__.py
New-Item src\llm\__init__.py
```

---

### Step 3. Git 초기화 + .gitignore (10분)

#### 3-1. `.gitignore` 생성

루트에 `.gitignore`:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
venv/
env/
.pytest_cache/
.ruff_cache/

# 환경변수 / 시크릿
.env
*.key

# 데이터
data/*.db
data/benchmarks/*.csv
data/clients/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Streamlit
.streamlit/secrets.toml

# 빌드
build/
dist/
*.egg-info/
```

#### 3-2. `.env.example` 생성

루트에 `.env.example`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

강훈님이 별도로 `.env`를 만들고 실제 API 키 입력. **`.env`는 Git에 절대 커밋되지 않음.**

#### 3-3. Git 초기화

```powershell
git init
git add .
git commit -m "Initial commit: project structure and dependencies"
```

GitHub repo는 이 세션에서는 안 만들어도 OK. v0.2에서 비공개 repo로 push.

---

### Step 4. Streamlit 설정 (15분)

#### 4-1. `.streamlit/config.toml` 생성

```toml
[theme]
base = "light"
primaryColor = "#A8B5D1"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F8F9FB"
textColor = "#2C3E50"
font = "sans serif"

[server]
runOnSave = true
headless = false

[browser]
gatherUsageStats = false
```

#### 4-2. `app.py` 'Hello World' 생성

루트에 `app.py`:

```python
"""
Transition Gap — 인사제도 진단/설계 도구
Streamlit 진입점
"""
import streamlit as st

st.set_page_config(
    page_title="Transition Gap",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.title("Transition Gap")
st.caption("AI 시대 한국 스타트업 인사제도 진단/설계 도구")

st.markdown("---")

st.markdown(
    """
    ### 진단 모듈 (Week 1 빌드 예정)
    - Layer 1: 조직 컨텍스트
    - Layer 2: 전환 갭 (5개 sub-category, 21개 변수)
    - 가시성 지수 자동 계산
    """
)

st.info("환경 세팅 완료. 다음 작업 지시서에서 진단 폼 빌드를 시작합니다.")
```

#### 4-3. 실행 테스트

```powershell
streamlit run app.py
```

브라우저에 화이트 + 파스텔 네이비 톤의 페이지 열리면 성공.

---

### Step 5. Plotly 커스텀 테마 정의 (20분)

`src/theme.py` 생성:

```python
"""
Transition Gap 디자인 토큰 + Plotly 커스텀 테마.

모든 차트는 이 모듈의 PLOTLY_TEMPLATE를 사용한다.
컬러 변경은 이 파일 한 곳에서만 수정.
"""
from __future__ import annotations

import plotly.graph_objects as go
import plotly.io as pio

# ============================================================
# 색상 팔레트 (화이트 + 파스텔)
# ============================================================

COLORS = {
    # 베이스
    "background": "#FFFFFF",
    "surface":    "#F8F9FB",
    "border":     "#E5E8EC",

    # 메인
    "primary":    "#A8B5D1",  # 파스텔 네이비
    "secondary":  "#C8B5D1",  # 파스텔 라벤더
    "accent":     "#F0C9B0",  # 파스텔 코랄
    "warning":    "#F4D8A0",  # 파스텔 머스타드
    "danger":     "#E8B0B5",  # 파스텔 핑크
    "success":    "#B5D1B8",  # 파스텔 민트

    # 텍스트
    "text_primary":   "#2C3E50",
    "text_secondary": "#6C7A89",
    "text_muted":     "#A0AAB5",
}

# 차트용 카테고리 색상 순서
CHART_COLORWAY = [
    COLORS["primary"],
    COLORS["accent"],
    COLORS["secondary"],
    COLORS["warning"],
    COLORS["success"],
    COLORS["danger"],
]

# ============================================================
# 폰트
# ============================================================

FONT_FAMILY = "Noto Sans KR, sans-serif"
FONT_SIZE_BASE = 14

# ============================================================
# Plotly 커스텀 Template
# ============================================================

PLOTLY_TEMPLATE = go.layout.Template(
    layout=go.Layout(
        font=dict(
            family=FONT_FAMILY,
            size=FONT_SIZE_BASE,
            color=COLORS["text_primary"],
        ),
        paper_bgcolor=COLORS["background"],
        plot_bgcolor=COLORS["background"],
        colorway=CHART_COLORWAY,
        xaxis=dict(
            showgrid=True,
            gridcolor=COLORS["border"],
            gridwidth=1,
            zeroline=False,
            linecolor=COLORS["border"],
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        yaxis=dict(
            showgrid=True,
            gridcolor=COLORS["border"],
            gridwidth=1,
            zeroline=False,
            linecolor=COLORS["border"],
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        margin=dict(l=60, r=40, t=60, b=60),
        hoverlabel=dict(
            bgcolor=COLORS["surface"],
            bordercolor=COLORS["border"],
            font=dict(family=FONT_FAMILY, size=13, color=COLORS["text_primary"]),
        ),
        title=dict(
            font=dict(size=18, color=COLORS["text_primary"]),
            x=0.02,
            xanchor="left",
        ),
        legend=dict(
            bgcolor=COLORS["background"],
            bordercolor=COLORS["border"],
            borderwidth=1,
            font=dict(color=COLORS["text_secondary"]),
        ),
    )
)

# 글로벌 등록 — 한 번 import하면 모든 figure에 자동 적용
pio.templates["transition_gap"] = PLOTLY_TEMPLATE
pio.templates.default = "transition_gap"
```

---

### Step 6. Gemini API 연결 테스트 (15분)

#### 6-1. `.env` 파일 작성 (강훈님이 직접)

`.env` 파일에 Gemini API 키 입력:
```
GEMINI_API_KEY=AIza...
```

#### 6-2. `src/llm/client.py` 생성

```python
"""
Gemini API wrapper.

모든 LLM 호출은 이 모듈을 통과한다.
"""
from __future__ import annotations

import os
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

_DEFAULT_MODEL = "gemini-1.5-flash"


def _configure() -> None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY가 .env에 정의되어 있지 않습니다. "
            ".env.example을 참고해 .env 파일을 생성하세요."
        )
    genai.configure(api_key=api_key)


def generate(
    prompt: str,
    *,
    model: str = _DEFAULT_MODEL,
    system_instruction: Optional[str] = None,
    temperature: float = 0.7,
) -> str:
    """
    Gemini 모델 호출.

    Args:
        prompt: 사용자 프롬프트.
        model: 모델 ID. 기본값은 gemini-1.5-flash.
        system_instruction: 시스템 프롬프트.
        temperature: 0.0~1.0.

    Returns:
        모델 응답 텍스트.
    """
    _configure()

    model_obj = genai.GenerativeModel(
        model_name=model,
        system_instruction=system_instruction,
    )

    response = model_obj.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
        ),
    )

    return response.text


def health_check() -> bool:
    """API 연결 확인용."""
    try:
        result = generate("Reply with exactly: OK", temperature=0.0)
        return "OK" in result
    except Exception as e:
        print(f"Health check failed: {e}")
        return False


if __name__ == "__main__":
    # 직접 실행 시 health check
    print("Gemini API health check...")
    print("OK" if health_check() else "FAILED")
```

#### 6-3. 테스트 실행

```powershell
python -m src.llm.client
```

`OK` 출력되면 API 연결 성공.

---

### Step 7. 의사결정 로그 시작 (5분)

`docs/decisions.md` 생성:

```markdown
# Transition Gap — 의사결정 로그

이 파일은 product 빌드 중 모든 주요 의사결정을 기록한다.
Case study 작성 시 1차 자료로 활용된다.

---

## 2026-05-11: 프로젝트 정체성 확정

**컨텍스트**: KAIST GBA MBA 1학기 재학 중, 11년 HR 도메인 자산화 목적.

**결정 사항**:
- Product 작업명: Transition Gap
- Tech stack: Streamlit + Gemini + ReportLab + Plotly
- Python 3.12 (uv 가상환경 격리)
- HITL MVP 형태
- 외부 포지셔닝: "AI 시대 조직 재설계"
- MVP가 푸는 문제: "한국 스타트업 인사제도 정합성 회복"
- 두 layer 연결 로직: 정합성 회복 = AI 시대 재설계의 첫 단계

**근거**: 외부 비전과 MVP 범위를 분리하여 4주 sprint 보호 + 외부 콘텐츠 확장성 유지.

---

## 2026-05-11: 진단 모듈 spec v0.1 확정

**결정 사항**:
- 4 Layer 구조 → 2 Layer로 축소 (Layer 3, 4는 27년 봄 이후)
- Layer 2 sub-category 5개 (인력 안정성 / 채용 / 총보상 / 평가 / 리더십 거버넌스)
- 총 26개 변수, 입력 시간 35~45분
- 가시성 지수 = Product 시그니처 IP
- 8주 deploy 워크플로우에 Week 2-3 사각지대 채우기 단계 포함

---

## 2026-05-11: 시뮬레이션 모듈 — 매트릭스 사분면 명명 확정

**매트릭스 A (Motivation Mix)**:
- Q1 단기 성과형 용병조직
- Q2 장기 비전형 공동체 조직
- Q3 평균의 함정형
- Q4 소수정예 중심형

**매트릭스 B (Operating System)**:
- Q1 개인플레이어 중심형
- Q2 가족형 자율 조직
- Q3 에이전시형 분업/기능 조직
- Q4 대기업 공채 시스템형

**풍선 효과(Balloon Effect) 프레임**: 트레이드오프 양 끝점은 절충 가능하지만, 절충은 막대한 관리 비용을 요구. 진단 결과(리더십 역량 등)에 따라 절충 가능성이 결정된다는 메시지.
```

---

### Step 8. requirements.txt 생성 (5분)

uv 환경의 정확한 패키지 버전 고정:

```powershell
uv pip freeze > requirements.txt
```

생성된 파일을 확인하고 Git에 커밋.

---

### Step 9. 최종 커밋 (5분)

```powershell
git add .
git commit -m "Setup: directory structure, theme, Gemini client, design tokens"
```

---

## 검증 체크리스트

이 세션이 끝났을 때, 다음 모두 통과해야 한다:

- [ ] `streamlit run app.py` 실행 시 화이트 + 파스텔 네이비 톤의 페이지가 열린다
- [ ] `python -m src.llm.client` 실행 시 `OK` 출력
- [ ] `python -c "from src.theme import PLOTLY_TEMPLATE; print('ok')"` 실행 시 `ok` 출력
- [ ] 디렉터리 구조가 CLAUDE.md §5와 일치
- [ ] `.gitignore`에 `.env`, `*.db`, `.venv/` 포함
- [ ] Git log에 2개 이상 커밋 존재
- [ ] `docs/decisions.md` 작성 완료

---

## 막혔을 때

- uv가 Python 3.12를 못 찾으면: `uv python install 3.12` 실행 후 재시도
- Streamlit 실행 시 한글 깨짐: 브라우저 새로고침 (Ctrl+F5)
- Gemini API 401 오류: API 키 재확인, `.env` 파일 인코딩이 UTF-8인지 확인
- ReportLab 설치 실패: `uv pip install reportlab --no-binary :all:` 시도

해결 안 되면 채팅에서 강훈에게 질문.

---

## 다음 작업 지시서

이 세션 완료 후 강훈님은 채팅에서 **작업 지시서 #02 — 진단 모듈 변수 SSOT + Layer 1 폼 빌드**를 받는다.
