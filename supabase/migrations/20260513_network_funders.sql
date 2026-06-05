-- ============================================================
-- Fundia Network — Table des financeurs
-- ============================================================

CREATE TABLE public.network_funders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identité
  name TEXT NOT NULL,                          -- Prénom + Nom ou nom de société
  company TEXT,                                -- Société (optionnel)
  avatar_initials TEXT NOT NULL DEFAULT 'FN', -- Ex: "ML", "AB"
  bio TEXT,                                    -- Description courte

  -- Type et spécialités
  funder_type TEXT NOT NULL CHECK (funder_type IN ('private_lender', 'investor', 'business_angel', 'fund', 'partner')),
  specialties TEXT[] NOT NULL DEFAULT '{}',   -- ['real_estate', 'startup', 'personal', ...]

  -- Zone et ticket
  region TEXT NOT NULL DEFAULT 'France entière',
  ticket_min NUMERIC(12,2) NOT NULL DEFAULT 1000,
  ticket_max NUMERIC(12,2) NOT NULL DEFAULT 100000,

  -- Disponibilité et performance
  availability TEXT NOT NULL DEFAULT 'active' CHECK (availability IN ('active', 'busy', 'paused')),
  response_rate INTEGER DEFAULT 85,           -- % de réponse (0-100)
  avg_response_hours INTEGER DEFAULT 48,      -- Délai moyen de réponse en heures

  -- Badges
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_top_responder BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,

  -- Contact (visible uniquement aux membres premium)
  contact_email TEXT,
  contact_phone TEXT,
  contact_website TEXT,

  -- Visibilité
  is_active BOOLEAN NOT NULL DEFAULT true,    -- Affiché dans l'explorateur
  sort_order INTEGER DEFAULT 0,               -- Ordre d'affichage

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.network_funders ENABLE ROW LEVEL SECURITY;

-- Membres premium (abonnement actif) peuvent voir les financeurs actifs
CREATE POLICY "Premium members can view active funders"
  ON public.network_funders FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.network_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Admins voient tout
CREATE POLICY "Admins can view all funders"
  ON public.network_funders FOR SELECT
  USING (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins can insert funders"
  ON public.network_funders FOR INSERT
  WITH CHECK (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins can update funders"
  ON public.network_funders FOR UPDATE
  USING (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins can delete funders"
  ON public.network_funders FOR DELETE
  USING (has_admin_or_manager_role(auth.uid()));

-- Index
CREATE INDEX idx_network_funders_type ON public.network_funders(funder_type);
CREATE INDEX idx_network_funders_active ON public.network_funders(is_active);
CREATE INDEX idx_network_funders_sort ON public.network_funders(sort_order);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_network_funders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER network_funders_updated_at
  BEFORE UPDATE ON public.network_funders
  FOR EACH ROW EXECUTE FUNCTION update_network_funders_updated_at();

-- ============================================================
-- Table des demandes de contact (mise en relation)
-- ============================================================

CREATE TABLE public.network_contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  funder_id UUID NOT NULL REFERENCES public.network_funders(id) ON DELETE CASCADE,

  -- Contenu de la demande
  project_type TEXT NOT NULL,       -- Type de projet
  amount_needed NUMERIC(12,2),      -- Montant recherché
  duration_months INTEGER,          -- Durée souhaitée
  message TEXT NOT NULL,            -- Message personnalisé

  -- Statut
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'replied', 'closed')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.network_contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contact requests"
  ON public.network_contact_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert contact requests"
  ON public.network_contact_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.network_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

CREATE POLICY "Admins can view all contact requests"
  ON public.network_contact_requests FOR SELECT
  USING (has_admin_or_manager_role(auth.uid()));

CREATE POLICY "Admins can update contact requests"
  ON public.network_contact_requests FOR UPDATE
  USING (has_admin_or_manager_role(auth.uid()));

-- Index
CREATE INDEX idx_network_contact_requests_user ON public.network_contact_requests(user_id);
CREATE INDEX idx_network_contact_requests_funder ON public.network_contact_requests(funder_id);
CREATE INDEX idx_network_contact_requests_status ON public.network_contact_requests(status);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_network_contact_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER network_contact_requests_updated_at
  BEFORE UPDATE ON public.network_contact_requests
  FOR EACH ROW EXECUTE FUNCTION update_network_contact_requests_updated_at();

-- ============================================================
-- Données de démo (quelques financeurs pour commencer)
-- ============================================================

INSERT INTO public.network_funders (name, company, avatar_initials, bio, funder_type, specialties, region, ticket_min, ticket_max, availability, response_rate, avg_response_hours, is_verified, is_top_responder, is_new, sort_order) VALUES
('Marc Laurent', NULL, 'ML', 'Prêteur privé actif depuis 2018, spécialisé dans les projets immobiliers et les prêts personnels en Île-de-France. Étude rapide des dossiers sérieux.', 'private_lender', ARRAY['real_estate', 'personal'], 'Île-de-France', 5000, 150000, 'active', 92, 24, true, false, false, 1),
('Amina Benali', 'AB Capital', 'AB', 'Business Angel et investisseuse en capital, je finance des startups et projets professionnels avec fort potentiel de croissance.', 'business_angel', ARRAY['startup', 'professional'], 'Auvergne-Rhône-Alpes', 20000, 500000, 'active', 88, 48, true, true, false, 2),
('Fonds Vert Horizon', NULL, 'FV', 'Fonds spécialisé dans le financement de projets à impact environnemental et projets professionnels durables.', 'fund', ARRAY['green', 'professional'], 'France entière', 10000, 300000, 'active', 95, 36, true, false, false, 3),
('Pierre Moreau', NULL, 'PM', 'Investisseur particulier, je finance des projets immobiliers et automobiles dans le Sud de la France.', 'investor', ARRAY['real_estate', 'auto'], 'Provence-Alpes-Côte d''Azur', 8000, 200000, 'active', 80, 72, true, false, false, 4),
('Claire Dubois', 'CD Invest', 'CD', 'Prêteuse privée spécialisée dans les prêts personnels et crédits travaux pour les particuliers.', 'private_lender', ARRAY['personal', 'real_estate'], 'Bretagne', 3000, 50000, 'active', 90, 48, true, false, true, 5),
('Nexus Financement', NULL, 'NX', 'Partenaire financier spécialisé dans le financement des PME et startups technologiques à fort potentiel.', 'partner', ARRAY['startup', 'professional'], 'France entière', 50000, 1000000, 'active', 97, 24, true, true, false, 6);
