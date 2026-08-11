import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  ArrowRight,
  Sparkles,
} from "lucide-react";

type PaymentMethod = "bank_transfer" | "card";

// L'intégration Stripe n'est pas encore branchée (voir handleCardPayment) :
// l'option carte reste visible mais désactivée tant que le paiement réel n'est pas fonctionnel.
const CARD_PAYMENT_LIVE = false;

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
  bank_beneficiary: "HEDGE FUNDS INVESTMENT MANAGEMENT LIMITED",
  bank_bank_name: "",
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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");
  const [submitting, setSubmitting] = useState(false);
  const [transferRef, setTransferRef] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [existingSub, setExistingSub] = useState<{ status: string } | null>(null);
  const [consent, setConsent] = useState(false);

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

  // Auto-select si un seul mode dispo (le paiement carte n'est pas encore fonctionnel)
  useEffect(() => {
    if (!settings.bank_transfer_enabled && settings.card_enabled && CARD_PAYMENT_LIVE) {
      setSelectedMethod("card");
    } else {
      setSelectedMethod("bank_transfer");
    }
  }, [settings]);

  const checkExistingSubscription = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("network_subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setExistingSub(data);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleBankTransfer = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("network_subscriptions").insert({
        user_id: user!.id,
        status: "pending",
        payment_method: "bank_transfer",
        amount: settings.price,
        currency: "EUR",
        bank_transfer_reference: transferRef,
      });
      if (error) throw error;
      toast.success("Virement enregistré — bienvenue dans votre espace membre !");
      navigate("/network/dashboard");
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPayment = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("network_subscriptions").insert({
        user_id: user!.id,
        status: "pending",
        payment_method: "card",
        amount: settings.price,
        currency: "EUR",
      });
      if (error) throw error;
      // TODO: rediriger vers Stripe Checkout
      toast.info("Paiement CB — intégration Stripe à venir.");
    } catch {
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

  // Déjà abonné actif → réseau
  if (existingSub?.status === "active") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Votre accès Fundia Network est actif</h1>
          <p className="text-muted-foreground">Vous avez déjà un abonnement actif.</p>
          <Link to="/network/explore">
            <Button variant="accent" size="lg" className="gap-2">
              <Network className="h-4 w-4" />Explorer le réseau
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Virement en attente → dashboard
  if (existingSub?.status === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
            <Building2 className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Paiement en cours de validation</h1>
          <p className="text-muted-foreground">Vous avez déjà un abonnement en attente de confirmation.</p>
          <Link to="/network/dashboard">
            <Button variant="accent" size="lg" className="gap-2">
              <ArrowRight className="h-4 w-4" />Voir mon espace membre
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const noneEnabled = !settings.card_enabled && !settings.bank_transfer_enabled;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Link to="/network" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />Retour à Fundia Network
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Gauche — formulaire */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Finaliser votre abonnement</h1>
              <p className="text-muted-foreground">Choisissez votre mode de paiement.</p>
            </div>

            {noneEnabled && (
              <Card className="border-destructive/30">
                <CardContent className="pt-6 flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">Les paiements sont temporairement indisponibles.</p>
                </CardContent>
              </Card>
            )}

            {!noneEnabled && (
              <>
                {/* Sélecteur de méthode */}
                {settings.card_enabled && settings.bank_transfer_enabled && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Mode de paiement</p>
                    <div className="grid grid-cols-2 gap-3">

                      {/* Virement — mis en avant */}
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("bank_transfer")}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          selectedMethod === "bank_transfer"
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/40"
                        }`}
                      >
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                          <Badge className="bg-accent text-accent-foreground text-[10px] px-2 py-0 h-5 gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            Recommandé
                          </Badge>
                        </span>
                        <Building2 className={`h-6 w-6 mt-1 ${selectedMethod === "bank_transfer" ? "text-accent" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium text-foreground">Virement instantané</span>
                        <span className="text-xs text-muted-foreground">0% de frais</span>
                      </button>

                      {/* CB — intégration Stripe pas encore fonctionnelle */}
                      <button
                        type="button"
                        onClick={() => CARD_PAYMENT_LIVE && setSelectedMethod("card")}
                        disabled={!CARD_PAYMENT_LIVE}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          !CARD_PAYMENT_LIVE
                            ? "border-border opacity-50 cursor-not-allowed"
                            : selectedMethod === "card"
                              ? "border-primary/60 bg-primary/5"
                              : "border-border hover:border-primary/30"
                        }`}
                      >
                        {!CARD_PAYMENT_LIVE && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                            <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-background">
                              Bientôt disponible
                            </Badge>
                          </span>
                        )}
                        <CreditCard className={`h-6 w-6 mt-1 ${selectedMethod === "card" && CARD_PAYMENT_LIVE ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium text-foreground">Carte bancaire</span>
                        <span className="text-xs text-muted-foreground">Via Stripe</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulaire virement */}
                {selectedMethod === "bank_transfer" && settings.bank_transfer_enabled && (
                  <Card className="border-accent/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4 text-accent" />
                        Virement bancaire instantané
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">

                      {/* Instructions étape par étape */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">1</span>
                          <p className="text-sm text-foreground pt-0.5">Ouvrez l'application de votre banque et lancez un <strong>virement instantané</strong>.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">2</span>
                          <p className="text-sm text-foreground pt-0.5">Renseignez les coordonnées ci-dessous et indiquez la référence <strong>obligatoire</strong> dans le libellé.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">3</span>
                          <p className="text-sm text-foreground pt-0.5">Revenez ici et cliquez <strong>"J'ai effectué mon virement"</strong> pour accéder à votre espace membre.</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Coordonnées bancaires */}
                      <div className="rounded-lg bg-muted/40 border border-border divide-y divide-border">
                        {[
                          { label: "Bénéficiaire", value: settings.bank_beneficiary, key: "beneficiary" },
                          ...(settings.bank_bank_name ? [{ label: "Banque", value: settings.bank_bank_name, key: "bank" }] : []),
                          { label: "IBAN", value: settings.bank_iban, key: "iban", mono: true },
                          { label: "BIC / SWIFT", value: settings.bank_bic, key: "bic", mono: true },
                          { label: "Montant exact", value: `${settings.price.toFixed(2)} €`, key: "amount", bold: true },
                        ].map(({ label, value, key, mono, bold }) => (
                          <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
                            <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-sm truncate ${mono ? "font-mono" : ""} ${bold ? "font-bold text-foreground" : "text-foreground"}`}>
                                {value}
                              </span>
                              <button
                                onClick={() => handleCopy(value, key)}
                                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
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

                        {/* Référence — mise en évidence */}
                        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-accent/10 rounded-b-lg">
                          <span className="text-sm font-semibold text-foreground flex-shrink-0">
                            Référence <span className="text-destructive">*</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-bold text-accent">{transferRef}</code>
                            <button
                              onClick={() => handleCopy(transferRef, "ref")}
                              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                              title="Copier la référence"
                            >
                              {copied === "ref"
                                ? <CheckCircle className="h-3.5 w-3.5 text-success" />
                                : <Copy className="h-3.5 w-3.5" />
                              }
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-destructive/80 bg-destructive/5 rounded-lg p-3 border border-destructive/10">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>La référence <strong>{transferRef}</strong> est obligatoire dans le libellé. Sans elle, votre paiement ne pourra pas être identifié.</p>
                      </div>

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="checkout-consent"
                          checked={consent}
                          onCheckedChange={(checked) => setConsent(checked === true)}
                          className="mt-1"
                        />
                        <Label htmlFor="checkout-consent" className="text-xs font-normal leading-snug text-muted-foreground">
                          J'accepte que mes données soient utilisées pour traiter mon abonnement, conformément à la{" "}
                          <Link to="/privacy" className="text-primary hover:underline">
                            politique de confidentialité
                          </Link>
                          . *
                        </Label>
                      </div>

                      <Button
                        variant="accent"
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleBankTransfer}
                        disabled={submitting || !consent}
                      >
                        {submitting
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <CheckCircle className="h-4 w-4" />
                        }
                        J'ai effectué mon virement
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        En cliquant, vous confirmez avoir initié le virement. Votre espace membre s'ouvre immédiatement — l'accès complet au réseau sera activé après validation de votre paiement.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Formulaire CB */}
                {selectedMethod === "card" && settings.card_enabled && CARD_PAYMENT_LIVE && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Paiement par carte bancaire
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-muted/50 border border-border p-4 text-center space-y-2">
                        <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm font-medium text-foreground">Paiement sécurisé via Stripe</p>
                        <p className="text-xs text-muted-foreground">
                          Vous serez redirigé vers la page de paiement sécurisée Stripe.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <span>Cryptage SSL 256 bits · PCI DSS · 3D Secure</span>
                      </div>
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleCardPayment}
                        disabled={submitting}
                      >
                        {submitting
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <CreditCard className="h-4 w-4" />
                        }
                        Payer {settings.price.toFixed(2)} € par carte
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Droite — récap commande */}
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
                    <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>Fundia Network ne garantit pas l'obtention d'un financement. Nous facilitons uniquement la mise en relation avec des partenaires susceptibles d'étudier votre dossier.</p>
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
