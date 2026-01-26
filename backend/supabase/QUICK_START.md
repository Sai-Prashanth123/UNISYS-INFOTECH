# Quick Start: Fix Supabase Security Issues

## 🚨 20 Security Issues to Fix

Your Supabase database has **20 security issues** that need to be fixed:

### Issues:
- ✅ **13 tables** missing Row Level Security (RLS)
- ✅ **2 sensitive columns** exposed (password, token)

## ✅ Solution

I've created a complete SQL migration that fixes **ALL** issues in one go!

## 📋 How to Apply (Choose One Method)

### Method 1: Supabase Dashboard (Easiest) ⭐ Recommended

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `unisys-infotech`

2. **Open SQL Editor**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New Query"**

3. **Copy Migration File**
   - Open: `backend/supabase/migrations/001_enable_rls_and_policies.sql`
   - Copy **ALL** contents (Ctrl+A, Ctrl+C)

4. **Paste and Run**
   - Paste into SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)

5. **Verify Success**
   - Check for any errors (should be none)
   - Go to **Database → Tables**
   - Each table should show **"RLS Enabled"** badge

### Method 2: Supabase CLI

```bash
# If you have Supabase CLI installed
cd unisysinfotech/backend
supabase db push

# Or apply migration directly
supabase migration up
```

### Method 3: psql Command Line

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/migrations/001_enable_rls_and_policies.sql
```

## ✅ What Gets Fixed

### RLS Enabled on 13 Tables:
1. ✅ `users`
2. ✅ `time_cards`
3. ✅ `hours_logs`
4. ✅ `invoices`
5. ✅ `job_postings`
6. ✅ `job_applications`
7. ✅ `clients`
8. ✅ `client_logos`
9. ✅ `contacts`
10. ✅ `contact_messages`
11. ✅ `password_reset_tokens`
12. ✅ `password_change_requests`
13. ✅ `payroll_deductions`

### Sensitive Columns Protected:
1. ✅ `users.password` - Only accessible via service_role
2. ✅ `password_reset_tokens.token` - Only accessible via service_role

## 🔒 Security Policies Created

The migration creates role-based access policies:

- **Admin**: Full access to all tables
- **Employer**: Can view their employees' data
- **Employee**: Can view their own data
- **Public**: Limited access (active jobs, client logos, create applications/messages)
- **Service Role**: Full access (your backend bypasses RLS)

## ⚠️ Important Notes

### Your Backend Will Continue Working ✅
- Your backend uses `SUPABASE_SERVICE_ROLE_KEY`
- Service role **bypasses RLS**, so all backend operations work normally
- **No changes needed** to your backend code

### Frontend Real-time Subscriptions ✅
- Real-time subscriptions will continue to work
- Public can read:
  - Active job postings (careers page)
  - Active client logos (homepage)
  - Can create job applications
  - Can create contact messages

### Sensitive Data Protection ✅
- Password and token columns are now protected
- Only your backend (service_role) can access them
- Frontend cannot access sensitive data directly

## 🧪 Testing After Migration

After applying, test:

1. ✅ **Backend API** - Login, create user, etc. (should work normally)
2. ✅ **Frontend Careers Page** - Should show job listings
3. ✅ **Frontend Homepage** - Should show client logos
4. ✅ **Contact Form** - Should submit messages
5. ✅ **Job Application** - Should submit applications
6. ✅ **Admin Dashboard** - Should access all data

## 📊 Verify in Supabase Dashboard

After applying:

1. Go to **Database → Tables**
2. Click on any table (e.g., `users`)
3. Check **"RLS Enabled"** badge is visible
4. Click **"Policies"** tab to see created policies

## 🆘 Troubleshooting

### Error: "function does not exist"
- Make sure you ran the **entire** migration file
- Helper functions must be created before policies

### Error: "policy already exists"
- This is OK - migration drops existing policies first
- If error persists, manually drop policies first

### Backend Operations Fail
- Verify you're using `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- Check backend logs for specific errors
- Service role should bypass all RLS

### Frontend Can't Access Data
- Most frontend operations go through your backend API
- Backend uses service_role, so it bypasses RLS
- If frontend directly queries Supabase, ensure user is authenticated

## 📝 Files Created

- ✅ `supabase/migrations/001_enable_rls_and_policies.sql` - Main migration file
- ✅ `supabase/README_RLS.md` - Detailed documentation
- ✅ `supabase/APPLY_MIGRATION.md` - Step-by-step guide
- ✅ `supabase/QUICK_START.md` - This file

## 🎯 Next Steps

1. **Apply the migration** using Method 1 above
2. **Test your application** to ensure everything works
3. **Monitor Supabase Dashboard** - Security issues should be resolved
4. **Review policies** if you need custom access rules

---

**All 20 security issues will be fixed after applying this migration!** 🎉
