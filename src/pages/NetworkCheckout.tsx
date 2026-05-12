import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Network,
  CheckCircle,
  CreditCard,
  Building2,
  Shield,
  Lock,
  Copy,
  ArrowLeft,
  Loader2,
  Star,
  AlertCircle,
} from "lucide-react";

type PaymentMethod = "card" | "bank_transfer";

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
  bank_iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
  bank_bic: "XXXXXXXX",
  bank_beneficiary: "Fundia Invest SAS",
  bank_bank_name: "Banque de l'Entreprise",
  price: 19.90,
};

const FEATURES = [
  "Accès illimité aux 240+ profils de financeurs",
  "Filtres avancés par spécialité et ticket",
  "Prise de contact directe et illimitée",
  "Suivi en temps réel de vos demandes",
  "Badge Membre Vérifié sur votre profil",
  "Support prioritaire Fundia",
];

function generateTransferReference(userId: string): string {
  const short = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `FN-${short}`;
}

export default function NetworkCheckout() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [transferRef, setTransferRef] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [existingSub, setExistingSub] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/network/checkout");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("admin_network_payment_settings");
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setTransferRef(generateTransferReference(user.id));
      checkExistingSubscription();
    }
  }, [user]);

  const checkExistingSubscription = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("network_subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (data) setExistingSub(true);
  };

  // Auto-select if only one method enabled
  useEffect(() => {
    if (settings.card_enabled && !settings.bank_transfer_enabled) {
      setSelectedMethod("card");
    } else if (!settings.card_enabled && settings.bank_transfer_enabled) {
      setSelectedMethod("bank_transfer");
    }
  }, [settings]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCardPayment = async () => {
    setSubmitting(true);
    try {
      // Créer l'entrée en BDD en statut pending
      const { error } = await supabase.from("network_subscriptions").insert({
        user_id: user!.id,
        status: "pending",
        payment_method: "card",
        amount: settings.price,
        currency: "EUR",
      });
      if (error) throw error;

      // TODO: Rediriger vers Stripe Checkout quand les clés seront configurées
      // Pour l'instant : message informatif
      toast.info("Paiement par CB — Stripe sera intégré prochainement. Utilisez le virement en attendant.");
    } catch (err: any) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankTransfer = async () => {
    setSubmitting(true);
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { error } = await supabase.from("network_subscriptions").insert({
        user_id: user!.id,
        status: "active",
        payment_method: "bank_transfer",
        amount: settings.price,
        currency: "EUR",
        bank_transfer_reference: transferRef,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        bank_transfer_confirmed_at: now.toISOString(),
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Votre accès Fundia Network est activé !");
    } catch (err: any) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Abonnement déjà actif
  if (existingSub) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Votre accès Fundia Network est actif</h1>
          <p className="text-muted-foreground">Vous avez déjà un abonnement actif. Accédez directement au réseau.</p>
          <Link to="/network/explore">
            <Button variant="accent" size="lg" className="gap-2">
              <Network className="h-4 w-4" />
              Explorer le réseau
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Confirmation après virement
  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Accès activé — Bienvenue dans Fundia Network !</h1>
          <p className="text-muted-foreground leading-relaxed">
            Votre accès est <strong>immédiatement actif</strong>. Effectuez votre virement avec la référence ci-dessous pour régulariser votre paiement.
          </p>
          <Card className="text-left border-accent/30">
            <CardContent className="pt-6 space-y-3">
              {[
                { label: "Bénéficiaire", value: settings.bank_beneficiary, key: "beneficiary" },
                { label: "IBAN", value: settings.bank_iban, key: "iban" },
                { label: "BIC / SWIFT", value: settings.bank_bic, key: "bic" },
                { label: "Montant", value: `${settings.price.toFixed(2)} €`, key: "amount" },
                { label: "Référence obligatoire", value: transferRef, key: "ref", highlight: true },
              ].map(({ label, value, key, highlight }) => (
                <div key={key} className={`flex items-center justify-between gap-4 ${highlight ? "rounded-lg bg-accent/10 border border-accent/20 px-3 py-2" : ""}`}>
                  <span className={`text-sm ${highlight ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${highlight ? "font-bold text-accent" : "text-foreground"}`}>{value}</span>
                    <button onClick={() => handleCopy(value, key)} className="text-muted-foreground hover:text-foreground">
                      {copied === key ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Link to="/network/explore">
            <Button variant="accent" size="lg" className="gap-2 w-full">
              <Network className="h-4 w-4" />
              Explorer le réseau maintenant
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const bothEnabled = settings.card_enabled && settings.bank_transfer_enabled;
  const noneEnabled = !settings.card_enabled && !settings.bank_transfer_enabled;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back link */}
        <Link to="/network" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à Fundia Network
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Payment form */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Finaliser votre abonnement</h1>
              <p className="text-muted-foreground">Choisissez votre mode de paiement pour accéder à Fundia Network.</p>
            </div>

            {noneEnabled && (
              <Card className="border-destructive/30">
                <CardContent className="pt-6 flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">Les paiements sont temporairement indisponibles. Veuillez réessayer ultérieurement.</p>
                </CardContent>
              </Card>
            )}

            {!noneEnabled && (
              <>
                {/* Method selector */}
                {bothEnabled && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Mode de paiement</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("card")}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          selectedMethod === "card"
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/40"
                        }`}
                      >
                        <CreditCard className={`h-6 w-6 ${selectedMethod === "card" ? "text-accent" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium text-foreground">Carte bancaire</span>
                        <span className="text-xs text-muted-foreground">Accès immédiat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod("bank_transfer")}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          selectedMethod === "bank_transfer"
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/40"
                        }`}
                      >
                        <Building2 className={`h-6 w-6 ${selectedMethod === "bank_transfer" ? "text-accent" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium text-foreground">Virement bancaire</span>
                        <span className="text-xs text-muted-foreground">Accès immédiat</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Card payment */}
                {selectedMethod === "card" && settings.card_enabled && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="h-4 w-4 text-accent" />
                        Paiement par carte bancaire
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-muted/50 border border-border p-4 text-center space-y-2">
                        <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm font-medium text-foreground">Paiement sécurisé via Stripe</p>
                        <p className="text-xs text-muted-foreground">
                          Vous serez redirigé vers la page de paiement sécurisée Stripe.
                          Aucune donnée bancaire n'est stockée sur nos serveurs.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <span>Cryptage SSL 256 bits · Conforme PCI DSS · Paiement 3D Secure</span>
                      </div>

                      <Button
                        variant="accent"
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleCardPayment}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        Payer {settings.price.toFixed(2)} € par carte
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Bank transfer */}
                {selectedMethod === "bank_transfer" && settings.bank_transfer_enabled && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4 text-accent" />
                        Virement bancaire
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-3">
                        {[
                          { label: "Bénéficiaire", value: settings.bank_beneficiary, key: "beneficiary" },
                          { label: "Banque", value: settings.bank_bank_name, key: "bank" },
                          { label: "IBAN", value: settings.bank_iban, key: "iban" },
                          { label: "BIC / SWIFT", value: settings.bank_bic, key: "bic" },
                          { label: "Montant", value: `${settings.price.toFixed(2)} €`, key: "amount" },
                          { label: "Référence obligatoire", value: transferRef, key: "ref", highlight: true },
                        ].map(({ label, value, key, highlight }) => (
                          <div key={key} className={`flex items-center justify-between gap-4 ${highlight ? "rounded-lg bg-accent/10 border border-accent/20 px-3 py-2" : ""}`}>
                            <span className={`text-sm ${highlight ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                              {label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-mono ${highlight ? "font-bold text-accent" : "text-foreground"}`}>
                                {value}
                              </span>
                              <button
                                onClick={() => handleCopy(value, key)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                title="Copier"
                              >
                                {copied === key
                                  ? <CheckCircle className="h-3.5 w-3.5 text-success" />
                                  : <Copy className="h-3.5 w-3.5" />
                                }
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>
                          <strong>Important :</strong> indiquez impérativement la référence <strong>{transferRef}</strong> dans le libellé de votre virement.
                          Votre accès est activé <strong>immédiatement</strong> dès confirmation de votre intention.
                        </p>
                      </div>

                      <Button
                        variant="accent"
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleBankTransfer}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Confirmer mon intention de virement
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        En cliquant, vous confirmez votre intention d'effectuer un virement. Votre abonnement sera activé après réception.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <Card className="border-accent/20">
                <div className="h-1 bg-gradient-accent rounded-t-lg" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base">Fundia Network</CardTitle>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs border-accent/30 text-accent bg-accent/5">
                    Accès Annuel
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {FEATURES.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Abonnement annuel</span>
                      <span className="font-medium">{settings.price.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>soit par mois</span>
                      <span>{(settings.price / 12).toFixed(2)} €</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total</span>
                    <span>{settings.price.toFixed(2)} €</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 text-accent" />
                    <span>Satisfait ou remboursé 30 jours</span>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    Paiement sécurisé · RGPD · Annulation à tout moment
                  </p>
                </CardContent>
              </Card>

              <Card className="border-muted bg-muted/30">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    <p>
                      Fundia Network ne garantit pas l'obtention d'un financement.
                      Nous facilitons uniquement la mise en relation avec des partenaires susceptibles d'étudier votre dossier.
                    </p>
                  </div>
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
