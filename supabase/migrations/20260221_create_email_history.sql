-- Create email_history table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_request_id UUID NOT NULL REFERENCES public.loan_requests(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES auth.users(id),
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('status_notification', 'custom', 'document_request', 'contract', 'welcome')),
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_history_loan_request ON public.email_history(loan_request_id);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_by ON public.email_history(sent_by);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON public.email_history(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE public.email_history ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and managers can view all email history
CREATE POLICY "Admins and managers can view email history" ON public.email_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'manager')
    )
  );

-- Policy: Admins and managers can insert email history
CREATE POLICY "Admins and managers can insert email history" ON public.email_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'manager')
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON public.email_history TO authenticated;
