-- Fix RLS policies to allow both admin and manager roles access
-- Using the existing has_admin_or_manager_role() function

-- ============================================
-- loan_requests table
-- ============================================

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all loan requests" ON public.loan_requests;
DROP POLICY IF EXISTS "Admins can update loan requests" ON public.loan_requests;

-- Create new policies that include managers
CREATE POLICY "Admins and managers can view all loan requests" 
ON public.loan_requests 
FOR SELECT 
USING (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins and managers can update loan requests" 
ON public.loan_requests 
FOR UPDATE 
USING (has_admin_or_manager_role(auth.uid()));

-- ============================================
-- request_notes table
-- ============================================

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all notes" ON public.request_notes;
DROP POLICY IF EXISTS "Admins can create notes" ON public.request_notes;
DROP POLICY IF EXISTS "Admins can delete notes" ON public.request_notes;

-- Create new policies that include managers
CREATE POLICY "Admins and managers can view all notes" 
ON public.request_notes 
FOR SELECT 
USING (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins and managers can create notes" 
ON public.request_notes 
FOR INSERT 
WITH CHECK (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins and managers can delete notes" 
ON public.request_notes 
FOR DELETE 
USING (has_admin_or_manager_role(auth.uid()));

-- ============================================
-- request_status_history table
-- ============================================

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all status history" ON public.request_status_history;
DROP POLICY IF EXISTS "Admins can insert status history" ON public.request_status_history;

-- Create new policies that include managers
CREATE POLICY "Admins and managers can view all status history" 
ON public.request_status_history 
FOR SELECT 
USING (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins and managers can insert status history" 
ON public.request_status_history 
FOR INSERT 
WITH CHECK (has_admin_or_manager_role(auth.uid()));

-- ============================================
-- profiles table
-- ============================================

-- Drop existing admin-only policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new policy that includes managers
CREATE POLICY "Admins and managers can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_admin_or_manager_role(auth.uid()));