$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPort = 8010
$FrontendPort = 3000
$BackendUrl = "http://127.0.0.1:$BackendPort"
$FrontendUrl = "http://127.0.0.1:$FrontendPort"
$StartedJobs = @()

function Test-BackendReady {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$BackendUrl/health" -TimeoutSec 2
        return $response.StatusCode -eq 200 -and [string]$response.Content -match '"status"\s*:\s*"ok"'
    }
    catch {
        return $false
    }
}

function Test-FrontendReady {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $FrontendUrl -TimeoutSec 2
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Test-PortTakenByOtherApp {
    param(
        [int]$Port,
        [scriptblock]$ReadyCheck
    )

    if (& $ReadyCheck) {
        return $false
    }

    $connections = netstat -aon | Select-String ":$Port\s+.*LISTENING"
    return $null -ne $connections
}

Write-Host "Starting Transition Gap servers..."
Write-Host "Frontend: $FrontendUrl"
Write-Host "Backend:  $BackendUrl"
Write-Host ""

if (Test-PortTakenByOtherApp -Port $BackendPort -ReadyCheck ${function:Test-BackendReady}) {
    Write-Host "Port $BackendPort is already used by another app. Stop that app, then run start.bat again."
    exit 1
}

if (Test-PortTakenByOtherApp -Port $FrontendPort -ReadyCheck ${function:Test-FrontendReady}) {
    Write-Host "Port $FrontendPort is already used by another app. Stop that app, then run start.bat again."
    exit 1
}

if (Test-BackendReady) {
    Write-Host "Backend is already running."
}
else {
    $backendVenv = if ($env:TRANSITION_GAP_BACKEND_VENV) {
        $env:TRANSITION_GAP_BACKEND_VENV
    }
    else {
        Join-Path $env:LOCALAPPDATA "TransitionGap\backend-venv"
    }
    $backendPython = Join-Path $backendVenv "Scripts\python.exe"
    $backendHealthy = $false
    if (Test-Path $backendPython) {
        Push-Location (Join-Path $Root "backend")
        try {
            & $backendPython -c "from fastapi import FastAPI; import uvicorn" *> $null
            $backendHealthy = $LASTEXITCODE -eq 0
        }
        finally {
            Pop-Location
        }
    }

    if (-not $backendHealthy) {
        Write-Host "Backend Python environment is missing or corrupted."
        Write-Host "Run backend\setup_backend.bat once, then run start.bat again."
        Write-Host "Expected location: $backendVenv"
        exit 1
    }

    Write-Host "Starting backend..."
    $backendJob = Start-Job -ScriptBlock {
        param($RootPath, $Port)
        Set-Location (Join-Path $RootPath "backend")
        $env:BACKEND_PORT = [string]$Port
        cmd.exe /c start_backend.bat
    } -ArgumentList $Root, $BackendPort
    $StartedJobs += $backendJob
}

if (Test-FrontendReady) {
    Write-Host "Frontend is already running."
}
else {
    Write-Host "Starting frontend..."
    $frontendJob = Start-Job -ScriptBlock {
        param($RootPath, $ApiUrl, $Port)
        Set-Location (Join-Path $RootPath "frontend")
        $env:NEXT_PUBLIC_API_URL = $ApiUrl
        $env:FRONTEND_PORT = [string]$Port
        cmd.exe /c start_frontend.bat
    } -ArgumentList $Root, $BackendUrl, $FrontendPort
    $StartedJobs += $frontendJob
}

Write-Host ""
Write-Host "Waiting for servers to become ready..."

$ready = $false
for ($i = 0; $i -lt 90; $i++) {
    $backendReady = Test-BackendReady
    $frontendReady = Test-FrontendReady

    if ($backendReady -and $frontendReady) {
        $ready = $true
        break
    }

    Start-Sleep -Seconds 1
}

if (-not $ready) {
    Write-Host ""
    Write-Host "Servers did not become ready before the timeout."
    Write-Host "Recent server output:"
    foreach ($job in $StartedJobs) {
        Receive-Job -Job $job -Keep -ErrorAction SilentlyContinue
    }
    foreach ($job in $StartedJobs) {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

Write-Host ""
Write-Host "Servers are ready. Opening browser..."
Start-Process $FrontendUrl
Write-Host ""
Write-Host "Keep this window open while using Transition Gap."
Write-Host "Close this window or press Ctrl+C to stop the servers."

try {
    while ($true) {
        Start-Sleep -Seconds 5
    }
}
finally {
    foreach ($job in $StartedJobs) {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }
}
