import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, ArrowLeft, Mail } from "lucide-react";
import { z } from "zod";

const PENDING_APPLICATION_KEY = 'pendingLoanApplication';
const PENDING_APPLICATION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const textOrNull = (value: string) => value.trim() || null;
const numberOrNull = (value: string) => (value === "" ? null : Number(value));

const readPendingApplication = () => {
  const savedData = localStorage.getItem(PENDING_APPLICATION_KEY);
  if (!savedData) return null;

  try {
    const parsed = JSON.parse(savedData);
    // Ancien format : les champs du formulaire directement, sans consentement enregistré
    if (!parsed.form) return { form: parsed, consent: false };
    if (Date.now() - parsed.savedAt > PENDING_APPLICATION_MAX_AGE_MS) {
      localStorage.removeItem(PENDING_APPLICATION_KEY);
      return null;
    }
    return { form: parsed.form, consent: parsed.consent === true };
  } catch (error) {
    console.error('Error restoring form data:', error);
    localStorage.removeItem(PENDING_APPLICATION_KEY);
    return null;
  }
};

const ApplyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [accountMode, setAccountMode] = useState<"signup" | "login">("signup");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // Schémas de validation par étape
  const step1Schema = z.object({
    loanType: z.string().min(1, { message: t('apply.validation.loanTypeRequired') }),
    amount: z.string()
      .min(1, { message: t('apply.validation.amountRequired') })
      .refine((val) => {
        const num = Number(val);
        return num >= 1000 && num <= 75000;
      }, { message: t('apply.validation.amountRange') }),
    duration: z.string().min(1, { message: t('apply.validation.durationRequired') }),
    purpose: z.string().max(500, { message: t('apply.validation.maxCharacters', { count: 500 }) }),
  });

  const step2Schema = z.object({
    firstName: z.string()
      .trim()
      .min(2, { message: t('apply.validation.firstNameMin') })
      .max(50, { message: t('apply.validation.maxCharacters', { count: 50 }) }),
    lastName: z.string()
      .trim()
      .min(2, { message: t('apply.validation.lastNameMin') })
      .max(50, { message: t('apply.validation.maxCharacters', { count: 50 }) }),
    email: z.string()
      .trim()
      .email({ message: t('apply.validation.invalidEmail') })
      .max(255, { message: t('apply.validation.maxCharacters', { count: 255 }) }),
    phone: z.string()
      .trim()
      .min(10, { message: t('apply.validation.invalidPhone') })
      .max(20, { message: t('apply.validation.maxCharacters', { count: 20 }) }),
    birthDate: z.string().min(1, { message: t('apply.validation.birthDateRequired') }),
  });

  const step3Schema = z.object({
    employmentStatus: z.string().min(1, { message: t('apply.validation.contractTypeRequired') }),
    contractStartDate: z.string().optional(),
    contractEndDate: z.string().optional(),
    monthlyIncome: z.string().optional(),
    annualRevenue: z.string().optional(),
    bankName: z.string().min(1, { message: t('apply.validation.bankRequired') }),
    housingStatus: z.string().min(1, { message: t('apply.validation.housingRequired') }),
    leaseStartDate: z.string().optional(),
    hasMortgage: z.string().optional(),
    monthlyMortgage: z.string().optional(),
  }).superRefine((data, ctx) => {
    // Validation pour CDD
    if (data.employmentStatus === "cdd") {
      if (!data.contractStartDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('apply.validation.contractStartDateRequired'),
          path: ['contractStartDate'],
        });
      }
      if (!data.contractEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('apply.validation.contractEndDateRequired'),
          path: ['contractEndDate'],
        });
      }
    }

    // Validation pour CDI
    if (data.employmentStatus === "cdi" && !data.contractStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('apply.validation.contractStartDateRequired'),
        path: ['contractStartDate'],
      });
    }

    // Validation du revenu mensuel pour salariés et retraités
    if ((data.employmentStatus === "cdd" || data.employmentStatus === "cdi" || data.employmentStatus === "retired") && !data.monthlyIncome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('apply.validation.monthlyIncomeRequired'),
        path: ['monthlyIncome'],
      });
    }

    // Validation du chiffre d'affaires pour travailleur indépendant
    if (data.employmentStatus === "self-employed" && !data.annualRevenue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('apply.validation.annualRevenueRequired'),
        path: ['annualRevenue'],
      });
    }

    // Validation pour locataire
    if (data.housingStatus === "renter" && !data.leaseStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('apply.validation.leaseStartDateRequired'),
        path: ['leaseStartDate'],
      });
    }

    // Validation pour propriétaire
    if (data.housingStatus === "owner") {
      if (!data.hasMortgage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('apply.validation.mortgageStatusRequired'),
          path: ['hasMortgage'],
        });
      }

      if (data.hasMortgage === "yes" && !data.monthlyMortgage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('apply.validation.monthlyMortgageRequired'),
          path: ['monthlyMortgage'],
        });
      }
    }
  });

  const step4Schema = z.object({
    address: z.string()
      .trim()
      .min(5, { message: t('apply.validation.addressMin') })
      .max(200, { message: t('apply.validation.maxCharacters', { count: 200 }) }),
    city: z.string()
      .trim()
      .min(2, { message: t('apply.validation.cityMin') })
      .max(100, { message: t('apply.validation.maxCharacters', { count: 100 }) }),
    postalCode: z.string()
      .trim()
      .min(4, { message: t('apply.validation.invalidPostalCode') })
      .max(10, { message: t('apply.validation.maxCharacters', { count: 10 }) }),
    country: z.string().min(1, { message: t('apply.validation.countryRequired') }),
  });
  
  // Reprend la demande sauvegardée : retour de lien de confirmation, connexion ou bandeau d'accueil
  useEffect(() => {
    if (authLoading) return;

    const pending = readPendingApplication();
    if (!pending) {
      // La demande a déjà été envoyée depuis l'onglet ouvert par le lien de confirmation
      if (user && awaitingConfirmation) navigate('/dashboard');
      return;
    }

    setFormData(pending.form);
    setAccountEmail(pending.form.email);
    setConsentGiven(pending.consent);
    setAwaitingConfirmation(false);
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (user) {
      localStorage.removeItem(PENDING_APPLICATION_KEY);
      if (pending.consent) {
        submitApplication(user, pending.form);
        return;
      }
    }

    toast({
      title: t('apply.messages.dataRestored'),
      description: t('apply.messages.dataRestoredDesc'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Only depend on user and authLoading to avoid multiple triggers
  
  const [formData, setFormData] = useState({
    loanType: "",
    amount: "",
    duration: "",
    purpose: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    employmentStatus: "",
    contractStartDate: "",
    contractEndDate: "",
    monthlyIncome: "",
    annualRevenue: "",
    bankName: "",
    housingStatus: "",
    leaseStartDate: "",
    hasMortgage: "",
    monthlyMortgage: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNumber: number): boolean => {
    try {
      if (stepNumber === 1) {
        step1Schema.parse({
          loanType: formData.loanType,
          amount: formData.amount,
          duration: formData.duration,
          purpose: formData.purpose,
        });
      } else if (stepNumber === 2) {
        step2Schema.parse({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          birthDate: formData.birthDate,
        });
      } else if (stepNumber === 3) {
        step3Schema.parse({
          employmentStatus: formData.employmentStatus,
          contractStartDate: formData.contractStartDate,
          contractEndDate: formData.contractEndDate,
          monthlyIncome: formData.monthlyIncome,
          annualRevenue: formData.annualRevenue,
          bankName: formData.bankName,
          housingStatus: formData.housingStatus,
          leaseStartDate: formData.leaseStartDate,
          hasMortgage: formData.hasMortgage,
          monthlyMortgage: formData.monthlyMortgage,
        });
      } else if (stepNumber === 4) {
        step4Schema.parse({
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: t('common.validationError'),
          description: error.errors[0].message,
        });
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 3) setAccountEmail(formData.email);
      if (step < 4) setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    if (!consentGiven) {
      toast({
        variant: "destructive",
        title: t('apply.step4.consentRequired'),
      });
      return;
    }

    if (!user) {
      await authenticateAndResume();
      return;
    }

    await submitApplication(user, formData);
  };

  const emailRedirectTo = () => `${window.location.origin}/apply`;

  // Une fois authentifié, l'effet de reprise envoie la demande sauvegardée
  const authenticateAndResume = async () => {
    if (accountPassword.length < 6) {
      toast({ variant: "destructive", title: t('auth.passwordTooShort') });
      return;
    }

    if (accountMode === "signup" && !termsAccepted) {
      toast({ variant: "destructive", title: t('auth.consentRequired') });
      return;
    }

    // Une fois connecté, l'envoi prend le relais : le bouton reste désactivé
    let resuming = false;
    setIsSubmitting(true);
    localStorage.setItem(PENDING_APPLICATION_KEY, JSON.stringify({
      form: formData,
      consent: true,
      savedAt: Date.now(),
    }));

    try {
      if (accountMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: accountEmail,
          password: accountPassword,
        });
        if (error) {
          if (error.message.toLowerCase().includes('not confirmed')) {
            setAwaitingConfirmation(true);
            return;
          }
          localStorage.removeItem(PENDING_APPLICATION_KEY);
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
        email: accountEmail,
        password: accountPassword,
        options: {
          emailRedirectTo: emailRedirectTo(),
          data: { first_name: formData.firstName, last_name: formData.lastName },
        },
      });

      if (error) {
        localStorage.removeItem(PENDING_APPLICATION_KEY);
        toast({ variant: "destructive", title: t('common.error'), description: error.message });
        return;
      }

      // Supabase masque les comptes existants : l'utilisateur renvoyé n'a aucune identité
      if (data.user?.identities?.length === 0) {
        localStorage.removeItem(PENDING_APPLICATION_KEY);
        setAccountMode("login");
        setAccountPassword("");
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
          body: { firstName: formData.firstName, lastName: formData.lastName },
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    } finally {
      if (!resuming) setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: accountEmail,
      options: { emailRedirectTo: emailRedirectTo() },
    });

    if (error) {
      toast({ variant: "destructive", title: t('common.error'), description: error.message });
    } else {
      toast({ title: t('apply.account.confirmationResent') });
    }
  };

  const submitApplication = async (currentUser: User, application: typeof formData) => {
    setIsSubmitting(true);

    // Check if user is blocked from submitting new requests
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (profile?.is_blocked) {
      toast({
        variant: "destructive",
        title: t('apply.messages.blockedTitle'),
        description: t('apply.messages.blockedDesc'),
      });
      setIsSubmitting(false);
      return;
    }

    const hasContract = application.employmentStatus === "cdi" || application.employmentStatus === "cdd";
    const isOwner = application.housingStatus === "owner";

    try {
      const { data: insertedData, error } = await supabase
        .from('loan_requests')
        .insert({
          user_id: currentUser.id,
          loan_type: application.loanType,
          amount: parseFloat(application.amount),
          duration: parseInt(application.duration),
          first_name: application.firstName,
          last_name: application.lastName,
          email: application.email,
          phone: application.phone,
          purpose: textOrNull(application.purpose),
          birth_date: textOrNull(application.birthDate),
          employment_status: application.employmentStatus,
          contract_start_date: hasContract ? textOrNull(application.contractStartDate) : null,
          contract_end_date: application.employmentStatus === "cdd" ? textOrNull(application.contractEndDate) : null,
          monthly_income: application.employmentStatus !== "self-employed" ? numberOrNull(application.monthlyIncome) : null,
          annual_revenue: application.employmentStatus === "self-employed" ? numberOrNull(application.annualRevenue) : null,
          bank_name: textOrNull(application.bankName),
          housing_status: application.housingStatus,
          lease_start_date: application.housingStatus === "renter" ? textOrNull(application.leaseStartDate) : null,
          has_mortgage: isOwner ? application.hasMortgage === "yes" : null,
          monthly_mortgage: isOwner && application.hasMortgage === "yes" ? numberOrNull(application.monthlyMortgage) : null,
          address: textOrNull(application.address),
          city: textOrNull(application.city),
          postal_code: textOrNull(application.postalCode),
          country: textOrNull(application.country),
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      
      // Send application confirmation email
      if (insertedData) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-application-confirmation', {
            body: { loanRequestId: insertedData.id }
          });
          if (emailError) {
            throw emailError;
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          toast({
            variant: "destructive",
            title: t('common.error'),
            description: t('apply.messages.emailFailed'),
          });
        }
      }
      
      // Clear saved application data
      localStorage.removeItem(PENDING_APPLICATION_KEY);
      
      toast({
        title: t('apply.messages.success'),
        description: t('apply.messages.successDesc'),
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('apply.messages.errorDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: t('apply.steps.creditDetails') },
    { number: 2, title: t('apply.steps.personalInfo') },
    { number: 3, title: t('apply.steps.financialInfo') },
    { number: 4, title: t('apply.steps.addressReview') },
  ];

  const getLoanTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      personal: t('apply.loanTypes.personal'),
      auto: t('apply.loanTypes.auto'),
      home: t('apply.loanTypes.home'),
      consolidation: t('apply.loanTypes.consolidation'),
      business: t('apply.loanTypes.business'),
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('apply.title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('apply.subtitle')}
            </p>
          </div>

          {/* Indicateur de progression */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((s, index) => (
                <div key={s.number} className="flex-1">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s.number 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {step > s.number ? <CheckCircle className="h-6 w-6" /> : s.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 transition-colors ${
                        step > s.number ? "bg-accent" : "bg-muted"
                      }`} />
                    )}
                  </div>
                  <div className="text-xs mt-2 text-center">{s.title}</div>
                </div>
              ))}
            </div>
          </div>

          {awaitingConfirmation ? (
          <Card className="p-8 text-center space-y-4">
            <Mail className="h-12 w-12 text-accent mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">{t('apply.account.awaitingTitle')}</h2>
            <p className="text-muted-foreground">
              {t('apply.account.awaitingDesc', { email: accountEmail })}
            </p>
            <p className="text-sm text-muted-foreground">{t('apply.account.awaitingHint')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button type="button" variant="outline" onClick={handleResendConfirmation}>
                {t('auth.resendEmail')}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setAwaitingConfirmation(false);
                  setAccountMode("login");
                  setAccountPassword("");
                }}
              >
                {t('apply.account.alreadyConfirmed')}
              </Button>
            </div>
          </Card>
          ) : (
          <Card className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Étape 1: Détails du crédit */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t('apply.step1.title')}</h2>
                  
                  <div>
                    <Label htmlFor="loanType">{t('apply.step1.loanType')} *</Label>
                    <Select value={formData.loanType} onValueChange={(value) => updateFormData("loanType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('apply.step1.loanTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">{t('apply.loanTypes.personal')}</SelectItem>
                        <SelectItem value="auto">{t('apply.loanTypes.auto')}</SelectItem>
                        <SelectItem value="home">{t('apply.loanTypes.home')}</SelectItem>
                        <SelectItem value="consolidation">{t('apply.loanTypes.consolidation')}</SelectItem>
                        <SelectItem value="business">{t('apply.loanTypes.business')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">{t('apply.step1.amount')} *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1000"
                      max="75000"
                      step="100"
                      value={formData.amount}
                      onChange={(e) => updateFormData("amount", e.target.value)}
                      placeholder="10000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('apply.step1.amountHint')}</p>
                  </div>

                  <div>
                    <Label htmlFor="duration">{t('apply.step1.duration')} *</Label>
                    <Select value={formData.duration} onValueChange={(value) => updateFormData("duration", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('apply.step1.durationPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">{t('apply.durations.months', { count: 12 })}</SelectItem>
                        <SelectItem value="24">{t('apply.durations.months', { count: 24 })}</SelectItem>
                        <SelectItem value="36">{t('apply.durations.months', { count: 36 })}</SelectItem>
                        <SelectItem value="48">{t('apply.durations.months', { count: 48 })}</SelectItem>
                        <SelectItem value="60">{t('apply.durations.months', { count: 60 })}</SelectItem>
                        <SelectItem value="72">{t('apply.durations.months', { count: 72 })}</SelectItem>
                        <SelectItem value="84">{t('apply.durations.months', { count: 84 })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="purpose">{t('apply.step1.purpose')}</Label>
                    <Input
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => updateFormData("purpose", e.target.value)}
                      placeholder={t('apply.step1.purposePlaceholder')}
                      maxLength={500}
                    />
                  </div>
                </div>
              )}

              {/* Étape 2: Informations personnelles */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t('apply.step2.title')}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">{t('apply.step2.firstName')} *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                        placeholder="Jean"
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">{t('apply.step2.lastName')} *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData("lastName", e.target.value)}
                        placeholder="Dupont"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">{t('apply.step2.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="jean.dupont@example.com"
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('apply.step2.phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthDate">{t('apply.step2.birthDate')} *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => updateFormData("birthDate", e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}

              {/* Étape 3: Informations financières */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t('apply.step3.title')}</h2>
                  
                  <div>
                    <Label htmlFor="employmentStatus">{t('apply.step3.employmentStatus')} *</Label>
                    <Select value={formData.employmentStatus} onValueChange={(value) => updateFormData("employmentStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('apply.step3.employmentPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cdi">{t('apply.employmentTypes.cdi')}</SelectItem>
                        <SelectItem value="cdd">{t('apply.employmentTypes.cdd')}</SelectItem>
                        <SelectItem value="self-employed">{t('apply.employmentTypes.selfEmployed')}</SelectItem>
                        <SelectItem value="retired">{t('apply.employmentTypes.retired')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dates de contrat pour CDD */}
                  {formData.employmentStatus === "cdd" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="contractStartDate">{t('apply.step3.contractStartDate')} *</Label>
                        <Input
                          id="contractStartDate"
                          type="date"
                          value={formData.contractStartDate}
                          onChange={(e) => updateFormData("contractStartDate", e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contractEndDate">{t('apply.step3.contractEndDate')} *</Label>
                        <Input
                          id="contractEndDate"
                          type="date"
                          value={formData.contractEndDate}
                          onChange={(e) => updateFormData("contractEndDate", e.target.value)}
                          min={formData.contractStartDate}
                        />
                      </div>
                    </div>
                  )}

                  {/* Date de début pour CDI */}
                  {formData.employmentStatus === "cdi" && (
                    <div>
                      <Label htmlFor="contractStartDate">{t('apply.step3.contractStartDate')} *</Label>
                      <Input
                        id="contractStartDate"
                        type="date"
                        value={formData.contractStartDate}
                        onChange={(e) => updateFormData("contractStartDate", e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}

                  {/* Revenu mensuel pour salariés et retraités */}
                  {(formData.employmentStatus === "cdi" || formData.employmentStatus === "cdd" || formData.employmentStatus === "retired") && (
                    <div>
                      <Label htmlFor="monthlyIncome">{t('apply.step3.monthlyIncome')} *</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        min="0"
                        step="100"
                        value={formData.monthlyIncome}
                        onChange={(e) => updateFormData("monthlyIncome", e.target.value)}
                        placeholder="2500"
                      />
                    </div>
                  )}

                  {/* Chiffre d'affaires pour travailleur indépendant */}
                  {formData.employmentStatus === "self-employed" && (
                    <div>
                      <Label htmlFor="annualRevenue">{t('apply.step3.annualRevenue')} *</Label>
                      <Input
                        id="annualRevenue"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.annualRevenue}
                        onChange={(e) => updateFormData("annualRevenue", e.target.value)}
                        placeholder="50000"
                      />
                    </div>
                  )}

                  {/* Banque */}
                  <div>
                    <Label htmlFor="bankName">{t('apply.step3.bankName')} *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => updateFormData("bankName", e.target.value)}
                      placeholder={t('apply.step3.bankPlaceholder')}
                      maxLength={100}
                    />
                  </div>

                  {/* Statut de logement */}
                  <div>
                    <Label htmlFor="housingStatus">{t('apply.step3.housingStatus')} *</Label>
                    <Select value={formData.housingStatus} onValueChange={(value) => updateFormData("housingStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('apply.step3.housingPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">{t('apply.housingTypes.owner')}</SelectItem>
                        <SelectItem value="renter">{t('apply.housingTypes.renter')}</SelectItem>
                        <SelectItem value="other">{t('apply.housingTypes.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date de bail pour locataire */}
                  {formData.housingStatus === "renter" && (
                    <div>
                      <Label htmlFor="leaseStartDate">{t('apply.step3.leaseStartDate')} *</Label>
                      <Input
                        id="leaseStartDate"
                        type="date"
                        value={formData.leaseStartDate}
                        onChange={(e) => updateFormData("leaseStartDate", e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}

                  {/* Crédit immobilier pour propriétaire */}
                  {formData.housingStatus === "owner" && (
                    <>
                      <div>
                        <Label htmlFor="hasMortgage">{t('apply.step3.hasMortgage')} *</Label>
                        <Select value={formData.hasMortgage} onValueChange={(value) => updateFormData("hasMortgage", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('common.select')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">{t('common.yes')}</SelectItem>
                            <SelectItem value="no">{t('common.no')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.hasMortgage === "yes" && (
                        <div>
                          <Label htmlFor="monthlyMortgage">{t('apply.step3.monthlyMortgage')} *</Label>
                          <Input
                            id="monthlyMortgage"
                            type="number"
                            min="0"
                            step="50"
                            value={formData.monthlyMortgage}
                            onChange={(e) => updateFormData("monthlyMortgage", e.target.value)}
                            placeholder="800"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Étape 4: Adresse & Révision */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t('apply.step4.title')}</h2>
                  
                  <div>
                    <Label htmlFor="address">{t('apply.step4.address')} *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      placeholder="123 Rue de la Paix"
                      maxLength={200}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="city">{t('apply.step4.city')} *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        placeholder="Paris"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalCode">{t('apply.step4.postalCode')} *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => updateFormData("postalCode", e.target.value)}
                        placeholder="75001"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">{t('apply.step4.country')} *</Label>
                    <Select value={formData.country} onValueChange={(value) => updateFormData("country", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('apply.step4.country')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Belgique">Belgique</SelectItem>
                        <SelectItem value="Suisse">Suisse</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6 mt-8">
                    <h3 className="font-semibold mb-4 text-foreground">{t('apply.step4.summary')}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">{t('apply.step4.loanTypeLabel')}</span> <span className="font-medium">{getLoanTypeLabel(formData.loanType)}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.amountLabel')}</span> <span className="font-medium">{Number(formData.amount).toLocaleString('fr-FR')} €</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.durationLabel')}</span> <span className="font-medium">{formData.duration} {t('common.months')}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.nameLabel')}</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.emailLabel')}</span> <span className="font-medium">{formData.email}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.phoneLabel')}</span> <span className="font-medium">{formData.phone}</span></p>
                      {formData.employmentStatus === "self-employed" ? (
                        <p><span className="text-muted-foreground">{t('apply.step3.annualRevenue')} :</span> <span className="font-medium">{Number(formData.annualRevenue).toLocaleString('fr-FR')} €</span></p>
                      ) : (
                        <p><span className="text-muted-foreground">{t('apply.step4.incomeLabel')}</span> <span className="font-medium">{Number(formData.monthlyIncome).toLocaleString('fr-FR')} €</span></p>
                      )}
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mt-4">
                    <p className="text-xs text-muted-foreground">
                      {t('apply.step4.disclaimer')}
                    </p>
                    <p className="text-xs text-muted-foreground italic mt-2">
                      {t('apply.step4.creditWarning')}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 mt-4">
                    <Checkbox
                      id="apply-consent"
                      checked={consentGiven}
                      onCheckedChange={(checked) => setConsentGiven(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="apply-consent" className="text-sm font-normal leading-snug text-muted-foreground">
                      {t('apply.step4.consentPrefix')}{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        {t('apply.step4.consentLink')}
                      </Link>
                      . *
                    </Label>
                  </div>

                  {/* Compte créé directement dans le formulaire */}
                  {!user && (
                    <div className="border rounded-lg p-6 mt-4 space-y-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {t(accountMode === "signup" ? 'apply.account.signupTitle' : 'apply.account.loginTitle')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t(accountMode === "signup" ? 'apply.account.signupDesc' : 'apply.account.loginDesc')}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="account-email">{t('auth.email')} *</Label>
                        <Input
                          id="account-email"
                          type="email"
                          autoComplete="email"
                          required
                          value={accountEmail}
                          onChange={(e) => setAccountEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="account-password">{t('auth.password')} *</Label>
                        <Input
                          id="account-password"
                          type="password"
                          autoComplete={accountMode === "signup" ? "new-password" : "current-password"}
                          required
                          minLength={6}
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                        />
                      </div>

                      {accountMode === "signup" && (
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="account-terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                            className="mt-1"
                          />
                          <Label htmlFor="account-terms" className="text-sm font-normal leading-snug text-muted-foreground">
                            {t('auth.consentPrefix')}{" "}
                            <Link to="/terms" className="text-primary hover:underline">
                              {t('auth.consentTermsLink')}
                            </Link>{" "}
                            {t('auth.consentAnd')}{" "}
                            <Link to="/privacy" className="text-primary hover:underline">
                              {t('auth.consentPrivacyLink')}
                            </Link>
                            . *
                          </Label>
                        </div>
                      )}

                      <div className="flex flex-wrap justify-between gap-2 text-sm">
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => setAccountMode(accountMode === "signup" ? "login" : "signup")}
                        >
                          {t(accountMode === "signup" ? 'apply.account.switchToLogin' : 'apply.account.switchToSignup')}
                        </button>
                        {accountMode === "login" && (
                          <Link to="/auth" className="text-primary hover:underline">
                            {t('auth.forgotPassword')}
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('apply.navigation.previous')}
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button type="button" onClick={handleNext} className="ml-auto">
                    {t('apply.navigation.next')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto"
                    disabled={isSubmitting || !consentGiven || (!user && accountMode === "signup" && !termsAccepted)}
                  >
                    {isSubmitting ? t('apply.navigation.submitting') : t('apply.navigation.submit')}
                  </Button>
                )}
              </div>
            </form>
          </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApplyPage;
