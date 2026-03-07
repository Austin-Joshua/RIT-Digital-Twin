# RIT Digital Twin - Quick Start Script for Windows
# This script starts backend and frontend in the correct order

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "RIT Digital Twin - LOCAL DEPLOYMENT" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
Write-Host "[1/4] Checking if backend is running..." -ForegroundColor Green
$backendProcess = Get-Process java -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -like "*java*"
} | Select-Object -First 1

if ($backendProcess) {
    Write-Host "✅ Backend already running (PID: $($backendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend not running. Starting backend..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start backend in new window
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", ".\run_backend.ps1" -WindowStyle Normal
    
    Write-Host "⏳ Backend starting... Wait 20-30 seconds for startup message" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 5
}

# Verify backend is accessible
Write-Host "[2/4] Verifying backend accessibility..." -ForegroundColor Green
$backendResponds = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/actuator/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendResponds = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if ($backendResponds) {
    Write-Host "✅ Backend is accessible at http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend not responding. Check if MySQL is running and backend started." -ForegroundColor Yellow
    Write-Host "   Verify MySQL: Get-Service | Where-Object {`$_.Name -like '*MySQL*'}" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/4] Preparing frontend..." -ForegroundColor Green

# Check if node_modules exists
if (!(Test-Path "frontend/node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install --legacy-peer-deps
    Set-Location ..
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if .env.local exists
if (!(Test-Path "frontend/.env.local")) {
    Write-Host "⚠️  .env.local not found. Creating..." -ForegroundColor Yellow
    Write-Host "   Using: VITE_API_BASE_URL=http://localhost:8080/api" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/4] Starting frontend dev server..." -ForegroundColor Green
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Opening Vite dev server on port 5173..." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes on port 5173
$nodeProcess = netstat -ano | Select-String "5173" | ForEach-Object {
    $parts = $_ -split '\s+' | Where-Object {$_}
    [int]$parts[-1]
} | Select-Object -First 1

if ($nodeProcess) {
    Write-Host "⚠️  Something is already using port 5173. Stopping..." -ForegroundColor Yellow
    Stop-Process -Id $nodeProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start frontend
Set-Location frontend
Write-Host "🚀 Frontend dev server starting..." -ForegroundColor Cyan
Write-Host "   Access: http://localhost:5173" -ForegroundColor Green
Write-Host "   Login: admin@ritchennai.edu.in / admin123" -ForegroundColor Green
Write-Host ""
npm run dev

