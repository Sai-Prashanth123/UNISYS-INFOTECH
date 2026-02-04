# Push UNISYS INFOTECH Backend to Docker Hub
# Usage:
#   1. Log in: docker login
#   2. Set your Docker Hub image name (replace YOUR_DOCKERHUB_USERNAME with your actual username):
#      $env:DOCKER_IMAGE = "YOUR_DOCKERHUB_USERNAME/unisys-backend"
#   3. Run: .\push-to-dockerhub.ps1
# Or run with inline image name: $env:DOCKER_IMAGE = "myuser/unisys-backend"; .\push-to-dockerhub.ps1

$image = $env:DOCKER_IMAGE
if (-not $image) {
    $image = "prashanth1710/unisys-backend"
}

$tag = "latest"
$fullTag = "${image}:${tag}"

Write-Host "Building backend image: $fullTag" -ForegroundColor Cyan
Set-Location $PSScriptRoot
docker build -t $fullTag .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Pushing to Docker Hub: $fullTag" -ForegroundColor Cyan
docker push $fullTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed. Make sure you have run: docker login" -ForegroundColor Red
    exit 1
}

Write-Host "Done. Image pushed: $fullTag" -ForegroundColor Green
