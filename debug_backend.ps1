# Debug Backend Startup Script
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
$env:PATH = "C:\Program Files\Java\jdk-25.0.2\bin;" + $env:PATH

$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/rit_digital_twin?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true"
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "123456"
$env:JWT_SECRET = "RITDigitalTwinSmartCampusIntelligencePlatformSecretKey2026VeryLongSecureKeyForProduction"
$env:JWT_EXPIRATION_MS = "86400000"
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:SPRING_JPA_HIBERNATE_DDL_AUTO = "update"

Set-Location -Path "$PSScriptRoot\backend"

$mvn = "$env:USERPROFILE\.maven\apache-maven-3.9.6\bin\mvn.cmd"
Write-Host "Starting Spring Boot with Maven: $mvn" -ForegroundColor Cyan

& $mvn spring-boot:run -e 2>&1 | Tee-Object -FilePath "$PSScriptRoot\backend_startup.log"
