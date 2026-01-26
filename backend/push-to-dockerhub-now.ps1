# Quick script to build and push to Docker Hub
# Repository: prashanth1710/unisys-backend:latest

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Building and Pushing to Docker Hub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$dockerHubRepo = "prashanth1710/unisys-backend"
$tag = "latest"
$fullImageTag = "${dockerHubRepo}:${tag}"

# Step 1: Check Docker login
Write-Host "[1/4] Checking Docker Hub login..." -ForegroundColor Yellow
$loginCheck = docker info 2>&1 | Select-String "Username"
if (-not $loginCheck) {
    Write-Host "       Please login to Docker Hub..." -ForegroundColor Yellow
    docker login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Docker Hub login failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "       Already logged in" -ForegroundColor Green
}

# Step 2: Build the image
Write-Host "`n[2/4] Building Docker image..." -ForegroundColor Yellow
Write-Host "       This may take a few minutes..." -ForegroundColor Cyan
docker build -t $fullImageTag .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "       Image built successfully!" -ForegroundColor Green

# Step 3: Verify image exists
Write-Host "`n[3/4] Verifying image..." -ForegroundColor Yellow
docker images $fullImageTag
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Image not found" -ForegroundColor Red
    exit 1
}
Write-Host "       Image verified!" -ForegroundColor Green

# Step 4: Push to Docker Hub
Write-Host "`n[4/4] Pushing image to Docker Hub..." -ForegroundColor Yellow
Write-Host "       Repository: $fullImageTag" -ForegroundColor Cyan
docker push $fullImageTag
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push image to Docker Hub" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Success!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Image pushed successfully to Docker Hub!" -ForegroundColor Green
Write-Host ""
Write-Host "Image URL: https://hub.docker.com/r/$dockerHubRepo" -ForegroundColor Cyan
Write-Host ""
Write-Host "To pull the image:" -ForegroundColor Yellow
Write-Host "  docker pull $fullImageTag" -ForegroundColor White
Write-Host ""
