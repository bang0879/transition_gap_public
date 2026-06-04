@echo off
setlocal

cd /d "%~dp0"
if "%BACKEND_PORT%"=="" set "BACKEND_PORT=8010"
if "%TRANSITION_GAP_BACKEND_VENV%"=="" set "TRANSITION_GAP_BACKEND_VENV=%LOCALAPPDATA%\TransitionGap\backend-venv"
set "BACKEND_PYTHON=%TRANSITION_GAP_BACKEND_VENV%\Scripts\python.exe"

if not exist "%BACKEND_PYTHON%" (
  echo Backend virtualenv is missing.
  echo Run backend\setup_backend.bat from the project root, then run start.bat again.
  echo Expected location: %TRANSITION_GAP_BACKEND_VENV%
  exit /b 1
)

echo Checking backend Python environment...
"%BACKEND_PYTHON%" -c "from fastapi import FastAPI; import uvicorn" >nul 2>nul
if errorlevel 1 (
  echo Backend virtualenv is incomplete or corrupted.
  echo Run backend\setup_backend.bat from the project root, then run start.bat again.
  echo Expected location: %TRANSITION_GAP_BACKEND_VENV%
  exit /b 1
)

echo Starting backend on port %BACKEND_PORT%...
"%BACKEND_PYTHON%" -m uvicorn app.main:app --reload --host 127.0.0.1 --port %BACKEND_PORT%
exit /b %errorlevel%
