import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const { t } = useTranslation();

  const faqCategories = [
    {
      categoryKey: "general",
      questions: ["q1", "q2", "q3"]
    },
    {
      categoryKey: "application",
      questions: ["q1", "q2", "q3", "q4", "q5"]
    },
    {
      categoryKey: "rates",
      questions: ["q1", "q2", "q3", "q4", "q5", "q6"]
    },
    {
      categoryKey: "repayment",
      questions: ["q1", "q2", "q3", "q4", "q5"]
    },
    {
      categoryKey: "credit",
      questions: ["q1", "q2", "q3", "q4"]
    },
    {
      categoryKey: "security",
      questions: ["q1", "q2", "q3"]
    },
    {
      categoryKey: "special",
      questions: ["q1", "q2", "q3", "q4"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("resources.faq.title")}</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            {t("resources.faq.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t(`resources.faq.categories.${category.categoryKey}`)}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((qKey, qIndex) => (
                  <AccordionItem 
                    key={qIndex} 
                    value={`${catIndex}-${qIndex}`} 
                    className="border border-border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-accent">
                      {t(`resources.faq.${category.categoryKey}.${qKey}`)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {t(`resources.faq.${category.categoryKey}.a${qKey.slice(1)}`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
