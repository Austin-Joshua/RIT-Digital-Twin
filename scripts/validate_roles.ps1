$baseUrl = "http://localhost:8080/api/auth/login"

$roles = @(
    @{ name = "Admin";   username = "admin@ritchennai.edu.in";  password = "ADM-001" },
    @{ name = "Faculty"; username = "faculty@ritchennai.edu.in"; password = "FAC-001" },
    @{ name = "HOD";     username = "hod@ritchennai.edu.in";     password = "HOD-001" },
    @{ name = "Student"; username = "2117240020044";            password = "2117240020044" },
    @{ name = "Parent";  username = "parent@ritchennai.edu.in";  password = "password123" }
)

Write-Host "`n--- RIT Role Login Validation ---" -ForegroundColor Cyan

foreach ($role in $roles) {
    $body = @{
        username = $role.username
        password = $role.password
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $baseUrl -Method Post -ContentType "application/json" -Body $body
        if ($response.token) {
            Write-Host "[SUCCESS] $($role.name.PadRight(8)): Login successful for $($role.username)" -ForegroundColor Green
        } else {
            Write-Host "[FAILURE] $($role.name.PadRight(8)): Login failed (No token) for $($role.username)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[ERROR]   $($role.name.PadRight(8)): Login failed for $($role.username) - Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host "--- Validation Complete ---`n"
