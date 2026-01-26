-- ============================================================================
-- Supabase RLS Migration: Enable Row Level Security and Create Policies
-- ============================================================================
-- This migration enables RLS on all public tables and creates appropriate
-- security policies based on user roles (admin, employer, employee, user)
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hours_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_deductions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CREATE HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- Function to get current user's role from users table
-- Works with Supabase Auth user ID (auth.uid())
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.users 
  WHERE id = user_id OR supabase_auth_id = user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE (id = (select auth.uid()) OR supabase_auth_id = (select auth.uid()))
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current authenticated user is employer
CREATE OR REPLACE FUNCTION public.is_employer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE (id = (select auth.uid()) OR supabase_auth_id = (select auth.uid()))
    AND role = 'employer'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current authenticated user is employee
CREATE OR REPLACE FUNCTION public.is_employee()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE (id = (select auth.uid()) OR supabase_auth_id = (select auth.uid()))
    AND role = 'employee'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get user ID from users table based on Supabase Auth ID
CREATE OR REPLACE FUNCTION public.get_user_id_from_auth()
RETURNS UUID AS $$
  SELECT id FROM public.users 
  WHERE supabase_auth_id = (select auth.uid()) OR id = (select auth.uid())
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 3. USERS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role bypass" ON public.users;
DROP POLICY IF EXISTS "Admins can do everything" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Employers can view their employees" ON public.users;
DROP POLICY IF EXISTS "Anon read limited" ON public.users;

-- Service role bypass (for backend operations) - MUST BE FIRST
-- This allows your backend to work normally
CREATE POLICY "Service role bypass" ON public.users
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- Admins have full access (if authenticated via Supabase Auth)
CREATE POLICY "Admins can do everything" ON public.users
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Users can view their own data (excluding password)
-- Match by Supabase Auth ID or direct ID
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    (supabase_auth_id = (select auth.uid()) OR id = (select auth.uid()))
  );

-- Employers can view their employees
CREATE POLICY "Employers can view their employees" ON public.users
  FOR SELECT
  USING (
    is_employer() AND 
    employer_id = get_user_id_from_auth()
  );

-- Anon users: No access (all access goes through backend API)
CREATE POLICY "Anon read limited" ON public.users
  FOR SELECT
  USING (false);

-- ============================================================================
-- 4. TIME_CARDS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.time_cards;
DROP POLICY IF EXISTS "Admins can do everything" ON public.time_cards;
DROP POLICY IF EXISTS "Users can view their own timecards" ON public.time_cards;
DROP POLICY IF EXISTS "Employers can view employee timecards" ON public.time_cards;
DROP POLICY IF EXISTS "Anon read limited" ON public.time_cards;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.time_cards
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.time_cards
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

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

CREATE POLICY "Employers can view employee timecards" ON public.time_cards
  FOR SELECT
  USING (
    is_employer() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = time_cards.employee_id 
      AND employer_id = get_user_id_from_auth()
    )
  );

-- Anon: No access (all access through backend)
CREATE POLICY "Anon read limited" ON public.time_cards
  FOR SELECT
  USING (false);

-- ============================================================================
-- 5. HOURS_LOGS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.hours_logs;
DROP POLICY IF EXISTS "Admins can do everything" ON public.hours_logs;
DROP POLICY IF EXISTS "Users can view their own hours" ON public.hours_logs;
DROP POLICY IF EXISTS "Employers can view employee hours" ON public.hours_logs;
DROP POLICY IF EXISTS "Anon read limited" ON public.hours_logs;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.hours_logs
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.hours_logs
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

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

CREATE POLICY "Employers can view employee hours" ON public.hours_logs
  FOR SELECT
  USING (
    is_employer() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = hours_logs.user_id 
      AND employer_id = get_user_id_from_auth()
    )
  );

-- Anon: No access (all access through backend)
CREATE POLICY "Anon read limited" ON public.hours_logs
  FOR SELECT
  USING (false);

-- ============================================================================
-- 6. INVOICES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.invoices;
DROP POLICY IF EXISTS "Admins can do everything" ON public.invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anon read limited" ON public.invoices;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.invoices
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.invoices
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

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

-- Anon: No access (all access through backend)
CREATE POLICY "Anon read limited" ON public.invoices
  FOR SELECT
  USING (false);

