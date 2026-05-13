import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Network, ArrowLeft, MapPin, Euro, Clock, BadgeCheck,
  Star, Users, TrendingUp, Building2, Zap, Mail, Phone,
  Globe, Send, Loader2, CheckCircle, AlertCircle,
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
  contact_email: string | null;
  contact_phone: string | null;
  contact_website: string | null;
}

const FUNDER_TYPE_LABELS: Record<string, string> = {
  private_lender: 'Prêteur Privé',
  investor: 'Investisseur',
  business_angel: 'Business Angel',
  fund: 'Fonds Spécialisé',
  partner: 'Partenaire Financier',
};

const SPECIALTY_LABELS: Record<string, string> = {
  real_estate: 'Immobilier', startup: 'Startup',
  personal: 'Personnel', professional: 'Professionnel',
  auto: 'Auto', green: 'Projet écologique',
};

const AVAILABILITY_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  busy: 'bg-accent/10 text-accent border-accent/20',
  paused: 'bg-muted text-muted-foreground border-border',
};

const AVAILABILITY_LABELS: Record<string, string> = {
  active: 'Actif — étudie les dossiers',
  busy: 'Chargé — délai plus long',
  paused: 'En pause temporaire',
};

const TYPE_ICONS: Record<string, typeof Users> = {
  private_lender: Users, investor: TrendingUp,
  business_angel: Star, fund: Building2, partner: Zap,
};

const PROJECT_TYPES = [
  'Achat immobilier', 'Travaux / rénovation', 'Prêt personnel',
  'Rachat de crédits', 'Crédit auto / véhicule', 'Création d\'entreprise',
  'Développement d\'entreprise', 'Startup / levée de fonds', 'Projet écologique', 'Autre',
];

