import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";

const ApplyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }).refine((data) => {
    if (data.employmentStatus === "cdd" && (!data.contractStartDate || !data.contractEndDate)) {
      return false;
    }
    if (data.employmentStatus === "cdi" && !data.contractStartDate) {
      return false;
    }
    if ((data.employmentStatus === "cdd" || data.employmentStatus === "cdi" || data.employmentStatus === "retired") && !data.monthlyIncome) {
      return false;
    }
    if (data.employmentStatus === "self-employed" && !data.annualRevenue) {
      return false;
    }
    if (data.housingStatus === "renter" && !data.leaseStartDate) {
      return false;
    }
    if (data.housingStatus === "owner" && !data.hasMortgage) {
      return false;
    }
    if (data.housingStatus === "owner" && data.hasMortgage === "yes" && !data.monthlyMortgage) {
      return false;
    }
    return true;
  }, { message: t('apply.validation.fillRequiredFields') });

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
  
  // Restore form data after login
  useEffect(() => {
    if (user && !authLoading) {
      const savedData = localStorage.getItem('pendingLoanApplication');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
          localStorage.removeItem('pendingLoanApplication');
          
          toast({
            title: t('apply.messages.dataRestored'),
            description: t('apply.messages.dataRestoredDesc'),
          });
        } catch (error) {
          console.error('Error restoring form data:', error);
          localStorage.removeItem('pendingLoanApplication');
        }
      }
    }
  }, [user, authLoading, toast, t]);
  
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
      if (step < 4) setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;
    
    if (!user) {
      localStorage.setItem('pendingLoanApplication', JSON.stringify(formData));
      
      toast({
        title: t('apply.messages.loginRequired'),
        description: t('apply.messages.loginRequiredDesc'),
        variant: "default"
      });
      
      navigate('/auth?redirect=/apply');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: insertedData, error } = await supabase
        .from('loan_requests')
        .insert({
          user_id: user.id,
          loan_type: formData.loanType,
          amount: parseFloat(formData.amount),
          duration: parseInt(formData.duration),
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      
      // Send application confirmation email
      if (insertedData) {
        try {
          await supabase.functions.invoke('send-application-confirmation', {
            body: { loanRequestId: insertedData.id }
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't block the flow if email fails
        }
      }
      
      // Clear saved application data
      localStorage.removeItem('pendingLoanApplication');
      
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

                  <div className="bg-muted/50 rounded-lg p-6 mt-8">
                    <h3 className="font-semibold mb-4 text-foreground">{t('apply.step4.summary')}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">{t('apply.step4.loanTypeLabel')}</span> <span className="font-medium">{getLoanTypeLabel(formData.loanType)}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.amountLabel')}</span> <span className="font-medium">{Number(formData.amount).toLocaleString('fr-FR')} €</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.durationLabel')}</span> <span className="font-medium">{formData.duration} {t('common.months')}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.nameLabel')}</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.emailLabel')}</span> <span className="font-medium">{formData.email}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.phoneLabel')}</span> <span className="font-medium">{formData.phone}</span></p>
                      <p><span className="text-muted-foreground">{t('apply.step4.incomeLabel')}</span> <span className="font-medium">{Number(formData.monthlyIncome).toLocaleString('fr-FR')} €</span></p>
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mt-4">
                    <p className="text-xs text-muted-foreground">
                      {t('apply.step4.disclaimer')}
                    </p>
                  </div>
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
                  <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                    {isSubmitting ? t('apply.navigation.submitting') : t('apply.navigation.submit')}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApplyPage;
