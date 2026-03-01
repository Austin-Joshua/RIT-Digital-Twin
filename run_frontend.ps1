# RIT Digital Twin - Frontend Startup Script
# This script starts the local frontend development server.

$FrontendDir = Join-Path $PSScriptRoot "frontend"

if (Test-Path $FrontendDir) {
    Set-Location $FrontendDir
    Write-Host "Starting Frontend in $FrontendDir..." -ForegroundColor Green
    
    # Check for node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Cyan
        npm install
    }

    Write-Host "Running: npm run dev" -ForegroundColor Cyan
    npm run dev
}
else {
    Write-Error "Frontend directory not found!"
    exit 1
}
