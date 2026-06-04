# Transition Gap 배포 준비 메모

현재 시안 기준 배포 대상은 `frontend/` Next.js와 `backend/` FastAPI입니다. Streamlit 앱은 이번 시안의 배포 대상이 아닙니다.

## 로컬 실행

```powershell
# Frontend
cd frontend
npm.cmd run dev

# Backend
cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8010
```

## Frontend 환경 변수

Next.js 배포 환경에 아래 값을 설정합니다.

```text
NEXT_PUBLIC_API_BASE_URL=https://<backend-domain>
```

기존 호환을 위해 `NEXT_PUBLIC_API_URL`도 동작하지만, 신규 설정은 `NEXT_PUBLIC_API_BASE_URL`을 기준으로 둡니다.

## Backend 환경 변수

FastAPI 배포 환경에 아래 값을 설정합니다.

```text
ALLOWED_ORIGINS=https://<frontend-domain>
FRONTEND_URL=https://<frontend-domain>/
```

`ALLOWED_ORIGINS`는 쉼표로 여러 origin을 넣을 수 있습니다.

```text
ALLOWED_ORIGINS=https://transition-gap.vercel.app,http://localhost:3000
```

## 배포 전 확인

1. `frontend`에서 `npm.cmd run typecheck`를 통과시킵니다.
2. `backend`에서 `..\.venv\Scripts\python.exe -m pytest core_tests -q`를 통과시킵니다.
3. 배포 후 아래 엔드포인트를 확인합니다.

```powershell
Invoke-WebRequest -UseBasicParsing https://<backend-domain>/health
Invoke-WebRequest -UseBasicParsing https://<backend-domain>/api/schema
Invoke-WebRequest -UseBasicParsing https://<frontend-domain>/
```

## 권장 배포 조합

- Frontend: Vercel
- Backend: Render, Railway, Fly.io 중 하나

MVP 단계에서는 프론트와 백엔드를 분리 배포하고, API URL과 CORS origin만 환경 변수로 연결하는 구성이 가장 단순합니다.
