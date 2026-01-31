-- ============================================================================
-- Migration: Add must_reset_password flag to users
-- ============================================================================
-- Used to force password change on first login for accounts created with a
-- default/temporary password (e.g., "Unisysinfotech").
-- ============================================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_must_reset_password
  ON public.users USING btree (must_reset_password)
  WHERE must_reset_password = TRUE;

COMMENT ON COLUMN public.users.must_reset_password IS 'If true, user must change password after login before accessing the app.';

