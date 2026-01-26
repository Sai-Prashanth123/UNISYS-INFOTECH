-- ============================================================================
-- Performance Optimization Migration: Add Indexes for Slow Queries
-- ============================================================================
-- This migration adds indexes to improve query performance based on
-- Supabase query performance analysis and index advisor recommendations.
-- ============================================================================

-- ============================================================================
-- CLIENT_LOGOS TABLE INDEXES
-- ============================================================================
-- Based on slow query analysis:
-- 1. Queries frequently ORDER BY display_order (1444ms for 1 call)
-- 2. Queries filter by is_active and ORDER BY display_order (7.5ms avg)
-- 3. Index advisor recommends: CREATE INDEX ON public.client_logos USING btree (display_order)
-- ============================================================================

-- Primary index for display_order sorting (recommended by index advisor)
-- This speeds up queries that order by display_order
CREATE INDEX IF NOT EXISTS idx_client_logos_display_order 
ON public.client_logos USING btree (display_order);

-- Composite index for filtering by is_active and ordering by display_order
-- This optimizes the public query: WHERE is_active = true ORDER BY display_order
CREATE INDEX IF NOT EXISTS idx_client_logos_is_active_display_order 
ON public.client_logos USING btree (is_active, display_order);

-- Index for created_at (secondary sort column)
-- Helps with queries that order by display_order, created_at DESC
CREATE INDEX IF NOT EXISTS idx_client_logos_created_at 
ON public.client_logos USING btree (created_at DESC);

-- Composite index for the full query pattern: is_active + display_order + created_at
-- This covers the complete query pattern used in the public endpoint
CREATE INDEX IF NOT EXISTS idx_client_logos_active_order_created 
ON public.client_logos USING btree (is_active, display_order ASC, created_at DESC);

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================
-- These indexes optimize RLS helper functions that frequently query users table:
-- - is_admin(), is_employer(), is_employee() functions
-- - get_user_id_from_auth() function
-- - RLS policies that check user roles and IDs
-- ============================================================================

-- Index on supabase_auth_id for fast lookups by Supabase Auth ID
-- Used by: get_user_id_from_auth(), is_admin(), is_employer(), is_employee()
CREATE INDEX IF NOT EXISTS idx_users_supabase_auth_id 
ON public.users USING btree (supabase_auth_id) 
WHERE supabase_auth_id IS NOT NULL;

-- Index on role for role-based filtering
-- Used by: is_admin(), is_employer(), is_employee() functions
CREATE INDEX IF NOT EXISTS idx_users_role 
ON public.users USING btree (role);

-- Composite index for role checks with auth ID
-- Optimizes queries: WHERE (id = auth.uid() OR supabase_auth_id = auth.uid()) AND role = 'X'
CREATE INDEX IF NOT EXISTS idx_users_auth_id_role 
ON public.users USING btree (supabase_auth_id, role) 
WHERE supabase_auth_id IS NOT NULL;

-- Index on id for direct ID lookups (if not already primary key)
-- Used by: get_user_role(), RLS policies
-- Note: If id is the primary key, this index already exists

-- Index on employer_id for employer-employee relationships
-- Used by: "Employers can view their employees" RLS policy
CREATE INDEX IF NOT EXISTS idx_users_employer_id 
ON public.users USING btree (employer_id) 
WHERE employer_id IS NOT NULL;

-- Index on email for login queries (case-insensitive lookups)
-- Used by: authRoutes.js login endpoint
CREATE INDEX IF NOT EXISTS idx_users_email_lower 
ON public.users USING btree (LOWER(email));

-- ============================================================================
-- ADDITIONAL CLIENT_LOGOS OPTIMIZATIONS
-- ============================================================================

-- Index on is_active for faster filtering (if not already covered by composite index)
-- This helps with RLS policy checks and filtering
CREATE INDEX IF NOT EXISTS idx_client_logos_is_active 
ON public.client_logos USING btree (is_active) 
WHERE is_active = true; -- Partial index for active logos only

-- ============================================================================
-- TIME_CARDS TABLE INDEXES
-- ============================================================================
-- Based on query patterns:
-- 1. Queries filter by employee_id and order by date DESC
-- 2. Queries filter by employer_id and order by date DESC
-- 3. Queries filter by date ranges (gte/lte)
-- ============================================================================

-- Index on employee_id for employee timecard queries
-- Used by: /api/timecards/my-entries endpoint
CREATE INDEX IF NOT EXISTS idx_time_cards_employee_id 
ON public.time_cards USING btree (employee_id);

-- Index on employer_id for employer timecard queries
-- Used by: /api/timecards/employer/entries endpoint
CREATE INDEX IF NOT EXISTS idx_time_cards_employer_id 
ON public.time_cards USING btree (employer_id);

