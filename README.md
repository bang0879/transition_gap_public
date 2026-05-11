# Transition Gap

한국 스타트업 인사제도 진단, 트레이드오프 시뮬레이션, 단계적 실행 로드맵을 생성하는 HITL MVP 도구입니다.

## Local Setup

```powershell
$env:Path = "C:\Users\bang0\.local\bin;$env:Path"
$env:UV_CACHE_DIR = ".uv-cache"
$env:UV_PYTHON_INSTALL_DIR = ".uv-python"
uv venv --python 3.12
.venv\Scripts\activate
uv pip install -e ".[dev]"
streamlit run app.py
```
