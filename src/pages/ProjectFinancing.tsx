import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  FileText,
  Building2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const ProjectFinancing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Validation schemas with translations
  const step1Schema = z.object({
    projectType: z.string().min(1, t("products.projectFinancing.validation.projectTypeRequired")),
    projectName: z.string().min(3, t("products.projectFinancing.validation.projectNameMin")),
    projectDescription: z.string().min(50, t("products.projectFinancing.validation.projectDescriptionMin")),
    projectSector: z.string().min(1, t("products.projectFinancing.validation.projectSectorRequired")),
    projectLocation: z.string().min(1, t("products.projectFinancing.validation.projectLocationRequired")),
  });

  const step2Schema = z.object({
    fundingAmount: z.string().min(1, t("products.projectFinancing.validation.fundingAmountRequired")),
    fundingPurpose: z.string().min(1, t("products.projectFinancing.validation.fundingPurposeRequired")),
    expectedRevenue: z.string().min(1, t("products.projectFinancing.validation.expectedRevenueRequired")),
    projectDuration: z.string().min(1, t("products.projectFinancing.validation.projectDurationRequired")),
    breakEvenDate: z.string().min(1, t("products.projectFinancing.validation.breakEvenDateRequired")),
    ownContribution: z.string().min(1, t("products.projectFinancing.validation.ownContributionRequired")),
  });

  const step3Schema = z.object({
    companyName: z.string().min(2, t("products.projectFinancing.validation.companyNameRequired")),
    companyStatus: z.string().min(1, t("products.projectFinancing.validation.companyStatusRequired")),
    siret: z.string().regex(/^\d{14}$/, t("products.projectFinancing.validation.siretInvalid")).optional().or(z.literal("")),
    creationDate: z.string().min(1, t("products.projectFinancing.validation.creationDateRequired")),
    employeeCount: z.string().min(1, t("products.projectFinancing.validation.employeeCountRequired")),
    annualRevenue: z.string().min(1, t("products.projectFinancing.validation.annualRevenueRequired")),
    founderFirstName: z.string().min(2, t("products.projectFinancing.validation.firstNameRequired")),
    founderLastName: z.string().min(2, t("products.projectFinancing.validation.lastNameRequired")),
    founderEmail: z.string().email(t("products.projectFinancing.validation.emailInvalid")),
    founderPhone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, t("products.projectFinancing.validation.phoneInvalid")),
  });

  const step4Schema = z.object({
    businessPlan: z.string().min(1, t("products.projectFinancing.validation.businessPlanRequired")),
    financialProjections: z.string().min(1, t("products.projectFinancing.validation.financialProjectionsRequired")),
    marketStudy: z.string().min(1, t("products.projectFinancing.validation.marketStudyRequired")),
    additionalInfo: z.string().optional(),
  });

  const [formData, setFormData] = useState({
    projectType: "",
    projectName: "",
    projectDescription: "",
    projectSector: "",
    projectLocation: "",
    fundingAmount: "",
    fundingPurpose: "",
    expectedRevenue: "",
    projectDuration: "",
    breakEvenDate: "",
    ownContribution: "",
    companyName: "",
    companyStatus: "",
    siret: "",
    creationDate: "",
    employeeCount: "",
    annualRevenue: "",
    founderFirstName: "",
    founderLastName: "",
    founderEmail: "",
    founderPhone: "",
    businessPlan: "",
    financialProjections: "",
    marketStudy: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number) => {
    try {
      if (step === 1) {
        step1Schema.parse({
          projectType: formData.projectType,
          projectName: formData.projectName,
          projectDescription: formData.projectDescription,
          projectSector: formData.projectSector,
          projectLocation: formData.projectLocation,
        });
      } else if (step === 2) {
        step2Schema.parse({
          fundingAmount: formData.fundingAmount,
          fundingPurpose: formData.fundingPurpose,
          expectedRevenue: formData.expectedRevenue,
          projectDuration: formData.projectDuration,
          breakEvenDate: formData.breakEvenDate,
          ownContribution: formData.ownContribution,
        });
      } else if (step === 3) {
        step3Schema.parse({
          companyName: formData.companyName,
          companyStatus: formData.companyStatus,
          siret: formData.siret,
          creationDate: formData.creationDate,
          employeeCount: formData.employeeCount,
          annualRevenue: formData.annualRevenue,
          founderFirstName: formData.founderFirstName,
          founderLastName: formData.founderLastName,
          founderEmail: formData.founderEmail,
          founderPhone: formData.founderPhone,
        });
      } else if (step === 4) {
        step4Schema.parse({
          businessPlan: formData.businessPlan,
          financialProjections: formData.financialProjections,
          marketStudy: formData.marketStudy,
          additionalInfo: formData.additionalInfo,
        });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast({
        title: t("products.projectFinancing.validation.validationError"),
        description: t("products.projectFinancing.validation.correctErrors"),
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (validateStep(4)) {
      sessionStorage.setItem("projectFinancingData", JSON.stringify(formData));
      toast({
        title: t("products.projectFinancing.messages.success"),
        description: t("products.projectFinancing.messages.successDesc"),
      });
      navigate("/apply/confirmation");
    } else {
      toast({
        title: t("products.projectFinancing.validation.validationError"),
        description: t("products.projectFinancing.validation.correctErrors"),
        variant: "destructive",
      });
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const stepIcons = [
    { icon: Briefcase, title: t("products.projectFinancing.steps.project") },
    { icon: FileText, title: t("products.projectFinancing.steps.funding") },
    { icon: Building2, title: t("products.projectFinancing.steps.company") },
    { icon: CheckCircle, title: t("products.projectFinancing.steps.documents") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            {t("products.projectFinancing.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("products.projectFinancing.subtitle")}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepIcons.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              const StepIcon = step.icon;

              return (
                <div key={stepNumber} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-success text-success-foreground"
                        : isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <StepIcon className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Form Steps */}
        <Card className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {t("products.projectFinancing.step1.title")}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectType">{t("products.projectFinancing.step1.projectType")} *</Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value) => updateFormData("projectType", value)}
                  >
                    <SelectTrigger className={errors.projectType ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("products.projectFinancing.step1.projectTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">{t("products.projectFinancing.step1.projectTypes.startup")}</SelectItem>
                      <SelectItem value="development">{t("products.projectFinancing.step1.projectTypes.development")}</SelectItem>
                      <SelectItem value="acquisition">{t("products.projectFinancing.step1.projectTypes.acquisition")}</SelectItem>
                      <SelectItem value="real-estate">{t("products.projectFinancing.step1.projectTypes.realEstate")}</SelectItem>
                      <SelectItem value="innovation">{t("products.projectFinancing.step1.projectTypes.innovation")}</SelectItem>
                      <SelectItem value="expansion">{t("products.projectFinancing.step1.projectTypes.expansion")}</SelectItem>
                      <SelectItem value="other">{t("products.projectFinancing.step1.projectTypes.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectType && (
                    <p className="text-sm text-destructive mt-1">{errors.projectType}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectName">{t("products.projectFinancing.step1.projectName")} *</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => updateFormData("projectName", e.target.value)}
                    placeholder={t("products.projectFinancing.step1.projectNamePlaceholder")}
                    className={errors.projectName ? "border-destructive" : ""}
                  />
                  {errors.projectName && (
                    <p className="text-sm text-destructive mt-1">{errors.projectName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectDescription">{t("products.projectFinancing.step1.projectDescription")} *</Label>
                  <Textarea
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={(e) => updateFormData("projectDescription", e.target.value)}
                    placeholder={t("products.projectFinancing.step1.projectDescriptionPlaceholder")}
                    rows={6}
                    className={errors.projectDescription ? "border-destructive" : ""}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("products.projectFinancing.step1.minChars")} ({formData.projectDescription.length}/50)
                  </p>
                  {errors.projectDescription && (
                    <p className="text-sm text-destructive mt-1">{errors.projectDescription}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectSector">{t("products.projectFinancing.step1.projectSector")} *</Label>
                  <Select
                    value={formData.projectSector}
                    onValueChange={(value) => updateFormData("projectSector", value)}
                  >
                    <SelectTrigger className={errors.projectSector ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("products.projectFinancing.step1.projectSectorPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">{t("products.projectFinancing.step1.sectors.tech")}</SelectItem>
                      <SelectItem value="retail">{t("products.projectFinancing.step1.sectors.retail")}</SelectItem>
                      <SelectItem value="services">{t("products.projectFinancing.step1.sectors.services")}</SelectItem>
                      <SelectItem value="industry">{t("products.projectFinancing.step1.sectors.industry")}</SelectItem>
                      <SelectItem value="health">{t("products.projectFinancing.step1.sectors.health")}</SelectItem>
                      <SelectItem value="food">{t("products.projectFinancing.step1.sectors.food")}</SelectItem>
                      <SelectItem value="real-estate">{t("products.projectFinancing.step1.sectors.realEstate")}</SelectItem>
                      <SelectItem value="energy">{t("products.projectFinancing.step1.sectors.energy")}</SelectItem>
                      <SelectItem value="education">{t("products.projectFinancing.step1.sectors.education")}</SelectItem>
                      <SelectItem value="tourism">{t("products.projectFinancing.step1.sectors.tourism")}</SelectItem>
                      <SelectItem value="other">{t("products.projectFinancing.step1.sectors.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectSector && (
                    <p className="text-sm text-destructive mt-1">{errors.projectSector}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectLocation">{t("products.projectFinancing.step1.projectLocation")} *</Label>
                  <Input
                    id="projectLocation"
                    value={formData.projectLocation}
                    onChange={(e) => updateFormData("projectLocation", e.target.value)}
                    placeholder={t("products.projectFinancing.step1.projectLocationPlaceholder")}
                    className={errors.projectLocation ? "border-destructive" : ""}
                  />
                  {errors.projectLocation && (
                    <p className="text-sm text-destructive mt-1">{errors.projectLocation}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {t("products.projectFinancing.step2.title")}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fundingAmount">{t("products.projectFinancing.step2.fundingAmount")} *</Label>
                  <Input
                    id="fundingAmount"
                    type="number"
                    value={formData.fundingAmount}
                    onChange={(e) => updateFormData("fundingAmount", e.target.value)}
                    placeholder="Ex: 500000"
                    className={errors.fundingAmount ? "border-destructive" : ""}
                  />
                  <p className="text-sm text-muted-foreground mt-1">{t("products.projectFinancing.step2.inEuros")}</p>
                  {errors.fundingAmount && (
                    <p className="text-sm text-destructive mt-1">{errors.fundingAmount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fundingPurpose">{t("products.projectFinancing.step2.fundingPurpose")} *</Label>
                  <Textarea
                    id="fundingPurpose"
                    value={formData.fundingPurpose}
                    onChange={(e) => updateFormData("fundingPurpose", e.target.value)}
                    placeholder={t("products.projectFinancing.step2.fundingPurposePlaceholder")}
                    rows={4}
                    className={errors.fundingPurpose ? "border-destructive" : ""}
                  />
                  {errors.fundingPurpose && (
                    <p className="text-sm text-destructive mt-1">{errors.fundingPurpose}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ownContribution">{t("products.projectFinancing.step2.ownContribution")} *</Label>
                  <Input
                    id="ownContribution"
                    type="number"
                    value={formData.ownContribution}
                    onChange={(e) => updateFormData("ownContribution", e.target.value)}
                    placeholder="Ex: 100000"
                    className={errors.ownContribution ? "border-destructive" : ""}
                  />
                  <p className="text-sm text-muted-foreground mt-1">{t("products.projectFinancing.step2.inEuros")}</p>
                  {errors.ownContribution && (
                    <p className="text-sm text-destructive mt-1">{errors.ownContribution}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expectedRevenue">{t("products.projectFinancing.step2.expectedRevenue")} *</Label>
                  <Input
                    id="expectedRevenue"
                    type="number"
                    value={formData.expectedRevenue}
                    onChange={(e) => updateFormData("expectedRevenue", e.target.value)}
                    placeholder="Ex: 200000"
                    className={errors.expectedRevenue ? "border-destructive" : ""}
                  />
                  {errors.expectedRevenue && (
                    <p className="text-sm text-destructive mt-1">{errors.expectedRevenue}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectDuration">{t("products.projectFinancing.step2.projectDuration")} *</Label>
                  <Select
                    value={formData.projectDuration}
                    onValueChange={(value) => updateFormData("projectDuration", value)}
                  >
                    <SelectTrigger className={errors.projectDuration ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("products.projectFinancing.step2.projectDuration")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-6">{t("products.projectFinancing.step2.durationOptions.short")}</SelectItem>
                      <SelectItem value="6-12">{t("products.projectFinancing.step2.durationOptions.medium")}</SelectItem>
                      <SelectItem value="12-24">{t("products.projectFinancing.step2.durationOptions.long")}</SelectItem>
                      <SelectItem value="24+">{t("products.projectFinancing.step2.durationOptions.veryLong")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectDuration && (
                    <p className="text-sm text-destructive mt-1">{errors.projectDuration}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="breakEvenDate">{t("products.projectFinancing.step2.breakEvenDate")} *</Label>
                  <Input
                    id="breakEvenDate"
                    type="date"
                    value={formData.breakEvenDate}
                    onChange={(e) => updateFormData("breakEvenDate", e.target.value)}
                    className={errors.breakEvenDate ? "border-destructive" : ""}
                  />
                  {errors.breakEvenDate && (
                    <p className="text-sm text-destructive mt-1">{errors.breakEvenDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {t("products.projectFinancing.step3.title")}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">{t("products.projectFinancing.step3.companyName")} *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData("companyName", e.target.value)}
                    className={errors.companyName ? "border-destructive" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyStatus">{t("products.projectFinancing.step3.companyStatus")} *</Label>
                  <Select
                    value={formData.companyStatus}
                    onValueChange={(value) => updateFormData("companyStatus", value)}
                  >
                    <SelectTrigger className={errors.companyStatus ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("products.projectFinancing.step3.companyStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ae">{t("products.projectFinancing.step3.statusOptions.ae")}</SelectItem>
                      <SelectItem value="sarl">{t("products.projectFinancing.step3.statusOptions.sarl")}</SelectItem>
                      <SelectItem value="sas">{t("products.projectFinancing.step3.statusOptions.sas")}</SelectItem>
                      <SelectItem value="sa">{t("products.projectFinancing.step3.statusOptions.sa")}</SelectItem>
                      <SelectItem value="ei">{t("products.projectFinancing.step3.statusOptions.ei")}</SelectItem>
                      <SelectItem value="creation">{t("products.projectFinancing.step3.statusOptions.creation")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.companyStatus && (
                    <p className="text-sm text-destructive mt-1">{errors.companyStatus}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="siret">{t("products.projectFinancing.step3.siret")}</Label>
                  <Input
                    id="siret"
                    value={formData.siret}
                    onChange={(e) => updateFormData("siret", e.target.value)}
                    maxLength={14}
                    className={errors.siret ? "border-destructive" : ""}
                  />
                  {errors.siret && (
                    <p className="text-sm text-destructive mt-1">{errors.siret}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="creationDate">{t("products.projectFinancing.step3.creationDate")} *</Label>
                  <Input
                    id="creationDate"
                    type="date"
                    value={formData.creationDate}
                    onChange={(e) => updateFormData("creationDate", e.target.value)}
                    className={errors.creationDate ? "border-destructive" : ""}
                  />
                  {errors.creationDate && (
                    <p className="text-sm text-destructive mt-1">{errors.creationDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="employeeCount">{t("products.projectFinancing.step3.employeeCount")} *</Label>
                  <Select
                    value={formData.employeeCount}
                    onValueChange={(value) => updateFormData("employeeCount", value)}
                  >
                    <SelectTrigger className={errors.employeeCount ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("products.projectFinancing.step3.employeeCount")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t("products.projectFinancing.step3.employeeOptions.solo")}</SelectItem>
                      <SelectItem value="1-5">{t("products.projectFinancing.step3.employeeOptions.small")}</SelectItem>
                      <SelectItem value="6-20">{t("products.projectFinancing.step3.employeeOptions.medium")}</SelectItem>
                      <SelectItem value="21-50">{t("products.projectFinancing.step3.employeeOptions.large")}</SelectItem>
                      <SelectItem value="50+">{t("products.projectFinancing.step3.employeeOptions.veryLarge")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.employeeCount && (
                    <p className="text-sm text-destructive mt-1">{errors.employeeCount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="annualRevenue">{t("products.projectFinancing.step3.annualRevenue")} *</Label>
                  <Select
                    value={formData.annualRevenue}
                    onValueChange={(value) => updateFormData("annualRevenue", value)}
                  >
                    <SelectTrigger className={errors.annualRevenue ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("products.projectFinancing.step3.annualRevenue")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-revenue">{t("products.projectFinancing.step3.revenueOptions.preRevenue")}</SelectItem>
                      <SelectItem value="0-50k">{t("products.projectFinancing.step3.revenueOptions.small")}</SelectItem>
                      <SelectItem value="50k-200k">{t("products.projectFinancing.step3.revenueOptions.medium")}</SelectItem>
                      <SelectItem value="200k-500k">{t("products.projectFinancing.step3.revenueOptions.large")}</SelectItem>
                      <SelectItem value="500k-1m">{t("products.projectFinancing.step3.revenueOptions.veryLarge")}</SelectItem>
                      <SelectItem value="1m+">{t("products.projectFinancing.step3.revenueOptions.enterprise")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.annualRevenue && (
                    <p className="text-sm text-destructive mt-1">{errors.annualRevenue}</p>
                  )}
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t("products.projectFinancing.step3.founderInfo")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="founderFirstName">{t("products.projectFinancing.step3.firstName")} *</Label>
                      <Input
                        id="founderFirstName"
                        value={formData.founderFirstName}
                        onChange={(e) => updateFormData("founderFirstName", e.target.value)}
                        className={errors.founderFirstName ? "border-destructive" : ""}
                      />
                      {errors.founderFirstName && (
                        <p className="text-sm text-destructive mt-1">{errors.founderFirstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="founderLastName">{t("products.projectFinancing.step3.lastName")} *</Label>
                      <Input
                        id="founderLastName"
                        value={formData.founderLastName}
                        onChange={(e) => updateFormData("founderLastName", e.target.value)}
                        className={errors.founderLastName ? "border-destructive" : ""}
                      />
                      {errors.founderLastName && (
                        <p className="text-sm text-destructive mt-1">{errors.founderLastName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="founderEmail">{t("products.projectFinancing.step3.email")} *</Label>
                      <Input
                        id="founderEmail"
                        type="email"
                        value={formData.founderEmail}
                        onChange={(e) => updateFormData("founderEmail", e.target.value)}
                        className={errors.founderEmail ? "border-destructive" : ""}
                      />
                      {errors.founderEmail && (
                        <p className="text-sm text-destructive mt-1">{errors.founderEmail}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="founderPhone">{t("products.projectFinancing.step3.phone")} *</Label>
                      <Input
                        id="founderPhone"
                        type="tel"
                        value={formData.founderPhone}
                        onChange={(e) => updateFormData("founderPhone", e.target.value)}
                        className={errors.founderPhone ? "border-destructive" : ""}
                      />
                      {errors.founderPhone && (
                        <p className="text-sm text-destructive mt-1">{errors.founderPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {t("products.projectFinancing.step4.title")}
                </h2>
                <p className="text-muted-foreground">
                  {t("products.projectFinancing.step4.documentsDescription")}
                </p>
              </div>

              <div className="space-y-6">
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{t("products.projectFinancing.step4.businessPlan")}</h4>
                      <p className="text-sm text-muted-foreground">{t("products.projectFinancing.step4.businessPlanDesc")}</p>
                    </div>
                    <Select
                      value={formData.businessPlan}
                      onValueChange={(value) => updateFormData("businessPlan", value)}
                    >
                      <SelectTrigger className={`w-48 ${errors.businessPlan ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t("products.projectFinancing.step4.available")}</SelectItem>
                        <SelectItem value="in-progress">{t("products.projectFinancing.step4.inProgress")}</SelectItem>
                        <SelectItem value="not-available">{t("products.projectFinancing.step4.notAvailable")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.businessPlan && (
                    <p className="text-sm text-destructive mt-2">{errors.businessPlan}</p>
                  )}
                </Card>

                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{t("products.projectFinancing.step4.financialProjections")}</h4>
                      <p className="text-sm text-muted-foreground">{t("products.projectFinancing.step4.financialProjectionsDesc")}</p>
                    </div>
                    <Select
                      value={formData.financialProjections}
                      onValueChange={(value) => updateFormData("financialProjections", value)}
                    >
                      <SelectTrigger className={`w-48 ${errors.financialProjections ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t("products.projectFinancing.step4.available")}</SelectItem>
                        <SelectItem value="in-progress">{t("products.projectFinancing.step4.inProgress")}</SelectItem>
                        <SelectItem value="not-available">{t("products.projectFinancing.step4.notAvailable")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.financialProjections && (
                    <p className="text-sm text-destructive mt-2">{errors.financialProjections}</p>
                  )}
                </Card>

                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{t("products.projectFinancing.step4.marketStudy")}</h4>
                      <p className="text-sm text-muted-foreground">{t("products.projectFinancing.step4.marketStudyDesc")}</p>
                    </div>
                    <Select
                      value={formData.marketStudy}
                      onValueChange={(value) => updateFormData("marketStudy", value)}
                    >
                      <SelectTrigger className={`w-48 ${errors.marketStudy ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t("products.projectFinancing.step4.available")}</SelectItem>
                        <SelectItem value="in-progress">{t("products.projectFinancing.step4.inProgress")}</SelectItem>
                        <SelectItem value="not-available">{t("products.projectFinancing.step4.notAvailable")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.marketStudy && (
                    <p className="text-sm text-destructive mt-2">{errors.marketStudy}</p>
                  )}
                </Card>

                <div>
                  <Label htmlFor="additionalInfo">{t("products.projectFinancing.step4.additionalInfo")}</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => updateFormData("additionalInfo", e.target.value)}
                    placeholder={t("products.projectFinancing.step4.additionalInfoPlaceholder")}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("products.projectFinancing.navigation.previous")}
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {t("products.projectFinancing.navigation.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2"
              >
                {t("products.projectFinancing.navigation.submit")}
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectFinancing;