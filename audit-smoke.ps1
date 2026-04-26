param(
    [string]$BaseUrl = "http://localhost:8080",
    [switch]$KeepPdf
)

$ErrorActionPreference = "Stop"

function Write-Pass([string]$Message) {
    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Fail([string]$Message) {
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Login([string]$Username, [string]$Password) {
    $body = @{ username = $Username; password = $Password } | ConvertTo-Json
    return Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/auth/login" -ContentType "application/json" -Body $body
}

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) {
        throw $Message
    }
}

try {
    Write-Host "Running audit smoke checks against $BaseUrl" -ForegroundColor Cyan

    $sections = @("CSE-A", "CSE-B", "CSE-C", "CSE-D", "CSE-E", "CSE-F", "CSE-G")
    $payloadObj = @{
        sections = $sections
        semesterNumber = 4
        strictMode = $false
        daysPerWeek = 5
        periodsPerDay = 8
        periodDurationMinutes = 50
    }
    $payload = $payloadObj | ConvertTo-Json

    # ADMIN
    $adminLogin = Login "ADM-001" "ADM-001"
    $adminHeaders = @{ Authorization = "Bearer $($adminLogin.token)" }
    $me = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/auth/me" -Headers $adminHeaders
    Assert-True ($me.role -eq "ADMIN") "Admin /auth/me role mismatch."
    Write-Pass "Admin auth/me"

    $access = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/academic/timetable/generate-access?semesterNumber=4" -Headers $adminHeaders
    Assert-True (-not [string]::IsNullOrWhiteSpace($access.allowedDepartmentCode)) "Admin allowed department code missing."
    Write-Pass "Admin generator access scope"

    $adminGen = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/academic/timetable/generate" -Headers $adminHeaders -ContentType "application/json" -Body $payload
    Assert-True ($adminGen.success -eq $true) "Admin generate did not return success=true."
    Assert-True ($adminGen.validation.unscheduledPeriods -eq 0) "Admin generate has unscheduled periods."
    Write-Pass "Admin timetable generation (242/242 expected)"

    # FACULTY
    $facultyLogin = Login "FAC-001" "FAC-001"
    $facultyHeaders = @{ Authorization = "Bearer $($facultyLogin.token)" }
    $facultyGen = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/academic/timetable/generate" -Headers $facultyHeaders -ContentType "application/json" -Body $payload
    Assert-True ($facultyGen.success -eq $true) "Faculty generate did not return success=true."
    Assert-True ($facultyGen.validation.unscheduledPeriods -eq 0) "Faculty generate has unscheduled periods."
    Write-Pass "Faculty timetable generation (reflect source)"

    # HOD
    $hodLogin = Login "hod_cse@ritchennai.edu.in" "hodcse123"
    $hodHeaders = @{ Authorization = "Bearer $($hodLogin.token)" }
    $hodGen = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/academic/timetable/generate" -Headers $hodHeaders -ContentType "application/json" -Body $payload
    Assert-True ($hodGen.success -eq $true) "HOD generate did not return success=true."
    Assert-True ($hodGen.validation.unscheduledPeriods -eq 0) "HOD generate has unscheduled periods."
    Write-Pass "HOD timetable generation"

    # STUDENT reflection check
    $studentLogin = Login "student@ritchennai.edu.in" "student123"
    $studentHeaders = @{ Authorization = "Bearer $($studentLogin.token)" }
    $studentTable = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/academic/student/timetable" -Headers $studentHeaders
    Assert-True ($studentTable.Count -gt 0) "Student timetable is empty after generation."
    Write-Pass "Student timetable reflects generated slots"

    # PARENT basic auth
    $parentLogin = Login "parent@ritchennai.edu.in" "parent123"
    $parentHeaders = @{ Authorization = "Bearer $($parentLogin.token)" }
    $parentMe = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/auth/me" -Headers $parentHeaders
    Assert-True ($parentMe.role -eq "PARENT") "Parent /auth/me role mismatch."
    Write-Pass "Parent auth/me"

    # PDF export
    $pdfPath = Join-Path $PSScriptRoot "audit-smoke-export.pdf"
    Invoke-WebRequest -Method Post -Uri "$BaseUrl/api/academic/timetable/export-pdf" -Headers $adminHeaders -ContentType "application/json" -Body $payload -OutFile $pdfPath | Out-Null
    $pdfBytes = (Get-Item $pdfPath).Length
    Assert-True ($pdfBytes -gt 0) "PDF export file is empty."
    Write-Pass "PDF export generated ($pdfBytes bytes)"

    if (-not $KeepPdf) {
        Remove-Item $pdfPath -Force -ErrorAction SilentlyContinue
    }

    Write-Host ""
    Write-Host "Audit smoke completed successfully." -ForegroundColor Green
    Write-Host ("Summary: scheduled={0}, demand={1}, unscheduled={2}" -f $facultyGen.validation.scheduledPeriods, $facultyGen.validation.totalDemandPeriods, $facultyGen.validation.unscheduledPeriods)
    exit 0
}
catch {
    Write-Fail $_.Exception.Message
    Write-Host "Audit smoke failed." -ForegroundColor Red
    exit 1
}
