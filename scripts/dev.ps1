param([switch]$Stop)

if ($Stop) {
    docker-compose down
    Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process
    Write-Host "All services stopped." -ForegroundColor Green
    exit 0
}

if (-not (Test-Path ".env")) {
    Write-Error "ERROR: .env not found. Copy .env.example to .env and fill in values."
    exit 1
}

Write-Host "Starting MySQL..." -ForegroundColor Cyan
docker-compose up -d db
Start-Sleep 5

Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c cd backend && mvnw.cmd spring-boot:run"

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c cd frontend && npm run dev"

Write-Host ""
Write-Host "RIT Digital Twin running:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  Backend:  http://localhost:8080"
Write-Host "  Swagger:  http://localhost:8080/swagger-ui/index.html"
