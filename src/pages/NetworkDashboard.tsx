import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Network,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  ArrowRight,
  Loader2,
  Building2,
  Copy,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  payment_method: string;
  amount: number;
  bank_transfer_reference: string | null;
  proof_of_payment_path: string | null;
  proof_of_payment_uploaded_at: string | null;
  created_at: string;
  started_at: string | null;
  expires_at: string | null;
}

export default function NetworkDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/network/dashboard");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("network_subscriptions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSub(data);
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sub) return;

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      toast.error("Fichier trop volumineux. Maximum 10 Mo.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou PDF.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${sub.id}/proof.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("network-payment-proofs")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("network_subscriptions")
        .update({
          proof_of_payment_path: path,
          proof_of_payment_uploaded_at: new Date().toISOString(),
        })
        .eq("id", sub.id);

      if (updateError) throw updateError;

      toast.success("Preuve de paiement envoyée. Nous allons valider votre abonnement.");
      fetchSubscription();
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez ou contactez le support.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Pas d'abonnement → checkout
  if (!sub) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-6">
          <Network className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Aucun abonnement trouvé</h1>
          <p className="text-muted-foreground">Vous n'avez pas encore souscrit à Fundia Network.</p>
          <Link to="/network/checkout">
            <Button variant="accent" size="lg" className="gap-2">
              <Network className="h-4 w-4" />Accéder au réseau — 19,90€/an
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isPending = sub.status === "pending";
  const isActive = sub.status === "active";
  const hasProof = !!sub.proof_of_payment_path;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">

        {/* Titre */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Network className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Fundia Network — Mon espace</h1>
          </div>
          <p className="text-muted-foreground">Suivez l'état de votre abonnement et accédez au réseau de financeurs.</p>
        </div>

        {/* Statut abonnement */}
        <Card className={isPending ? "border-accent/30" : "border-success/30"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {isPending
                  ? <Clock className="h-5 w-5 text-accent" />
                  : <CheckCircle className="h-5 w-5 text-success" />
                }
                Statut de votre abonnement
              </CardTitle>
              <Badge
                variant="outline"
                className={isPending
                  ? "border-accent/40 text-accent bg-accent/5"
                  : "border-success/40 text-success bg-success/5"
                }
              >
                {isPending ? "En attente de validation" : "Actif"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs mb-1">Mode de paiement</div>
                <div className="font-medium flex items-center gap-1.5">
                  {sub.payment_method === "bank_transfer"
                    ? <><Building2 className="h-3.5 w-3.5" />Virement bancaire</>
                    : <><FileText className="h-3.5 w-3.5" />Carte bancaire</>
                  }
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Montant</div>
                <div className="font-medium">{sub.amount.toFixed(2)} €</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Date de souscription</div>
                <div className="font-medium">
                  {new Date(sub.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
              {isActive && sub.expires_at && (
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Expiration</div>
                  <div className="font-medium">
                    {new Date(sub.expires_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              )}
            </div>

            {/* Référence virement */}
            {sub.payment_method === "bank_transfer" && sub.bank_transfer_reference && (
              <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-border px-4 py-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Référence de virement</div>
                  <code className="text-sm font-bold text-foreground">{sub.bank_transfer_reference}</code>
                </div>
                <button
                  onClick={() => handleCopy(sub.bank_transfer_reference!)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copier"
                >
                  {copied
                    ? <CheckCircle className="h-4 w-4 text-success" />
                    : <Copy className="h-4 w-4" />
                  }
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloc upload preuve — uniquement si pending */}
        {isPending && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Preuve de paiement
              </CardTitle>
              <CardDescription>
                Uploadez une capture d'écran ou un PDF de votre confirmation de virement pour accélérer la validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasProof ? (
                <div className="flex items-center gap-3 rounded-lg bg-success/5 border border-success/20 p-4">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Preuve envoyée</p>
                    <p className="text-xs text-muted-foreground">
                      Reçue le {new Date(sub.proof_of_payment_uploaded_at!).toLocaleDateString("fr-FR")} — en cours de vérification par notre équipe.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Glissez votre fichier ici ou cliquez pour choisir</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF · Max 10 Mo</p>
                    </div>
                    {uploading
                      ? <Loader2 className="h-5 w-5 animate-spin text-accent" />
                      : <Button variant="outline" size="sm" type="button">Choisir un fichier</Button>
                    }
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleUploadProof}
                    disabled={uploading}
                  />
                </>
              )}

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  La validation est effectuée manuellement par notre équipe, généralement sous <strong>quelques heures</strong>. Vous recevrez un email dès l'activation de votre accès.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accès réseau — uniquement si actif */}
        {isActive && (
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
                  <Network className="h-8 w-8 text-accent-foreground" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="font-bold text-foreground text-lg">Votre accès est actif</h3>
                  <p className="text-sm text-muted-foreground">Explorez les 240+ financeurs qualifiés du réseau.</p>
                </div>
                <Link to="/network/explore" className="flex-shrink-0">
                  <Button variant="accent" size="lg" className="gap-2">
                    Explorer le réseau
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ce qui vous attend */}
        {isPending && (
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">Ce qui vous attend après validation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-60">
                {[
                  { icon: Network, title: "240+ financeurs", desc: "Prêteurs, investisseurs, Business Angels" },
                  { icon: FileText, title: "Contact direct", desc: "Envoyez votre dossier en un clic" },
                  { icon: CheckCircle, title: "Suivi en temps réel", desc: "Suivez toutes vos demandes" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="text-center space-y-2">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mx-auto">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
      <Footer />
    </div>
  );
}
