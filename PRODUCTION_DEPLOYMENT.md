# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables

#### Backend (.env)
Create a `.env` file in the `backend` directory with the following **required** variables:

```env
# REQUIRED
NODE_ENV=production
SUPABASE_URL=<your-production-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-production-service-role-key>
JWT_SECRET=<generate-strong-secret-min-32-chars>
FRONTEND_URL=https://yourdomain.com

# Email Configuration
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=noreply@yourdomain.com
COMPANY_NAME=Unisys InfoTech

# Optional but Recommended
PORT=5001
JWT_EXPIRE=7d
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting (defaults are fine for most cases)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

**Generate Strong JWT_SECRET:**
```bash
openssl rand -base64 32
```

#### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=<your-production-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_NODE_ENV=production
```

### 2. Security Checklist

- [ ] **JWT_SECRET** is at least 32 characters and randomly generated
- [ ] **FRONTEND_URL** uses HTTPS and matches your production domain
- [ ] **SUPABASE_SERVICE_ROLE_KEY** is kept secret and never exposed to frontend
- [ ] All `.env` files are in `.gitignore` (already done)
- [ ] No hardcoded credentials in source code
- [ ] CORS is configured to only allow your production frontend URL
- [ ] Rate limiting is enabled and configured appropriately
- [ ] HTTPS is enforced (handled by middleware)
- [ ] Security headers are enabled (helmet middleware)

### 3. Database Setup (Supabase)

1. **Create Production Project** in Supabase Dashboard
2. **Configure Email Templates** for password reset:
   - Go to Authentication → Email Templates
   - Customize "Reset Password" template
