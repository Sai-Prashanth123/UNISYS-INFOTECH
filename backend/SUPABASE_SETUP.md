# Supabase Setup Guide

## Required Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://kwqabttdbdslmjzbcppo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Other existing variables
NODE_ENV=development
PORT=5001
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:5173
```

## How to Get Your Keys

### 1. SUPABASE_URL ✅
**Already set:** `https://kwqabttdbdslmjzbcppo.supabase.co`

### 2. SUPABASE_SERVICE_ROLE_KEY ⚠️ REQUIRED
**Get it from:** [Supabase Dashboard → API Settings](https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/settings/api)

Steps:
1. Go to: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/settings/api
2. Scroll to **"Project API keys"** section
3. Find **"service_role"** key (⚠️ Keep this secret!)
4. Click **"Reveal"** or **"Show"** button
5. Copy the key and paste it in your `.env` file

⚠️ **IMPORTANT:** 
- This key has **full database access** and **bypasses Row Level Security (RLS)**
- **NEVER** expose this key in frontend/client code
- **ONLY** use it in your backend/server-side code
- Keep it in `.env` file (which should be in `.gitignore`)

## Key Types Explained

### For Backend (Server-Side) ✅
- **SUPABASE_SERVICE_ROLE_KEY**: 
  - Used for: Database operations, migrations, admin tasks
  - Access: Full database access, bypasses RLS
  - Security: ⚠️ Keep secret, server-only

### For Frontend (Client-Side) - Optional
- **SUPABASE_ANON_KEY**: 
  - Used for: Client-side operations
  - Access: Limited by Row Level Security (RLS) policies
  - Security: Safe to expose (if RLS is enabled)

- **SUPABASE_PUBLISHABLE_KEY**: 
  - Used for: Newer Supabase clients
  - Access: Same as anon key
  - Security: Safe to expose (if RLS is enabled)

## Current Project Information

- **Project ID:** `kwqabttdbdslmjzbcppo`
- **Project URL:** `https://kwqabttdbdslmjzbcppo.supabase.co`
- **Organization:** UnisysInfotech LLC
- **Region:** us-east-1
- **Status:** ACTIVE_HEALTHY ✅

## Available Keys (from API)

### Anon Key (Legacy)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWFidHRkYmRzbG1qemJjcHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzAxNTksImV4cCI6MjA4MzYwNjE1OX0.MsT5zvZbeFOr-PwmzlHreAQriNsfHa9LtTseIyFvq88
```

### Publishable Key (New)
```
sb_publishable_HfeBiAdezEXTgs-tXT23Rg_tJEsIDOK
```

⚠️ **Note:** The `service_role` key is not shown here for security reasons. You must get it from the dashboard.

## Database Tables Created ✅

All 12 tables have been successfully created:
1. ✅ users
2. ✅ clients
3. ✅ invoices
4. ✅ time_cards
5. ✅ hours_logs
6. ✅ job_postings
7. ✅ job_applications
8. ✅ contacts
9. ✅ contact_messages
10. ✅ client_logos
11. ✅ payroll_deductions
12. ✅ password_change_requests

## Next Steps

1. ✅ Get `SUPABASE_SERVICE_ROLE_KEY` from dashboard
2. ✅ Add it to your `.env` file
3. ✅ Test connection: `npm run dev`
4. ⏳ Convert models from Mongoose to Supabase
5. ⏳ Update routes to use Supabase client
6. ⏳ Update seed scripts

## Quick Links

- **Dashboard:** https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo
- **API Settings:** https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/settings/api
- **Database Tables:** https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/editor


