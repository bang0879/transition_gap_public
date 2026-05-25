@echo off
setlocal

set "ROOT=%~dp0.."
set "LOCAL_PYTHON=%ROOT%\.uv-python\cpython-3.12.13-windows-x86_64-none\python.exe"
set "BACKEND_SITE_PACKAGES=%~dp0.venv\Lib\site-packages"

if exist "%LOCAL_PYTHON%" (
  echo Starting backend with project-local Python...
  set "PYTHONPATH=%BACKEND_SITE_PACKAGES%"
  "%LOCAL_PYTHON%" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
  exit /b %errorlevel%
)

if exist ".venv\Scripts\python.exe" (
  echo Starting backend with backend virtualenv Python...
  ".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
  exit /b %errorlevel%
)

echo Starting backend with PATH uvicorn...
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
exit /b %errorlevel%
