import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// Schémas de validation par étape
const step1Schema = z.object({
  loanType: z.string().min(1, { message: "Le type de crédit est requis" }),
  amount: z.string()
    .min(1, { message: "Le montant est requis" })
    .refine((val) => {
      const num = Number(val);
      return num >= 1000 && num <= 75000;
    }, { message: "Le montant doit être entre 1 000 € et 75 000 €" }),
  duration: z.string().min(1, { message: "La durée est requise" }),
  purpose: z.string().max(500, { message: "Maximum 500 caractères" }),
});

const step2Schema = z.object({
  firstName: z.string()
    .trim()
    .min(2, { message: "Le prénom doit contenir au moins 2 caractères" })
    .max(50, { message: "Maximum 50 caractères" }),
  lastName: z.string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(50, { message: "Maximum 50 caractères" }),
  email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "Maximum 255 caractères" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Numéro de téléphone invalide" })
    .max(20, { message: "Maximum 20 caractères" }),
  birthDate: z.string().min(1, { message: "La date de naissance est requise" }),
});

const step3Schema = z.object({
  employmentStatus: z.string().min(1, { message: "Le type de contrat est requis" }),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualRevenue: z.string().optional(),
  bankName: z.string().min(1, { message: "Le nom de la banque est requis" }),
  housingStatus: z.string().min(1, { message: "Le statut de logement est requis" }),
  leaseStartDate: z.string().optional(),
  hasMortgage: z.string().optional(),
  monthlyMortgage: z.string().optional(),
}).refine((data) => {
  // Validation pour CDD: date de début et fin requises
  if (data.employmentStatus === "cdd" && (!data.contractStartDate || !data.contractEndDate)) {
    return false;
  }
  // Validation pour CDI: date de début requise
  if (data.employmentStatus === "cdi" && !data.contractStartDate) {
    return false;
  }
  // Validation pour salariés et retraités: revenu mensuel requis
  if ((data.employmentStatus === "cdd" || data.employmentStatus === "cdi" || data.employmentStatus === "retired") && !data.monthlyIncome) {
    return false;
  }
  // Validation pour travailleur indépendant: chiffre d'affaires requis
  if (data.employmentStatus === "self-employed" && !data.annualRevenue) {
    return false;
  }
  // Validation pour locataire: date de bail requise
  if (data.housingStatus === "renter" && !data.leaseStartDate) {
    return false;
  }
  // Validation pour propriétaire: statut crédit immobilier requis
  if (data.housingStatus === "owner" && !data.hasMortgage) {
    return false;
  }
  // Validation pour propriétaire avec crédit: mensualité requise
  if (data.housingStatus === "owner" && data.hasMortgage === "yes" && !data.monthlyMortgage) {
    return false;
  }
  return true;
}, { message: "Veuillez remplir tous les champs requis selon votre situation" });

const step4Schema = z.object({
  address: z.string()
    .trim()
    .min(5, { message: "L'adresse doit contenir au moins 5 caractères" })
    .max(200, { message: "Maximum 200 caractères" }),
  city: z.string()
    .trim()
    .min(2, { message: "La ville doit contenir au moins 2 caractères" })
    .max(100, { message: "Maximum 100 caractères" }),
  postalCode: z.string()
    .trim()
    .min(4, { message: "Code postal invalide" })
    .max(10, { message: "Maximum 10 caractères" }),
  country: z.string().min(1, { message: "Le pays est requis" }),
});

const ApplyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
            title: "Données restaurées",
            description: "Vous pouvez maintenant soumettre votre demande",
          });
        } catch (error) {
          console.error('Error restoring form data:', error);
          localStorage.removeItem('pendingLoanApplication');
        }
      }
    }
  }, [user, authLoading, toast]);
  
  const [formData, setFormData] = useState({
    // Étape 1: Détails du crédit
    loanType: "",
    amount: "",
    duration: "",
    purpose: "",
    
    // Étape 2: Informations personnelles
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    
    // Étape 3: Informations financières
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
    
    // Étape 4: Adresse
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
          title: "Erreur de validation",
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
    
    // Check authentication at submission time
    if (!user) {
      // Save form data before redirecting to auth
      localStorage.setItem('pendingLoanApplication', JSON.stringify(formData));
      
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter ou créer un compte pour soumettre votre demande",
        variant: "default"
      });
      
      navigate('/auth?redirect=/apply');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
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
        });

      if (error) throw error;
      
      toast({
        title: "Demande envoyée !",
        description: "Votre demande de crédit a été soumise avec succès",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Détails du crédit" },
    { number: 2, title: "Infos personnelles" },
    { number: 3, title: "Infos financières" },
    { number: 4, title: "Adresse & Révision" },
  ];

  const getLoanTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      personal: "Crédit Personnel",
      auto: "Crédit Auto",
      home: "Crédit Travaux",
      consolidation: "Regroupement de Crédits",
      business: "Crédit Professionnel",
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Demande de Crédit</h1>
            <p className="text-lg text-muted-foreground">
              Complétez le formulaire ci-dessous pour obtenir votre pré-approbation instantanée
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
                  <h2 className="text-2xl font-bold text-foreground mb-6">Détails du Crédit</h2>
                  
                  <div>
                    <Label htmlFor="loanType">Type de crédit *</Label>
                    <Select value={formData.loanType} onValueChange={(value) => updateFormData("loanType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type de crédit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Crédit Personnel</SelectItem>
                        <SelectItem value="auto">Crédit Auto</SelectItem>
                        <SelectItem value="home">Crédit Travaux</SelectItem>
                        <SelectItem value="consolidation">Regroupement de Crédits</SelectItem>
                        <SelectItem value="business">Crédit Professionnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Montant du crédit (€) *</Label>
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
                    <p className="text-xs text-muted-foreground mt-1">Entre 1 000 € et 75 000 €</p>
                  </div>

                  <div>
                    <Label htmlFor="duration">Durée (mois) *</Label>
                    <Select value={formData.duration} onValueChange={(value) => updateFormData("duration", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la durée" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 mois</SelectItem>
                        <SelectItem value="24">24 mois</SelectItem>
                        <SelectItem value="36">36 mois</SelectItem>
                        <SelectItem value="48">48 mois</SelectItem>
                        <SelectItem value="60">60 mois</SelectItem>
                        <SelectItem value="72">72 mois</SelectItem>
                        <SelectItem value="84">84 mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Objet du crédit</Label>
                    <Input
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => updateFormData("purpose", e.target.value)}
                      placeholder="Ex: Mariage, Achat de voiture, Rénovation"
                      maxLength={500}
                    />
                  </div>
                </div>
              )}

              {/* Étape 2: Informations personnelles */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Informations Personnelles</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                        placeholder="Jean"
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
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
                    <Label htmlFor="email">Adresse e-mail *</Label>
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
                    <Label htmlFor="phone">Numéro de téléphone *</Label>
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
                    <Label htmlFor="birthDate">Date de naissance *</Label>
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
                  <h2 className="text-2xl font-bold text-foreground mb-6">Informations Financières</h2>
                  
                  <div>
                    <Label htmlFor="employmentStatus">Sélectionnez votre contrat *</Label>
                    <Select value={formData.employmentStatus} onValueChange={(value) => updateFormData("employmentStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre contrat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cdi">CDI</SelectItem>
                        <SelectItem value="cdd">CDD</SelectItem>
                        <SelectItem value="self-employed">Travailleur Indépendant</SelectItem>
                        <SelectItem value="retired">Retraité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dates de contrat pour CDD */}
                  {formData.employmentStatus === "cdd" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="contractStartDate">Date de début du contrat *</Label>
                        <Input
                          id="contractStartDate"
                          type="date"
                          value={formData.contractStartDate}
                          onChange={(e) => updateFormData("contractStartDate", e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contractEndDate">Date de fin du contrat *</Label>
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
                      <Label htmlFor="contractStartDate">Date de début du contrat *</Label>
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
                      <Label htmlFor="monthlyIncome">Revenu mensuel net (€) *</Label>
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
                      <Label htmlFor="annualRevenue">Chiffre d'affaires annuel (€) *</Label>
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
                    <Label htmlFor="bankName">Quelle est votre banque ? *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => updateFormData("bankName", e.target.value)}
                      placeholder="Ex: BNP Paribas, Crédit Agricole..."
                      maxLength={100}
                    />
                  </div>

                  {/* Statut de logement */}
                  <div>
                    <Label htmlFor="housingStatus">Statut de logement *</Label>
                    <Select value={formData.housingStatus} onValueChange={(value) => updateFormData("housingStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Propriétaire</SelectItem>
                        <SelectItem value="renter">Locataire</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date de bail pour locataire */}
                  {formData.housingStatus === "renter" && (
                    <div>
                      <Label htmlFor="leaseStartDate">Date de début du bail *</Label>
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
                        <Label htmlFor="hasMortgage">Crédit immobilier en cours ? *</Label>
                        <Select value={formData.hasMortgage} onValueChange={(value) => updateFormData("hasMortgage", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Oui</SelectItem>
                            <SelectItem value="no">Non</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.hasMortgage === "yes" && (
                        <div>
                          <Label htmlFor="monthlyMortgage">Mensualité du crédit immobilier (€) *</Label>
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
                  <h2 className="text-2xl font-bold text-foreground mb-6">Adresse</h2>
                  
                  <div>
                    <Label htmlFor="address">Adresse *</Label>
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
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        placeholder="Paris"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Code postal *</Label>
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
                    <h3 className="font-semibold mb-4 text-foreground">Récapitulatif de votre demande</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Type de crédit :</span> <span className="font-medium">{getLoanTypeLabel(formData.loanType)}</span></p>
                      <p><span className="text-muted-foreground">Montant :</span> <span className="font-medium">{Number(formData.amount).toLocaleString('fr-FR')} €</span></p>
                      <p><span className="text-muted-foreground">Durée :</span> <span className="font-medium">{formData.duration} mois</span></p>
                      <p><span className="text-muted-foreground">Nom :</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></p>
                      <p><span className="text-muted-foreground">Email :</span> <span className="font-medium">{formData.email}</span></p>
                      <p><span className="text-muted-foreground">Téléphone :</span> <span className="font-medium">{formData.phone}</span></p>
                      <p><span className="text-muted-foreground">Revenu mensuel :</span> <span className="font-medium">{Number(formData.monthlyIncome).toLocaleString('fr-FR')} €</span></p>
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mt-4">
                    <p className="text-xs text-muted-foreground">
                      En soumettant ce formulaire, vous acceptez que vos données soient traitées dans le cadre de votre demande de crédit. 
                      Vos informations sont sécurisées et confidentielles.
                    </p>
                  </div>
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button type="button" onClick={handleNext} className="ml-auto">
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                    {isSubmitting ? "Envoi en cours..." : "Soumettre la demande"}
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