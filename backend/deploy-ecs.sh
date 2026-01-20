#!/bin/bash
# AWS ECS Deployment Script for UNISYS Backend

set -e

# Configuration
CLUSTER_NAME="unisys-backend-cluster"
SERVICE_NAME="unisys-backend-service"
TASK_DEFINITION="ecs-task-definition.json"
REGION="us-east-1"

echo "=========================================="
echo "  AWS ECS Deployment Script"
echo "=========================================="
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed"
    exit 1
fi

# Check if task definition file exists
if [ ! -f "$TASK_DEFINITION" ]; then
    echo "Error: Task definition file not found: $TASK_DEFINITION"
    exit 1
fi

echo "[1/3] Registering task definition..."
aws ecs register-task-definition \
    --cli-input-json file://$TASK_DEFINITION \
    --region $REGION

if [ $? -ne 0 ]; then
    echo "Error: Failed to register task definition"
    exit 1
fi

echo "✓ Task definition registered successfully"
echo ""

# Check if service exists
SERVICE_EXISTS=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $REGION \
    --query 'services[0].status' \
    --output text 2>/dev/null)

if [ "$SERVICE_EXISTS" = "ACTIVE" ]; then
    echo "[2/3] Updating existing service..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $REGION
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to update service"
        exit 1
    fi
    
    echo "✓ Service update initiated"
else
    echo "[2/3] Service does not exist yet."
    echo "Please create the service manually via AWS Console or CLI first."
    echo ""
    echo "To create the service, run:"
    echo "aws ecs create-service \\"
    echo "  --cluster $CLUSTER_NAME \\"
    echo "  --service-name $SERVICE_NAME \\"
    echo "  --task-definition unisys-backend \\"
    echo "  --desired-count 2 \\"
    echo "  --launch-type FARGATE \\"
    echo "  --network-configuration \"awsvpcConfiguration={subnets=[SUBNET_ID],securityGroups=[SG_ID],assignPublicIp=ENABLED}\" \\"
    echo "  --region $REGION"
    exit 1
fi

echo ""
echo "[3/3] Waiting for deployment to stabilize..."
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $REGION

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  Deployment Successful!"
    echo "=========================================="
    echo ""
    echo "Service: $SERVICE_NAME"
    echo "Cluster: $CLUSTER_NAME"
    echo "Region: $REGION"
    echo ""
    echo "View service: https://console.aws.amazon.com/ecs/v2/clusters/$CLUSTER_NAME/services/$SERVICE_NAME"
else
    echo "Warning: Deployment may still be in progress"
fi





