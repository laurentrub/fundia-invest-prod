import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

const articleKeys = [
  "choosingLoan",
  "debtRatio",
  "comparingOffers",
  "earlyRepayment",
  "buildingCredit"
];

const CreditGuide = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("resources.creditGuide.title")}</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            {t("resources.creditGuide.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">
            {articleKeys.map((articleKey) => {
              const content = t(`resources.creditGuide.articles.${articleKey}.content`);
              const paragraphs = content.split('\n\n');
              
              return (
                <Card key={articleKey} className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      {t(`resources.creditGuide.articles.${articleKey}.title`)}
                    </h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    {paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-foreground leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CreditGuide;
