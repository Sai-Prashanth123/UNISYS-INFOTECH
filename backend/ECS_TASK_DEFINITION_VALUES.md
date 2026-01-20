# ECS Task Definition - Complete Configuration Values

This document contains all the values you need to fill in when creating an ECS task definition through the AWS Console.

## Task Definition Configuration

### Task Definition Family
```
backend
```

### Launch Type
```
AWS Fargate
```

### Operating System/Architecture
```
Linux/X86_64
```

### Network Mode
```
awsvpc
```

### Task Size

**CPU:**
```
1 vCPU
```
*Note: You can also use 0.5 vCPU (512) for lower cost, but 1 vCPU is recommended for production*

**Memory:**
```
3 GB
```
*Note: You can use 2 GB (2048) for lower cost, but 3 GB provides better performance*

### Task Roles

**Task Role:**
```
ecsTaskExecutionRole
```
*Or create a custom role with necessary permissions*

**Task Execution Role:**
```
ecsTaskExecutionRole
```
*This role is used by ECS agent to pull images and write logs*

---

## Container Configuration

### Container Details

**Name:**
```
backend
```

**Essential Container:**
```
Yes ✓
```

**Image URI:**
```
prashanth1710/unisys-backend:latest
```

**Private Registry Authentication:**
```
No (since using Docker Hub public image)
```

### Port Mappings

**Container Port:**
```
80
```

**Protocol:**
```
TCP
```

**Port Name:**
```
backend-port
```
*(Optional - will be auto-generated if left blank)*

**App Protocol:**
```
HTTP
```

**Read only root file system:**
```
No (unchecked)
```

---

## Environment Variables

Add these environment variables individually:

### Plain Text Environment Variables:

1. **Name:** `NODE_ENV`
   **Value:** `production`

2. **Name:** `PORT`
   **Value:** `80`

3. **Name:** `LOG_LEVEL`
   **Value:** `info`

4. **Name:** `JWT_EXPIRE`
   **Value:** `24h`

5. **Name:** `FRONTEND_URL`
   **Value:** `https://yourdomain.com`
   *⚠️ Replace `yourdomain.com` with your actual frontend domain*

### Secrets from AWS Secrets Manager:

**Note:** Store these as secrets in AWS Secrets Manager first, then reference them:

1. **Name:** `SUPABASE_URL`
   **Value From:** `arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:unisys-backend/SUPABASE_URL`
   *Replace `REGION` and `ACCOUNT_ID` with your AWS values*

2. **Name:** `JWT_SECRET`
   **Value From:** `arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:unisys-backend/JWT_SECRET`

3. **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   **Value From:** `arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:unisys-backend/SUPABASE_SERVICE_ROLE_KEY`

---

## Logging Configuration

### Log Collection
```
Use log collection ✓
```

### Logging Destination
```
Amazon CloudWatch
```

### Log Configuration Options:

| Key | Value Type | Value |
|-----|------------|-------|
| `awslogs-group` | Value | `/ecs/backend` |
| `awslogs-region` | Value | `us-east-1` |
| `awslogs-stream-prefix` | Value | `ecs` |
| `awslogs-create-group` | Value | `true` |

*⚠️ Change `us-east-1` to your preferred AWS region*

---

## Health Check (Optional but Recommended)

### Enable Health Check:
```
Yes ✓
```

**Command:**
```
CMD-SHELL,node -e "require('http').get('http://localhost:80/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

**Interval (seconds):**
```
30
```

**Timeout (seconds):**
```
5
```

**Retries:**
```
3
```

**Start Period (seconds):**
```
60
```

---

## Storage Configuration

### Ephemeral Storage

**Amount:**
```
20 GiB (default)
```
*Or increase if needed (21-200 GiB)*

### Volumes
```
None (unless you need persistent storage)
```

---

## Summary Checklist

- [x] Task Definition Family: `backend`
- [x] Launch Type: `AWS Fargate`
- [x] OS/Architecture: `Linux/X86_64`
- [x] Network Mode: `awsvpc`
- [x] CPU: `1 vCPU`
- [x] Memory: `3 GB`
- [x] Task Execution Role: `ecsTaskExecutionRole`
- [x] Container Name: `backend`
- [x] Image URI: `prashanth1710/unisys-backend:latest`
- [x] Container Port: `80`
- [x] Protocol: `TCP`
- [x] App Protocol: `HTTP`
- [x] Environment Variables: Set all required
- [x] Secrets: Configure from Secrets Manager
- [x] Logging: CloudWatch with `/ecs/backend` group
- [x] Health Check: Configured for port 80

---

## Important Notes

1. **Port 80:** Make sure container port is **80** (not 5001) to match Elastic Beanstalk requirements.

2. **Secrets Manager:** You must create the secrets in AWS Secrets Manager before referencing them. The ARN format is:
   ```
   arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:secret-name-XXXXXX
   ```

3. **Frontend URL:** Update `FRONTEND_URL` with your actual production frontend URL.

4. **Region:** Change `us-east-1` to your preferred AWS region throughout the configuration.

5. **IAM Roles:** Ensure `ecsTaskExecutionRole` has permissions to:
   - Pull images from Docker Hub (or ECR)
   - Write logs to CloudWatch
   - Access Secrets Manager (if using secrets)

---

## Quick Reference - All Values in One Place

```
Task Family: backend
Launch Type: AWS Fargate
OS/Arch: Linux/X86_64
Network: awsvpc
CPU: 1 vCPU (1024)
Memory: 3 GB (3072)
Task Role: ecsTaskExecutionRole
Execution Role: ecsTaskExecutionRole

Container:
  Name: backend
  Image: prashanth1710/unisys-backend:latest
  Port: 80 (TCP, HTTP)
  Essential: Yes

Environment:
  NODE_ENV=production
  PORT=80
  LOG_LEVEL=info
  JWT_EXPIRE=24h
  FRONTEND_URL=https://yourdomain.com

Secrets (from Secrets Manager):
  SUPABASE_URL
  JWT_SECRET
  SUPABASE_SERVICE_ROLE_KEY

Logging: CloudWatch (/ecs/backend)
Health Check: http://localhost:80/api/health
```

