$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

$nextCache = Join-Path $PSScriptRoot ".next"
if (Test-Path -LiteralPath $nextCache) {
  Remove-Item -LiteralPath $nextCache -Recurse -Force
}

& npm.cmd run dev
