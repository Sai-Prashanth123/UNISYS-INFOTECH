# Script to build and push Docker image to Docker Hub

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername,
    
    [string]$ImageName = "unisys-backend",
    [string]$Tag = "latest"
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Docker Hub Push Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Validate Docker Hub username
if ([string]::IsNullOrWhiteSpace($DockerHubUsername)) {
    Write-Host "Error: Docker Hub username is required" -ForegroundColor Red
    Write-Host "Usage: .\push-to-dockerhub.ps1 -DockerHubUsername yourusername" -ForegroundColor Yellow
    exit 1
}

$dockerHubRepo = "${DockerHubUsername}/${ImageName}"
$fullImageTag = "${dockerHubRepo}:${Tag}"

Write-Host "Docker Hub Repository: $dockerHubRepo" -ForegroundColor Cyan
Write-Host "Image Tag: $Tag" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if logged into Docker Hub
Write-Host "[1/4] Checking Docker Hub login status..." -ForegroundColor Yellow
$loginStatus = docker info 2>&1 | Select-String "Username"
if (-not $loginStatus) {
    Write-Host "       Not logged in. Please login to Docker Hub..." -ForegroundColor Yellow
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
docker build -t $ImageName:$Tag .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "       Image built successfully" -ForegroundColor Green

# Step 3: Tag the image for Docker Hub
Write-Host "`n[3/4] Tagging image for Docker Hub..." -ForegroundColor Yellow
docker tag "${ImageName}:${Tag}" $fullImageTag
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to tag image" -ForegroundColor Red
    exit 1
}
Write-Host "       Image tagged as: $fullImageTag" -ForegroundColor Green

# Step 4: Push to Docker Hub
Write-Host "`n[4/4] Pushing image to Docker Hub..." -ForegroundColor Yellow
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






