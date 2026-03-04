-- Add is_blocked column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

-- Allow admins to read all profiles (needed to check block status)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update profiles (to block/unblock users)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function: auto-block user when their loan request is set to 'refused'
CREATE OR REPLACE FUNCTION public.block_user_on_refusal()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'refused' AND OLD.status <> 'refused' THEN
    UPDATE public.profiles
    SET is_blocked = TRUE
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_loan_request_refused
  AFTER UPDATE ON public.loan_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.block_user_on_refusal();
