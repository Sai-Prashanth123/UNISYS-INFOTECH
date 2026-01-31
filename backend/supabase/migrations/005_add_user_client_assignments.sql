-- ============================================================================
-- Migration: Add user_client_assignments table (multi-client assignment)
-- ============================================================================
-- Allows assigning multiple clients to a user (employee/employer).
-- Backend uses service_role key (bypasses RLS), but we enable RLS and add an
-- explicit service_role policy for clarity and for parity with other tables.
-- ============================================================================

-- Create join table
CREATE TABLE IF NOT EXISTS public.user_client_assignments (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  hr_rate NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, client_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_client_assignments_user_id
  ON public.user_client_assignments USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_user_client_assignments_client_id
  ON public.user_client_assignments USING btree (client_id);

-- Enable RLS
ALTER TABLE public.user_client_assignments ENABLE ROW LEVEL SECURITY;

-- Service role full access policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_client_assignments'
      AND policyname = 'service_role_full_access_user_client_assignments'
  ) THEN
    CREATE POLICY "service_role_full_access_user_client_assignments" ON public.user_client_assignments
      FOR ALL
      USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
      WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
  END IF;
END $$;

COMMENT ON TABLE public.user_client_assignments IS 'Join table for multi-client assignment per user.';
