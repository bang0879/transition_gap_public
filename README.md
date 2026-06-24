# HR Prism

HR Prism is a HITL MVP for Korean startup CEOs and Heads of People. It diagnoses the gap between HR philosophy, current people systems, and execution burden, then helps users decide which operating criteria to clarify next.

The repository still carries the earlier working name, **Transition Gap**, in some historical documents. The current product-facing app is **HR Prism**.

## Current App

The active implementation is **not Streamlit**. The current app is split into:

- `frontend/` — Next.js 15, React 19, TypeScript, Tailwind, Zustand, TanStack Query
- `backend/` — FastAPI, Pydantic, rule-based analysis engine, SQLite event logging
- `docs/` — decisions, feedback notes, deployment notes, and legacy references

The main user flow is:

1. `/diagnose/philosophy`
2. `/diagnose/philosophy/profile`
3. `/diagnose/context`
4. `/diagnose/workforce`
5. `/diagnose/rewards`
6. `/diagnose/evaluation`
7. `/result`
8. `/result/detail`
9. `/matrix`
10. `/scenarios`
11. `/roadmap`

## Legacy Streamlit Files

The following root-level files and folders are legacy artifacts from the previous Streamlit prototype and are kept for reference only:

- `.streamlit/`
- `app.py`
- `src/`
- root `requirements.txt`
- root `pyproject.toml`
- `start.bat`

They are not the current app entrypoint. For current development, use `frontend/` and `backend/`.

Additional legacy context is preserved in `docs/legacy/AGENTS_streamlit_legacy_260607.md`.

## Local Run

Start the backend first:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -e ".[dev]"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8010
```

Then start the frontend in a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the app at:

```text
http://localhost:3000
```

The frontend defaults to the backend API at:

```text
http://127.0.0.1:8010
```

## Verification

Frontend:

```powershell
cd frontend
npm.cmd run test:copy
npm.cmd run typecheck
```

Backend:

```powershell
cd backend
python -m pytest core_tests tests -q
python -m compileall app core_tests tests
```

Health check:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8010/health
```

## Product Principles

- It is a decision-support tool, not an automatic HR recommendation engine.
- It does not recommend systems before diagnosis.
- It avoids telling startups to change everything at once.
- It shows execution burden, leadership load, compensation acceptance, and organizational readiness together.
- It uses language Korean startup operators can understand quickly.
- The MVP is rule-based; no LLM is connected in the current diagnosis flow.

## Deployment

Deployment notes are managed in `docs/deployment.md`.
