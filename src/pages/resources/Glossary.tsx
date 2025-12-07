import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

const glossaryTermKeys = [
  "apr", "amortization", "collateral", "creditScore", "consolidation",
  "dti", "default", "deferment", "fixedRate", "gracePeriod",
  "guarantor", "hardInquiry", "interestRate", "loanTerm", "originationFee",
  "preApproval", "principal", "refinancing", "securedLoan", "softInquiry",
  "unsecuredLoan", "variableRate", "borrowingCapacity", "coBorrower",
  "borrowerInsurance", "prepaymentPenalty", "revolvingCredit",
  "amortizationSchedule", "nominalRate", "interestOnly", "debtRestructuring",
  "affectedCredit", "unaffectedCredit"
];

const Glossary = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const glossaryTerms = useMemo(() => {
    return glossaryTermKeys.map(key => ({
      key,
      term: t(`resources.glossary.terms.${key}.term`),
      definition: t(`resources.glossary.terms.${key}.definition`)
    }));
  }, [t]);

  const filteredTerms = glossaryTerms.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("resources.glossary.title")}</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            {t("resources.glossary.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Input
              type="text"
              placeholder={t("resources.glossary.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-4">
            {filteredTerms.map((item) => (
              <Card key={item.key} className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{item.term}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.definition}</p>
              </Card>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("resources.glossary.noResults")}</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Glossary;
