# HTTPS Setup Guide for Production Backend

Complete guide to set up HTTPS/SSL for your EC2 backend so you can use it in your frontend with a secure URL.

---

## Overview: Three Options to Get HTTPS

### Option 1: Application Load Balancer (ALB) + ACM Certificate (Recommended) ⭐
- **Best for:** Production environments, custom domains
- **Cost:** ~$16/month for ALB + data transfer
- **Pros:** Native AWS integration, easy SSL termination
- **SSL:** Free via AWS Certificate Manager (ACM)

### Option 2: CloudFront + ACM Certificate (Cost-Effective)
- **Best for:** Global distribution, CDN benefits
- **Cost:** ~$1/month + data transfer
- **Pros:** Global CDN, DDoS protection, lower cost
- **SSL:** Free via AWS Certificate Manager (ACM)

### Option 3: Nginx Reverse Proxy on EC2 (Free but Manual)
- **Best for:** Learning, single instance
- **Cost:** Free (just domain cost)
- **Pros:** Full control, no AWS costs
- **SSL:** Free via Let's Encrypt

---

## Option 1: Application Load Balancer + ACM (Recommended) ⭐

### Prerequisites

1. **Domain Name** (e.g., `api.yourdomain.com`)
   - You can use Route 53 to register a new domain
   - Or use an existing domain and point it to AWS

2. **EC2 Instance Running** ✅ (You already have this)

### Step-by-Step Setup

#### Step 1: Get a Domain Name

**Option A: Register New Domain in Route 53**

1. Go to **Route 53** → **Registered domains** → **Register domain**
2. Search for available domains (e.g., `yourdomain.com`)
3. Complete registration (~$12-15/year)

**Option B: Use Existing Domain**

1. Go to your domain registrar
2. Create an A record pointing to your EC2 IP: `34.234.90.29`
   - Or wait until ALB is created (see Step 3)

**Recommended Domain Setup:**
- `api.yourdomain.com` - for backend API
- Or `backend.yourdomain.com`
- Or subdomain like `api-prod.yourdomain.com`

---

#### Step 2: Request SSL Certificate from AWS Certificate Manager (ACM)

1. **Go to AWS Certificate Manager (ACM)**
   - Search for "Certificate Manager" in AWS Console
   - Make sure you're in **US East (N. Virginia)** or your region

2. **Request a certificate**
   - Click **"Request certificate"**
   - Choose **"Request a public certificate"**

3. **Domain names**
   - Add your domain: `api.yourdomain.com`
   - Add wildcard (optional): `*.yourdomain.com`
   - Click **"Next"**

4. **Validation method**
   - Choose **"DNS validation"** (recommended)
   - Click **"Request"**

5. **Validate the certificate**
   - Click on the certificate you just created
   - Click **"Create record in Route 53"** (if domain is in Route 53)
   - Or manually add the CNAME record to your DNS provider
   - Wait for status to change to **"Issued"** (5-30 minutes)

---

#### Step 3: Create Target Group

1. **Go to EC2 Console** → **Target Groups** → **Create target group**

2. **Choose target type:**
   - **Instances**

3. **Target group details:**
   - **Name:** `backend-target-group`
   - **Protocol:** `HTTP`
   - **Port:** `80`
   - **VPC:** Select your VPC (`vpc-0fb498609427d1d8d`)

4. **Health checks:**
   - **Health check path:** `/api/health`
   - **Advanced health check settings:**
     - **Healthy threshold:** `2`
     - **Unhealthy threshold:** `2`
     - **Timeout:** `5`
     - **Interval:** `30`

5. **Register targets:**
   - Select your instance: `i-039bec26c5d887b3d (backend)`
   - Click **"Include as pending below"**
   - Click **"Create target group"**

---

#### Step 4: Create Application Load Balancer (ALB)

1. **Go to EC2 Console** → **Load Balancers** → **Create load balancer**

2. **Choose load balancer type:**
   - **Application Load Balancer** → **Create**

3. **Basic configuration:**
   - **Name:** `backend-alb`
   - **Scheme:** `Internet-facing`
   - **IP address type:** `IPv4`

4. **Network mapping:**
   - **VPC:** Select your VPC
   - **Availability Zones:** Select at least 2 AZs (check both subnets)
   - **Mappings:** Enable all subnets in selected AZs

5. **Security groups:**
   - **Create new security group** or select existing
   - **Name:** `backend-alb-sg`
   - **Rules:**
     - **HTTP (80)** - Source: `0.0.0.0/0`
     - **HTTPS (443)** - Source: `0.0.0.0/0`
     - **Outbound:** Allow all (for health checks)

6. **Listeners and routing:**
   - **HTTP (80):** 
     - Default action: **Redirect to HTTPS**
   - **HTTPS (443):**
     - Default action: **Forward to** `backend-target-group`
     - **SSL Certificate:** Select the certificate you created in Step 2
     - **Security policy:** `ELBSecurityPolicy-TLS-1-2-2017-01` (recommended)

7. **Create load balancer**
   - Click **"Create load balancer"**
   - Wait for status to become **"Active"** (2-5 minutes)

---

#### Step 5: Update Domain DNS

1. **Get ALB DNS name**
   - Go to **Load Balancers** → Select `backend-alb`
   - Copy the **DNS name:** `backend-alb-xxxxxxxxx.us-east-1.elb.amazonaws.com`

2. **Update Route 53 (if using Route 53):**
   - Go to **Route 53** → **Hosted zones** → Select your domain
   - **Create record:**
     - **Record name:** `api` (for `api.yourdomain.com`)
     - **Record type:** `A`
     - **Alias:** `Yes`
     - **Route traffic to:** `Alias to Application and Classic Load Balancer`
     - **Region:** `US East (N. Virginia)` or your region
     - **Load balancer:** Select `backend-alb`
     - **Routing policy:** `Simple routing`
     - Click **"Create records"**

