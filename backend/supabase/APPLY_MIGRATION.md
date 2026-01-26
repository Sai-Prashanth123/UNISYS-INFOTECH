# How to Apply Supabase RLS Migration

## Quick Start

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `unisys-infotech`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste Migration**
   - Open the file: `supabase/migrations/001_enable_rls_and_policies.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for execution to complete
   - Check for any errors

5. **Verify RLS is Enabled**
   - Go to Database → Tables
   - Check each table - it should show "RLS Enabled" badge
   - All 13 tables should have RLS enabled

## What This Migration Does

✅ **Enables RLS** on all 13 public tables  
✅ **Creates security policies** based on user roles  
✅ **Protects sensitive columns** (password, token)  
✅ **Allows backend operations** via service_role key  
✅ **Restricts public access** to prevent data leaks  

## Important Notes

### Backend Will Continue Working
- Your backend uses `SUPABASE_SERVICE_ROLE_KEY`
- Service role bypasses RLS, so all backend operations work normally
- No changes needed to your backend code

### Frontend Real-time Subscriptions
- If your frontend uses Supabase real-time subscriptions, they will work
- Policies allow public read for:
  - Active job postings (careers page)
  - Active client logos (homepage)
  - Creating job applications
  - Creating contact messages

### Sensitive Data Protection
- `users.password` - Only accessible via service_role
- `password_reset_tokens.token` - Only accessible via service_role
- These columns are now protected from public access

## Troubleshooting

### Error: "function does not exist"
- Make sure you run the entire migration file
- The helper functions must be created before policies use them

### Error: "policy already exists"
- This is OK - the migration drops existing policies first
- If you see this error, the policy was already created

### Backend Operations Fail
- Verify you're using `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- Check backend logs for specific error messages
- Service role should bypass all RLS policies

### Frontend Can't Access Data
- Most frontend operations go through your backend API
- Backend uses service_role, so it bypasses RLS
- If frontend directly queries Supabase, ensure user is authenticated via Supabase Auth

## Verification Checklist

After applying the migration, verify:

- [ ] All 13 tables show "RLS Enabled" in Supabase Dashboard
- [ ] Backend API calls still work (test login, create user, etc.)
- [ ] Frontend careers page shows job listings
- [ ] Frontend homepage shows client logos
- [ ] Contact form can submit messages
- [ ] Job application form works
- [ ] Admin dashboard can access all data
- [ ] No errors in browser console
- [ ] No errors in backend logs

## Security Issues Fixed

This migration fixes **all 20 security issues**:

### RLS Disabled (13 tables) ✅
- users
- time_cards
- hours_logs
- invoices
- job_postings
- job_applications
- clients
- client_logos
- contacts
- contact_messages
- password_reset_tokens
- password_change_requests
- payroll_deductions

### Sensitive Columns Exposed (2 tables) ✅
- users.password
- password_reset_tokens.token

## Need Help?

If you encounter issues:

1. Check Supabase Dashboard → Logs for error messages
2. Verify your backend is using service_role key
3. Test with a simple query in SQL Editor
4. Review the policies in Database → Tables → [Table Name] → Policies
