-- ============================================================================
-- Supabase RLS Migration: Simple Version
-- ============================================================================
-- This version is optimized for your current setup where:
-- - Backend uses service_role key (bypasses RLS)
-- - Frontend uses backend API for data (not direct Supabase queries)
-- - Supabase is mainly used for real-time subscriptions
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
-- 2. CREATE POLICIES FOR SERVICE ROLE (BACKEND ACCESS)
-- ============================================================================
-- Service role bypasses RLS, but we create explicit policies for clarity

-- Users table: Service role full access
CREATE POLICY "service_role_full_access_users" ON public.users
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Time cards: Service role full access
CREATE POLICY "service_role_full_access_time_cards" ON public.time_cards
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Hours logs: Service role full access
CREATE POLICY "service_role_full_access_hours_logs" ON public.hours_logs
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Invoices: Service role full access
CREATE POLICY "service_role_full_access_invoices" ON public.invoices
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Payroll deductions: Service role full access
CREATE POLICY "service_role_full_access_payroll_deductions" ON public.payroll_deductions
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Job postings: Service role full access
CREATE POLICY "service_role_full_access_job_postings" ON public.job_postings
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Job applications: Service role full access
CREATE POLICY "service_role_full_access_job_applications" ON public.job_applications
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Clients: Service role full access
CREATE POLICY "service_role_full_access_clients" ON public.clients
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Client logos: Service role full access
CREATE POLICY "service_role_full_access_client_logos" ON public.client_logos
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Contacts: Service role full access
CREATE POLICY "service_role_full_access_contacts" ON public.contacts
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Contact messages: Service role full access
CREATE POLICY "service_role_full_access_contact_messages" ON public.contact_messages
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Password reset tokens: Service role ONLY (sensitive data)
CREATE POLICY "service_role_only_password_reset_tokens" ON public.password_reset_tokens
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Password change requests: Service role ONLY (sensitive data)
CREATE POLICY "service_role_only_password_change_requests" ON public.password_change_requests
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ============================================================================
-- 3. CREATE PUBLIC POLICIES (FOR FRONTEND PUBLIC ENDPOINTS)
-- ============================================================================

-- Job postings: Public can view active jobs (for careers page)
CREATE POLICY "public_view_active_jobs" ON public.job_postings
  FOR SELECT
  USING (is_active = true);

-- Job applications: Public can create applications (for careers page)
CREATE POLICY "public_create_job_applications" ON public.job_applications
  FOR INSERT
  WITH CHECK (true);

-- Client logos: Public can view active logos (for homepage)
CREATE POLICY "public_view_active_logos" ON public.client_logos
  FOR SELECT
  USING (is_active = true);

-- Contact messages: Public can create messages (for contact form)
CREATE POLICY "public_create_contact_messages" ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 4. SECURE SENSITIVE COLUMNS
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
-- All tables now have RLS enabled
-- Service role (backend) has full access to all tables
-- Public (anon) users can only:
--   - View active job postings
--   - Create job applications
--   - View active client logos
--   - Create contact messages
-- Sensitive columns (password, token) are protected
-- ============================================================================