3. **Update External DNS (if not using Route 53):**
   - Go to your domain registrar
   - Create/Update **A record** or **CNAME record:**
     - **Type:** `CNAME`
     - **Name:** `api` (or `backend`)
     - **Value:** `backend-alb-xxxxxxxxx.us-east-1.elb.amazonaws.com`
     - **TTL:** `300` (5 minutes)

4. **Wait for DNS propagation** (5-60 minutes)

---

#### Step 6: Update EC2 Security Group

Your EC2 security group needs to allow traffic from the ALB:

1. **Go to EC2** → **Security Groups** → Select `backend-sg`

2. **Inbound rules:**
   - **Add rule:**
     - **Type:** `HTTP`
     - **Port:** `80`
     - **Source:** `backend-alb-sg` (the ALB security group)
   - **Or** allow from `10.0.0.0/8` (VPC CIDR range)

3. **You can now remove:**
   - Direct public access to port 80 (restrict to ALB only)

---

#### Step 7: Verify HTTPS is Working

1. **Test in browser:**
   ```
   https://api.yourdomain.com/api/health
   ```

2. **Test with curl:**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

3. **Check SSL certificate:**
   - Browser should show green lock 🔒
   - Certificate should be valid and issued by Amazon

---

## Option 2: CloudFront + ACM (Cost-Effective Alternative)

### Step 1: Request SSL Certificate (Same as Option 1, Step 2)

Request certificate in **US East (N. Virginia)** region (required for CloudFront).

### Step 2: Create CloudFront Distribution

1. **Go to CloudFront** → **Create distribution**

2. **Origin settings:**
   - **Origin domain:** `34.234.90.29` (your EC2 IP)
   - **Origin path:** Leave blank
   - **Origin protocol policy:** `HTTP Only`
   - **HTTP port:** `80`
   - **HTTPS port:** `443`

3. **Default cache behavior:**
   - **Viewer protocol policy:** `Redirect HTTP to HTTPS`
   - **Allowed HTTP methods:** `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - **Cache policy:** `CachingDisabled` (for API) or `CachingOptimized` (for static)

4. **Distribution settings:**
   - **Price class:** `Use all edge locations` or `Use only North America`
   - **Alternate domain names (CNAMEs):** `api.yourdomain.com`
   - **SSL certificate:** Select the ACM certificate from **US East (N. Virginia)**
   - **Default root object:** Leave blank

5. **Create distribution**
   - Wait for status to become **"Deployed"** (15-20 minutes)

### Step 3: Update DNS

1. **Get CloudFront domain:**
   - Copy **Distribution domain name:** `dxxxxxxxxxxxxx.cloudfront.net`

2. **Update Route 53 or DNS provider:**
   - **Type:** `CNAME` or `A (Alias)`
   - **Name:** `api`
   - **Value:** `dxxxxxxxxxxxxx.cloudfront.net`

---

## Option 3: Nginx Reverse Proxy + Let's Encrypt (Free, Manual)

### Step 1: Install Nginx on EC2

```bash
# SSH into your EC2 instance
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 2: Install Certbot (Let's Encrypt)

```bash
sudo yum install -y certbot python3-certbot-nginx
```

### Step 3: Configure Nginx

```bash
sudo nano /etc/nginx/conf.d/backend.conf
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 4: Get SSL Certificate

```bash
# Make sure DNS points to your EC2 IP first
sudo certbot --nginx -d api.yourdomain.com

# Follow prompts:
# - Email address
# - Agree to terms
# - Redirect HTTP to HTTPS: Yes
```

### Step 5: Verify

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Test HTTPS
curl https://api.yourdomain.com/api/health
```

---

## Summary & Recommendations

### ✅ Recommended: Option 1 (ALB + ACM)

**Your Production Backend URL will be:**
```
https://api.yourdomain.com
```

**API Endpoints:**
- Health: `https://api.yourdomain.com/api/health`
- Base: `https://api.yourdomain.com/api`

### Cost Comparison

| Option | Monthly Cost | Setup Time | Best For |
|--------|-------------|------------|----------|
| ALB + ACM | ~$16 | 30 min | Production |
| CloudFront | ~$1-5 | 30 min | Cost-effective |
| Nginx + Let's Encrypt | Free | 15 min | Single instance |

---

## Quick Start Checklist

- [ ] Register/buy domain name
- [ ] Request ACM certificate for `api.yourdomain.com`
- [ ] Validate certificate (DNS validation)
- [ ] Create Target Group (port 80)
- [ ] Register EC2 instance to Target Group
- [ ] Create Application Load Balancer
- [ ] Configure HTTPS listener with certificate
- [ ] Update DNS to point to ALB
- [ ] Update EC2 security group (allow ALB traffic)
- [ ] Test: `https://api.yourdomain.com/api/health`

---

## After Setup: Update Frontend

Once HTTPS is working, update your frontend:

**Environment Variable:**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
# or
VITE_API_URL=https://api.yourdomain.com/api
```

**Usage:**
```javascript
const API_URL = 'https://api.yourdomain.com/api';

// Example fetch
fetch(`${API_URL}/health`)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Troubleshooting

### Certificate not issuing?
- Check DNS records are propagated
- Verify CNAME record is correct in Route 53/DNS provider

### 502 Bad Gateway?
- Check EC2 security group allows ALB traffic
- Verify target group health checks pass
- Check Docker container is running: `docker ps`

### DNS not resolving?
- Wait 30-60 minutes for DNS propagation
- Check DNS records are correct
- Verify domain points to ALB/CloudFront

---

**Need help? Let me know which option you want to use and I'll guide you through it step-by-step!**




