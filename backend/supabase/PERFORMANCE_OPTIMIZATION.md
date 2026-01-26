# Performance Optimization Migration Guide

## Overview

This migration (`003_performance_indexes.sql`) adds database indexes to improve query performance based on Supabase query performance analysis and index advisor recommendations.

## Issues Addressed

### 1. Slow `client_logos` Queries
- **Problem**: Queries ordering by `display_order` were taking 1444ms for a single call
- **Solution**: Added indexes on `display_order`, `is_active`, and composite indexes for common query patterns

### 2. RLS Helper Function Performance
- **Problem**: RLS helper functions (`is_admin()`, `is_employer()`, `is_employee()`) frequently query the `users` table without indexes
- **Solution**: Added indexes on `supabase_auth_id`, `role`, and composite indexes for role checks

### 3. Time Cards Query Performance
- **Problem**: Time card queries filter by `employee_id`/`employer_id` and order by `date` without proper indexes
- **Solution**: Added indexes on `employee_id`, `employer_id`, `date`, and composite indexes

### 4. Job Postings Query Performance
- **Problem**: Job queries filter by `is_active` and order by `display_order`/`posted_date` without indexes
- **Solution**: Added indexes on `display_order`, `is_active`, `posted_date`, and composite indexes

## Indexes Created

### Client Logos Table
1. `idx_client_logos_display_order` - Primary sorting index
2. `idx_client_logos_is_active_display_order` - Filter + sort optimization
3. `idx_client_logos_created_at` - Secondary sort column
4. `idx_client_logos_active_order_created` - Full query pattern coverage
5. `idx_client_logos_is_active` - Partial index for active logos

### Users Table
1. `idx_users_supabase_auth_id` - Fast auth ID lookups
2. `idx_users_role` - Role-based filtering
3. `idx_users_auth_id_role` - Composite for role checks
4. `idx_users_employer_id` - Employer-employee relationships
5. `idx_users_email_lower` - Case-insensitive email lookups

### Time Cards Table
1. `idx_time_cards_employee_id` - Employee queries
2. `idx_time_cards_employer_id` - Employer queries
3. `idx_time_cards_date` - Date sorting
4. `idx_time_cards_employee_date` - Employee + date composite
5. `idx_time_cards_employer_date` - Employer + date composite
6. `idx_time_cards_employee_date_range` - Date range queries

### Job Postings Table
1. `idx_job_postings_display_order` - Job ordering
2. `idx_job_postings_active_order_posted` - Active jobs with ordering
3. `idx_job_postings_posted_date` - Date-based sorting
4. `idx_job_postings_is_active` - Partial index for active jobs

### Job Applications Table
1. `idx_job_applications_job_id` - Job lookups
2. `idx_job_applications_email` - Email lookups and duplicate checks
3. `idx_job_applications_applied_date` - Applied date ordering
4. `idx_job_applications_created_at` - Chronological ordering
5. `idx_job_applications_job_applied_date` - Job + applied date composite
6. `idx_job_applications_job_email` - Job + email composite (duplicate checks)
7. `idx_job_applications_status` - Status filtering

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Navigate to your project: `unisys-infotech`
   - Go to **SQL Editor**

2. **Run the Migration**
   - Click **New Query**
   - Copy the entire contents of `003_performance_indexes.sql`
   - Paste into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter`)

3. **Verify Success**
   - Check for any errors in the output
   - All indexes should be created successfully

### Option 2: Using Supabase CLI

```bash
# Navigate to your backend directory
cd unisysinfotech/backend

# Apply the migration
supabase db push
```

### Option 3: Using MCP Supabase Server

If you have the Supabase MCP server configured, you can execute the SQL directly through the MCP tool.

## Verification

After applying the migration, verify that indexes are being used:

### Check Index Creation

```sql
-- List all indexes on client_logos
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'client_logos' 
AND schemaname = 'public';

