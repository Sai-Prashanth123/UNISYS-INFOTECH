# Quick RLS Verification Guide

## ✅ What to Check After Running Migration

### Step 1: Verify RLS is Enabled

**In Supabase Dashboard:**
1. Go to **Database** → **Tables**
2. **Click on each table name** (don't just look at the list)
3. Look for **"RLS Enabled"** badge or indicator
4. Check the **"Policies"** tab - you should see policies listed

### Step 2: Run Verification Query

**In SQL Editor, run this query:**

```sql
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'time_cards', 'hours_logs', 'invoices',
    'job_postings', 'job_applications', 'clients',
    'client_logos', 'contacts', 'contact_messages',
    'password_reset_tokens', 'password_change_requests',
    'payroll_deductions'
)
ORDER BY tablename;
```

**Expected Result:** All 13 tables should show "✅ RLS Enabled"

### Step 3: Check Policies

**Run this query to see all policies:**

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Result:** You should see multiple policies per table (at least "Service role bypass" for each)

### Step 4: Check Helper Functions

**Run this query:**

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_user_role', 'is_admin', 'is_employer', 
    'is_employee', 'get_user_id_from_auth'
);
```

**Expected Result:** All 5 functions should be listed

## ⚠️ Important Note

The **"REALTIME ENABLED"** column in your screenshot is **NOT** the same as RLS:
- **REALTIME ENABLED** = Real-time subscriptions feature
- **RLS Enabled** = Row Level Security (what we need)

You need to **click into each table** to see the RLS status, or run the SQL queries above.

## ✅ Success Indicators

After successful migration:
- ✅ All 13 tables show "RLS Enabled" 
- ✅ Policies visible in Policies tab for each table
- ✅ Helper functions created
- ✅ No errors in SQL Editor

## ❌ If Something is Missing

If RLS is not enabled or policies are missing:
1. Re-run the migration: `001_enable_rls_and_policies.sql`
2. Check for error messages
3. Make sure you ran the **entire** file (all 482 lines)
