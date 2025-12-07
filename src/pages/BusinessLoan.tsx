import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import { Card } from "@/components/ui/card";
import { Briefcase, CheckCircle } from "lucide-react";

const BusinessLoan = () => {
  const { t } = useTranslation();

  const benefits = [
    t("products.businessLoan.benefits.amounts"),
    t("products.businessLoan.benefits.flexibleTerms"),
    t("products.businessLoan.benefits.fastApproval"),
    t("products.businessLoan.benefits.anyProject"),
    t("products.businessLoan.benefits.competitiveRates"),
    t("products.businessLoan.benefits.preserveCash"),
  ];

  const useCaseKeys = ["workingCapital", "equipment", "expansion", "marketing", "inventory", "refinancing"] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-10 w-10" />
                <h1 className="text-4xl md:text-5xl font-bold">{t("products.businessLoan.title")}</h1>
              </div>
              <p className="text-xl mb-6 text-primary-foreground/90">
                {t("products.businessLoan.description")}
              </p>
            </div>
            <div>
              <CreditSimulator 
                minAmount={5000} 
                maxAmount={75000} 
                defaultAmount={25000} 
                minDuration={12}
                maxDuration={84}
                defaultDuration={48}
                interestRate={6.5} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.businessLoan.whyChoose")}</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{t("products.businessLoan.useCasesTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCaseKeys.map((key) => (
              <Card key={key} className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t(`products.businessLoan.useCases.${key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {t(`products.businessLoan.useCases.${key}.description`)}
                </p>
                <div className="text-xs text-accent font-semibold">
                  {t("products.businessLoan.typicalAmount")}: {t(`products.businessLoan.useCases.${key}.typical`)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-6">
            <h2 className="text-3xl font-bold text-foreground">{t("products.businessLoan.guideTitle")}</h2>
            <h3 className="text-xl font-semibold text-foreground mt-8">{t("products.businessLoan.guide.introTitle")}</h3>
            <p className="text-muted-foreground leading-relaxed">{t("products.businessLoan.guide.introP1")}</p>
            <p className="text-muted-foreground leading-relaxed">{t("products.businessLoan.guide.introP2")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-8">{t("products.businessLoan.guide.typesTitle")}</h3>
            <ul className="space-y-3">
              {["shortTerm", "mediumTerm", "longTerm", "creditLine"].map((type) => (
                <li key={type} className="text-muted-foreground">{t(`products.businessLoan.guide.types.${type}`)}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-8">{t("products.businessLoan.guide.eligibilityTitle")}</h3>
            <p className="text-muted-foreground">{t("products.businessLoan.guide.eligibilityIntro")}</p>
            <ul className="space-y-2">
              {["registered", "activity", "revenues", "documents", "project"].map((item) => (
                <li key={item} className="text-muted-foreground">• {t(`products.businessLoan.guide.eligibility.${item}`)}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-8">{t("products.businessLoan.guide.documentsTitle")}</h3>
            <p className="text-muted-foreground">{t("products.businessLoan.guide.documentsIntro")}</p>
            <ul className="space-y-2">
              {["identity", "kbis", "financials", "bankStatements", "taxReturns", "businessPlan"].map((doc) => (
                <li key={doc} className="text-muted-foreground">• {t(`products.businessLoan.guide.documents.${doc}`)}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-8">{t("products.businessLoan.guide.tipsTitle")}</h3>
            <ul className="space-y-2">
              {["tip1", "tip2", "tip3", "tip4", "tip5"].map((tip) => (
                <li key={tip} className="text-muted-foreground">• {t(`products.businessLoan.guide.tips.${tip}`)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.businessLoan.faqTitle")}</h2>
          <div className="space-y-4">
            {["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"].map((q, index) => (
              <Card key={q} className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(`products.businessLoan.faq.${q}`)}</h3>
                <p className="text-muted-foreground">{t(`products.businessLoan.faq.a${index + 1}`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BusinessLoan;