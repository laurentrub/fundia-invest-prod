-- Create contracts table for tracking contract status
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_request_id UUID NOT NULL REFERENCES public.loan_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_signature' CHECK (status IN ('pending_signature', 'signed', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  signed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  signed_document_path TEXT,
  rejection_reason TEXT
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Users can view their own contracts
CREATE POLICY "Users can view their own contracts"
ON public.contracts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own contracts (for uploading signed document)
CREATE POLICY "Users can update their own contracts"
ON public.contracts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins and managers can view all contracts
CREATE POLICY "Admins can view all contracts"
ON public.contracts
FOR SELECT
USING (has_admin_or_manager_role(auth.uid()));

-- Admins and managers can insert contracts
CREATE POLICY "Admins can insert contracts"
ON public.contracts
FOR INSERT
WITH CHECK (has_admin_or_manager_role(auth.uid()));

-- Admins and managers can update contracts
CREATE POLICY "Admins can update contracts"
ON public.contracts
FOR UPDATE
USING (has_admin_or_manager_role(auth.uid()));

-- Create storage bucket for signed contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-contracts', 'signed-contracts', false);

-- Users can upload their signed contracts
CREATE POLICY "Users can upload signed contracts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'signed-contracts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own signed contracts
CREATE POLICY "Users can view their signed contracts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'signed-contracts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all signed contracts
CREATE POLICY "Admins can view all signed contracts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'signed-contracts' 
  AND has_admin_or_manager_role(auth.uid())
);