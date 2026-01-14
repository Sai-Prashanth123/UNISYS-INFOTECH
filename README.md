# UNISYS INFOTECH - Enterprise Management System

A full-stack enterprise management application with employee time tracking, client management, job postings, and administrative features.

## 🚀 Features

### User Management
- Role-based access control (Admin, Employer, Employee)
- Secure authentication with JWT
- Password reset via email (Supabase Auth integration)
- User activation/deactivation

### Time Tracking
- Employee timecard management
- Weekly/monthly reports
- Client-based time logging
- Manager approval workflow

### Client Management
- Client profiles with logos
- Active/inactive status tracking
- Client assignment to projects

### Job Portal
- Job posting management
- Application tracking
- Status management (new, reviewed, interviewed, etc.)

### Admin Dashboard
- System-wide statistics
- User management
- Report generation
- Contact message management

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Email**: Resend API
- **Logging**: Winston
- **Security**: Helmet, express-rate-limit, XSS protection

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Lucide React, Recharts

## 📦 Project Structure

```
UNISYS-INFOTECH/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Utility scripts
│   │   ├── utils/           # Helper functions
│   │   ├── app.js           # Express app setup
│   │   └── index.js         # Server entry point
│   ├── logs/                # Application logs
│   ├── package.json
│   └── ENV_VARIABLES.md     # Environment setup guide
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── PRODUCTION_DEPLOYMENT.md # Production deployment guide
├── SECURITY.md              # Security documentation
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account
- Resend account (for emails)

### 1. Clone Repository

```bash
git clone <repository-url>
cd UNISYS-INFOTECH
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (see `ENV_VARIABLES.md`):
```env
NODE_ENV=development
PORT=5001
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=your-resend-api-key
```

Generate strong JWT secret:
```bash
openssl rand -base64 32
```

Start development server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5001/api
```

Start development server:
```bash
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

### 5. Create Admin User

```bash
cd backend
node src/scripts/createAdmin.js
```

## 🔒 Security Features

- ✅ JWT-based authentication with secure token generation
- ✅ Rate limiting on all endpoints (100 req/15min general, 5 req/15min auth)
- ✅ Password reset rate limiting (3 req/hour)
- ✅ Helmet security headers (XSS, clickjacking, etc.)
- ✅ CORS protection with strict origin validation
- ✅ NoSQL injection protection
- ✅ XSS attack prevention
- ✅ HTTPS enforcement in production
- ✅ Input validation and sanitization
- ✅ Secure password hashing (bcrypt)
- ✅ Environment variable validation
- ✅ Structured logging with sensitive data redaction
- ✅ Graceful shutdown handling

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## 📚 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/login           # User login
POST /api/auth/logout          # User logout
GET  /api/auth/me              # Get current user
POST /api/auth/forgot-password # Request password reset
POST /api/auth/reset-password  # Reset password with token
```

### Admin Endpoints (Require admin role)

```bash
GET    /api/admin/users              # Get all users
POST   /api/admin/users/create       # Create new user
PUT    /api/admin/users/:id          # Update user
DELETE /api/admin/users/:id          # Delete user
GET    /api/admin/dashboard-stats    # Dashboard statistics
```

### Timecard Endpoints

```bash
POST   /api/timecards              # Submit/update hours
GET    /api/timecards/my-entries   # Get own entries
DELETE /api/timecards/:id          # Delete own entry
GET    /api/timecards/employer/entries  # Employer: get employee entries
```

### Client Endpoints

```bash
GET    /api/clients           # Get all clients
POST   /api/clients           # Create client
PUT    /api/clients/:id       # Update client
DELETE /api/clients/:id       # Delete client
```

### Job Endpoints

```bash
GET    /api/jobs              # Get all job postings
POST   /api/jobs              # Create job posting
PUT    /api/jobs/:id          # Update job posting
POST   /api/jobs/:id/apply    # Apply to job
```

See source code for complete API reference.

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📊 Monitoring & Logs

### Application Logs

Logs are stored in `backend/logs/`:
- `error-YYYY-MM-DD.log` - Error logs only
- `combined-YYYY-MM-DD.log` - All logs
- Logs rotate daily
- 14-day retention

### View Logs

```bash
# Tail combined logs
tail -f backend/logs/combined-*.log

# Tail error logs only
tail -f backend/logs/error-*.log

# With PM2 in production
pm2 logs unisys-backend
```

### Health Check

```bash
# Basic health check
curl http://localhost:5001/api/health

# Detailed health check (includes database status)
curl http://localhost:5001/api/health?detailed=true
```

## 🚀 Production Deployment

See detailed deployment guide: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

### Quick Checklist

1. ✅ Set all required environment variables
2. ✅ Generate strong JWT_SECRET (32+ characters)
3. ✅ Configure production Supabase database
4. ✅ Set up email service (Resend or SMTP)
5. ✅ Build frontend: `npm run build`
6. ✅ Configure HTTPS/SSL certificates
7. ✅ Set up process manager (PM2)
8. ✅ Configure reverse proxy (Nginx)
9. ✅ Set up monitoring and logging
10. ✅ Run security audit: `npm audit`

### Production Environment Variables

```env
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-key
JWT_SECRET=<generate-with-openssl-rand>
FRONTEND_URL=https://yourdomain.com
RESEND_API_KEY=your-production-key
```

## 🔧 Development

### Code Style

- ESLint for linting
- Prettier for formatting (recommended)
- Follow Airbnb JavaScript style guide

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

### Commit Convention

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/config changes

## 📝 Common Tasks

### Reset User Password

```bash
cd backend
node src/scripts/resetAdminPassword.js
```

### Sync Users to Supabase Auth

```bash
# Via API (requires admin token)
POST /api/admin/users/sync-all-auth

# Or individual user
POST /api/admin/users/:id/sync-auth
```

### Check Admin User

```bash
cd backend
node src/scripts/checkAdmin.js
```

### Seed Test Data

```bash
cd backend
node src/scripts/seedData.js
```

## 🐛 Troubleshooting

### Backend won't start

1. Check environment variables are set
2. Verify Supabase credentials
3. Check logs: `tail -f backend/logs/error-*.log`

### CORS errors in frontend

1. Verify `FRONTEND_URL` in backend `.env`
2. Check browser console for specific error
3. Ensure URLs match exactly (including protocol)

### Database connection errors

1. Verify Supabase URL and keys
2. Check Supabase dashboard for outages
3. Test connection: `node backend/src/scripts/checkAdmin.js`

### Email not sending

1. Verify Resend API key
2. Check Resend dashboard for delivery status
3. Test: `node backend/src/scripts/testPasswordReset.js`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Write/update tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

UNISYS INFOTECH Development Team

## 📞 Support

For issues or questions:
- Create GitHub issue
- Check documentation in `/docs`
- Review troubleshooting section above

---

**Built with ❤️ by UNISYS INFOTECH**
