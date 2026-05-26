@echo off
setlocal

set "ROOT=%~dp0.."
if "%BACKEND_PORT%"=="" set "BACKEND_PORT=8010"
set "LOCAL_PYTHON=%ROOT%\.uv-python\cpython-3.12.13-windows-x86_64-none\python.exe"
set "BACKEND_SITE_PACKAGES=%~dp0.venv\Lib\site-packages"

if exist "%LOCAL_PYTHON%" (
  echo Starting backend with project-local Python on port %BACKEND_PORT%...
  set "PYTHONPATH=%BACKEND_SITE_PACKAGES%"
  "%LOCAL_PYTHON%" -m uvicorn app.main:app --reload --host 127.0.0.1 --port %BACKEND_PORT%
  exit /b %errorlevel%
)

if exist ".venv\Scripts\python.exe" (
  echo Starting backend with backend virtualenv Python on port %BACKEND_PORT%...
  ".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port %BACKEND_PORT%
  exit /b %errorlevel%
)

echo Starting backend with PATH uvicorn on port %BACKEND_PORT%...
uvicorn app.main:app --reload --host 127.0.0.1 --port %BACKEND_PORT%
exit /b %errorlevel%
