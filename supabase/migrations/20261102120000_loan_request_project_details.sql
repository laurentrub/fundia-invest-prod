-- Conserve les informations du formulaire de financement de projet
ALTER TABLE public.loan_requests ADD COLUMN IF NOT EXISTS project_details JSONB;
NOTIFY pgrst, 'reload schema';