-- Index on date for date range queries and sorting
-- Used by: All timecard endpoints with date filtering
CREATE INDEX IF NOT EXISTS idx_time_cards_date 
ON public.time_cards USING btree (date DESC);

-- Composite index for employee queries with date sorting
-- Optimizes: WHERE employee_id = X ORDER BY date DESC
CREATE INDEX IF NOT EXISTS idx_time_cards_employee_date 
ON public.time_cards USING btree (employee_id, date DESC);

-- Composite index for employer queries with date sorting
-- Optimizes: WHERE employer_id = X ORDER BY date DESC
CREATE INDEX IF NOT EXISTS idx_time_cards_employer_date 
ON public.time_cards USING btree (employer_id, date DESC);

-- Composite index for date range queries by employee
-- Optimizes: WHERE employee_id = X AND date >= Y AND date <= Z
CREATE INDEX IF NOT EXISTS idx_time_cards_employee_date_range 
ON public.time_cards USING btree (employee_id, date);

-- ============================================================================
-- JOB_POSTINGS TABLE INDEXES
-- ============================================================================
-- Based on query patterns:
-- 1. Public queries: WHERE is_active = true ORDER BY display_order, posted_date DESC
-- 2. Admin queries: ORDER BY display_order, created_at DESC
-- ============================================================================

-- Index on display_order for job ordering
-- Used by: Public and admin job listing endpoints
CREATE INDEX IF NOT EXISTS idx_job_postings_display_order 
ON public.job_postings USING btree (display_order);

-- Composite index for active jobs with ordering
-- Optimizes: WHERE is_active = true ORDER BY display_order, posted_date DESC
CREATE INDEX IF NOT EXISTS idx_job_postings_active_order_posted 
ON public.job_postings USING btree (is_active, display_order ASC, posted_date DESC) 
WHERE is_active = true;

-- Index on posted_date for date-based sorting
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_date 
ON public.job_postings USING btree (posted_date DESC);

-- Index on is_active for filtering active jobs
CREATE INDEX IF NOT EXISTS idx_job_postings_is_active 
ON public.job_postings USING btree (is_active) 
WHERE is_active = true; -- Partial index for active jobs only

-- ============================================================================
-- JOB_APPLICATIONS TABLE INDEXES
-- ============================================================================
-- Common query patterns:
-- 1. Filter by job_id
-- 2. Filter by email (for duplicate checks and user lookups)
-- 3. Order by applied_date DESC or created_at DESC
-- 4. Filter by status
-- ============================================================================

-- Index on job_id for job application lookups
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id 
ON public.job_applications USING btree (job_id);

-- Index on email for user lookups and duplicate checks
-- Used by: Duplicate application check (email + job_id)
CREATE INDEX IF NOT EXISTS idx_job_applications_email 
ON public.job_applications USING btree (email);

-- Index on applied_date for chronological ordering
-- Used by: Admin endpoints ordering by applied_date
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_date 
ON public.job_applications USING btree (applied_date DESC);

-- Index on created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at 
ON public.job_applications USING btree (created_at DESC);

-- Composite index for job applications by job with date sorting
-- Optimizes: WHERE job_id = X ORDER BY applied_date DESC
CREATE INDEX IF NOT EXISTS idx_job_applications_job_applied_date 
ON public.job_applications USING btree (job_id, applied_date DESC);

-- Composite index for duplicate check (email + job_id)
-- Optimizes: WHERE job_id = X AND email = Y
CREATE INDEX IF NOT EXISTS idx_job_applications_job_email 
ON public.job_applications USING btree (job_id, email);

-- Index on status for filtering by application status
CREATE INDEX IF NOT EXISTS idx_job_applications_status 
ON public.job_applications USING btree (status);

-- ============================================================================
-- VERIFICATION QUERIES (for testing after migration)
-- ============================================================================
-- Run these queries to verify indexes are being used:
--
-- -- Client Logos
-- EXPLAIN ANALYZE
-- SELECT * FROM client_logos 
-- WHERE is_active = true 
-- ORDER BY display_order ASC, created_at DESC;
--
-- EXPLAIN ANALYZE
-- SELECT * FROM client_logos 
-- ORDER BY display_order ASC, created_at DESC;
--
-- -- Time Cards
-- EXPLAIN ANALYZE
-- SELECT * FROM time_cards 
-- WHERE employee_id = 'some-uuid' 
-- ORDER BY date DESC;
--
-- -- Job Postings
-- EXPLAIN ANALYZE
-- SELECT * FROM job_postings 
-- WHERE is_active = true 
-- ORDER BY display_order ASC, posted_date DESC;
-- ============================================================================
