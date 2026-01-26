# AWS ECS Deployment Script for UNISYS Backend (PowerShell)

param(
    [string]$ClusterName = "unisys-backend-cluster",
    [string]$ServiceName = "unisys-backend-service",
    [string]$TaskDefinitionFile = "ecs-task-definition.json",
    [string]$Region = "us-east-1"
)

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  AWS ECS Deployment Script" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "Error: AWS CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if task definition file exists
if (-not (Test-Path $TaskDefinitionFile)) {
    Write-Host "Error: Task definition file not found: $TaskDefinitionFile" -ForegroundColor Red
    exit 1
}

Write-Host "[1/3] Registering task definition..." -ForegroundColor Yellow
aws ecs register-task-definition --cli-input-json "file://$TaskDefinitionFile" --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to register task definition" -ForegroundColor Red
    exit 1
}

Write-Host "Task definition registered successfully" -ForegroundColor Green
Write-Host ""

# Check if service exists
Write-Host "[2/3] Checking service status..." -ForegroundColor Yellow
$serviceStatus = aws ecs describe-services --cluster $ClusterName --services $ServiceName --region $Region --query 'services[0].status' --output text 2>$null

if ($serviceStatus -eq "ACTIVE") {
    Write-Host "Updating existing service..." -ForegroundColor Yellow
    aws ecs update-service --cluster $ClusterName --service $ServiceName --force-new-deployment --region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to update service" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Service update initiated" -ForegroundColor Green
    Write-Host ""
    Write-Host "[3/3] Deployment in progress..." -ForegroundColor Yellow
    Write-Host "Monitor deployment at: https://console.aws.amazon.com/ecs/v2/clusters/$ClusterName/services/$ServiceName" -ForegroundColor Cyan
} else {
    Write-Host "Service does not exist yet." -ForegroundColor Yellow
    Write-Host "Please create the service manually via AWS Console first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Service Name: $ServiceName" -ForegroundColor Cyan
    Write-Host "Cluster Name: $ClusterName" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Deployment script completed!" -ForegroundColor Green






