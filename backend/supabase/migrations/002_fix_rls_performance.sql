-- ============================================================================
-- Fix RLS Performance Issues
-- ============================================================================
-- This migration fixes performance issues by optimizing auth.uid() and 
-- current_setting() calls in RLS policies to prevent per-row re-evaluation
-- ============================================================================

-- ============================================================================
-- 1. UPDATE HELPER FUNCTIONS
-- ============================================================================

-- Function to check if current authenticated user is admin (optimized)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE (id = (select auth.uid()) OR supabase_auth_id = (select auth.uid()))
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current authenticated user is employer (optimized)
CREATE OR REPLACE FUNCTION public.is_employer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE (id = (select auth.uid()) OR supabase_auth_id = (select auth.uid()))
    AND role = 'employer'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current authenticated user is employee (optimized)
CREATE OR REPLACE FUNCTION public.is_employee()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE (id = (select auth.uid()) OR supabase_auth_id = (select auth.uid()))
    AND role = 'employee'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get user ID from users table based on Supabase Auth ID (optimized)
CREATE OR REPLACE FUNCTION public.get_user_id_from_auth()
RETURNS UUID AS $$
  SELECT id FROM public.users 
  WHERE supabase_auth_id = (select auth.uid()) OR id = (select auth.uid())
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 2. UPDATE USERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.users;
CREATE POLICY "Service role bypass" ON public.users
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    (supabase_auth_id = (select auth.uid()) OR id = (select auth.uid()))
  );

-- ============================================================================
-- 3. UPDATE TIME_CARDS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.time_cards;
CREATE POLICY "Service role bypass" ON public.time_cards
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

DROP POLICY IF EXISTS "Users can view their own timecards" ON public.time_cards;
CREATE POLICY "Users can view their own timecards" ON public.time_cards
  FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    (employee_id = get_user_id_from_auth() OR
    employee_id IN (
      SELECT id FROM public.users 
      WHERE supabase_auth_id = (select auth.uid())
    ))
  );

-- ============================================================================
-- 4. UPDATE HOURS_LOGS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.hours_logs;
CREATE POLICY "Service role bypass" ON public.hours_logs
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

DROP POLICY IF EXISTS "Users can view their own hours" ON public.hours_logs;
CREATE POLICY "Users can view their own hours" ON public.hours_logs
  FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    (user_id = get_user_id_from_auth() OR
    user_id IN (
      SELECT id FROM public.users 
      WHERE supabase_auth_id = (select auth.uid())
    ))
  );

-- ============================================================================
-- 5. UPDATE INVOICES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.invoices;
CREATE POLICY "Service role bypass" ON public.invoices
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (id = (select auth.uid()) OR supabase_auth_id = (select auth.uid()))
      AND (name = invoices.name OR email = invoices.name)
    )
  );

-- ============================================================================
-- 6. UPDATE PAYROLL_DEDUCTIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.payroll_deductions;
CREATE POLICY "Service role bypass" ON public.payroll_deductions
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 7. UPDATE JOB_POSTINGS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.job_postings;
CREATE POLICY "Service role bypass" ON public.job_postings
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 8. UPDATE JOB_APPLICATIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.job_applications;
CREATE POLICY "Service role bypass" ON public.job_applications
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
CREATE POLICY "Users can view their own applications" ON public.job_applications
  FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    email IN (
      SELECT email FROM public.users 
      WHERE id = (select auth.uid()) OR supabase_auth_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 9. UPDATE CLIENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.clients;
CREATE POLICY "Service role bypass" ON public.clients
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 10. UPDATE CLIENT_LOGOS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.client_logos;
CREATE POLICY "Service role bypass" ON public.client_logos
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 11. UPDATE CONTACTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.contacts;
CREATE POLICY "Service role bypass" ON public.contacts
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 12. UPDATE CONTACT_MESSAGES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.contact_messages;
CREATE POLICY "Service role bypass" ON public.contact_messages
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 13. UPDATE PASSWORD_RESET_TOKENS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.password_reset_tokens;
CREATE POLICY "Service role bypass" ON public.password_reset_tokens
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 14. UPDATE PASSWORD_CHANGE_REQUESTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.password_change_requests;
CREATE POLICY "Service role bypass" ON public.password_change_requests
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All RLS policies have been optimized for performance
-- auth.uid() and current_setting() calls are now cached using (select ...)
-- This prevents per-row re-evaluation and improves query performance
-- ============================================================================
