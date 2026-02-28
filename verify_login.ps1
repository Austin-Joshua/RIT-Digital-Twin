# Verify Backend Authentication
$baseUrl = "http://localhost:8080/api/auth/login"

$testUsers = @(
    @{ username = "admin@ritchennai.edu.in"; password = "admin123"; role = "Admin" },
    @{ username = "faculty@ritchennai.edu.in"; password = "faculty123"; role = "Faculty" },
    @{ username = "student@ritchennai.edu.in"; password = "student123"; role = "Student" }
)

foreach ($user in $testUsers) {
    Write-Host "Testing login for $($user.role)..." -ForegroundColor Cyan
    $body = @{
        username = $user.username
        password = $user.password
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
        if ($response.token) {
            Write-Host "SUCCESS: Logged in as $($user.role). Username: $($response.username)" -ForegroundColor Green
        } else {
            Write-Host "FAILURE: No token received for $($user.role)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: Failed to connect or authenticate for $($user.role). Status code: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
        $_.Exception.Message
    }
    Write-Host "--------------------------------"
}
