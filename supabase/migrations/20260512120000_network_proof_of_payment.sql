-- Ajouter la colonne preuve de paiement à network_subscriptions
ALTER TABLE public.network_subscriptions
  ADD COLUMN IF NOT EXISTS proof_of_payment_path TEXT,
  ADD COLUMN IF NOT EXISTS proof_of_payment_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Politique : l'utilisateur peut mettre à jour sa propre preuve de paiement
CREATE POLICY "Users can update their own subscription proof"
  ON public.network_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bucket storage pour les preuves de paiement (à créer dans Supabase Dashboard)
-- Nom du bucket : network-payment-proofs
-- Accès : privé (authenticated only)
