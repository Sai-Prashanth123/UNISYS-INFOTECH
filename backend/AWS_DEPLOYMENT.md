# AWS Deployment Guide for UNISYS INFOTECH Backend

This guide covers deploying the containerized backend to AWS using various services.

## AWS Deployment Options

### 1. **AWS ECS (Elastic Container Service)** - Recommended for Production
- **Best for**: Production applications, scalable container orchestration
- **Pros**: Fully managed, auto-scaling, load balancing, easy CI/CD integration
- **Cost**: Pay for EC2 instances or Fargate (serverless)

### 2. **AWS App Runner** - Simplest Option
- **Best for**: Quick deployments, simple applications
- **Pros**: Fully managed, auto-scaling, automatic deployments
- **Cost**: Pay-per-use pricing

### 3. **AWS EC2** - Full Control
- **Best for**: Custom configurations, cost optimization
- **Pros**: Full control, can use Docker Compose
- **Cost**: Pay for EC2 instance

### 4. **AWS EKS (Elastic Kubernetes Service)** - Advanced
- **Best for**: Complex microservices, Kubernetes expertise required
- **Pros**: Kubernetes features, multi-cloud compatible
- **Cost**: Cluster management fee + EC2/Node costs

---

## Option 1: AWS ECS with Fargate (Recommended) ⭐

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- Docker Hub image: `prashanth1710/unisys-backend:latest`

### Step-by-Step Deployment

#### Step 1: Create ECR Repository (Optional - Alternative to Docker Hub)

```bash
# Login to AWS
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name unisys-backend --region us-east-1

# Tag and push (if using ECR instead of Docker Hub)
docker tag prashanth1710/unisys-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/unisys-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/unisys-backend:latest
```

#### Step 2: Create Task Definition

Create file: `ecs-task-definition.json`

```json
{
  "family": "unisys-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "unisys-backend",
      "image": "prashanth1710/unisys-backend:latest",
      "portMappings": [
        {
          "containerPort": 5001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5001"
        }
      ],
      "secrets": [
        {
          "name": "SUPABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:unisys-backend/SUPABASE_URL"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:unisys-backend/JWT_SECRET"
        },
        {
          "name": "SUPABASE_SERVICE_ROLE_KEY",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:unisys-backend/SUPABASE_SERVICE_ROLE_KEY"
        },
        {
          "name": "FRONTEND_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:unisys-backend/FRONTEND_URL"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/unisys-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\""
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### Step 3: Create Secrets in AWS Secrets Manager

```bash
# Create secrets (replace values with your actual values)
aws secretsmanager create-secret \
  --name unisys-backend/SUPABASE_URL \
  --secret-string "https://kwqabttdbdslmjzbcppo.supabase.co" \
  --region us-east-1

aws secretsmanager create-secret \
  --name unisys-backend/JWT_SECRET \
  --secret-string "sb_secret_Z9ph30NKUVr-ul-RSMz8kA_ZGQsrJc0" \
  --region us-east-1

aws secretsmanager create-secret \
  --name unisys-backend/SUPABASE_SERVICE_ROLE_KEY \
  --secret-string "YOUR_SERVICE_ROLE_KEY" \
  --region us-east-1

aws secretsmanager create-secret \
  --name unisys-backend/FRONTEND_URL \
  --secret-string "https://yourdomain.com" \
  --region us-east-1
```

#### Step 4: Create CloudWatch Log Group

```bash
aws logs create-log-group --log-group-name /ecs/unisys-backend --region us-east-1
```

#### Step 5: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name unisys-backend-cluster --region us-east-1
```

#### Step 6: Register Task Definition

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region us-east-1
```

#### Step 7: Create Application Load Balancer (ALB)

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name unisys-backend-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --region us-east-1

# Create target group
aws elbv2 create-target-group \
  --name unisys-backend-targets \
  --protocol HTTP \
  --port 5001 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /api/health \
  --region us-east-1

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

#### Step 8: Create ECS Service

```bash
aws ecs create-service \
  --cluster unisys-backend-cluster \
  --service-name unisys-backend-service \
  --task-definition unisys-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=unisys-backend,containerPort=5001" \
  --region us-east-1