-- ============================================================================
-- 7. PAYROLL_DEDUCTIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.payroll_deductions;
DROP POLICY IF EXISTS "Admins can do everything" ON public.payroll_deductions;
DROP POLICY IF EXISTS "Anon read limited" ON public.payroll_deductions;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.payroll_deductions
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.payroll_deductions
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Anon: No access (all access through backend)
CREATE POLICY "Anon read limited" ON public.payroll_deductions
  FOR SELECT
  USING (false);

-- ============================================================================
-- 8. JOB_POSTINGS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.job_postings;
DROP POLICY IF EXISTS "Admins can do everything" ON public.job_postings;
DROP POLICY IF EXISTS "Public can view active jobs" ON public.job_postings;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.job_postings
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.job_postings
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public can view active job postings (for careers page)
-- Allow both authenticated and anonymous users
CREATE POLICY "Public can view active jobs" ON public.job_postings
  FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- 9. JOB_APPLICATIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can do everything" ON public.job_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create applications" ON public.job_applications;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.job_applications
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.job_applications
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view their own applications" ON public.job_applications
  FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    email IN (
      SELECT email FROM public.users 
      WHERE id = (select auth.uid()) OR supabase_auth_id = (select auth.uid())
    )
  );

-- Public can create applications (for careers page job applications)
-- Applications are typically created through backend API, but allow direct insert for flexibility
CREATE POLICY "Users can create applications" ON public.job_applications
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 10. CLIENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.clients;
DROP POLICY IF EXISTS "Admins can do everything" ON public.clients;
DROP POLICY IF EXISTS "Anon read limited" ON public.clients;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.clients
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.clients
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Anon: No access (all access through backend)
CREATE POLICY "Anon read limited" ON public.clients
  FOR SELECT
  USING (false);

-- ============================================================================
-- 11. CLIENT_LOGOS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.client_logos;
DROP POLICY IF EXISTS "Admins can do everything" ON public.client_logos;
DROP POLICY IF EXISTS "Public can view active logos" ON public.client_logos;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.client_logos
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.client_logos
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public can view active client logos (for homepage)
-- This allows the frontend homepage to display client logos
CREATE POLICY "Public can view active logos" ON public.client_logos
  FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- 12. CONTACTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.contacts;
DROP POLICY IF EXISTS "Admins can do everything" ON public.contacts;
DROP POLICY IF EXISTS "Anon read limited" ON public.contacts;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.contacts
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.contacts
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Anon: No access (all access through backend)
CREATE POLICY "Anon read limited" ON public.contacts
  FOR SELECT
  USING (false);

-- ============================================================================
-- 13. CONTACT_MESSAGES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can do everything" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can create messages" ON public.contact_messages;

-- Service role bypass (for backend operations) - MUST BE FIRST
CREATE POLICY "Service role bypass" ON public.contact_messages
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Admins can do everything" ON public.contact_messages
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public can create contact messages (for contact form)
-- Messages are typically created through backend API, but allow direct insert for flexibility
CREATE POLICY "Public can create messages" ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 14. PASSWORD_RESET_TOKENS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.password_reset_tokens;

-- Only service role can access password reset tokens (sensitive data)
CREATE POLICY "Service role bypass" ON public.password_reset_tokens
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 15. PASSWORD_CHANGE_REQUESTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role bypass" ON public.password_change_requests;

-- Only service role can access password change requests (sensitive data)
CREATE POLICY "Service role bypass" ON public.password_change_requests
  FOR ALL
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role')
  WITH CHECK ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- ============================================================================
-- 16. SECURE SENSITIVE COLUMNS
-- ============================================================================

-- Revoke SELECT on password column from anon and authenticated roles
-- Password should only be accessible via service role (backend)
REVOKE SELECT (password) ON public.users FROM anon, authenticated;

-- Revoke SELECT on token column from anon and authenticated roles
-- Token should only be accessible via service role (backend)
REVOKE SELECT (token) ON public.password_reset_tokens FROM anon, authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables now have RLS enabled with appropriate policies
-- Sensitive columns (password, token) are protected
-- Backend operations using service_role key will bypass RLS
-- Frontend operations using anon key will be restricted by policies
-- ============================================================================
