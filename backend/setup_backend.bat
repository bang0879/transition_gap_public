@echo off
setlocal

chcp 65001 >nul
cd /d "%~dp0"

set "ROOT=%~dp0.."
set "LOCAL_PYTHON=%ROOT%\.uv-python\cpython-3.12.13-windows-x86_64-none\python.exe"
if "%TRANSITION_GAP_BACKEND_VENV%"=="" set "TRANSITION_GAP_BACKEND_VENV=%LOCALAPPDATA%\TransitionGap\backend-venv"

if not exist "%LOCAL_PYTHON%" (
  echo Project-local Python 3.12 was not found:
  echo %LOCAL_PYTHON%
  echo Install Python 3.12 with uv, then run this script again.
  exit /b 1
)

echo Rebuilding backend virtualenv outside OneDrive:
echo %TRANSITION_GAP_BACKEND_VENV%
if not exist "%LOCALAPPDATA%\TransitionGap" mkdir "%LOCALAPPDATA%\TransitionGap"
"%LOCAL_PYTHON%" -m venv --clear "%TRANSITION_GAP_BACKEND_VENV%"
if errorlevel 1 exit /b %errorlevel%

echo Installing backend dependencies...
"%TRANSITION_GAP_BACKEND_VENV%\Scripts\python.exe" -m ensurepip --upgrade >nul
"%TRANSITION_GAP_BACKEND_VENV%\Scripts\python.exe" -m pip install --upgrade pip
if errorlevel 1 exit /b %errorlevel%

"%TRANSITION_GAP_BACKEND_VENV%\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 exit /b %errorlevel%

echo Backend environment is ready.
endlocal
