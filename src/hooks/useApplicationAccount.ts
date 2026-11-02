import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface UseApplicationAccountOptions<T> {
  pendingKey: string;
  returnPath: string;
  setIsSubmitting: (value: boolean) => void;
  onRestore: (form: T, consent: boolean) => void;
  onSubmit: (user: User, form: T) => void;
  getEmail: (form: T) => string;
}

// Crée le compte dans le formulaire et reprend la demande après connexion ou confirmation de l'email
export function useApplicationAccount<T>({
  pendingKey,
  returnPath,
  setIsSubmitting,
  onRestore,
  onSubmit,
  getEmail,
}: UseApplicationAccountOptions<T>) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const readPending = (): { form: T; consent: boolean } | null => {
    const savedData = localStorage.getItem(pendingKey);
    if (!savedData) return null;

    try {
      const parsed = JSON.parse(savedData);
      // Ancien format : les champs du formulaire directement, sans consentement enregistré
      if (!parsed.form) return { form: parsed, consent: false };
      if (Date.now() - parsed.savedAt > PENDING_MAX_AGE_MS) {
        localStorage.removeItem(pendingKey);
        return null;
      }
      return { form: parsed.form, consent: parsed.consent === true };
    } catch (error) {
      console.error('Error restoring form data:', error);
      localStorage.removeItem(pendingKey);
      return null;
    }
  };

  // Reprend la demande sauvegardée : retour de lien de confirmation, connexion ou bandeau d'accueil
  useEffect(() => {
    if (authLoading) return;

    const pending = readPending();
    if (!pending) {
      // La demande a déjà été envoyée depuis l'onglet ouvert par le lien de confirmation
      if (user && awaitingConfirmation) navigate('/dashboard');
      return;
    }

    onRestore(pending.form, pending.consent);
    setEmail(getEmail(pending.form));
    setAwaitingConfirmation(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (user) {
      localStorage.removeItem(pendingKey);
      if (pending.consent) {
        onSubmit(user, pending.form);
        return;
      }
    }

    toast({
      title: t('apply.messages.dataRestored'),
      description: t('apply.messages.dataRestoredDesc'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Only depend on user and authLoading to avoid multiple triggers

  const emailRedirectTo = () => `${window.location.origin}${returnPath}`;

  // Une fois authentifié, l'effet de reprise envoie la demande sauvegardée
  const authenticateAndResume = async (form: T, firstName: string, lastName: string) => {
    if (password.length < 6) {
      toast({ variant: "destructive", title: t('auth.passwordTooShort') });
      return;
    }

    if (mode === "signup" && !termsAccepted) {
      toast({ variant: "destructive", title: t('auth.consentRequired') });
      return;
    }

    // Une fois connecté, l'envoi prend le relais : le bouton reste désactivé
    let resuming = false;
    setIsSubmitting(true);
    localStorage.setItem(pendingKey, JSON.stringify({ form, consent: true, savedAt: Date.now() }));

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('not confirmed')) {
            setAwaitingConfirmation(true);
            return;
          }
          localStorage.removeItem(pendingKey);
          toast({
            variant: "destructive",
            title: t('common.error'),
            description: t('apply.account.invalidCredentials'),
          });
          return;
        }
        resuming = true;
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: emailRedirectTo(),
          data: { first_name: firstName, last_name: lastName },
        },
      });

      if (error) {
        localStorage.removeItem(pendingKey);
        toast({ variant: "destructive", title: t('common.error'), description: error.message });
        return;
      }

      // Supabase masque les comptes existants : l'utilisateur renvoyé n'a aucune identité
      if (data.user?.identities?.length === 0) {
        localStorage.removeItem(pendingKey);
        setMode("login");
        setPassword("");
        toast({ title: t('apply.account.emailExists') });
        return;
      }

      if (!data.session) {
        setAwaitingConfirmation(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      resuming = true;

      // Send welcome email only when a user session exists (JWT required by function)
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: { firstName, lastName },
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    } finally {
      if (!resuming) setIsSubmitting(false);
    }
  };

  const resendConfirmation = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: emailRedirectTo() },
    });

    if (error) {
      toast({ variant: "destructive", title: t('common.error'), description: error.message });
    } else {
      toast({ title: t('apply.account.confirmationResent') });
    }
  };

  const backToLogin = () => {
    setAwaitingConfirmation(false);
    setMode("login");
    setPassword("");
  };

  return {
    user,
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    termsAccepted,
    setTermsAccepted,
    awaitingConfirmation,
    termsMissing: !user && mode === "signup" && !termsAccepted,
    authenticateAndResume,
    resendConfirmation,
    backToLogin,
    clearPending: () => localStorage.removeItem(pendingKey),
  };
}

export type ApplicationAccount = ReturnType<typeof useApplicationAccount>;
