# Docker Build Script for UNISYS INFOTECH Backend (PowerShell)

Write-Host "Building Docker image for UNISYS INFOTECH Backend..." -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Build the image
docker build -t unisys-backend:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Docker image built successfully!" -ForegroundColor Green
    Write-Host "`nTo run the container, use one of the following:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d" -ForegroundColor Cyan
    Write-Host "  OR" -ForegroundColor Cyan
    Write-Host "  docker run -d -p 5001:80 -e SUPABASE_URL=... -e JWT_SECRET=... unisys-backend:latest" -ForegroundColor Cyan
    Write-Host "`nSee DOCKER_README.md for more information." -ForegroundColor Yellow
} else {
    Write-Host "`n✗ Docker build failed. Check the errors above." -ForegroundColor Red
    exit 1
}


