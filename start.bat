@echo off
setlocal

chcp 65001 >nul
set "ROOT=%~dp0"
set "SCRIPT=%ROOT%start_servers.ps1"
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%"
set "EXIT_CODE=%errorlevel%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Failed to start Transition Gap servers. Check the messages above.
  pause
)

endlocal
exit /b %EXIT_CODE%
