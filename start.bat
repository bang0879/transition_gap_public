@echo off
setlocal

:: Pin the working directory to this batch file location.
set "ROOT=%~dp0"
cd /d "%ROOT%"
echo Starting Transition Gap Servers...

set "BACKEND_PORT=8010"
set "FRONTEND_PORT=3000"
set "BACKEND_URL=http://127.0.0.1:%BACKEND_PORT%"
set "FRONTEND_URL=http://127.0.0.1:%FRONTEND_PORT%"
set "BACKEND_ALREADY_RUNNING=0"
set "FRONTEND_ALREADY_RUNNING=0"

echo Checking local ports...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$status=0; $body='';" ^
  "try { $r=Invoke-WebRequest -UseBasicParsing -Uri '%BACKEND_URL%/health' -TimeoutSec 2; $status=[int]$r.StatusCode; $body=[string]$r.Content } catch { if($_.Exception.Response){ $status=[int]$_.Exception.Response.StatusCode } }" ^
  "if($status -eq 0) { exit 1 }" ^
  "if($status -eq 200 -and $body -match '\"status\"\\s*:\\s*\"ok\"') { exit 0 }" ^
  "exit 2"

if errorlevel 2 (
  echo Port %BACKEND_PORT% is already used by another app. Stop that app first, then run start.bat again.
  echo Expected backend: %BACKEND_URL%/health should return {"status":"ok"}
  pause
  endlocal
  exit /b 1
)

if not errorlevel 1 (
  set "BACKEND_ALREADY_RUNNING=1"
  echo Backend is already running on port %BACKEND_PORT%.
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$status=0; $body='';" ^
  "try { $r=Invoke-WebRequest -UseBasicParsing -Uri '%FRONTEND_URL%' -TimeoutSec 2; $status=[int]$r.StatusCode; $body=[string]$r.Content } catch { if($_.Exception.Response){ $status=[int]$_.Exception.Response.StatusCode } }" ^
  "if($status -eq 0) { exit 1 }" ^
  "if($status -eq 200 -and $body -match 'Transition Gap') { exit 0 }" ^
  "exit 2"

if errorlevel 2 (
  echo Port %FRONTEND_PORT% is already used by another app. Stop that app first, then run start.bat again.
  pause
  endlocal
  exit /b 1
)

if not errorlevel 1 (
  set "FRONTEND_ALREADY_RUNNING=1"
  echo Frontend is already running on port %FRONTEND_PORT%.
)

:: Start backend in a new window.
if "%BACKEND_ALREADY_RUNNING%"=="0" (
  start "Transition Gap Backend" /D "%ROOT%backend" cmd /k "set BACKEND_PORT=%BACKEND_PORT%&& start_backend.bat"
)

:: Start frontend in a new window.
if "%FRONTEND_ALREADY_RUNNING%"=="0" (
  start "Transition Gap Frontend" /D "%ROOT%frontend" cmd /k "set NEXT_PUBLIC_API_URL=%BACKEND_URL%&& npm.cmd run dev"
)

echo Waiting for the backend and frontend to become ready...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='SilentlyContinue';" ^
  "$backendReady=$false; $frontendReady=$false;" ^
  "for($i=0; $i -lt 60; $i++) {" ^
  "  if(-not $backendReady) { try { $r=Invoke-WebRequest -UseBasicParsing -Uri '%BACKEND_URL%/health' -TimeoutSec 2; $backendReady = $r.StatusCode -eq 200 -and [string]$r.Content -match '\"status\"\\s*:\\s*\"ok\"' } catch {} }" ^
  "  if(-not $frontendReady) { try { $frontendReady = (Invoke-WebRequest -UseBasicParsing -Uri '%FRONTEND_URL%' -TimeoutSec 2).StatusCode -eq 200 } catch {} }" ^
  "  if($backendReady -and $frontendReady) { exit 0 }" ^
  "  Start-Sleep -Seconds 1" ^
  "}" ^
  "exit 1"

if errorlevel 1 (
  echo Servers are still booting. Check the backend and frontend windows for errors.
  echo Frontend URL: %FRONTEND_URL%
  echo Backend health: %BACKEND_URL%/health
  pause
  endlocal
  exit /b 1
)

echo Opening Transition Gap in your browser...
start "" "%FRONTEND_URL%"

echo Both servers are ready. You can close this window after the browser opens.
endlocal
exit
