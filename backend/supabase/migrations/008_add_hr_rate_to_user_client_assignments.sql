-- ============================================================================
-- Migration: Add hr_rate to user_client_assignments
-- ============================================================================
-- Stores per-user hourly rate for a specific client/contract assignment.
-- (In case 005 already ran without hr_rate, this is a safe ALTER.)
-- ============================================================================

ALTER TABLE public.user_client_assignments
ADD COLUMN IF NOT EXISTS hr_rate NUMERIC;

COMMENT ON COLUMN public.user_client_assignments.hr_rate IS 'Hourly rate for this user on this client/contract.';

