# Backend API Endpoints Test Script
# Tests all available endpoints in the backend

$baseUrl = "http://localhost:5001/api"
$results = @()

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [string]$Description
    )
    
    Write-Host "`n[TEST] $Description" -ForegroundColor Cyan
    Write-Host "       $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            UseBasicParsing = $true
            ErrorAction = "SilentlyContinue"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "       SUCCESS ($statusCode)" -ForegroundColor Green
            $result = @{
                Endpoint = $Endpoint
                Method = $Method
                Status = "SUCCESS"
                StatusCode = $statusCode
                Description = $Description
            }
        } else {
            Write-Host "       FAILED ($statusCode)" -ForegroundColor Red
            $result = @{
                Endpoint = $Endpoint
                Method = $Method
                Status = "FAILED"
                StatusCode = $statusCode
                Description = $Description
            }
        }
    }
    catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
        }
        
        if ($statusCode -eq 0) {
            Write-Host "       ERROR (Connection failed)" -ForegroundColor Red
            $result = @{
                Endpoint = $Endpoint
                Method = $Method
                Status = "ERROR"
                StatusCode = 0
                Description = $Description
            }
        }
        else {
            $expectedStatuses = @(401, 403, 404, 422, 400)
            if ($expectedStatuses -contains $statusCode) {
                Write-Host "       EXPECTED ($statusCode - Requires auth/valid input)" -ForegroundColor Yellow
                $result = @{
                    Endpoint = $Endpoint
                    Method = $Method
                    Status = "EXPECTED"
                    StatusCode = $statusCode
                    Description = $Description
                }
            } else {
                Write-Host "       ERROR ($statusCode)" -ForegroundColor Red
                $result = @{
                    Endpoint = $Endpoint
                    Method = $Method
                    Status = "ERROR"
                    StatusCode = $statusCode
                    Description = $Description
                }
            }
        }
    }
    
    $script:results += $result
    return $result
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Backend API Endpoints Test Suite" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "Starting tests...`n" -ForegroundColor Gray

# 1. Health Check (Public)
Test-Endpoint -Method "GET" -Endpoint "/health" -Description "Health Check"

# 2. Auth Routes (Public)
Test-Endpoint -Method "POST" -Endpoint "/auth/register" `
    -Body @{ name = "Test"; email = "test@test.com"; password = "test123" } `
    -Description "Register (should be disabled - 403)"

Test-Endpoint -Method "POST" -Endpoint "/auth/login" `
    -Body @{ email = "invalid@test.com"; password = "wrong" } `
    -Description "Login with invalid credentials (should return 404/401)"

# 3. Jobs (Public)
Test-Endpoint -Method "GET" -Endpoint "/jobs" -Description "Get all active jobs"
Test-Endpoint -Method "GET" -Endpoint "/jobs/invalid-id" -Description "Get job by invalid ID"

# 4. Client Logos (Public)
Test-Endpoint -Method "GET" -Endpoint "/client-logos" -Description "Get all client logos"

# 5. Contact Messages (Public)
Test-Endpoint -Method "POST" -Endpoint "/contact-messages" `
    -Body @{
        name = "Test User"
        email = "test@example.com"
        message = "Test message"
    } `
    -Description "Submit contact message"

# 6. Contacts (Protected - Admin only)
Test-Endpoint -Method "GET" -Endpoint "/contacts" -Description "Get all contacts (requires admin auth)"

# 7. Timecards (Protected)
Test-Endpoint -Method "GET" -Endpoint "/timecards" -Description "Get timecards (requires auth)"
Test-Endpoint -Method "POST" -Endpoint "/timecards" `
    -Body @{ date = "2024-01-01"; hoursWorked = 8; clientId = "test" } `
    -Description "Create timecard (requires auth)"

# 8. Clients (Protected)
Test-Endpoint -Method "GET" -Endpoint "/clients" -Description "Get all clients (requires auth)"

# 9. Hours (Protected)
Test-Endpoint -Method "GET" -Endpoint "/hours" -Description "Get hours logs (requires auth)"

# 10. Reports (Protected - Admin/Employer)
Test-Endpoint -Method "GET" -Endpoint "/reports/summary" -Description "Get reports summary (requires auth)"

# 11. Invoices (Protected)
Test-Endpoint -Method "GET" -Endpoint "/invoices" -Description "Get invoices (requires auth)"

# 12. Password Change (Protected)
Test-Endpoint -Method "POST" -Endpoint "/password-change/request" `
    -Body @{ email = "test@example.com" } `
    -Description "Request password change (may be public)"

# 13. Admin Routes (Protected - Admin only)
Test-Endpoint -Method "GET" -Endpoint "/admin/users" -Description "Get all users (requires admin auth)"

# Print Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Test Summary" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$success = ($results | Where-Object { $_.Status -eq "SUCCESS" }).Count
$expected = ($results | Where-Object { $_.Status -eq "EXPECTED" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAILED" -or $_.Status -eq "ERROR" }).Count
$total = $results.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Expected (Auth Required): $expected" -ForegroundColor Yellow
Write-Host "Failed: $failed" -ForegroundColor Red

Write-Host "`nDetailed Results:" -ForegroundColor Cyan
$results | ForEach-Object {
    $color = if ($_.Status -eq "SUCCESS") { "Green" }
             elseif ($_.Status -eq "EXPECTED") { "Yellow" }
             else { "Red" }
    Write-Host "  [$($_.StatusCode)] $($_.Method) $($_.Endpoint) - $($_.Status)" -ForegroundColor $color
}

Write-Host "`nTest suite completed!" -ForegroundColor Green
