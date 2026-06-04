# Transition Gap

한국 스타트업 인사제도 진단, 정합성 괴리 분석, 트레이드오프 시뮬레이션, 단계적 실행 로드맵을 생성하는 HITL MVP 도구입니다.

현재 작업 대상은 `frontend/` Next.js와 `backend/` FastAPI 시안입니다.

## Local Run

```powershell
# Frontend: http://localhost:3000
Start-Process -FilePath 'C:\Users\bang0\OneDrive\바탕 화면\transition-gap\frontend\start_frontend.bat' -WorkingDirectory 'C:\Users\bang0\OneDrive\바탕 화면\transition-gap\frontend' -WindowStyle Minimized

# Backend: http://127.0.0.1:8010
Start-Process -FilePath 'C:\Users\bang0\OneDrive\바탕 화면\transition-gap\backend\start_backend.bat' -WorkingDirectory 'C:\Users\bang0\OneDrive\바탕 화면\transition-gap\backend' -WindowStyle Minimized
```

## Verification

```powershell
cd frontend
npm.cmd run typecheck

cd ..\backend
..\.venv\Scripts\python.exe -m pytest core_tests -q
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8010/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8010/api/schema
```

## Deployment

배포 환경 변수와 체크리스트는 `docs/deployment.md`를 기준으로 관리합니다.
