-- ============================================================
-- Fix: grant INSERT to anon/authenticated on public contact forms
-- RLS policies alone are not sufficient — PostgREST also requires
-- the underlying SQL privilege via GRANT.
-- ============================================================

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
