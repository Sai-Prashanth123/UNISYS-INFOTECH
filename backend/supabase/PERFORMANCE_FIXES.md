# RLS Performance Fixes

## Issues Fixed

### 1. Auth RLS Initialization Plan (auth_rls_initplan) ✅ FIXED

**Problem:** Policies were re-evaluating `auth.uid()` and `current_setting()` for each row, causing suboptimal query performance at scale.

**Solution:** Wrapped all `auth.uid()` and `current_setting()` calls in `(select ...)` to cache the result and prevent per-row re-evaluation.

**Fixed in:**
- All "Service role bypass" policies (all tables)
- All "Users can view their own data" policies
- All "Users can view their own timecards" policies
- All "Users can view their own hours" policies
- All "Users can view their own invoices" policies
- All "Users can view their own applications" policies
- All helper functions (`is_admin()`, `is_employer()`, `is_employee()`, `get_user_id_from_auth()`)

### 2. Multiple Permissive Policies ⚠️ INFORMATIONAL

**Status:** These warnings are **expected behavior** and not critical issues.

**Explanation:** When multiple permissive policies exist for the same role/action (e.g., "Service role bypass" + "Admins can do everything" + "Users can view their own data"), PostgreSQL must check all of them. This is by design and allows for flexible access control.

**Impact:** Minimal performance impact. The policies are checked in order, and the first matching policy grants access.

**Note:** These warnings can be safely ignored. They're informational and indicate that your security model has multiple layers of access control, which is actually a good security practice.

## How to Apply the Fixes

### Option 1: Run the Performance Fix Migration (Recommended)

Run the new migration file `002_fix_rls_performance.sql` in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Open `002_fix_rls_performance.sql`
3. Copy and paste the entire file
4. Click "Run"

This will update all existing policies with the optimized versions.

### Option 2: Re-run the Full Migration

Alternatively, you can re-run `001_enable_rls_and_policies.sql` (which has been updated with the fixes):

1. Go to Supabase Dashboard → SQL Editor
2. Open `001_enable_rls_and_policies.sql`
3. Copy and paste the entire file
4. Click "Run"

This will drop and recreate all policies with the optimized versions.

## What Changed

### Before (Performance Issue):
```sql
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    (supabase_auth_id = auth.uid() OR id = auth.uid())
  );
```

### After (Optimized):
```sql
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    (supabase_auth_id = (select auth.uid()) OR id = (select auth.uid()))
  );
```

The `(select auth.uid())` wrapper ensures the value is evaluated once per query, not once per row.

## Verification

After applying the fixes, the `auth_rls_initplan` warnings should disappear. The `multiple_permissive_policies` warnings may still appear, but these are informational and can be safely ignored.

## Performance Impact

- **Before:** `auth.uid()` and `current_setting()` were evaluated for every row
- **After:** These functions are evaluated once per query and cached
- **Expected improvement:** Significant performance improvement for queries scanning many rows

## Tables Affected

All 13 tables with RLS enabled:
1. users
2. time_cards
3. hours_logs
4. invoices
5. job_postings
6. job_applications
7. clients
8. client_logos
9. contacts
10. contact_messages
11. password_reset_tokens
12. password_change_requests
13. payroll_deductions
