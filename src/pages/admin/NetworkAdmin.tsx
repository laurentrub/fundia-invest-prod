import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Network, Plus, Pencil, Trash2, Loader2, BadgeCheck,
  Users, TrendingUp, Building2, Zap, Star, Eye, EyeOff,
  CheckCircle, Clock, XCircle, CreditCard, Banknote, ExternalLink,
} from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  payment_method: string;
  amount: number;
  bank_transfer_reference: string | null;
  proof_of_payment_path: string | null;
  proof_of_payment_uploaded_at: string | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
}

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
  is_active: boolean;
  sort_order: number;
}

const EMPTY_FUNDER: Omit<Funder, 'id'> = {
  name: '', company: null, avatar_initials: '', bio: null,
  funder_type: 'private_lender', specialties: [],
  region: 'France entière', ticket_min: 5000, ticket_max: 100000,
  availability: 'active', response_rate: 85, avg_response_hours: 48,
  is_verified: true, is_top_responder: false, is_new: false,
  contact_email: null, contact_phone: null, contact_website: null,
  is_active: true, sort_order: 0,
};

const FUNDER_TYPES = [
  { value: 'private_lender', label: 'Prêteur Privé' },
  { value: 'investor', label: 'Investisseur' },
  { value: 'business_angel', label: 'Business Angel' },
  { value: 'fund', label: 'Fonds Spécialisé' },
  { value: 'partner', label: 'Partenaire Financier' },
];

const SPECIALTIES_OPTIONS = [
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'startup', label: 'Startup' },
  { value: 'personal', label: 'Personnel' },
  { value: 'professional', label: 'Professionnel' },
  { value: 'auto', label: 'Auto' },
  { value: 'green', label: 'Projet écologique' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'active', label: 'Actif' },
  { value: 'busy', label: 'Chargé' },
  { value: 'paused', label: 'En pause' },
];

const availabilityColor: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  busy: 'bg-accent/10 text-accent border-accent/20',
  paused: 'bg-muted text-muted-foreground border-border',
};

const typeIcon: Record<string, typeof Users> = {
  private_lender: Users,
  investor: TrendingUp,
  business_angel: Star,
  fund: Building2,
  partner: Zap,
};

