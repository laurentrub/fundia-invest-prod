-- Create request_status_history table for tracking status changes
CREATE TABLE public.request_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_request_id UUID NOT NULL REFERENCES public.loan_requests(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comment TEXT
);

-- Enable RLS
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for request_status_history
CREATE POLICY "Admins can view all status history"
ON public.request_status_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert status history"
ON public.request_status_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create request_notes table for internal notes
CREATE TABLE public.request_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_request_id UUID NOT NULL REFERENCES public.loan_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.request_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for request_notes
CREATE POLICY "Admins can view all notes"
ON public.request_notes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create notes"
ON public.request_notes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notes"
ON public.request_notes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_status_history_loan_request ON public.request_status_history(loan_request_id);
CREATE INDEX idx_notes_loan_request ON public.request_notes(loan_request_id);