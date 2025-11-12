import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import Newsletter from "@/components/Newsletter";
import Testimonials from "@/components/Testimonials";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Clock, TrendingUp, Users, Award } from "lucide-react";
import heroImage from "@/assets/hero-finance.jpg";
import teamMeeting from "@/assets/team-meeting.jpg";
import happyClients from "@/assets/happy-clients.jpg";
import advisorWoman from "@/assets/advisor-woman.jpg";
import advisorMan from "@/assets/advisor-man.jpg";
import teamGroup from "@/assets/team-group.jpg";
import carLoanSuccess from "@/assets/car-loan-success.jpg";

const Index = () => {
  const features = [
    {
      icon: Clock,
      title: "Approbation rapide",
      description: "Obtenez votre accord préliminaire en moins de 5 minutes avec notre système de décision instantanée.",
    },
    {
      icon: Shield,
      title: "100% sécurisé",
      description: "Chiffrement bancaire et protection des données. Vos informations sont toujours en sécurité.",
    },
    {
      icon: TrendingUp,
      title: "Meilleurs taux",
      description: "Taux d'intérêt compétitifs à partir de 2,9% TAEG. Comparez et choisissez la meilleure option.",
    },
    {
      icon: Users,
      title: "Support expert",
      description: "Conseillers dédiés disponibles pour vous guider à chaque étape du processus.",
    },
  ];

  const loanProducts = [
    {
      title: "Prêt personnel",
      description: "De 1 000€ à 75 000€ pour tous vos projets personnels",
      rate: "À partir de 2,9% TAEG",
      href: "/personal-loan",
    },
    {
      title: "Crédit auto",
      description: "Financez la voiture de vos rêves avec des options de paiement flexibles",
      rate: "À partir de 3,2% TAEG",
      href: "/auto-loan",
    },
    {
      title: "Crédit travaux",
      description: "Transformez votre maison avec nos prêts rénovation",
      rate: "À partir de 3,5% TAEG",
      href: "/home-improvement",
    },
    {
      title: "Rachat de crédit",
      description: "Simplifiez vos finances en regroupant plusieurs dettes",
      rate: "À partir de 4,2% TAEG",
      href: "/consolidation",
    },
  ];

  const faqs = [
    {
      question: "En combien de temps puis-je obtenir l'approbation de mon prêt ?",
      answer: "Notre système de décision instantanée fournit une approbation préliminaire en moins de 5 minutes. L'approbation finale prend généralement 24 à 48 heures après vérification des documents.",
    },
    {
      question: "Quel est le score de crédit minimum requis ?",
      answer: "Nous acceptons les demandes de clients avec différents profils de crédit. Bien qu'un score supérieur à 650 améliore vos chances, nous évaluons chaque demande individuellement.",
    },
    {
      question: "Puis-je rembourser mon prêt par anticipation sans pénalités ?",
      answer: "Oui, tous nos prêts permettent le remboursement anticipé sans pénalités. Vous économiserez sur les intérêts en remboursant votre prêt plus tôt.",
    },
    {
      question: "Quels documents dois-je fournir pour postuler ?",
      answer: "Vous aurez besoin d'une pièce d'identité valide, d'une preuve de revenus (3 derniers bulletins de salaire), de relevés bancaires et d'un justificatif de domicile. Des documents supplémentaires peuvent être demandés selon votre situation.",
    },
    {
      question: "Comment est calculée ma mensualité ?",
      answer: "Votre mensualité dépend du montant du prêt, de la durée et de votre TAEG. Utilisez notre simulateur ci-dessus pour obtenir un calcul instantané adapté à vos besoins.",
    },
    {
      question: "La vérification des taux affecte-t-elle mon score de crédit ?",
      answer: "Non ! La vérification de votre taux utilise une enquête de crédit souple qui n'impacte pas votre score. Ce n'est que lorsque vous acceptez formellement une offre de prêt que nous effectuons une enquête approfondie.",
    },
    {
      question: "Qu'est-ce qui distingue Privat Equity des banques ?",
      answer: "Nous offrons des décisions plus rapides, un processus entièrement numérique, des taux compétitifs en comparant plusieurs prêteurs et un service personnalisé. De plus, vous pouvez tout faire en ligne sans visiter une agence.",
    },
    {
      question: "Puis-je postuler avec un co-emprunteur ou un garant ?",
      answer: "Oui ! Ajouter un co-emprunteur ou un garant avec un bon crédit peut améliorer vos chances d'approbation et potentiellement obtenir un taux d'intérêt plus bas.",
    },
    {
      question: "Proposez-vous des prêts aux travailleurs indépendants ?",
      answer: "Absolument ! Les professionnels indépendants, les freelances et les propriétaires d'entreprise peuvent postuler. Vous devrez fournir des déclarations fiscales et des relevés bancaires professionnels pour vérifier les revenus.",
    },
    {
      question: "Que se passe-t-il si j'ai des dettes existantes ?",
      answer: "Nous évaluons votre ratio d'endettement dans le cadre de la demande. Si vos dettes existantes sont gérables (généralement en dessous de 40% des revenus), vous pouvez toujours être éligible. Envisagez notre option de rachat de crédit pour simplifier les paiements.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Simulator */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Obtenez votre financement en ligne
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-primary-foreground/95">
                Crédits pour particuliers, entreprises et projets innovants. Des solutions rapides, transparentes et adaptées à vos besoins.
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90">
                Simulez votre prêt et recevez une réponse préliminaire en quelques minutes. Sans engagement, 100 % sécurisé.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link to="/apply">
                  <Button variant="accent" size="xl" className="w-full sm:w-auto">
                    Demander un crédit
                  </Button>
                </Link>
                <Link to="/apply">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Financer mon projet
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <CreditSimulator />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Clients satisfaits</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">€500M+</div>
              <div className="text-sm text-muted-foreground">Prêts accordés</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Taux de satisfaction</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">5 min</div>
              <div className="text-sm text-muted-foreground">Temps d'approbation moyen</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pourquoi choisir Privat Equity ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nous combinons technologie de pointe et service personnalisé pour rendre l'emprunt simple, rapide et transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nos produits de crédit
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quel que soit votre projet, nous avons une solution de financement adaptée à vos besoins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {loanProducts.map((product, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                <h3 className="text-2xl font-bold text-foreground mb-3">{product.title}</h3>
                <p className="text-muted-foreground mb-4">{product.description}</p>
                <div className="text-accent font-semibold mb-6">{product.rate}</div>
                <Link to={product.href}>
                  <Button variant="outline" className="w-full">
                    En savoir plus & Simuler
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={teamMeeting} 
                alt="Équipe de conseillers Privat Equity en réunion avec des clients"
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Comment ça marche ?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Un processus simple et rapide en 4 étapes pour obtenir votre financement
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Simulez votre crédit</h3>
                    <p className="text-muted-foreground">Utilisez notre calculateur pour estimer vos mensualités en quelques secondes</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Soumettez votre demande</h3>
                    <p className="text-muted-foreground">Remplissez notre formulaire en ligne sécurisé en moins de 5 minutes</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Recevez une réponse instantanée</h3>
                    <p className="text-muted-foreground">Notre système vous donne une réponse préliminaire immédiate</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Obtenez vos fonds</h3>
                    <p className="text-muted-foreground">Une fois approuvé, recevez votre argent sous 48h sur votre compte</p>
                  </div>
                </div>
              </div>
              <Link to="/apply" className="inline-block mt-8">
                <Button size="lg" variant="accent">
                  Commencer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Notre mission
            </h2>
            <p className="text-2xl md:text-3xl font-semibold text-foreground max-w-4xl mx-auto leading-relaxed">
              Rendre le financement simple, accessible et sécurisé pour tous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Accessibilité</h3>
              <p className="text-muted-foreground text-lg">
                Des solutions de financement ouvertes à tous, avec des processus simplifiés et transparents.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Confiance</h3>
              <p className="text-muted-foreground text-lg">
                Sécurité maximale de vos données et accompagnement personnalisé à chaque étape.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Innovation</h3>
              <p className="text-muted-foreground text-lg">
                Technologie de pointe pour des décisions rapides et des taux compétitifs.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ils ont réalisé leurs projets avec nous
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des milliers de clients nous font confiance pour financer leurs projets de vie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={carLoanSuccess} 
                alt="Couple heureux ayant obtenu leur crédit auto"
                className="w-full h-72 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-3">Crédit Auto</h3>
                <p className="text-muted-foreground mb-4">
                  "Nous avons obtenu notre crédit auto en 24h ! Le processus était simple et l'équipe très professionnelle. Nous recommandons vivement Privat Equity."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
                    ML
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Marie & Luc</p>
                    <p className="text-sm text-muted-foreground">Lyon - Crédit de 22 000€</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={happyClients} 
                alt="Clients satisfaits après obtention de leur crédit"
                className="w-full h-72 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-3">Prêt Personnel</h3>
                <p className="text-muted-foreground mb-4">
                  "Service exceptionnel du début à la fin. Les conseillers ont pris le temps de comprendre mes besoins et m'ont proposé la meilleure solution. Merci !"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
                    AK
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ahmed K.</p>
                    <p className="text-sm text-muted-foreground">Paris - Crédit de 15 000€</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* About Section - Rich Content for SEO */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            À propos de Privat Equity : Votre partenaire crédit de confiance
          </h2>
          
          <div className="prose prose-lg max-w-none space-y-6 text-foreground">
            <p className="text-lg leading-relaxed">
              <strong>Privat Equity</strong> est une plateforme de prêt en ligne leader qui a révolutionné la façon dont les particuliers et les entreprises accèdent au crédit en France. Fondée en 2015, nous avons aidé plus de 50 000 clients à atteindre leurs objectifs financiers grâce à des solutions de prêt transparentes, rapides et sécurisées.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Notre mission</h3>
            <p className="leading-relaxed">
              Nous croyons que l'accès au crédit devrait être simple, transparent et sans stress. Notre mission est de démocratiser le prêt en tirant parti de la technologie pour offrir des taux compétitifs, des décisions instantanées et une expérience numérique fluide. Nous nous engageons pour l'inclusion financière et aidons nos clients à prendre des décisions d'emprunt éclairées.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Pourquoi nous sommes différents</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <span><strong>Rapidité :</strong> Nos algorithmes avancés fournissent une approbation préliminaire en moins de 5 minutes, avec des fonds généralement déboursés dans les 48 heures suivant l'approbation finale.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <span><strong>Transparence :</strong> Pas de frais cachés, pas de surprises. Tous les coûts, taux et conditions sont clairement affichés avant que vous ne vous engagiez.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <span><strong>Sécurité :</strong> Nous utilisons un chiffrement de niveau bancaire et sommes entièrement conformes au RGPD et aux réglementations bancaires françaises.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <span><strong>Flexibilité :</strong> Options de remboursement anticipé sans pénalités, durées flexibles de 12 à 84 mois et montants de 1 000€ à 75 000€.</span>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mt-8 mb-4">Types de prêts que nous proposons</h3>
            <p className="leading-relaxed">
              Chez Privat Equity, nous comprenons que chaque besoin financier est unique. C'est pourquoi nous proposons une gamme complète de produits de prêt conçus pour correspondre à vos circonstances spécifiques :
            </p>

            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">Prêts personnels</h4>
              <p className="mb-2">Parfait pour les mariages, les vacances, les frais médicaux ou tout projet personnel. Empruntez de 1 000€ à 75 000€ avec des taux à partir de 2,9% TAEG.</p>
              <p className="text-sm text-muted-foreground">Exemple : 10 000€ sur 48 mois = 221€/mois (TAEG 4,9%, coût total : 10 608€)</p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">Crédits auto</h4>
              <p className="mb-2">Financez des véhicules neufs ou d'occasion avec des taux compétitifs et des conditions flexibles. Taux à partir de 3,2% TAEG.</p>
              <p className="text-sm text-muted-foreground">Exemple : 20 000€ sur 60 mois = 362€/mois (TAEG 3,9%, coût total : 21 720€)</p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">Crédits travaux</h4>
              <p className="mb-2">Transformez votre espace de vie avec des prêts conçus pour les rénovations, extensions ou améliorations énergétiques.</p>
              <p className="text-sm text-muted-foreground">Exemple : 15 000€ sur 72 mois = 238€/mois (TAEG 4,5%, coût total : 17 136€)</p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">Rachat de crédit</h4>
              <p className="mb-2">Simplifiez plusieurs dettes en un seul paiement mensuel facile, souvent à un taux global inférieur.</p>
              <p className="text-sm text-muted-foreground">Exemple : Regrouper 25 000€ de dettes sur 84 mois = 351€/mois (TAEG 5,2%)</p>
            </div>

            <h3 className="text-2xl font-bold mt-8 mb-4">Comment fonctionne notre processus</h3>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="leading-relaxed"><strong>Simulez votre prêt :</strong> Utilisez notre calculatrice interactive pour voir les paiements mensuels estimés et les coûts totaux.</li>
              <li className="leading-relaxed"><strong>Soumettez votre demande :</strong> Complétez notre simple formulaire en ligne en quelques minutes.</li>
              <li className="leading-relaxed"><strong>Obtenez une décision instantanée :</strong> Notre système analyse votre demande et fournit une approbation préliminaire immédiatement.</li>
              <li className="leading-relaxed"><strong>Téléchargez les documents :</strong> Soumettez les documents requis en toute sécurité via notre plateforme.</li>
              <li className="leading-relaxed"><strong>Recevez vos fonds :</strong> Une fois approuvé, les fonds sont transférés directement sur votre compte bancaire dans les 48 heures.</li>
            </ol>

            <h3 className="text-2xl font-bold mt-8 mb-4">Notre engagement envers un prêt responsable</h3>
            <p className="leading-relaxed">
              Nous prenons le prêt responsable au sérieux. Avant d'approuver un prêt, nous évaluons soigneusement votre capacité de remboursement en fonction de vos revenus, dépenses et dettes existantes. Nous n'approuverons jamais un prêt qui pourrait vous mettre en difficulté financière. Nos conseillers sont toujours disponibles pour discuter d'alternatives si un prêt n'est pas la bonne solution pour votre situation.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Questions fréquemment posées
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/resources/faq">
              <Button variant="outline" size="lg">
                Voir la FAQ complète
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 border-y border-border">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-wider">
            Approuvé par les principales institutions financières
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            <Award className="h-12 w-12" />
            <Shield className="h-12 w-12" />
            <TrendingUp className="h-12 w-12" />
            <Users className="h-12 w-12" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Rejoignez des milliers de clients satisfaits qui ont choisi Privat Equity pour leurs besoins de financement.
          </p>
          <Link to="/apply">
            <Button variant="accent" size="xl">
              Demander maintenant - Approbation instantanée
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Index;
