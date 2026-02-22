# UNISYS INFOTECH — Complete Platform Overview

## 📌 What Is It?

**UNISYS INFOTECH** is a full-stack web platform built for **Unisys InfoTech**, an IT consulting and staffing company. It serves as the company's **public website + internal business management portal** — all in one unified application.

**Live URL:** [https://www.unisysinfotech.com](https://www.unisysinfotech.com)

The platform replaces the need for multiple disconnected tools (spreadsheets, emails, paper timesheets, separate HR software) by consolidating everything into a single, modern, role-based web application.

---

## 🎯 Who Is It For?

The platform serves **four types of users**, each with their own portal:

| Role | Who They Are | What They Do |
|------|-------------|--------------|
| **Public Visitors** | Potential clients, job seekers, anyone | Browse services, apply for jobs, send contact inquiries |
| **Admin** | Unisys management / back-office | Manage clients, users, invoices, payroll, timecards, SOW documents, job postings, reports |
| **Employee** | Consultants / staff placed at client sites | Log daily working hours via calendar-based timecards, track hours history |
| **Employer** | Client-side managers or supervisors | View employee timecards, weekly/monthly summaries, monitor team hours |

---

## 🏗️ What Does The Platform Do?

### 1. Public Company Website

A professional, modern marketing website that showcases Unisys InfoTech's services:

- **Home Page** — Hero carousel, client logos, service highlights, company stats
- **About Page** — Company story, mission, team info
- **Services Pages** (9 dedicated pages):
  - Software Development
  - Professional IT Services / IT Outsourcing
  - Database Administration (DBA)
  - Quality Assurance (QA)
  - Business Intelligence (BI)
  - Data Science & AI/ML
  - CRM Solutions
  - Cloud Services (AWS, Azure, GCP)
  - DevOps & CI/CD
- **Careers Page** — Live job listings pulled from the database, online job application with resume upload
- **Contact Page** — Contact form that stores messages in the database for admin review
- **Legal Pages** — Privacy Policy, Terms & Conditions, Cookie Policy

### 2. Admin Portal (`/admin/*`)

The complete back-office management system for running the business:

#### 📊 Admin Dashboard
- Real-time stats: total users, hours logged, active clients, pending invoices
- Interactive charts: weekly hours trends (area chart), user distribution (pie chart)
- Live data via Supabase real-time subscriptions — dashboard updates automatically
- 10-second cache for fast performance with data freshness

#### 👥 User Management (`/admin/users`)
- Create, edit, delete users (employees, employers, admins)
- Assign roles: admin, employee, employer
- Activate/deactivate user accounts
- Sync users to Supabase Auth for password reset via email
- Force-reset passwords with admin approval workflow

#### 🏢 Client Management (`/admin/clients`)
- Full CRUD for client records (name, email, contact, technology, dates)
- **SOW Document Management** — Upload, view, download, delete multiple Statement of Work (SOW) documents per client (.pdf, .doc, .docx)
- **Revenue Share Tracking** — Share-1, Share-2, Share-3 names & HR rates, Unisys hold, Unisys share HR rate
- **Resource Assignment** — Assign employees/employers to specific clients with per-assignment HR rates
- Track onboarding/offboarding dates per client
- Toggle client status (active/inactive)
- Search and filter clients
- Pagination for large client lists

#### 💰 Invoices & Payroll (`/admin/invoices`)
- Create and manage invoices tied to employees and clients
- Track invoice status: Pending, Paid, Overdue
- Payroll deduction management: W2, 1099, Unisys tax, custom deductions
- Override deduction amounts when needed
- Pending invoice tracker by person
- Filter by month, name, status

#### ⏰ Timecards Management (`/admin/timecards`)
- View all employee timecards aggregated by month or custom date range
- Per-employee summary: total hours, hourly pay, total pay
- Stats overview: total hours, total entries, unique employees
- Search and pagination
- CSV export capability

#### 📈 Reports (`/admin/reports`)
- **Employee Reports** — Monthly breakdown per employee with hours, pay, clients
- **Employer Reports** — Team hours overview
- **Hours Summary** — Aggregate hours data with interactive charts (Bar, Line, Pie)
- **Client Activity** — Which clients have active work
- CSV/Excel export for all report types
- Real-time data with Supabase subscriptions

#### 💼 Job Management (`/admin/jobs`)
- Create, edit, delete job postings (title, description, location, salary, type)
- Published jobs appear automatically on the public Careers page
- Real-time updates via Supabase

#### 📋 Job Applications (`/admin/job-applications`)
- View all applications submitted through the Careers page
- Applicant details: name, email, resume, cover letter, experience
- Update application status: New, Reviewing, Shortlisted, Rejected

#### 📩 Contact Messages (`/admin/contact-messages`)
- View messages submitted through the public Contact page
- Mark as read/replied, manage message status
- Delete old messages

#### 🖼️ Client Logo Management (`/admin/client-logos`)
- Upload client logos to display on the public homepage
- Toggle featured/visible status
- Manage logo carousel on the marketing website

#### 🔐 Password Change Approval
- Employees/employers can request password changes
- Admin reviews and approves/rejects requests
- Admin can also directly change any user's password

### 3. Employee Portal

#### ⏰ Employee Timecards (`/employee/timecards`)
- **Calendar-based interface** — visual monthly calendar showing logged days
- Click any date to log hours for that day
- Select which client the hours are for (from assigned clients only)
- View, edit, or delete entries (unless locked by admin)
- Monthly hour totals displayed
- Cannot edit entries that have been locked/approved

#### 🔑 Change Password (`/employee/change-password`)
- Request a password change (goes through admin approval) or change directly

### 4. Employer Portal

#### 📊 Employer Dashboard (`/employer/dashboard`)
- **Weekly view** — See all assigned employees and their daily hours for the current week
- **Monthly view** — Aggregate monthly summaries per employee
- Navigate between weeks/months
- Filter by specific employee
- Real-time updates — when an employee logs hours, the dashboard updates automatically
- View-only access (cannot modify entries)

#### ⏰ Employer Timecards (`/employer/timecards`)
- Detailed timecard view for assigned employees
- Filter and search capabilities

---

## 🔧 Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework — component-based architecture |
| **Vite** | Build tool — fast dev server and optimized production builds |
| **React Router v6** | Client-side routing with role-based protected routes |
| **Tailwind CSS** | Utility-first CSS — dark/glassmorphism UI design |
| **Zustand** | Lightweight global state management (auth, theme) |
| **Recharts** | Interactive data visualization (charts, graphs) |
| **Lucide React** | Modern icon library |
| **Axios** | HTTP client for API communication |
| **React Toastify** | Toast notifications for user feedback |
| **Supabase JS Client** | Real-time subscriptions, authentication |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **Supabase (PostgreSQL)** | Primary database — hosted PostgreSQL with real-time, auth, and storage |
| **Supabase Auth** | User authentication, password reset via email |
| **Supabase Storage** | File storage for SOW documents, resumes, logos |
| **JSON Web Tokens (JWT)** | API authentication tokens |
| **bcryptjs** | Password hashing |
| **Helmet** | Security headers |
| **Express Rate Limiter** | API rate limiting to prevent abuse |
| **Express Validator** | Input validation and sanitization |
| **Nodemailer + Resend** | Email delivery (password resets, notifications) |
| **Winston** | Structured logging with daily rotation |
| **Docker** | Containerized deployment |

### Infrastructure & Deployment
| Service | Purpose |
|---------|---------|
| **Azure Static Web Apps** | Frontend hosting |
| **Docker Hub** | Backend container registry |
| **Supabase Cloud** | Database, Auth, Storage, Real-time engine |
| **Custom domain** | www.unisysinfotech.com |

---

## 🔒 Security Features

- **Role-Based Access Control (RBAC)** — Admin, Employee, Employer with route-level protection
- **Row-Level Security (RLS)** on Supabase — database-level data isolation
- **HTTPS enforced** in production
- **CORS strict mode** — only the production domain allowed
- **Helmet security headers** — XSS protection, content security policy
- **Rate limiting** — prevents brute force and DDoS
- **Input sanitization** — protects against SQL injection and XSS
- **Password hashing** with bcrypt (10 salt rounds)
- **JWT token auth** with expiry
- **Force password reset** — admin can require users to change password on next login

---

## 📁 Project Structure

```
unisysinfotech/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/               # API endpoints & axios config
│   │   ├── components/        # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── config/            # Supabase client config
│   │   ├── pages/
│   │   │   ├── admin/         # Admin portal pages (10 pages)
│   │   │   ├── employee/      # Employee portal pages
│   │   │   ├── employer/      # Employer portal pages
│   │   │   ├── user/          # General user pages
│   │   │   ├── common/        # Shared pages (change password, etc.)
│   │   │   └── *.jsx          # Public marketing pages (20+ pages)
│   │   ├── store/             # Zustand auth & theme stores
│   │   └── utils/             # Date formatting utilities
│   └── public/                # Static assets
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Database & Supabase config
│   │   ├── middleware/        # Auth, security, error handling
│   │   ├── models/            # Data models (12 models)
│   │   ├── routes/            # API routes (12 route files)
│   │   ├── scripts/           # Admin seed & utility scripts
│   │   └── utils/             # Email, logging, password utilities
│   ├── supabase/
│   │   └── migrations/        # Database migration files (10+)
│   └── Dockerfile             # Container deployment
│
└── scripts/                   # Database cleanup scripts
```

---

## 📊 Data Models (12 Tables)

| Model | Purpose |
|-------|---------|
| **Users** | User accounts with roles, status, client assignments |
| **Clients** | Client companies with SOW, billing, resource info |
| **Client Logos** | Logo images for homepage display |
| **Time Cards** | Daily employee timecard entries |
| **Hours Log** | Historical hours tracking |
| **Invoices** | Billing invoices with payroll tracking |
| **Payroll Deductions** | Tax, 1099, W2, custom deductions |
| **Job Postings** | Career opportunities |
| **Job Applications** | Applicant submissions with resumes |
| **Contact Messages** | Website inquiry submissions |
| **Password Change Requests** | Password change approval workflow |
| **User Client Assignments** | Many-to-many user-client mapping with HR rates |

---

## 💡 How It Helps The Business

### Before This Platform
- ❌ Employee hours tracked in spreadsheets or paper
- ❌ Client information scattered across emails and files
- ❌ No centralized invoice/payroll tracking
- ❌ Job applications received via email with no tracking
- ❌ No real-time visibility into business operations
- ❌ Static website with no interactive features
- ❌ No role-based access — everyone sees everything or nothing

### After This Platform
- ✅ **One unified system** — website, timecards, invoicing, HR, recruiting all in one place
- ✅ **Real-time dashboards** — admin sees live stats, charts auto-update
- ✅ **Self-service employee timecards** — employees log hours themselves, managers see instantly
- ✅ **SOW document management** — upload, organize, and download client contracts
- ✅ **Revenue share tracking** — per-client billing rates, share splits, and Unisys margin calculated automatically
- ✅ **Online careers page** — candidates apply directly, resumes stored, applications tracked
- ✅ **Contact form** — inquiries captured and managed, not lost in email
- ✅ **Secure role-based access** — each user sees only what they're authorized to see
- ✅ **Reports & exports** — monthly employee reports, client activity, CSV downloads
- ✅ **Mobile-friendly** — responsive design works on phones, tablets, and desktops
- ✅ **Professional branding** — modern dark/glass UI with client logo showcase

---

## 🚀 Key Features Summary

| # | Feature | Description |
|---|---------|-------------|
| 1 | Marketing Website | 20+ pages showcasing IT services, about, contact, careers |
| 2 | Role-Based Portals | Separate dashboards for Admin, Employee, Employer |
| 3 | Client Management | Full CRUD with SOW documents, billing rates, resource assignment |
| 4 | Employee Timecards | Calendar-based daily hour logging per client |
| 5 | Employer Dashboard | Real-time weekly/monthly view of team hours |
| 6 | Invoice & Payroll | Invoice creation, deduction tracking, pending payment tracker |
| 7 | Reports & Analytics | Charts, employee/employer reports, CSV export |
| 8 | Job Board + Applications | Post jobs, receive & track applications with resume upload |
| 9 | Contact Message Center | Capture and manage website inquiries |
| 10 | User Management | Create users, assign roles, manage passwords, sync auth |
| 11 | SOW Document Storage | Multi-SOW upload/download per client (PDF, DOC, DOCX) |
| 12 | Revenue Share Tracking | Per-client share splits, HR rates, Unisys margin |
| 13 | Real-Time Updates | Live dashboard via Supabase real-time subscriptions |
| 14 | Security | RLS, RBAC, rate limiting, HTTPS, helmet, input sanitization |
| 15 | Mobile Responsive | Works on all screen sizes |
| 16 | Dark Mode UI | Modern glassmorphism design with dark theme |
| 17 | Password Management | Reset via email, admin approval workflow, force-reset |
| 18 | Docker Deployment | Containerized backend for consistent deployment |
| 19 | Client Logo Showcase | Admin-managed client logo carousel on homepage |
| 20 | Audit & Logging | Winston logger with daily rotation, request logging |

---

## 🛠️ How It Was Built

### Development Approach
1. **Frontend-first design** — Built the React UI with component architecture, then connected to APIs
2. **REST API backend** — Express.js routes with JWT authentication and role authorization middleware
3. **Supabase as the backend database** — PostgreSQL with Row-Level Security, Auth, Storage, and Real-time
4. **Iterative feature development** — Each module (timecards, invoices, clients, etc.) built and tested independently
5. **Security-first** — RLS policies, rate limiting, input validation, and CORS added from the start
6. **Database migrations** — Version-controlled SQL migrations for schema changes
7. **Performance optimization** — Lazy-loaded charts, cached dashboard stats, optimized queries with indexes

### Database Migrations Applied
- RLS policies for all tables
- Performance indexes for common queries
- Client extensions (billing rates, shares, SOW tracking)
- User-client assignment system with HR rates
- Password reset workflow support
- Multi-SOW document storage

---

## 📞 API Endpoints Overview

| Module | Endpoints | Auth Required |
|--------|-----------|---------------|
| **Auth** | Register, Login, Logout, Forgot/Reset Password | Some public |
| **Admin** | Dashboard stats, User CRUD, Auth sync | Admin only |
| **Clients** | CRUD, SOW upload/download/delete, Active list | Admin (CRUD), Employee/Employer (active list) |
| **Time Cards** | Submit, My entries, Employer view, Admin view, Stats | Role-specific |
| **Hours** | CRUD for hour entries | Authenticated |
| **Reports** | Hours summary, Client activity, Monthly reports | Authenticated |
| **Invoices** | CRUD, Pending tracker, Deductions | Admin only |
| **Jobs** | Public listing, Apply, Admin CRUD, Applications | Some public |
| **Contact Messages** | Submit (public), Admin CRUD | Some public |
| **Client Logos** | Public list, Admin CRUD | Some public |
| **Password Change** | Request, Approve/Reject, Admin direct change | Role-specific |

---

*This document provides a comprehensive overview of the Unisys InfoTech platform — what it is, what it does, who it's for, and how it was built.*
