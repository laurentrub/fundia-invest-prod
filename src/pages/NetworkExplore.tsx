import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Network, Search, MapPin, Euro, Clock, BadgeCheck,
  Star, Zap, Users, TrendingUp, Building2, ArrowRight,
  Loader2, Filter, SlidersHorizontal,
} from "lucide-react";

interface Funder {
  id: string;
  name: string;
  company: string | null;
  avatar_initials: string;
  bio: string | null;
  funder_type: string;
  specialties: string[];
  region: string;
  ticket_min: number;
  ticket_max: number;
  availability: string;
  response_rate: number;
  avg_response_hours: number;
  is_verified: boolean;
  is_top_responder: boolean;
  is_new: boolean;
}

const FUNDER_TYPE_LABELS: Record<string, string> = {
  private_lender: 'Prêteur Privé',
  investor: 'Investisseur',
  business_angel: 'Business Angel',
  fund: 'Fonds Spécialisé',
  partner: 'Partenaire Financier',
};

const SPECIALTY_LABELS: Record<string, string> = {
  real_estate: 'Immobilier',
  startup: 'Startup',
  personal: 'Personnel',
  professional: 'Professionnel',
  auto: 'Auto',
  green: 'Projet écologique',
};

const AVAILABILITY_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  busy: 'bg-accent/10 text-accent border-accent/20',
  paused: 'bg-muted text-muted-foreground border-border',
};

const AVAILABILITY_LABELS: Record<string, string> = {
  active: 'Actif',
  busy: 'Chargé',
  paused: 'En pause',
};

const TYPE_ICONS: Record<string, typeof Users> = {
  private_lender: Users,
  investor: TrendingUp,
  business_angel: Star,
  fund: Building2,
  partner: Zap,
};

export default function NetworkExplore() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [funders, setFunders] = useState<Funder[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth?redirect=/network/explore');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) checkAccessAndLoad();
  }, [user]);

  const checkAccessAndLoad = async () => {
    // Vérifier l'abonnement actif
    const { data: sub } = await supabase
      .from('network_subscriptions')
      .select('id, status')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!sub) {
      // Vérifier si pending
      const { data: pending } = await supabase
        .from('network_subscriptions')
        .select('id, status')
        .eq('user_id', user!.id)
        .eq('status', 'pending')
        .maybeSingle();

      setHasAccess(false);
      setLoading(false);
      if (pending) navigate('/network/dashboard');
      else navigate('/network/checkout');
      return;
    }

    setHasAccess(true);
    fetchFunders();
  };

  const fetchFunders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('network_funders')
      .select('id, name, company, avatar_initials, bio, funder_type, specialties, region, ticket_min, ticket_max, availability, response_rate, avg_response_hours, is_verified, is_top_responder, is_new')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) toast.error('Erreur de chargement du réseau.');
    else setFunders(data ?? []);
    setLoading(false);
  };

  const filtered = funders.filter(f => {
    const matchSearch = search === '' ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      f.region.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || f.funder_type === typeFilter;
    const matchSpecialty = specialtyFilter === 'all' || f.specialties.includes(specialtyFilter);
    const matchAvailability = availabilityFilter === 'all' || f.availability === availabilityFilter;
    return matchSearch && matchType && matchSpecialty && matchAvailability;
  });

  if (authLoading || loading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-10 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Network className="h-5 w-5 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Fundia Network</h1>
            <Badge variant="outline" className="border-success/40 text-success bg-success/5 text-xs">Accès actif</Badge>
          </div>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{funders.length}</span> financeurs qualifiés dans le réseau.
            Utilisez les filtres pour trouver ceux qui correspondent à votre projet.
          </p>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un financeur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type de financeur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(FUNDER_TYPE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Spécialité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les spécialités</SelectItem>
              {Object.entries(SPECIALTY_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Disponibilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute disponibilité</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="busy">Chargé</SelectItem>
              <SelectItem value="paused">En pause</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Résultats */}
        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {filtered.length} financeur{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          {filtered.length !== funders.length && ` sur ${funders.length}`}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Filter className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="font-medium text-foreground">Aucun financeur ne correspond à vos filtres</p>
            <p className="text-sm text-muted-foreground">Essayez d'élargir vos critères de recherche.</p>
            <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter('all'); setSpecialtyFilter('all'); setAvailabilityFilter('all'); }}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(f => {
              const TypeIcon = TYPE_ICONS[f.funder_type] ?? Users;
              return (
                <Card key={f.id} className="hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                  <CardContent className="pt-5 pb-5 space-y-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                          {f.avatar_initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {f.name}
                            {f.is_verified && <BadgeCheck className="h-4 w-4 text-success" />}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <TypeIcon className="h-3 w-3" />
                            <span>{FUNDER_TYPE_LABELS[f.funder_type]}</span>
                            {f.company && <><span>·</span><span>{f.company}</span></>}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${AVAILABILITY_COLORS[f.availability]}`}>
                        {AVAILABILITY_LABELS[f.availability]}
                      </Badge>
                    </div>

                    {/* Bio */}
                    {f.bio && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{f.bio}</p>
                    )}

                    {/* Spécialités */}
                    <div className="flex flex-wrap gap-1.5">
                      {f.specialties.map(s => (
                        <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          {SPECIALTY_LABELS[s] ?? s}
                        </span>
                      ))}
                    </div>

                    {/* Infos */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{f.region}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>~{f.avg_response_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Euro className="h-3 w-3 flex-shrink-0" />
                        <span>{f.ticket_min.toLocaleString('fr-FR')} — {f.ticket_max.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>

                    {/* Badges spéciaux */}
                    {(f.is_top_responder || f.is_new) && (
                      <div className="flex gap-1.5">
                        {f.is_top_responder && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                            <Star className="h-2.5 w-2.5" />Top Répondeur
                          </span>
                        )}
                        {f.is_new && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Nouveau
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <Link to={`/network/explore/${f.id}`}>
                      <Button variant="accent" size="sm" className="w-full gap-2 group-hover:opacity-100">
                        Voir le profil & contacter
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
