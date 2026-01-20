# Docker Setup for UNISYS INFOTECH Backend

This guide explains how to containerize and run the backend application using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher, optional but recommended)

## Required Environment Variables

The backend requires the following environment variables to function:

- `SUPABASE_URL` - Your Supabase project URL (REQUIRED)
- `JWT_SECRET` - Secret key for JWT token signing (REQUIRED, at least 32 characters)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (REQUIRED for production)

Optional variables (have defaults):
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment mode (default: production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `LOG_LEVEL` - Logging level (default: info)

## Building the Docker Image

### Option 1: Using Docker directly

```bash
cd backend
docker build -t unisys-backend .
```

### Option 2: Using Docker Compose (recommended)

```bash
cd backend
docker-compose build
```

## Running the Container

### Option 1: Using Docker Compose (recommended and easiest)

The `docker-compose.yml` is pre-configured with default environment values from your `.env` file. It will automatically read from `.env` if it exists, or use the embedded defaults.

Simply run:

```bash
docker-compose up -d
```

To view logs:
```bash
docker-compose logs -f
```

To stop:
```bash
docker-compose down
```

**Note**: The docker-compose.yml contains default values from your `.env` file. If you have a `.env` file in the backend directory, Docker Compose will automatically use those values (they take precedence over defaults).

### Option 2: Using Docker directly with environment variables

If you prefer to use Docker directly, you can pass environment variables:

```bash
docker run -d \
  --name unisys-backend \
  -p 5001:5001 \
  -e SUPABASE_URL=your-supabase-url \
  -e JWT_SECRET=your-jwt-secret \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  -e FRONTEND_URL=http://localhost:5173 \
  unisys-backend
```

Or use the `.env` file with Docker:

```bash
docker run -d \
  --name unisys-backend \
  -p 5001:5001 \
  --env-file .env \
  unisys-backend
```

3. View logs:

```bash
docker-compose logs -f
```

4. Stop the container:

```bash
docker-compose down
```

## Container Features

- **Multi-stage build**: Optimized image size
- **Non-root user**: Runs as non-root for security
- **Health checks**: Automatic health monitoring
- **Graceful shutdown**: Proper signal handling with dumb-init
- **Log persistence**: Logs directory mounted as volume
- **Production-ready**: Optimized for production deployments

## Health Check

The container includes a health check endpoint at `/api/health`. You can test it:

```bash
curl http://localhost:5001/api/health
```

## Troubleshooting

### Container exits immediately

Check the logs to see what went wrong:

```bash
docker logs unisys-backend
```

Common issues:
- Missing required environment variables
- Invalid Supabase credentials
- Port already in use (change the port mapping)

### Database connection issues

Ensure:
- `SUPABASE_URL` is correct
- `SUPABASE_SERVICE_ROLE_KEY` is valid
- Supabase project is accessible

### Permission issues

The container runs as non-root user (nodejs:1001). If you need to access logs:

```bash
sudo chown -R $USER:$USER logs/
```

## Production Deployment

For production deployment:

1. Use a secrets management system (AWS Secrets Manager, HashiCorp Vault, etc.)
2. Set `NODE_ENV=production`
3. Use proper `FRONTEND_URL` (not localhost)
4. Enable HTTPS (use a reverse proxy like Nginx or Traefik)
5. Set up log aggregation
6. Configure monitoring and alerting

## Environment Variables in Production

Never commit `.env` files to version control. Use:

- Docker secrets
- Environment variables in your container orchestration platform
- Secrets management services
- Environment variable files mounted securely

## Building and Pushing to Registry

```bash
# Build
docker build -t unisys-backend:latest .

# Tag for registry
docker tag unisys-backend:latest your-registry/unisys-backend:latest

# Push
docker push your-registry/unisys-backend:latest
```

