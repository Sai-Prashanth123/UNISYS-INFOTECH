# ECS Express Mode Setup - Step by Step

## Environment Variables to Add

Add these in the "Environment variables" section:

### Required Variables:

```
NODE_ENV = production
PORT = 5001
SUPABASE_URL = https://kwqabttdbdslmjzbcppo.supabase.co
JWT_SECRET = sb_secret_Z9ph30NKUVr-ul-RSMz8kA_ZGQsrJc0
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWFidHRkYmRzbG1qemJjcHBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAzMDE1OSwiZXhwIjoyMDgzNjA2MTU5fQ.O91R3bRiizQa_V93FCQ-oQMjlQ7zcLfGp5S-x0Vzq04
JWT_EXPIRE = 24h
FRONTEND_URL = https://yourdomain.com
```

### Optional Variables (with defaults):

```
LOG_LEVEL = info
```

## Quick Reference - What to Enter

### Image URI:
```
prashanth1710/unisys-backend:latest
```

### Container Port:
```
5001
```

### Service Name:
```
unisys-backend
```

### Minimum Tasks:
```
1
```

### Maximum Tasks (for auto-scaling):
```
5
```

## After Creation

Once the service is created, AWS will:
1. Create the ECS cluster automatically
2. Set up networking (VPC, subnets, security groups)
3. Create a load balancer (if enabled)
4. Deploy your container
5. Provide a public URL

## Important Notes

⚠️ **Security**: For production, consider using AWS Secrets Manager instead of plain environment variables for sensitive values like `JWT_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`.

⚠️ **FRONTEND_URL**: Update this to your actual production frontend URL (e.g., `https://yourdomain.com` or `https://www.yourdomain.com`)

## Troubleshooting

If the service fails to start:
1. Check CloudWatch logs: `/ecs/express-unisys-backend` or `/aws/ecs/express`
2. Verify environment variables are correct
3. Check security group allows traffic on port 5001
4. Verify the Docker image is accessible: `docker pull prashanth1710/unisys-backend:latest`


