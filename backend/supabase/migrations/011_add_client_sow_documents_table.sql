-- Table for multiple SOW documents per client
CREATE TABLE IF NOT EXISTS public.client_sow_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sow_label TEXT NOT NULL DEFAULT 'SOW',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_mime TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Index for fast lookups by client
CREATE INDEX IF NOT EXISTS idx_client_sow_documents_client_id ON public.client_sow_documents(client_id);

-- Enable RLS
ALTER TABLE public.client_sow_documents ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "admin_full_access_sow_documents" ON public.client_sow_documents
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Service role bypass (for backend API calls)
CREATE POLICY "service_role_bypass_sow_documents" ON public.client_sow_documents
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
