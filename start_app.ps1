# RIT Digital Twin - Startup Script

Write-Host "Checking Docker status..." -ForegroundColor Cyan

try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
    Write-Host "Docker is running." -ForegroundColor Green
} catch {
    Write-Error "Docker Desktop is not running or not accessible."
    Write-Host "Please start Docker Desktop and wait for the engine to initialize." -ForegroundColor Yellow
    exit 1
}

Write-Host "Building and starting containers..." -ForegroundColor Cyan
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nApplication started successfully!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "Backend:  http://localhost:8080/api/" -ForegroundColor White
    Write-Host "Swagger:  http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
    
    Write-Host "`nLogin Credentials:" -ForegroundColor Yellow
    Write-Host "Admin:   admin@ritchennai.edu.in / admin123"
    Write-Host "Faculty: faculty@ritchennai.edu.in / faculty123"
    Write-Host "Student: student@ritchennai.edu.in / student123"
} else {
    Write-Error "Failed to start application."
}
