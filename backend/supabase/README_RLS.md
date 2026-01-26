# Supabase Row Level Security (RLS) Setup

This directory contains SQL migrations to enable Row Level Security (RLS) on all Supabase tables and create appropriate security policies.

## Security Issues Fixed

This migration addresses **20 security issues** identified by Supabase:

1. **RLS Disabled in Public** (13 tables)
   - `users`
   - `time_cards`
   - `hours_logs`
   - `invoices`
   - `job_postings`
   - `job_applications`
   - `clients`
   - `client_logos`
   - `contacts`
   - `contact_messages`
   - `password_reset_tokens`
   - `password_change_requests`
   - `payroll_deductions`

2. **Sensitive Columns Exposed** (2 tables)
   - `users.password` - Now protected
   - `password_reset_tokens.token` - Now protected

## Migration Files

There are two migration files available:

1. **`001_enable_rls_and_policies_simple.sql`** ⭐ **RECOMMENDED**
   - Simpler version optimized for your current setup
   - Backend uses service_role (bypasses RLS)
   - Public endpoints work for anonymous users
   - Best for your current architecture

2. **`001_enable_rls_and_policies.sql`**
   - Full version with role-based policies
   - Requires Supabase Auth authentication
   - More granular access control
   - Use if you plan to authenticate users via Supabase Auth

## How to Apply the Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of **`001_enable_rls_and_policies_simple.sql`** ⭐
5. Click **Run** to execute the migration

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply the migration directly
supabase migration up
```

### Option 3: Via psql

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/migrations/001_enable_rls_and_policies_simple.sql
```

## Which Migration to Use?

### Use Simple Version (Recommended) ✅
- Your backend uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS
- Your frontend uses backend API for data operations (not direct Supabase queries)
- You only need public access for:
  - Job listings (careers page)
  - Job applications (apply form)
  - Client logos (homepage)
  - Contact messages (contact form)

### Use Full Version (Advanced)
- You want role-based access control via Supabase Auth
- You plan to authenticate users directly with Supabase Auth
- You need granular permissions for different user roles
- You use Supabase real-time subscriptions with authenticated users

## Security Policies Overview

### Role-Based Access Control

The migration creates policies based on user roles:

- **Admin**: Full access to all tables
- **Employer**: Can view their employees' data
- **Employee**: Can view their own data
- **Public/Anon**: Limited access (e.g., view active jobs, create contact messages)

### Service Role Bypass

All tables include a policy that allows the `service_role` key (used by your backend) to bypass RLS. This ensures your backend operations continue to work normally.

### Sensitive Data Protection

- `users.password`: Only accessible via service_role
- `password_reset_tokens.token`: Only accessible via service_role

## Testing the Migration

After applying the migration, verify:

1. **RLS is enabled**: Check Supabase Dashboard → Database → Tables → Each table should show "RLS Enabled"
2. **Backend still works**: Your backend uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS
3. **Frontend access**: Test that users can only access their own data
4. **Public endpoints**: Verify public endpoints (like job listings) still work

## Troubleshooting

### Backend Operations Fail

If your backend operations fail after enabling RLS:

1. Verify you're using `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_ANON_KEY`)
2. Check that the service role bypass policy is working
3. Review the error messages in your backend logs

### Frontend Access Denied

If frontend users can't access data:

1. Ensure users are authenticated (have a valid JWT token)
2. Check that the user's role is set correctly in the `users` table
3. Verify the policies match your access requirements

### Public Endpoints Broken

If public endpoints (like job listings) don't work:

1. Check that the "Public can view" policies are correctly set
2. Verify the conditions (e.g., `is_active = true`) match your data

## Policy Details

### Users Table
- Admins: Full access
- Users: View own data
- Employers: View their employees

### Time Cards & Hours Logs
- Admins: Full access
- Employees: View own records
- Employers: View their employees' records

### Job Postings
- Admins: Full access
- Public: View active jobs (for careers page)

### Job Applications
- Admins: Full access
- Users: View own applications
- Public: Can create applications

### Client Logos
- Admins: Full access
- Public: View active logos (for homepage)

### Contact Messages
- Admins: Full access
- Public: Can create messages (for contact form)

### Invoices & Payroll Deductions
- Admins: Full access only
- Service role: Full access (for backend)

### Sensitive Tables
- `password_reset_tokens`: Service role only
- `password_change_requests`: Service role only

## Next Steps

After applying this migration:

1. Monitor your application for any access issues
2. Review and adjust policies as needed based on your specific requirements
3. Consider adding additional policies for specific use cases
4. Regularly audit your RLS policies to ensure they match your security requirements

## Support

If you encounter issues:

1. Check Supabase logs in the dashboard
2. Review the error messages
3. Verify your JWT tokens are valid
4. Ensure your backend is using the service role key
