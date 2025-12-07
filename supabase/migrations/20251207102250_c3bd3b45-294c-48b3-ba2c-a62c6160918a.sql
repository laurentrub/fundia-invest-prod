-- Add 'manager' value to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

-- Update the has_admin_or_manager_role function to include manager
CREATE OR REPLACE FUNCTION public.has_admin_or_manager_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin', 'manager')
  )
$$;