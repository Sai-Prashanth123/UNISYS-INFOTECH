-- ============================================================================
-- Migration: Extend clients for multiple contracts + rates
-- ============================================================================
-- We treat each row in public.clients as a "contract" under a client:
-- - SOW Name (required in UI) is stored in existing `industry` column for backward compatibility.
-- - Add `resource_name` to distinguish multiple contracts for same client/email.
-- - Add billing and share rate fields.
-- ============================================================================

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS resource_name TEXT,
ADD COLUMN IF NOT EXISTS billing_rate_per_hr NUMERIC,
ADD COLUMN IF NOT EXISTS share_1_name TEXT,
ADD COLUMN IF NOT EXISTS share_1_hr_rate NUMERIC,
ADD COLUMN IF NOT EXISTS share_2_name TEXT,
ADD COLUMN IF NOT EXISTS share_2_hr_rate NUMERIC,
ADD COLUMN IF NOT EXISTS share_3_name TEXT,
ADD COLUMN IF NOT EXISTS share_3_hr_rate NUMERIC,
ADD COLUMN IF NOT EXISTS unisys_hold NUMERIC,
ADD COLUMN IF NOT EXISTS unisys_share_hr_rate NUMERIC;

COMMENT ON COLUMN public.clients.industry IS 'SOW Name (repurposed from Industry).';
COMMENT ON COLUMN public.clients.resource_name IS 'Resource/Contract name to allow multiple contracts for same client.';
COMMENT ON COLUMN public.clients.billing_rate_per_hr IS 'Client billing amount per hour ($).';
