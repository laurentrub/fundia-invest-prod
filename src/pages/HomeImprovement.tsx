import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import { Card } from "@/components/ui/card";
import { Home, CheckCircle } from "lucide-react";

const HomeImprovement = () => {
  const { t } = useTranslation();

  const benefits = [
    t("products.homeImprovement.benefits.amounts"),
    t("products.homeImprovement.benefits.rates"),
    t("products.homeImprovement.benefits.terms"),
    t("products.homeImprovement.benefits.noCollateral"),
    t("products.homeImprovement.benefits.allProjects"),
    t("products.homeImprovement.benefits.fastApproval"),
  ];

  const projectExamples = [
    {
      key: "kitchen",
      amount: "15 000 €",
      duration: "60 mois",
      monthly: "276 €",
    },
    {
      key: "bathroom",
      amount: "10 000 €",
      duration: "48 mois",
      monthly: "227 €",
    },
    {
      key: "extension",
      amount: "40 000 €",
      duration: "120 mois",
      monthly: "444 €",
    },
    {
      key: "energy",
      amount: "8 000 €",
      duration: "60 mois",
      monthly: "147 €",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Home className="h-10 w-10" />
                <h1 className="text-4xl md:text-5xl font-bold">{t("products.homeImprovement.title")}</h1>
              </div>
              <p className="text-xl mb-6 text-primary-foreground/90">
                {t("products.homeImprovement.description")}
              </p>
            </div>
            <div>
              <CreditSimulator 
                minAmount={3000} 
                maxAmount={75000} 
                defaultAmount={15000} 
                minDuration={12}
                maxDuration={180}
                defaultDuration={60}
                interestRate={4.5} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.homeImprovement.whyChoose")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{t("products.homeImprovement.projectsTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectExamples.map((example) => (
              <Card key={example.key} className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t(`products.homeImprovement.projects.${example.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(`products.homeImprovement.projects.${example.key}.description`)}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("products.homeImprovement.loanAmount")}</div>
                    <div className="text-lg font-bold text-accent">{example.amount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("products.homeImprovement.monthlyPayment")}</div>
                    <div className="text-lg font-bold text-success">{example.monthly}{t("common.perMonth")}</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {t("products.homeImprovement.durationAt", { duration: example.duration, rate: "4,5" })}
                </div>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6 text-center">
            {t("products.homeImprovement.projectsDisclaimer")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-6">
            <h2 className="text-3xl font-bold text-foreground">{t("products.homeImprovement.guideTitle")}</h2>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.homeImprovement.faqTitle")}</h2>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeImprovement;