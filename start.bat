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

echo Waiting for the frontend to boot...
timeout /t 6 /nobreak >nul

echo Opening Transition Gap in your browser...
start "" "http://127.0.0.1:3000"

echo Both servers are booting up. You can close this window after the browser opens.
endlocal
exit
