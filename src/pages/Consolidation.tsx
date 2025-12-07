import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, TrendingDown } from "lucide-react";

const Consolidation = () => {
  const { t } = useTranslation();

  const benefits = [
    t("products.consolidation.benefits.singlePayment"),
    t("products.consolidation.benefits.lowerRate"),
    t("products.consolidation.benefits.simplified"),
    t("products.consolidation.benefits.fixedPayment"),
    t("products.consolidation.benefits.improveCredit"),
    t("products.consolidation.benefits.reduceStress"),
  ];

  const scenarioKeys = ["highInterest", "difficulty", "goodCredit", "stableIncome"] as const;

  const risks = [
    t("products.consolidation.risks.risk1"),
    t("products.consolidation.risks.risk2"),
    t("products.consolidation.risks.risk3"),
    t("products.consolidation.risks.risk4"),
    t("products.consolidation.risks.risk5"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("products.consolidation.title")}
                <br />
                <span className="text-accent-light">{t("products.consolidation.subtitle")}</span>
              </h1>
              <p className="text-xl mb-6 text-primary-foreground/90">
                {t("products.consolidation.description")}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm">{t("products.consolidation.reducePayments")}</span>
              </div>
            </div>
            <div>
              <CreditSimulator 
                minAmount={5000} 
                maxAmount={75000} 
                defaultAmount={15000} 
                minDuration={24}
                maxDuration={84}
                defaultDuration={60}
                interestRate={5.2} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.consolidation.benefitsTitle")}</h2>
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
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{t("products.consolidation.whenToTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarioKeys.map((key) => (
              <Card key={key} className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-8 w-8 text-success flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {t(`products.consolidation.scenarios.${key}.title`)}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`products.consolidation.scenarios.${key}.description`)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-6">
            <h2 className="text-3xl font-bold text-foreground">{t("products.consolidation.guideTitle")}</h2>
            
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-6 my-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-warning flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-foreground mb-3">{t("products.consolidation.risksTitle")}</h4>
                  <ul className="space-y-2 text-foreground">
                    {risks.map((risk, index) => (
                      <li key={index} className="text-sm leading-relaxed">• {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.consolidation.faqTitle")}</h2>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Consolidation;