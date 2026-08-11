import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Network, CreditCard, Building2, Save, Loader2, AlertCircle, CheckCircle, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PendingSubscription {
  id: string;
  user_id: string;
  amount: number;
  bank_transfer_reference: string | null;
  proof_of_payment_path: string | null;
  proof_of_payment_uploaded_at: string | null;
  created_at: string;
}

interface PaymentSettings {
  card_enabled: boolean;
  bank_transfer_enabled: boolean;
  bank_iban: string;
  bank_bic: string;
  bank_beneficiary: string;
  bank_bank_name: string;
  price: number;
}

const DEFAULT_SETTINGS: PaymentSettings = {
  card_enabled: true,
  bank_transfer_enabled: true,
  bank_iban: '',
  bank_bic: '',
  bank_beneficiary: 'HEDGE FUNDS INVESTMENT MANAGEMENT LIMITED',
  bank_bank_name: '',
  price: 19.90,
};

const STORAGE_KEY = 'admin_network_payment_settings';

export function NetworkPaymentSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingSubs, setPendingSubs] = useState<PendingSubscription[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch { /* ignore */ }
    }
    fetchPendingTransfers();
  }, []);

  const fetchPendingTransfers = async () => {
    const { data, count } = await supabase
      .from('network_subscriptions')
      .select('id, user_id, amount, bank_transfer_reference, proof_of_payment_path, proof_of_payment_uploaded_at, created_at', { count: 'exact' })
      .eq('status', 'pending')
      .eq('payment_method', 'bank_transfer')
      .order('created_at', { ascending: false });
    setPendingCount(count ?? 0);
    setPendingSubs(data ?? []);
  };

  const handleConfirmPayment = async (subId: string) => {
    setConfirmingId(subId);
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { error } = await supabase
        .from('network_subscriptions')
        .update({
          status: 'active',
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          bank_transfer_confirmed_at: now.toISOString(),
        })
        .eq('id', subId);

      if (error) throw error;
      toast.success('Abonnement activé. L\'utilisateur a maintenant accès au réseau.');
      fetchPendingTransfers();
    } catch {
      toast.error('Erreur lors de la confirmation.');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleViewProof = async (path: string) => {
    const { data } = await supabase.storage
      .from('network-payment-proofs')
      .createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    else toast.error('Impossible d\'ouvrir le fichier.');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success('Paramètres de paiement sauvegardés.');
    } catch {
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  const update = <K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Status overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="h-5 w-5 text-accent" />
            Fundia Network — Paiement
          </CardTitle>
          <CardDescription>
            Activez ou désactivez les modes de paiement disponibles sur la page d'abonnement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Virements en attente de confirmation</div>
              {pendingCount > 0 && (
                <Badge variant="outline" className="mt-2 text-[10px] border-accent/30 text-accent">
                  Action requise
                </Badge>
              )}
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <div className={`text-2xl font-bold ${settings.card_enabled ? 'text-success' : 'text-muted-foreground'}`}>
                {settings.card_enabled ? 'Actif' : 'Inactif'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Paiement par carte</div>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <div className={`text-2xl font-bold ${settings.bank_transfer_enabled ? 'text-success' : 'text-muted-foreground'}`}>
                {settings.bank_transfer_enabled ? 'Actif' : 'Inactif'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Virement bancaire</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Virements en attente */}
      {pendingSubs.length > 0 && (
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent" />
              Virements en attente de confirmation
              <Badge className="bg-accent text-accent-foreground ml-1">{pendingSubs.length}</Badge>
            </CardTitle>
            <CardDescription>
              Vérifiez la réception du virement et confirmez pour activer l'accès de l'utilisateur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingSubs.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <code className="font-bold text-foreground">{s.bank_transfer_reference ?? '—'}</code>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{s.amount.toFixed(2)} €</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {s.proof_of_payment_path ? (
                    <div className="flex items-center gap-1.5 text-xs text-success">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Preuve uploadée le {new Date(s.proof_of_payment_uploaded_at!).toLocaleDateString('fr-FR')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Aucune preuve uploadée
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.proof_of_payment_path && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleViewProof(s.proof_of_payment_path!)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Voir
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleConfirmPayment(s.id)}
                    disabled={confirmingId === s.id}
                  >
                    {confirmingId === s.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <CheckCircle className="h-3.5 w-3.5" />
                    }
                    Confirmer le paiement
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Prix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tarification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-2">
            <Label>Prix annuel (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={settings.price}
              onChange={e => update('price', parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Affiché sur la landing page et la page de paiement.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Carte bancaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Paiement par carte (Stripe)
            </div>
            <Switch
              checked={settings.card_enabled}
              onCheckedChange={v => update('card_enabled', v)}
            />
          </CardTitle>
          <CardDescription>
            Redirige l'utilisateur vers une session Stripe Checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.card_enabled ? (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              Mode CB activé — le bouton "Payer par carte" est visible sur la page de paiement.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Mode CB désactivé — l'option carte n'apparaît pas pour les utilisateurs.
            </div>
          )}
          <div className="mt-4 rounded-lg bg-muted/40 border border-border p-3 text-xs text-muted-foreground space-y-1">
            <p><strong>Intégration Stripe :</strong> ajoutez <code>VITE_STRIPE_PUBLIC_KEY</code> dans votre fichier <code>.env</code> pour activer les paiements CB.</p>
            <p>La clé secrète Stripe doit être configurée dans les Edge Functions Supabase.</p>
          </div>
        </CardContent>
      </Card>

      {/* Virement bancaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Virement bancaire
            </div>
            <Switch
              checked={settings.bank_transfer_enabled}
              onCheckedChange={v => update('bank_transfer_enabled', v)}
            />
          </CardTitle>
          <CardDescription>
            Affiche les coordonnées bancaires et génère une référence unique par utilisateur.
            L'accès est activé immédiatement. Le virement sert à régulariser le paiement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings.bank_transfer_enabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              Mode virement désactivé — l'option n'apparaît pas pour les utilisateurs.
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bénéficiaire</Label>
              <Input
                value={settings.bank_beneficiary}
                onChange={e => update('bank_beneficiary', e.target.value)}
                placeholder="HEDGE FUNDS INVESTMENT MANAGEMENT LIMITED"
                disabled={!settings.bank_transfer_enabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom de la banque</Label>
              <Input
                value={settings.bank_bank_name}
                onChange={e => update('bank_bank_name', e.target.value)}
                placeholder="Nom de votre banque"
                disabled={!settings.bank_transfer_enabled}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>IBAN</Label>
              <Input
                value={settings.bank_iban}
                onChange={e => update('bank_iban', e.target.value)}
                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                className="font-mono"
                disabled={!settings.bank_transfer_enabled}
              />
            </div>
            <div className="space-y-2">
              <Label>BIC / SWIFT</Label>
              <Input
                value={settings.bank_bic}
                onChange={e => update('bank_bic', e.target.value)}
                placeholder="XXXXXXXX"
                className="font-mono"
                disabled={!settings.bank_transfer_enabled}
              />
            </div>
          </div>

          {settings.bank_transfer_enabled && (
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs text-muted-foreground">
              <p>L'accès utilisateur est activé <strong>immédiatement</strong> à la confirmation. Le virement apparaît dans la liste des abonnements avec la référence unique pour vérification a posteriori.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
}
