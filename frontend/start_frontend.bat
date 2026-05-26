@echo off
setlocal

cd /d "%~dp0"
if "%FRONTEND_PORT%"=="" set "FRONTEND_PORT=3000"
if "%NEXT_PUBLIC_API_URL%"=="" set "NEXT_PUBLIC_API_URL=http://127.0.0.1:8010"

echo Starting frontend on port %FRONTEND_PORT%...
echo Backend API: %NEXT_PUBLIC_API_URL%
npm.cmd run dev -- --hostname 127.0.0.1 --port %FRONTEND_PORT%
exit /b %errorlevel%
