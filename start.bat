@echo off
setlocal

:: Pin the working directory to this batch file location.
set "ROOT=%~dp0"
cd /d "%ROOT%"
echo Starting Transition Gap Servers...

:: Start backend in a new window.
if exist "backend\.venv\Scripts\python.exe" (
  start "Transition Gap Backend" /D "%ROOT%backend" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
) else (
  start "Transition Gap Backend" /D "%ROOT%backend" cmd /k "uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)

:: Start frontend in a new window.
start "Transition Gap Frontend" /D "%ROOT%frontend" cmd /k "set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000&& npm.cmd run dev"

echo Waiting for the backend and frontend to become ready...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='SilentlyContinue';" ^
  "$backendReady=$false; $frontendReady=$false;" ^
  "for($i=0; $i -lt 60; $i++) {" ^
  "  if(-not $backendReady) { try { $backendReady = (Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8000/health' -TimeoutSec 2).StatusCode -eq 200 } catch {} }" ^
  "  if(-not $frontendReady) { try { $frontendReady = (Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3000' -TimeoutSec 2).StatusCode -eq 200 } catch {} }" ^
  "  if($backendReady -and $frontendReady) { exit 0 }" ^
  "  Start-Sleep -Seconds 1" ^
  "}" ^
  "exit 1"

if errorlevel 1 (
  echo Servers are still booting. Check the backend and frontend windows for errors.
  echo Frontend URL: http://127.0.0.1:3000
  echo Backend health: http://127.0.0.1:8000/health
  pause
  endlocal
  exit /b 1
)

echo Opening Transition Gap in your browser...
start "" "http://127.0.0.1:3000"

echo Both servers are ready. You can close this window after the browser opens.
endlocal
exit
