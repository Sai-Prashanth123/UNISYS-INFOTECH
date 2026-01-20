# ECS Express Mode - All Configuration Values

## Additional Configurations - Complete Values

### Cluster
```
Select: Create new cluster (or leave default)
```
- If you don't have a cluster, AWS will create one named "default" automatically

### Name
```
unisys-backend
```

### Container
**Container port:**
```
5001
```

**Health check path:**
```
/api/health
```

### Environment Variables

Add these one by one:

| Key | Value type | Value or value from |
|-----|------------|---------------------|
| `NODE_ENV` | Environment variable | `production` |
| `PORT` | Environment variable | `5001` |
| `SUPABASE_URL` | Environment variable | `https://kwqabttdbdslmjzbcppo.supabase.co` |
| `JWT_SECRET` | Environment variable | `sb_secret_Z9ph30NKUVr-ul-RSMz8kA_ZGQsrJc0` |
| `SUPABASE_SERVICE_ROLE_KEY` | Environment variable | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWFidHRkYmRzbG1qemJjcHBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAzMDE1OSwiZXhwIjoyMDgzNjA2MTU5fQ.O91R3bRiizQa_V93FCQ-oQMjlQ7zcLfGp5S-x0Vzq04` |
| `JWT_EXPIRE` | Environment variable | `24h` |
| `FRONTEND_URL` | Environment variable | `https://yourdomain.com` *(Change this to your actual frontend URL)* |
| `LOG_LEVEL` | Environment variable | `info` |

### Command
```
Leave empty or remove the example command
```
- The Dockerfile already has `CMD ["node", "src/index.js"]` which will be used automatically

### Task role
```
ecsTaskRole
```
- Or select "Create new role" if it doesn't exist (AWS will create it automatically if needed)

### Compute
**CPU:**
```
0.5 vCPU
```
- Or `1 vCPU` if you expect higher traffic

**Memory:**
```
1 GB
```
- Or `2 GB` if you need more memory
- Minimum memory for 0.5 vCPU is 1 GB

### Auto scaling

**ECS service metric:**
```
Average CPU utilization
```

**Target value:**
```
70
```
- This means auto-scaling will trigger when CPU usage averages 70%

**Minimum number of tasks:**
```
1
```
- Always keep at least 1 container running

**Maximum number of tasks:**
```
5
```
- Scale up to 5 containers when traffic increases
- Adjust based on your needs (can be higher like 10 or 20)

### Networking

**Customize networking configurations:**
```
☐ Leave unchecked (use defaults)
```
- AWS will automatically create VPC, subnets, and security groups
- Or check it if you want to use existing VPC/subnets/security groups

### Logs

**CloudWatch log group:**
```
/ecs/unisys-backend
```
- AWS may auto-generate this, but you can specify it

**CloudWatch log stream prefix:**
```
ecs
```
- Or leave empty for auto-generated prefix

### Tags

Optional - Add tags for better organization:

| Key | Value |
|-----|-------|
| `Project` | `unisys-backend` |
| `Environment` | `production` |
| `Owner` | `your-email` |

---

## Quick Copy-Paste Summary

### Required Fields:
- **Name**: `unisys-backend`
- **Container port**: `5001`
- **Health check path**: `/api/health`
- **CPU**: `0.5 vCPU`
- **Memory**: `1 GB`
- **Minimum tasks**: `1`
- **Maximum tasks**: `5`

### Environment Variables (Add all 8):
1. `NODE_ENV` = `production`
2. `PORT` = `5001`
3. `SUPABASE_URL` = `https://kwqabttdbdslmjzbcppo.supabase.co`
4. `JWT_SECRET` = `sb_secret_Z9ph30NKUVr-ul-RSMz8kA_ZGQsrJc0`
5. `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWFidHRkYmRzbG1qemJjcHBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAzMDE1OSwiZXhwIjoyMDgzNjA2MTU5fQ.O91R3bRiizQa_V93FCQ-oQMjlQ7zcLfGp5S-x0Vzq04`
6. `JWT_EXPIRE` = `24h`
7. `FRONTEND_URL` = `https://yourdomain.com` ⚠️ **Change this!**
8. `LOG_LEVEL` = `info`

---

## Important Notes

⚠️ **Security**: For production, consider using AWS Secrets Manager for sensitive values:
- `JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **FRONTEND_URL**: Must match your actual production frontend URL (e.g., `https://www.yourdomain.com`)

⚠️ **Region**: Make sure you're deploying in the correct AWS region (currently: Asia Pacific Mumbai)

---

## Recommended Settings for Production

- **CPU**: 1 vCPU (for better performance)
- **Memory**: 2 GB (for Node.js applications)
- **Auto-scaling**: Min 2 tasks, Max 10 tasks (for high availability)
- **Target CPU**: 70% (good balance)

---

## After Configuration

1. Review all settings
2. Click "Create" button
3. Wait 3-5 minutes for deployment
4. Find your service URL in the ECS console
5. Test: `https://YOUR-SERVICE-URL/api/health`