-- List all indexes on users
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- List all indexes on time_cards
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'time_cards' 
AND schemaname = 'public';
```

### Test Query Performance

```sql
-- Test client_logos query (should use index)
EXPLAIN ANALYZE
SELECT * FROM client_logos 
WHERE is_active = true 
ORDER BY display_order ASC, created_at DESC;

-- Test users role check (should use index)
EXPLAIN ANALYZE
SELECT * FROM users 
WHERE supabase_auth_id = 'some-uuid' 
AND role = 'admin';

-- Test time_cards query (should use index)
EXPLAIN ANALYZE
SELECT * FROM time_cards 
WHERE employee_id = 'some-uuid' 
ORDER BY date DESC;
```

Look for `Index Scan` or `Index Only Scan` in the `EXPLAIN` output, which indicates indexes are being used.

## Expected Performance Improvements

- **Client Logos Queries**: Should reduce from ~1444ms to <10ms
- **RLS Policy Checks**: Should reduce overhead by 50-80%
- **Time Card Queries**: Should improve by 60-90% for filtered queries
- **Job Posting Queries**: Should improve by 70-85% for active job listings

## Monitoring

After applying indexes, monitor your Supabase dashboard:

1. **Query Performance Tab**
   - Check if slow queries have improved
   - Verify new queries are using indexes

2. **Database Size**
   - Indexes will increase database size slightly
   - This is normal and expected

3. **Write Performance**
   - Indexes may slightly slow down INSERT/UPDATE operations
   - The trade-off is worth it for read performance gains

## Rollback (if needed)

If you need to remove these indexes:

```sql
-- Remove client_logos indexes
DROP INDEX IF EXISTS idx_client_logos_display_order;
DROP INDEX IF EXISTS idx_client_logos_is_active_display_order;
DROP INDEX IF EXISTS idx_client_logos_created_at;
DROP INDEX IF EXISTS idx_client_logos_active_order_created;
DROP INDEX IF EXISTS idx_client_logos_is_active;

-- Remove users indexes
DROP INDEX IF EXISTS idx_users_supabase_auth_id;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_auth_id_role;
DROP INDEX IF EXISTS idx_users_employer_id;
DROP INDEX IF EXISTS idx_users_email_lower;

-- Remove time_cards indexes
DROP INDEX IF EXISTS idx_time_cards_employee_id;
DROP INDEX IF EXISTS idx_time_cards_employer_id;
DROP INDEX IF EXISTS idx_time_cards_date;
DROP INDEX IF EXISTS idx_time_cards_employee_date;
DROP INDEX IF EXISTS idx_time_cards_employer_date;
DROP INDEX IF EXISTS idx_time_cards_employee_date_range;

-- Remove job_postings indexes
DROP INDEX IF EXISTS idx_job_postings_display_order;
DROP INDEX IF EXISTS idx_job_postings_active_order_posted;
DROP INDEX IF EXISTS idx_job_postings_posted_date;
DROP INDEX IF EXISTS idx_job_postings_is_active;

-- Remove job_applications indexes
DROP INDEX IF EXISTS idx_job_applications_job_id;
DROP INDEX IF EXISTS idx_job_applications_email;
DROP INDEX IF EXISTS idx_job_applications_applied_date;
DROP INDEX IF EXISTS idx_job_applications_created_at;
DROP INDEX IF EXISTS idx_job_applications_job_applied_date;
DROP INDEX IF EXISTS idx_job_applications_job_email;
DROP INDEX IF EXISTS idx_job_applications_status;
```

## Notes

- All indexes use `IF NOT EXISTS` to prevent errors if run multiple times
- Partial indexes (with `WHERE` clauses) are used where appropriate to reduce index size
- Composite indexes are ordered to match common query patterns
- Indexes are created using `btree` which is PostgreSQL's default and most efficient for most queries

## Support

If you encounter any issues:
1. Check Supabase logs for error messages
2. Verify table names match your schema
3. Ensure you have proper permissions to create indexes
4. Check if indexes already exist (they won't be recreated due to `IF NOT EXISTS`)
