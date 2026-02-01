-- Add SOW document metadata fields to clients (one document per contract row)
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS sow_document_path TEXT,
ADD COLUMN IF NOT EXISTS sow_document_name TEXT,
ADD COLUMN IF NOT EXISTS sow_document_mime TEXT,
ADD COLUMN IF NOT EXISTS sow_document_uploaded_at TIMESTAMPTZ;

