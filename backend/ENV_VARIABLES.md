# Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# JWT Configuration
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRE=7d

# Email Service (Resend)
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
COMPANY_NAME=Unisys InfoTech

# Optional: Custom SMTP (if not using Resend)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Security
BCRYPT_ROUNDS=10
PASSWORD_RESET_TOKEN_EXPIRY=3600000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## Required Variables

The following variables are **required** for the application to run:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

## Production Configuration

For production, ensure:
1. `NODE_ENV=production`
2. Strong `JWT_SECRET` (32+ characters)
3. Valid `FRONTEND_URL` with HTTPS
4. Production Supabase credentials
5. Valid email service configuration