export default function NetworkFunderProfile() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [funder, setFunder] = useState<Funder | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [alreadyContacted, setAlreadyContacted] = useState(false);

  // Formulaire de contact
  const [projectType, setProjectType] = useState('');
  const [amountNeeded, setAmountNeeded] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth?redirect=/network/explore');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) loadFunderAndCheck();
  }, [user, id]);

  const loadFunderAndCheck = async () => {
    setLoading(true);

    // Vérifier abonnement actif
    const { data: sub } = await supabase
      .from('network_subscriptions')
      .select('id')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!sub) { navigate('/network/dashboard'); return; }

    // Charger le financeur
    const { data: funderData, error } = await supabase
      .from('network_funders')
      .select('*')
      .eq('id', id!)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !funderData) { toast.error('Financeur introuvable.'); navigate('/network/explore'); return; }
    setFunder(funderData);

    // Vérifier si déjà contacté
    const { data: existingRequest } = await supabase
      .from('network_contact_requests')
      .select('id')
      .eq('user_id', user!.id)
      .eq('funder_id', id!)
      .maybeSingle();

    setAlreadyContacted(!!existingRequest);
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!projectType) { toast.error('Sélectionnez un type de projet.'); return; }
    if (message.trim().length < 30) { toast.error('Votre message doit faire au moins 30 caractères.'); return; }

    setSending(true);
    try {
      const { error } = await supabase.from('network_contact_requests').insert({
        user_id: user!.id,
        funder_id: funder!.id,
        project_type: projectType,
        amount_needed: amountNeeded ? parseFloat(amountNeeded) : null,
        duration_months: durationMonths ? parseInt(durationMonths) : null,
        message: message.trim(),
        status: 'sent',
      });
      if (error) throw error;
      setSent(true);
      toast.success('Votre demande a été envoyée !');
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!funder) return null;

  const TypeIcon = TYPE_ICONS[funder.funder_type] ?? Users;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <Link to="/network/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />Retour au réseau
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Gauche — Profil */}
          <div className="lg:col-span-3 space-y-6">

            {/* Identité */}
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                    {funder.avatar_initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-foreground">{funder.name}</h1>
                      {funder.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                          <BadgeCheck className="h-4 w-4" />Vérifié Fundia
                        </span>
                      )}
                    </div>
                    {funder.company && <p className="text-sm text-muted-foreground">{funder.company}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{FUNDER_TYPE_LABELS[funder.funder_type]}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`flex-shrink-0 text-xs ${AVAILABILITY_COLORS[funder.availability]}`}>
                    {AVAILABILITY_LABELS[funder.availability]}
                  </Badge>
                </div>

                {funder.bio && (
                  <p className="text-sm text-foreground leading-relaxed">{funder.bio}</p>
                )}

                {/* Spécialités */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Spécialités</p>
                  <div className="flex flex-wrap gap-2">
                    {funder.specialties.map(s => (
                      <span key={s} className="rounded-lg bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                        {SPECIALTY_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs text-muted-foreground">Zone</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{funder.region}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Euro className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs text-muted-foreground">Ticket</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {funder.ticket_min.toLocaleString('fr-FR')} — {funder.ticket_max.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs text-muted-foreground">Réponse moy.</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">~{funder.avg_response_hours}h</p>
                  </div>
                </div>

                {/* Badges */}
                {(funder.is_top_responder || funder.is_new) && (
                  <div className="flex gap-2">
                    {funder.is_top_responder && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
                        <Star className="h-3 w-3" />Top Répondeur — {funder.response_rate}% de réponse
                      </span>
                    )}
                    {funder.is_new && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                        Nouveau dans le réseau
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coordonnées */}
            {(funder.contact_email || funder.contact_phone || funder.contact_website) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Coordonnées directes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {funder.contact_email && (
                    <a href={`mailto:${funder.contact_email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-accent transition-colors">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {funder.contact_email}
                    </a>
                  )}
                  {funder.contact_phone && (
                    <a href={`tel:${funder.contact_phone}`} className="flex items-center gap-3 text-sm text-foreground hover:text-accent transition-colors">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {funder.contact_phone}
                    </a>
                  )}
                  {funder.contact_website && (
                    <a href={funder.contact_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-accent transition-colors">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {funder.contact_website}
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Droite — Formulaire de contact */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <Card className="border-accent/20">
                <div className="h-1 bg-gradient-accent rounded-t-lg" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="h-4 w-4 text-accent" />
                    Soumettre votre dossier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sent ? (
                    <div className="text-center space-y-4 py-4">
                      <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                        <CheckCircle className="h-7 w-7 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Demande envoyée !</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {funder.name} a reçu votre dossier. Réponse attendue sous ~{funder.avg_response_hours}h.
                        </p>
                      </div>
                      <Link to="/network/explore">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Network className="h-3.5 w-3.5" />Explorer d'autres financeurs
                        </Button>
                      </Link>
                    </div>
                  ) : alreadyContacted ? (
                    <div className="text-center space-y-3 py-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <CheckCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Vous avez déjà contacté ce financeur.</p>
                      <p className="text-xs text-muted-foreground">Suivez votre demande depuis votre tableau de bord.</p>
                      <Link to="/network/dashboard">
                        <Button variant="outline" size="sm">Voir mes demandes</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Type de projet <span className="text-destructive">*</span></Label>
                        <Select value={projectType} onValueChange={setProjectType}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Sélectionnez..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PROJECT_TYPES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Montant (€)</Label>
                          <Input
                            type="number"
                            placeholder="Ex: 50000"
                            value={amountNeeded}
                            onChange={e => setAmountNeeded(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Durée (mois)</Label>
                          <Input
                            type="number"
                            placeholder="Ex: 60"
                            value={durationMonths}
                            onChange={e => setDurationMonths(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Votre message <span className="text-destructive">*</span></Label>
                        <Textarea
                          placeholder="Présentez votre projet, votre situation et ce que vous recherchez. Soyez précis et honnête — les financeurs apprécient les dossiers clairs."
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          rows={5}
                          className="text-sm resize-none"
                        />
                        <p className={`text-[11px] ${message.length < 30 ? 'text-muted-foreground' : 'text-success'}`}>
                          {message.length} / 30 caractères minimum
                        </p>
                      </div>

                      <Button
                        variant="accent"
                        size="sm"
                        className="w-full gap-2"
                        onClick={handleSendRequest}
                        disabled={sending || !projectType || message.trim().length < 30}
                      >
                        {sending
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Send className="h-4 w-4" />
                        }
                        Envoyer ma demande
                      </Button>

                      <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <p>Fundia Network ne garantit pas de réponse ni de financement. La décision appartient au financeur.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