export default function NetworkAdmin() {
  const [funders, setFunders] = useState<Funder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFunder, setEditingFunder] = useState<Funder | null>(null);
  const [form, setForm] = useState<Omit<Funder, 'id'>>(EMPTY_FUNDER);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [specialtiesInput, setSpecialtiesInput] = useState('');

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => { fetchFunders(); fetchSubscriptions(); }, []);

  const fetchFunders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('network_funders')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) toast.error('Erreur de chargement');
    else setFunders(data ?? []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingFunder(null);
    setForm(EMPTY_FUNDER);
    setSpecialtiesInput('');
    setDialogOpen(true);
  };

  const openEdit = (f: Funder) => {
    setEditingFunder(f);
    setForm({ ...f });
    setSpecialtiesInput(f.specialties.join(', '));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.avatar_initials.trim()) {
      toast.error('Nom et initiales sont requis.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        specialties: specialtiesInput
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };

      if (editingFunder) {
        const { error } = await supabase
          .from('network_funders')
          .update(payload)
          .eq('id', editingFunder.id);
        if (error) throw error;
        toast.success('Financeur mis à jour.');
      } else {
        const { error } = await supabase
          .from('network_funders')
          .insert(payload);
        if (error) throw error;
        toast.success('Financeur ajouté au réseau.');
      }
      setDialogOpen(false);
      fetchFunders();
    } catch {
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce financeur définitivement ?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('network_funders').delete().eq('id', id);
    if (error) toast.error('Erreur lors de la suppression.');
    else { toast.success('Financeur supprimé.'); fetchFunders(); }
    setDeletingId(null);
  };

  const toggleActive = async (f: Funder) => {
    await supabase.from('network_funders').update({ is_active: !f.is_active }).eq('id', f.id);
    fetchFunders();
  };

  const upd = <K extends keyof Omit<Funder, 'id'>>(k: K, v: Omit<Funder, 'id'>[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const fetchSubscriptions = async () => {
    setSubsLoading(true);
    const { data } = await supabase
      .from('network_subscriptions')
      .select('id, user_id, status, payment_method, amount, bank_transfer_reference, proof_of_payment_path, proof_of_payment_uploaded_at, started_at, expires_at, created_at')
      .order('created_at', { ascending: false });
    setSubscriptions(data ?? []);
    setSubsLoading(false);
  };

  const handleConfirm = async (subId: string) => {
    setConfirmingId(subId);
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      const { error } = await supabase
        .from('network_subscriptions')
        .update({ status: 'active', started_at: now.toISOString(), expires_at: expiresAt.toISOString(), bank_transfer_confirmed_at: now.toISOString() })
        .eq('id', subId);
      if (error) throw error;
      toast.success('Abonnement activé.');
      fetchSubscriptions();
    } catch {
      toast.error('Erreur lors de la confirmation.');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleViewProof = async (path: string) => {
    const { data } = await supabase.storage.from('network-payment-proofs').createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    else toast.error('Impossible d\'ouvrir la preuve.');
  };

  const activeCount = funders.filter(f => f.is_active).length;

  const pendingSubs = subscriptions.filter(s => s.status === 'pending');
  const activeSubs = subscriptions.filter(s => s.status === 'active');

  const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
    pending: { label: 'En attente', className: 'bg-accent/10 text-accent border-accent/20', icon: Clock },
    active: { label: 'Actif', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
    expired: { label: 'Expiré', className: 'bg-muted text-muted-foreground border-border', icon: XCircle },
    cancelled: { label: 'Annulé', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  };

  const SubRow = ({ sub }: { sub: Subscription }) => {
    const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
      <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${cfg.className}`}>
              <Icon className="h-3 w-3 mr-1" />{cfg.label}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              {sub.payment_method === 'bank_transfer' ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
              {sub.payment_method === 'bank_transfer' ? 'Virement' : 'Carte'}
            </Badge>
            <span className="text-xs font-medium text-foreground">{sub.amount.toFixed(2)} €</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <div>ID utilisateur : <span className="font-mono">{sub.user_id.slice(0, 8)}…</span></div>
            {sub.bank_transfer_reference && <div>Réf. virement : <span className="font-mono font-medium">{sub.bank_transfer_reference}</span></div>}
            <div>Inscrit le {new Date(sub.created_at).toLocaleDateString('fr-FR')}{sub.expires_at ? ` · Expire le ${new Date(sub.expires_at).toLocaleDateString('fr-FR')}` : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {sub.proof_of_payment_path && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleViewProof(sub.proof_of_payment_path!)}>
              <ExternalLink className="h-3.5 w-3.5" />Preuve
            </Button>
          )}
          {sub.status === 'pending' && (
            <Button size="sm" className="gap-1.5 text-xs" disabled={confirmingId === sub.id} onClick={() => handleConfirm(sub.id)}>
              {confirmingId === sub.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              Confirmer
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-accent" />
            Fundia Network — Financeurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les financeurs du réseau. <span className="font-medium text-foreground">{activeCount}</span> actifs sur <span className="font-medium text-foreground">{funders.length}</span> au total.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un financeur
        </Button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : funders.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium text-foreground mb-2">Aucun financeur dans le réseau</p>
            <p className="text-sm text-muted-foreground mb-4">Commencez par ajouter votre premier financeur.</p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />Ajouter un financeur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {funders.map(f => {
            const TypeIcon = typeIcon[f.funder_type] ?? Users;
            return (
              <Card key={f.id} className={!f.is_active ? 'opacity-50' : ''}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                      {f.avatar_initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{f.name}</span>
                        {f.company && <span className="text-sm text-muted-foreground">· {f.company}</span>}
                        {f.is_verified && <BadgeCheck className="h-4 w-4 text-success" />}
                        {f.is_top_responder && <Star className="h-4 w-4 text-accent" />}
                        {f.is_new && <Badge variant="outline" className="text-[10px] px-1.5">Nouveau</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><TypeIcon className="h-3 w-3" />{FUNDER_TYPES.find(t => t.value === f.funder_type)?.label}</span>
                        <span>· {f.region}</span>
                        <span>· {f.ticket_min.toLocaleString('fr-FR')} — {f.ticket_max.toLocaleString('fr-FR')} €</span>
                        <span>· {f.response_rate}% réponse</span>
                      </div>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {f.specialties.map(s => (
                          <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                            {SPECIALTIES_OPTIONS.find(o => o.value === s)?.label ?? s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Badges & actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className={`text-xs ${availabilityColor[f.availability]}`}>
                        {AVAILABILITY_OPTIONS.find(a => a.value === f.availability)?.label}
                      </Badge>
                      <button
                        onClick={() => toggleActive(f)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title={f.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {f.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(f)} className="gap-1.5">
                        <Pencil className="h-3.5 w-3.5" />Modifier
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => handleDelete(f.id)}
                        disabled={deletingId === f.id}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        {deletingId === f.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Section Abonnements */}
      <Separator />
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-accent" />
          Abonnements
          {pendingSubs.length > 0 && (
            <Badge className="bg-accent text-accent-foreground text-xs">{pendingSubs.length} en attente</Badge>
          )}
        </h2>

        {subsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : subscriptions.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">Aucun abonnement pour le moment.</CardContent></Card>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Virements en attente
                {pendingSubs.length > 0 && <span className="ml-1.5 bg-accent text-accent-foreground text-[10px] rounded-full px-1.5 py-0.5">{pendingSubs.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="active">Actifs ({activeSubs.length})</TabsTrigger>
              <TabsTrigger value="all">Tous ({subscriptions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card><CardContent className="pt-4 pb-2">
                {pendingSubs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucun virement en attente.</p>
                ) : pendingSubs.map(sub => <SubRow key={sub.id} sub={sub} />)}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="active">
              <Card><CardContent className="pt-4 pb-2">
                {activeSubs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucun abonnement actif.</p>
                ) : activeSubs.map(sub => <SubRow key={sub.id} sub={sub} />)}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="all">
              <Card><CardContent className="pt-4 pb-2">
                {subscriptions.map(sub => <SubRow key={sub.id} sub={sub} />)}
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFunder ? 'Modifier le financeur' : 'Ajouter un financeur'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Identité */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom complet <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Prénom Nom ou Société" />
              </div>
              <div className="space-y-2">
                <Label>Initiales <span className="text-destructive">*</span></Label>
                <Input value={form.avatar_initials} onChange={e => upd('avatar_initials', e.target.value.toUpperCase().slice(0, 2))} placeholder="ML" maxLength={2} className="font-bold" />
              </div>
              <div className="space-y-2">
                <Label>Société (optionnel)</Label>
                <Input value={form.company ?? ''} onChange={e => upd('company', e.target.value || null)} placeholder="Nom de la société" />
              </div>
              <div className="space-y-2">
                <Label>Type de financeur</Label>
                <Select value={form.funder_type} onValueChange={v => upd('funder_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FUNDER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Biographie</Label>
              <Textarea value={form.bio ?? ''} onChange={e => upd('bio', e.target.value || null)} placeholder="Description courte du financeur..." rows={3} />
            </div>

            {/* Spécialités */}
            <div className="space-y-2">
              <Label>Spécialités (séparées par des virgules)</Label>
              <Input
                value={specialtiesInput}
                onChange={e => setSpecialtiesInput(e.target.value)}
                placeholder="real_estate, startup, personal..."
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {SPECIALTIES_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      const current = specialtiesInput.split(',').map(s => s.trim()).filter(Boolean);
                      if (current.includes(o.value)) {
                        setSpecialtiesInput(current.filter(s => s !== o.value).join(', '));
                      } else {
                        setSpecialtiesInput([...current, o.value].join(', '));
                      }
                    }}
                    className={`rounded-md px-2 py-1 text-xs border transition-colors ${
                      specialtiesInput.includes(o.value)
                        ? 'bg-accent/15 border-accent/40 text-accent font-medium'
                        : 'bg-muted border-border text-muted-foreground hover:border-accent/30'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone et ticket */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                <Label>Région</Label>
                <Input value={form.region} onChange={e => upd('region', e.target.value)} placeholder="France entière" />
              </div>
              <div className="space-y-2">
                <Label>Ticket min (€)</Label>
                <Input type="number" value={form.ticket_min} onChange={e => upd('ticket_min', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Ticket max (€)</Label>
                <Input type="number" value={form.ticket_max} onChange={e => upd('ticket_max', parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            {/* Disponibilité et performance */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Disponibilité</Label>
                <Select value={form.availability} onValueChange={v => upd('availability', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Taux de réponse (%)</Label>
                <Input type="number" min={0} max={100} value={form.response_rate} onChange={e => upd('response_rate', parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Délai moyen (heures)</Label>
                <Input type="number" min={1} value={form.avg_response_hours} onChange={e => upd('avg_response_hours', parseInt(e.target.value) || 24)} />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Email de contact</Label>
                <Input type="email" value={form.contact_email ?? ''} onChange={e => upd('contact_email', e.target.value || null)} placeholder="contact@exemple.com" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={form.contact_phone ?? ''} onChange={e => upd('contact_phone', e.target.value || null)} placeholder="+33 6 00 00 00 00" />
              </div>
              <div className="space-y-2">
                <Label>Site web</Label>
                <Input value={form.contact_website ?? ''} onChange={e => upd('contact_website', e.target.value || null)} placeholder="https://..." />
              </div>
            </div>

            {/* Badges et visibilité */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: 'is_verified', label: 'Vérifié Fundia' },
                { key: 'is_top_responder', label: 'Top Répondeur' },
                { key: 'is_new', label: 'Nouveau' },
                { key: 'is_active', label: 'Visible' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <Label className="text-sm cursor-pointer">{label}</Label>
                  <Switch
                    checked={form[key as keyof typeof form] as boolean}
                    onCheckedChange={v => upd(key as keyof Omit<Funder, 'id'>, v as never)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Ordre d'affichage</Label>
              <Input type="number" value={form.sort_order} onChange={e => upd('sort_order', parseInt(e.target.value) || 0)} className="w-32" />
              <p className="text-xs text-muted-foreground">Les financeurs sont affichés par ordre croissant.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingFunder ? 'Sauvegarder les modifications' : 'Ajouter au réseau'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
