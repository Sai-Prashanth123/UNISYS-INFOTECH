# Docker Hub Push Commands

## Quick Push to Docker Hub

Run these commands in PowerShell from the `backend` directory:

### 1. Navigate to backend directory
```powershell
cd d:\unisysinfotech\unisysinfotech\backend
```

### 2. Login to Docker Hub (if not already logged in)
```powershell
docker login
```
Enter your Docker Hub username (`prashanth1710`) and password when prompted.

### 3. Build the Docker image
```powershell
docker build -t prashanth1710/unisys-backend:latest .
```
This will take a few minutes as it downloads dependencies and builds the image.

### 4. Push to Docker Hub
```powershell
docker push prashanth1710/unisys-backend:latest
```

### 5. Verify the push
Visit: https://hub.docker.com/r/prashanth1710/unisys-backend

## Using the Script

Alternatively, use the automated script:

```powershell
cd d:\unisysinfotech\unisysinfotech\backend
.\push-to-dockerhub-now.ps1
```

## What's Included in This Build

- All backend code changes
- Client assignment feature (client_id column support)
- Performance optimizations (indexes)
- RLS security policies
- All API routes and middleware

## Image Details

- **Repository**: `prashanth1710/unisys-backend`
- **Tag**: `latest`
- **Full Image Name**: `prashanth1710/unisys-backend:latest`
- **Port**: 80 (configurable via PORT env variable)
- **Node Version**: 20-alpine

## After Pushing

You can pull and run the image anywhere:

```powershell
docker pull prashanth1710/unisys-backend:latest
docker run -p 5001:80 -e SUPABASE_URL=your_url -e JWT_SECRET=your_secret prashanth1710/unisys-backend:latest
```
