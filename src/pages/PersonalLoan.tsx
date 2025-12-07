import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import { Card } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Shield, Clock } from "lucide-react";

const PersonalLoan = () => {
  const { t } = useTranslation();

  const benefits = [
    t("products.personalLoan.benefits.noCollateral"),
    t("products.personalLoan.benefits.flexibleTerms"),
    t("products.personalLoan.benefits.earlyRepayment"),
    t("products.personalLoan.benefits.fastFunds"),
    t("products.personalLoan.benefits.onlineProcess"),
    t("products.personalLoan.benefits.transparentFees"),
  ];

  const examples = [
    { amount: "5 000€", duration: "36 mois", monthly: "151€", apr: "4,2%", total: "5 436€" },
    { amount: "10 000€", duration: "48 mois", monthly: "221€", apr: "4,9%", total: "10 608€" },
    { amount: "20 000€", duration: "60 mois", monthly: "395€", apr: "5,5%", total: "23 700€" },
    { amount: "30 000€", duration: "72 mois", monthly: "504€", apr: "6,2%", total: "36 288€" },
  ];

  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero with Simulator */}
      <section className="bg-gradient-hero text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("products.personalLoan.title")}
                <br />
                <span className="text-accent-light">{t("products.personalLoan.subtitle")}</span>
              </h1>
              <p className="text-xl mb-6 text-primary-foreground/90">
                {t("products.personalLoan.description")}
              </p>
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">{t("products.personalLoan.approvalTime")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">{t("products.personalLoan.secure")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">{t("products.personalLoan.fromRate")}</span>
                </div>
              </div>
            </div>
            <div>
              <CreditSimulator minAmount={1000} maxAmount={75000} defaultAmount={10000} interestRate={4.9} />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.personalLoan.whyChoose")}</h2>
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

      {/* Examples Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{t("products.personalLoan.examplesTitle")}</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className="px-6 py-4 text-left">{t("products.personalLoan.tableHeaders.amount")}</th>
                    <th className="px-6 py-4 text-left">{t("products.personalLoan.tableHeaders.duration")}</th>
                    <th className="px-6 py-4 text-left">{t("products.personalLoan.tableHeaders.monthly")}</th>
                    <th className="px-6 py-4 text-left">{t("products.personalLoan.tableHeaders.apr")}</th>
                    <th className="px-6 py-4 text-left">{t("products.personalLoan.tableHeaders.totalCost")}</th>
                  </tr>
                </thead>
                <tbody>
                  {examples.map((example, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-6 py-4 font-semibold text-foreground">{example.amount}</td>
                      <td className="px-6 py-4 text-muted-foreground">{example.duration}</td>
                      <td className="px-6 py-4 text-success font-semibold">{example.monthly}{t("common.perMonth")}</td>
                      <td className="px-6 py-4 text-muted-foreground">{example.apr}</td>
                      <td className="px-6 py-4 text-foreground">{example.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {t("products.personalLoan.examplesDisclaimer")}
          </p>
        </div>
      </section>

      {/* Detailed Content for SEO */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-6">
            <h2 className="text-3xl font-bold text-foreground">{t("products.personalLoan.guideTitle")}</h2>
            
            <h3 className="text-2xl font-bold text-foreground mt-8">{t("products.personalLoan.guide.whatIsTitle")}</h3>
            <p className="text-foreground leading-relaxed">
              {t("products.personalLoan.guide.whatIsP1")}
            </p>
            <p className="text-foreground leading-relaxed">
              {t("products.personalLoan.guide.whatIsP2")}
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">{t("products.personalLoan.guide.usesTitle")}</h3>
            <ul className="space-y-2 text-foreground">
              <li><strong>{t("products.personalLoan.guide.uses.consolidation")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.uses.renovation")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.uses.purchases")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.uses.medical")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.uses.wedding")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.uses.education")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.uses.vacation")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.uses.emergency")}</strong></li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">{t("products.personalLoan.guide.qualifyTitle")}</h3>
            <p className="text-foreground leading-relaxed">
              {t("products.personalLoan.guide.qualifyIntro")}
            </p>
            <ul className="space-y-2 text-foreground">
              <li>{t("products.personalLoan.guide.qualifyItems.age")}</li>
              <li>{t("products.personalLoan.guide.qualifyItems.residency")}</li>
              <li>{t("products.personalLoan.guide.qualifyItems.income")}</li>
              <li>{t("products.personalLoan.guide.qualifyItems.debtRatio")}</li>
              <li>{t("products.personalLoan.guide.qualifyItems.documents")}</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">{t("products.personalLoan.guide.aprTitle")}</h3>
            <p className="text-foreground leading-relaxed">
              {t("products.personalLoan.guide.aprIntro")}
            </p>
            <ul className="space-y-2 text-foreground">
              <li><strong>{t("products.personalLoan.guide.aprFactors.creditScore")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.aprFactors.loanAmount")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.aprFactors.loanTerm")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.aprFactors.debtRatio")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.aprFactors.incomeStability")}</strong></li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">{t("products.personalLoan.guide.processTitle")}</h3>
            <ol className="space-y-3 list-decimal list-inside text-foreground">
              <li><strong>{t("products.personalLoan.guide.processSteps.step1")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.processSteps.step2")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.processSteps.step3")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.processSteps.step4")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.processSteps.step5")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.processSteps.step6")}</strong></li>
              <li><strong>{t("products.personalLoan.guide.processSteps.step7")}</strong></li>
            </ol>

            <h3 className="text-2xl font-bold text-foreground mt-8">{t("products.personalLoan.guide.tipsTitle")}</h3>
            <ul className="space-y-2 text-foreground">
              <li>{t("products.personalLoan.guide.tips.tip1")}</li>
              <li>{t("products.personalLoan.guide.tips.tip2")}</li>
              <li>{t("products.personalLoan.guide.tips.tip3")}</li>
              <li>{t("products.personalLoan.guide.tips.tip4")}</li>
              <li>{t("products.personalLoan.guide.tips.tip5")}</li>
              <li>{t("products.personalLoan.guide.tips.tip6")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("products.personalLoan.faqTitle")}</h2>
          <div className="space-y-6">
            {faqKeys.map((key) => (
              <Card key={key} className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(`products.personalLoan.faqs.${key}`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`products.personalLoan.faqs.a${key.slice(1)}`)}
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

export default PersonalLoan;