# Push Backend Image to Docker Hub

## Quick Start

### Option 1: Using the Script (Recommended)

1. **Make sure you're logged into Docker Hub:**
   ```powershell
   docker login
   ```
   Enter your Docker Hub username and password when prompted.

2. **Run the push script:**
   ```powershell
   .\push-to-dockerhub.ps1 -DockerHubUsername YOUR_DOCKERHUB_USERNAME
   ```
   
   Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username.

### Option 2: Manual Steps

1. **Login to Docker Hub:**
   ```powershell
   docker login
   ```

2. **Tag the image for Docker Hub:**
   ```powershell
   docker tag unisys-backend:latest YOUR_DOCKERHUB_USERNAME/unisys-backend:latest
   ```
   
   Replace `YOUR_DOCKERHUB_USERNAME` with your Docker Hub username.

3. **Push the image:**
   ```powershell
   docker push YOUR_DOCKERHUB_USERNAME/unisys-backend:latest
   ```

4. **Verify the push:**
   Visit: `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/unisys-backend`

## Example Commands

Assuming your Docker Hub username is `yourusername`:

```powershell
# Login
docker login

# Tag
docker tag unisys-backend:latest yourusername/unisys-backend:latest

# Push
docker push yourusername/unisys-backend:latest
```

## Multiple Tags

To push with multiple tags (e.g., `latest` and version number):

```powershell
# Tag with version
docker tag unisys-backend:latest yourusername/unisys-backend:v1.0.0
docker tag unisys-backend:latest yourusername/unisys-backend:latest

# Push all tags
docker push yourusername/unisys-backend:v1.0.0
docker push yourusername/unisys-backend:latest
```

## Pulling the Image Later

Once pushed, anyone can pull your image:

```powershell
docker pull yourusername/unisys-backend:latest
```

Or use it in docker-compose:

```yaml
services:
  backend:
    image: yourusername/unisys-backend:latest
    ports:
      - "5001:5001"
    environment:
      - SUPABASE_URL=...
      - JWT_SECRET=...
      # ... other env vars
```

## Troubleshooting

### "unauthorized: authentication required"
- Make sure you're logged in: `docker login`
- Verify your Docker Hub username is correct

### "denied: requested access to the resource is denied"
- Make sure the repository name matches your Docker Hub username
- Check that you have permission to push to that repository

### "name unknown" or repository doesn't exist
- Docker Hub will create the repository automatically on first push
- Make sure your username is spelled correctly





