-- ============================================================
-- Fundia Network — Payment & Subscriptions
-- ============================================================

-- Table des abonnements réseau des utilisateurs
CREATE TABLE public.network_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 19.90,
  currency TEXT NOT NULL DEFAULT 'EUR',
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  -- Pour CB (Stripe)
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  -- Pour virement
  bank_transfer_reference TEXT,
  bank_transfer_confirmed_at TIMESTAMP WITH TIME ZONE,
  bank_transfer_confirmed_by UUID REFERENCES auth.users(id),
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.network_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.network_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.network_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.network_subscriptions FOR SELECT
  USING (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins can update all subscriptions"
  ON public.network_subscriptions FOR UPDATE
  USING (has_admin_or_manager_role(auth.uid()));

-- Index
CREATE INDEX idx_network_subscriptions_user_id ON public.network_subscriptions(user_id);
CREATE INDEX idx_network_subscriptions_status ON public.network_subscriptions(status);
CREATE INDEX idx_network_subscriptions_bank_ref ON public.network_subscriptions(bank_transfer_reference);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_network_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER network_subscriptions_updated_at
  BEFORE UPDATE ON public.network_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_network_subscriptions_updated_at();
