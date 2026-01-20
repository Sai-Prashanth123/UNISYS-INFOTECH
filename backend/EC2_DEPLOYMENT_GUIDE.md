# EC2 Deployment Guide - UNISYS Backend

Complete step-by-step guide to deploy the Docker containerized backend on Amazon EC2.

---

## Part 1: Launch EC2 Instance - Form Values

### Name and tags
**Name:**
```
backend
```

### Application and OS Images (Amazon Machine Image)

**Quick Start:** `Amazon Linux`

**Amazon Machine Image (AMI):**
```
Amazon Linux 2023 kernel-6.1 AMI
```

**AMI ID:** `ami-07ff62358b87c7116` (64-bit (x86), uefi-preferred)

**Architecture:** `64-bit (x86)`

**Boot mode:** `uefi-preferred`

**Username:** `ec2-user`

### Instance type

**Instance type:**
```
t3.small
```
*Recommended for production (2 vCPU, 2 GiB Memory)*

**Alternative (lower cost):**
```
t3.micro
```
*Free tier eligible (2 vCPU, 1 GiB Memory) - May be slow for Node.js app*

**Note:** For better performance, consider `t3.medium` (2 vCPU, 4 GiB Memory)

### Key pair (login)

**Option 1: Create new key pair** (Recommended if you don't have one)
- Click **"Create new key pair"**
- Name: `backend-key-pair`
- Key pair type: `RSA`
- Private key file format: `.pem`
- Click **"Create key pair"**
- **IMPORTANT:** Save the downloaded `.pem` file securely - you won't be able to download it again!

**Option 2: Select existing key pair**
- Choose your existing key pair from the dropdown

**⚠️ DO NOT:** Select "Proceed without a key pair" - You won't be able to SSH into the instance!

### Network settings

**Network:**
```
vpc-0fb498609427d1d8d
```
*(Use your existing VPC or default)*

**Subnet:**
```
No preference (Default subnet in any availability zone)
```
*Or select a specific subnet*

**Auto-assign public IP:**
```
Enable
```
*Required to access the instance from internet*

### Firewall (security groups)

**Option: Create security group**

**Security group name:**
```
backend-sg
```

**Description:**
```
Security group for backend API server
```

**Inbound rules:**

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | My IP (or 0.0.0.0/0) | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
| Custom TCP | TCP | 5001 | 0.0.0.0/0 | Backend API (optional for testing) |

**⚠️ Security Note:** For production, restrict SSH (port 22) to your IP address only!

**Outbound rules:**
- Default (Allow all outbound traffic)

### Configure storage

**Volume 1:**
- **Size:** `20 GiB` (minimum recommended)
- **Volume type:** `gp3`
- **IOPS:** `3000` (default)
- **Encryption:** `Encrypted` (recommended for production)

**Note:** 20 GiB is recommended to have enough space for:
- Docker images (~500MB)
- Container logs
- Application files
- System updates

### Advanced details (Optional)

**User data:** (Paste this script to auto-configure on first boot)

```bash
#!/bin/bash
# Update system
yum update -y

# Install Docker
yum install -y docker

# Start Docker service
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group (to run docker without sudo)
usermod -a -G docker ec2-user

# Install Docker Compose (optional, for docker-compose.yml)
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /opt/backend
cd /opt/backend

# Note: Container will be started manually after instance launch
# Run these commands after SSH into the instance:
# docker pull prashanth1710/unisys-backend:latest
# docker run -d -p 80:80 --name backend --restart unless-stopped \
#   -e NODE_ENV=production \
#   -e PORT=80 \
#   -e SUPABASE_URL=YOUR_SUPABASE_URL \
#   -e SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY \
#   -e JWT_SECRET=YOUR_JWT_SECRET \
#   -e FRONTEND_URL=https://yourdomain.com \
#   prashanth1710/unisys-backend:latest

echo "Docker installed successfully!"
```

---

## Part 2: Launch and Connect to Instance

### Step 1: Launch Instance

1. Review all settings
2. Click **"Launch instance"**
3. Wait for instance to reach **"Running"** state (2-5 minutes)

### Step 2: Note Instance Details

After launch, note:
- **Public IP Address:** `xx.xx.xx.xx`
- **Instance ID:** `i-xxxxxxxxxxxxx`
- **Security Group:** `backend-sg`

### Step 3: Connect to Instance (SSH)

**On Windows (PowerShell):**

```powershell
# Navigate to directory with your .pem key file
cd C:\path\to\your\keys

# Set proper permissions (if needed)
icacls.exe backend-key-pair.pem /inheritance:r
icacls.exe backend-key-pair.pem /grant:r "%USERNAME%:R"

# Connect via SSH
ssh -i backend-key-pair.pem ec2-user@YOUR_PUBLIC_IP
```

**On Linux/Mac:**

```bash
# Set proper permissions
chmod 400 backend-key-pair.pem

# Connect via SSH
ssh -i backend-key-pair.pem ec2-user@YOUR_PUBLIC_IP
```

**First time connection:** Type `yes` when prompted about authenticity.

---

## Part 3: Install Docker and Setup

### Step 1: Update System

```bash
sudo yum update -y
```

### Step 2: Install Docker

```bash
# Install Docker
sudo yum install -y docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker is running
sudo systemctl status docker
```

### Step 3: Add User to Docker Group

```bash
# Add ec2-user to docker group (to run docker without sudo)
sudo usermod -a -G docker ec2-user

# Apply group changes (logout and login again, or use newgrp)
newgrp docker

# Verify docker works without sudo
docker --version
```

### Step 4: Install Docker Compose (Optional)

```bash
# Download latest Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

---

## Part 4: Deploy Backend Container

### Step 1: Pull Docker Image

```bash
# Pull the latest image from Docker Hub
docker pull prashanth1710/unisys-backend:latest

# Verify image is downloaded
docker images | grep unisys-backend
```

### Step 2: Create Environment Variables File

```bash
# Create directory for app
sudo mkdir -p /opt/backend
cd /opt/backend

# Create .env file (optional, or use -e flags in docker run)
sudo nano .env
```

**Add these environment variables to `.env` file:**

```env
NODE_ENV=production
PORT=80
SUPABASE_URL=https://kwqabttdbdslmjzbcppo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWFidHRkYmRzbG1qemJjcHBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAzMDE1OSwiZXhwIjoyMDgzNjA2MTU5fQ.O91R3bRiizQa_V93FCQ-oQMjlQ7zcLfGp5S-x0Vzq04
JWT_SECRET=sb_secret_Z9ph30NKUVr-ul-RSMz8kA_ZGQsrJc0
JWT_EXPIRE=24h
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=info
```

**⚠️ Important:** Replace values with your actual production secrets!

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Run Docker Container

**Option A: Using docker run command**

```bash
docker run -d \
  --name backend \
  --restart unless-stopped \
  -p 80:80 \
  -e NODE_ENV=production \
  -e PORT=80 \
  -e SUPABASE_URL=https://kwqabttdbdslmjzbcppo.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWFidHRkYmRzbG1qemJjcHBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAzMDE1OSwiZXhwIjoyMDgzNjA2MTU5fQ.O91R3bRiizQa_V93FCQ-oQMjlQ7zcLfGp5S-x0Vzq04 \
  -e JWT_SECRET=sb_secret_Z9ph30NKUVr-ul-RSMz8kA_ZGQsrJc0 \
  -e JWT_EXPIRE=24h \
  -e FRONTEND_URL=https://yourdomain.com \
  -e LOG_LEVEL=info \
  prashanth1710/unisys-backend:latest
```

**Option B: Using docker-compose.yml** (Recommended)

```bash
# Copy docker-compose.yml to EC2 (use scp or create it on the server)
sudo nano /opt/backend/docker-compose.yml
```

**Paste this content:**

```yaml
version: '3.8'

services:
  backend:
    image: prashanth1710/unisys-backend:latest
    container_name: backend
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - PORT=80
      - SUPABASE_URL=https://kwqabttdbdslmjzbcppo.supabase.co
      - SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWFidHRkYmRzbG1qemJjcHBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAzMDE1OSwiZXhwIjoyMDgzNjA2MTU5fQ.O91R3bRiizQa_V93FCQ-oQMjlQ7zcLfGp5S-x0Vzq04
      - JWT_SECRET=sb_secret_Z9ph30NKUVr-ul-RSMz8kA_ZGQsrJc0
      - JWT_EXPIRE=24h
      - FRONTEND_URL=https://yourdomain.com
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:80/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Save and run:**

```bash
# Start container
cd /opt/backend
docker-compose up -d

# Check container status
docker-compose ps
docker-compose logs -f
```

### Step 4: Verify Container is Running

```bash
# Check running containers
docker ps

# Check container logs
docker logs backend

# Check if port 80 is listening
sudo netstat -tlnp | grep 80
# or
sudo ss -tlnp | grep 80
```

### Step 5: Test the API

```bash
# Test health endpoint from inside EC2
curl http://localhost:80/api/health

# Test from your local machine (replace with your EC2 public IP)
curl http://YOUR_EC2_PUBLIC_IP/api/health
```

---

## Part 5: Configure Auto-Start on Reboot

### Option 1: Using Docker Restart Policy (Already configured)

The `--restart unless-stopped` flag in docker run already ensures the container restarts automatically.

### Option 2: Using Systemd Service (More Control)

Create a systemd service for better control:

```bash
sudo nano /etc/systemd/system/backend.service
```

**Add this content:**

```ini
[Unit]
Description=Backend API Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/backend
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

**Enable and start the service:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable backend.service

# Start service now
sudo systemctl start backend.service

# Check status
sudo systemctl status backend.service
```

---

## Part 6: Security Hardening (Production Recommendations)

### 1. Update Security Group

**Restrict SSH access:**
- Change SSH source from `0.0.0.0/0` to `Your.IP.Address/32`
- Only allow your IP to SSH into the instance

### 2. Use AWS Secrets Manager (Recommended for Production)

Instead of hardcoding secrets in environment variables:

```bash
# Install AWS CLI (if not already installed)
sudo yum install -y aws-cli

# Pull secrets from AWS Secrets Manager
# Update docker run command to use:
aws secretsmanager get-secret-value --secret-id unisys-backend/SUPABASE_URL --query SecretString --output text
```

### 3. Enable CloudWatch Logs

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent (follow AWS documentation)
```

### 4. Set Up Auto-Updates

```bash
# Enable automatic security updates
sudo yum install -y yum-cron
sudo systemctl enable yum-cron
sudo systemctl start yum-cron
```

---

## Part 7: Monitoring and Maintenance

### View Container Logs

```bash
# Real-time logs
docker logs -f backend

# Last 100 lines
docker logs --tail 100 backend

# Logs with timestamps
docker logs -t backend
```

### Update Container

```bash
# Pull latest image
docker pull prashanth1710/unisys-backend:latest

# Stop and remove old container
docker stop backend
docker rm backend

# Start new container (use same command as Step 3)
docker run -d --name backend --restart unless-stopped -p 80:80 ...
```

### Monitor Resources

```bash
# Check container resource usage
docker stats backend

# Check disk usage
df -h
docker system df

# Check memory
free -h
```

---

## Part 8: Troubleshooting

### Container Not Starting

```bash
# Check container logs
docker logs backend

# Check if port 80 is already in use
sudo lsof -i :80

# Check Docker daemon
sudo systemctl status docker
```

### Cannot Access API from Browser

1. **Check Security Group:** Ensure ports 80/443 are open to `0.0.0.0/0`
2. **Check EC2 Public IP:** Verify you're using the correct public IP
3. **Check Container:** `docker ps` should show container running
4. **Check Port Mapping:** `docker port backend` should show `80/tcp -> 0.0.0.0:80`

### Container Keeps Restarting

```bash
# Check exit code
docker ps -a

# Check logs for errors
docker logs backend

# Check health check
docker inspect backend | grep -A 10 Health
```

---

## Part 9: Quick Reference Commands

```bash
# Start container
docker start backend

# Stop container
docker stop backend

# Restart container
docker restart backend

# View logs
docker logs -f backend

# Access container shell
docker exec -it backend sh

# Remove container
docker stop backend && docker rm backend

# Pull latest image
docker pull prashanth1710/unisys-backend:latest

# Clean up unused images
docker image prune -a
```

---

## Part 10: Next Steps

1. **Set up Domain Name:** Point your domain to EC2 public IP using Route 53
2. **Set up SSL Certificate:** Use AWS Certificate Manager + Application Load Balancer
3. **Set up Auto Scaling:** Configure EC2 Auto Scaling for high availability
4. **Set up Backup:** Configure EBS snapshots for data persistence
5. **Set up Monitoring:** Enable CloudWatch alarms for container health

---

## Summary Checklist

- [x] EC2 instance launched with correct configuration
- [x] Security group configured with ports 80, 443, 22
- [x] SSH access working
- [x] Docker installed and running
- [x] Docker image pulled from Docker Hub
- [x] Container running with correct environment variables
- [x] Health endpoint accessible (`http://EC2_IP/api/health`)
- [x] Auto-restart configured
- [x] Logs accessible via `docker logs`

---

**Your backend should now be accessible at:** `http://YOUR_EC2_PUBLIC_IP/api/health`

**API Base URL:** `http://YOUR_EC2_PUBLIC_IP/api`




