-- ============================================================================
-- Verify RLS Status on All Tables
-- ============================================================================
-- This query checks if RLS is enabled on all 13 tables that should have it
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'users',
    'time_cards',
    'hours_logs',
    'invoices',
    'job_postings',
    'job_applications',
    'clients',
    'client_logos',
    'contacts',
    'contact_messages',
    'password_reset_tokens',
    'password_change_requests',
    'payroll_deductions'
)
ORDER BY tablename;

-- ============================================================================
-- Check Policies Created
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'users',
    'time_cards',
    'hours_logs',
    'invoices',
    'job_postings',
    'job_applications',
    'clients',
    'client_logos',
    'contacts',
    'contact_messages',
    'password_reset_tokens',
    'password_change_requests',
    'payroll_deductions'
)
ORDER BY tablename, policyname;

-- ============================================================================
-- Check Helper Functions Created
-- ============================================================================

SELECT 
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_user_role',
    'is_admin',
    'is_employer',
    'is_employee',
    'get_user_id_from_auth'
)
ORDER BY routine_name;
