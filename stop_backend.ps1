# RIT Digital Twin - Backend Stop Script
# This script stops the locally running backend process on port 8080 and any erp-backend Docker container.

Write-Host "Stopping backend system..." -ForegroundColor Cyan

# 1. Stop local process on port 8080
$port = 8080
$portProcess = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($portProcess) {
    $processId = $portProcess[0].OwningProcess
    Write-Host "Stopping local process with PID $processId on port $port..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force
}
else {
    Write-Host "No local process found on port $port." -ForegroundColor DarkGray
}

# 2. Stop Docker container
Write-Host "Checking for erp-backend Docker container..." -ForegroundColor Cyan
docker stop erp-backend 2>$null
docker rm erp-backend 2>$null

Write-Host "Backend system stopped." -ForegroundColor Green