3. **Set Redirect URLs**:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/**`
4. **Enable Row Level Security (RLS)** if needed
5. **Run Database Migrations** (if any)
6. **Create Admin User**:
   ```bash
   cd backend
   node src/scripts/createAdmin.js
   ```

### 4. Email Service Setup

#### Option 1: Resend (Recommended)
1. Sign up at https://resend.com
2. Verify your domain
3. Get API key and set in `RESEND_API_KEY`
4. Set `FROM_EMAIL` to your verified domain email

#### Option 2: Custom SMTP
Configure SMTP settings in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 5. Build Frontend

```bash
cd frontend
npm install
npm run build
```

The production build will be in `frontend/dist` directory.

---

## 🌐 Deployment Options

### Option A: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2 for process management
npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone <your-repo-url> /var/www/unisys-infotech
cd /var/www/unisys-infotech/backend

# Install dependencies
npm install --production

# Create .env file with production values
nano .env

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start src/index.js --name unisys-backend
pm2 save
pm2 startup
```

#### 3. Deploy Frontend

```bash
# Copy built files to nginx directory
sudo cp -r /var/www/unisys-infotech/frontend/dist/* /var/www/html/
```

#### 4. Configure Nginx

Create `/etc/nginx/sites-available/unisys`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
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

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/unisys /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### Option B: Docker Deployment

#### 1. Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5001

CMD ["node", "src/index.js"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

#### 2. Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    env_file:
      - ./backend/.env
    restart: unless-stopped
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### 3. Deploy

```bash
docker-compose up -d
```

### Option C: Platform as a Service (Heroku, Railway, Render)

#### Heroku Example:

```bash
# Install Heroku CLI
# Create Heroku apps
heroku create unisys-backend
heroku create unisys-frontend

# Set environment variables
heroku config:set NODE_ENV=production --app unisys-backend
heroku config:set JWT_SECRET=<your-secret> --app unisys-backend
# ... set all other env vars

# Deploy backend
cd backend
git push heroku main

# Deploy frontend
cd ../frontend
git push heroku main
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use different credentials for dev/staging/production
- Rotate secrets regularly (JWT_SECRET, API keys)

### 2. HTTPS
- Always use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers (done via helmet)

### 3. Rate Limiting
- Monitor rate limit violations in logs
- Adjust limits based on your traffic patterns
- Consider IP whitelisting for trusted clients

### 4. Monitoring
- Set up error tracking (Sentry, Rollbar)
- Monitor server resources (CPU, memory, disk)
- Set up uptime monitoring
- Review logs regularly

### 5. Backups
- Enable automatic Supabase backups
- Backup environment variables securely
- Document recovery procedures

### 6. Updates
- Keep dependencies updated
- Run `npm audit` regularly
- Subscribe to security advisories

---

## 📊 Monitoring & Logging

### Application Logs

Logs are stored in `backend/logs/`:
- `error-YYYY-MM-DD.log` - Error logs
- `combined-YYYY-MM-DD.log` - All logs

### View Logs with PM2

```bash
pm2 logs unisys-backend
pm2 logs unisys-backend --lines 100
pm2 logs unisys-backend --err
```

### Health Check Endpoint

Monitor application health:
```bash
curl https://api.yourdomain.com/api/health
curl https://api.yourdomain.com/api/health?detailed=true
```

### Recommended Monitoring Tools

- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry, Rollbar
- **Performance**: New Relic, Datadog
- **Logs**: Logtail, Papertrail

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install backend dependencies
      working-directory: ./backend
      run: npm install
    
    - name: Run backend tests
      working-directory: ./backend
      run: npm test
    
    - name: Build frontend
      working-directory: ./frontend
      run: |
        npm install
        npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/unisys-infotech
          git pull
          cd backend && npm install --production
          pm2 restart unisys-backend
          cd ../frontend && npm run build
          sudo cp -r dist/* /var/www/html/
```

---

## 🐛 Troubleshooting

### Backend Won't Start

1. Check environment variables:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env)"
   ```

2. Check logs:
   ```bash
   pm2 logs unisys-backend --err
   tail -f backend/logs/error-*.log
   ```

3. Test database connection:
   ```bash
   cd backend
   node src/scripts/checkAdmin.js
   ```

### CORS Errors

- Verify `FRONTEND_URL` matches exactly (including https://)
- Check browser console for specific error
- Verify Nginx proxy headers are set correctly

### Rate Limiting Issues

- Check client IP is correct: `curl https://api.yourdomain.com/api/health`
- Adjust rate limits in `.env`
- Whitelist specific IPs if needed

### Email Not Sending

1. Test email configuration:
   ```bash
   cd backend
   node src/scripts/testPasswordReset.js
   ```

2. Check Resend dashboard for delivery status
3. Verify email DNS records (SPF, DKIM)

---

## 📝 Maintenance

### Update Application

```bash
# Backup first
cd /var/www/unisys-infotech
git stash  # Save any local changes
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart unisys-backend

# Update frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

### Database Migrations

```bash
cd backend
node src/scripts/migrate.js  # If you have migrations
```

### Rotate JWT Secret

1. Generate new secret: `openssl rand -base64 32`
2. Update `.env` file
3. Restart backend: `pm2 restart unisys-backend`
4. Note: This will invalidate all existing tokens (users need to re-login)

---

## 🎯 Performance Optimization

### Backend
- Enable compression: `npm install compression`
- Add Redis caching for frequently accessed data
- Optimize database queries
- Use CDN for static assets

### Frontend
- Enable Vite build optimizations (already done)
- Use lazy loading for routes
- Optimize images
- Enable gzip/brotli compression in Nginx

### Database
- Add indexes to frequently queried fields
- Enable connection pooling
- Monitor slow queries

---

## 📞 Support

For issues or questions:
1. Check logs first
2. Review this documentation
3. Check Supabase dashboard for database issues
4. Review error tracking service (if configured)

---

## ✅ Post-Deployment Verification

After deployment, verify:

- [ ] Frontend loads correctly at `https://yourdomain.com`
- [ ] API health check responds: `https://api.yourdomain.com/api/health`
- [ ] Login works for all user roles
- [ ] Password reset emails are sent
- [ ] HTTPS is enforced (http:// redirects to https://)
- [ ] Rate limiting is working (test by making many requests)
- [ ] Error tracking is receiving events
- [ ] Logs are being written
- [ ] Database connections are stable
- [ ] All environment variables are set correctly

---

## 🔐 Security Audit Checklist

Before going live:

- [ ] All secrets are in environment variables
- [ ] `.env` files are in `.gitignore`
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Security headers are set (helmet)
- [ ] Input validation is working
- [ ] XSS protection is enabled
- [ ] SQL injection protection (using parameterized queries)
- [ ] Authentication is working correctly
- [ ] Authorization checks are in place
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain sensitive data
- [ ] Dependencies are up to date (`npm audit`)

---

**Production deployment is complete when all checkboxes above are marked! 🎉**
