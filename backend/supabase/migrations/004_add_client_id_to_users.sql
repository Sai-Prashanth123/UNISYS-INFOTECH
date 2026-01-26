-- ============================================================================
-- Migration: Add client_id column to users table
-- ============================================================================
-- This migration adds a client_id foreign key column to the users table
-- to allow assigning users (employees/employers) to clients.
-- ============================================================================

-- Add client_id column to users table
-- This allows users to be assigned to a client
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Add index for client_id lookups
CREATE INDEX IF NOT EXISTS idx_users_client_id 
ON public.users USING btree (client_id) 
WHERE client_id IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.users.client_id IS 'Foreign key reference to clients table. Allows assigning users to a specific client.';
