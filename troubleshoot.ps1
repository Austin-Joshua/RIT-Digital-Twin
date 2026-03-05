# Troubleshooting Script for RIT Digital Twin
# Diagnose and fix common issues

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "RIT Digital Twin - TROUBLESHOOTING SUITE" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Backend {
    Write-Host "[CHECK] Testing Backend on port 8080..." -ForegroundColor Green
    
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8080/api/actuator/health" -TimeoutSec 2
        Write-Host "✅ Backend is running and responding" -ForegroundColor Green
        Write-Host "   Status: UP" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Backend not responding" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-MySQL {
    Write-Host "[CHECK] Testing MySQL connection..." -ForegroundColor Green
    
    # Just check if MySQL service exists
    $mySQLService = Get-Service | Where-Object {$_.Name -like "*MySQL*"} | Select-Object -First 1
    
    if ($mySQLService) {
        if ($mySQLService.Status -eq "Running") {
            Write-Host "✅ MySQL service is running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ MySQL service exists but is stopped" -ForegroundColor Red
            Write-Host "   Service: $($mySQLService.Name)" -ForegroundColor Yellow
            Write-Host "   To start: Start-Service $($mySQLService.Name)" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "⚠️  MySQL service not found" -ForegroundColor Yellow
        Write-Host "   Make sure MySQL is installed and the service name contains 'MySQL'" -ForegroundColor Yellow
        return $false
    }
}

function Test-Ports {
    Write-Host "[CHECK] Testing port availability..." -ForegroundColor Green
    
    # Check port 8080
    $port8080 = netstat -ano | Select-String "8080"
    $port5173 = netstat -ano | Select-String "5173"
    
    if ($port8080) {
        Write-Host "⚠️  Port 8080 is in use" -ForegroundColor Yellow
        Write-Host "   $($port8080 | Select-Object -First 1)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Port 8080 is available" -ForegroundColor Green
    }
    
    if ($port5173) {
        Write-Host "⚠️  Port 5173 is in use" -ForegroundColor Yellow
        Write-Host "   $($port5173 | Select-Object -First 1)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Port 5173 is available" -ForegroundColor Green
    }
}

function Test-NodeModules {
    Write-Host "[CHECK] Checking frontend dependencies..." -ForegroundColor Green
    
    if (Test-Path "frontend/node_modules") {
        Write-Host "✅ node_modules directory exists" -ForegroundColor Green
        $packageCount = (Get-ChildItem "frontend/node_modules" -Directory).Count
        Write-Host "   $packageCount packages installed" -ForegroundColor Green
    } else {
        Write-Host "❌ node_modules directory not found" -ForegroundColor Red
        Write-Host "   Run: cd frontend && npm install --legacy-peer-deps" -ForegroundColor Yellow
        return $false
    }
    return $true
}

function Test-EnvFiles {
    Write-Host "[CHECK] Checking environment configuration files..." -ForegroundColor Green
    
    $missingFiles = @()
    
    if (Test-Path "frontend/.env.local") {
        Write-Host "✅ .env.local exists" -ForegroundColor Green
        $envContent = Get-Content "frontend/.env.local"
        if ($envContent -match "VITE_API_BASE_URL") {
            Write-Host "   ✓ VITE_API_BASE_URL configured" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ .env.local not found" -ForegroundColor Red
        $missingFiles += ".env.local"
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Host "   Run create-env-files.ps1 to create missing files" -ForegroundColor Yellow
        return $false
    }
    
    return $true
}

function Stop-ProcessOnPort {
    param([int]$Port)
    
    $process = netstat -ano | Select-String ":$Port " | ForEach-Object {
        $parts = $_ -split '\s+' | Where-Object {$_}
        [int]$parts[-1]
    } | Select-Object -First 1
    
    if ($process) {
        Write-Host "Stopping process on port $Port (PID: $process)..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✅ Process stopped" -ForegroundColor Green
    }
}

function Show-Menu {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "DIAGNOSTIC OPTIONS" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "1. Run all checks" -ForegroundColor Yellow
    Write-Host "2. Test backend connectivity" -ForegroundColor Yellow
    Write-Host "3. Test MySQL service" -ForegroundColor Yellow
    Write-Host "4. Check port availability" -ForegroundColor Yellow
    Write-Host "5. Check frontend dependencies" -ForegroundColor Yellow
    Write-Host "6. Check environment files" -ForegroundColor Yellow
    Write-Host "7. Kill process on port 5173" -ForegroundColor Yellow
    Write-Host "8. Kill process on port 8080" -ForegroundColor Yellow
    Write-Host "9. Show quick fix guide" -ForegroundColor Yellow
    Write-Host "0. Exit" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Cyan
}

function Show-QuickFixes {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "QUICK FIX GUIDE" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "❌ Backend won't start:" -ForegroundColor Red
    Write-Host "   1. Check MySQL is running: Get-Service | Where-Object {`$_.Name -like '*MySQL*'}" -ForegroundColor Yellow
    Write-Host "   2. Check database: mysql -u root -p (enter password: 123456)" -ForegroundColor Yellow
    Write-Host "   3. Start backend: cd backend && .\run_backend.ps1" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "❌ Frontend won't start:" -ForegroundColor Red
    Write-Host "   1. Install dependencies: cd frontend && npm install --legacy-peer-deps" -ForegroundColor Yellow
    Write-Host "   2. Check Node version: node --version (need v18+)" -ForegroundColor Yellow
    Write-Host "   3. Clear cache: Remove-Item .vite -Recurse -Force" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "❌ Port 5173 already in use:" -ForegroundColor Red
    Write-Host "   1. Kill process: Kill-ProcessOnPort 5173" -ForegroundColor Yellow
    Write-Host "   2. Or use different port: npm run dev -- --port 5174" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "❌ API connection error:" -ForegroundColor Red
    Write-Host "   1. Check .env.local exists with VITE_API_BASE_URL=http://localhost:8080/api" -ForegroundColor Yellow
    Write-Host "   2. Verify backend health: curl http://localhost:8080/api/actuator/health" -ForegroundColor Yellow
    Write-Host "   3. Check browser console (F12) for CORS errors" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "❌ MySQL won't start:" -ForegroundColor Red
    Write-Host "   1. Check service: Get-Service | Where-Object {`$_.Name -like '*MySQL*'}" -ForegroundColor Yellow
    Write-Host "   2. Start service: Start-Service MySQL80 (or correct service name)" -ForegroundColor Yellow
    Write-Host "   3. Check logs: Check Windows Event Viewer for MySQL errors" -ForegroundColor Yellow
    Write-Host ""
}

# Main loop
$running = $true
while ($running) {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Test-MySQL
            Write-Host ""
            Test-Backend
            Write-Host ""
            Test-Ports
            Write-Host ""
            Test-NodeModules
            Write-Host ""
            Test-EnvFiles
        }
        "2" {
            Write-Host ""
            Test-Backend
        }
        "3" {
            Write-Host ""
            Test-MySQL
        }
        "4" {
            Write-Host ""
            Test-Ports
        }
        "5" {
            Write-Host ""
            Test-NodeModules
        }
        "6" {
            Write-Host ""
            Test-EnvFiles
        }
        "7" {
            Write-Host ""
            Stop-ProcessOnPort 5173
        }
        "8" {
            Write-Host ""
            Stop-ProcessOnPort 8080
        }
        "9" {
            Show-QuickFixes
        }
        "0" {
            $running = $false
            Write-Host ""
            Write-Host "Goodbye! 👋" -ForegroundColor Green
        }
        default {
            Write-Host "Invalid option. Please try again." -ForegroundColor Red
        }
    }
}
