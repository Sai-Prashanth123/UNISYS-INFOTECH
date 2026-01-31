-- ============================================================================
-- Migration: Ensure password_change_requests schema exists (production safety)
-- ============================================================================
-- Some environments may already have this table; this migration is written to:
-- - Create table if missing
-- - Add missing columns if table exists but is incomplete
-- - Add FK for reviewed_by (admin user)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.password_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  new_password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ NULL,
  reviewed_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT NULL
);

ALTER TABLE public.password_change_requests
  ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.password_change_requests
  ADD COLUMN IF NOT EXISTS new_password_hash TEXT;
ALTER TABLE public.password_change_requests
  ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.password_change_requests
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ;
ALTER TABLE public.password_change_requests
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.password_change_requests
  ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE public.password_change_requests
  ADD COLUMN IF NOT EXISTS reason TEXT;

-- Ensure FK constraints exist (safe to attempt; may error if already exists with different name)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.password_change_requests
      ADD CONSTRAINT password_change_requests_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object THEN
    -- ignore
  END;

  BEGIN
    ALTER TABLE public.password_change_requests
      ADD CONSTRAINT password_change_requests_reviewed_by_fkey
      FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;
  EXCEPTION WHEN duplicate_object THEN
    -- ignore
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_password_change_requests_user_id
  ON public.password_change_requests USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_password_change_requests_status
  ON public.password_change_requests USING btree (status);

