param (
    [string]$ArgsToPass = "spring-boot:run"
)

# RIT Digital Twin - Backend Startup Script
# This script loads environment variables from .env and starts the Spring Boot backend.

# Set JAVA_HOME to JDK 21
$JdkPath = "C:\Program Files\Java\jdk-21.0.10"
if (Test-Path $JdkPath) {
    $env:JAVA_HOME = $JdkPath
    $env:PATH = "$JdkPath\bin;" + $env:PATH
    Write-Host "Using JDK 21 at $JdkPath" -ForegroundColor Cyan
}

$EnvFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $EnvFile) {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Cyan
    Get-Content $EnvFile | Where-Object { $_ -match "=" -and $_ -notmatch "^\s*#" } | ForEach-Object {
        $parts = $_ -split "=", 2
        if ($parts.Length -eq 2) {
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()
            # Remove quotes if present
            if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
                $value = $value.Substring(1, $value.Length - 2)
            }
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Set $name" -ForegroundColor DarkGray
        }
    }
}
else {
    Write-Warning ".env file not found in $PSScriptRoot. Using system environment variables."
}

$BackendDir = Join-Path $PSScriptRoot "backend"
if (Test-Path $BackendDir) {
    Set-Location $BackendDir
    Write-Host "Starting Backend in $BackendDir..." -ForegroundColor Green
    
    # Check if port 8080 is in use
    $port = 8080
    $portProcess = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portProcess) {
        Write-Error "Port $port is already in use by PID $($portProcess[0].OwningProcess). Please stop that process first."
        exit 1
    }

    # Try to find Maven
    $MvnPath = "$env:USERPROFILE\.maven\apache-maven-3.9.6\bin\mvn.cmd"
    if (Test-Path $MvnPath) {
        Write-Host "Using system Maven at $MvnPath" -ForegroundColor DarkGray
        Write-Host "Running: mvn $ArgsToPass" -ForegroundColor Cyan
        & $MvnPath $ArgsToPass.Split(" ")
    }
    elseif (Test-Path "mvnw.cmd") {
        .\mvnw.cmd $ArgsToPass.Split(" ")
    }
    else {
        mvn $ArgsToPass.Split(" ")
    }
}
else {
    Write-Error "Backend directory not found!"
    exit 1
}
