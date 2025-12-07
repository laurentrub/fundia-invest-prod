import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import { Card } from "@/components/ui/card";
import { Car, CheckCircle } from "lucide-react";

const AutoLoan = () => {
  const { t } = useTranslation();

  const benefits = [
    t("products.autoLoan.benefits.newUsed"),
    t("products.autoLoan.benefits.competitiveRates"),
    t("products.autoLoan.benefits.upTo"),
    t("products.autoLoan.benefits.flexibleTerms"),
    t("products.autoLoan.benefits.noDownPayment"),
    t("products.autoLoan.benefits.fastApproval"),
  ];

  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Car className="h-10 w-10" />
                <h1 className="text-4xl md:text-5xl font-bold">{t("products.autoLoan.title")}</h1>
              </div>
              <p className="text-xl mb-6 text-primary-foreground/90">
                {t("products.autoLoan.description")}
              </p>
            </div>
            <div>
              <CreditSimulator minAmount={5000} maxAmount={50000} defaultAmount={20000} minDuration={12} maxDuration={72} defaultDuration={60} interestRate={3.9} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">{t("products.autoLoan.benefitsTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 prose prose-lg max-w-none space-y-6">
            <h2 className="text-3xl font-bold text-foreground">{t("products.autoLoan.guideTitle")}</h2>
            
            <h3 className="text-2xl font-bold text-foreground">{t("products.autoLoan.guide.whatIsTitle")}</h3>
            <p className="text-foreground leading-relaxed">
              {t("products.autoLoan.guide.whatIsP1")}
            </p>
            <p className="text-foreground leading-relaxed">
              {t("products.autoLoan.guide.whatIsP2")}
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">{t("products.autoLoan.guide.benefitsTitle")}</h3>
            <p className="text-foreground leading-relaxed">
              {t("products.autoLoan.guide.benefitsIntro")}
            </p>
            <ul className="space-y-2 text-foreground">
              <li><strong>{t("products.autoLoan.guide.benefitsList.savings")}</strong></li>
              <li><strong>{t("products.autoLoan.guide.benefitsList.credit")}</strong></li>
              <li><strong>{t("products.autoLoan.guide.benefitsList.betterCar")}</strong></li>
              <li><strong>{t("products.autoLoan.guide.benefitsList.fixedPayments")}</strong></li>
              <li><strong>{t("products.autoLoan.guide.benefitsList.flexibleTerms")}</strong></li>
              <li><strong>{t("products.autoLoan.guide.benefitsList.taxBenefits")}</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Auto Loan FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.autoLoan.faqTitle")}</h2>
          <div className="space-y-6">
            {faqKeys.map((key) => (
              <Card key={key} className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(`products.autoLoan.faqs.${key}`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`products.autoLoan.faqs.a${key.slice(1)}`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AutoLoan;