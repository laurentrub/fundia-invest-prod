-- Create table to track document requests from admins to clients
CREATE TABLE public.document_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_request_id UUID NOT NULL REFERENCES public.loan_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  validated_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  file_path TEXT,
  requested_by UUID NOT NULL,
  custom_message TEXT
);

-- Enable RLS
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own document requests
CREATE POLICY "Users can view their own document requests"
ON public.document_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own document requests (to submit files)
CREATE POLICY "Users can update their own document requests"
ON public.document_requests
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins and managers can view all document requests
CREATE POLICY "Admins and managers can view all document requests"
ON public.document_requests
FOR SELECT
USING (has_admin_or_manager_role(auth.uid()));

-- Admins and managers can insert document requests
CREATE POLICY "Admins and managers can insert document requests"
ON public.document_requests
FOR INSERT
WITH CHECK (has_admin_or_manager_role(auth.uid()));

-- Admins and managers can update document requests
CREATE POLICY "Admins and managers can update document requests"
ON public.document_requests
FOR UPDATE
USING (has_admin_or_manager_role(auth.uid()));

-- Admins and managers can delete document requests
CREATE POLICY "Admins and managers can delete document requests"
ON public.document_requests
FOR DELETE
USING (has_admin_or_manager_role(auth.uid()));