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
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-foreground leading-relaxed mb-6">
              Privat Equity est une plateforme de prêt en ligne innovante qui révolutionne l'accès au crédit en France. 
              Fondée avec la mission de rendre le financement personnel plus transparent, accessible et équitable, nous 
              connectons des milliers d'emprunteurs avec les meilleures offres de crédit du marché.
            </p>
            <p className="text-lg text-foreground leading-relaxed mb-6">
              Notre plateforme utilise une technologie de pointe pour analyser votre profil financier et vous proposer 
              des offres personnalisées en quelques minutes. Nous travaillons avec un réseau de partenaires financiers 
              soigneusement sélectionnés pour garantir que vous obtenez toujours les meilleures conditions possibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Notre Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Démocratiser l'accès au crédit en offrant des solutions de financement transparentes, rapides et 
                adaptées aux besoins de chacun. Nous croyons que tout le monde mérite d'avoir accès à des options 
                de financement équitables, quel que soit son profil.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Nos Valeurs</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transparence, intégrité et respect du client sont au cœur de tout ce que nous faisons. Nous nous 
                engageons à fournir des informations claires, sans frais cachés, et à traiter chaque client avec 
                le respect qu'il mérite.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Sécurité & Conformité</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons les technologies de sécurité les plus avancées pour protéger vos données personnelles. 
                Notre plateforme est entièrement conforme au RGPD et nous sommes régulés par les autorités financières 
                françaises.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Excellence du Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                Notre équipe d'experts en crédit est disponible pour vous accompagner à chaque étape de votre 
                demande. Nous nous engageons à fournir un service client exceptionnel et des réponses rapides 
                à toutes vos questions.
              </p>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-subtle border-none">
            <h2 className="text-2xl font-bold text-foreground mb-4">Pourquoi choisir Privat Equity ?</h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>Processus 100% en ligne :</strong> Demande rapide et décision instantanée depuis chez vous</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>Comparaison intelligente :</strong> Nous analysons des dizaines d'offres pour trouver la meilleure pour vous</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>Sans engagement :</strong> Vérifiez votre éligibilité sans impact sur votre score de crédit</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>Transparence totale :</strong> Pas de frais cachés, toutes les conditions clairement affichées</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent font-bold mr-3">✓</span>
                <span><strong>Support dédié :</strong> Une équipe d'experts à votre écoute du lundi au samedi</span>
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
