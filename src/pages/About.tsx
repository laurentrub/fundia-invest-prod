import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Users, Target, Shield, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('about.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* À FOURNIR: vérifier la date de fondation et tout chiffre client cité dans about.intro1/intro2 (src/i18n/locales/*.json) avant publication */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-foreground leading-relaxed mb-6">
              {t('about.intro1')}
            </p>
            <p className="text-lg text-foreground leading-relaxed mb-6">
              {t('about.intro2')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('about.mission.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.mission.description')}
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('about.values.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.values.description')}
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('about.security.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.security.description')}
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('about.expertise.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.expertise.description')}
              </p>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-subtle border-none">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('about.whyChoose.title')}</h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>{t('about.whyChoose.online.title')}</strong> {t('about.whyChoose.online.description')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>{t('about.whyChoose.comparison.title')}</strong> {t('about.whyChoose.comparison.description')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>{t('about.whyChoose.noCommitment.title')}</strong> {t('about.whyChoose.noCommitment.description')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>{t('about.whyChoose.transparency.title')}</strong> {t('about.whyChoose.transparency.description')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>{t('about.whyChoose.support.title')}</strong> {t('about.whyChoose.support.description')}</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