```

---

## Option 2: AWS App Runner (Simplest) 🚀

### Step 1: Create App Runner Service via AWS Console

1. Go to AWS App Runner console
2. Click "Create service"
3. Source: Choose "Container registry" → "Docker Hub"
4. Image URI: `prashanth1710/unisys-backend:latest`
5. Service name: `unisys-backend`

### Step 2: Configure Environment Variables

In the App Runner console, add environment variables:
- `NODE_ENV=production`
- `PORT=5001`
- `SUPABASE_URL=...` (or use secrets)
- `JWT_SECRET=...` (use secrets)
- `SUPABASE_SERVICE_ROLE_KEY=...` (use secrets)
- `FRONTEND_URL=...`

### Step 3: Configure Auto-Scaling

- Min instances: 1
- Max instances: 10
- Concurrent requests per instance: 100

### Step 4: Deploy

Click "Create & deploy" - App Runner handles everything automatically!

---

## Option 3: AWS EC2 with Docker (Cost-Effective)

### Step 1: Launch EC2 Instance

```bash
# Launch t3.medium or larger instance
# AMI: Amazon Linux 2023 or Ubuntu 22.04
# Security Group: Allow port 5001 and 80/443
# User data script (install Docker):
```

User Data Script:
```bash
#!/bin/bash
yum update -y
yum install docker -y
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Step 2: Create docker-compose.yml on EC2

```yaml
version: '3.8'
services:
  backend:
    image: prashanth1710/unisys-backend:latest
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
      - SUPABASE_URL=${SUPABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: always
```

### Step 3: Run on EC2

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Create .env file
nano .env
# Add your environment variables

# Run with docker-compose
docker-compose up -d
```

### Step 4: Set up Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Option 4: AWS ECS via AWS Console (GUI Method)

### Step 1: Create Cluster
1. Go to ECS Console → Clusters
2. Click "Create Cluster"
3. Choose "Networking only" → "Fargate"
4. Name: `unisys-backend-cluster`
5. Create

### Step 2: Create Task Definition
1. Go to Task Definitions → Create new
2. Family: `unisys-backend`
3. Launch type: Fargate
4. Task size: 0.5 vCPU, 1 GB memory
5. Container: 
   - Name: `unisys-backend`
   - Image: `prashanth1710/unisys-backend:latest`
   - Port: `5001`
   - Add environment variables or use Secrets Manager
6. Create

### Step 3: Create Service
1. Go to Cluster → Services → Create
2. Launch type: Fargate
3. Task definition: `unisys-backend:latest`
4. Service name: `unisys-backend-service`
5. Desired tasks: 2
6. Configure VPC, subnets, security groups
7. Create Application Load Balancer (optional)
8. Create

---

## Security Best Practices

### 1. Use AWS Secrets Manager
Never hardcode secrets. Use Secrets Manager or Parameter Store.

### 2. Security Groups
- Only allow necessary ports (80, 443, 5001)
- Restrict source IPs when possible

### 3. IAM Roles
- Use IAM roles instead of access keys
- Grant minimum required permissions

### 4. VPC Configuration
- Deploy in private subnets
- Use NAT Gateway for internet access
- Use ALB in public subnets

### 5. Enable CloudWatch Logs
- Monitor application logs
- Set up alarms for errors

---

## Cost Estimates (Monthly)

### ECS Fargate
- Task: 0.5 vCPU, 1GB RAM, 2 tasks = ~$30/month
- ALB: ~$20/month
- Data transfer: Variable

### App Runner
- ~$0.007 per vCPU-hour
- ~$0.0008 per GB-hour
- Estimated: $30-50/month for small traffic

### EC2
- t3.medium: ~$30/month
- Data transfer: Variable

---

## Monitoring & Logging

### CloudWatch Integration

1. **Logs**: Already configured in task definition
2. **Metrics**: CPU, Memory, Request count
3. **Alarms**: Set up for high CPU, errors, etc.

### Example Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name unisys-backend-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to ECS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update ECS service
        run: |
          aws ecs update-service --cluster unisys-backend-cluster \
            --service unisys-backend-service --force-new-deployment
```

---

## Quick Start Commands

### ECS Quick Deploy Script

Create `deploy-ecs.sh`:

```bash
#!/bin/bash
# Update task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Force new deployment
aws ecs update-service \
  --cluster unisys-backend-cluster \
  --service unisys-backend-service \
  --force-new-deployment
```

---

## Troubleshooting

### Check Task Logs
```bash
aws logs tail /ecs/unisys-backend --follow
```

### Check Service Status
```bash
aws ecs describe-services --cluster unisys-backend-cluster --services unisys-backend-service
```

### View Task Details
```bash
aws ecs describe-tasks --cluster unisys-backend-cluster --tasks TASK_ID
```

---

## Recommended Approach

**For Production**: **AWS ECS with Fargate** + Application Load Balancer
- Fully managed
- Auto-scaling
- High availability
- Production-ready

**For Quick Start**: **AWS App Runner**
- Simplest deployment
- Auto-scaling built-in
- Good for small to medium traffic

**For Cost Optimization**: **AWS EC2** + Docker
- Full control
- Lower cost for consistent traffic
- Requires more management

Choose based on your needs, traffic volume, and maintenance preferences.

